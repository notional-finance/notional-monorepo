import { BigNumber, ethers } from 'ethers';

export const INTERNAL_TOKEN_PRECISION = 1e8;
export const RATE_PRECISION = 1e9;
export const SCALAR_PRECISION = BigNumber.from(10).pow(18);
export const ZERO_ADDRESS = ethers.constants.AddressZero;
export const BASIS_POINT = 1e5;
export const PERCENTAGE_BASIS = 100;

export const ONE_SECOND_MS = 1_000;
export const ONE_MINUTE_MS = 60 * ONE_SECOND_MS;
export const ONE_HOUR_MS = 60 * ONE_MINUTE_MS;

export const SECONDS_IN_DAY = 86400;
export const SECONDS_IN_HOUR = 3600;
export const SECONDS_IN_WEEK = SECONDS_IN_DAY * 6;
export const SECONDS_IN_MONTH = SECONDS_IN_DAY * 30;
export const SECONDS_IN_QUARTER = 90 * SECONDS_IN_DAY;
export const SECONDS_IN_YEAR = SECONDS_IN_QUARTER * 4;
export const SECONDS_IN_YEAR_ACTUAL = 31536000;

export enum Network {
  All = 'all',
  Mainnet = 'mainnet',
  ArbitrumOne = 'arbitrum',
}

export const NetworkId: Record<Network, number> = {
  [Network.All]: 0,
  [Network.Mainnet]: 1,
  [Network.ArbitrumOne]: 42161,
};

export const AlchemyUrl: Record<Network, string> = {
  [Network.All]: '',
  [Network.Mainnet]: 'https://eth-mainnet.g.alchemy.com/v2',
  [Network.ArbitrumOne]: 'https://arb-mainnet.g.alchemy.com/v2/',
};
