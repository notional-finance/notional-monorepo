import { useAccount } from '..';

export function useMoneyMarket() {
  const { balanceSummary } = useAccount();
  return Array.from(balanceSummary.values())
    .map((b) => {
      return {
        currencyId: b.currencyId,
        assetSymbol: b.symbol,
        underlyingSymbol: b.underlyingSymbol,
        balance: b.assetCashBalance,
        currentYield: b.cTokenYieldDisplayString,
        interestEarned: b.assetCashBalance.isPositive() ? b.totalCTokenInterest : undefined,
      };
    })
    .filter((v) => !v.balance.isZero());
}
