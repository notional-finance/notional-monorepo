import {
  AccountData,
  INTERNAL_TOKEN_PRECISION,
  TypedBigNumber,
} from '@notional-finance/sdk';
import { hasMatured } from '@notional-finance/sdk/libs/utils';
import {
  FreeCollateral,
  InterestRateRisk,
} from '@notional-finance/sdk/src/system';
import { useNotional } from '../notional/use-notional';
import { useAccount } from './use-account';

function calculateLiquidationPairs(accountData: AccountData) {
  const { netUnderlyingAvailable } =
    FreeCollateral.getFreeCollateral(accountData);
  if (netUnderlyingAvailable.size === 0) return [];
  const netUnderlying = Array.from(netUnderlyingAvailable.values());

  // Sorted from most negative to least negative
  const netDebts = netUnderlying
    .filter((v) => v.isNegative())
    .sort((a, b) => (a.toETH(false).abs().lte(b.toETH(false).abs()) ? -1 : 1));
  // Sorted from most positive to least positive
  const netCollateral = netUnderlying
    .filter((v) => v.isPositive())
    .sort((a, b) => (a.toETH(false).lte(b.toETH(false)) ? -1 : 1));

  // Returns pairs starting from the largest debt & the largest collateral currency down
  // through all collateral currencies and then continues with the second largest debt
  // and down from there.
  return netDebts.flatMap((d) => {
    return netCollateral.map((c) => {
      return {
        debtCurrencyId: d.currencyId,
        collateralCurrencyId: c.currencyId,
        hasNTokenCollateral: !!accountData.nTokenBalance(c.currencyId),
        hasfCashCollateral: !!accountData.portfolio.find(
          (a) =>
            a.currencyId === c.currencyId &&
            a.notional.isPositive() &&
            !hasMatured(a)
        ),
      };
    });
  });
}

export function useRiskThresholds(
  _accountDataCopy?: AccountData,
  numLiquidationPairs = 2
) {
  const { accountDataCopy: a } = useAccount();
  const { system } = useNotional();
  const accountDataCopy = _accountDataCopy?.copy() || a;
  const interestRateRisk =
    InterestRateRisk.calculateInterestRateRisk(accountDataCopy);
  const hasInterestRateRisk = interestRateRisk.size > 0;
  const liquidationPrices = calculateLiquidationPairs(accountDataCopy)
    .slice(0, numLiquidationPairs)
    .map(
      ({
        debtCurrencyId,
        collateralCurrencyId,
        hasNTokenCollateral,
        hasfCashCollateral,
      }) => {
        const liquidationPrice = accountDataCopy.getLiquidationPrice(
          collateralCurrencyId,
          debtCurrencyId
        );
        const debtSymbol = system?.getUnderlyingSymbol(debtCurrencyId);
        const collateralSymbol =
          system?.getUnderlyingSymbol(collateralCurrencyId);
        // Only calculate these if there is a liquidation price
        const { totalPenaltyRate, totalPenaltyETHValueAtLiquidationPrice } =
          liquidationPrice
            ? accountDataCopy.getLiquidationPenalty(
                collateralCurrencyId,
                liquidationPrice
              )
            : {
                totalPenaltyRate: undefined,
                totalPenaltyETHValueAtLiquidationPrice: undefined,
              };

        const currentPrice = collateralSymbol
          ? TypedBigNumber.fromBalance(
              INTERNAL_TOKEN_PRECISION,
              collateralSymbol,
              true
            )
              .toETH(false)
              .fromETH(debtCurrencyId, false)
          : undefined;

        return {
          id: `${debtCurrencyId}:${collateralCurrencyId}`,
          debtCurrencyId,
          collateralCurrencyId,
          // Liquidation Price is returned in Debt Currency
          liquidationPrice,
          totalPenaltyRate,
          totalPenaltyValue: totalPenaltyETHValueAtLiquidationPrice?.fromETH(
            collateralCurrencyId,
            false
          ),
          debtSymbol,
          collateralSymbol,
          currentPrice,
          hasNTokenCollateral,
          hasfCashCollateral,
        };
      }
    )
    .filter(({ liquidationPrice }) => !!liquidationPrice);

  const maxMarketRates = new Map<number, number>(
    Array.from(interestRateRisk.keys()).map((currencyId) => {
      return [currencyId, InterestRateRisk.getMaxInterestRate(currencyId)];
    })
  );

  const interestRateRiskArray = Array.from(interestRateRisk.keys()).map((k) => {
    const symbol = system?.getUnderlyingSymbol(k);
    return {
      id: k,
      symbol,
      ...interestRateRisk.get(k)!,
    };
  });

  return {
    interestRateRisk,
    interestRateRiskArray,
    hasInterestRateRisk,
    liquidationPrices,
    maxMarketRates,
  };
}
