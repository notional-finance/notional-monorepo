import { FiatKeys } from '@notional-finance/core-entities';
import { TradeState, VaultTradeState } from '@notional-finance/notionable';

export function usePortfolioComparison(
  state: TradeState | VaultTradeState,
  fiat: FiatKeys = 'USD'
) {
  const { postTradeBalances, comparePortfolio } = state;
  const allTableData = (comparePortfolio || []).map((p) => ({
    ...p,
    current: p.current.toFiat(fiat).toDisplayStringWithSymbol(2, true, false),
    updated: p.updated.toFiat(fiat).toDisplayStringWithSymbol(2, true, false),
  }));
  const filteredTableData = allTableData.filter(
    ({ changeType }) => changeType !== 'none'
  );

  return {
    onlyCurrent: postTradeBalances === undefined,
    // Sort unchanged rows to the end
    allTableData,
    filteredTableData,
  };
}
