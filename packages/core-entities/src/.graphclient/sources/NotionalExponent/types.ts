// @ts-nocheck

import { InContextSdkMethod } from '@graphql-mesh/types';
import { MeshContext } from '@graphql-mesh/runtime';

export namespace NotionalExponentTypes {
  export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  BigDecimal: { input: any; output: any; }
  BigInt: { input: any; output: any; }
  Bytes: { input: any; output: any; }
  Int8: { input: any; output: any; }
  Timestamp: { input: any; output: any; }
};

export type Account = {
  /** Address of Account */
  id: Scalars['ID']['output'];
  firstUpdateBlockNumber: Scalars['BigInt']['output'];
  firstUpdateTimestamp: Scalars['Int']['output'];
  firstUpdateTransactionHash: Scalars['Bytes']['output'];
  lastUpdateBlockNumber: Scalars['BigInt']['output'];
  lastUpdateTimestamp: Scalars['Int']['output'];
  lastUpdateTransactionHash: Scalars['Bytes']['output'];
  systemAccountType: SystemAccount;
  /** All current balances linked to this account */
  balances?: Maybe<Array<Balance>>;
  profitLossLineItems?: Maybe<Array<ProfitLossLineItem>>;
};


export type AccountbalancesArgs = {
  skip?: InputMaybe<Scalars['Int']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Balance_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<Balance_filter>;
};


export type AccountprofitLossLineItemsArgs = {
  skip?: InputMaybe<Scalars['Int']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<ProfitLossLineItem_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<ProfitLossLineItem_filter>;
};

export type Account_filter = {
  id?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  firstUpdateBlockNumber?: InputMaybe<Scalars['BigInt']['input']>;
  firstUpdateBlockNumber_not?: InputMaybe<Scalars['BigInt']['input']>;
  firstUpdateBlockNumber_gt?: InputMaybe<Scalars['BigInt']['input']>;
  firstUpdateBlockNumber_lt?: InputMaybe<Scalars['BigInt']['input']>;
  firstUpdateBlockNumber_gte?: InputMaybe<Scalars['BigInt']['input']>;
  firstUpdateBlockNumber_lte?: InputMaybe<Scalars['BigInt']['input']>;
  firstUpdateBlockNumber_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  firstUpdateBlockNumber_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  firstUpdateTimestamp?: InputMaybe<Scalars['Int']['input']>;
  firstUpdateTimestamp_not?: InputMaybe<Scalars['Int']['input']>;
  firstUpdateTimestamp_gt?: InputMaybe<Scalars['Int']['input']>;
  firstUpdateTimestamp_lt?: InputMaybe<Scalars['Int']['input']>;
  firstUpdateTimestamp_gte?: InputMaybe<Scalars['Int']['input']>;
  firstUpdateTimestamp_lte?: InputMaybe<Scalars['Int']['input']>;
  firstUpdateTimestamp_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  firstUpdateTimestamp_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  firstUpdateTransactionHash?: InputMaybe<Scalars['Bytes']['input']>;
  firstUpdateTransactionHash_not?: InputMaybe<Scalars['Bytes']['input']>;
  firstUpdateTransactionHash_gt?: InputMaybe<Scalars['Bytes']['input']>;
  firstUpdateTransactionHash_lt?: InputMaybe<Scalars['Bytes']['input']>;
  firstUpdateTransactionHash_gte?: InputMaybe<Scalars['Bytes']['input']>;
  firstUpdateTransactionHash_lte?: InputMaybe<Scalars['Bytes']['input']>;
  firstUpdateTransactionHash_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  firstUpdateTransactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  firstUpdateTransactionHash_contains?: InputMaybe<Scalars['Bytes']['input']>;
  firstUpdateTransactionHash_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  lastUpdateBlockNumber?: InputMaybe<Scalars['BigInt']['input']>;
  lastUpdateBlockNumber_not?: InputMaybe<Scalars['BigInt']['input']>;
  lastUpdateBlockNumber_gt?: InputMaybe<Scalars['BigInt']['input']>;
  lastUpdateBlockNumber_lt?: InputMaybe<Scalars['BigInt']['input']>;
  lastUpdateBlockNumber_gte?: InputMaybe<Scalars['BigInt']['input']>;
  lastUpdateBlockNumber_lte?: InputMaybe<Scalars['BigInt']['input']>;
  lastUpdateBlockNumber_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  lastUpdateBlockNumber_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  lastUpdateTimestamp?: InputMaybe<Scalars['Int']['input']>;
  lastUpdateTimestamp_not?: InputMaybe<Scalars['Int']['input']>;
  lastUpdateTimestamp_gt?: InputMaybe<Scalars['Int']['input']>;
  lastUpdateTimestamp_lt?: InputMaybe<Scalars['Int']['input']>;
  lastUpdateTimestamp_gte?: InputMaybe<Scalars['Int']['input']>;
  lastUpdateTimestamp_lte?: InputMaybe<Scalars['Int']['input']>;
  lastUpdateTimestamp_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  lastUpdateTimestamp_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  lastUpdateTransactionHash?: InputMaybe<Scalars['Bytes']['input']>;
  lastUpdateTransactionHash_not?: InputMaybe<Scalars['Bytes']['input']>;
  lastUpdateTransactionHash_gt?: InputMaybe<Scalars['Bytes']['input']>;
  lastUpdateTransactionHash_lt?: InputMaybe<Scalars['Bytes']['input']>;
  lastUpdateTransactionHash_gte?: InputMaybe<Scalars['Bytes']['input']>;
  lastUpdateTransactionHash_lte?: InputMaybe<Scalars['Bytes']['input']>;
  lastUpdateTransactionHash_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  lastUpdateTransactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  lastUpdateTransactionHash_contains?: InputMaybe<Scalars['Bytes']['input']>;
  lastUpdateTransactionHash_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  systemAccountType?: InputMaybe<SystemAccount>;
  systemAccountType_not?: InputMaybe<SystemAccount>;
  systemAccountType_in?: InputMaybe<Array<SystemAccount>>;
  systemAccountType_not_in?: InputMaybe<Array<SystemAccount>>;
  balances_?: InputMaybe<Balance_filter>;
  profitLossLineItems_?: InputMaybe<ProfitLossLineItem_filter>;
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<Account_filter>>>;
  or?: InputMaybe<Array<InputMaybe<Account_filter>>>;
};

export type Account_orderBy =
  | 'id'
  | 'firstUpdateBlockNumber'
  | 'firstUpdateTimestamp'
  | 'firstUpdateTransactionHash'
  | 'lastUpdateBlockNumber'
  | 'lastUpdateTimestamp'
  | 'lastUpdateTransactionHash'
  | 'systemAccountType'
  | 'balances'
  | 'profitLossLineItems';

/** Indicates whether the current, partially filled bucket should be included in the response. Defaults to `exclude` */
export type Aggregation_current =
  /** Exclude the current, partially filled bucket from the response */
  | 'exclude'
  /** Include the current, partially filled bucket in the response */
  | 'include';

export type Aggregation_interval =
  | 'hour'
  | 'day';

export type Balance = {
  /** Account:Token ID */
  id: Scalars['ID']['output'];
  /** Link back to the token */
  token: Token;
  /** Address of the account that holds this balance */
  account: Account;
  firstUpdateBlockNumber: Scalars['BigInt']['output'];
  firstUpdateTimestamp: Scalars['Int']['output'];
  firstUpdateTransactionHash: Scalars['Bytes']['output'];
  lastUpdateBlockNumber: Scalars['BigInt']['output'];
  lastUpdateTimestamp: Scalars['Int']['output'];
  lastUpdateTransactionHash: Scalars['Bytes']['output'];
  current: BalanceSnapshot;
  lendingRouter?: Maybe<LendingRouter>;
  _lastIncentiveSnapshotBlockNumber?: Maybe<Scalars['BigInt']['output']>;
  /** Link to the withdraw requests that this balance is associated with */
  withdrawRequest?: Maybe<Array<WithdrawRequest>>;
  snapshots?: Maybe<Array<BalanceSnapshot>>;
  incentives?: Maybe<Array<IncentiveSnapshot>>;
};


export type BalancewithdrawRequestArgs = {
  skip?: InputMaybe<Scalars['Int']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<WithdrawRequest_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<WithdrawRequest_filter>;
};


export type BalancesnapshotsArgs = {
  skip?: InputMaybe<Scalars['Int']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<BalanceSnapshot_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<BalanceSnapshot_filter>;
};


export type BalanceincentivesArgs = {
  skip?: InputMaybe<Scalars['Int']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<IncentiveSnapshot_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<IncentiveSnapshot_filter>;
};

export type BalanceSnapshot = {
  /** Address of Account:ID of Token:Block Number */
  id: Scalars['ID']['output'];
  blockNumber: Scalars['BigInt']['output'];
  timestamp: Scalars['Int']['output'];
  transactionHash: Scalars['Bytes']['output'];
  /** Link to previous snapshot, if it exists */
  previousSnapshot?: Maybe<BalanceSnapshot>;
  /** Link to the balance entity for this token */
  balance: Balance;
  /** Current balance of the token at this block */
  currentBalance: Scalars['BigInt']['output'];
  /** Balance before this snapshot */
  previousBalance: Scalars['BigInt']['output'];
  /** Adjusted cost basis at this snapshot for the token */
  adjustedCostBasis: Scalars['BigInt']['output'];
  /** Current profit and loss at the snapshot */
  currentProfitAndLossAtSnapshot: Scalars['BigInt']['output'];
  /** Portion of the PnL due to interest accrual */
  totalInterestAccrualAtSnapshot: Scalars['BigInt']['output'];
  /** Portion of the PnL due to fees */
  totalVaultFeesAtSnapshot: Scalars['BigInt']['output'];
  /** Implied Fixed Rate for fCash balances */
  impliedFixedRate?: Maybe<Scalars['BigInt']['output']>;
  /** Cumulative balance used for internal PnL calculations */
  _accumulatedBalance: Scalars['BigInt']['output'];
  /** Cumulative realized cost for internal PnL calculations */
  _accumulatedCostRealized: Scalars['BigInt']['output'];
  /** Internal interest accumulator */
  _lastInterestAccumulator: Scalars['BigInt']['output'];
  /** Internal vault fee accumulator */
  _lastVaultFeeAccumulator: Scalars['BigInt']['output'];
  profitLossLineItems?: Maybe<Array<ProfitLossLineItem>>;
};


export type BalanceSnapshotprofitLossLineItemsArgs = {
  skip?: InputMaybe<Scalars['Int']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<ProfitLossLineItem_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<ProfitLossLineItem_filter>;
};

export type BalanceSnapshot_filter = {
  id?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  blockNumber?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_not?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_gt?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_lt?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_gte?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_lte?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  blockNumber_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  timestamp?: InputMaybe<Scalars['Int']['input']>;
  timestamp_not?: InputMaybe<Scalars['Int']['input']>;
  timestamp_gt?: InputMaybe<Scalars['Int']['input']>;
  timestamp_lt?: InputMaybe<Scalars['Int']['input']>;
  timestamp_gte?: InputMaybe<Scalars['Int']['input']>;
  timestamp_lte?: InputMaybe<Scalars['Int']['input']>;
  timestamp_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  timestamp_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  transactionHash?: InputMaybe<Scalars['Bytes']['input']>;
  transactionHash_not?: InputMaybe<Scalars['Bytes']['input']>;
  transactionHash_gt?: InputMaybe<Scalars['Bytes']['input']>;
  transactionHash_lt?: InputMaybe<Scalars['Bytes']['input']>;
  transactionHash_gte?: InputMaybe<Scalars['Bytes']['input']>;
  transactionHash_lte?: InputMaybe<Scalars['Bytes']['input']>;
  transactionHash_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  transactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  transactionHash_contains?: InputMaybe<Scalars['Bytes']['input']>;
  transactionHash_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  previousSnapshot?: InputMaybe<Scalars['String']['input']>;
  previousSnapshot_not?: InputMaybe<Scalars['String']['input']>;
  previousSnapshot_gt?: InputMaybe<Scalars['String']['input']>;
  previousSnapshot_lt?: InputMaybe<Scalars['String']['input']>;
  previousSnapshot_gte?: InputMaybe<Scalars['String']['input']>;
  previousSnapshot_lte?: InputMaybe<Scalars['String']['input']>;
  previousSnapshot_in?: InputMaybe<Array<Scalars['String']['input']>>;
  previousSnapshot_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  previousSnapshot_contains?: InputMaybe<Scalars['String']['input']>;
  previousSnapshot_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  previousSnapshot_not_contains?: InputMaybe<Scalars['String']['input']>;
  previousSnapshot_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  previousSnapshot_starts_with?: InputMaybe<Scalars['String']['input']>;
  previousSnapshot_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  previousSnapshot_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  previousSnapshot_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  previousSnapshot_ends_with?: InputMaybe<Scalars['String']['input']>;
  previousSnapshot_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  previousSnapshot_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  previousSnapshot_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  previousSnapshot_?: InputMaybe<BalanceSnapshot_filter>;
  balance?: InputMaybe<Scalars['String']['input']>;
  balance_not?: InputMaybe<Scalars['String']['input']>;
  balance_gt?: InputMaybe<Scalars['String']['input']>;
  balance_lt?: InputMaybe<Scalars['String']['input']>;
  balance_gte?: InputMaybe<Scalars['String']['input']>;
  balance_lte?: InputMaybe<Scalars['String']['input']>;
  balance_in?: InputMaybe<Array<Scalars['String']['input']>>;
  balance_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  balance_contains?: InputMaybe<Scalars['String']['input']>;
  balance_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  balance_not_contains?: InputMaybe<Scalars['String']['input']>;
  balance_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  balance_starts_with?: InputMaybe<Scalars['String']['input']>;
  balance_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  balance_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  balance_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  balance_ends_with?: InputMaybe<Scalars['String']['input']>;
  balance_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  balance_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  balance_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  balance_?: InputMaybe<Balance_filter>;
  currentBalance?: InputMaybe<Scalars['BigInt']['input']>;
  currentBalance_not?: InputMaybe<Scalars['BigInt']['input']>;
  currentBalance_gt?: InputMaybe<Scalars['BigInt']['input']>;
  currentBalance_lt?: InputMaybe<Scalars['BigInt']['input']>;
  currentBalance_gte?: InputMaybe<Scalars['BigInt']['input']>;
  currentBalance_lte?: InputMaybe<Scalars['BigInt']['input']>;
  currentBalance_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  currentBalance_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  previousBalance?: InputMaybe<Scalars['BigInt']['input']>;
  previousBalance_not?: InputMaybe<Scalars['BigInt']['input']>;
  previousBalance_gt?: InputMaybe<Scalars['BigInt']['input']>;
  previousBalance_lt?: InputMaybe<Scalars['BigInt']['input']>;
  previousBalance_gte?: InputMaybe<Scalars['BigInt']['input']>;
  previousBalance_lte?: InputMaybe<Scalars['BigInt']['input']>;
  previousBalance_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  previousBalance_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  adjustedCostBasis?: InputMaybe<Scalars['BigInt']['input']>;
  adjustedCostBasis_not?: InputMaybe<Scalars['BigInt']['input']>;
  adjustedCostBasis_gt?: InputMaybe<Scalars['BigInt']['input']>;
  adjustedCostBasis_lt?: InputMaybe<Scalars['BigInt']['input']>;
  adjustedCostBasis_gte?: InputMaybe<Scalars['BigInt']['input']>;
  adjustedCostBasis_lte?: InputMaybe<Scalars['BigInt']['input']>;
  adjustedCostBasis_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  adjustedCostBasis_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  currentProfitAndLossAtSnapshot?: InputMaybe<Scalars['BigInt']['input']>;
  currentProfitAndLossAtSnapshot_not?: InputMaybe<Scalars['BigInt']['input']>;
  currentProfitAndLossAtSnapshot_gt?: InputMaybe<Scalars['BigInt']['input']>;
  currentProfitAndLossAtSnapshot_lt?: InputMaybe<Scalars['BigInt']['input']>;
  currentProfitAndLossAtSnapshot_gte?: InputMaybe<Scalars['BigInt']['input']>;
  currentProfitAndLossAtSnapshot_lte?: InputMaybe<Scalars['BigInt']['input']>;
  currentProfitAndLossAtSnapshot_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  currentProfitAndLossAtSnapshot_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  totalInterestAccrualAtSnapshot?: InputMaybe<Scalars['BigInt']['input']>;
  totalInterestAccrualAtSnapshot_not?: InputMaybe<Scalars['BigInt']['input']>;
  totalInterestAccrualAtSnapshot_gt?: InputMaybe<Scalars['BigInt']['input']>;
  totalInterestAccrualAtSnapshot_lt?: InputMaybe<Scalars['BigInt']['input']>;
  totalInterestAccrualAtSnapshot_gte?: InputMaybe<Scalars['BigInt']['input']>;
  totalInterestAccrualAtSnapshot_lte?: InputMaybe<Scalars['BigInt']['input']>;
  totalInterestAccrualAtSnapshot_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  totalInterestAccrualAtSnapshot_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  totalVaultFeesAtSnapshot?: InputMaybe<Scalars['BigInt']['input']>;
  totalVaultFeesAtSnapshot_not?: InputMaybe<Scalars['BigInt']['input']>;
  totalVaultFeesAtSnapshot_gt?: InputMaybe<Scalars['BigInt']['input']>;
  totalVaultFeesAtSnapshot_lt?: InputMaybe<Scalars['BigInt']['input']>;
  totalVaultFeesAtSnapshot_gte?: InputMaybe<Scalars['BigInt']['input']>;
  totalVaultFeesAtSnapshot_lte?: InputMaybe<Scalars['BigInt']['input']>;
  totalVaultFeesAtSnapshot_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  totalVaultFeesAtSnapshot_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  impliedFixedRate?: InputMaybe<Scalars['BigInt']['input']>;
  impliedFixedRate_not?: InputMaybe<Scalars['BigInt']['input']>;
  impliedFixedRate_gt?: InputMaybe<Scalars['BigInt']['input']>;
  impliedFixedRate_lt?: InputMaybe<Scalars['BigInt']['input']>;
  impliedFixedRate_gte?: InputMaybe<Scalars['BigInt']['input']>;
  impliedFixedRate_lte?: InputMaybe<Scalars['BigInt']['input']>;
  impliedFixedRate_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  impliedFixedRate_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  _accumulatedBalance?: InputMaybe<Scalars['BigInt']['input']>;
  _accumulatedBalance_not?: InputMaybe<Scalars['BigInt']['input']>;
  _accumulatedBalance_gt?: InputMaybe<Scalars['BigInt']['input']>;
  _accumulatedBalance_lt?: InputMaybe<Scalars['BigInt']['input']>;
  _accumulatedBalance_gte?: InputMaybe<Scalars['BigInt']['input']>;
  _accumulatedBalance_lte?: InputMaybe<Scalars['BigInt']['input']>;
  _accumulatedBalance_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  _accumulatedBalance_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  _accumulatedCostRealized?: InputMaybe<Scalars['BigInt']['input']>;
  _accumulatedCostRealized_not?: InputMaybe<Scalars['BigInt']['input']>;
  _accumulatedCostRealized_gt?: InputMaybe<Scalars['BigInt']['input']>;
  _accumulatedCostRealized_lt?: InputMaybe<Scalars['BigInt']['input']>;
  _accumulatedCostRealized_gte?: InputMaybe<Scalars['BigInt']['input']>;
  _accumulatedCostRealized_lte?: InputMaybe<Scalars['BigInt']['input']>;
  _accumulatedCostRealized_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  _accumulatedCostRealized_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  _lastInterestAccumulator?: InputMaybe<Scalars['BigInt']['input']>;
  _lastInterestAccumulator_not?: InputMaybe<Scalars['BigInt']['input']>;
  _lastInterestAccumulator_gt?: InputMaybe<Scalars['BigInt']['input']>;
  _lastInterestAccumulator_lt?: InputMaybe<Scalars['BigInt']['input']>;
  _lastInterestAccumulator_gte?: InputMaybe<Scalars['BigInt']['input']>;
  _lastInterestAccumulator_lte?: InputMaybe<Scalars['BigInt']['input']>;
  _lastInterestAccumulator_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  _lastInterestAccumulator_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  _lastVaultFeeAccumulator?: InputMaybe<Scalars['BigInt']['input']>;
  _lastVaultFeeAccumulator_not?: InputMaybe<Scalars['BigInt']['input']>;
  _lastVaultFeeAccumulator_gt?: InputMaybe<Scalars['BigInt']['input']>;
  _lastVaultFeeAccumulator_lt?: InputMaybe<Scalars['BigInt']['input']>;
  _lastVaultFeeAccumulator_gte?: InputMaybe<Scalars['BigInt']['input']>;
  _lastVaultFeeAccumulator_lte?: InputMaybe<Scalars['BigInt']['input']>;
  _lastVaultFeeAccumulator_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  _lastVaultFeeAccumulator_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  profitLossLineItems_?: InputMaybe<ProfitLossLineItem_filter>;
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<BalanceSnapshot_filter>>>;
  or?: InputMaybe<Array<InputMaybe<BalanceSnapshot_filter>>>;
};

export type BalanceSnapshot_orderBy =
  | 'id'
  | 'blockNumber'
  | 'timestamp'
  | 'transactionHash'
  | 'previousSnapshot'
  | 'previousSnapshot__id'
  | 'previousSnapshot__blockNumber'
  | 'previousSnapshot__timestamp'
  | 'previousSnapshot__transactionHash'
  | 'previousSnapshot__currentBalance'
  | 'previousSnapshot__previousBalance'
  | 'previousSnapshot__adjustedCostBasis'
  | 'previousSnapshot__currentProfitAndLossAtSnapshot'
  | 'previousSnapshot__totalInterestAccrualAtSnapshot'
  | 'previousSnapshot__totalVaultFeesAtSnapshot'
  | 'previousSnapshot__impliedFixedRate'
  | 'previousSnapshot___accumulatedBalance'
  | 'previousSnapshot___accumulatedCostRealized'
  | 'previousSnapshot___lastInterestAccumulator'
  | 'previousSnapshot___lastVaultFeeAccumulator'
  | 'balance'
  | 'balance__id'
  | 'balance__firstUpdateBlockNumber'
  | 'balance__firstUpdateTimestamp'
  | 'balance__firstUpdateTransactionHash'
  | 'balance__lastUpdateBlockNumber'
  | 'balance__lastUpdateTimestamp'
  | 'balance__lastUpdateTransactionHash'
  | 'balance___lastIncentiveSnapshotBlockNumber'
  | 'currentBalance'
  | 'previousBalance'
  | 'adjustedCostBasis'
  | 'currentProfitAndLossAtSnapshot'
  | 'totalInterestAccrualAtSnapshot'
  | 'totalVaultFeesAtSnapshot'
  | 'impliedFixedRate'
  | '_accumulatedBalance'
  | '_accumulatedCostRealized'
  | '_lastInterestAccumulator'
  | '_lastVaultFeeAccumulator'
  | 'profitLossLineItems';

