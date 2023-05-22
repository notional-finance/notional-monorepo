import { AggregateCall, aggregate } from '@notional-finance/sdk/data/Multicall';
import { FlashLiquidatorABI, NotionalV3ABI } from '@notional-finance/contracts';
import { ethers, BigNumber, Contract } from 'ethers';
import {
  RiskyAccount,
  CurrencyOverride,
  IGasOracle,
  FlashLiquidation,
  IFlashLoanProvider,
} from './types';
import { Currency } from '@notional-finance/sdk';
import LiquidationHelper from './LiquidationHelper';
import ProfitCalculator from './ProfitCalculator';
import AaveFlashLoanProvider from './lenders/AaveFlashLender';

export type LiquidatorSettings = {
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
      settings.tokens['WETH'],
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
        overrides: settings.overrides,
        liquidatorOwner: settings.flashLiquidatorOwner,
        exactInSlippageLimit: settings.exactInSlippageLimit,
        exactOutSlippageLimit: settings.exactOutSlippageLimit,
        gasCostBuffer: settings.gasCostBuffer,
        profitThreshold: settings.profitThreshold,
      }
    );
  }

  private toExternal(input: BigNumber, externalPrecision: BigNumber) {
    return input
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
          ).gt(this.settings.dustThreshold)
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

    const { results } = await aggregate(calls, this.provider);

    return await this.profitCalculator.sortByProfitability(
      liquidations
        .map((liq, i) => ({
          accountId: ra.id,
          liquidation: liq,
          flashLoanAmount: this.toExternal(
            results[`${ra.id}:${liq.getLiquidationType()}:loanAmount`],
            liq.getLocalCurrency().underlyingDecimals
          )
            .mul(this.settings.flashLoanBuffer)
            .div(1000),
        }))
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
    console.log(`payload=${payload}`);
    fetch(this.settings.txRelayUrl + '/v1/calls/0', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: payload,
    });
  }
}
