import { BigNumber } from 'ethers';
import { BaseLiquidityPool } from './exchanges';
import { TokenInterface, TokenType, OracleType } from './.graphclient';

export enum Network {
  All = 'all',
  Mainnet = 'mainnet',
  ArbitrumOne = 'arbitrum-one',
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

export interface OracleDefinition {
  id: string;
  /** Address of the oracle */
  oracleAddress: string;
  /** Network the address refers to */
  network: Network;
  /** Type of oracle interface */
  oracleType: OracleType;
  /** Base ID for the oracle, rate is quoted as 1 unit of this token.  */
  base: string;
  /** Quote ID for the oracle, rate is how many tokens 1 unit of base will purchase.  */
  quote: string;
  /** Number of decimal places the rate is quoted in */
  decimals: number;
  /** Most current exchange rate for this oracle */
  latestRate: ExchangeRate;
  /** Array of historical exchange rates for this oracle */
  historicalRates: ExchangeRate[];
}

export interface ExchangeRate {
  /** Exchange rate in RATE_PRECISION */
  rate: BigNumber;
  /** Timestamp of the last update, can be used to check for value freshness */
  timestamp: number;
  /** Block number of the last update, can be used to check for value freshness */
  blockNumber: number;
}

export interface PoolDefinition {
  /** Address of the pool */
  address: string;
  /** Typescript class of the pool to instantiate */
  poolClass: typeof BaseLiquidityPool;
  /** LP token definition to add to TokenRegistry */
  lpToken: TokenDefinition;
}
