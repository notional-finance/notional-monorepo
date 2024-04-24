import { ethers, BigNumber, Contract } from 'ethers';
import { RiskyAccount, IGasOracle } from './types';
import { AggregateCall, aggregate } from '@notional-finance/multicall';
import {
  VaultLiquidatorABI,
  NotionalV3ABI,
  VaultLiquidator__factory,
  NotionalV3,
  ISingleSidedLPStrategyVaultABI,
} from '@notional-finance/contracts';
import { Logger } from '@notional-finance/durable-objects';
import { Network, sendTxThroughRelayer } from '@notional-finance/util';
import { overrides } from '.';

export type LiquidatorSettings = {
  network: Network;
  vaultAddrs: string[];
  flashLiquidatorAddress: string;
  flashLiquidatorOwner: string;
  flashLenderAddress: string;
  slippageLimit: BigNumber;
  notionalAddress: string;
  dustThreshold: BigNumber;
  flashLoanBuffer: BigNumber;
  txRelayUrl: string;
  txRelayAuthToken: string;
  tokens: Map<string, string>;
  gasCostBuffer: BigNumber; // Precision = 1000
  profitThreshold: BigNumber;
  zeroExUrl: string;
  zeroExApiKey: string;
  gasOracle: IGasOracle;
};

enum LiquidationType {
  UNKNOWN = 0,
  DELEVERAGE_VAULT_ACCOUNT = 1,
  LIQUIDATE_CASH_BALANCE = 2,
  DELEVERAGE_VAULT_ACCOUNT_AND_LIQUIDATE_CASH = 3,
}
export default class VaultV3Liquidator {
  private liquidatorContract: Contract;
  private notionalContract: Contract;

  constructor(
    public provider: ethers.providers.Provider,
    public settings: LiquidatorSettings,
    private logger: Logger
  ) {
    this.liquidatorContract = new ethers.Contract(
      this.settings.flashLiquidatorAddress,
      VaultLiquidatorABI,
      this.provider
    );

    this.notionalContract = new ethers.Contract(
      this.settings.notionalAddress,
      NotionalV3ABI,
      this.provider
    );
  }

  private getVaultConfigs(): AggregateCall[] {
    return this.settings.vaultAddrs.flatMap((vault) => ({
      stage: 0,
      target: this.notionalContract,
      method: 'getVaultConfig',
      args: [vault],
      key: `${vault.toLowerCase()}:vaultConfig`,
    }));
  }

  private getAccountHealthCalls(
    accounts: { account_id: string; vault_id: string }[]
  ): AggregateCall[] {
    return accounts.flatMap(({ account_id, vault_id }) => {
      return [
        {
          stage: 0,
          target: this.notionalContract,
          method: 'getVaultAccountHealthFactors',
          args: [account_id, vault_id],
          key: `${account_id.toLowerCase()}:${vault_id.toLowerCase()}:health`,
          transform: (
            r: Awaited<ReturnType<NotionalV3['getVaultAccountHealthFactors']>>
          ) => ({
            collateralRatio: r[0].collateralRatio,
            maxLiquidatorDepositUnderlying: r.maxLiquidatorDepositUnderlying,
            vaultSharesToLiquidator: r.vaultSharesToLiquidator,
          }),
        },
        {
          stage: 0,
          target: this.notionalContract,
          method: 'getVaultAccount',
          args: [account_id, vault_id],
          key: `${account_id}:${vault_id}:maturity`,
          transform: (r: Awaited<ReturnType<NotionalV3['getVaultAccount']>>) =>
            r.maturity,
        },
      ];
    });
  }

  public async getRiskyAccounts(
    accounts: { account_id: string; vault_id: string }[]
  ): Promise<RiskyAccount[]> {
    const { results } = await aggregate(
      this.getAccountHealthCalls(accounts),
      this.provider
    );
    const { results: vaultConfigs } = await aggregate(
      this.getVaultConfigs(),
      this.provider
    );

    const riskyAccounts = [];

    accounts.forEach(({ account_id, vault_id }) => {
      const { borrowCurrencyId, minCollateralRatio } = vaultConfigs[
        `${vault_id.toLowerCase()}:vaultConfig`
      ] as Awaited<ReturnType<NotionalV3['getVaultConfig']>>;
      const accountHealth = results[
        `${account_id}:${vault_id}:health`.toLowerCase()
      ] as any;
      const maturity = results[
        `${account_id}:${vault_id}:maturity`.toLowerCase()
      ] as BigNumber;

      if (
        accountHealth.collateralRatio
          .sub(minCollateralRatio)
          .lt(this.settings.dustThreshold)
      ) {
        riskyAccounts.push({
          id: account_id,
          maturity: maturity,
          vault: vault_id,
          collateralRatio: accountHealth.collateralRatio,
          maxLiquidatorDepositUnderlying:
            accountHealth.maxLiquidatorDepositUnderlying,
          vaultSharesToLiquidator: accountHealth.vaultSharesToLiquidator,
          borrowCurrencyId,
          minCollateralRatio,
        });
      }
    });

    return riskyAccounts;
  }

  private getLiquidationInfoCalls(
    ra: RiskyAccount,
    currencyIndex: number
  ): AggregateCall[] {
    const vaultContract = new ethers.Contract(
      ra.vault,
      ISingleSidedLPStrategyVaultABI,
      this.provider
    );

    return [
      {
        stage: 0,
        target: this.notionalContract,
        method: 'getCurrency',
        args: [ra.borrowCurrencyId],
        key: 'assetAddress',
        transform: (r) => r[1][0],
      },
      {
        stage: 0,
        target: this.notionalContract,
        method: 'convertCashBalanceToExternal',
        args: [
          ra.borrowCurrencyId,
          ra.maxLiquidatorDepositUnderlying[currencyIndex],
          true,
        ],
        key: 'depositAmount',
      },
      {
        stage: 0,
        target: vaultContract,
        method: 'convertStrategyToUnderlying',
        args: [ra.id, ra.vaultSharesToLiquidator[currencyIndex], ra.maturity],
        key: 'primaryAmount',
      },
      {
        stage: 0,
        target: vaultContract,
        method: 'getStrategyVaultInfo',
        args: [],
        key: 'strategyVaultInfo',
      },
      {
        stage: 0,
        target: vaultContract,
        method: 'TOKENS',
        args: [],
        key: 'TOKENS',
      },
    ];
  }

