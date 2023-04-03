import { BigNumber } from 'ethers';
import { BaseLiquidityPool } from './exchanges';

export enum Network {
  All = 'all',
  Mainnet = 'mainnet',
  Goerli = 'goerli',
}

export enum TokenInterface {
  /** Standard transferrable ERC20 */
  ERC20 = 'ERC20',
  /** ERC4626 yield bearing tokens with an extension of ERC20 */
  ERC4626 = 'ERC4626',
  /** ERC1155 tokens */
  ERC1155 = 'ERC1155',
  /** ERC721 NFTs */
  ERC721 = 'ERC1155',
  /** Special handling for ETH */
  ETH = 'ETH',
  /** Special handling for WETH */
  WETH = 'WETH',
  /** Notional internal ERC20 balances, denominated as 8 decimals  */
  Notional_InternalERC20 = 'Notional_InternalERC20',
  /** Non-crypto denominated fiat balance (i.e. USD, JPY, EUR) */
  FIAT = 'FIAT',
}

export interface TokenDefinition {
  /** Address of the token */
  address: string;
  /** Network the address refers to */
  network: Network;
  /** String based token symbol */
  symbol: string;
  /** Number of native decimal places for the token */
  decimalPlaces: number;
  /** Defines the token standard this token relies on */
  tokenInterface: TokenInterface;
  /** Defines the ERC1155 or ERC721 id of the token, if it exists */
  id?: string;
  /** Defines the maturity of the token, if it exists */
  maturity?: number;
}

export enum OracleInterface {
  /** Standard Chainlink IAggregator interface */
  Chainlink,
  /** Balancer V2 time weighted average price oracle */
  BalancerV2_TWAP,
  /** Compound V2 cToken exchange rate */
  CompoundV2_cToken,
  /** Notional time weighted average interest rate oracle */
  Notional_InterestRate,
  /** Notional leveraged vault price oracle */
  Notional_VaultOracle,
}

export interface OracleDefinition {
  /** Address of the oracle */
  address: string;
  /** Network the address refers to */
  network: Network;
  /** Type of oracle interface */
  oracleInterface: OracleInterface;
  /**
   * Base for the oracle, rate is quoted as 1 unit of this token.
   * Must be a valid symbol on the same network.
   */
  base: string;
  /**
   * Quote for the oracle, rate is how many tokens 1 unit of base will purchase.
   * Must be a valid symbol on the same network
   */
  quote: string;
  /** Number of decimal places the rate is quoted in */
  decimalPlaces: number;
  /** Maximum update cadence in seconds, if defined. Typically only valid for off-chain oracles */
  heartbeat?: number;
}

export interface ExchangeRate {
  /** Symbol of the base currency */
  base: string;
  /** Symbol of the quote currency */
  quote: string;
  /** Exchange rate in RATE_PRECISION */
  rate: BigNumber;
  /** Timestamp of the last update, can be used to check for value freshness */
  validTimestamp: number;
}

export interface PoolDefinition {
  /** Address of the pool */
  address: string;
  /** Typescript class of the pool to instantiate */
  poolClass: typeof BaseLiquidityPool;
  /** LP token definition to add to TokenRegistry */
  lpToken: TokenDefinition;
}
