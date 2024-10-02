import {
  LiquidationType,
  RiskyAccount,
  RiskyAccountData,
  Asset,
  Currency,
} from './types';
import Liquidation from './liquidation';
import { BigNumber } from 'ethers';
import { getNowSeconds } from '@notional-finance/util';

type FcashPortfolio = {
  positiveFcash: Map<number, FcashPosition>;
  positiveIfcash: Map<number, FcashPosition>;
  negativeFcash: Map<number, FcashPosition>;
  negativeIfcash: Map<number, FcashPosition>;
};

type FcashPosition = {
  maturities: number[];
};

export const SECONDS_IN_DAY = 86400;
export const SECONDS_IN_QUARTER = 90 * SECONDS_IN_DAY;
export const SECONDS_IN_YEAR = SECONDS_IN_QUARTER * 4;

export default class LiquidationHelper {
  constructor(public wethAddress: string, public currencies: Currency[]) {}

  private getCurrencyById(currencyId: number): Currency {
    const currency = this.currencies.find((c) => c.id === currencyId);
    if (!currency) {
      throw Error('Invalid currency');
    }
    return currency;
  }

  // Get all possible local currency liquidations
  private getLocalCurrencyLiquidations(data: RiskyAccountData): Liquidation[] {
    const assets = data.portfolio;
    const balances = data.balances;
    const localCurrencies = new Set<number>();

    // Find positive nToken balances
    balances.forEach((b) => {
      if (b.nTokenBalance && b.nTokenBalance.gt(0)) {
        localCurrencies.add(b.currencyId);
      }
    });

    // All Fcash and liquidity token assets
    assets.forEach((a) => {
      localCurrencies.add(a.currencyId);
    });

    const liqs: Liquidation[] = [];
    localCurrencies.forEach((c) => {
      const localCurrency = this.getCurrencyById(c);
      liqs.push(
        new Liquidation(
          LiquidationType.LOCAL_CURRENCY,
          localCurrency,
          null,
          null,
          this.wethAddress
        )
      );
    });
    return liqs;
  }

  private getMarketIndexForMaturity(
    maturity: number,
    blockTime = getNowSeconds()
  ) {
    for (let i = 1; i <= 7; i += 1) {
      if (maturity === this.getMaturityForMarketIndex(i, blockTime)) return i;
    }

    throw new Error('Maturity does not correspond to market index');
  }

  private getTimeReference(timestamp = getNowSeconds()) {
    return timestamp - (timestamp % SECONDS_IN_QUARTER);
  }

  private getMaturityForMarketIndex(
    marketIndex: number,
    blockTime = getNowSeconds()
  ) {
    const tRef = this.getTimeReference(blockTime);
    return tRef + this.getMarketMaturityLengthSeconds(marketIndex);
  }

  private getMarketMaturityLengthSeconds(marketIndex: number) {
    if (marketIndex === 1) return SECONDS_IN_QUARTER;
    if (marketIndex === 2) return 2 * SECONDS_IN_QUARTER;
    if (marketIndex === 3) return SECONDS_IN_YEAR;
    if (marketIndex === 4) return 2 * SECONDS_IN_YEAR;
    if (marketIndex === 5) return 5 * SECONDS_IN_YEAR;
    if (marketIndex === 6) return 10 * SECONDS_IN_YEAR;
    if (marketIndex === 7) return 20 * SECONDS_IN_YEAR;

    return 0;
  }

  private getFcashPortfolio(assets: Asset[]): FcashPortfolio {
    const negativeFcash = new Map<number, FcashPosition>();
    const negativeIfcash = new Map<number, FcashPosition>();
    const positiveFcash = new Map<number, FcashPosition>();
    const positiveIFcash = new Map<number, FcashPosition>();

    assets.forEach((a) => {
      let ifcash = false;
      try {
        // Look for idiosyncratic fcash
        this.getMarketIndexForMaturity(a.maturity);
      } catch {
        ifcash = true;
      }

      let positions: Map<number, FcashPosition> | null = null;
      if (ifcash && a.notional.gt(0)) {
        positions = positiveIFcash;
      } else if (ifcash && a.notional.isNegative()) {
        positions = negativeIfcash;
      } else if (!ifcash && a.notional.gt(0)) {
        positions = positiveFcash;
      } else if (!ifcash && a.notional.isNegative()) {
        positions = negativeFcash;
      }

      // notional value is zero
      if (!positions) {
        return;
      }

      const pos = positions.get(a.currencyId);

      if (pos) {
        pos.maturities.push(a.maturity);
      } else {
        positions.set(a.currencyId, {
          maturities: [a.maturity],
        });
      }
    });

    return {
      positiveFcash: positiveFcash,
      positiveIfcash: positiveIFcash,
      negativeFcash: negativeFcash,
      negativeIfcash: negativeIfcash,
    };
  }