export type Balance_filter = {
  id?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  token?: InputMaybe<Scalars['String']['input']>;
  token_not?: InputMaybe<Scalars['String']['input']>;
  token_gt?: InputMaybe<Scalars['String']['input']>;
  token_lt?: InputMaybe<Scalars['String']['input']>;
  token_gte?: InputMaybe<Scalars['String']['input']>;
  token_lte?: InputMaybe<Scalars['String']['input']>;
  token_in?: InputMaybe<Array<Scalars['String']['input']>>;
  token_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  token_contains?: InputMaybe<Scalars['String']['input']>;
  token_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  token_not_contains?: InputMaybe<Scalars['String']['input']>;
  token_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  token_starts_with?: InputMaybe<Scalars['String']['input']>;
  token_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  token_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  token_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  token_ends_with?: InputMaybe<Scalars['String']['input']>;
  token_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  token_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  token_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  token_?: InputMaybe<Token_filter>;
  account?: InputMaybe<Scalars['String']['input']>;
  account_not?: InputMaybe<Scalars['String']['input']>;
  account_gt?: InputMaybe<Scalars['String']['input']>;
  account_lt?: InputMaybe<Scalars['String']['input']>;
  account_gte?: InputMaybe<Scalars['String']['input']>;
  account_lte?: InputMaybe<Scalars['String']['input']>;
  account_in?: InputMaybe<Array<Scalars['String']['input']>>;
  account_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  account_contains?: InputMaybe<Scalars['String']['input']>;
  account_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  account_not_contains?: InputMaybe<Scalars['String']['input']>;
  account_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  account_starts_with?: InputMaybe<Scalars['String']['input']>;
  account_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  account_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  account_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  account_ends_with?: InputMaybe<Scalars['String']['input']>;
  account_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  account_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  account_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  account_?: InputMaybe<Account_filter>;
  firstUpdateBlockNumber?: InputMaybe<Scalars['BigInt']['input']>;
  firstUpdateBlockNumber_not?: InputMaybe<Scalars['BigInt']['input']>;
  firstUpdateBlockNumber_gt?: InputMaybe<Scalars['BigInt']['input']>;
  firstUpdateBlockNumber_lt?: InputMaybe<Scalars['BigInt']['input']>;
  firstUpdateBlockNumber_gte?: InputMaybe<Scalars['BigInt']['input']>;
  firstUpdateBlockNumber_lte?: InputMaybe<Scalars['BigInt']['input']>;
  firstUpdateBlockNumber_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  firstUpdateBlockNumber_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  firstUpdateTimestamp?: InputMaybe<Scalars['Int']['input']>;
  firstUpdateTimestamp_not?: InputMaybe<Scalars['Int']['input']>;
  firstUpdateTimestamp_gt?: InputMaybe<Scalars['Int']['input']>;
  firstUpdateTimestamp_lt?: InputMaybe<Scalars['Int']['input']>;
  firstUpdateTimestamp_gte?: InputMaybe<Scalars['Int']['input']>;
  firstUpdateTimestamp_lte?: InputMaybe<Scalars['Int']['input']>;
  firstUpdateTimestamp_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  firstUpdateTimestamp_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  firstUpdateTransactionHash?: InputMaybe<Scalars['Bytes']['input']>;
  firstUpdateTransactionHash_not?: InputMaybe<Scalars['Bytes']['input']>;
  firstUpdateTransactionHash_gt?: InputMaybe<Scalars['Bytes']['input']>;
  firstUpdateTransactionHash_lt?: InputMaybe<Scalars['Bytes']['input']>;
  firstUpdateTransactionHash_gte?: InputMaybe<Scalars['Bytes']['input']>;
  firstUpdateTransactionHash_lte?: InputMaybe<Scalars['Bytes']['input']>;
  firstUpdateTransactionHash_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  firstUpdateTransactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  firstUpdateTransactionHash_contains?: InputMaybe<Scalars['Bytes']['input']>;
  firstUpdateTransactionHash_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  lastUpdateBlockNumber?: InputMaybe<Scalars['BigInt']['input']>;
  lastUpdateBlockNumber_not?: InputMaybe<Scalars['BigInt']['input']>;
  lastUpdateBlockNumber_gt?: InputMaybe<Scalars['BigInt']['input']>;
  lastUpdateBlockNumber_lt?: InputMaybe<Scalars['BigInt']['input']>;
  lastUpdateBlockNumber_gte?: InputMaybe<Scalars['BigInt']['input']>;
  lastUpdateBlockNumber_lte?: InputMaybe<Scalars['BigInt']['input']>;
  lastUpdateBlockNumber_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  lastUpdateBlockNumber_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  lastUpdateTimestamp?: InputMaybe<Scalars['Int']['input']>;
  lastUpdateTimestamp_not?: InputMaybe<Scalars['Int']['input']>;
  lastUpdateTimestamp_gt?: InputMaybe<Scalars['Int']['input']>;
  lastUpdateTimestamp_lt?: InputMaybe<Scalars['Int']['input']>;
  lastUpdateTimestamp_gte?: InputMaybe<Scalars['Int']['input']>;
  lastUpdateTimestamp_lte?: InputMaybe<Scalars['Int']['input']>;
  lastUpdateTimestamp_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  lastUpdateTimestamp_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  lastUpdateTransactionHash?: InputMaybe<Scalars['Bytes']['input']>;
  lastUpdateTransactionHash_not?: InputMaybe<Scalars['Bytes']['input']>;
  lastUpdateTransactionHash_gt?: InputMaybe<Scalars['Bytes']['input']>;
  lastUpdateTransactionHash_lt?: InputMaybe<Scalars['Bytes']['input']>;
  lastUpdateTransactionHash_gte?: InputMaybe<Scalars['Bytes']['input']>;
  lastUpdateTransactionHash_lte?: InputMaybe<Scalars['Bytes']['input']>;
  lastUpdateTransactionHash_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  lastUpdateTransactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  lastUpdateTransactionHash_contains?: InputMaybe<Scalars['Bytes']['input']>;
  lastUpdateTransactionHash_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  current?: InputMaybe<Scalars['String']['input']>;
  current_not?: InputMaybe<Scalars['String']['input']>;
  current_gt?: InputMaybe<Scalars['String']['input']>;
  current_lt?: InputMaybe<Scalars['String']['input']>;
  current_gte?: InputMaybe<Scalars['String']['input']>;
  current_lte?: InputMaybe<Scalars['String']['input']>;
  current_in?: InputMaybe<Array<Scalars['String']['input']>>;
  current_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  current_contains?: InputMaybe<Scalars['String']['input']>;
  current_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  current_not_contains?: InputMaybe<Scalars['String']['input']>;
  current_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  current_starts_with?: InputMaybe<Scalars['String']['input']>;
  current_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  current_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  current_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  current_ends_with?: InputMaybe<Scalars['String']['input']>;
  current_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  current_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  current_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  current_?: InputMaybe<BalanceSnapshot_filter>;
  lendingRouter?: InputMaybe<Scalars['String']['input']>;
  lendingRouter_not?: InputMaybe<Scalars['String']['input']>;
  lendingRouter_gt?: InputMaybe<Scalars['String']['input']>;
  lendingRouter_lt?: InputMaybe<Scalars['String']['input']>;
  lendingRouter_gte?: InputMaybe<Scalars['String']['input']>;
  lendingRouter_lte?: InputMaybe<Scalars['String']['input']>;
  lendingRouter_in?: InputMaybe<Array<Scalars['String']['input']>>;
  lendingRouter_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  lendingRouter_contains?: InputMaybe<Scalars['String']['input']>;
  lendingRouter_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  lendingRouter_not_contains?: InputMaybe<Scalars['String']['input']>;
  lendingRouter_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  lendingRouter_starts_with?: InputMaybe<Scalars['String']['input']>;
  lendingRouter_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  lendingRouter_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  lendingRouter_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  lendingRouter_ends_with?: InputMaybe<Scalars['String']['input']>;
  lendingRouter_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  lendingRouter_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  lendingRouter_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  lendingRouter_?: InputMaybe<LendingRouter_filter>;
  _lastIncentiveSnapshotBlockNumber?: InputMaybe<Scalars['BigInt']['input']>;
  _lastIncentiveSnapshotBlockNumber_not?: InputMaybe<Scalars['BigInt']['input']>;
  _lastIncentiveSnapshotBlockNumber_gt?: InputMaybe<Scalars['BigInt']['input']>;
  _lastIncentiveSnapshotBlockNumber_lt?: InputMaybe<Scalars['BigInt']['input']>;
  _lastIncentiveSnapshotBlockNumber_gte?: InputMaybe<Scalars['BigInt']['input']>;
  _lastIncentiveSnapshotBlockNumber_lte?: InputMaybe<Scalars['BigInt']['input']>;
  _lastIncentiveSnapshotBlockNumber_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  _lastIncentiveSnapshotBlockNumber_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  withdrawRequest?: InputMaybe<Array<Scalars['String']['input']>>;
  withdrawRequest_not?: InputMaybe<Array<Scalars['String']['input']>>;
  withdrawRequest_contains?: InputMaybe<Array<Scalars['String']['input']>>;
  withdrawRequest_contains_nocase?: InputMaybe<Array<Scalars['String']['input']>>;
  withdrawRequest_not_contains?: InputMaybe<Array<Scalars['String']['input']>>;
  withdrawRequest_not_contains_nocase?: InputMaybe<Array<Scalars['String']['input']>>;
  withdrawRequest_?: InputMaybe<WithdrawRequest_filter>;
  snapshots_?: InputMaybe<BalanceSnapshot_filter>;
  incentives_?: InputMaybe<IncentiveSnapshot_filter>;
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<Balance_filter>>>;
  or?: InputMaybe<Array<InputMaybe<Balance_filter>>>;
};

export type Balance_orderBy =
  | 'id'
  | 'token'
  | 'token__id'
  | 'token__firstUpdateBlockNumber'
  | 'token__firstUpdateTimestamp'
  | 'token__firstUpdateTransactionHash'
  | 'token__lastUpdateBlockNumber'
  | 'token__lastUpdateTimestamp'
  | 'token__lastUpdateTransactionHash'
  | 'token__tokenType'
  | 'token__tokenInterface'
  | 'token__name'
  | 'token__symbol'
  | 'token__decimals'
  | 'token__precision'
  | 'token__totalSupply'
  | 'token__maturity'
  | 'token__tokenAddress'
  | 'account'
  | 'account__id'
  | 'account__firstUpdateBlockNumber'
  | 'account__firstUpdateTimestamp'
  | 'account__firstUpdateTransactionHash'
  | 'account__lastUpdateBlockNumber'
  | 'account__lastUpdateTimestamp'
  | 'account__lastUpdateTransactionHash'
  | 'account__systemAccountType'
  | 'firstUpdateBlockNumber'
  | 'firstUpdateTimestamp'
  | 'firstUpdateTransactionHash'
  | 'lastUpdateBlockNumber'
  | 'lastUpdateTimestamp'
  | 'lastUpdateTransactionHash'
  | 'current'
  | 'current__id'
  | 'current__blockNumber'
  | 'current__timestamp'
  | 'current__transactionHash'
  | 'current__currentBalance'
  | 'current__previousBalance'
  | 'current__adjustedCostBasis'
  | 'current__currentProfitAndLossAtSnapshot'
  | 'current__totalInterestAccrualAtSnapshot'
  | 'current__totalVaultFeesAtSnapshot'
  | 'current__impliedFixedRate'
  | 'current___accumulatedBalance'
  | 'current___accumulatedCostRealized'
  | 'current___lastInterestAccumulator'
  | 'current___lastVaultFeeAccumulator'
  | 'lendingRouter'
  | 'lendingRouter__id'
  | 'lendingRouter__firstUpdateBlockNumber'
  | 'lendingRouter__firstUpdateTimestamp'
  | 'lendingRouter__firstUpdateTransactionHash'
  | 'lendingRouter__lastUpdateBlockNumber'
  | 'lendingRouter__lastUpdateTimestamp'
  | 'lendingRouter__lastUpdateTransactionHash'
  | 'lendingRouter__name'
  | '_lastIncentiveSnapshotBlockNumber'
  | 'withdrawRequest'
  | 'snapshots'
  | 'incentives';

export type BlockChangedFilter = {
  number_gte: Scalars['Int']['input'];
};

export type Block_height = {
  hash?: InputMaybe<Scalars['Bytes']['input']>;
  number?: InputMaybe<Scalars['Int']['input']>;
  number_gte?: InputMaybe<Scalars['Int']['input']>;
};

export type DEX =
  | '_UNUSED'
  | 'UNISWAP_V2'
  | 'UNISWAP_V3'
  | 'ZERO_EX'
  | 'BALANCER_V2'
  | 'CURVE'
  | 'NOTIONAL_VAULT'
  | 'CURVE_V2';

export type ExchangeRate = {
  /** External Oracle ID:Timestamp */
  id: Scalars['ID']['output'];
  blockNumber: Scalars['BigInt']['output'];
  timestamp: Scalars['Timestamp']['output'];
  oracle: Oracle;
  rate: Scalars['BigInt']['output'];
  totalSupply?: Maybe<Scalars['BigInt']['output']>;
};

export type ExchangeRate_filter = {
  id?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  blockNumber?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_not?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_gt?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_lt?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_gte?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_lte?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  blockNumber_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  timestamp?: InputMaybe<Scalars['Timestamp']['input']>;
  timestamp_not?: InputMaybe<Scalars['Timestamp']['input']>;
  timestamp_gt?: InputMaybe<Scalars['Timestamp']['input']>;
  timestamp_lt?: InputMaybe<Scalars['Timestamp']['input']>;
  timestamp_gte?: InputMaybe<Scalars['Timestamp']['input']>;
  timestamp_lte?: InputMaybe<Scalars['Timestamp']['input']>;
  timestamp_in?: InputMaybe<Array<Scalars['Timestamp']['input']>>;
  timestamp_not_in?: InputMaybe<Array<Scalars['Timestamp']['input']>>;
  oracle?: InputMaybe<Scalars['String']['input']>;
  oracle_not?: InputMaybe<Scalars['String']['input']>;
  oracle_gt?: InputMaybe<Scalars['String']['input']>;
  oracle_lt?: InputMaybe<Scalars['String']['input']>;
  oracle_gte?: InputMaybe<Scalars['String']['input']>;
  oracle_lte?: InputMaybe<Scalars['String']['input']>;
  oracle_in?: InputMaybe<Array<Scalars['String']['input']>>;
  oracle_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  oracle_contains?: InputMaybe<Scalars['String']['input']>;
  oracle_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  oracle_not_contains?: InputMaybe<Scalars['String']['input']>;
  oracle_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  oracle_starts_with?: InputMaybe<Scalars['String']['input']>;
  oracle_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  oracle_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  oracle_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  oracle_ends_with?: InputMaybe<Scalars['String']['input']>;
  oracle_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  oracle_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  oracle_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  oracle_?: InputMaybe<Oracle_filter>;
  rate?: InputMaybe<Scalars['BigInt']['input']>;
  rate_not?: InputMaybe<Scalars['BigInt']['input']>;
  rate_gt?: InputMaybe<Scalars['BigInt']['input']>;
  rate_lt?: InputMaybe<Scalars['BigInt']['input']>;
  rate_gte?: InputMaybe<Scalars['BigInt']['input']>;
  rate_lte?: InputMaybe<Scalars['BigInt']['input']>;
  rate_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  rate_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  totalSupply?: InputMaybe<Scalars['BigInt']['input']>;
  totalSupply_not?: InputMaybe<Scalars['BigInt']['input']>;
  totalSupply_gt?: InputMaybe<Scalars['BigInt']['input']>;
  totalSupply_lt?: InputMaybe<Scalars['BigInt']['input']>;
  totalSupply_gte?: InputMaybe<Scalars['BigInt']['input']>;
  totalSupply_lte?: InputMaybe<Scalars['BigInt']['input']>;
  totalSupply_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  totalSupply_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<ExchangeRate_filter>>>;
  or?: InputMaybe<Array<InputMaybe<ExchangeRate_filter>>>;
};

export type ExchangeRate_orderBy =
  | 'id'
  | 'blockNumber'
  | 'timestamp'
  | 'oracle'
  | 'oracle__id'
  | 'oracle__lastUpdateBlockNumber'
  | 'oracle__lastUpdateTimestamp'
  | 'oracle__lastUpdateTransactionHash'
  | 'oracle__decimals'
  | 'oracle__ratePrecision'
  | 'oracle__oracleAddress'
  | 'oracle__oracleType'
  | 'oracle__mustInvert'
  | 'oracle__latestRate'
  | 'oracle__matured'
  | 'rate'
  | 'totalSupply';

export type IncentiveSnapshot = {
  /** Balance Snapshot ID:Reward Token */
  id: Scalars['ID']['output'];
  blockNumber: Scalars['BigInt']['output'];
  timestamp: Scalars['Int']['output'];
  transactionHash: Scalars['Bytes']['output'];
  /** Address of the account that holds this balance */
  account: Account;
  /** Link back to the balance for this secondary incentive */
  balance: Balance;
  /** Link back to the previous incentive snapshot */
  previousIncentiveSnapshot?: Maybe<IncentiveSnapshot>;
  /** Reward token associated with this snapshot */
  rewardToken: Token;
  /** Total reward accrued over the lifetime of this balance */
  totalClaimed: Scalars['BigInt']['output'];
  /** Reward earnings adjusted for balance changes */
  adjustedClaimed: Scalars['BigInt']['output'];
  /** Claimed amount in the current transaction */
  amountClaimed: Scalars['BigInt']['output'];
};

export type IncentiveSnapshot_filter = {
  id?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  blockNumber?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_not?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_gt?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_lt?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_gte?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_lte?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  blockNumber_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  timestamp?: InputMaybe<Scalars['Int']['input']>;
  timestamp_not?: InputMaybe<Scalars['Int']['input']>;
  timestamp_gt?: InputMaybe<Scalars['Int']['input']>;
  timestamp_lt?: InputMaybe<Scalars['Int']['input']>;
  timestamp_gte?: InputMaybe<Scalars['Int']['input']>;
  timestamp_lte?: InputMaybe<Scalars['Int']['input']>;
  timestamp_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  timestamp_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  transactionHash?: InputMaybe<Scalars['Bytes']['input']>;
  transactionHash_not?: InputMaybe<Scalars['Bytes']['input']>;
  transactionHash_gt?: InputMaybe<Scalars['Bytes']['input']>;
  transactionHash_lt?: InputMaybe<Scalars['Bytes']['input']>;
  transactionHash_gte?: InputMaybe<Scalars['Bytes']['input']>;
  transactionHash_lte?: InputMaybe<Scalars['Bytes']['input']>;
  transactionHash_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  transactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  transactionHash_contains?: InputMaybe<Scalars['Bytes']['input']>;
  transactionHash_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  account?: InputMaybe<Scalars['String']['input']>;
  account_not?: InputMaybe<Scalars['String']['input']>;
  account_gt?: InputMaybe<Scalars['String']['input']>;
  account_lt?: InputMaybe<Scalars['String']['input']>;
  account_gte?: InputMaybe<Scalars['String']['input']>;
  account_lte?: InputMaybe<Scalars['String']['input']>;
  account_in?: InputMaybe<Array<Scalars['String']['input']>>;
  account_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  account_contains?: InputMaybe<Scalars['String']['input']>;
  account_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  account_not_contains?: InputMaybe<Scalars['String']['input']>;
  account_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  account_starts_with?: InputMaybe<Scalars['String']['input']>;
  account_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  account_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  account_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  account_ends_with?: InputMaybe<Scalars['String']['input']>;
  account_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  account_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  account_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  account_?: InputMaybe<Account_filter>;
  balance?: InputMaybe<Scalars['String']['input']>;
  balance_not?: InputMaybe<Scalars['String']['input']>;
  balance_gt?: InputMaybe<Scalars['String']['input']>;
  balance_lt?: InputMaybe<Scalars['String']['input']>;
  balance_gte?: InputMaybe<Scalars['String']['input']>;
  balance_lte?: InputMaybe<Scalars['String']['input']>;
  balance_in?: InputMaybe<Array<Scalars['String']['input']>>;
  balance_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  balance_contains?: InputMaybe<Scalars['String']['input']>;
  balance_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  balance_not_contains?: InputMaybe<Scalars['String']['input']>;
  balance_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  balance_starts_with?: InputMaybe<Scalars['String']['input']>;
  balance_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  balance_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  balance_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  balance_ends_with?: InputMaybe<Scalars['String']['input']>;
  balance_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  balance_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  balance_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  balance_?: InputMaybe<Balance_filter>;
  previousIncentiveSnapshot?: InputMaybe<Scalars['String']['input']>;
  previousIncentiveSnapshot_not?: InputMaybe<Scalars['String']['input']>;
  previousIncentiveSnapshot_gt?: InputMaybe<Scalars['String']['input']>;
  previousIncentiveSnapshot_lt?: InputMaybe<Scalars['String']['input']>;
  previousIncentiveSnapshot_gte?: InputMaybe<Scalars['String']['input']>;
  previousIncentiveSnapshot_lte?: InputMaybe<Scalars['String']['input']>;
  previousIncentiveSnapshot_in?: InputMaybe<Array<Scalars['String']['input']>>;
  previousIncentiveSnapshot_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  previousIncentiveSnapshot_contains?: InputMaybe<Scalars['String']['input']>;
  previousIncentiveSnapshot_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  previousIncentiveSnapshot_not_contains?: InputMaybe<Scalars['String']['input']>;
  previousIncentiveSnapshot_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  previousIncentiveSnapshot_starts_with?: InputMaybe<Scalars['String']['input']>;
  previousIncentiveSnapshot_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  previousIncentiveSnapshot_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  previousIncentiveSnapshot_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  previousIncentiveSnapshot_ends_with?: InputMaybe<Scalars['String']['input']>;
  previousIncentiveSnapshot_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  previousIncentiveSnapshot_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  previousIncentiveSnapshot_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  previousIncentiveSnapshot_?: InputMaybe<IncentiveSnapshot_filter>;
  rewardToken?: InputMaybe<Scalars['String']['input']>;
  rewardToken_not?: InputMaybe<Scalars['String']['input']>;
  rewardToken_gt?: InputMaybe<Scalars['String']['input']>;
  rewardToken_lt?: InputMaybe<Scalars['String']['input']>;
  rewardToken_gte?: InputMaybe<Scalars['String']['input']>;
  rewardToken_lte?: InputMaybe<Scalars['String']['input']>;
  rewardToken_in?: InputMaybe<Array<Scalars['String']['input']>>;
  rewardToken_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  rewardToken_contains?: InputMaybe<Scalars['String']['input']>;
  rewardToken_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  rewardToken_not_contains?: InputMaybe<Scalars['String']['input']>;
  rewardToken_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  rewardToken_starts_with?: InputMaybe<Scalars['String']['input']>;
  rewardToken_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  rewardToken_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  rewardToken_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  rewardToken_ends_with?: InputMaybe<Scalars['String']['input']>;
  rewardToken_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  rewardToken_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  rewardToken_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  rewardToken_?: InputMaybe<Token_filter>;
  totalClaimed?: InputMaybe<Scalars['BigInt']['input']>;
  totalClaimed_not?: InputMaybe<Scalars['BigInt']['input']>;
  totalClaimed_gt?: InputMaybe<Scalars['BigInt']['input']>;
  totalClaimed_lt?: InputMaybe<Scalars['BigInt']['input']>;
  totalClaimed_gte?: InputMaybe<Scalars['BigInt']['input']>;
  totalClaimed_lte?: InputMaybe<Scalars['BigInt']['input']>;
  totalClaimed_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  totalClaimed_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  adjustedClaimed?: InputMaybe<Scalars['BigInt']['input']>;
  adjustedClaimed_not?: InputMaybe<Scalars['BigInt']['input']>;
  adjustedClaimed_gt?: InputMaybe<Scalars['BigInt']['input']>;
  adjustedClaimed_lt?: InputMaybe<Scalars['BigInt']['input']>;
  adjustedClaimed_gte?: InputMaybe<Scalars['BigInt']['input']>;
  adjustedClaimed_lte?: InputMaybe<Scalars['BigInt']['input']>;
  adjustedClaimed_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  adjustedClaimed_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  amountClaimed?: InputMaybe<Scalars['BigInt']['input']>;
  amountClaimed_not?: InputMaybe<Scalars['BigInt']['input']>;
  amountClaimed_gt?: InputMaybe<Scalars['BigInt']['input']>;
  amountClaimed_lt?: InputMaybe<Scalars['BigInt']['input']>;
  amountClaimed_gte?: InputMaybe<Scalars['BigInt']['input']>;
  amountClaimed_lte?: InputMaybe<Scalars['BigInt']['input']>;
  amountClaimed_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  amountClaimed_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<IncentiveSnapshot_filter>>>;
  or?: InputMaybe<Array<InputMaybe<IncentiveSnapshot_filter>>>;
};

