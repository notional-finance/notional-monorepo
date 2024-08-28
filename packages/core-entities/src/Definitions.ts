import { Network } from '@notional-finance/util';
import { BigNumber } from 'ethers';
import { BehaviorSubject } from 'rxjs';
import { PoolClasses } from './exchanges';
import { SerializedTokenBalance, TokenBalance } from './token-balance';
// eslint-disable-next-line @nx/enforce-module-boundaries
import {
  OracleType,
  SystemAccount,
  TokenInterface,
  TokenType,
  TransferType,
} from './.graphclient';
// eslint-disable-next-line @nx/enforce-module-boundaries
export type {
  OracleType,
  SystemAccount,
  TokenInterface,
  TokenType,
  TransferType,
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
  /** The total supply value if it is tracked */
  totalSupply?: TokenBalance;
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
  /** Base Token ID:Quote Token ID:OracleType */
  id: string;
  /** Address of the oracle */
  oracleAddress: string;
  /** Network the address refers to */
  network: Network;
  /** Type of oracle interface */
  oracleType:
    | OracleType
    | 'sNOTE'
    | 'VaultShareAPY'
    | 'nTokenTotalAPY'
    | 'sNOTEToETHExchangeRate'
    | 'sNOTEReinvestmentAPY';
  /** Base ID for the oracle, rate is quoted as 1 unit of this token.  */
  base: string;
  /** Quote ID for the oracle, rate is how many tokens 1 unit of base will purchase.  */
  quote: string;
  /** Number of decimal places the rate is quoted in */
  decimals: number;
  /** Most current exchange rate for this oracle */
  latestRate: ExchangeRate;

  /** Used for server side rate updates */
  quoteCurrencyId?: number | null;
  baseDecimals?: number | null;
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
  /** If defined, do not query prior to this block number */
  earliestBlock?: number;
}

/** Account Definition Hierarchy **/

export interface BalanceStatement {
  token: TokenDefinition;
  blockNumber: number;
  underlying: TokenDefinition;
  currentBalance: TokenBalance;
  adjustedCostBasis: TokenBalance;
  totalILAndFees: TokenBalance;
  totalProfitAndLoss: TokenBalance;
  totalInterestAccrual: TokenBalance;
  accumulatedCostRealized: TokenBalance;
  incentives: {
    totalClaimed: TokenBalance;
    adjustedClaimed: TokenBalance;
  }[];
  impliedFixedRate?: number;
}

export interface AccountHistory {
  label: string;
  txnLabel?: string;
  timestamp: number;
  blockNumber: number;
  token: TokenDefinition;
  underlying: TokenDefinition;
  tokenAmount: TokenBalance;
  bundleName: string;
  transactionHash: string;
  underlyingAmountRealized: TokenBalance;
  underlyingAmountSpot: TokenBalance;
  realizedPrice: TokenBalance;
  spotPrice: TokenBalance;
  vaultName?: string;
  impliedFixedRate?: number;
  isTransientLineItem: boolean;
  account?: string;
}

export interface AccountIncentiveDebt {
  value: TokenBalance;
  currencyId: number;
}

export interface StakeNoteStatus {
  inCoolDown: boolean;
  inRedeemWindow: boolean;
  redeemWindowBegin: number;
  redeemWindowEnd: number;
}

export interface HistoricalBalance {
  timestamp: number;
  balance: TokenBalance;
}

export interface AccountDefinition {
  /** Address of the account */
  address: string;
  /** Network this account definition is associated with */
  network: Network;
  /** Balances may include external wallet balances */
  balances: TokenBalance[];
  /** If prime borrows are enabled */
  allowPrimeBorrow?: boolean;
  /** Stores the last update time for vault positions, used to calculate prime debt fees */
  vaultLastUpdateTime?: Record<string, number>;
  /** Account incentive debt for nToken incentives */
  accountIncentiveDebt?: AccountIncentiveDebt[];
  /** Account incentive debt for nToken incentives */
  secondaryIncentiveDebt?: AccountIncentiveDebt[];
  /** Current profit and loss on every given balance */
  balanceStatement?: BalanceStatement[];
  /** Any transactions that have included transfers to this account */
  accountHistory?: AccountHistory[];
  /** Specific allowances tracked for user interface purposes */
  allowances?: Allowance[];
  systemAccountType?: SystemAccount;
  stakeNOTEStatus?: StakeNoteStatus;
  historicalBalances?: HistoricalBalance[];
}

