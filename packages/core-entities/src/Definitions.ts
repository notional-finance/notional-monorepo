import { BigNumber } from 'ethers';
import { PoolClasses } from './exchanges';
import { TokenBalance } from './token-balance';
import { Network } from '@notional-finance/util';
import { BehaviorSubject } from 'rxjs';
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import {
  TokenInterface,
  TokenType,
  OracleType,
  TransferType,
  SystemAccount,
} from './.graphclient';

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
  /** Currency ID for notional listed tokens */
  currencyId?: number;
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
}

export interface ExchangeRate {
  /** Exchange rate in RATE_PRECISION */
  rate: BigNumber;
  /** Timestamp of the last update, can be used to check for value freshness */
  timestamp: number;
  /** Block number of the last update, can be used to check for value freshness */
  blockNumber: number;
}

export interface PoolData {
  balances: TokenBalance[];
  totalSupply: TokenBalance;
  poolParams: Record<string, unknown>;
}

export interface PoolDefinition {
  /** Address of the pool which also defines the LP token definition */
  address: string;
  /** Typescript class of the pool to instantiate */
  PoolClass: keyof typeof PoolClasses;
  /** Pool data used to instantiate the BaseLiquidityPool */
  latestPoolData?: PoolData;
  /** A list of tokens to register directly on the client before initializing the pool data */
  registerTokens: TokenDefinition[];
}

/** Account Definition Hierarchy **/

export interface AccountDefinition {
  /** Address of the account */
  address: string;
  /** Network this account definition is associated with */
  network: Network;
  /** Balances may include external wallet balances */
  balances: TokenBalance[];
  /** Any transactions that have included transfers to this account */
  transactions?: Transaction[];
  /** Specific allowances tracked for user interface purposes */
  allowances?: Allowance[];
}

/** ERC20 allowances tracked for UI purposes */
export interface Allowance {
  spender: string;
  amount: TokenBalance;
}

/** A single blockchain transaction, multiple accounts may be involved in a single transaction */
export interface Transaction {
  transactionHash: string;
  blockNumber: number;
  timestamp: number;
  /** Transfer bundles are logical groupings of individual transfers */
  bundles: TransferBundle[];
}

/** A logical grouping of transfers */
export interface TransferBundle {
  id: string;
  startLogIndex: number;
  endLogIndex: number;
  transfers: Transfer[];
}

/** Transfer of a single asset */
export interface Transfer {
  id: string;
  logIndex: number;
  token: TokenDefinition;
  transferType: TransferType;
  from: string;
  fromSystemAccount: SystemAccount;
  to: string;
  toSystemAccount: SystemAccount;
  value: TokenBalance;
  valueInUnderlying: TokenBalance;
}

export interface CacheSchema<T> {
  values: Array<[string, T | null]>;
  network: Network;
  lastUpdateTimestamp: number;
  lastUpdateBlock: number;
}

export type SubjectMap<T> = Map<string, BehaviorSubject<T | null>>;

export type RiskAdjustment = 'None' | 'Asset' | 'Debt';
