import {
  BASIS_POINT,
  RATE_PRECISION,
  SECONDS_IN_YEAR,
} from '@notional-finance/util';
import { TokenDefinition } from '../../Definitions';
import { TokenBalance } from '../../token-balance';
import BaseLiquidityPool from '../base-liquidity-pool';
import { getNetworkModel } from '../../Models';

export interface InterestRateParameters {
  kinkUtilization1: number;
  kinkUtilization2: number;
  kinkRate1: number;
  kinkRate2: number;
  maxRate: number;
  minFeeRate: number;
  maxFeeRate: number;
  feeRatePercent: number;
}

export abstract class BaseNotionalMarket<
  T extends { currencyId: number }
> extends BaseLiquidityPool<T> {
  protected abstract getIRParams(_marketIndex: number): InterestRateParameters;
  protected abstract getfCashSpotRate(token: TokenDefinition): number;

  public getPrimeCashUtilization(
    netPrimeSupply?: TokenBalance,
    netPrimeDebt?: TokenBalance
  ) {
    const pCash = getNetworkModel(this._network).getPrimeCash(
      this.poolParams.currencyId
    );
    const pDebt = getNetworkModel(this._network).getPrimeDebt(
      this.poolParams.currencyId
    );
    const supply = pCash.totalSupply?.add(
      netPrimeSupply || TokenBalance.zero(pCash)
    );
    const debt = pDebt.totalSupply?.add(
      netPrimeDebt || TokenBalance.zero(pDebt)
    );
    if (!supply || !debt) throw Error('Missing prime total supply');

    return debt.toUnderlying().ratioWith(supply.toUnderlying()).toNumber();
  }

  protected getInterestRate(marketIndex: number, utilization: number) {
    if (utilization < 0 || RATE_PRECISION < utilization)
      throw Error('Insufficient Liquidity');
    const irParams = this.getIRParams(marketIndex);
    if (utilization <= irParams.kinkUtilization1) {
      return Math.floor(
        (utilization * irParams.kinkRate1) / irParams.kinkUtilization1
      );
    } else if (utilization <= irParams.kinkUtilization2) {
      return Math.floor(
        ((utilization - irParams.kinkUtilization1) *
          (irParams.kinkRate2 - irParams.kinkRate1)) /
          (irParams.kinkUtilization2 - irParams.kinkUtilization1) +
          irParams.kinkRate1
      );
    } else {
      return Math.floor(
        ((utilization - irParams.kinkUtilization2) *
          (irParams.maxRate - irParams.kinkRate2)) /
          (RATE_PRECISION - irParams.kinkUtilization2) +
          irParams.kinkRate2
      );
    }
  }

  protected getPostFeeInterestRate(
    marketIndex: number,
    preFeeInterestRate: number,
    isBorrow: boolean
  ) {
    const irParams = this.getIRParams(marketIndex);

    let feeRate = Math.floor(
      (preFeeInterestRate * irParams.feeRatePercent) / 100
    );
    if (feeRate < irParams.minFeeRate) feeRate = irParams.minFeeRate;
    if (feeRate > irParams.maxFeeRate) feeRate = irParams.maxFeeRate;

    if (isBorrow) {
      return preFeeInterestRate + feeRate;
    } else {
      return Math.max(preFeeInterestRate - feeRate, 0);
    }
  }

  public getPrimeSupplyRate(utilization: number) {
    // Prime supply is the pre fee debt interest rate * utilization
    return (
      (this.getInterestRate(0, utilization) * utilization) / RATE_PRECISION
    );
  }

  public getPrimeDebtRate(utilization: number) {
    return this.getPostFeeInterestRate(
      0,
      this.getInterestRate(0, utilization),
      true
    );
  }

  public getSpotInterestRate(token: TokenDefinition) {
    if (token.tokenType === 'PrimeCash') {
      // Handles a rare edge case when the utilization is maxed out and
      // the site thinks we are above 100% utilization by a small amount
      // because the total supply figure has not updated
      let utilization = this.getPrimeCashUtilization();
      if (
        RATE_PRECISION < utilization &&
        utilization < RATE_PRECISION + 5 * BASIS_POINT
      ) {
        utilization = RATE_PRECISION;
      }
      return (this.getPrimeSupplyRate(utilization) * 100) / RATE_PRECISION;
    } else if (token.tokenType === 'PrimeDebt') {
      let utilization = this.getPrimeCashUtilization();
      if (
        RATE_PRECISION < utilization &&
        utilization < RATE_PRECISION + 5 * BASIS_POINT
      ) {
        utilization = RATE_PRECISION;
      }
      return (this.getPrimeDebtRate(utilization) * 100) / RATE_PRECISION;
    } else if (token.tokenType === 'fCash') {
      return this.getfCashSpotRate(token);
    } else {
      return undefined;
    }
  }

  /**
   * Returns FV = e ^ (rate * time)
   * @param interestRate in 1e9 precision
   * @param timeToMaturity seconds until maturity
   */
  public getfCashExchangeRate(interestRate: number, timeToMaturity: number) {
    const r =
      (interestRate * timeToMaturity) / (RATE_PRECISION * SECONDS_IN_YEAR);
    return Math.floor(Math.exp(r) * RATE_PRECISION);
  }

  protected getfCashPV(interestRate: number, timeToMaturity: number) {
    return this.getfCashExchangeRate(-interestRate, timeToMaturity);
  }
}
