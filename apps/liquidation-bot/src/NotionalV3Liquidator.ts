import { AggregateCall, aggregate } from '@notional-finance/sdk/data/Multicall';
import { FlashLiquidatorABI, NotionalV3ABI } from '@notional-finance/contracts';
import { ethers, BigNumber, Contract } from 'ethers';
import {
  RiskyAccount,
  CurrencyOverride,
  IGasOracle,
  FlashLiquidation,
  IFlashLoanProvider,
  Currency,
} from './types';
import LiquidationHelper from './LiquidationHelper';
import ProfitCalculator from './ProfitCalculator';
import AaveFlashLoanProvider from './lenders/AaveFlashLender';
import {
  DDEventAlertType,
  DDEventKey,
  submitEvent,
} from '@notional-finance/logging';

export type LiquidatorSettings = {
  network: string;
  flashLiquidatorAddress: string;
  flashLiquidatorOwner: string;
  flashLenderAddress: string;
  notionalAddress: string;
  dustThreshold: BigNumber;
  flashLoanBuffer: BigNumber;
  txRelayUrl: string;
  txRelayAuthToken: string;
  currencies: Currency[];
  tokens: Map<string, string>;
  zeroExUrl: string;
  zeroExApiKey: string;
  overrides: CurrencyOverride[];
  exactInSlippageLimit: BigNumber; // Precision = 1000
  exactOutSlippageLimit: BigNumber; // Precision = 1000
  gasCostBuffer: BigNumber; // Precision = 1000
  profitThreshold: BigNumber;
};

class ArbitrumGasOracle implements IGasOracle {
  public async getGasPrice(): Promise<BigNumber> {
    // 0.1 gwei
    return ethers.utils.parseUnits('1', 8);
  }
}

export default class NotionalV3Liquidator {
  public static readonly INTERNAL_PRECISION = ethers.utils.parseUnits('1', 8);
  public static readonly ETH_PRECISION = ethers.utils.parseEther('1');

  private liquidationHelper: LiquidationHelper;
  private profitCalculator: ProfitCalculator;
  private liquidatorContract: Contract;
  private notionalContract: Contract;
  private flashLoanProvider: IFlashLoanProvider;

  constructor(
    public provider: ethers.providers.Provider,
    public settings: LiquidatorSettings
  ) {
    this.liquidatorContract = new ethers.Contract(
      this.settings.flashLiquidatorAddress,
      FlashLiquidatorABI,
      this.provider
    );
    this.notionalContract = new ethers.Contract(
      this.settings.notionalAddress,
      NotionalV3ABI,
      this.provider
    );
    this.liquidationHelper = new LiquidationHelper(
      settings.tokens.get('WETH'),
      settings.currencies
    );
    this.flashLoanProvider = new AaveFlashLoanProvider(
      settings.flashLenderAddress,
      settings.flashLiquidatorAddress,
      this.provider
    );
    this.profitCalculator = new ProfitCalculator(
      new ArbitrumGasOracle(),
      this.flashLoanProvider,
      {
        liquidatorContract: this.liquidatorContract,
        zeroExUrl: settings.zeroExUrl,
        zeroExApiKey: settings.zeroExApiKey,
        overrides: settings.overrides,
        liquidatorOwner: settings.flashLiquidatorOwner,
        exactInSlippageLimit: settings.exactInSlippageLimit,
        exactOutSlippageLimit: settings.exactOutSlippageLimit,
        gasCostBuffer: settings.gasCostBuffer,
        profitThreshold: settings.profitThreshold,
      }
    );
  }

  private toExternal(input: any, externalPrecision: BigNumber) {
    if (!input.success) {
      return BigNumber.from(0);
    }
    return input.value
      .mul(externalPrecision)
      .div(NotionalV3Liquidator.INTERNAL_PRECISION);
  }

  private getAccountDataCalls(addrs: string[]): AggregateCall[] {
    const calls = [];
    addrs.forEach((addr) => {
      calls.push({
        stage: 0,
        target: this.liquidatorContract,
        method: 'getFreeCollateral',
        args: [addr],
        key: `${addr}:collateral`,
      });

      calls.push({
        stage: 0,
        target: this.notionalContract,
        method: 'getAccount',
        args: [addr],
        key: `${addr}:account`,
      });
    });

    return calls;
  }

  public async getRiskyAccounts(addrs: string[]): Promise<RiskyAccount[]> {
    const { results } = await aggregate(
      this.getAccountDataCalls(addrs),
      this.provider
    );

    const accounts = addrs
      .map((addr) => {
        return {
          id: addr,
          ethFreeCollateral: results[`${addr}:collateral`][0],
        };
      })
      .filter(
        (a) =>
          a.ethFreeCollateral.isNegative() &&
          this.toExternal(
            a.ethFreeCollateral.abs(),
            NotionalV3Liquidator.ETH_PRECISION
          ).gte(this.settings.dustThreshold)
      );

    return accounts.map((a, i) => {
      const netUnderlyingAvailable = new Map<number, BigNumber>();
      const balances = results[`${a.id}:account`][1].filter((b) => b[0] !== 0);
      const portfolio = results[`${a.id}:account`][2];

      balances.forEach((b, i) => {
        const currencyId = b[0] as number;
        netUnderlyingAvailable.set(
          currencyId,
          results[`${a.id}:collateral`][1][i]
        );
      });

      return {
        id: a.id,
        ethFreeCollateral: a.ethFreeCollateral,
        data: {
          balances: balances.map((b) => ({
            currencyId: b[0] as number,
            cashBalance: b[1] as BigNumber,
            nTokenBalance: b[2] as BigNumber,
          })),
          portfolio: portfolio.map((v) => ({
            currencyId: v[0] as number,
            maturity: v[1].toNumber(),
            notional: v[3],
          })),
        },
        netUnderlyingAvailable: netUnderlyingAvailable,
      };
    });
  }

  public async getPossibleLiquidations(
    ra: RiskyAccount
  ): Promise<FlashLiquidation[]> {
    const liquidations = this.liquidationHelper.getPossibleLiquidations(ra);

    const calls = liquidations.map((liq) =>
      liq.getFlashLoanAmountCall(this.notionalContract, ra.id)
    );

    const { results } = await aggregate(calls, this.provider, false);

    return await this.profitCalculator.sortByProfitability(
      liquidations
        .map((liq, i) => {
          const flashLoanAmount = this.toExternal(
            results[
              `${ra.id}:${liq.getLiquidationType()}:${
                liq.getLocalCurrency().id
              }:${liq.getCollateralCurrencyId()}:loanAmount`
            ],
            liq.getLocalCurrency().underlyingDecimals
          );

          return {
            accountId: ra.id,
            liquidation: liq,
            flashLoanAmount: flashLoanAmount
              .mul(this.settings.flashLoanBuffer)
              .div(1000),
          };
        })
        .filter((liq) => !liq.flashLoanAmount.isZero())
    );
  }

  public async liquidateAccount(flashLiq: FlashLiquidation) {
    const encodedTransaction = await this.flashLoanProvider.encodeTransaction(
      flashLiq
    );
    const payload = JSON.stringify({
      to: this.settings.flashLenderAddress,
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

    console.log(resp.status);

    await submitEvent({
      aggregation_key: DDEventKey.AccountLiquidated,
      alert_type: DDEventAlertType.info,
      title: `Account liquidated`,
      tags: [
        `account:${flashLiq.accountLiq.accountId}`,
        `network:${this.settings.network}`,
        `event:account_liquidated`,
      ],
      text: `Liquidated account ${flashLiq.accountLiq.accountId}`,
    });
  }
}