export type IncentiveSnapshot_orderBy =
  | 'id'
  | 'blockNumber'
  | 'timestamp'
  | 'transactionHash'
  | 'account'
  | 'account__id'
  | 'account__firstUpdateBlockNumber'
  | 'account__firstUpdateTimestamp'
  | 'account__firstUpdateTransactionHash'
  | 'account__lastUpdateBlockNumber'
  | 'account__lastUpdateTimestamp'
  | 'account__lastUpdateTransactionHash'
  | 'account__systemAccountType'
  | 'balance'
  | 'balance__id'
  | 'balance__firstUpdateBlockNumber'
  | 'balance__firstUpdateTimestamp'
  | 'balance__firstUpdateTransactionHash'
  | 'balance__lastUpdateBlockNumber'
  | 'balance__lastUpdateTimestamp'
  | 'balance__lastUpdateTransactionHash'
  | 'balance___lastIncentiveSnapshotBlockNumber'
  | 'previousIncentiveSnapshot'
  | 'previousIncentiveSnapshot__id'
  | 'previousIncentiveSnapshot__blockNumber'
  | 'previousIncentiveSnapshot__timestamp'
  | 'previousIncentiveSnapshot__transactionHash'
  | 'previousIncentiveSnapshot__totalClaimed'
  | 'previousIncentiveSnapshot__adjustedClaimed'
  | 'previousIncentiveSnapshot__amountClaimed'
  | 'rewardToken'
  | 'rewardToken__id'
  | 'rewardToken__firstUpdateBlockNumber'
  | 'rewardToken__firstUpdateTimestamp'
  | 'rewardToken__firstUpdateTransactionHash'
  | 'rewardToken__lastUpdateBlockNumber'
  | 'rewardToken__lastUpdateTimestamp'
  | 'rewardToken__lastUpdateTransactionHash'
  | 'rewardToken__tokenType'
  | 'rewardToken__tokenInterface'
  | 'rewardToken__name'
  | 'rewardToken__symbol'
  | 'rewardToken__decimals'
  | 'rewardToken__precision'
  | 'rewardToken__totalSupply'
  | 'rewardToken__maturity'
  | 'rewardToken__tokenAddress'
  | 'totalClaimed'
  | 'adjustedClaimed'
  | 'amountClaimed';

export type LendingRouter = {
  id: Scalars['ID']['output'];
  firstUpdateBlockNumber: Scalars['BigInt']['output'];
  firstUpdateTimestamp: Scalars['Int']['output'];
  firstUpdateTransactionHash: Scalars['Bytes']['output'];
  lastUpdateBlockNumber: Scalars['BigInt']['output'];
  lastUpdateTimestamp: Scalars['Int']['output'];
  lastUpdateTransactionHash: Scalars['Bytes']['output'];
  name: Scalars['String']['output'];
  markets?: Maybe<Array<Market>>;
};


export type LendingRoutermarketsArgs = {
  skip?: InputMaybe<Scalars['Int']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Market_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<Market_filter>;
};

export type LendingRouter_filter = {
  id?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  firstUpdateBlockNumber?: InputMaybe<Scalars['BigInt']['input']>;
  firstUpdateBlockNumber_not?: InputMaybe<Scalars['BigInt']['input']>;
  firstUpdateBlockNumber_gt?: InputMaybe<Scalars['BigInt']['input']>;
  firstUpdateBlockNumber_lt?: InputMaybe<Scalars['BigInt']['input']>;
  firstUpdateBlockNumber_gte?: InputMaybe<Scalars['BigInt']['input']>;
  firstUpdateBlockNumber_lte?: InputMaybe<Scalars['BigInt']['input']>;
  firstUpdateBlockNumber_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  firstUpdateBlockNumber_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  firstUpdateTimestamp?: InputMaybe<Scalars['Int']['input']>;
  firstUpdateTimestamp_not?: InputMaybe<Scalars['Int']['input']>;
  firstUpdateTimestamp_gt?: InputMaybe<Scalars['Int']['input']>;
  firstUpdateTimestamp_lt?: InputMaybe<Scalars['Int']['input']>;
  firstUpdateTimestamp_gte?: InputMaybe<Scalars['Int']['input']>;
  firstUpdateTimestamp_lte?: InputMaybe<Scalars['Int']['input']>;
  firstUpdateTimestamp_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  firstUpdateTimestamp_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  firstUpdateTransactionHash?: InputMaybe<Scalars['Bytes']['input']>;
  firstUpdateTransactionHash_not?: InputMaybe<Scalars['Bytes']['input']>;
  firstUpdateTransactionHash_gt?: InputMaybe<Scalars['Bytes']['input']>;
  firstUpdateTransactionHash_lt?: InputMaybe<Scalars['Bytes']['input']>;
  firstUpdateTransactionHash_gte?: InputMaybe<Scalars['Bytes']['input']>;
  firstUpdateTransactionHash_lte?: InputMaybe<Scalars['Bytes']['input']>;
  firstUpdateTransactionHash_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  firstUpdateTransactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  firstUpdateTransactionHash_contains?: InputMaybe<Scalars['Bytes']['input']>;
  firstUpdateTransactionHash_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  lastUpdateBlockNumber?: InputMaybe<Scalars['BigInt']['input']>;
  lastUpdateBlockNumber_not?: InputMaybe<Scalars['BigInt']['input']>;
  lastUpdateBlockNumber_gt?: InputMaybe<Scalars['BigInt']['input']>;
  lastUpdateBlockNumber_lt?: InputMaybe<Scalars['BigInt']['input']>;
  lastUpdateBlockNumber_gte?: InputMaybe<Scalars['BigInt']['input']>;
  lastUpdateBlockNumber_lte?: InputMaybe<Scalars['BigInt']['input']>;
  lastUpdateBlockNumber_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  lastUpdateBlockNumber_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  lastUpdateTimestamp?: InputMaybe<Scalars['Int']['input']>;
  lastUpdateTimestamp_not?: InputMaybe<Scalars['Int']['input']>;
  lastUpdateTimestamp_gt?: InputMaybe<Scalars['Int']['input']>;
  lastUpdateTimestamp_lt?: InputMaybe<Scalars['Int']['input']>;
  lastUpdateTimestamp_gte?: InputMaybe<Scalars['Int']['input']>;
  lastUpdateTimestamp_lte?: InputMaybe<Scalars['Int']['input']>;
  lastUpdateTimestamp_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  lastUpdateTimestamp_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  lastUpdateTransactionHash?: InputMaybe<Scalars['Bytes']['input']>;
  lastUpdateTransactionHash_not?: InputMaybe<Scalars['Bytes']['input']>;
  lastUpdateTransactionHash_gt?: InputMaybe<Scalars['Bytes']['input']>;
  lastUpdateTransactionHash_lt?: InputMaybe<Scalars['Bytes']['input']>;
  lastUpdateTransactionHash_gte?: InputMaybe<Scalars['Bytes']['input']>;
  lastUpdateTransactionHash_lte?: InputMaybe<Scalars['Bytes']['input']>;
  lastUpdateTransactionHash_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  lastUpdateTransactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  lastUpdateTransactionHash_contains?: InputMaybe<Scalars['Bytes']['input']>;
  lastUpdateTransactionHash_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  name_not?: InputMaybe<Scalars['String']['input']>;
  name_gt?: InputMaybe<Scalars['String']['input']>;
  name_lt?: InputMaybe<Scalars['String']['input']>;
  name_gte?: InputMaybe<Scalars['String']['input']>;
  name_lte?: InputMaybe<Scalars['String']['input']>;
  name_in?: InputMaybe<Array<Scalars['String']['input']>>;
  name_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  name_contains?: InputMaybe<Scalars['String']['input']>;
  name_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  name_not_contains?: InputMaybe<Scalars['String']['input']>;
  name_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  name_starts_with?: InputMaybe<Scalars['String']['input']>;
  name_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  name_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  name_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  name_ends_with?: InputMaybe<Scalars['String']['input']>;
  name_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  name_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  name_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  markets_?: InputMaybe<Market_filter>;
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<LendingRouter_filter>>>;
  or?: InputMaybe<Array<InputMaybe<LendingRouter_filter>>>;
};

export type LendingRouter_orderBy =
  | 'id'
  | 'firstUpdateBlockNumber'
  | 'firstUpdateTimestamp'
  | 'firstUpdateTransactionHash'
  | 'lastUpdateBlockNumber'
  | 'lastUpdateTimestamp'
  | 'lastUpdateTransactionHash'
  | 'name'
  | 'markets';

export type LineItemType =
  | 'EnterPosition'
  | 'ExitPosition'
  | 'LiquidatePosition'
  | 'MigratePosition'
  | 'WithdrawRequest'
  | 'WithdrawRequestFinalized'
  | 'TradeExecution';

/** Only set on the first entry for a lending router / vault combination */
export type Market = {
  /** Vault:LendingRouter */
  id: Scalars['ID']['output'];
  firstUpdateBlockNumber: Scalars['BigInt']['output'];
  firstUpdateTimestamp: Scalars['Int']['output'];
  firstUpdateTransactionHash: Scalars['Bytes']['output'];
  lastUpdateBlockNumber: Scalars['BigInt']['output'];
  lastUpdateTimestamp: Scalars['Int']['output'];
  lastUpdateTransactionHash: Scalars['Bytes']['output'];
  lendingRouter: LendingRouter;
  vault: Vault;
  /** Generic abi-encoded params for the market */
  params: Scalars['Bytes']['output'];
};

export type Market_filter = {
  id?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  firstUpdateBlockNumber?: InputMaybe<Scalars['BigInt']['input']>;
  firstUpdateBlockNumber_not?: InputMaybe<Scalars['BigInt']['input']>;
  firstUpdateBlockNumber_gt?: InputMaybe<Scalars['BigInt']['input']>;
  firstUpdateBlockNumber_lt?: InputMaybe<Scalars['BigInt']['input']>;
  firstUpdateBlockNumber_gte?: InputMaybe<Scalars['BigInt']['input']>;
  firstUpdateBlockNumber_lte?: InputMaybe<Scalars['BigInt']['input']>;
  firstUpdateBlockNumber_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  firstUpdateBlockNumber_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  firstUpdateTimestamp?: InputMaybe<Scalars['Int']['input']>;
  firstUpdateTimestamp_not?: InputMaybe<Scalars['Int']['input']>;
  firstUpdateTimestamp_gt?: InputMaybe<Scalars['Int']['input']>;
  firstUpdateTimestamp_lt?: InputMaybe<Scalars['Int']['input']>;
  firstUpdateTimestamp_gte?: InputMaybe<Scalars['Int']['input']>;
  firstUpdateTimestamp_lte?: InputMaybe<Scalars['Int']['input']>;
  firstUpdateTimestamp_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  firstUpdateTimestamp_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  firstUpdateTransactionHash?: InputMaybe<Scalars['Bytes']['input']>;
  firstUpdateTransactionHash_not?: InputMaybe<Scalars['Bytes']['input']>;
  firstUpdateTransactionHash_gt?: InputMaybe<Scalars['Bytes']['input']>;
  firstUpdateTransactionHash_lt?: InputMaybe<Scalars['Bytes']['input']>;
  firstUpdateTransactionHash_gte?: InputMaybe<Scalars['Bytes']['input']>;
  firstUpdateTransactionHash_lte?: InputMaybe<Scalars['Bytes']['input']>;
  firstUpdateTransactionHash_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  firstUpdateTransactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  firstUpdateTransactionHash_contains?: InputMaybe<Scalars['Bytes']['input']>;
  firstUpdateTransactionHash_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  lastUpdateBlockNumber?: InputMaybe<Scalars['BigInt']['input']>;
  lastUpdateBlockNumber_not?: InputMaybe<Scalars['BigInt']['input']>;
  lastUpdateBlockNumber_gt?: InputMaybe<Scalars['BigInt']['input']>;
  lastUpdateBlockNumber_lt?: InputMaybe<Scalars['BigInt']['input']>;
  lastUpdateBlockNumber_gte?: InputMaybe<Scalars['BigInt']['input']>;
  lastUpdateBlockNumber_lte?: InputMaybe<Scalars['BigInt']['input']>;
  lastUpdateBlockNumber_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  lastUpdateBlockNumber_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  lastUpdateTimestamp?: InputMaybe<Scalars['Int']['input']>;
  lastUpdateTimestamp_not?: InputMaybe<Scalars['Int']['input']>;
  lastUpdateTimestamp_gt?: InputMaybe<Scalars['Int']['input']>;
  lastUpdateTimestamp_lt?: InputMaybe<Scalars['Int']['input']>;
  lastUpdateTimestamp_gte?: InputMaybe<Scalars['Int']['input']>;
  lastUpdateTimestamp_lte?: InputMaybe<Scalars['Int']['input']>;
  lastUpdateTimestamp_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  lastUpdateTimestamp_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  lastUpdateTransactionHash?: InputMaybe<Scalars['Bytes']['input']>;
  lastUpdateTransactionHash_not?: InputMaybe<Scalars['Bytes']['input']>;
  lastUpdateTransactionHash_gt?: InputMaybe<Scalars['Bytes']['input']>;
  lastUpdateTransactionHash_lt?: InputMaybe<Scalars['Bytes']['input']>;
  lastUpdateTransactionHash_gte?: InputMaybe<Scalars['Bytes']['input']>;
  lastUpdateTransactionHash_lte?: InputMaybe<Scalars['Bytes']['input']>;
  lastUpdateTransactionHash_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  lastUpdateTransactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  lastUpdateTransactionHash_contains?: InputMaybe<Scalars['Bytes']['input']>;
  lastUpdateTransactionHash_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  lendingRouter?: InputMaybe<Scalars['String']['input']>;
  lendingRouter_not?: InputMaybe<Scalars['String']['input']>;
  lendingRouter_gt?: InputMaybe<Scalars['String']['input']>;
  lendingRouter_lt?: InputMaybe<Scalars['String']['input']>;
  lendingRouter_gte?: InputMaybe<Scalars['String']['input']>;
  lendingRouter_lte?: InputMaybe<Scalars['String']['input']>;
  lendingRouter_in?: InputMaybe<Array<Scalars['String']['input']>>;
  lendingRouter_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  lendingRouter_contains?: InputMaybe<Scalars['String']['input']>;
  lendingRouter_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  lendingRouter_not_contains?: InputMaybe<Scalars['String']['input']>;
  lendingRouter_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  lendingRouter_starts_with?: InputMaybe<Scalars['String']['input']>;
  lendingRouter_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  lendingRouter_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  lendingRouter_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  lendingRouter_ends_with?: InputMaybe<Scalars['String']['input']>;
  lendingRouter_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  lendingRouter_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  lendingRouter_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  lendingRouter_?: InputMaybe<LendingRouter_filter>;
  vault?: InputMaybe<Scalars['String']['input']>;
  vault_not?: InputMaybe<Scalars['String']['input']>;
  vault_gt?: InputMaybe<Scalars['String']['input']>;
  vault_lt?: InputMaybe<Scalars['String']['input']>;
  vault_gte?: InputMaybe<Scalars['String']['input']>;
  vault_lte?: InputMaybe<Scalars['String']['input']>;
  vault_in?: InputMaybe<Array<Scalars['String']['input']>>;
  vault_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  vault_contains?: InputMaybe<Scalars['String']['input']>;
  vault_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  vault_not_contains?: InputMaybe<Scalars['String']['input']>;
  vault_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  vault_starts_with?: InputMaybe<Scalars['String']['input']>;
  vault_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  vault_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  vault_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  vault_ends_with?: InputMaybe<Scalars['String']['input']>;
  vault_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  vault_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  vault_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  vault_?: InputMaybe<Vault_filter>;
  params?: InputMaybe<Scalars['Bytes']['input']>;
  params_not?: InputMaybe<Scalars['Bytes']['input']>;
  params_gt?: InputMaybe<Scalars['Bytes']['input']>;
  params_lt?: InputMaybe<Scalars['Bytes']['input']>;
  params_gte?: InputMaybe<Scalars['Bytes']['input']>;
  params_lte?: InputMaybe<Scalars['Bytes']['input']>;
  params_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  params_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  params_contains?: InputMaybe<Scalars['Bytes']['input']>;
  params_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<Market_filter>>>;
  or?: InputMaybe<Array<InputMaybe<Market_filter>>>;
};

export type Market_orderBy =
  | 'id'
  | 'firstUpdateBlockNumber'
  | 'firstUpdateTimestamp'
  | 'firstUpdateTransactionHash'
  | 'lastUpdateBlockNumber'
  | 'lastUpdateTimestamp'
  | 'lastUpdateTransactionHash'
  | 'lendingRouter'
  | 'lendingRouter__id'
  | 'lendingRouter__firstUpdateBlockNumber'
  | 'lendingRouter__firstUpdateTimestamp'
  | 'lendingRouter__firstUpdateTransactionHash'
  | 'lendingRouter__lastUpdateBlockNumber'
  | 'lendingRouter__lastUpdateTimestamp'
  | 'lendingRouter__lastUpdateTransactionHash'
  | 'lendingRouter__name'
  | 'vault'
  | 'vault__id'
  | 'vault__firstUpdateBlockNumber'
  | 'vault__firstUpdateTimestamp'
  | 'vault__firstUpdateTransactionHash'
  | 'vault__lastUpdateBlockNumber'
  | 'vault__lastUpdateTimestamp'
  | 'vault__lastUpdateTransactionHash'
  | 'vault__isWhitelisted'
  | 'vault__feeRate'
  | 'vault__strategyType'
  | 'params';

export type Oracle = {
  /** Base Token Id:Quote Token Id:Oracle Type */
  id: Scalars['ID']['output'];
  lastUpdateBlockNumber: Scalars['BigInt']['output'];
  lastUpdateTimestamp: Scalars['Int']['output'];
  lastUpdateTransactionHash?: Maybe<Scalars['Bytes']['output']>;
  base: Token;
  quote: Token;
  decimals: Scalars['Int']['output'];
  ratePrecision: Scalars['BigInt']['output'];
  oracleAddress: Scalars['Bytes']['output'];
  oracleType: OracleType;
  mustInvert: Scalars['Boolean']['output'];
  latestRate?: Maybe<Scalars['BigInt']['output']>;
  matured: Scalars['Boolean']['output'];
  historicalRates?: Maybe<Array<ExchangeRate>>;
};


export type OraclehistoricalRatesArgs = {
  skip?: InputMaybe<Scalars['Int']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<ExchangeRate_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<ExchangeRate_filter>;
};

export type OracleRegistry = {
  /** ID is hardcoded to zero */
  id: Scalars['ID']['output'];
  lastRefreshBlockNumber: Scalars['BigInt']['output'];
  lastRefreshTimestamp: Scalars['Int']['output'];
  chainlinkOracles: Array<Oracle>;
  /** Vault Addresses */
  listedVaults: Array<Scalars['Bytes']['output']>;
  lendingRouters: Array<Scalars['Bytes']['output']>;
  withdrawRequestManager: Array<Scalars['Bytes']['output']>;
};


export type OracleRegistrychainlinkOraclesArgs = {
  skip?: InputMaybe<Scalars['Int']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Oracle_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<Oracle_filter>;
};

