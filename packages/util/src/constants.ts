import { BigNumber, ethers } from 'ethers';

export const INTERNAL_TOKEN_PRECISION = 1e8;
export const RATE_PRECISION = 1e9;
export const SCALAR_PRECISION = BigNumber.from(1e18);
export const ZERO_ADDRESS = ethers.constants.AddressZero;
