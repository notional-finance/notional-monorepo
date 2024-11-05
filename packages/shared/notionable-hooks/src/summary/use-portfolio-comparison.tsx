import { useAppStore } from '../context/use-root-store';
import { useCurrentTradeContext } from '../context/use-trade-context';

export function usePortfolioComparison() {
  const trade = useCurrentTradeContext();
  const { baseCurrency } = useAppStore();
  const comparePortfolio = trade?.getPortfolioComparison();
  const allTableData = (comparePortfolio || []).map((p) => ({
    ...p,
    current: p.current
      .toFiat(baseCurrency)
      .toDisplayStringWithSymbol(2, true, false),
    updated: p.updated
      .toFiat(baseCurrency)
      .toDisplayStringWithSymbol(2, true, false),
  }));
  const filteredTableData = allTableData.filter(
    ({ changeType }) => changeType !== 'none'
  );

  return {
    onlyCurrent: comparePortfolio === undefined,
    // Sort unchanged rows to the end
    allTableData,
    filteredTableData,
  };
}
