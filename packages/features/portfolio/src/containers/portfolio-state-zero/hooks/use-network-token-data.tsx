import { usePortfolioStore } from '@notional-finance/notionable';
import { PORTFOLIO_STATE_ZERO_OPTIONS } from '@notional-finance/util';

export const getAPYDataForToken = (
  activeToken: string,
  productGroupData: any[]
) => {
  return productGroupData
    .flatMap((group) => {
      return group.filter((item) => item?.symbol === activeToken);
    })
    .filter((item) => item !== null);
};

export const getAvailableVaults = (productGroupData) => {
  const availableVaults: Set<string> = new Set();
  productGroupData
    .filter((item) => item.apy?.totalAPY > 0)
    .forEach((item) => {
      if (item?.symbol) {
        availableVaults.add(item.symbol);
      }
    });
  return Array.from(availableVaults);
};

export const useNetworkTokenData = (selectedTabIndex: number) => {
  const portfolioStore = usePortfolioStore();
  if (selectedTabIndex === PORTFOLIO_STATE_ZERO_OPTIONS.EARN) {
    const { data, tokenList, defaultSymbol } = portfolioStore.stateZeroEarnData;
    if (data.length === 0) {
      portfolioStore.setStateZeroEarnData();
    }
    return {
      tokenList: tokenList || [],
      productGroupData: data || [],
      defaultSymbol: defaultSymbol || '',
    };
  } else if (selectedTabIndex === PORTFOLIO_STATE_ZERO_OPTIONS.LEVERAGE) {
    const { data, tokenList, defaultSymbol } =
      portfolioStore.stateZeroLeveragedData;
    if (data.length === 0) {
      portfolioStore.setStateZeroLeveragedData();
    }
    return {
      tokenList: tokenList || [],
      productGroupData: data || [],
      defaultSymbol: defaultSymbol || '',
    };
  } else {
    const { data, tokenList, defaultSymbol } =
      portfolioStore.stateZeroBorrowData;
    if (data.length === 0) {
      portfolioStore.setStateZeroBorrowData();
    }
    return {
      tokenList: tokenList || [],
      productGroupData: data || [],
      defaultSymbol: defaultSymbol || '',
    };
  }
};
