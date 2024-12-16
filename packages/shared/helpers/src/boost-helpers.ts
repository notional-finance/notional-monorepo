import {
  boostWhitelistUrl,
  christmasBoostEndDate,
} from '@notional-finance/util';

export const getBoostedData = (data: any[]) => {
  const newUserBoostedData = data.filter((data) => data.symbol === 'USDC');
  const nonBoostedData = data.filter((data) => data.symbol !== 'USDC');

  return {
    newUserBoostedData,
    nonBoostedData,
  };
};

export const checkBoostToken = (symbol: string, isBoostUser: boolean) => {
  return symbol === 'USDC' && isBoostUser;
};

export const fetchBoostData = async () => {
  try {
    const response = await fetch(boostWhitelistUrl);
    if (!response.ok) {
      throw new Error('Failed to fetch newcomer boost data');
    }
    return response.json();
  } catch (error) {
    console.error('Error fetching newcomer boost data:', error);
    return null;
  }
};

export const isBoostDateActive = () => {
  const currentDate = new Date();
  return currentDate <= christmasBoostEndDate;
};