export type OracleRegistry_filter = {
  id?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  lastRefreshBlockNumber?: InputMaybe<Scalars['BigInt']['input']>;
  lastRefreshBlockNumber_not?: InputMaybe<Scalars['BigInt']['input']>;
  lastRefreshBlockNumber_gt?: InputMaybe<Scalars['BigInt']['input']>;
  lastRefreshBlockNumber_lt?: InputMaybe<Scalars['BigInt']['input']>;
  lastRefreshBlockNumber_gte?: InputMaybe<Scalars['BigInt']['input']>;
  lastRefreshBlockNumber_lte?: InputMaybe<Scalars['BigInt']['input']>;
  lastRefreshBlockNumber_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  lastRefreshBlockNumber_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  lastRefreshTimestamp?: InputMaybe<Scalars['Int']['input']>;
  lastRefreshTimestamp_not?: InputMaybe<Scalars['Int']['input']>;
  lastRefreshTimestamp_gt?: InputMaybe<Scalars['Int']['input']>;
  lastRefreshTimestamp_lt?: InputMaybe<Scalars['Int']['input']>;
  lastRefreshTimestamp_gte?: InputMaybe<Scalars['Int']['input']>;
  lastRefreshTimestamp_lte?: InputMaybe<Scalars['Int']['input']>;
  lastRefreshTimestamp_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  lastRefreshTimestamp_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  chainlinkOracles?: InputMaybe<Array<Scalars['String']['input']>>;
  chainlinkOracles_not?: InputMaybe<Array<Scalars['String']['input']>>;
  chainlinkOracles_contains?: InputMaybe<Array<Scalars['String']['input']>>;
  chainlinkOracles_contains_nocase?: InputMaybe<Array<Scalars['String']['input']>>;
  chainlinkOracles_not_contains?: InputMaybe<Array<Scalars['String']['input']>>;
  chainlinkOracles_not_contains_nocase?: InputMaybe<Array<Scalars['String']['input']>>;
  chainlinkOracles_?: InputMaybe<Oracle_filter>;
  listedVaults?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  listedVaults_not?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  listedVaults_contains?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  listedVaults_not_contains?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  lendingRouters?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  lendingRouters_not?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  lendingRouters_contains?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  lendingRouters_not_contains?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  withdrawRequestManager?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  withdrawRequestManager_not?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  withdrawRequestManager_contains?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  withdrawRequestManager_not_contains?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<OracleRegistry_filter>>>;
  or?: InputMaybe<Array<InputMaybe<OracleRegistry_filter>>>;
};

export type OracleRegistry_orderBy =
  | 'id'
  | 'lastRefreshBlockNumber'
  | 'lastRefreshTimestamp'
  | 'chainlinkOracles'
  | 'listedVaults'
  | 'lendingRouters'
  | 'withdrawRequestManager';

export type OracleType =
  | 'Chainlink'
  | 'VaultShareOracleRate'
  | 'VaultFeeAccrualRate'
  | 'BorrowShareOracleRate'
  | 'WithdrawTokenExchangeRate';

export type Oracle_filter = {
  id?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  lastUpdateBlockNumber?: InputMaybe<Scalars['BigInt']['input']>;
  lastUpdateBlockNumber_not?: InputMaybe<Scalars['BigInt']['input']>;
  lastUpdateBlockNumber_gt?: InputMaybe<Scalars['BigInt']['input']>;
  lastUpdateBlockNumber_lt?: InputMaybe<Scalars['BigInt']['input']>;
  lastUpdateBlockNumber_gte?: InputMaybe<Scalars['BigInt']['input']>;
  lastUpdateBlockNumber_lte?: InputMaybe<Scalars['BigInt']['input']>;
  lastUpdateBlockNumber_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  lastUpdateBlockNumber_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  lastUpdateTimestamp?: InputMaybe<Scalars['Int']['input']>;
  lastUpdateTimestamp_not?: InputMaybe<Scalars['Int']['input']>;
  lastUpdateTimestamp_gt?: InputMaybe<Scalars['Int']['input']>;
  lastUpdateTimestamp_lt?: InputMaybe<Scalars['Int']['input']>;
  lastUpdateTimestamp_gte?: InputMaybe<Scalars['Int']['input']>;
  lastUpdateTimestamp_lte?: InputMaybe<Scalars['Int']['input']>;
  lastUpdateTimestamp_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  lastUpdateTimestamp_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  lastUpdateTransactionHash?: InputMaybe<Scalars['Bytes']['input']>;
  lastUpdateTransactionHash_not?: InputMaybe<Scalars['Bytes']['input']>;
  lastUpdateTransactionHash_gt?: InputMaybe<Scalars['Bytes']['input']>;
  lastUpdateTransactionHash_lt?: InputMaybe<Scalars['Bytes']['input']>;
  lastUpdateTransactionHash_gte?: InputMaybe<Scalars['Bytes']['input']>;
  lastUpdateTransactionHash_lte?: InputMaybe<Scalars['Bytes']['input']>;
  lastUpdateTransactionHash_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  lastUpdateTransactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  lastUpdateTransactionHash_contains?: InputMaybe<Scalars['Bytes']['input']>;
  lastUpdateTransactionHash_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  base?: InputMaybe<Scalars['String']['input']>;
  base_not?: InputMaybe<Scalars['String']['input']>;
  base_gt?: InputMaybe<Scalars['String']['input']>;
  base_lt?: InputMaybe<Scalars['String']['input']>;
  base_gte?: InputMaybe<Scalars['String']['input']>;
  base_lte?: InputMaybe<Scalars['String']['input']>;
  base_in?: InputMaybe<Array<Scalars['String']['input']>>;
  base_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  base_contains?: InputMaybe<Scalars['String']['input']>;
  base_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  base_not_contains?: InputMaybe<Scalars['String']['input']>;
  base_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  base_starts_with?: InputMaybe<Scalars['String']['input']>;
  base_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  base_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  base_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  base_ends_with?: InputMaybe<Scalars['String']['input']>;
  base_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  base_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  base_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  base_?: InputMaybe<Token_filter>;
  quote?: InputMaybe<Scalars['String']['input']>;
  quote_not?: InputMaybe<Scalars['String']['input']>;
  quote_gt?: InputMaybe<Scalars['String']['input']>;
  quote_lt?: InputMaybe<Scalars['String']['input']>;
  quote_gte?: InputMaybe<Scalars['String']['input']>;
  quote_lte?: InputMaybe<Scalars['String']['input']>;
  quote_in?: InputMaybe<Array<Scalars['String']['input']>>;
  quote_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  quote_contains?: InputMaybe<Scalars['String']['input']>;
  quote_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  quote_not_contains?: InputMaybe<Scalars['String']['input']>;
  quote_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  quote_starts_with?: InputMaybe<Scalars['String']['input']>;
  quote_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  quote_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  quote_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  quote_ends_with?: InputMaybe<Scalars['String']['input']>;
  quote_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  quote_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  quote_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  quote_?: InputMaybe<Token_filter>;
  decimals?: InputMaybe<Scalars['Int']['input']>;
  decimals_not?: InputMaybe<Scalars['Int']['input']>;
  decimals_gt?: InputMaybe<Scalars['Int']['input']>;
  decimals_lt?: InputMaybe<Scalars['Int']['input']>;
  decimals_gte?: InputMaybe<Scalars['Int']['input']>;
  decimals_lte?: InputMaybe<Scalars['Int']['input']>;
  decimals_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  decimals_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  ratePrecision?: InputMaybe<Scalars['BigInt']['input']>;
  ratePrecision_not?: InputMaybe<Scalars['BigInt']['input']>;
  ratePrecision_gt?: InputMaybe<Scalars['BigInt']['input']>;
  ratePrecision_lt?: InputMaybe<Scalars['BigInt']['input']>;
  ratePrecision_gte?: InputMaybe<Scalars['BigInt']['input']>;
  ratePrecision_lte?: InputMaybe<Scalars['BigInt']['input']>;
  ratePrecision_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  ratePrecision_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  oracleAddress?: InputMaybe<Scalars['Bytes']['input']>;
  oracleAddress_not?: InputMaybe<Scalars['Bytes']['input']>;
  oracleAddress_gt?: InputMaybe<Scalars['Bytes']['input']>;
  oracleAddress_lt?: InputMaybe<Scalars['Bytes']['input']>;
  oracleAddress_gte?: InputMaybe<Scalars['Bytes']['input']>;
  oracleAddress_lte?: InputMaybe<Scalars['Bytes']['input']>;
  oracleAddress_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  oracleAddress_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  oracleAddress_contains?: InputMaybe<Scalars['Bytes']['input']>;
  oracleAddress_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  oracleType?: InputMaybe<OracleType>;
  oracleType_not?: InputMaybe<OracleType>;
  oracleType_in?: InputMaybe<Array<OracleType>>;
  oracleType_not_in?: InputMaybe<Array<OracleType>>;
  mustInvert?: InputMaybe<Scalars['Boolean']['input']>;
  mustInvert_not?: InputMaybe<Scalars['Boolean']['input']>;
  mustInvert_in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  mustInvert_not_in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  latestRate?: InputMaybe<Scalars['BigInt']['input']>;
  latestRate_not?: InputMaybe<Scalars['BigInt']['input']>;
  latestRate_gt?: InputMaybe<Scalars['BigInt']['input']>;
  latestRate_lt?: InputMaybe<Scalars['BigInt']['input']>;
  latestRate_gte?: InputMaybe<Scalars['BigInt']['input']>;
  latestRate_lte?: InputMaybe<Scalars['BigInt']['input']>;
  latestRate_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  latestRate_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  matured?: InputMaybe<Scalars['Boolean']['input']>;
  matured_not?: InputMaybe<Scalars['Boolean']['input']>;
  matured_in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  matured_not_in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  historicalRates_?: InputMaybe<ExchangeRate_filter>;
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<Oracle_filter>>>;
  or?: InputMaybe<Array<InputMaybe<Oracle_filter>>>;
};

export type Oracle_orderBy =
  | 'id'
  | 'lastUpdateBlockNumber'
  | 'lastUpdateTimestamp'
  | 'lastUpdateTransactionHash'
  | 'base'
  | 'base__id'
  | 'base__firstUpdateBlockNumber'
  | 'base__firstUpdateTimestamp'
  | 'base__firstUpdateTransactionHash'
  | 'base__lastUpdateBlockNumber'
  | 'base__lastUpdateTimestamp'
  | 'base__lastUpdateTransactionHash'
  | 'base__tokenType'
  | 'base__tokenInterface'
  | 'base__name'
  | 'base__symbol'
  | 'base__decimals'
  | 'base__precision'
  | 'base__totalSupply'
  | 'base__maturity'
  | 'base__tokenAddress'
  | 'quote'
  | 'quote__id'
  | 'quote__firstUpdateBlockNumber'
  | 'quote__firstUpdateTimestamp'
  | 'quote__firstUpdateTransactionHash'
  | 'quote__lastUpdateBlockNumber'
  | 'quote__lastUpdateTimestamp'
  | 'quote__lastUpdateTransactionHash'
  | 'quote__tokenType'
  | 'quote__tokenInterface'
  | 'quote__name'
  | 'quote__symbol'
  | 'quote__decimals'
  | 'quote__precision'
  | 'quote__totalSupply'
  | 'quote__maturity'
  | 'quote__tokenAddress'
  | 'decimals'
  | 'ratePrecision'
  | 'oracleAddress'
  | 'oracleType'
  | 'mustInvert'
  | 'latestRate'
  | 'matured'
  | 'historicalRates';

/** Defines the order direction, either ascending or descending */
export type OrderDirection =
  | 'asc'
  | 'desc';

export type ProfitLossLineItem = {
  /** Transaction Hash:Index:Token ID */
  id: Scalars['ID']['output'];
  blockNumber: Scalars['BigInt']['output'];
  timestamp: Scalars['Int']['output'];
  transactionHash: Scalars['Bytes']['output'];
  account: Account;
  token: Token;
  balanceSnapshot: BalanceSnapshot;
  underlyingToken: Token;
  lineItemType: LineItemType;
  tokenAmount: Scalars['BigInt']['output'];
  underlyingAmountRealized: Scalars['BigInt']['output'];
  underlyingAmountSpot: Scalars['BigInt']['output'];
  /** Amount of yield tokens if token amount is a vault share */
  yieldTokenAmount?: Maybe<Scalars['BigInt']['output']>;
  realizedPrice: Scalars['BigInt']['output'];
  spotPrice: Scalars['BigInt']['output'];
  impliedFixedRate?: Maybe<Scalars['BigInt']['output']>;
};

export type ProfitLossLineItem_filter = {
  id?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  blockNumber?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_not?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_gt?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_lt?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_gte?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_lte?: InputMaybe<Scalars['BigInt']['input']>;
  blockNumber_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  blockNumber_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  timestamp?: InputMaybe<Scalars['Int']['input']>;
  timestamp_not?: InputMaybe<Scalars['Int']['input']>;
  timestamp_gt?: InputMaybe<Scalars['Int']['input']>;
  timestamp_lt?: InputMaybe<Scalars['Int']['input']>;
  timestamp_gte?: InputMaybe<Scalars['Int']['input']>;
  timestamp_lte?: InputMaybe<Scalars['Int']['input']>;
  timestamp_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  timestamp_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  transactionHash?: InputMaybe<Scalars['Bytes']['input']>;
  transactionHash_not?: InputMaybe<Scalars['Bytes']['input']>;
  transactionHash_gt?: InputMaybe<Scalars['Bytes']['input']>;
  transactionHash_lt?: InputMaybe<Scalars['Bytes']['input']>;
  transactionHash_gte?: InputMaybe<Scalars['Bytes']['input']>;
  transactionHash_lte?: InputMaybe<Scalars['Bytes']['input']>;
  transactionHash_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  transactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  transactionHash_contains?: InputMaybe<Scalars['Bytes']['input']>;
  transactionHash_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  account?: InputMaybe<Scalars['String']['input']>;
  account_not?: InputMaybe<Scalars['String']['input']>;
  account_gt?: InputMaybe<Scalars['String']['input']>;
  account_lt?: InputMaybe<Scalars['String']['input']>;
  account_gte?: InputMaybe<Scalars['String']['input']>;
  account_lte?: InputMaybe<Scalars['String']['input']>;
  account_in?: InputMaybe<Array<Scalars['String']['input']>>;
  account_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  account_contains?: InputMaybe<Scalars['String']['input']>;
  account_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  account_not_contains?: InputMaybe<Scalars['String']['input']>;
  account_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  account_starts_with?: InputMaybe<Scalars['String']['input']>;
  account_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  account_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  account_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  account_ends_with?: InputMaybe<Scalars['String']['input']>;
  account_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  account_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  account_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  account_?: InputMaybe<Account_filter>;
  token?: InputMaybe<Scalars['String']['input']>;
  token_not?: InputMaybe<Scalars['String']['input']>;
  token_gt?: InputMaybe<Scalars['String']['input']>;
  token_lt?: InputMaybe<Scalars['String']['input']>;
  token_gte?: InputMaybe<Scalars['String']['input']>;
  token_lte?: InputMaybe<Scalars['String']['input']>;
  token_in?: InputMaybe<Array<Scalars['String']['input']>>;
  token_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  token_contains?: InputMaybe<Scalars['String']['input']>;
  token_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  token_not_contains?: InputMaybe<Scalars['String']['input']>;
  token_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  token_starts_with?: InputMaybe<Scalars['String']['input']>;
  token_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  token_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  token_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  token_ends_with?: InputMaybe<Scalars['String']['input']>;
  token_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  token_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  token_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  token_?: InputMaybe<Token_filter>;
  balanceSnapshot?: InputMaybe<Scalars['String']['input']>;
  balanceSnapshot_not?: InputMaybe<Scalars['String']['input']>;
  balanceSnapshot_gt?: InputMaybe<Scalars['String']['input']>;
  balanceSnapshot_lt?: InputMaybe<Scalars['String']['input']>;
  balanceSnapshot_gte?: InputMaybe<Scalars['String']['input']>;
  balanceSnapshot_lte?: InputMaybe<Scalars['String']['input']>;
  balanceSnapshot_in?: InputMaybe<Array<Scalars['String']['input']>>;
  balanceSnapshot_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  balanceSnapshot_contains?: InputMaybe<Scalars['String']['input']>;
  balanceSnapshot_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  balanceSnapshot_not_contains?: InputMaybe<Scalars['String']['input']>;
  balanceSnapshot_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  balanceSnapshot_starts_with?: InputMaybe<Scalars['String']['input']>;
  balanceSnapshot_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  balanceSnapshot_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  balanceSnapshot_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  balanceSnapshot_ends_with?: InputMaybe<Scalars['String']['input']>;
  balanceSnapshot_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  balanceSnapshot_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  balanceSnapshot_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  balanceSnapshot_?: InputMaybe<BalanceSnapshot_filter>;
  underlyingToken?: InputMaybe<Scalars['String']['input']>;
  underlyingToken_not?: InputMaybe<Scalars['String']['input']>;
  underlyingToken_gt?: InputMaybe<Scalars['String']['input']>;
  underlyingToken_lt?: InputMaybe<Scalars['String']['input']>;
  underlyingToken_gte?: InputMaybe<Scalars['String']['input']>;
  underlyingToken_lte?: InputMaybe<Scalars['String']['input']>;
  underlyingToken_in?: InputMaybe<Array<Scalars['String']['input']>>;
  underlyingToken_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  underlyingToken_contains?: InputMaybe<Scalars['String']['input']>;
  underlyingToken_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  underlyingToken_not_contains?: InputMaybe<Scalars['String']['input']>;
  underlyingToken_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  underlyingToken_starts_with?: InputMaybe<Scalars['String']['input']>;
  underlyingToken_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  underlyingToken_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  underlyingToken_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  underlyingToken_ends_with?: InputMaybe<Scalars['String']['input']>;
  underlyingToken_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  underlyingToken_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  underlyingToken_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  underlyingToken_?: InputMaybe<Token_filter>;
  lineItemType?: InputMaybe<LineItemType>;
  lineItemType_not?: InputMaybe<LineItemType>;
  lineItemType_in?: InputMaybe<Array<LineItemType>>;
  lineItemType_not_in?: InputMaybe<Array<LineItemType>>;
  tokenAmount?: InputMaybe<Scalars['BigInt']['input']>;
  tokenAmount_not?: InputMaybe<Scalars['BigInt']['input']>;
  tokenAmount_gt?: InputMaybe<Scalars['BigInt']['input']>;
  tokenAmount_lt?: InputMaybe<Scalars['BigInt']['input']>;
  tokenAmount_gte?: InputMaybe<Scalars['BigInt']['input']>;
  tokenAmount_lte?: InputMaybe<Scalars['BigInt']['input']>;
  tokenAmount_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  tokenAmount_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  underlyingAmountRealized?: InputMaybe<Scalars['BigInt']['input']>;
  underlyingAmountRealized_not?: InputMaybe<Scalars['BigInt']['input']>;
  underlyingAmountRealized_gt?: InputMaybe<Scalars['BigInt']['input']>;
  underlyingAmountRealized_lt?: InputMaybe<Scalars['BigInt']['input']>;
  underlyingAmountRealized_gte?: InputMaybe<Scalars['BigInt']['input']>;
  underlyingAmountRealized_lte?: InputMaybe<Scalars['BigInt']['input']>;
  underlyingAmountRealized_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  underlyingAmountRealized_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  underlyingAmountSpot?: InputMaybe<Scalars['BigInt']['input']>;
  underlyingAmountSpot_not?: InputMaybe<Scalars['BigInt']['input']>;
  underlyingAmountSpot_gt?: InputMaybe<Scalars['BigInt']['input']>;
  underlyingAmountSpot_lt?: InputMaybe<Scalars['BigInt']['input']>;
  underlyingAmountSpot_gte?: InputMaybe<Scalars['BigInt']['input']>;
  underlyingAmountSpot_lte?: InputMaybe<Scalars['BigInt']['input']>;
  underlyingAmountSpot_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  underlyingAmountSpot_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  yieldTokenAmount?: InputMaybe<Scalars['BigInt']['input']>;
  yieldTokenAmount_not?: InputMaybe<Scalars['BigInt']['input']>;
  yieldTokenAmount_gt?: InputMaybe<Scalars['BigInt']['input']>;
  yieldTokenAmount_lt?: InputMaybe<Scalars['BigInt']['input']>;
  yieldTokenAmount_gte?: InputMaybe<Scalars['BigInt']['input']>;
  yieldTokenAmount_lte?: InputMaybe<Scalars['BigInt']['input']>;
  yieldTokenAmount_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  yieldTokenAmount_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  realizedPrice?: InputMaybe<Scalars['BigInt']['input']>;
  realizedPrice_not?: InputMaybe<Scalars['BigInt']['input']>;
  realizedPrice_gt?: InputMaybe<Scalars['BigInt']['input']>;
  realizedPrice_lt?: InputMaybe<Scalars['BigInt']['input']>;
  realizedPrice_gte?: InputMaybe<Scalars['BigInt']['input']>;
  realizedPrice_lte?: InputMaybe<Scalars['BigInt']['input']>;
  realizedPrice_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  realizedPrice_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  spotPrice?: InputMaybe<Scalars['BigInt']['input']>;
  spotPrice_not?: InputMaybe<Scalars['BigInt']['input']>;
  spotPrice_gt?: InputMaybe<Scalars['BigInt']['input']>;
  spotPrice_lt?: InputMaybe<Scalars['BigInt']['input']>;
  spotPrice_gte?: InputMaybe<Scalars['BigInt']['input']>;
  spotPrice_lte?: InputMaybe<Scalars['BigInt']['input']>;
  spotPrice_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  spotPrice_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  impliedFixedRate?: InputMaybe<Scalars['BigInt']['input']>;
  impliedFixedRate_not?: InputMaybe<Scalars['BigInt']['input']>;
  impliedFixedRate_gt?: InputMaybe<Scalars['BigInt']['input']>;
  impliedFixedRate_lt?: InputMaybe<Scalars['BigInt']['input']>;
  impliedFixedRate_gte?: InputMaybe<Scalars['BigInt']['input']>;
  impliedFixedRate_lte?: InputMaybe<Scalars['BigInt']['input']>;
  impliedFixedRate_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  impliedFixedRate_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<ProfitLossLineItem_filter>>>;
  or?: InputMaybe<Array<InputMaybe<ProfitLossLineItem_filter>>>;
};