export interface SerializedAccountDefinition {
  /** Address of the account */
  address: string;
  /** Network this account definition is associated with */
  network: Network;
  /** Balances may include external wallet balances */
  balances: SerializedTokenBalance[];
  /** Current profit and loss on every given balance */
  balanceStatement: {
    token: string;
    underlying: string;
    currentBalance: SerializedTokenBalance;
    adjustedCostBasis: SerializedTokenBalance;
    totalILAndFees: SerializedTokenBalance;
    totalProfitAndLoss: SerializedTokenBalance;
    totalInterestAccrual: SerializedTokenBalance;
    impliedFixedRate?: number;
  }[];

  /** Any transactions that have included transfers to this account */
  accountHistory?: {
    timestamp: number;
    token: string;
    underlying: string;
    tokenAmount: SerializedTokenBalance;
    bundleName: string;
    transactionHash: string;
    underlyingAmountRealized: SerializedTokenBalance;
    underlyingAmountSpot: SerializedTokenBalance;
    realizedPrice: SerializedTokenBalance;
    spotPrice: SerializedTokenBalance;
    impliedFixedRate?: number;
    isTransientLineItem: boolean;
  }[];
}

/** ERC20 allowances tracked for UI purposes */
export interface Allowance {
  spender: string;
  amount: TokenBalance;
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
export interface YieldData {
  token: TokenDefinition;
  underlying: TokenDefinition;
  totalAPY: number;
  tvl?: TokenBalance;
  liquidity?: TokenBalance;
  leveraged?: {
    debtToken: TokenDefinition;
    leverageRatio: number;
    debtRate: number;
    maxLeverageRatio: number;
    vaultDebt?: TokenDefinition;
  };
  vaultName?: string;
  nativeTokenAPY?: number;
  organicAPY?: number;
  feeAPY?: number;
  strategyAPY?: number;
  noteIncentives?: {
    symbol: string;
    incentiveAPY: number;
  };
  secondaryIncentives?: {
    symbol: string;
    incentiveAPY: number;
  };
  pointMultiples?: Record<string, number>;
}

export interface DataPoint {
  [key: string]: number | string | null;
}
export type AnalyticsData = DataPoint[];

export interface PriceChange {
  asset: TokenDefinition;
  pastDate: number;
  currentUnderlying: TokenBalance;
  currentFiat: TokenBalance;
  pastUnderlying?: TokenBalance;
  pastFiat?: TokenBalance;
  fiatChange?: number;
  underlyingChange?: number;
}

export type VaultData = {
  vaultAddress: string;
  timestamp: number;
  totalAPY: number | null;
  returnDrivers: Record<string, number | null>;
}[];

export type HistoricalRate = {
  blockNumber: number;
  timestamp: number;
  rate: string;
  totalSupply: string | null;
  tvlUnderlying: string | null;
};

export type HistoricalOracles = {
  id: string;
  oracleAddress: string;
  network: Network;
  oracleType: OracleType;
  base: string;
  quote: string;
  latestRate: string;
  decimals: number;
  historicalRates: HistoricalRate[];
}[];

export type HistoricalTrading = Record<
  string,
  {
    bundleName: string;
    currencyId: number;
    fCashId: string;
    fCashValue: string;
    pCash: string;
    pCashInUnderlying: string;
    timestamp: number;
    blockNumber: number;
    transactionHash: string;
    underlyingTokenBalance?: TokenBalance;
    interestRate?: string;
    fCashMaturity?: number;
  }[]
>;

export type VaultReinvestment = Record<
  string,
  {
    vault: string;
    blockNumber: any;
    timestamp: number;
    transactionHash: any;
    rewardTokenSold: any;
    rewardAmountSold: any;
    tokensReinvested: any;
    tokensPerVaultShare?: any;
    underlyingAmountRealized?: any;
    vaultSharePrice?: any;
  }[]
>;
