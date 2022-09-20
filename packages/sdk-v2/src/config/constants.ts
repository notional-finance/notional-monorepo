import { ethers } from 'ethers';

export const SECONDS_IN_YEAR_ACTUAL = 31536000;

export const RATE_PRECISION = 1e9;
export const MAX_MARKET_PROPORTION = (RATE_PRECISION * 99) / 100;
export const BASIS_POINT = 1e5;
export const INTERNAL_TOKEN_PRECISION = 1e8;
export const INTERNAL_TOKEN_DECIMAL_PLACES = 8;
export const INCENTIVE_ACCUMULATION_PRECISION = ethers.constants.WeiPerEther;
export const PERCENTAGE_BASIS = 100;
export const SECONDS_IN_DAY = 86400;
export const SECONDS_IN_HOUR = 3600;
export const SECONDS_IN_WEEK = SECONDS_IN_DAY * 6;
export const SECONDS_IN_MONTH = SECONDS_IN_DAY * 30;
export const SECONDS_IN_QUARTER = 90 * SECONDS_IN_DAY;
export const SECONDS_IN_YEAR = SECONDS_IN_QUARTER * 4;
// 15 seconds for underlying data on local
export const LOCAL_DATA_REFRESH_INTERVAL = 15 * 1000;
// 15 seconds when using the cache
export const CACHE_DATA_REFRESH_INTERVAL = 15 * 1000;
// 3 min for underlying data on chain
export const DEFAULT_DATA_REFRESH_INTERVAL = 180 * 1000;
// 30 minutes for configuration data
export const DEFAULT_CONFIGURATION_REFRESH_INTERVAL = 1800 * 1000;

export const MAX_BALANCES = 10;
export const MAX_PORTFOLIO_ASSETS = 7;
export const MAX_BITMAP_ASSETS = 20;
export const ETHER_CURRENCY_ID = 1;
export const SECONDS_PER_BLOCK = 13;
// This value is not actually stored in the smart contract system, we use it here
// to ensure that we do not clash with any other currency ids
export const NOTE_CURRENCY_ID = 2 ** 32 - 1;
export const STAKED_NOTE_CURRENCY_ID = 2 ** 32;
export const MIN_INTEREST_RATE = 0;
// 12 hours
export const DEFAULT_ORDER_EXPIRATION = 12 * 60 * 60;

export function secondsPerBlock(chainId: number) {
  switch (chainId) {
    case 1:
      return 13;
    case 5:
      return 15;
    case 42:
      return 4;
    default:
      return 1;
  }
}