export type ProfitLossLineItem_orderBy =
  | 'id'
  | 'blockNumber'
  | 'timestamp'
  | 'transactionHash'
  | 'account'
  | 'account__id'
  | 'account__firstUpdateBlockNumber'
  | 'account__firstUpdateTimestamp'
  | 'account__firstUpdateTransactionHash'
  | 'account__lastUpdateBlockNumber'
  | 'account__lastUpdateTimestamp'
  | 'account__lastUpdateTransactionHash'
  | 'account__systemAccountType'
  | 'token'
  | 'token__id'
  | 'token__firstUpdateBlockNumber'
  | 'token__firstUpdateTimestamp'
  | 'token__firstUpdateTransactionHash'
  | 'token__lastUpdateBlockNumber'
  | 'token__lastUpdateTimestamp'
  | 'token__lastUpdateTransactionHash'
  | 'token__tokenType'
  | 'token__tokenInterface'
  | 'token__name'
  | 'token__symbol'
  | 'token__decimals'
  | 'token__precision'
  | 'token__totalSupply'
  | 'token__maturity'
  | 'token__tokenAddress'
  | 'balanceSnapshot'
  | 'balanceSnapshot__id'
  | 'balanceSnapshot__blockNumber'
  | 'balanceSnapshot__timestamp'
  | 'balanceSnapshot__transactionHash'
  | 'balanceSnapshot__currentBalance'
  | 'balanceSnapshot__previousBalance'
  | 'balanceSnapshot__adjustedCostBasis'
  | 'balanceSnapshot__currentProfitAndLossAtSnapshot'
  | 'balanceSnapshot__totalInterestAccrualAtSnapshot'
  | 'balanceSnapshot__totalVaultFeesAtSnapshot'
  | 'balanceSnapshot__impliedFixedRate'
  | 'balanceSnapshot___accumulatedBalance'
  | 'balanceSnapshot___accumulatedCostRealized'
  | 'balanceSnapshot___lastInterestAccumulator'
  | 'balanceSnapshot___lastVaultFeeAccumulator'
  | 'underlyingToken'
  | 'underlyingToken__id'
  | 'underlyingToken__firstUpdateBlockNumber'
  | 'underlyingToken__firstUpdateTimestamp'
  | 'underlyingToken__firstUpdateTransactionHash'
  | 'underlyingToken__lastUpdateBlockNumber'
  | 'underlyingToken__lastUpdateTimestamp'
  | 'underlyingToken__lastUpdateTransactionHash'
  | 'underlyingToken__tokenType'
  | 'underlyingToken__tokenInterface'
  | 'underlyingToken__name'
  | 'underlyingToken__symbol'
  | 'underlyingToken__decimals'
  | 'underlyingToken__precision'
  | 'underlyingToken__totalSupply'
  | 'underlyingToken__maturity'
  | 'underlyingToken__tokenAddress'
  | 'lineItemType'
  | 'tokenAmount'
  | 'underlyingAmountRealized'
  | 'underlyingAmountSpot'
  | 'yieldTokenAmount'
  | 'realizedPrice'
  | 'spotPrice'
  | 'impliedFixedRate';

export type Query = {
  token?: Maybe<Token>;
  tokens: Array<Token>;
  profitLossLineItem?: Maybe<ProfitLossLineItem>;
  profitLossLineItems: Array<ProfitLossLineItem>;
  account?: Maybe<Account>;
  accounts: Array<Account>;
  oracleRegistry?: Maybe<OracleRegistry>;
  oracleRegistries: Array<OracleRegistry>;
  oracle?: Maybe<Oracle>;
  oracles: Array<Oracle>;
  exchangeRate?: Maybe<ExchangeRate>;
  exchangeRates: Array<ExchangeRate>;
  vault?: Maybe<Vault>;
  vaults: Array<Vault>;
  lendingRouter?: Maybe<LendingRouter>;
  lendingRouters: Array<LendingRouter>;
  market?: Maybe<Market>;
  markets: Array<Market>;
  withdrawRequestManager?: Maybe<WithdrawRequestManager>;
  withdrawRequestManagers: Array<WithdrawRequestManager>;
  balance?: Maybe<Balance>;
  balances: Array<Balance>;
  balanceSnapshot?: Maybe<BalanceSnapshot>;
  balanceSnapshots: Array<BalanceSnapshot>;
  withdrawRequest?: Maybe<WithdrawRequest>;
  withdrawRequests: Array<WithdrawRequest>;
  tokenizedWithdrawRequest?: Maybe<TokenizedWithdrawRequest>;
  tokenizedWithdrawRequests: Array<TokenizedWithdrawRequest>;
  incentiveSnapshot?: Maybe<IncentiveSnapshot>;
  incentiveSnapshots: Array<IncentiveSnapshot>;
  tradingModulePermission?: Maybe<TradingModulePermission>;
  tradingModulePermissions: Array<TradingModulePermission>;
  /** Access to subgraph metadata */
  _meta?: Maybe<_Meta_>;
};


