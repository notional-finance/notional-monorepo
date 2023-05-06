import { BigNumber, ethers } from 'ethers';

export const INTERNAL_TOKEN_PRECISION = 1e8;
export const RATE_PRECISION = 1e9;
export const SCALAR_PRECISION = BigNumber.from(1e18);
export const ZERO_ADDRESS = ethers.constants.AddressZero;

export const ONE_SECOND_MS = 1_000;
export const ONE_MINUTE_MS = 60 * ONE_SECOND_MS;
export const ONE_HOUR_MS = 60 * ONE_MINUTE_MS;

export enum Network {
  All = 'all',
  Mainnet = 'mainnet',
  ArbitrumOne = 'arbitrum-one',
}
