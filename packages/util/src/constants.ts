import { BigNumber, ethers } from 'ethers';

export const UNLIMITED_APPROVAL = BigNumber.from(2).pow(96);
export const INTERNAL_TOKEN_PRECISION = 1e8;
export const INTERNAL_TOKEN_DECIMALS = 8;
export const RATE_PRECISION = 1e9;
export const RATE_DECIMALS = 9;
export const SCALAR_PRECISION = BigNumber.from(10).pow(18);
export const SCALAR_DECIMALS = 18;
export const ZERO_ADDRESS = ethers.constants.AddressZero;
export const BASIS_POINT = 1e5;
export const PERCENTAGE_BASIS = 100;
export const INTERNAL_PRECISION_DUST = 5000;
export const FLOATING_POINT_DUST = 5e-5;
export enum HEALTH_FACTOR_RISK_LEVELS {
  HIGH_RISK = 1.25,
  MEDIUM_RISK = 2.5,
  LOW_RISK = 5,
}

export const ONE_SECOND_MS = 1_000;
export const ONE_MINUTE_MS = 60 * ONE_SECOND_MS;
export const ONE_HOUR_MS = 60 * ONE_MINUTE_MS;

export const SECONDS_IN_DAY = 86400;
export const SECONDS_IN_HOUR = 3600;
export const SECONDS_IN_WEEK = SECONDS_IN_DAY * 6;
export const ONE_WEEK = SECONDS_IN_DAY * 7;
export const SECONDS_IN_MONTH = SECONDS_IN_DAY * 30;
export const SECONDS_IN_QUARTER = 90 * SECONDS_IN_DAY;
export const SECONDS_IN_YEAR = SECONDS_IN_QUARTER * 4;
export const SECONDS_IN_YEAR_ACTUAL = 31536000;
export const PRIME_CASH_VAULT_MATURITY = 2 ** 40 - 1;
export const MAX_APPROVAL = ethers.constants.MaxUint256;
export const ALT_ETH = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
export const SETTLEMENT_RESERVE = '0x00000000000000000000000000000000000005e7';
export const FEE_RESERVE = '0x0000000000000000000000000000000000000FEE';
export const MAX_UINT88 = BigNumber.from(2).pow(88).sub(1);
export const IS_LOCAL_ENV =
  process.env['NODE_ENV'] === 'development' ||
  process.env['NODE_ENV'] === 'test';
export const IS_TEST_ENV = process.env['NODE_ENV'] === 'test';

export enum Network {
  All = 'all',
  Mainnet = 'mainnet',
  ArbitrumOne = 'arbitrum',
  Optimism = 'optimism',
  Goerli = 'goerli',
}

export const NetworkId: Record<Network, number> = {
  [Network.All]: 1,
  [Network.Mainnet]: 1,
  [Network.Goerli]: 5,
  [Network.ArbitrumOne]: 42161,
  [Network.Optimism]: 10,
};

export const SupportedNetworks = [Network.ArbitrumOne, Network.Mainnet];

export const AlchemyUrl: Record<Network, string> = {
  [Network.All]: 'https://eth-mainnet.g.alchemy.com/v2',
  [Network.Mainnet]: 'https://eth-mainnet.g.alchemy.com/v2',
  [Network.ArbitrumOne]: 'https://arb-mainnet.g.alchemy.com/v2',
  [Network.Optimism]: 'https://opt-mainnet.g.alchemy.com/v2',
  [Network.Goerli]: 'https://eth-goerli.g.alchemy.com/v2',
};

export const AlchemyNFTUrl: Record<Network, string> = {
  [Network.All]: 'https://eth-mainnet.g.alchemy.com/nft/v2',
  [Network.Mainnet]: 'https://eth-mainnet.g.alchemy.com/nft/v2',
  [Network.ArbitrumOne]: 'https://arb-mainnet.g.alchemy.com/nft/v2',
  [Network.Optimism]: 'https://opt-mainnet.g.alchemy.com/nft/v2',
  [Network.Goerli]: 'https://arb-goerli.g.alchemy.com/nft/v2',
};

export const NotionalAddress: Record<Network, string> = {
  [Network.All]: '0x6e7058c91F85E0F6db4fc9da2CA41241f5e4263f',
  [Network.Mainnet]: '0x6e7058c91F85E0F6db4fc9da2CA41241f5e4263f',
  [Network.ArbitrumOne]: '0x1344A36A1B56144C3Bc62E7757377D288fDE0369',
  [Network.Optimism]: '',
  [Network.Goerli]: '0xD8229B55bD73c61D840d339491219ec6Fa667B0a',
};

export const StakedNoteAddress = '0x38DE42F4BA8a35056b33A746A6b45bE9B1c3B9d2';

export const ORACLE_TYPE_TO_ID = {
  Chainlink: 1,
  VaultShareOracleRate: 2,
  fCashOracleRate: 3,
  nTokenToUnderlyingExchangeRate: 4,
  fCashToUnderlyingExchangeRate: 5,
  fCashSettlementRate: 6,
  fCashSpotRate: 7,
  PrimeDebtSpotInterestRate: 8,
  PrimeDebtToUnderlyingExchangeRate: 9,
  PrimeCashSpotInterestRate: 10,
  PrimeCashToUnderlyingExchangeRate: 11,
  PrimeDebtPremiumInterestRate: 12,
  PrimeCashPremiumInterestRate: 13,
  sNOTE: 14,
};
