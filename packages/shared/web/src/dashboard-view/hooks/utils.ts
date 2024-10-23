import { YieldData } from '@notional-finance/core-entities';
import { formatNumberAsPercent } from '@notional-finance/helpers';
import { DashboardDataProps } from '@notional-finance/mui';
import { STABLE_COINS, LSDS, PRODUCTS } from '@notional-finance/util';

export const getTotalIncentiveApy = (num1?: number, num2?: number) => {
  if (num1 && num2) {
    return formatNumberAsPercent(num1 + num2);
  } else if (num1) {
    return formatNumberAsPercent(num1);
  } else if (num2) {
    return formatNumberAsPercent(num2);
  } else {
    return undefined;
  }
};

export const getTotalIncentiveSymbol = (symbol1?: string, symbol2?: string) => {
  if (symbol1 && symbol2) {
    return [symbol1, symbol2];
  } else if (symbol1) {
    return [symbol1];
  } else if (symbol2) {
    return [symbol2];
  } else {
    return [];
  }
};

const sortReinvestmentType = (data: any[], reinvestmentType: number) => {
  if (reinvestmentType === 0) {
    return data;
  } else if (reinvestmentType === 1) {
    return data.filter((x) => x.vaultType === 'SingleSidedLP_AutoReinvest');
  } else if (reinvestmentType === 2) {
    return data.filter((x) => x.vaultType === 'SingleSidedLP_DirectClaim');
  } else {
    return [];
  }
};

export const sortGridData = (
  gridData: {
    sectionTitle?: string;
    data: DashboardDataProps[];
    hasLeveragedPosition?: boolean;
    hasNegativePosition?: boolean;
  }[],
  reinvestmentType: number
) => {
  const sortedData = gridData.map((item) => {
    return {
      ...item,
      data: sortReinvestmentType(item.data || [], reinvestmentType),
    };
  });

  return sortedData;
};

export const sortListData = (
  data: any[],
  tokenGroup: number,
  reinvestmentType: number,
  product: PRODUCTS
) => {
  let filteredData = data;

  if (product === PRODUCTS.LEVERAGED_YIELD_FARMING) {
    filteredData = sortReinvestmentType(data, reinvestmentType);
  }

  if (filteredData.length > 0 && tokenGroup === 0) {
    return filteredData;
  } else if (filteredData.length > 0 && tokenGroup === 1) {
    return filteredData.filter((x) =>
      STABLE_COINS.includes(x?.currency?.symbol || '')
    );
  } else if (filteredData.length > 0 && tokenGroup === 2) {
    return filteredData.filter(
      (x) =>
        LSDS.includes(x?.currency?.symbol || '') ||
        x?.currency?.symbol === 'ETH'
    );
  } else {
    return [];
  }
};

export const getIncentiveData = (
  incentives: Array<{ symbol: string; incentiveAPY?: number }>
) => {
  if (incentives.length >= 2) {
    return {
      inlineIcons: true,
      label: formatNumberAsPercent(incentives[0].incentiveAPY || 0),
      symbol: incentives[0].symbol,
      caption: formatNumberAsPercent(incentives[1].incentiveAPY || 0),
      captionSymbol: incentives[1].symbol,
    };
  } else if (incentives.length === 1) {
    return {
      inlineIcons: false,
      label: formatNumberAsPercent(incentives[0].incentiveAPY || 0),
      symbol: incentives[0].symbol,
    };
  } else {
    return {
      label: '',
      symbol: '',
    };
  }
};

export const getCombinedIncentiveData = (
  incentives: YieldData['noteIncentives'],
  secondaryIncentives: YieldData['secondaryIncentives']
) => {
  if (secondaryIncentives && incentives) {
    return incentives.incentiveAPY + secondaryIncentives.incentiveAPY;
  } else if (incentives && !secondaryIncentives) {
    return incentives.incentiveAPY;
  } else {
    return 0;
  }
};

export const sumAndFormatIncentives = (
  incentives: Array<{ symbol: string; incentiveAPY?: number }>
): string => {
  const totalAPY = incentives.reduce(
    (sum, incentive) => sum + (incentive.incentiveAPY || 0),
    0
  );
  return formatNumberAsPercent(totalAPY);
};

export const getIncentiveSymbols = (
  incentives: Array<{ symbol: string; incentiveAPY?: number }>
): string[] => {
  return incentives.map((incentive) => incentive.symbol);
};
