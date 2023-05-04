import { BigNumber } from 'ethers';
import { BaseLiquidityPool } from './exchanges';

export enum AssetType {
  FCASH_ASSET_TYPE = 1,
  VAULT_CASH_ASSET_TYPE = 9,
  VAULT_SHARE_ASSET_TYPE = 10,
  VAULT_DEBT_ASSET_TYPE = 11,
  LEGACY_NTOKEN_ASSET_TYPE = 12,
}

export enum Network {
  All = 'all',
  Mainnet = 'mainnet',
  ArbitrumOne = 'ArbitrumOne',
}

export enum TokenInterface {
  /** Standard transferrable ERC20 */
  ERC20 = 'ERC20',
  /** ERC4626 yield bearing tokens with an extension of ERC20 */
  ERC4626 = 'ERC4626',
  /** ERC1155 tokens */
  ERC1155 = 'ERC1155',
  /** ERC721 NFTs */
  ERC721 = 'ERC721',
  /** Special handling for ETH */
  ETH = 'ETH',
  /** Special handling for WETH */
  WETH = 'WETH',
  /** Non-crypto denominated fiat balance (i.e. USD, JPY, EUR) */
  FIAT = 'FIAT',
}

export enum TokenType {
  Underlying = 'Underlying',
  nToken = 'nToken',
  WrappedfCash = 'WrappedfCash',
  PrimeCash = 'PrimeCash',
  PrimeDebt = 'PrimeDebt',
  fCash = 'fCash',
  VaultShare = 'VaultShare',
  VaultDebt = 'VaultDebt',
  VaultCash = 'VaultCash',
  NOTE = 'NOTE',
}

export interface TokenDefinition {
  /** Defines the ERC1155 or ERC721 id of the token, if it exists */
  id: string;
  /** Address of the token */
  address: string;
  /** Network the address refers to */
  network: Network;
  /** String name of the token */
  name: string;
  /** String based token symbol */
  symbol: string;
  /** Number of native decimal places for the token */
  decimals: number;
  /** Defines the token standard this token relies on */
  tokenInterface: TokenInterface;
  /** Defines the token type */
  tokenType: TokenType;
  /** Link to the underlying token definition, if it exists */
  underlying?: string;
  /** Defines the maturity of the token, if it exists */
  maturity?: number;
  /** Vault Address */
  vaultAddress?: string;
  /** Only true for fCash assets */
  isFCashDebt?: boolean;
}

export enum OracleType {
  /** Standard Chainlink IAggregator interface */
  Chainlink,
  fCashOracleRate,
  fCashSettlementRate,
  PrimeCashToUnderlyingOracleInterestRate,
  MoneyMarketToUnderlyingOracleInterestRate,
  PrimeCashToUnderlyingExchangeRate,
  PrimeCashToMoneyMarketExchangeRate,
  PrimeDebtToUnderlyingExchangeRate,
  PrimeDebtToMoneyMarketExchangeRate,
  MoneyMarketToUnderlyingExchangeRate,
  VaultShareOracleRate,
  /** Balancer V2 time weighted average price oracle */
  BalancerV2_TWAP,
}

export interface OracleDefinition {
  /** Address of the oracle */
  address: string;
  /** Network the address refers to */
  network: Network;
  /** Type of oracle interface */
  oracleType: OracleType;
  /** Base for the oracle, rate is quoted as 1 unit of this token.  */
  base: TokenDefinition;
  /** Quote for the oracle, rate is how many tokens 1 unit of base will purchase.  */
  quote: TokenDefinition;
  /** Number of decimal places the rate is quoted in */
  decimalPlaces: number;
  /** Maximum update cadence in seconds, if defined. Typically only valid for off-chain oracles */
  heartbeat?: number;
}

export interface ExchangeRate {
  oracle: OracleDefinition;
  /** Exchange rate in RATE_PRECISION */
  rate: BigNumber;
  /** Timestamp of the last update, can be used to check for value freshness */
  timestamp: number;
}

export interface PoolDefinition {
  /** Address of the pool */
  address: string;
  /** Typescript class of the pool to instantiate */
  poolClass: typeof BaseLiquidityPool;
  /** LP token definition to add to TokenRegistry */
  lpToken: TokenDefinition;
}
