import { useCurrentNetworkStore } from '@notional-finance/notionable-hooks';
import { PORTFOLIO_STATE_ZERO_OPTIONS } from '@notional-finance/util';

/** Returns a list of underlying tokens for the selected tab */
export const useNetworkTokenData = (selectedTabIndex: number) => {
  const store = useCurrentNetworkStore();
  if (selectedTabIndex === PORTFOLIO_STATE_ZERO_OPTIONS.EARN) {
    const tokenList = store.getUnderlyingSymbolsForTokenTypes([
      'fCash',
      'nToken',
      'PrimeCash',
    ]);
    return {
      tokenList: tokenList || [],
      defaultSymbol: 'ETH',
    };
  } else if (selectedTabIndex === PORTFOLIO_STATE_ZERO_OPTIONS.LEVERAGE) {
    const tokenList = store.getUnderlyingSymbolsForTokenTypes([
      'nToken',
      'VaultShare',
    ]);
    return {
      tokenList: tokenList,
      defaultSymbol: 'ETH',
    };
  } else {
    // Borrow Tokens
    const tokenList = store.getUnderlyingSymbolsForTokenTypes([
      'PrimeDebt',
      'fCash',
    ]);
    return {
      tokenList: tokenList,
      defaultSymbol: 'ETH',
    };
  }
};