  private getLocalFcashLiquidations(portfolio: FcashPortfolio): Liquidation[] {
    const liqs: Liquidation[] = [];

    portfolio.negativeFcash.forEach((v, k) => {
      const localCurrency = this.getCurrencyById(k);
      liqs.push(
        new Liquidation(
          LiquidationType.LOCAL_FCASH,
          localCurrency,
          null,
          v.maturities,
          this.wethAddress
        )
      );
    });

    portfolio.positiveFcash.forEach((v, k) => {
      const localCurrency = this.getCurrencyById(k);
      liqs.push(
        new Liquidation(
          LiquidationType.LOCAL_FCASH,
          localCurrency,
          null,
          v.maturities,
          this.wethAddress
        )
      );
    });

    portfolio.negativeIfcash.forEach((v, k) => {
      const localCurrency = this.getCurrencyById(k);
      liqs.push(
        new Liquidation(
          LiquidationType.LOCAL_IFCASH,
          localCurrency,
          null,
          v.maturities,
          this.wethAddress
        )
      );
    });

    portfolio.positiveIfcash.forEach((v, k) => {
      const localCurrency = this.getCurrencyById(k);
      liqs.push(
        new Liquidation(
          LiquidationType.LOCAL_IFCASH,
          localCurrency,
          null,
          v.maturities,
          this.wethAddress
        )
      );
    });

    return liqs;
  }

  private getCollateralLiquidations(
    netUnderlyingAvailable: Map<number, BigNumber>,
    fcashPortfolio: FcashPortfolio
  ): Liquidation[] {
    const negativeBalances = new Set<number>();
    const positiveBalances = new Set<number>();

    netUnderlyingAvailable.forEach((amount, k) => {
      if (k === 0) {
        return;
      }

      if (amount.isNegative()) {
        negativeBalances.add(k);
      } else if (amount.gt(0)) {
        positiveBalances.add(k);
      }
    });

    const liqs: Liquidation[] = [];
    negativeBalances.forEach((k) => {
      const localCurrency = this.getCurrencyById(k);

      positiveBalances.forEach((kk) => {
        if (k === kk) {
          // Is this possible?
          return;
        }
        const collateralCurrency = this.getCurrencyById(kk);
        liqs.push(
          new Liquidation(
            LiquidationType.COLLATERAL_CURRENCY,
            localCurrency,
            collateralCurrency,
            null,
            this.wethAddress
          )
        );
      });

      fcashPortfolio.positiveFcash.forEach((v, kk) => {
        if (k === kk) {
          // Is this possible?
          return;
        }

        const fcashCurrency = this.getCurrencyById(kk);
        const maturities = v.maturities;

        liqs.push(
          new Liquidation(
            LiquidationType.CROSS_CURRENCY_FCASH,
            localCurrency,
            fcashCurrency,
            maturities,
            this.wethAddress
          )
        );
      });

      fcashPortfolio.positiveIfcash.forEach((v, kk) => {
        if (k === kk) {
          // Is this possible?
          return;
        }

        const fcashCurrency = this.getCurrencyById(kk);
        const maturities = v.maturities;

        liqs.push(
          new Liquidation(
            LiquidationType.CROSS_CURRENCY_IFCASH,
            localCurrency,
            fcashCurrency,
            maturities,
            this.wethAddress
          )
        );
      });
    });

    return liqs;
  }

  public getPossibleLiquidations(account: RiskyAccount): Liquidation[] {
    const localCurrencyLiqs = this.getLocalCurrencyLiquidations(account.data);
    const fcashPortfolio = this.getFcashPortfolio(account.data.portfolio);
    const localFcashLiqs = this.getLocalFcashLiquidations(fcashPortfolio);
    const collateralLiqs = this.getCollateralLiquidations(
      account.netUnderlyingAvailable,
      fcashPortfolio
    );

    const liquidations = localCurrencyLiqs
      .concat(localFcashLiqs)
      .concat(collateralLiqs);

    return liquidations;
  }
}