  private async getZeroExData(
    zeroExUrl: string,
    from: string,
    to: string,
    amount: BigNumber,
    exactIn: boolean
  ): Promise<any> {
    if (!from || !to) {
      throw Error('Invalid from/to');
    }

    const queryParams = new URLSearchParams({
      sellToken: from,
      buyToken: to,
    });

    if (exactIn) {
      queryParams.set('sellAmount', amount.toString());
    } else {
      queryParams.set('buyAmount', amount.toString());
    }

    const fetchUrl = zeroExUrl + '?' + queryParams;
    const resp = await fetch(fetchUrl, {
      headers: {
        '0x-api-key': this.settings.zeroExApiKey,
      },
    });
    if (resp.status !== 200) {
      throw Error('Bad 0x response');
    }

    const data = await resp.json();

    return data;
  }

  public async getAccountLiquidation(ra: RiskyAccount) {
    const liquidator = VaultLiquidator__factory.connect(
      this.liquidatorContract.address,
      this.liquidatorContract.provider
    );

    const liqParams = await liquidator.callStatic.getOptimalDeleveragingParams(
      ra.id,
      ra.vault
    );

    const { results } = await aggregate(
      this.getLiquidationInfoCalls(ra, liqParams.currencyIndex),
      this.provider
    );

    let assetAddress = results['assetAddress'] as string;
    assetAddress =
      overrides[this.settings.network][assetAddress] || assetAddress;
    const flashLoanAmount = (results['depositAmount'] as BigNumber)
      .mul(this.settings.flashLoanBuffer)
      .div(1000);
    const minPrimary = (results['primaryAmount'] as BigNumber)
      .mul(this.settings.slippageLimit)
      .div(1000);
    const minAmount = new Array(results['TOKENS'][0].length).fill(
      BigNumber.from(0)
    );
    minAmount[results['strategyVaultInfo']['singleSidedTokenIndex'] as number] =
      minPrimary;

    const callParams = {
      // Use this as the default type, will account for variable rate debt
      liquidationType: LiquidationType.DELEVERAGE_VAULT_ACCOUNT,
      currencyId: ra.borrowCurrencyId,
      currencyIndex: liqParams.currencyIndex,
      account: ra.id,
      vault: ra.vault,
      useVaultDeleverage: true,
      actionData: ethers.utils.defaultAbiCoder.encode(
        ['tuple(uint256[],bytes)'],
        [[minAmount, []]]
      ),
    };

    const profit = await liquidator.callStatic.estimateProfit(
      assetAddress,
      flashLoanAmount,
      callParams,
      {
        from: this.settings.flashLiquidatorOwner,
      }
    );

    const zeroExResp = await this.getZeroExData(
      this.settings.zeroExUrl,
      assetAddress,
      'ETH',
      profit,
      true
    );

    const gasAmount = await liquidator.estimateGas.flashLiquidate(
      assetAddress,
      flashLoanAmount,
      callParams
    );
    const gasCost = gasAmount.mul(await this.settings.gasOracle.getGasPrice());

    const netProfit = BigNumber.from(zeroExResp.buyAmount).sub(gasCost);
    if (netProfit.gt(this.settings.profitThreshold)) {
      throw Error(
        `Unprofitable liquidation of ${ra.id} in ${
          ra.vault
        }: ${netProfit.toString()}`
      );
    }

    return {
      account: ra,
      currencyIndex: liqParams.currencyIndex,
      maxUnderlying: liqParams.maxUnderlying,
      assetAddress: assetAddress,
      flashLoanAmount: flashLoanAmount,
      callParams: callParams,
    };
  }

  public async liquidateAccount(accountLiq: any) {
    const liquidator = VaultLiquidator__factory.connect(
      this.liquidatorContract.address,
      this.liquidatorContract.provider
    );

    const encodedTransaction = liquidator.interface.encodeFunctionData(
      'flashLiquidate',
      [
        accountLiq.assetAddress,
        accountLiq.flashLoanAmount,
        accountLiq.callParams,
      ]
    );

    console.log(`
Sending liquidation to relayer:
network: ${this.settings.network}
to: ${this.settings.flashLiquidatorAddress}
data: ${encodedTransaction}
`);
    const resp = await sendTxThroughRelayer({
      env: {
        NETWORK: this.settings.network,
        TX_RELAY_AUTH_TOKEN: this.settings.txRelayAuthToken,
      },
      to: this.settings.flashLiquidatorAddress,
      data: encodedTransaction,
      isLiquidator: true,
    });

    if (resp.status === 200) {
      const respInfo = await resp.json();
      await this.logger.submitEvent({
        aggregation_key: 'AccountLiquidated',
        alert_type: 'info',
        host: 'cloudflare',
        network: this.settings.network,
        title: `Account liquidated`,
        tags: [
          `account:${accountLiq.account.id}`,
          `event:vault_account_liquidated`,
        ],
        text: `Liquidated account ${accountLiq.account.id}, ${respInfo['hash']}`,
      });
    } else {
      console.log(
        'Failed liquidation',
        resp.status,
        resp.statusText,
        await resp.json()
      );
    }
  }
}
