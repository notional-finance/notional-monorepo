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
export const DELEVERAGE_BUFFER = 300 * BASIS_POINT;
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
  all = 'all',
  mainnet = 'mainnet',
  arbitrum = 'arbitrum',
  optimism = 'optimism',
}

export const NetworkId: Record<Network, number> = {
  [Network.all]: 1,
  [Network.mainnet]: 1,
  [Network.arbitrum]: 42161,
  [Network.optimism]: 10,
};

export const SupportedNetworks = [Network.arbitrum, Network.mainnet];
export const STABLE_COINS = ['USDC', 'USDT', 'DAI', 'FRAX', 'sDAI'];
export const LSDS = ['wstETH', 'cbETH', 'rETH'];
export const NATIVE_YIELD = [...LSDS, 'sDAI'];

export const AlchemyUrl: Record<Network, string> = {
  [Network.all]: 'https://eth-mainnet.g.alchemy.com/v2',
  [Network.mainnet]: 'https://eth-mainnet.g.alchemy.com/v2',
  [Network.arbitrum]: 'https://arb-mainnet.g.alchemy.com/v2',
  [Network.optimism]: 'https://opt-mainnet.g.alchemy.com/v2',
};

export const AlchemyNFTUrl: Record<Network, string> = {
  [Network.all]: 'https://eth-mainnet.g.alchemy.com/nft/v2',
  [Network.mainnet]: 'https://eth-mainnet.g.alchemy.com/nft/v2',
  [Network.arbitrum]: 'https://arb-mainnet.g.alchemy.com/nft/v2',
  [Network.optimism]: 'https://opt-mainnet.g.alchemy.com/nft/v2',
};

export const NotionalAddress: Record<Network, string> = {
  [Network.all]: '0x6e7058c91F85E0F6db4fc9da2CA41241f5e4263f',
  [Network.mainnet]: '0x6e7058c91F85E0F6db4fc9da2CA41241f5e4263f',
  [Network.arbitrum]: '0x1344A36A1B56144C3Bc62E7757377D288fDE0369',
  [Network.optimism]: '',
};

export const SubgraphId: Record<Network, string> = {
  [Network.all]: '4oVxkMtN4cFepbiYrSKz1u6HWnJym435k5DQRAFt2vHW',
  [Network.mainnet]: '4oVxkMtN4cFepbiYrSKz1u6HWnJym435k5DQRAFt2vHW',
  [Network.arbitrum]: '7q9wQYD8VB5dLWZxtuBZ8b2i8DySCK25V6XqpbdYbDep',
  [Network.optimism]: '',
};

export const WETHAddress: Record<Network, string> = {
  [Network.all]: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  [Network.mainnet]: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  [Network.arbitrum]: '0x82af49447d8a07e3bd95bd0d56f35241523fbab1',
  [Network.optimism]: '',
};

export const sNOTE = '0x38de42f4ba8a35056b33a746a6b45be9b1c3b9d2';

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
