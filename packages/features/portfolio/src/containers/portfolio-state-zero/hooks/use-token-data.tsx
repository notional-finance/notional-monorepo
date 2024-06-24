import {
  useAllNetworkMarkets,
  useAllUniqueUnderlyingTokens,
  useSelectedNetwork,
} from '@notional-finance/notionable-hooks';
import { PORTFOLIO_STATE_ZERO_OPTIONS } from '@notional-finance/util';

export const useTokenData = (selectedTabIndex: number, activeToken: string) => {
  const selectedNetwork = useSelectedNetwork();
  const depositTokens = useAllUniqueUnderlyingTokens([selectedNetwork]);
  const { earnYields, borrowYields } = useAllNetworkMarkets();

  const requiredProducts = {
    [PORTFOLIO_STATE_ZERO_OPTIONS.EARN]: [
      'Variable Lend',
      'Fixed Lend',
      'Provide Liquidity',
    ],
    [PORTFOLIO_STATE_ZERO_OPTIONS.LEVERAGE]: [
      'Leveraged Liquidity',
      'Leveraged Vault',
    ],
    [PORTFOLIO_STATE_ZERO_OPTIONS.BORROW]: ['Variable Borrow', 'Fixed Borrow'],
  };

  const yieldData =
    selectedTabIndex === PORTFOLIO_STATE_ZERO_OPTIONS.BORROW
      ? borrowYields
      : earnYields;

  const tokenObj: {
    [symbol: string]: { products: string[]; data: typeof earnYields };
  } = {};

  yieldData
    .filter((y) => y.token.network === selectedNetwork)
    .filter((x) => depositTokens.includes(x.underlying.symbol))
    .forEach((data) => {
      if (requiredProducts[selectedTabIndex].includes(data.product)) {
        if (!tokenObj[data.underlying.symbol]) {
          tokenObj[data.underlying.symbol] = { products: [], data: [] };
        }
        if (!tokenObj[data.underlying.symbol].products.includes(data.product)) {
          tokenObj[data.underlying.symbol].products.push(data.product);
        }
        tokenObj[data.underlying.symbol].data.push(data);
      }
    });

  const availableSymbols = Object.entries(tokenObj)
    .filter(([, { products }]) =>
      requiredProducts[selectedTabIndex].some((product) =>
        products.includes(product)
      )
    )
    .map(([symbol]) => symbol);

  return {
    availableSymbols: availableSymbols,
    activeTokenData: tokenObj[activeToken]?.data,
  };
};
