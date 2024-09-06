import {
  getNetworkModel,
  TokenBalance,
  TokenDefinition,
} from '@notional-finance/core-entities';
import { Network, PORTFOLIO_STATE_ZERO_OPTIONS } from '@notional-finance/util';

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
  productGroupData: ProductGroupData,
  getHighestApy: boolean
) => {
  return productGroupData
    .map((group) => {
      const filteredGroup = group.filter(
        (item) => item.underlying?.symbol === symbol
      );
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

export const useNetworkTokenData = (
  network: Network | undefined,
  selectedTabIndex: number
) => {
  const model = getNetworkModel(network);
  if (selectedTabIndex === PORTFOLIO_STATE_ZERO_OPTIONS.EARN) {
    const { tokenList, productGroupData, defaultSymbol } =
      model.getPortfolioStateZeroEarnData();
    return { tokenList, productGroupData, defaultSymbol };
  } else if (selectedTabIndex === PORTFOLIO_STATE_ZERO_OPTIONS.LEVERAGE) {
    return { tokenList: [], productGroupData: [], defaultSymbol: '' };
  } else {
    const { tokenList, productGroupData, defaultSymbol } =
      model.getPortfolioStateZeroBorrowData();
    return { tokenList, productGroupData, defaultSymbol };
  }
};