export type QuerytokenArgs = {
  id: Scalars['ID']['input'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QuerytokensArgs = {
  skip?: InputMaybe<Scalars['Int']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Token_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<Token_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryprofitLossLineItemArgs = {
  id: Scalars['ID']['input'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryprofitLossLineItemsArgs = {
  skip?: InputMaybe<Scalars['Int']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<ProfitLossLineItem_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<ProfitLossLineItem_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryaccountArgs = {
  id: Scalars['ID']['input'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryaccountsArgs = {
  skip?: InputMaybe<Scalars['Int']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Account_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<Account_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryoracleRegistryArgs = {
  id: Scalars['ID']['input'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryoracleRegistriesArgs = {
  skip?: InputMaybe<Scalars['Int']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<OracleRegistry_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<OracleRegistry_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryoracleArgs = {
  id: Scalars['ID']['input'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryoraclesArgs = {
  skip?: InputMaybe<Scalars['Int']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Oracle_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<Oracle_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryexchangeRateArgs = {
  id: Scalars['ID']['input'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryexchangeRatesArgs = {
  skip?: InputMaybe<Scalars['Int']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<ExchangeRate_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<ExchangeRate_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryvaultArgs = {
  id: Scalars['ID']['input'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryvaultsArgs = {
  skip?: InputMaybe<Scalars['Int']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Vault_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<Vault_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QuerylendingRouterArgs = {
  id: Scalars['ID']['input'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QuerylendingRoutersArgs = {
  skip?: InputMaybe<Scalars['Int']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<LendingRouter_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<LendingRouter_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QuerymarketArgs = {
  id: Scalars['ID']['input'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QuerymarketsArgs = {
  skip?: InputMaybe<Scalars['Int']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Market_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<Market_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QuerywithdrawRequestManagerArgs = {
  id: Scalars['ID']['input'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QuerywithdrawRequestManagersArgs = {
  skip?: InputMaybe<Scalars['Int']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<WithdrawRequestManager_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<WithdrawRequestManager_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QuerybalanceArgs = {
  id: Scalars['ID']['input'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QuerybalancesArgs = {
  skip?: InputMaybe<Scalars['Int']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Balance_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<Balance_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QuerybalanceSnapshotArgs = {
  id: Scalars['ID']['input'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QuerybalanceSnapshotsArgs = {
  skip?: InputMaybe<Scalars['Int']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<BalanceSnapshot_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<BalanceSnapshot_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QuerywithdrawRequestArgs = {
  id: Scalars['ID']['input'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QuerywithdrawRequestsArgs = {
  skip?: InputMaybe<Scalars['Int']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<WithdrawRequest_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<WithdrawRequest_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QuerytokenizedWithdrawRequestArgs = {
  id: Scalars['ID']['input'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QuerytokenizedWithdrawRequestsArgs = {
  skip?: InputMaybe<Scalars['Int']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<TokenizedWithdrawRequest_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<TokenizedWithdrawRequest_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryincentiveSnapshotArgs = {
  id: Scalars['ID']['input'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryincentiveSnapshotsArgs = {
  skip?: InputMaybe<Scalars['Int']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<IncentiveSnapshot_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<IncentiveSnapshot_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QuerytradingModulePermissionArgs = {
  id: Scalars['ID']['input'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QuerytradingModulePermissionsArgs = {
  skip?: InputMaybe<Scalars['Int']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<TradingModulePermission_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<TradingModulePermission_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type Query_metaArgs = {
  block?: InputMaybe<Block_height>;
};

export type SystemAccount =
  | 'None'
  | 'ZeroAddress'
  | 'LendingRouter'
  | 'Vault'
  | 'NOTE';

export type Token = {
  /**
   * ID space varies by token type:
   * - ERC20: token address
   * - ERC1155: `emitter address:tokenId`
   */
  id: Scalars['ID']['output'];
  firstUpdateBlockNumber: Scalars['BigInt']['output'];
  firstUpdateTimestamp: Scalars['Int']['output'];
  firstUpdateTransactionHash?: Maybe<Scalars['Bytes']['output']>;
  lastUpdateBlockNumber: Scalars['BigInt']['output'];
  lastUpdateTimestamp: Scalars['Int']['output'];
  lastUpdateTransactionHash?: Maybe<Scalars['Bytes']['output']>;
  tokenType: TokenType;
  tokenInterface: TokenInterface;
  /** A link to the underlying token if this token is not underlying itself */
  underlying?: Maybe<Token>;
  name: Scalars['String']['output'];
  symbol: Scalars['String']['output'];
  decimals: Scalars['Int']['output'];
  precision: Scalars['BigInt']['output'];
  /** Only updated for Notional entities */
  totalSupply?: Maybe<Scalars['BigInt']['output']>;
  /** Maturities are only set for some token types */
  maturity?: Maybe<Scalars['BigInt']['output']>;
  /** Vault address is set for vault token types */
  vaultAddress?: Maybe<Vault>;
  /** Set to the ERC20 address or Notional Proxy for ERC1155 addresses */
  tokenAddress: Scalars['Bytes']['output'];
  balanceOf?: Maybe<Array<Balance>>;
  oracles?: Maybe<Array<Oracle>>;
};


export type TokenbalanceOfArgs = {
  skip?: InputMaybe<Scalars['Int']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Balance_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<Balance_filter>;
};


export type TokenoraclesArgs = {
  skip?: InputMaybe<Scalars['Int']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Oracle_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<Oracle_filter>;
};

export type TokenInterface =
  | 'ERC20'
  | 'ERC1155'
  /** Used to designate off chain fiat currencies like USD, JPY, etc */
  | 'FIAT';

export type TokenType =
  | 'Underlying'
  | 'VaultShare'
  | 'VaultDebt'
  | 'Fiat';

export type Token_filter = {
  id?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  firstUpdateBlockNumber?: InputMaybe<Scalars['BigInt']['input']>;
  firstUpdateBlockNumber_not?: InputMaybe<Scalars['BigInt']['input']>;
  firstUpdateBlockNumber_gt?: InputMaybe<Scalars['BigInt']['input']>;
  firstUpdateBlockNumber_lt?: InputMaybe<Scalars['BigInt']['input']>;
  firstUpdateBlockNumber_gte?: InputMaybe<Scalars['BigInt']['input']>;
  firstUpdateBlockNumber_lte?: InputMaybe<Scalars['BigInt']['input']>;
  firstUpdateBlockNumber_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  firstUpdateBlockNumber_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  firstUpdateTimestamp?: InputMaybe<Scalars['Int']['input']>;
  firstUpdateTimestamp_not?: InputMaybe<Scalars['Int']['input']>;
  firstUpdateTimestamp_gt?: InputMaybe<Scalars['Int']['input']>;
  firstUpdateTimestamp_lt?: InputMaybe<Scalars['Int']['input']>;
  firstUpdateTimestamp_gte?: InputMaybe<Scalars['Int']['input']>;
  firstUpdateTimestamp_lte?: InputMaybe<Scalars['Int']['input']>;
  firstUpdateTimestamp_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  firstUpdateTimestamp_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  firstUpdateTransactionHash?: InputMaybe<Scalars['Bytes']['input']>;
  firstUpdateTransactionHash_not?: InputMaybe<Scalars['Bytes']['input']>;
  firstUpdateTransactionHash_gt?: InputMaybe<Scalars['Bytes']['input']>;
  firstUpdateTransactionHash_lt?: InputMaybe<Scalars['Bytes']['input']>;
  firstUpdateTransactionHash_gte?: InputMaybe<Scalars['Bytes']['input']>;
  firstUpdateTransactionHash_lte?: InputMaybe<Scalars['Bytes']['input']>;
  firstUpdateTransactionHash_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  firstUpdateTransactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  firstUpdateTransactionHash_contains?: InputMaybe<Scalars['Bytes']['input']>;
  firstUpdateTransactionHash_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  lastUpdateBlockNumber?: InputMaybe<Scalars['BigInt']['input']>;
  lastUpdateBlockNumber_not?: InputMaybe<Scalars['BigInt']['input']>;
  lastUpdateBlockNumber_gt?: InputMaybe<Scalars['BigInt']['input']>;
  lastUpdateBlockNumber_lt?: InputMaybe<Scalars['BigInt']['input']>;
  lastUpdateBlockNumber_gte?: InputMaybe<Scalars['BigInt']['input']>;
  lastUpdateBlockNumber_lte?: InputMaybe<Scalars['BigInt']['input']>;
  lastUpdateBlockNumber_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  lastUpdateBlockNumber_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  lastUpdateTimestamp?: InputMaybe<Scalars['Int']['input']>;
  lastUpdateTimestamp_not?: InputMaybe<Scalars['Int']['input']>;
  lastUpdateTimestamp_gt?: InputMaybe<Scalars['Int']['input']>;
  lastUpdateTimestamp_lt?: InputMaybe<Scalars['Int']['input']>;
  lastUpdateTimestamp_gte?: InputMaybe<Scalars['Int']['input']>;
  lastUpdateTimestamp_lte?: InputMaybe<Scalars['Int']['input']>;
  lastUpdateTimestamp_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  lastUpdateTimestamp_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  lastUpdateTransactionHash?: InputMaybe<Scalars['Bytes']['input']>;
  lastUpdateTransactionHash_not?: InputMaybe<Scalars['Bytes']['input']>;
  lastUpdateTransactionHash_gt?: InputMaybe<Scalars['Bytes']['input']>;
  lastUpdateTransactionHash_lt?: InputMaybe<Scalars['Bytes']['input']>;
  lastUpdateTransactionHash_gte?: InputMaybe<Scalars['Bytes']['input']>;
  lastUpdateTransactionHash_lte?: InputMaybe<Scalars['Bytes']['input']>;
  lastUpdateTransactionHash_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  lastUpdateTransactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  lastUpdateTransactionHash_contains?: InputMaybe<Scalars['Bytes']['input']>;
  lastUpdateTransactionHash_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  tokenType?: InputMaybe<TokenType>;
  tokenType_not?: InputMaybe<TokenType>;
  tokenType_in?: InputMaybe<Array<TokenType>>;
  tokenType_not_in?: InputMaybe<Array<TokenType>>;
  tokenInterface?: InputMaybe<TokenInterface>;
  tokenInterface_not?: InputMaybe<TokenInterface>;
  tokenInterface_in?: InputMaybe<Array<TokenInterface>>;
  tokenInterface_not_in?: InputMaybe<Array<TokenInterface>>;
  underlying?: InputMaybe<Scalars['String']['input']>;
  underlying_not?: InputMaybe<Scalars['String']['input']>;
  underlying_gt?: InputMaybe<Scalars['String']['input']>;
  underlying_lt?: InputMaybe<Scalars['String']['input']>;
  underlying_gte?: InputMaybe<Scalars['String']['input']>;
  underlying_lte?: InputMaybe<Scalars['String']['input']>;
  underlying_in?: InputMaybe<Array<Scalars['String']['input']>>;
  underlying_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  underlying_contains?: InputMaybe<Scalars['String']['input']>;
  underlying_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  underlying_not_contains?: InputMaybe<Scalars['String']['input']>;
  underlying_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  underlying_starts_with?: InputMaybe<Scalars['String']['input']>;
  underlying_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  underlying_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  underlying_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  underlying_ends_with?: InputMaybe<Scalars['String']['input']>;
  underlying_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  underlying_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  underlying_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  underlying_?: InputMaybe<Token_filter>;
  name?: InputMaybe<Scalars['String']['input']>;
  name_not?: InputMaybe<Scalars['String']['input']>;
  name_gt?: InputMaybe<Scalars['String']['input']>;
  name_lt?: InputMaybe<Scalars['String']['input']>;
  name_gte?: InputMaybe<Scalars['String']['input']>;
  name_lte?: InputMaybe<Scalars['String']['input']>;
  name_in?: InputMaybe<Array<Scalars['String']['input']>>;
  name_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  name_contains?: InputMaybe<Scalars['String']['input']>;
  name_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  name_not_contains?: InputMaybe<Scalars['String']['input']>;
  name_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  name_starts_with?: InputMaybe<Scalars['String']['input']>;
  name_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  name_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  name_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  name_ends_with?: InputMaybe<Scalars['String']['input']>;
  name_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  name_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  name_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  symbol?: InputMaybe<Scalars['String']['input']>;
  symbol_not?: InputMaybe<Scalars['String']['input']>;
  symbol_gt?: InputMaybe<Scalars['String']['input']>;
  symbol_lt?: InputMaybe<Scalars['String']['input']>;
  symbol_gte?: InputMaybe<Scalars['String']['input']>;
  symbol_lte?: InputMaybe<Scalars['String']['input']>;
  symbol_in?: InputMaybe<Array<Scalars['String']['input']>>;
  symbol_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  symbol_contains?: InputMaybe<Scalars['String']['input']>;
  symbol_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  symbol_not_contains?: InputMaybe<Scalars['String']['input']>;
  symbol_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  symbol_starts_with?: InputMaybe<Scalars['String']['input']>;
  symbol_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  symbol_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  symbol_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  symbol_ends_with?: InputMaybe<Scalars['String']['input']>;
  symbol_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  symbol_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  symbol_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  decimals?: InputMaybe<Scalars['Int']['input']>;
  decimals_not?: InputMaybe<Scalars['Int']['input']>;
  decimals_gt?: InputMaybe<Scalars['Int']['input']>;
  decimals_lt?: InputMaybe<Scalars['Int']['input']>;
  decimals_gte?: InputMaybe<Scalars['Int']['input']>;
  decimals_lte?: InputMaybe<Scalars['Int']['input']>;
  decimals_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  decimals_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  precision?: InputMaybe<Scalars['BigInt']['input']>;
  precision_not?: InputMaybe<Scalars['BigInt']['input']>;
  precision_gt?: InputMaybe<Scalars['BigInt']['input']>;
  precision_lt?: InputMaybe<Scalars['BigInt']['input']>;
  precision_gte?: InputMaybe<Scalars['BigInt']['input']>;
  precision_lte?: InputMaybe<Scalars['BigInt']['input']>;
  precision_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  precision_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  totalSupply?: InputMaybe<Scalars['BigInt']['input']>;
  totalSupply_not?: InputMaybe<Scalars['BigInt']['input']>;
  totalSupply_gt?: InputMaybe<Scalars['BigInt']['input']>;
  totalSupply_lt?: InputMaybe<Scalars['BigInt']['input']>;
  totalSupply_gte?: InputMaybe<Scalars['BigInt']['input']>;
  totalSupply_lte?: InputMaybe<Scalars['BigInt']['input']>;
  totalSupply_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  totalSupply_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  maturity?: InputMaybe<Scalars['BigInt']['input']>;
  maturity_not?: InputMaybe<Scalars['BigInt']['input']>;
  maturity_gt?: InputMaybe<Scalars['BigInt']['input']>;
  maturity_lt?: InputMaybe<Scalars['BigInt']['input']>;
  maturity_gte?: InputMaybe<Scalars['BigInt']['input']>;
  maturity_lte?: InputMaybe<Scalars['BigInt']['input']>;
  maturity_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  maturity_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  vaultAddress?: InputMaybe<Scalars['String']['input']>;
  vaultAddress_not?: InputMaybe<Scalars['String']['input']>;
  vaultAddress_gt?: InputMaybe<Scalars['String']['input']>;
  vaultAddress_lt?: InputMaybe<Scalars['String']['input']>;
  vaultAddress_gte?: InputMaybe<Scalars['String']['input']>;
  vaultAddress_lte?: InputMaybe<Scalars['String']['input']>;
  vaultAddress_in?: InputMaybe<Array<Scalars['String']['input']>>;
  vaultAddress_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  vaultAddress_contains?: InputMaybe<Scalars['String']['input']>;
  vaultAddress_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  vaultAddress_not_contains?: InputMaybe<Scalars['String']['input']>;
  vaultAddress_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  vaultAddress_starts_with?: InputMaybe<Scalars['String']['input']>;
  vaultAddress_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  vaultAddress_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  vaultAddress_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  vaultAddress_ends_with?: InputMaybe<Scalars['String']['input']>;
  vaultAddress_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  vaultAddress_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  vaultAddress_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  vaultAddress_?: InputMaybe<Vault_filter>;
  tokenAddress?: InputMaybe<Scalars['Bytes']['input']>;
  tokenAddress_not?: InputMaybe<Scalars['Bytes']['input']>;
  tokenAddress_gt?: InputMaybe<Scalars['Bytes']['input']>;
  tokenAddress_lt?: InputMaybe<Scalars['Bytes']['input']>;
  tokenAddress_gte?: InputMaybe<Scalars['Bytes']['input']>;
  tokenAddress_lte?: InputMaybe<Scalars['Bytes']['input']>;
  tokenAddress_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  tokenAddress_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  tokenAddress_contains?: InputMaybe<Scalars['Bytes']['input']>;
  tokenAddress_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  balanceOf_?: InputMaybe<Balance_filter>;
  oracles_?: InputMaybe<Oracle_filter>;
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<Token_filter>>>;
  or?: InputMaybe<Array<InputMaybe<Token_filter>>>;
};

export type Token_orderBy =
  | 'id'
  | 'firstUpdateBlockNumber'
  | 'firstUpdateTimestamp'
  | 'firstUpdateTransactionHash'
  | 'lastUpdateBlockNumber'
  | 'lastUpdateTimestamp'
  | 'lastUpdateTransactionHash'
  | 'tokenType'
  | 'tokenInterface'
  | 'underlying'
  | 'underlying__id'
  | 'underlying__firstUpdateBlockNumber'
  | 'underlying__firstUpdateTimestamp'
  | 'underlying__firstUpdateTransactionHash'
  | 'underlying__lastUpdateBlockNumber'
  | 'underlying__lastUpdateTimestamp'
  | 'underlying__lastUpdateTransactionHash'
  | 'underlying__tokenType'
  | 'underlying__tokenInterface'
  | 'underlying__name'
  | 'underlying__symbol'
  | 'underlying__decimals'
  | 'underlying__precision'
  | 'underlying__totalSupply'
  | 'underlying__maturity'
  | 'underlying__tokenAddress'
  | 'name'
  | 'symbol'
  | 'decimals'
  | 'precision'
  | 'totalSupply'
  | 'maturity'
  | 'vaultAddress'
  | 'vaultAddress__id'
  | 'vaultAddress__firstUpdateBlockNumber'
  | 'vaultAddress__firstUpdateTimestamp'
  | 'vaultAddress__firstUpdateTransactionHash'
  | 'vaultAddress__lastUpdateBlockNumber'
  | 'vaultAddress__lastUpdateTimestamp'
  | 'vaultAddress__lastUpdateTransactionHash'
  | 'vaultAddress__isWhitelisted'
  | 'vaultAddress__feeRate'
  | 'vaultAddress__strategyType'
  | 'tokenAddress'
  | 'balanceOf'
  | 'oracles';

export type TokenizedWithdrawRequest = {
  /** Withdraw Request Manager:Request ID */
  id: Scalars['ID']['output'];
  lastUpdateBlockNumber: Scalars['BigInt']['output'];
  lastUpdateTimestamp: Scalars['Int']['output'];
  lastUpdateTransactionHash: Scalars['Bytes']['output'];
  finalizedBlockNumber?: Maybe<Scalars['BigInt']['output']>;
  finalizedTimestamp?: Maybe<Scalars['Int']['output']>;
  finalizedTransactionHash?: Maybe<Scalars['Bytes']['output']>;
  /** Link to the withdraw request manager */
  withdrawRequestManager: WithdrawRequestManager;
  /** Total amount of yield tokens requested */
  totalYieldTokenAmount: Scalars['BigInt']['output'];
  /** Total amount of withdraw tokens requested */
  totalWithdraw: Scalars['BigInt']['output'];
  /** True when finalized */
  finalized: Scalars['Boolean']['output'];
  /** Used to finalize all the holders of the tokenized withdraw request */
  _holders: Array<WithdrawRequest>;
  withdrawRequests?: Maybe<Array<WithdrawRequest>>;
};


export type TokenizedWithdrawRequest_holdersArgs = {
  skip?: InputMaybe<Scalars['Int']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<WithdrawRequest_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<WithdrawRequest_filter>;
};


export type TokenizedWithdrawRequestwithdrawRequestsArgs = {
  skip?: InputMaybe<Scalars['Int']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<WithdrawRequest_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<WithdrawRequest_filter>;
};

export type TokenizedWithdrawRequest_filter = {
  id?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  lastUpdateBlockNumber?: InputMaybe<Scalars['BigInt']['input']>;
  lastUpdateBlockNumber_not?: InputMaybe<Scalars['BigInt']['input']>;
  lastUpdateBlockNumber_gt?: InputMaybe<Scalars['BigInt']['input']>;
  lastUpdateBlockNumber_lt?: InputMaybe<Scalars['BigInt']['input']>;
  lastUpdateBlockNumber_gte?: InputMaybe<Scalars['BigInt']['input']>;
  lastUpdateBlockNumber_lte?: InputMaybe<Scalars['BigInt']['input']>;
  lastUpdateBlockNumber_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  lastUpdateBlockNumber_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  lastUpdateTimestamp?: InputMaybe<Scalars['Int']['input']>;
  lastUpdateTimestamp_not?: InputMaybe<Scalars['Int']['input']>;
  lastUpdateTimestamp_gt?: InputMaybe<Scalars['Int']['input']>;
  lastUpdateTimestamp_lt?: InputMaybe<Scalars['Int']['input']>;
  lastUpdateTimestamp_gte?: InputMaybe<Scalars['Int']['input']>;
  lastUpdateTimestamp_lte?: InputMaybe<Scalars['Int']['input']>;
  lastUpdateTimestamp_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  lastUpdateTimestamp_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  lastUpdateTransactionHash?: InputMaybe<Scalars['Bytes']['input']>;
  lastUpdateTransactionHash_not?: InputMaybe<Scalars['Bytes']['input']>;
  lastUpdateTransactionHash_gt?: InputMaybe<Scalars['Bytes']['input']>;
  lastUpdateTransactionHash_lt?: InputMaybe<Scalars['Bytes']['input']>;
  lastUpdateTransactionHash_gte?: InputMaybe<Scalars['Bytes']['input']>;
  lastUpdateTransactionHash_lte?: InputMaybe<Scalars['Bytes']['input']>;
  lastUpdateTransactionHash_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  lastUpdateTransactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  lastUpdateTransactionHash_contains?: InputMaybe<Scalars['Bytes']['input']>;
  lastUpdateTransactionHash_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  finalizedBlockNumber?: InputMaybe<Scalars['BigInt']['input']>;
  finalizedBlockNumber_not?: InputMaybe<Scalars['BigInt']['input']>;
  finalizedBlockNumber_gt?: InputMaybe<Scalars['BigInt']['input']>;
  finalizedBlockNumber_lt?: InputMaybe<Scalars['BigInt']['input']>;
  finalizedBlockNumber_gte?: InputMaybe<Scalars['BigInt']['input']>;
  finalizedBlockNumber_lte?: InputMaybe<Scalars['BigInt']['input']>;
  finalizedBlockNumber_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  finalizedBlockNumber_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  finalizedTimestamp?: InputMaybe<Scalars['Int']['input']>;
  finalizedTimestamp_not?: InputMaybe<Scalars['Int']['input']>;
  finalizedTimestamp_gt?: InputMaybe<Scalars['Int']['input']>;
  finalizedTimestamp_lt?: InputMaybe<Scalars['Int']['input']>;
  finalizedTimestamp_gte?: InputMaybe<Scalars['Int']['input']>;
  finalizedTimestamp_lte?: InputMaybe<Scalars['Int']['input']>;
  finalizedTimestamp_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  finalizedTimestamp_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  finalizedTransactionHash?: InputMaybe<Scalars['Bytes']['input']>;
  finalizedTransactionHash_not?: InputMaybe<Scalars['Bytes']['input']>;
  finalizedTransactionHash_gt?: InputMaybe<Scalars['Bytes']['input']>;
  finalizedTransactionHash_lt?: InputMaybe<Scalars['Bytes']['input']>;
  finalizedTransactionHash_gte?: InputMaybe<Scalars['Bytes']['input']>;
  finalizedTransactionHash_lte?: InputMaybe<Scalars['Bytes']['input']>;
  finalizedTransactionHash_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  finalizedTransactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  finalizedTransactionHash_contains?: InputMaybe<Scalars['Bytes']['input']>;
  finalizedTransactionHash_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  withdrawRequestManager?: InputMaybe<Scalars['String']['input']>;
  withdrawRequestManager_not?: InputMaybe<Scalars['String']['input']>;
  withdrawRequestManager_gt?: InputMaybe<Scalars['String']['input']>;
  withdrawRequestManager_lt?: InputMaybe<Scalars['String']['input']>;
  withdrawRequestManager_gte?: InputMaybe<Scalars['String']['input']>;
  withdrawRequestManager_lte?: InputMaybe<Scalars['String']['input']>;
  withdrawRequestManager_in?: InputMaybe<Array<Scalars['String']['input']>>;
  withdrawRequestManager_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  withdrawRequestManager_contains?: InputMaybe<Scalars['String']['input']>;
  withdrawRequestManager_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  withdrawRequestManager_not_contains?: InputMaybe<Scalars['String']['input']>;
  withdrawRequestManager_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  withdrawRequestManager_starts_with?: InputMaybe<Scalars['String']['input']>;
  withdrawRequestManager_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  withdrawRequestManager_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  withdrawRequestManager_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  withdrawRequestManager_ends_with?: InputMaybe<Scalars['String']['input']>;
  withdrawRequestManager_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  withdrawRequestManager_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  withdrawRequestManager_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  withdrawRequestManager_?: InputMaybe<WithdrawRequestManager_filter>;
  totalYieldTokenAmount?: InputMaybe<Scalars['BigInt']['input']>;
  totalYieldTokenAmount_not?: InputMaybe<Scalars['BigInt']['input']>;
  totalYieldTokenAmount_gt?: InputMaybe<Scalars['BigInt']['input']>;
  totalYieldTokenAmount_lt?: InputMaybe<Scalars['BigInt']['input']>;
  totalYieldTokenAmount_gte?: InputMaybe<Scalars['BigInt']['input']>;
  totalYieldTokenAmount_lte?: InputMaybe<Scalars['BigInt']['input']>;
  totalYieldTokenAmount_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  totalYieldTokenAmount_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  totalWithdraw?: InputMaybe<Scalars['BigInt']['input']>;
  totalWithdraw_not?: InputMaybe<Scalars['BigInt']['input']>;
  totalWithdraw_gt?: InputMaybe<Scalars['BigInt']['input']>;
  totalWithdraw_lt?: InputMaybe<Scalars['BigInt']['input']>;
  totalWithdraw_gte?: InputMaybe<Scalars['BigInt']['input']>;
  totalWithdraw_lte?: InputMaybe<Scalars['BigInt']['input']>;
  totalWithdraw_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  totalWithdraw_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  finalized?: InputMaybe<Scalars['Boolean']['input']>;
  finalized_not?: InputMaybe<Scalars['Boolean']['input']>;
  finalized_in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  finalized_not_in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  _holders?: InputMaybe<Array<Scalars['String']['input']>>;
  _holders_not?: InputMaybe<Array<Scalars['String']['input']>>;
  _holders_contains?: InputMaybe<Array<Scalars['String']['input']>>;
  _holders_contains_nocase?: InputMaybe<Array<Scalars['String']['input']>>;
  _holders_not_contains?: InputMaybe<Array<Scalars['String']['input']>>;
  _holders_not_contains_nocase?: InputMaybe<Array<Scalars['String']['input']>>;
  _holders_?: InputMaybe<WithdrawRequest_filter>;
  withdrawRequests_?: InputMaybe<WithdrawRequest_filter>;
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<TokenizedWithdrawRequest_filter>>>;
  or?: InputMaybe<Array<InputMaybe<TokenizedWithdrawRequest_filter>>>;
};

export type TokenizedWithdrawRequest_orderBy =
  | 'id'
  | 'lastUpdateBlockNumber'
  | 'lastUpdateTimestamp'
  | 'lastUpdateTransactionHash'
  | 'finalizedBlockNumber'
  | 'finalizedTimestamp'
  | 'finalizedTransactionHash'
  | 'withdrawRequestManager'
  | 'withdrawRequestManager__id'
  | 'withdrawRequestManager__firstUpdateBlockNumber'
  | 'withdrawRequestManager__firstUpdateTimestamp'
  | 'withdrawRequestManager__firstUpdateTransactionHash'
  | 'withdrawRequestManager__lastUpdateBlockNumber'
  | 'withdrawRequestManager__lastUpdateTimestamp'
  | 'withdrawRequestManager__lastUpdateTransactionHash'
  | 'totalYieldTokenAmount'
  | 'totalWithdraw'
  | 'finalized'
  | '_holders'
  | 'withdrawRequests';

export type TradeType =
  | 'EXACT_IN_SINGLE'
  | 'EXACT_OUT_SINGLE'
  | 'EXACT_IN_BATCH'
  | 'EXACT_OUT_BATCH';

export type TradingModulePermission = {
  id: Scalars['ID']['output'];
  lastUpdateBlockNumber: Scalars['BigInt']['output'];
  lastUpdateTimestamp: Scalars['Int']['output'];
  lastUpdateTransactionHash: Scalars['Bytes']['output'];
  sender: Scalars['Bytes']['output'];
  token?: Maybe<Token>;
  tokenAddress: Scalars['Bytes']['output'];
  name: Scalars['String']['output'];
  symbol: Scalars['String']['output'];
  allowedDexes: Array<DEX>;
  allowSell: Scalars['Boolean']['output'];
  allowedTradeTypes: Array<TradeType>;
};

export type TradingModulePermission_filter = {
  id?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  lastUpdateBlockNumber?: InputMaybe<Scalars['BigInt']['input']>;
  lastUpdateBlockNumber_not?: InputMaybe<Scalars['BigInt']['input']>;
  lastUpdateBlockNumber_gt?: InputMaybe<Scalars['BigInt']['input']>;
  lastUpdateBlockNumber_lt?: InputMaybe<Scalars['BigInt']['input']>;
  lastUpdateBlockNumber_gte?: InputMaybe<Scalars['BigInt']['input']>;
  lastUpdateBlockNumber_lte?: InputMaybe<Scalars['BigInt']['input']>;
  lastUpdateBlockNumber_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  lastUpdateBlockNumber_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  lastUpdateTimestamp?: InputMaybe<Scalars['Int']['input']>;
  lastUpdateTimestamp_not?: InputMaybe<Scalars['Int']['input']>;
  lastUpdateTimestamp_gt?: InputMaybe<Scalars['Int']['input']>;
  lastUpdateTimestamp_lt?: InputMaybe<Scalars['Int']['input']>;
  lastUpdateTimestamp_gte?: InputMaybe<Scalars['Int']['input']>;
  lastUpdateTimestamp_lte?: InputMaybe<Scalars['Int']['input']>;
  lastUpdateTimestamp_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  lastUpdateTimestamp_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  lastUpdateTransactionHash?: InputMaybe<Scalars['Bytes']['input']>;
  lastUpdateTransactionHash_not?: InputMaybe<Scalars['Bytes']['input']>;
  lastUpdateTransactionHash_gt?: InputMaybe<Scalars['Bytes']['input']>;
  lastUpdateTransactionHash_lt?: InputMaybe<Scalars['Bytes']['input']>;
  lastUpdateTransactionHash_gte?: InputMaybe<Scalars['Bytes']['input']>;
  lastUpdateTransactionHash_lte?: InputMaybe<Scalars['Bytes']['input']>;
  lastUpdateTransactionHash_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  lastUpdateTransactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  lastUpdateTransactionHash_contains?: InputMaybe<Scalars['Bytes']['input']>;
  lastUpdateTransactionHash_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  sender?: InputMaybe<Scalars['Bytes']['input']>;
  sender_not?: InputMaybe<Scalars['Bytes']['input']>;
  sender_gt?: InputMaybe<Scalars['Bytes']['input']>;
  sender_lt?: InputMaybe<Scalars['Bytes']['input']>;
  sender_gte?: InputMaybe<Scalars['Bytes']['input']>;
  sender_lte?: InputMaybe<Scalars['Bytes']['input']>;
  sender_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  sender_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  sender_contains?: InputMaybe<Scalars['Bytes']['input']>;
  sender_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  token?: InputMaybe<Scalars['String']['input']>;
  token_not?: InputMaybe<Scalars['String']['input']>;
  token_gt?: InputMaybe<Scalars['String']['input']>;
  token_lt?: InputMaybe<Scalars['String']['input']>;
  token_gte?: InputMaybe<Scalars['String']['input']>;
  token_lte?: InputMaybe<Scalars['String']['input']>;
  token_in?: InputMaybe<Array<Scalars['String']['input']>>;
  token_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  token_contains?: InputMaybe<Scalars['String']['input']>;
  token_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  token_not_contains?: InputMaybe<Scalars['String']['input']>;
  token_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  token_starts_with?: InputMaybe<Scalars['String']['input']>;
  token_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  token_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  token_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  token_ends_with?: InputMaybe<Scalars['String']['input']>;
  token_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  token_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  token_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  token_?: InputMaybe<Token_filter>;
  tokenAddress?: InputMaybe<Scalars['Bytes']['input']>;
  tokenAddress_not?: InputMaybe<Scalars['Bytes']['input']>;
  tokenAddress_gt?: InputMaybe<Scalars['Bytes']['input']>;
  tokenAddress_lt?: InputMaybe<Scalars['Bytes']['input']>;
  tokenAddress_gte?: InputMaybe<Scalars['Bytes']['input']>;
  tokenAddress_lte?: InputMaybe<Scalars['Bytes']['input']>;
  tokenAddress_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  tokenAddress_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  tokenAddress_contains?: InputMaybe<Scalars['Bytes']['input']>;
  tokenAddress_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  name_not?: InputMaybe<Scalars['String']['input']>;
  name_gt?: InputMaybe<Scalars['String']['input']>;
  name_lt?: InputMaybe<Scalars['String']['input']>;
  name_gte?: InputMaybe<Scalars['String']['input']>;
  name_lte?: InputMaybe<Scalars['String']['input']>;
  name_in?: InputMaybe<Array<Scalars['String']['input']>>;
  name_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  name_contains?: InputMaybe<Scalars['String']['input']>;
  name_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  name_not_contains?: InputMaybe<Scalars['String']['input']>;
  name_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  name_starts_with?: InputMaybe<Scalars['String']['input']>;
  name_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  name_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  name_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  name_ends_with?: InputMaybe<Scalars['String']['input']>;
  name_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  name_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  name_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  symbol?: InputMaybe<Scalars['String']['input']>;
  symbol_not?: InputMaybe<Scalars['String']['input']>;
  symbol_gt?: InputMaybe<Scalars['String']['input']>;
  symbol_lt?: InputMaybe<Scalars['String']['input']>;
  symbol_gte?: InputMaybe<Scalars['String']['input']>;
  symbol_lte?: InputMaybe<Scalars['String']['input']>;
  symbol_in?: InputMaybe<Array<Scalars['String']['input']>>;
  symbol_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  symbol_contains?: InputMaybe<Scalars['String']['input']>;
  symbol_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  symbol_not_contains?: InputMaybe<Scalars['String']['input']>;
  symbol_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  symbol_starts_with?: InputMaybe<Scalars['String']['input']>;
  symbol_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  symbol_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  symbol_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  symbol_ends_with?: InputMaybe<Scalars['String']['input']>;
  symbol_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  symbol_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  symbol_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  allowedDexes?: InputMaybe<Array<DEX>>;
  allowedDexes_not?: InputMaybe<Array<DEX>>;
  allowedDexes_contains?: InputMaybe<Array<DEX>>;
  allowedDexes_not_contains?: InputMaybe<Array<DEX>>;
  allowSell?: InputMaybe<Scalars['Boolean']['input']>;
  allowSell_not?: InputMaybe<Scalars['Boolean']['input']>;
  allowSell_in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  allowSell_not_in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  allowedTradeTypes?: InputMaybe<Array<TradeType>>;
  allowedTradeTypes_not?: InputMaybe<Array<TradeType>>;
  allowedTradeTypes_contains?: InputMaybe<Array<TradeType>>;
  allowedTradeTypes_not_contains?: InputMaybe<Array<TradeType>>;
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<TradingModulePermission_filter>>>;
  or?: InputMaybe<Array<InputMaybe<TradingModulePermission_filter>>>;
};

export type TradingModulePermission_orderBy =
  | 'id'
  | 'lastUpdateBlockNumber'
  | 'lastUpdateTimestamp'
  | 'lastUpdateTransactionHash'
  | 'sender'
  | 'token'
  | 'token__id'
  | 'token__firstUpdateBlockNumber'
  | 'token__firstUpdateTimestamp'
  | 'token__firstUpdateTransactionHash'
  | 'token__lastUpdateBlockNumber'
  | 'token__lastUpdateTimestamp'
  | 'token__lastUpdateTransactionHash'
  | 'token__tokenType'
  | 'token__tokenInterface'
  | 'token__name'
  | 'token__symbol'
  | 'token__decimals'
  | 'token__precision'
  | 'token__totalSupply'
  | 'token__maturity'
  | 'token__tokenAddress'
  | 'tokenAddress'
  | 'name'
  | 'symbol'
  | 'allowedDexes'
  | 'allowSell'
  | 'allowedTradeTypes';

export type Vault = {
  /** ID is the address of the vault */
  id: Scalars['ID']['output'];
  firstUpdateBlockNumber: Scalars['BigInt']['output'];
  firstUpdateTimestamp: Scalars['Int']['output'];
  firstUpdateTransactionHash: Scalars['Bytes']['output'];
  lastUpdateBlockNumber: Scalars['BigInt']['output'];
  lastUpdateTimestamp: Scalars['Int']['output'];
  lastUpdateTransactionHash: Scalars['Bytes']['output'];
  isWhitelisted: Scalars['Boolean']['output'];
  /** Token that the vault borrows in */
  asset: Token;
  /** Token that the vault yields */
  yieldToken: Token;
  /** Token that represents the vault */
  vaultToken: Token;
  /** Token that the vault uses for accounting */
  accountingAsset: Token;
  /** Fee rate of the vault */
  feeRate: Scalars['BigInt']['output'];
  /** Strategy type of the vault */
  strategyType: Scalars['String']['output'];
  withdrawRequestManagers: Array<WithdrawRequestManager>;
  withdrawRequests?: Maybe<Array<WithdrawRequest>>;
  markets?: Maybe<Array<Market>>;
};


export type VaultwithdrawRequestManagersArgs = {
  skip?: InputMaybe<Scalars['Int']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<WithdrawRequestManager_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<WithdrawRequestManager_filter>;
};


export type VaultwithdrawRequestsArgs = {
  skip?: InputMaybe<Scalars['Int']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<WithdrawRequest_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<WithdrawRequest_filter>;
};


export type VaultmarketsArgs = {
  skip?: InputMaybe<Scalars['Int']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Market_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<Market_filter>;
};

export type Vault_filter = {
  id?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  firstUpdateBlockNumber?: InputMaybe<Scalars['BigInt']['input']>;
  firstUpdateBlockNumber_not?: InputMaybe<Scalars['BigInt']['input']>;
  firstUpdateBlockNumber_gt?: InputMaybe<Scalars['BigInt']['input']>;
  firstUpdateBlockNumber_lt?: InputMaybe<Scalars['BigInt']['input']>;
  firstUpdateBlockNumber_gte?: InputMaybe<Scalars['BigInt']['input']>;
  firstUpdateBlockNumber_lte?: InputMaybe<Scalars['BigInt']['input']>;
  firstUpdateBlockNumber_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  firstUpdateBlockNumber_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  firstUpdateTimestamp?: InputMaybe<Scalars['Int']['input']>;
  firstUpdateTimestamp_not?: InputMaybe<Scalars['Int']['input']>;
  firstUpdateTimestamp_gt?: InputMaybe<Scalars['Int']['input']>;
  firstUpdateTimestamp_lt?: InputMaybe<Scalars['Int']['input']>;
  firstUpdateTimestamp_gte?: InputMaybe<Scalars['Int']['input']>;
  firstUpdateTimestamp_lte?: InputMaybe<Scalars['Int']['input']>;
  firstUpdateTimestamp_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  firstUpdateTimestamp_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  firstUpdateTransactionHash?: InputMaybe<Scalars['Bytes']['input']>;
  firstUpdateTransactionHash_not?: InputMaybe<Scalars['Bytes']['input']>;
  firstUpdateTransactionHash_gt?: InputMaybe<Scalars['Bytes']['input']>;
  firstUpdateTransactionHash_lt?: InputMaybe<Scalars['Bytes']['input']>;
  firstUpdateTransactionHash_gte?: InputMaybe<Scalars['Bytes']['input']>;
  firstUpdateTransactionHash_lte?: InputMaybe<Scalars['Bytes']['input']>;
  firstUpdateTransactionHash_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  firstUpdateTransactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  firstUpdateTransactionHash_contains?: InputMaybe<Scalars['Bytes']['input']>;
  firstUpdateTransactionHash_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  lastUpdateBlockNumber?: InputMaybe<Scalars['BigInt']['input']>;
  lastUpdateBlockNumber_not?: InputMaybe<Scalars['BigInt']['input']>;
  lastUpdateBlockNumber_gt?: InputMaybe<Scalars['BigInt']['input']>;
  lastUpdateBlockNumber_lt?: InputMaybe<Scalars['BigInt']['input']>;
  lastUpdateBlockNumber_gte?: InputMaybe<Scalars['BigInt']['input']>;
  lastUpdateBlockNumber_lte?: InputMaybe<Scalars['BigInt']['input']>;
  lastUpdateBlockNumber_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  lastUpdateBlockNumber_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  lastUpdateTimestamp?: InputMaybe<Scalars['Int']['input']>;
  lastUpdateTimestamp_not?: InputMaybe<Scalars['Int']['input']>;
  lastUpdateTimestamp_gt?: InputMaybe<Scalars['Int']['input']>;
  lastUpdateTimestamp_lt?: InputMaybe<Scalars['Int']['input']>;
  lastUpdateTimestamp_gte?: InputMaybe<Scalars['Int']['input']>;
  lastUpdateTimestamp_lte?: InputMaybe<Scalars['Int']['input']>;
  lastUpdateTimestamp_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  lastUpdateTimestamp_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  lastUpdateTransactionHash?: InputMaybe<Scalars['Bytes']['input']>;
  lastUpdateTransactionHash_not?: InputMaybe<Scalars['Bytes']['input']>;
  lastUpdateTransactionHash_gt?: InputMaybe<Scalars['Bytes']['input']>;
  lastUpdateTransactionHash_lt?: InputMaybe<Scalars['Bytes']['input']>;
  lastUpdateTransactionHash_gte?: InputMaybe<Scalars['Bytes']['input']>;
  lastUpdateTransactionHash_lte?: InputMaybe<Scalars['Bytes']['input']>;
  lastUpdateTransactionHash_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  lastUpdateTransactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  lastUpdateTransactionHash_contains?: InputMaybe<Scalars['Bytes']['input']>;
  lastUpdateTransactionHash_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  isWhitelisted?: InputMaybe<Scalars['Boolean']['input']>;
  isWhitelisted_not?: InputMaybe<Scalars['Boolean']['input']>;
  isWhitelisted_in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  isWhitelisted_not_in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  asset?: InputMaybe<Scalars['String']['input']>;
  asset_not?: InputMaybe<Scalars['String']['input']>;
  asset_gt?: InputMaybe<Scalars['String']['input']>;
  asset_lt?: InputMaybe<Scalars['String']['input']>;
  asset_gte?: InputMaybe<Scalars['String']['input']>;
  asset_lte?: InputMaybe<Scalars['String']['input']>;
  asset_in?: InputMaybe<Array<Scalars['String']['input']>>;
  asset_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  asset_contains?: InputMaybe<Scalars['String']['input']>;
  asset_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  asset_not_contains?: InputMaybe<Scalars['String']['input']>;
  asset_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  asset_starts_with?: InputMaybe<Scalars['String']['input']>;
  asset_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  asset_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  asset_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  asset_ends_with?: InputMaybe<Scalars['String']['input']>;
  asset_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  asset_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  asset_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  asset_?: InputMaybe<Token_filter>;
  yieldToken?: InputMaybe<Scalars['String']['input']>;
  yieldToken_not?: InputMaybe<Scalars['String']['input']>;
  yieldToken_gt?: InputMaybe<Scalars['String']['input']>;
  yieldToken_lt?: InputMaybe<Scalars['String']['input']>;
  yieldToken_gte?: InputMaybe<Scalars['String']['input']>;
  yieldToken_lte?: InputMaybe<Scalars['String']['input']>;
  yieldToken_in?: InputMaybe<Array<Scalars['String']['input']>>;
  yieldToken_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  yieldToken_contains?: InputMaybe<Scalars['String']['input']>;
  yieldToken_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  yieldToken_not_contains?: InputMaybe<Scalars['String']['input']>;
  yieldToken_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  yieldToken_starts_with?: InputMaybe<Scalars['String']['input']>;
  yieldToken_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  yieldToken_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  yieldToken_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  yieldToken_ends_with?: InputMaybe<Scalars['String']['input']>;
  yieldToken_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  yieldToken_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  yieldToken_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  yieldToken_?: InputMaybe<Token_filter>;
  vaultToken?: InputMaybe<Scalars['String']['input']>;
  vaultToken_not?: InputMaybe<Scalars['String']['input']>;
  vaultToken_gt?: InputMaybe<Scalars['String']['input']>;
  vaultToken_lt?: InputMaybe<Scalars['String']['input']>;
  vaultToken_gte?: InputMaybe<Scalars['String']['input']>;
  vaultToken_lte?: InputMaybe<Scalars['String']['input']>;
  vaultToken_in?: InputMaybe<Array<Scalars['String']['input']>>;
  vaultToken_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  vaultToken_contains?: InputMaybe<Scalars['String']['input']>;
  vaultToken_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  vaultToken_not_contains?: InputMaybe<Scalars['String']['input']>;
  vaultToken_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  vaultToken_starts_with?: InputMaybe<Scalars['String']['input']>;
  vaultToken_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  vaultToken_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  vaultToken_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  vaultToken_ends_with?: InputMaybe<Scalars['String']['input']>;
  vaultToken_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  vaultToken_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  vaultToken_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  vaultToken_?: InputMaybe<Token_filter>;
  accountingAsset?: InputMaybe<Scalars['String']['input']>;
  accountingAsset_not?: InputMaybe<Scalars['String']['input']>;
  accountingAsset_gt?: InputMaybe<Scalars['String']['input']>;
  accountingAsset_lt?: InputMaybe<Scalars['String']['input']>;
  accountingAsset_gte?: InputMaybe<Scalars['String']['input']>;
  accountingAsset_lte?: InputMaybe<Scalars['String']['input']>;
  accountingAsset_in?: InputMaybe<Array<Scalars['String']['input']>>;
  accountingAsset_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  accountingAsset_contains?: InputMaybe<Scalars['String']['input']>;
  accountingAsset_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  accountingAsset_not_contains?: InputMaybe<Scalars['String']['input']>;
  accountingAsset_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  accountingAsset_starts_with?: InputMaybe<Scalars['String']['input']>;
  accountingAsset_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  accountingAsset_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  accountingAsset_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  accountingAsset_ends_with?: InputMaybe<Scalars['String']['input']>;
  accountingAsset_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  accountingAsset_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  accountingAsset_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  accountingAsset_?: InputMaybe<Token_filter>;
  feeRate?: InputMaybe<Scalars['BigInt']['input']>;
  feeRate_not?: InputMaybe<Scalars['BigInt']['input']>;
  feeRate_gt?: InputMaybe<Scalars['BigInt']['input']>;
  feeRate_lt?: InputMaybe<Scalars['BigInt']['input']>;
  feeRate_gte?: InputMaybe<Scalars['BigInt']['input']>;
  feeRate_lte?: InputMaybe<Scalars['BigInt']['input']>;
  feeRate_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  feeRate_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  strategyType?: InputMaybe<Scalars['String']['input']>;
  strategyType_not?: InputMaybe<Scalars['String']['input']>;
  strategyType_gt?: InputMaybe<Scalars['String']['input']>;
  strategyType_lt?: InputMaybe<Scalars['String']['input']>;
  strategyType_gte?: InputMaybe<Scalars['String']['input']>;
  strategyType_lte?: InputMaybe<Scalars['String']['input']>;
  strategyType_in?: InputMaybe<Array<Scalars['String']['input']>>;
  strategyType_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  strategyType_contains?: InputMaybe<Scalars['String']['input']>;
  strategyType_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  strategyType_not_contains?: InputMaybe<Scalars['String']['input']>;
  strategyType_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  strategyType_starts_with?: InputMaybe<Scalars['String']['input']>;
  strategyType_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  strategyType_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  strategyType_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  strategyType_ends_with?: InputMaybe<Scalars['String']['input']>;
  strategyType_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  strategyType_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  strategyType_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  withdrawRequestManagers?: InputMaybe<Array<Scalars['String']['input']>>;
  withdrawRequestManagers_not?: InputMaybe<Array<Scalars['String']['input']>>;
  withdrawRequestManagers_contains?: InputMaybe<Array<Scalars['String']['input']>>;
  withdrawRequestManagers_contains_nocase?: InputMaybe<Array<Scalars['String']['input']>>;
  withdrawRequestManagers_not_contains?: InputMaybe<Array<Scalars['String']['input']>>;
  withdrawRequestManagers_not_contains_nocase?: InputMaybe<Array<Scalars['String']['input']>>;
  withdrawRequestManagers_?: InputMaybe<WithdrawRequestManager_filter>;
  withdrawRequests_?: InputMaybe<WithdrawRequest_filter>;
  markets_?: InputMaybe<Market_filter>;
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<Vault_filter>>>;
  or?: InputMaybe<Array<InputMaybe<Vault_filter>>>;
};

export type Vault_orderBy =
  | 'id'
  | 'firstUpdateBlockNumber'
  | 'firstUpdateTimestamp'
  | 'firstUpdateTransactionHash'
  | 'lastUpdateBlockNumber'
  | 'lastUpdateTimestamp'
  | 'lastUpdateTransactionHash'
  | 'isWhitelisted'
  | 'asset'
  | 'asset__id'
  | 'asset__firstUpdateBlockNumber'
  | 'asset__firstUpdateTimestamp'
  | 'asset__firstUpdateTransactionHash'
  | 'asset__lastUpdateBlockNumber'
  | 'asset__lastUpdateTimestamp'
  | 'asset__lastUpdateTransactionHash'
  | 'asset__tokenType'
  | 'asset__tokenInterface'
  | 'asset__name'
  | 'asset__symbol'
  | 'asset__decimals'
  | 'asset__precision'
  | 'asset__totalSupply'
  | 'asset__maturity'
  | 'asset__tokenAddress'
  | 'yieldToken'
  | 'yieldToken__id'
  | 'yieldToken__firstUpdateBlockNumber'
  | 'yieldToken__firstUpdateTimestamp'
  | 'yieldToken__firstUpdateTransactionHash'
  | 'yieldToken__lastUpdateBlockNumber'
  | 'yieldToken__lastUpdateTimestamp'
  | 'yieldToken__lastUpdateTransactionHash'
  | 'yieldToken__tokenType'
  | 'yieldToken__tokenInterface'
  | 'yieldToken__name'
  | 'yieldToken__symbol'
  | 'yieldToken__decimals'
  | 'yieldToken__precision'
  | 'yieldToken__totalSupply'
  | 'yieldToken__maturity'
  | 'yieldToken__tokenAddress'
  | 'vaultToken'
  | 'vaultToken__id'
  | 'vaultToken__firstUpdateBlockNumber'
  | 'vaultToken__firstUpdateTimestamp'
  | 'vaultToken__firstUpdateTransactionHash'
  | 'vaultToken__lastUpdateBlockNumber'
  | 'vaultToken__lastUpdateTimestamp'
  | 'vaultToken__lastUpdateTransactionHash'
  | 'vaultToken__tokenType'
  | 'vaultToken__tokenInterface'
  | 'vaultToken__name'
  | 'vaultToken__symbol'
  | 'vaultToken__decimals'
  | 'vaultToken__precision'
  | 'vaultToken__totalSupply'
  | 'vaultToken__maturity'
  | 'vaultToken__tokenAddress'
  | 'accountingAsset'
  | 'accountingAsset__id'
  | 'accountingAsset__firstUpdateBlockNumber'
  | 'accountingAsset__firstUpdateTimestamp'
  | 'accountingAsset__firstUpdateTransactionHash'
  | 'accountingAsset__lastUpdateBlockNumber'
  | 'accountingAsset__lastUpdateTimestamp'
  | 'accountingAsset__lastUpdateTransactionHash'
  | 'accountingAsset__tokenType'
  | 'accountingAsset__tokenInterface'
  | 'accountingAsset__name'
  | 'accountingAsset__symbol'
  | 'accountingAsset__decimals'
  | 'accountingAsset__precision'
  | 'accountingAsset__totalSupply'
  | 'accountingAsset__maturity'
  | 'accountingAsset__tokenAddress'
  | 'feeRate'
  | 'strategyType'
  | 'withdrawRequestManagers'
  | 'withdrawRequests'
  | 'markets';

export type WithdrawRequest = {
  /** Withdraw Request Manager:Vault:Account */
  id: Scalars['ID']['output'];
  lastUpdateBlockNumber: Scalars['BigInt']['output'];
  lastUpdateTimestamp: Scalars['Int']['output'];
  lastUpdateTransactionHash: Scalars['Bytes']['output'];
  /** Link to the withdraw request manager */
  withdrawRequestManager: WithdrawRequestManager;
  /** Link to the account that requested the withdraw */
  account: Account;
  /** Link to the vault that the withdraw request is for */
  vault: Vault;
  /** Link to the vault share balance that the withdraw request is for */
  balance: Balance;
  /** Request identifier for the withdraw request */
  requestId: Scalars['BigInt']['output'];
  /** Amount of yield tokens requested */
  yieldTokenAmount: Scalars['BigInt']['output'];
  /** Amount of vault shares requested */
  sharesAmount: Scalars['BigInt']['output'];
  /** Link to a tokenized withdraw request, if it exists */
  tokenizedWithdrawRequest?: Maybe<TokenizedWithdrawRequest>;
};

export type WithdrawRequestManager = {
  id: Scalars['ID']['output'];
  firstUpdateBlockNumber: Scalars['BigInt']['output'];
  firstUpdateTimestamp: Scalars['Int']['output'];
  firstUpdateTransactionHash: Scalars['Bytes']['output'];
  lastUpdateBlockNumber: Scalars['BigInt']['output'];
  lastUpdateTimestamp: Scalars['Int']['output'];
  lastUpdateTransactionHash: Scalars['Bytes']['output'];
  yieldToken: Token;
  withdrawToken: Token;
  stakingToken: Token;
  approvedVaults?: Maybe<Array<Vault>>;
  withdrawRequests?: Maybe<Array<WithdrawRequest>>;
  tokenizedWithdrawRequests?: Maybe<Array<TokenizedWithdrawRequest>>;
};


export type WithdrawRequestManagerapprovedVaultsArgs = {
  skip?: InputMaybe<Scalars['Int']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Vault_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<Vault_filter>;
};


export type WithdrawRequestManagerwithdrawRequestsArgs = {
  skip?: InputMaybe<Scalars['Int']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<WithdrawRequest_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<WithdrawRequest_filter>;
};


export type WithdrawRequestManagertokenizedWithdrawRequestsArgs = {
  skip?: InputMaybe<Scalars['Int']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<TokenizedWithdrawRequest_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<TokenizedWithdrawRequest_filter>;
};

export type WithdrawRequestManager_filter = {
  id?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  firstUpdateBlockNumber?: InputMaybe<Scalars['BigInt']['input']>;
  firstUpdateBlockNumber_not?: InputMaybe<Scalars['BigInt']['input']>;
  firstUpdateBlockNumber_gt?: InputMaybe<Scalars['BigInt']['input']>;
  firstUpdateBlockNumber_lt?: InputMaybe<Scalars['BigInt']['input']>;
  firstUpdateBlockNumber_gte?: InputMaybe<Scalars['BigInt']['input']>;
  firstUpdateBlockNumber_lte?: InputMaybe<Scalars['BigInt']['input']>;
  firstUpdateBlockNumber_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  firstUpdateBlockNumber_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  firstUpdateTimestamp?: InputMaybe<Scalars['Int']['input']>;
  firstUpdateTimestamp_not?: InputMaybe<Scalars['Int']['input']>;
  firstUpdateTimestamp_gt?: InputMaybe<Scalars['Int']['input']>;
  firstUpdateTimestamp_lt?: InputMaybe<Scalars['Int']['input']>;
  firstUpdateTimestamp_gte?: InputMaybe<Scalars['Int']['input']>;
  firstUpdateTimestamp_lte?: InputMaybe<Scalars['Int']['input']>;
  firstUpdateTimestamp_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  firstUpdateTimestamp_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  firstUpdateTransactionHash?: InputMaybe<Scalars['Bytes']['input']>;
  firstUpdateTransactionHash_not?: InputMaybe<Scalars['Bytes']['input']>;
  firstUpdateTransactionHash_gt?: InputMaybe<Scalars['Bytes']['input']>;
  firstUpdateTransactionHash_lt?: InputMaybe<Scalars['Bytes']['input']>;
  firstUpdateTransactionHash_gte?: InputMaybe<Scalars['Bytes']['input']>;
  firstUpdateTransactionHash_lte?: InputMaybe<Scalars['Bytes']['input']>;
  firstUpdateTransactionHash_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  firstUpdateTransactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  firstUpdateTransactionHash_contains?: InputMaybe<Scalars['Bytes']['input']>;
  firstUpdateTransactionHash_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  lastUpdateBlockNumber?: InputMaybe<Scalars['BigInt']['input']>;
  lastUpdateBlockNumber_not?: InputMaybe<Scalars['BigInt']['input']>;
  lastUpdateBlockNumber_gt?: InputMaybe<Scalars['BigInt']['input']>;
  lastUpdateBlockNumber_lt?: InputMaybe<Scalars['BigInt']['input']>;
  lastUpdateBlockNumber_gte?: InputMaybe<Scalars['BigInt']['input']>;
  lastUpdateBlockNumber_lte?: InputMaybe<Scalars['BigInt']['input']>;
  lastUpdateBlockNumber_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  lastUpdateBlockNumber_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  lastUpdateTimestamp?: InputMaybe<Scalars['Int']['input']>;
  lastUpdateTimestamp_not?: InputMaybe<Scalars['Int']['input']>;
  lastUpdateTimestamp_gt?: InputMaybe<Scalars['Int']['input']>;
  lastUpdateTimestamp_lt?: InputMaybe<Scalars['Int']['input']>;
  lastUpdateTimestamp_gte?: InputMaybe<Scalars['Int']['input']>;
  lastUpdateTimestamp_lte?: InputMaybe<Scalars['Int']['input']>;
  lastUpdateTimestamp_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  lastUpdateTimestamp_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  lastUpdateTransactionHash?: InputMaybe<Scalars['Bytes']['input']>;
  lastUpdateTransactionHash_not?: InputMaybe<Scalars['Bytes']['input']>;
  lastUpdateTransactionHash_gt?: InputMaybe<Scalars['Bytes']['input']>;
  lastUpdateTransactionHash_lt?: InputMaybe<Scalars['Bytes']['input']>;
  lastUpdateTransactionHash_gte?: InputMaybe<Scalars['Bytes']['input']>;
  lastUpdateTransactionHash_lte?: InputMaybe<Scalars['Bytes']['input']>;
  lastUpdateTransactionHash_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  lastUpdateTransactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  lastUpdateTransactionHash_contains?: InputMaybe<Scalars['Bytes']['input']>;
  lastUpdateTransactionHash_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  yieldToken?: InputMaybe<Scalars['String']['input']>;
  yieldToken_not?: InputMaybe<Scalars['String']['input']>;
  yieldToken_gt?: InputMaybe<Scalars['String']['input']>;
  yieldToken_lt?: InputMaybe<Scalars['String']['input']>;
  yieldToken_gte?: InputMaybe<Scalars['String']['input']>;
  yieldToken_lte?: InputMaybe<Scalars['String']['input']>;
  yieldToken_in?: InputMaybe<Array<Scalars['String']['input']>>;
  yieldToken_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  yieldToken_contains?: InputMaybe<Scalars['String']['input']>;
  yieldToken_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  yieldToken_not_contains?: InputMaybe<Scalars['String']['input']>;
  yieldToken_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  yieldToken_starts_with?: InputMaybe<Scalars['String']['input']>;
  yieldToken_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  yieldToken_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  yieldToken_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  yieldToken_ends_with?: InputMaybe<Scalars['String']['input']>;
  yieldToken_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  yieldToken_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  yieldToken_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  yieldToken_?: InputMaybe<Token_filter>;
  withdrawToken?: InputMaybe<Scalars['String']['input']>;
  withdrawToken_not?: InputMaybe<Scalars['String']['input']>;
  withdrawToken_gt?: InputMaybe<Scalars['String']['input']>;
  withdrawToken_lt?: InputMaybe<Scalars['String']['input']>;
  withdrawToken_gte?: InputMaybe<Scalars['String']['input']>;
  withdrawToken_lte?: InputMaybe<Scalars['String']['input']>;
  withdrawToken_in?: InputMaybe<Array<Scalars['String']['input']>>;
  withdrawToken_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  withdrawToken_contains?: InputMaybe<Scalars['String']['input']>;
  withdrawToken_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  withdrawToken_not_contains?: InputMaybe<Scalars['String']['input']>;
  withdrawToken_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  withdrawToken_starts_with?: InputMaybe<Scalars['String']['input']>;
  withdrawToken_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  withdrawToken_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  withdrawToken_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  withdrawToken_ends_with?: InputMaybe<Scalars['String']['input']>;
  withdrawToken_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  withdrawToken_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  withdrawToken_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  withdrawToken_?: InputMaybe<Token_filter>;
  stakingToken?: InputMaybe<Scalars['String']['input']>;
  stakingToken_not?: InputMaybe<Scalars['String']['input']>;
  stakingToken_gt?: InputMaybe<Scalars['String']['input']>;
  stakingToken_lt?: InputMaybe<Scalars['String']['input']>;
  stakingToken_gte?: InputMaybe<Scalars['String']['input']>;
  stakingToken_lte?: InputMaybe<Scalars['String']['input']>;
  stakingToken_in?: InputMaybe<Array<Scalars['String']['input']>>;
  stakingToken_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  stakingToken_contains?: InputMaybe<Scalars['String']['input']>;
  stakingToken_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  stakingToken_not_contains?: InputMaybe<Scalars['String']['input']>;
  stakingToken_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  stakingToken_starts_with?: InputMaybe<Scalars['String']['input']>;
  stakingToken_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  stakingToken_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  stakingToken_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  stakingToken_ends_with?: InputMaybe<Scalars['String']['input']>;
  stakingToken_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  stakingToken_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  stakingToken_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  stakingToken_?: InputMaybe<Token_filter>;
  approvedVaults_?: InputMaybe<Vault_filter>;
  withdrawRequests_?: InputMaybe<WithdrawRequest_filter>;
  tokenizedWithdrawRequests_?: InputMaybe<TokenizedWithdrawRequest_filter>;
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<WithdrawRequestManager_filter>>>;
  or?: InputMaybe<Array<InputMaybe<WithdrawRequestManager_filter>>>;
};

export type WithdrawRequestManager_orderBy =
  | 'id'
  | 'firstUpdateBlockNumber'
  | 'firstUpdateTimestamp'
  | 'firstUpdateTransactionHash'
  | 'lastUpdateBlockNumber'
  | 'lastUpdateTimestamp'
  | 'lastUpdateTransactionHash'
  | 'yieldToken'
  | 'yieldToken__id'
  | 'yieldToken__firstUpdateBlockNumber'
  | 'yieldToken__firstUpdateTimestamp'
  | 'yieldToken__firstUpdateTransactionHash'
  | 'yieldToken__lastUpdateBlockNumber'
  | 'yieldToken__lastUpdateTimestamp'
  | 'yieldToken__lastUpdateTransactionHash'
  | 'yieldToken__tokenType'
  | 'yieldToken__tokenInterface'
  | 'yieldToken__name'
  | 'yieldToken__symbol'
  | 'yieldToken__decimals'
  | 'yieldToken__precision'
  | 'yieldToken__totalSupply'
  | 'yieldToken__maturity'
  | 'yieldToken__tokenAddress'
  | 'withdrawToken'
  | 'withdrawToken__id'
  | 'withdrawToken__firstUpdateBlockNumber'
  | 'withdrawToken__firstUpdateTimestamp'
  | 'withdrawToken__firstUpdateTransactionHash'
  | 'withdrawToken__lastUpdateBlockNumber'
  | 'withdrawToken__lastUpdateTimestamp'
  | 'withdrawToken__lastUpdateTransactionHash'
  | 'withdrawToken__tokenType'
  | 'withdrawToken__tokenInterface'
  | 'withdrawToken__name'
  | 'withdrawToken__symbol'
  | 'withdrawToken__decimals'
  | 'withdrawToken__precision'
  | 'withdrawToken__totalSupply'
  | 'withdrawToken__maturity'
  | 'withdrawToken__tokenAddress'
  | 'stakingToken'
  | 'stakingToken__id'
  | 'stakingToken__firstUpdateBlockNumber'
  | 'stakingToken__firstUpdateTimestamp'
  | 'stakingToken__firstUpdateTransactionHash'
  | 'stakingToken__lastUpdateBlockNumber'
  | 'stakingToken__lastUpdateTimestamp'
  | 'stakingToken__lastUpdateTransactionHash'
  | 'stakingToken__tokenType'
  | 'stakingToken__tokenInterface'
  | 'stakingToken__name'
  | 'stakingToken__symbol'
  | 'stakingToken__decimals'
  | 'stakingToken__precision'
  | 'stakingToken__totalSupply'
  | 'stakingToken__maturity'
  | 'stakingToken__tokenAddress'
  | 'approvedVaults'
  | 'withdrawRequests'
  | 'tokenizedWithdrawRequests';

export type WithdrawRequest_filter = {
  id?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  lastUpdateBlockNumber?: InputMaybe<Scalars['BigInt']['input']>;
  lastUpdateBlockNumber_not?: InputMaybe<Scalars['BigInt']['input']>;
  lastUpdateBlockNumber_gt?: InputMaybe<Scalars['BigInt']['input']>;
  lastUpdateBlockNumber_lt?: InputMaybe<Scalars['BigInt']['input']>;
  lastUpdateBlockNumber_gte?: InputMaybe<Scalars['BigInt']['input']>;
  lastUpdateBlockNumber_lte?: InputMaybe<Scalars['BigInt']['input']>;
  lastUpdateBlockNumber_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  lastUpdateBlockNumber_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  lastUpdateTimestamp?: InputMaybe<Scalars['Int']['input']>;
  lastUpdateTimestamp_not?: InputMaybe<Scalars['Int']['input']>;
  lastUpdateTimestamp_gt?: InputMaybe<Scalars['Int']['input']>;
  lastUpdateTimestamp_lt?: InputMaybe<Scalars['Int']['input']>;
  lastUpdateTimestamp_gte?: InputMaybe<Scalars['Int']['input']>;
  lastUpdateTimestamp_lte?: InputMaybe<Scalars['Int']['input']>;
  lastUpdateTimestamp_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  lastUpdateTimestamp_not_in?: InputMaybe<Array<Scalars['Int']['input']>>;
  lastUpdateTransactionHash?: InputMaybe<Scalars['Bytes']['input']>;
  lastUpdateTransactionHash_not?: InputMaybe<Scalars['Bytes']['input']>;
  lastUpdateTransactionHash_gt?: InputMaybe<Scalars['Bytes']['input']>;
  lastUpdateTransactionHash_lt?: InputMaybe<Scalars['Bytes']['input']>;
  lastUpdateTransactionHash_gte?: InputMaybe<Scalars['Bytes']['input']>;
  lastUpdateTransactionHash_lte?: InputMaybe<Scalars['Bytes']['input']>;
  lastUpdateTransactionHash_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  lastUpdateTransactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  lastUpdateTransactionHash_contains?: InputMaybe<Scalars['Bytes']['input']>;
  lastUpdateTransactionHash_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  withdrawRequestManager?: InputMaybe<Scalars['String']['input']>;
  withdrawRequestManager_not?: InputMaybe<Scalars['String']['input']>;
  withdrawRequestManager_gt?: InputMaybe<Scalars['String']['input']>;
  withdrawRequestManager_lt?: InputMaybe<Scalars['String']['input']>;
  withdrawRequestManager_gte?: InputMaybe<Scalars['String']['input']>;
  withdrawRequestManager_lte?: InputMaybe<Scalars['String']['input']>;
  withdrawRequestManager_in?: InputMaybe<Array<Scalars['String']['input']>>;
  withdrawRequestManager_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  withdrawRequestManager_contains?: InputMaybe<Scalars['String']['input']>;
  withdrawRequestManager_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  withdrawRequestManager_not_contains?: InputMaybe<Scalars['String']['input']>;
  withdrawRequestManager_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  withdrawRequestManager_starts_with?: InputMaybe<Scalars['String']['input']>;
  withdrawRequestManager_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  withdrawRequestManager_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  withdrawRequestManager_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  withdrawRequestManager_ends_with?: InputMaybe<Scalars['String']['input']>;
  withdrawRequestManager_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  withdrawRequestManager_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  withdrawRequestManager_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  withdrawRequestManager_?: InputMaybe<WithdrawRequestManager_filter>;
  account?: InputMaybe<Scalars['String']['input']>;
  account_not?: InputMaybe<Scalars['String']['input']>;
  account_gt?: InputMaybe<Scalars['String']['input']>;
  account_lt?: InputMaybe<Scalars['String']['input']>;
  account_gte?: InputMaybe<Scalars['String']['input']>;
  account_lte?: InputMaybe<Scalars['String']['input']>;
  account_in?: InputMaybe<Array<Scalars['String']['input']>>;
  account_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  account_contains?: InputMaybe<Scalars['String']['input']>;
  account_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  account_not_contains?: InputMaybe<Scalars['String']['input']>;
  account_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  account_starts_with?: InputMaybe<Scalars['String']['input']>;
  account_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  account_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  account_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  account_ends_with?: InputMaybe<Scalars['String']['input']>;
  account_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  account_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  account_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  account_?: InputMaybe<Account_filter>;
  vault?: InputMaybe<Scalars['String']['input']>;
  vault_not?: InputMaybe<Scalars['String']['input']>;
  vault_gt?: InputMaybe<Scalars['String']['input']>;
  vault_lt?: InputMaybe<Scalars['String']['input']>;
  vault_gte?: InputMaybe<Scalars['String']['input']>;
  vault_lte?: InputMaybe<Scalars['String']['input']>;
  vault_in?: InputMaybe<Array<Scalars['String']['input']>>;
  vault_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  vault_contains?: InputMaybe<Scalars['String']['input']>;
  vault_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  vault_not_contains?: InputMaybe<Scalars['String']['input']>;
  vault_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  vault_starts_with?: InputMaybe<Scalars['String']['input']>;
  vault_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  vault_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  vault_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  vault_ends_with?: InputMaybe<Scalars['String']['input']>;
  vault_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  vault_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  vault_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  vault_?: InputMaybe<Vault_filter>;
  balance?: InputMaybe<Scalars['String']['input']>;
  balance_not?: InputMaybe<Scalars['String']['input']>;
  balance_gt?: InputMaybe<Scalars['String']['input']>;
  balance_lt?: InputMaybe<Scalars['String']['input']>;
  balance_gte?: InputMaybe<Scalars['String']['input']>;
  balance_lte?: InputMaybe<Scalars['String']['input']>;
  balance_in?: InputMaybe<Array<Scalars['String']['input']>>;
  balance_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  balance_contains?: InputMaybe<Scalars['String']['input']>;
  balance_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  balance_not_contains?: InputMaybe<Scalars['String']['input']>;
  balance_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  balance_starts_with?: InputMaybe<Scalars['String']['input']>;
  balance_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  balance_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  balance_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  balance_ends_with?: InputMaybe<Scalars['String']['input']>;
  balance_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  balance_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  balance_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  balance_?: InputMaybe<Balance_filter>;
  requestId?: InputMaybe<Scalars['BigInt']['input']>;
  requestId_not?: InputMaybe<Scalars['BigInt']['input']>;
  requestId_gt?: InputMaybe<Scalars['BigInt']['input']>;
  requestId_lt?: InputMaybe<Scalars['BigInt']['input']>;
  requestId_gte?: InputMaybe<Scalars['BigInt']['input']>;
  requestId_lte?: InputMaybe<Scalars['BigInt']['input']>;
  requestId_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  requestId_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  yieldTokenAmount?: InputMaybe<Scalars['BigInt']['input']>;
  yieldTokenAmount_not?: InputMaybe<Scalars['BigInt']['input']>;
  yieldTokenAmount_gt?: InputMaybe<Scalars['BigInt']['input']>;
  yieldTokenAmount_lt?: InputMaybe<Scalars['BigInt']['input']>;
  yieldTokenAmount_gte?: InputMaybe<Scalars['BigInt']['input']>;
  yieldTokenAmount_lte?: InputMaybe<Scalars['BigInt']['input']>;
  yieldTokenAmount_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  yieldTokenAmount_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  sharesAmount?: InputMaybe<Scalars['BigInt']['input']>;
  sharesAmount_not?: InputMaybe<Scalars['BigInt']['input']>;
  sharesAmount_gt?: InputMaybe<Scalars['BigInt']['input']>;
  sharesAmount_lt?: InputMaybe<Scalars['BigInt']['input']>;
  sharesAmount_gte?: InputMaybe<Scalars['BigInt']['input']>;
  sharesAmount_lte?: InputMaybe<Scalars['BigInt']['input']>;
  sharesAmount_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  sharesAmount_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  tokenizedWithdrawRequest?: InputMaybe<Scalars['String']['input']>;
  tokenizedWithdrawRequest_not?: InputMaybe<Scalars['String']['input']>;
  tokenizedWithdrawRequest_gt?: InputMaybe<Scalars['String']['input']>;
  tokenizedWithdrawRequest_lt?: InputMaybe<Scalars['String']['input']>;
  tokenizedWithdrawRequest_gte?: InputMaybe<Scalars['String']['input']>;
  tokenizedWithdrawRequest_lte?: InputMaybe<Scalars['String']['input']>;
  tokenizedWithdrawRequest_in?: InputMaybe<Array<Scalars['String']['input']>>;
  tokenizedWithdrawRequest_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  tokenizedWithdrawRequest_contains?: InputMaybe<Scalars['String']['input']>;
  tokenizedWithdrawRequest_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  tokenizedWithdrawRequest_not_contains?: InputMaybe<Scalars['String']['input']>;
  tokenizedWithdrawRequest_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  tokenizedWithdrawRequest_starts_with?: InputMaybe<Scalars['String']['input']>;
  tokenizedWithdrawRequest_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  tokenizedWithdrawRequest_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  tokenizedWithdrawRequest_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  tokenizedWithdrawRequest_ends_with?: InputMaybe<Scalars['String']['input']>;
  tokenizedWithdrawRequest_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  tokenizedWithdrawRequest_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  tokenizedWithdrawRequest_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  tokenizedWithdrawRequest_?: InputMaybe<TokenizedWithdrawRequest_filter>;
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<WithdrawRequest_filter>>>;
  or?: InputMaybe<Array<InputMaybe<WithdrawRequest_filter>>>;
};

export type WithdrawRequest_orderBy =
  | 'id'
  | 'lastUpdateBlockNumber'
  | 'lastUpdateTimestamp'
  | 'lastUpdateTransactionHash'
  | 'withdrawRequestManager'
  | 'withdrawRequestManager__id'
  | 'withdrawRequestManager__firstUpdateBlockNumber'
  | 'withdrawRequestManager__firstUpdateTimestamp'
  | 'withdrawRequestManager__firstUpdateTransactionHash'
  | 'withdrawRequestManager__lastUpdateBlockNumber'
  | 'withdrawRequestManager__lastUpdateTimestamp'
  | 'withdrawRequestManager__lastUpdateTransactionHash'
  | 'account'
  | 'account__id'
  | 'account__firstUpdateBlockNumber'
  | 'account__firstUpdateTimestamp'
  | 'account__firstUpdateTransactionHash'
  | 'account__lastUpdateBlockNumber'
  | 'account__lastUpdateTimestamp'
  | 'account__lastUpdateTransactionHash'
  | 'account__systemAccountType'
  | 'vault'
  | 'vault__id'
  | 'vault__firstUpdateBlockNumber'
  | 'vault__firstUpdateTimestamp'
  | 'vault__firstUpdateTransactionHash'
  | 'vault__lastUpdateBlockNumber'
  | 'vault__lastUpdateTimestamp'
  | 'vault__lastUpdateTransactionHash'
  | 'vault__isWhitelisted'
  | 'vault__feeRate'
  | 'vault__strategyType'
  | 'balance'
  | 'balance__id'
  | 'balance__firstUpdateBlockNumber'
  | 'balance__firstUpdateTimestamp'
  | 'balance__firstUpdateTransactionHash'
  | 'balance__lastUpdateBlockNumber'
  | 'balance__lastUpdateTimestamp'
  | 'balance__lastUpdateTransactionHash'
  | 'balance___lastIncentiveSnapshotBlockNumber'
  | 'requestId'
  | 'yieldTokenAmount'
  | 'sharesAmount'
  | 'tokenizedWithdrawRequest'
  | 'tokenizedWithdrawRequest__id'
  | 'tokenizedWithdrawRequest__lastUpdateBlockNumber'
  | 'tokenizedWithdrawRequest__lastUpdateTimestamp'
  | 'tokenizedWithdrawRequest__lastUpdateTransactionHash'
  | 'tokenizedWithdrawRequest__finalizedBlockNumber'
  | 'tokenizedWithdrawRequest__finalizedTimestamp'
  | 'tokenizedWithdrawRequest__finalizedTransactionHash'
  | 'tokenizedWithdrawRequest__totalYieldTokenAmount'
  | 'tokenizedWithdrawRequest__totalWithdraw'
  | 'tokenizedWithdrawRequest__finalized';

export type _Block_ = {
  /** The hash of the block */
  hash?: Maybe<Scalars['Bytes']['output']>;
  /** The block number */
  number: Scalars['Int']['output'];
  /** Integer representation of the timestamp stored in blocks for the chain */
  timestamp?: Maybe<Scalars['Int']['output']>;
  /** The hash of the parent block */
  parentHash?: Maybe<Scalars['Bytes']['output']>;
};

/** The type for the top-level _meta field */
export type _Meta_ = {
  /**
   * Information about a specific subgraph block. The hash of the block
   * will be null if the _meta field has a block constraint that asks for
   * a block number. It will be filled if the _meta field has no block constraint
   * and therefore asks for the latest  block
   */
  block: _Block_;
  /** The deployment ID */
  deployment: Scalars['String']['output'];
  /** If `true`, the subgraph encountered indexing errors at some past block */
  hasIndexingErrors: Scalars['Boolean']['output'];
};

export type _SubgraphErrorPolicy_ =
  /** Data will be returned even if the subgraph has indexing errors */
  | 'allow'
  /** If the subgraph has indexing errors, data will be omitted. The default. */
  | 'deny';

  export type QuerySdk = {
      /** null **/
  token: InContextSdkMethod<Query['token'], QuerytokenArgs, MeshContext>,
  /** null **/
  tokens: InContextSdkMethod<Query['tokens'], QuerytokensArgs, MeshContext>,
  /** null **/
  profitLossLineItem: InContextSdkMethod<Query['profitLossLineItem'], QueryprofitLossLineItemArgs, MeshContext>,
  /** null **/
  profitLossLineItems: InContextSdkMethod<Query['profitLossLineItems'], QueryprofitLossLineItemsArgs, MeshContext>,
  /** null **/
  account: InContextSdkMethod<Query['account'], QueryaccountArgs, MeshContext>,
  /** null **/
  accounts: InContextSdkMethod<Query['accounts'], QueryaccountsArgs, MeshContext>,
  /** null **/
  oracleRegistry: InContextSdkMethod<Query['oracleRegistry'], QueryoracleRegistryArgs, MeshContext>,
  /** null **/
  oracleRegistries: InContextSdkMethod<Query['oracleRegistries'], QueryoracleRegistriesArgs, MeshContext>,
  /** null **/
  oracle: InContextSdkMethod<Query['oracle'], QueryoracleArgs, MeshContext>,
  /** null **/
  oracles: InContextSdkMethod<Query['oracles'], QueryoraclesArgs, MeshContext>,
  /** null **/
  exchangeRate: InContextSdkMethod<Query['exchangeRate'], QueryexchangeRateArgs, MeshContext>,
  /** null **/
  exchangeRates: InContextSdkMethod<Query['exchangeRates'], QueryexchangeRatesArgs, MeshContext>,
  /** null **/
  vault: InContextSdkMethod<Query['vault'], QueryvaultArgs, MeshContext>,
  /** null **/
  vaults: InContextSdkMethod<Query['vaults'], QueryvaultsArgs, MeshContext>,
  /** null **/
  lendingRouter: InContextSdkMethod<Query['lendingRouter'], QuerylendingRouterArgs, MeshContext>,
  /** null **/
  lendingRouters: InContextSdkMethod<Query['lendingRouters'], QuerylendingRoutersArgs, MeshContext>,
  /** null **/
  market: InContextSdkMethod<Query['market'], QuerymarketArgs, MeshContext>,
  /** null **/
  markets: InContextSdkMethod<Query['markets'], QuerymarketsArgs, MeshContext>,
  /** null **/
  withdrawRequestManager: InContextSdkMethod<Query['withdrawRequestManager'], QuerywithdrawRequestManagerArgs, MeshContext>,
  /** null **/
  withdrawRequestManagers: InContextSdkMethod<Query['withdrawRequestManagers'], QuerywithdrawRequestManagersArgs, MeshContext>,
  /** null **/
  balance: InContextSdkMethod<Query['balance'], QuerybalanceArgs, MeshContext>,
  /** null **/
  balances: InContextSdkMethod<Query['balances'], QuerybalancesArgs, MeshContext>,
  /** null **/
  balanceSnapshot: InContextSdkMethod<Query['balanceSnapshot'], QuerybalanceSnapshotArgs, MeshContext>,
  /** null **/
  balanceSnapshots: InContextSdkMethod<Query['balanceSnapshots'], QuerybalanceSnapshotsArgs, MeshContext>,
  /** null **/
  withdrawRequest: InContextSdkMethod<Query['withdrawRequest'], QuerywithdrawRequestArgs, MeshContext>,
  /** null **/
  withdrawRequests: InContextSdkMethod<Query['withdrawRequests'], QuerywithdrawRequestsArgs, MeshContext>,
  /** null **/
  tokenizedWithdrawRequest: InContextSdkMethod<Query['tokenizedWithdrawRequest'], QuerytokenizedWithdrawRequestArgs, MeshContext>,
  /** null **/
  tokenizedWithdrawRequests: InContextSdkMethod<Query['tokenizedWithdrawRequests'], QuerytokenizedWithdrawRequestsArgs, MeshContext>,
  /** null **/
  incentiveSnapshot: InContextSdkMethod<Query['incentiveSnapshot'], QueryincentiveSnapshotArgs, MeshContext>,
  /** null **/
  incentiveSnapshots: InContextSdkMethod<Query['incentiveSnapshots'], QueryincentiveSnapshotsArgs, MeshContext>,
  /** null **/
  tradingModulePermission: InContextSdkMethod<Query['tradingModulePermission'], QuerytradingModulePermissionArgs, MeshContext>,
  /** null **/
  tradingModulePermissions: InContextSdkMethod<Query['tradingModulePermissions'], QuerytradingModulePermissionsArgs, MeshContext>,
  /** Access to subgraph metadata **/
  _meta: InContextSdkMethod<Query['_meta'], Query_metaArgs, MeshContext>
  };

  export type MutationSdk = {
    
  };

  export type SubscriptionSdk = {
    
  };

  export type Context = {
      ["NotionalExponent"]: { Query: QuerySdk, Mutation: MutationSdk, Subscription: SubscriptionSdk },
      
    };
}
