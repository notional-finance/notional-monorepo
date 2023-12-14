import { ethers, BigNumber, Contract } from 'ethers';
import { RiskyAccount, IGasOracle } from './types';
import { AggregateCall, aggregate } from '@notional-finance/multicall';
import {
  IStrategyVaultABI,
  VaultLiquidatorABI,
  NotionalV3ABI,
  VaultLiquidator__factory,
  NotionalV3,
} from '@notional-finance/contracts';
import { Logger } from '@notional-finance/durable-objects';
import { Network } from '@notional-finance/util';

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
      // transform: (
      //   r: Awaited<ReturnType<NotionalV3['getVaultAccountHealthFactors']>>
      // ) => ({
      //   borrowCurrencyId: r[2],
      //   minCollateralRatio: r[5],
      // }),
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
      IStrategyVaultABI,
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

    const assetAddress = results['assetAddress'] as string;
    const flashLoanAmount = (results['depositAmount'] as BigNumber)
      .mul(this.settings.flashLoanBuffer)
      .div(1000);
    const minPrimary = (results['primaryAmount'] as BigNumber)
      .mul(this.settings.slippageLimit)
      .div(1000);

    const callParams = {
      liquidationType: 1,
      currencyId: ra.borrowCurrencyId,
      currencyIndex: liqParams.currencyIndex,
      account: ra.id,
      vault: ra.vault,
      actionData: ethers.utils.defaultAbiCoder.encode(
        ['tuple(bool,bytes)'],
        [
          [
            false,
            ethers.utils.defaultAbiCoder.encode(
              ['tuple(uint256,uint256,bytes)'],
              [[minPrimary, 0, []]]
            ),
          ],
        ]
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

    console.log(
      `profit=${BigNumber.from(zeroExResp.buyAmount).sub(gasCost).toString()}`
    );

    const netProfit = BigNumber.from(zeroExResp.buyAmount).sub(gasCost);
    if (netProfit.lt(this.settings.profitThreshold)) {
      return null;
    }

    return {
      account: ra,
      currencyIndex: liqParams.currencyIndex,
      maxUnderlying: liqParams.maxUnderying,
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

    const payload = JSON.stringify({
      to: this.settings.flashLiquidatorAddress,
      data: encodedTransaction,
    });

    await fetch(this.settings.txRelayUrl + '/v1/txes/0', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Auth-Token': this.settings.txRelayAuthToken,
      },
      body: payload,
    });

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
      text: `Liquidated account ${accountLiq.account.id}`,
    });
  }
}
