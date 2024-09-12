import { TokenBalance, TokenDefinition } from '@notional-finance/core-entities';
import { useRootStore } from '@notional-finance/notionable';
import { PORTFOLIO_STATE_ZERO_OPTIONS } from '@notional-finance/util';

type APYData = {
  totalAPY?: number;
};

type ProductGroupItem = {
  token: TokenDefinition;
  apy: APYData;
  tvl: TokenBalance;
  liquidity: TokenBalance;
  underlying?: TokenDefinition;
  collateralFactor: string;
};

export type ProductGroupData = ProductGroupItem[][];

export const getAPYDataForToken = (
  symbol: string,
  productGroupData: any[],
  getHighestApy: boolean
) => {
  return productGroupData
    .map((group) => {
      const filteredGroup = group.filter((item) => {
        return item?.underlying?.symbol === symbol;
      });

      if (filteredGroup.length === 0) return null;

      return filteredGroup.reduce((prev, current) => {
        const prevTotalAPY = prev.apy?.totalAPY || 0;
        const currentTotalAPY = current.apy?.totalAPY || 0;
        if (getHighestApy) {
          return currentTotalAPY > prevTotalAPY ? current : prev;
        } else {
          return currentTotalAPY < prevTotalAPY ? current : prev;
        }
      });
    })
    .filter((item) => item !== null);
};

export const getAvailableVaults = (
  productGroupData: any[],
  isPointsVault: boolean
) => {
  const productData = productGroupData.flat();
  const availableVaults: Set<string> = new Set();

  const filterCondition = isPointsVault
    ? (item: any) =>
        item?.apy?.pointMultiples &&
        item?.token?.tokenType === 'VaultShare' &&
        item.apy?.totalAPY > 0
    : (item: any) =>
        !item?.apy?.pointMultiples &&
        item?.token?.tokenType === 'VaultShare' &&
        item.apy?.totalAPY > 0;

  productData.filter(filterCondition).forEach((item) => {
    if (item.underlying?.symbol) {
      availableVaults.add(item.underlying.symbol);
    }
  });

  return Array.from(availableVaults);
};

export const useNetworkTokenData = (selectedTabIndex: number) => {
  const rootStore = useRootStore();
  if (selectedTabIndex === PORTFOLIO_STATE_ZERO_OPTIONS.EARN) {
    const productGroupData =
      rootStore.networkStore.getPortfolioStateZeroEarnData();
    return {
      tokenList: productGroupData.tokenList || [],
      productGroupData: productGroupData.productGroupData || [],
      defaultSymbol: productGroupData.defaultSymbol || '',
    };
  } else if (selectedTabIndex === PORTFOLIO_STATE_ZERO_OPTIONS.LEVERAGE) {
    const productGroupData =
      rootStore.networkStore.getPortfolioStateZeroLeveragedData();
    return {
      tokenList: productGroupData.tokenList || [],
      productGroupData: productGroupData.productGroupData || [],
      defaultSymbol: productGroupData.defaultSymbol || '',
    };
  } else {
    const productGroupData =
      rootStore.networkStore.getPortfolioStateZeroBorrowData();
    return {
      tokenList: productGroupData.tokenList || [],
      productGroupData: productGroupData.productGroupData || [],
      defaultSymbol: productGroupData.defaultSymbol || '',
    };
  }
};
