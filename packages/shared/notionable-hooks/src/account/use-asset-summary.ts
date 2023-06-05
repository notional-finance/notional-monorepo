import { CashGroup, Market } from '@notional-finance/sdk/src/system';
import { useObservableState } from 'observable-hooks';
import { assetSummary$, MaturityData } from '@notional-finance/notionable';
import { TypedBigNumber } from '@notional-finance/sdk';
import { convertRateToFloat } from '@notional-finance/helpers';
import {
  LEND_BORROW,
  PORTFOLIO_ACTIONS,
} from '@notional-finance/shared-config';

export interface AssetSummary {
  underlyingSymbol: string;
  maturity: number;
  currentValue: TypedBigNumber;
  dueAtMaturity: TypedBigNumber;
  fixedAPY: number | undefined;
  removeAssetRoute: string | undefined;
  rollMaturities: MaturityData[] | undefined;
  hashKey: string;
}

export function useAssetSummary(borrowOrLend: LEND_BORROW) {
  const assetSummaries = useObservableState(assetSummary$);

  const assetSummary: AssetSummary[] = Array.from(
    assetSummaries?.values() ?? []
  )
    .filter(
      (a) =>
        a.liquidityToken === undefined &&
        ((borrowOrLend === LEND_BORROW.BORROW &&
          a.fCash?.notional.isNegative()) ||
          (borrowOrLend === LEND_BORROW.LEND && a.fCash?.notional.isPositive()))
    )
    .map((a) => {
      const fCash = a.fCash!;
      const isIdiosyncratic = CashGroup.isIdiosyncratic(a.maturity);
      const rollMaturityData: MaturityData[] = a
        .getRollFactors(fCash.notional)
        .map(({ tradeRate, market }) => {
          const isPartialRoll = !tradeRate;

          return {
            fCashId: market.marketKey,
            maturity: market.maturity,
            tradeRateString: tradeRate
              ? `${Market.formatInterestRate(tradeRate)} APR`
              : 'Partial Roll',
            tradeRate: tradeRate ? convertRateToFloat(tradeRate) : undefined,
            hasLiquidity: market.hasLiquidity,
            rollMaturityRoute: `${PORTFOLIO_ACTIONS.ROLL_MATURITY}?assetKey=${
              a.assetKey
            }&marketKey=${market.marketKey}${
              isPartialRoll ? '&partialRoll=true' : ''
            }`,
          };
        });

      let removeAssetRoute: string | undefined;
      if (borrowOrLend === LEND_BORROW.BORROW) {
        removeAssetRoute = isIdiosyncratic
          ? `${PORTFOLIO_ACTIONS.REPAY_IFCASH_BORROW}?symbol=${a.underlyingSymbol}&assetKey=${a.assetKey}`
          : `${PORTFOLIO_ACTIONS.REPAY_BORROW}?assetKey=${a.assetKey}`;
      } else {
        removeAssetRoute = isIdiosyncratic
          ? undefined
          : `${PORTFOLIO_ACTIONS.WITHDRAW_LEND}?assetKey=${a.assetKey}`;
      }

      return {
        underlyingSymbol: a.underlyingSymbol,
        maturity: a.maturity,
        currentValue: a.underlyingInternalPV,
        dueAtMaturity: a.fCashValue,
        fixedAPY: a.mostRecentTradedRate(),
        removeAssetRoute,
        rollMaturities: isIdiosyncratic ? undefined : rollMaturityData,
        hashKey: a.hashKey,
      };
    });

  return assetSummary;
}
