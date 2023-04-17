import { Market } from '@notional-finance/sdk/src/system';
import { useAllMarkets } from '@notional-finance/notionable-hooks';

export const useLendBorrowRates = () => {
  const { cardData } = useAllMarkets();

  let currentMaxRate = 0;
  let currentMinRate: number | undefined = undefined;
  let maxFixedLendRateData = {
    symbol: 'eth',
    maxRate: '0%',
  };
  let minFixedBorrowRateData = {
    symbol: 'eth',
    minRate: '0%',
  };

  cardData.forEach((data) => {
    if (data.maxRate > currentMaxRate) {
      currentMaxRate = data.maxRate;
      maxFixedLendRateData = {
        symbol: data.symbol,
        maxRate: Market.formatInterestRate(data.maxRate, 2),
      };
    }

    if (!currentMinRate) {
      currentMinRate = data.minRate;
      minFixedBorrowRateData = {
        symbol: data.symbol,
        minRate: Market.formatInterestRate(data.minRate, 2),
      };
    } else if (data.minRate < currentMinRate) {
      currentMinRate = data.minRate;
      minFixedBorrowRateData = {
        symbol: data.symbol,
        minRate: Market.formatInterestRate(data.minRate, 2),
      };
    }
  });

  return { maxFixedLendRateData, minFixedBorrowRateData };
};
