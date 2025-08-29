import { Network, TokenAddress, VaultAddress } from '@notional-finance/util';
import { BigNumber } from 'ethers';
import { PoolClasses } from './exchanges';
import { TokenBalance } from './token-balance';
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import {
  OracleType,
  SystemAccount,
  TokenInterface,
  TokenType,
} from './.graphclient';
import { RegisterToken } from './exchanges/default-pools';
import { PriceChangeModel } from './models/ModelTypes';
import { Instance } from 'mobx-state-tree';
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
export type {
  OracleType,
  SystemAccount,
  TokenInterface,
  TokenType,
} from './.graphclient';

export interface TokenDefinition {
  /** Defines the ERC1155 or ERC721 id of the token, if it exists */
  id: string;
  /** Address of the token */
  address: Lowercase<TokenAddress> | RegisterToken;
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
  vaultAddress?: Lowercase<VaultAddress> | string;
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
  totalProfitAndLoss: TokenBalance;
  totalInterestAccrual: TokenBalance;
  accumulatedCostRealized: TokenBalance;
  totalVaultFees: TokenBalance;
  incentives: {
    totalClaimed: TokenBalance;
    adjustedClaimed: TokenBalance;
  }[];
  impliedFixedRate?: number;
}

export interface AccountHistory {
  lineItemType: string;
  timestamp: number;
  blockNumber: number;
  token: TokenDefinition;
  underlying: TokenDefinition;
  tokenAmount: TokenBalance;
  transactionHash: string;
  underlyingAmountRealized: TokenBalance;
  underlyingAmountSpot: TokenBalance;
  realizedPrice: TokenBalance;
  spotPrice: TokenBalance;
  impliedFixedRate?: number;
  account?: string;
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

export interface WithdrawRequest {
  withdrawManager: string;
  requestId: BigNumber;
  sharesAmount: TokenBalance;
  yieldTokenAmount: TokenBalance;
  finalized: boolean;
  withdrawTokenAmount?: TokenBalance;
  canFinalize?: boolean;
}

export interface AccountDefinition {
  /** Address of the account */
  address: string;
  /** Network this account definition is associated with */
  network: Network;
  /** If the account is a contract */
  isContract: boolean;
  /** Balances may include external wallet balances */
  balances: TokenBalance[];
  /** Stores the last update time for vault positions, used to calculate prime debt fees */
  vaultLastUpdateTime?: Map<string, number>;
  /** Current profit and loss on every given balance */
  balanceStatement?: BalanceStatement[];
  /** Any transactions that have included transfers to this account */
  accountHistory?: AccountHistory[];
  /** Specific allowances tracked for user interface purposes */
  allowances?: Allowance[];
  systemAccountType?: SystemAccount;
  stakeNOTEStatus?: StakeNoteStatus;
  historicalBalances?: HistoricalBalance[];
  rewardClaims?: Record<string, TokenBalance[]>;
  lendingRouterApprovals?: Record<string, boolean>;
  withdrawRequests?: Map<string, WithdrawRequest[]>;
}

/** ERC20 allowances tracked for UI purposes */
export interface Allowance {
  spender: string;
  amount: TokenBalance;
}

export interface CacheSchema<T> {
  values: Array<[string, T | null]>;
  network: Network;
  lastUpdateTimestamp: number;
  lastUpdateBlock: number;
}

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
  incentiveAPY?: number;
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

export type PriceChange = Instance<typeof PriceChangeModel> & {
  currentFiat: TokenBalance;
  fiatChange: number;
  underlyingChange?: number;
};

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

export const PRICE_ORACLES = [
  'sNOTE',
  'Chainlink',
  'VaultShareOracleRate',
  'BorrowShareOracleRate',
  'sNOTEToETHExchangeRate',
  'WithdrawTokenExchangeRate',
];
