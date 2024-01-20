import { formatNumberAsAPY } from '@notional-finance/helpers';

interface IncentiveData {
  symbol: string;
  incentiveAPY: number;
}

export const useIncentiveData = (
  rate: number,
  customRate = 0,
  incentiveData?: IncentiveData,
  secondaryIncentiveData?: IncentiveData
) => {
  const formattedTotalRate = formatNumberAsAPY(rate);
  const incentiveRate = incentiveData?.incentiveAPY || 0;
  const secondaryIncentiveRate = secondaryIncentiveData?.incentiveAPY || 0;
  const totalIncentiveRate = incentiveRate + secondaryIncentiveRate || 0;
  const formattedRate = formatNumberAsAPY(rate - totalIncentiveRate);
  const incentiveApy = formatNumberAsAPY(incentiveRate);
  const secondaryIncentiveApy = formatNumberAsAPY(secondaryIncentiveRate);
  const formattedCustomRate = formatNumberAsAPY(customRate);
  const totalIncentivesApy = formatNumberAsAPY(totalIncentiveRate);

  return {
    formattedTotalRate,
    incentiveRate,
    secondaryIncentiveRate,
    formattedRate,
    incentiveApy,
    secondaryIncentiveApy,
    formattedCustomRate,
    totalIncentivesApy,
  };
};
