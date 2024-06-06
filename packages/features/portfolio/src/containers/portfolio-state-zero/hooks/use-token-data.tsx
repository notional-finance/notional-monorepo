import {
  useAllNetworkMarkets,
  useAllUniqueUnderlyingTokens,
  useSelectedNetwork,
} from '@notional-finance/notionable-hooks';
import { PRODUCTS } from '@notional-finance/util';

export const useTokenData = (selectedTabIndex: number, activeToken: string) => {
  const selectedNetwork = useSelectedNetwork();
  const depositTokens = useAllUniqueUnderlyingTokens([selectedNetwork]);
  const { earnYields, borrowYields } = useAllNetworkMarkets();

  const requiredProducts = {
    0: ['Variable Lend', 'Fixed Lend', 'Provide Liquidity'],
    1: ['Leveraged Liquidity', 'Leveraged Vault'],
    2: ['Variable Borrow', 'Fixed Borrow'],
  };

  const yieldData = selectedTabIndex === 2 ? borrowYields : earnYields;

  const tokenObj: {
    [symbol: string]: { products: string[]; data: typeof earnYields };
  } = {};

  const leveragedTokenData: Record<string, any> = {};

  if (selectedTabIndex === 1) {
    yieldData
      .filter((y) => y.token.network === selectedNetwork)
      .sort((a, b) => a.totalAPY - b.totalAPY)
      .forEach((data) => {
        if (
          data.product === 'Leveraged Liquidity' &&
          !tokenObj['Leveraged Liquidity']
        ) {
          leveragedTokenData['Leveraged Liquidity'] = {
            totalApy: data.totalAPY,
            symbol: data.underlying.symbol,
            maxLeverage: data.leveraged?.maxLeverageRatio || 0,
            link: `/${PRODUCTS.LIQUIDITY_LEVERAGED}/${selectedNetwork}/CreateLeveragedNToken/${data.underlying.symbol}?borrowOption=${data?.leveraged?.debtToken?.id}`,
          };
        } else if (
          data.product === 'Leveraged Vault' &&
          !tokenObj['Leveraged Vault'] &&
          !data.pointMultiples
        ) {
          leveragedTokenData['Leveraged Vault'] = {
            totalApy: data.totalAPY,
            symbol: data.underlying.symbol,
            maxLeverage: data.leveraged?.maxLeverageRatio || 0,
            link: `/${PRODUCTS.VAULTS}/${selectedNetwork}/${data.token.vaultAddress}/CreateVaultPosition?borrowOption=${data?.leveraged?.vaultDebt?.id}`,
          };
        } else if (
          data.product === 'Leveraged Vault' &&
          !tokenObj['Leveraged Vault'] &&
          data.pointMultiples
        ) {
          leveragedTokenData['Leveraged Points'] = {
            totalApy: data.totalAPY,
            symbol: data.underlying.symbol,
            maxLeverage: data.leveraged?.maxLeverageRatio || 0,
            link: `/${PRODUCTS.VAULTS}/${selectedNetwork}/${data.token.vaultAddress}/CreateVaultPosition?borrowOption=${data?.leveraged?.vaultDebt?.id}`,
          };
        }
      });
  } else {
    yieldData
      .filter((y) => y.token.network === selectedNetwork)
      .filter((x) => depositTokens.includes(x.underlying.symbol))
      .forEach((data) => {
        if (requiredProducts[selectedTabIndex].includes(data.product)) {
          if (!tokenObj[data.underlying.symbol]) {
            tokenObj[data.underlying.symbol] = { products: [], data: [] };
          }
          if (
            !tokenObj[data.underlying.symbol].products.includes(data.product)
          ) {
            tokenObj[data.underlying.symbol].products.push(data.product);
          }
          tokenObj[data.underlying.symbol].data.push(data);
        }
      });
  }

  const availableSymbols = Object.entries(tokenObj)
    .filter(([, { products }]) =>
      requiredProducts[selectedTabIndex].every((product) =>
        products.includes(product)
      )
    )
    .map(([symbol]) => symbol);

  return {
    availableSymbols: availableSymbols,
    activeTokenData: tokenObj[activeToken]?.data,
    leveragedTokenData: leveragedTokenData,
  };
};
