import { useCurrentNetworkStore } from '@notional-finance/notionable-hooks';
import { PORTFOLIO_STATE_ZERO_OPTIONS } from '@notional-finance/util';

function sortTokens(a: string, b: string) {
  if (a === 'ETH' && b === 'ETH') return 0;
  if (a === 'ETH') return -1;
  if (b === 'ETH') return 1;
  if (a === 'USDC' && b === 'USDC') return 0;
  if (a === 'USDC') return -1;
  if (b === 'USDC') return 1;
  if (a === 'WBTC' && b === 'WBTC') return 0;
  if (a === 'WBTC') return -1;
  if (b === 'WBTC') return 1;
  return a.localeCompare(b);
}

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
      tokenList: tokenList.sort(sortTokens),
      defaultSymbol: 'ETH',
    };
  } else if (selectedTabIndex === PORTFOLIO_STATE_ZERO_OPTIONS.LEVERAGE) {
    const tokenList = store.getUnderlyingSymbolsForTokenTypes([
      'nToken',
      'VaultShare',
    ]);
    return {
      tokenList: tokenList.sort(sortTokens),
      defaultSymbol: 'ETH',
    };
  } else {
    // Borrow Tokens
    const tokenList = store.getUnderlyingSymbolsForTokenTypes([
      'PrimeDebt',
      'fCash',
    ]);
    return {
      tokenList: tokenList.sort(sortTokens),
      defaultSymbol: 'ETH',
    };
  }
};
