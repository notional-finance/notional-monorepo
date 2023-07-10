import { ethers, BigNumber, Contract } from 'ethers';
import { RiskyAccount } from './types';
import { AggregateCall, aggregate } from '@notional-finance/sdk/data/Multicall';
import {
  VaultLiquidatorABI,
  NotionalV3ABI,
  VaultLiquidator__factory,
} from '@notional-finance/contracts';

export type LiquidatorSettings = {
  network: string;
  vaultAddrs: string[];
  flashLiquidatorAddress: string;
  flashLiquidatorOwner: string;
  flashLenderAddress: string;
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
};

export default class VaultV3Liquidator {
  private liquidatorContract: Contract;
  private notionalContract: Contract;

  constructor(
    public provider: ethers.providers.Provider,
    public settings: LiquidatorSettings
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

  private getAccountHealthCalls(addrs: string[]): AggregateCall[] {
    const calls = [];
    this.settings.vaultAddrs.forEach((vault) => {
      calls.push({
        stage: 0,
        target: this.notionalContract,
        method: 'getVaultConfig',
        args: [vault],
        key: `${vault}:vaultConfig`,
        transform: (r) => ({
          borrowCurrencyId: r[2],
          minCollateralRatio: r[5],
        }),
      });

      addrs.forEach((addr) => {
        calls.push({
          stage: 0,
          target: this.notionalContract,
          method: 'getVaultAccountHealthFactors',
          args: [addr, vault],
          key: `${addr}:${vault}:health`,
          transform: (r) => ({
            collateralRatio: r[0][0],
            maxLiquidatorDepositUnderlying: r[1],
            vaultSharesToLiquidator: r[2],
          }),
        });
      });
    });

    return calls;
  }

  public async getRiskyAccounts(addrs: string[]): Promise<RiskyAccount[]> {
    const { results } = await aggregate(
      this.getAccountHealthCalls(addrs),
      this.provider
    );

    const riskyAccounts = [];

    this.settings.vaultAddrs.forEach((vault) => {
      const vaultConfig = results[`${vault}:vaultConfig`];

      addrs.forEach((addr) => {
        const accountHealth = results[`${addr}:${vault}:health`];

        if (
          accountHealth.collateralRatio
            .sub(vaultConfig.minCollateralRatio)
            .lt(this.settings.dustThreshold)
        ) {
          riskyAccounts.push({
            id: addr,
            vault: vault,
            collateralRatio: accountHealth.collateralRatio,
            maxLiquidatorDepositUnderlying:
              accountHealth.maxLiquidatorDepositUnderlying,
            vaultSharesToLiquidator: accountHealth.vaultSharesToLiquidator,
            borrowCurrencyId: vaultConfig.borrowCurrencyId,
            minCollateralRatio: vaultConfig.minCollateralRatio,
          });
        }
      });
    });

    return riskyAccounts;
  }

  private getLiquidationInfoCalls(
    ra: RiskyAccount,
    currencyIndex: number
  ): AggregateCall[] {
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

    const assetAddress = results['assetAddress'];
    const flashLoanAmount = results['depositAmount']
      .mul(this.settings.flashLoanBuffer)
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
              [[0, 0, []]]
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
    // TODO: use gas oracle for other chains
    const gasCost = gasAmount.mul(1e9);

    console.log(
      `profit=${BigNumber.from(zeroExResp.buyAmount).sub(gasCost).toString()}`
    );

    const netProfit = BigNumber.from(zeroExResp.buyAmount).sub(gasCost);
    if (netProfit.lt(this.settings.profitThreshold)) {
      return null;
    }

    return {
      accouont: ra,
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

    const resp = await fetch(this.settings.txRelayUrl + '/v1/calls/0', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Auth-Token': this.settings.txRelayAuthToken,
      },
      body: payload,
    });

    console.log(resp);
  }
}
