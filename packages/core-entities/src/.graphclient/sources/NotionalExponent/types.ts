// @ts-nocheck

import { InContextSdkMethod } from '@graphql-mesh/types';
import { MeshContext } from '@graphql-mesh/runtime';

export namespace NotionalExponentTypes {
  export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  BigDecimal: any;
  BigInt: any;
  Bytes: any;
  Int8: any;
  Timestamp: any;
};

export type Account = {
  /** Address of Account */
  id: Scalars['ID'];
  firstUpdateBlockNumber: Scalars['BigInt'];
  firstUpdateTimestamp: Scalars['Int'];
  firstUpdateTransactionHash: Scalars['Bytes'];
  lastUpdateBlockNumber: Scalars['BigInt'];
  lastUpdateTimestamp: Scalars['Int'];
  lastUpdateTransactionHash: Scalars['Bytes'];
  systemAccountType: SystemAccount;
  /** All current balances linked to this account */
  balances?: Maybe<Array<Balance>>;
  profitLossLineItems?: Maybe<Array<ProfitLossLineItem>>;
};


export type AccountbalancesArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Balance_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<Balance_filter>;
};


export type AccountprofitLossLineItemsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<ProfitLossLineItem_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<ProfitLossLineItem_filter>;
};

export type Account_filter = {
  id?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  firstUpdateBlockNumber?: InputMaybe<Scalars['BigInt']>;
  firstUpdateBlockNumber_not?: InputMaybe<Scalars['BigInt']>;
  firstUpdateBlockNumber_gt?: InputMaybe<Scalars['BigInt']>;
  firstUpdateBlockNumber_lt?: InputMaybe<Scalars['BigInt']>;
  firstUpdateBlockNumber_gte?: InputMaybe<Scalars['BigInt']>;
  firstUpdateBlockNumber_lte?: InputMaybe<Scalars['BigInt']>;
  firstUpdateBlockNumber_in?: InputMaybe<Array<Scalars['BigInt']>>;
  firstUpdateBlockNumber_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  firstUpdateTimestamp?: InputMaybe<Scalars['Int']>;
  firstUpdateTimestamp_not?: InputMaybe<Scalars['Int']>;
  firstUpdateTimestamp_gt?: InputMaybe<Scalars['Int']>;
  firstUpdateTimestamp_lt?: InputMaybe<Scalars['Int']>;
  firstUpdateTimestamp_gte?: InputMaybe<Scalars['Int']>;
  firstUpdateTimestamp_lte?: InputMaybe<Scalars['Int']>;
  firstUpdateTimestamp_in?: InputMaybe<Array<Scalars['Int']>>;
  firstUpdateTimestamp_not_in?: InputMaybe<Array<Scalars['Int']>>;
  firstUpdateTransactionHash?: InputMaybe<Scalars['Bytes']>;
  firstUpdateTransactionHash_not?: InputMaybe<Scalars['Bytes']>;
  firstUpdateTransactionHash_gt?: InputMaybe<Scalars['Bytes']>;
  firstUpdateTransactionHash_lt?: InputMaybe<Scalars['Bytes']>;
  firstUpdateTransactionHash_gte?: InputMaybe<Scalars['Bytes']>;
  firstUpdateTransactionHash_lte?: InputMaybe<Scalars['Bytes']>;
  firstUpdateTransactionHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
  firstUpdateTransactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  firstUpdateTransactionHash_contains?: InputMaybe<Scalars['Bytes']>;
  firstUpdateTransactionHash_not_contains?: InputMaybe<Scalars['Bytes']>;
  lastUpdateBlockNumber?: InputMaybe<Scalars['BigInt']>;
  lastUpdateBlockNumber_not?: InputMaybe<Scalars['BigInt']>;
  lastUpdateBlockNumber_gt?: InputMaybe<Scalars['BigInt']>;
  lastUpdateBlockNumber_lt?: InputMaybe<Scalars['BigInt']>;
  lastUpdateBlockNumber_gte?: InputMaybe<Scalars['BigInt']>;
  lastUpdateBlockNumber_lte?: InputMaybe<Scalars['BigInt']>;
  lastUpdateBlockNumber_in?: InputMaybe<Array<Scalars['BigInt']>>;
  lastUpdateBlockNumber_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  lastUpdateTimestamp?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_not?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_gt?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_lt?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_gte?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_lte?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_in?: InputMaybe<Array<Scalars['Int']>>;
  lastUpdateTimestamp_not_in?: InputMaybe<Array<Scalars['Int']>>;
  lastUpdateTransactionHash?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_not?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_gt?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_lt?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_gte?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_lte?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
  lastUpdateTransactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  lastUpdateTransactionHash_contains?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_not_contains?: InputMaybe<Scalars['Bytes']>;
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

export type Aggregation_interval =
  | 'hour'
  | 'day';

export type Balance = {
  /** Account:Token ID */
  id: Scalars['ID'];
  /** Link back to the token */
  token: Token;
  /** Address of the account that holds this balance */
  account: Account;
  firstUpdateBlockNumber: Scalars['BigInt'];
  firstUpdateTimestamp: Scalars['Int'];
  firstUpdateTransactionHash: Scalars['Bytes'];
  lastUpdateBlockNumber: Scalars['BigInt'];
  lastUpdateTimestamp: Scalars['Int'];
  lastUpdateTransactionHash: Scalars['Bytes'];
  current: BalanceSnapshot;
  /** Link to the withdraw requests that this balance is associated with */
  withdrawRequest?: Maybe<Array<WithdrawRequest>>;
  snapshots?: Maybe<Array<BalanceSnapshot>>;
};


export type BalancewithdrawRequestArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<WithdrawRequest_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<WithdrawRequest_filter>;
};


export type BalancesnapshotsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<BalanceSnapshot_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<BalanceSnapshot_filter>;
};

export type BalanceSnapshot = {
  /** Address of Account:ID of Token:Block Number */
  id: Scalars['ID'];
  blockNumber: Scalars['BigInt'];
  timestamp: Scalars['Int'];
  transactionHash: Scalars['Bytes'];
  /** Link to previous snapshot, if it exists */
  previousSnapshot?: Maybe<BalanceSnapshot>;
  /** Link to the balance entity for this token */
  balance: Balance;
  /** Current balance of the token at this block */
  currentBalance: Scalars['BigInt'];
  /** Balance before this snapshot */
  previousBalance: Scalars['BigInt'];
  /** Adjusted cost basis at this snapshot for the token */
  adjustedCostBasis: Scalars['BigInt'];
  /** Current profit and loss at the snapshot */
  currentProfitAndLossAtSnapshot: Scalars['BigInt'];
  /** Portion of the PnL due to interest accrual */
  totalInterestAccrualAtSnapshot: Scalars['BigInt'];
  /** Portion of the PnL due to fees */
  totalVaultFeesAtSnapshot: Scalars['BigInt'];
  /** Implied Fixed Rate for fCash balances */
  impliedFixedRate?: Maybe<Scalars['BigInt']>;
  /** Cumulative balance used for internal PnL calculations */
  _accumulatedBalance: Scalars['BigInt'];
  /** Cumulative realized cost for internal PnL calculations */
  _accumulatedCostRealized: Scalars['BigInt'];
  /** Internal interest accumulator */
  _lastInterestAccumulator: Scalars['BigInt'];
  /** Internal vault fee accumulator */
  _lastVaultFeeAccumulator: Scalars['BigInt'];
  profitLossLineItems?: Maybe<Array<ProfitLossLineItem>>;
  /** Snapshots of the secondary incentives */
  incentives?: Maybe<Array<IncentiveSnapshot>>;
};


export type BalanceSnapshotprofitLossLineItemsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<ProfitLossLineItem_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<ProfitLossLineItem_filter>;
};


export type BalanceSnapshotincentivesArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<IncentiveSnapshot_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<IncentiveSnapshot_filter>;
};

export type BalanceSnapshot_filter = {
  id?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  blockNumber?: InputMaybe<Scalars['BigInt']>;
  blockNumber_not?: InputMaybe<Scalars['BigInt']>;
  blockNumber_gt?: InputMaybe<Scalars['BigInt']>;
  blockNumber_lt?: InputMaybe<Scalars['BigInt']>;
  blockNumber_gte?: InputMaybe<Scalars['BigInt']>;
  blockNumber_lte?: InputMaybe<Scalars['BigInt']>;
  blockNumber_in?: InputMaybe<Array<Scalars['BigInt']>>;
  blockNumber_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  timestamp?: InputMaybe<Scalars['Int']>;
  timestamp_not?: InputMaybe<Scalars['Int']>;
  timestamp_gt?: InputMaybe<Scalars['Int']>;
  timestamp_lt?: InputMaybe<Scalars['Int']>;
  timestamp_gte?: InputMaybe<Scalars['Int']>;
  timestamp_lte?: InputMaybe<Scalars['Int']>;
  timestamp_in?: InputMaybe<Array<Scalars['Int']>>;
  timestamp_not_in?: InputMaybe<Array<Scalars['Int']>>;
  transactionHash?: InputMaybe<Scalars['Bytes']>;
  transactionHash_not?: InputMaybe<Scalars['Bytes']>;
  transactionHash_gt?: InputMaybe<Scalars['Bytes']>;
  transactionHash_lt?: InputMaybe<Scalars['Bytes']>;
  transactionHash_gte?: InputMaybe<Scalars['Bytes']>;
  transactionHash_lte?: InputMaybe<Scalars['Bytes']>;
  transactionHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
  transactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  transactionHash_contains?: InputMaybe<Scalars['Bytes']>;
  transactionHash_not_contains?: InputMaybe<Scalars['Bytes']>;
  previousSnapshot?: InputMaybe<Scalars['String']>;
  previousSnapshot_not?: InputMaybe<Scalars['String']>;
  previousSnapshot_gt?: InputMaybe<Scalars['String']>;
  previousSnapshot_lt?: InputMaybe<Scalars['String']>;
  previousSnapshot_gte?: InputMaybe<Scalars['String']>;
  previousSnapshot_lte?: InputMaybe<Scalars['String']>;
  previousSnapshot_in?: InputMaybe<Array<Scalars['String']>>;
  previousSnapshot_not_in?: InputMaybe<Array<Scalars['String']>>;
  previousSnapshot_contains?: InputMaybe<Scalars['String']>;
  previousSnapshot_contains_nocase?: InputMaybe<Scalars['String']>;
  previousSnapshot_not_contains?: InputMaybe<Scalars['String']>;
  previousSnapshot_not_contains_nocase?: InputMaybe<Scalars['String']>;
  previousSnapshot_starts_with?: InputMaybe<Scalars['String']>;
  previousSnapshot_starts_with_nocase?: InputMaybe<Scalars['String']>;
  previousSnapshot_not_starts_with?: InputMaybe<Scalars['String']>;
  previousSnapshot_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  previousSnapshot_ends_with?: InputMaybe<Scalars['String']>;
  previousSnapshot_ends_with_nocase?: InputMaybe<Scalars['String']>;
  previousSnapshot_not_ends_with?: InputMaybe<Scalars['String']>;
  previousSnapshot_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  previousSnapshot_?: InputMaybe<BalanceSnapshot_filter>;
  balance?: InputMaybe<Scalars['String']>;
  balance_not?: InputMaybe<Scalars['String']>;
  balance_gt?: InputMaybe<Scalars['String']>;
  balance_lt?: InputMaybe<Scalars['String']>;
  balance_gte?: InputMaybe<Scalars['String']>;
  balance_lte?: InputMaybe<Scalars['String']>;
  balance_in?: InputMaybe<Array<Scalars['String']>>;
  balance_not_in?: InputMaybe<Array<Scalars['String']>>;
  balance_contains?: InputMaybe<Scalars['String']>;
  balance_contains_nocase?: InputMaybe<Scalars['String']>;
  balance_not_contains?: InputMaybe<Scalars['String']>;
  balance_not_contains_nocase?: InputMaybe<Scalars['String']>;
  balance_starts_with?: InputMaybe<Scalars['String']>;
  balance_starts_with_nocase?: InputMaybe<Scalars['String']>;
  balance_not_starts_with?: InputMaybe<Scalars['String']>;
  balance_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  balance_ends_with?: InputMaybe<Scalars['String']>;
  balance_ends_with_nocase?: InputMaybe<Scalars['String']>;
  balance_not_ends_with?: InputMaybe<Scalars['String']>;
  balance_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  balance_?: InputMaybe<Balance_filter>;
  currentBalance?: InputMaybe<Scalars['BigInt']>;
  currentBalance_not?: InputMaybe<Scalars['BigInt']>;
  currentBalance_gt?: InputMaybe<Scalars['BigInt']>;
  currentBalance_lt?: InputMaybe<Scalars['BigInt']>;
  currentBalance_gte?: InputMaybe<Scalars['BigInt']>;
  currentBalance_lte?: InputMaybe<Scalars['BigInt']>;
  currentBalance_in?: InputMaybe<Array<Scalars['BigInt']>>;
  currentBalance_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  previousBalance?: InputMaybe<Scalars['BigInt']>;
  previousBalance_not?: InputMaybe<Scalars['BigInt']>;
  previousBalance_gt?: InputMaybe<Scalars['BigInt']>;
  previousBalance_lt?: InputMaybe<Scalars['BigInt']>;
  previousBalance_gte?: InputMaybe<Scalars['BigInt']>;
  previousBalance_lte?: InputMaybe<Scalars['BigInt']>;
  previousBalance_in?: InputMaybe<Array<Scalars['BigInt']>>;
  previousBalance_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  adjustedCostBasis?: InputMaybe<Scalars['BigInt']>;
  adjustedCostBasis_not?: InputMaybe<Scalars['BigInt']>;
  adjustedCostBasis_gt?: InputMaybe<Scalars['BigInt']>;
  adjustedCostBasis_lt?: InputMaybe<Scalars['BigInt']>;
  adjustedCostBasis_gte?: InputMaybe<Scalars['BigInt']>;
  adjustedCostBasis_lte?: InputMaybe<Scalars['BigInt']>;
  adjustedCostBasis_in?: InputMaybe<Array<Scalars['BigInt']>>;
  adjustedCostBasis_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  currentProfitAndLossAtSnapshot?: InputMaybe<Scalars['BigInt']>;
  currentProfitAndLossAtSnapshot_not?: InputMaybe<Scalars['BigInt']>;
  currentProfitAndLossAtSnapshot_gt?: InputMaybe<Scalars['BigInt']>;
  currentProfitAndLossAtSnapshot_lt?: InputMaybe<Scalars['BigInt']>;
  currentProfitAndLossAtSnapshot_gte?: InputMaybe<Scalars['BigInt']>;
  currentProfitAndLossAtSnapshot_lte?: InputMaybe<Scalars['BigInt']>;
  currentProfitAndLossAtSnapshot_in?: InputMaybe<Array<Scalars['BigInt']>>;
  currentProfitAndLossAtSnapshot_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  totalInterestAccrualAtSnapshot?: InputMaybe<Scalars['BigInt']>;
  totalInterestAccrualAtSnapshot_not?: InputMaybe<Scalars['BigInt']>;
  totalInterestAccrualAtSnapshot_gt?: InputMaybe<Scalars['BigInt']>;
  totalInterestAccrualAtSnapshot_lt?: InputMaybe<Scalars['BigInt']>;
  totalInterestAccrualAtSnapshot_gte?: InputMaybe<Scalars['BigInt']>;
  totalInterestAccrualAtSnapshot_lte?: InputMaybe<Scalars['BigInt']>;
  totalInterestAccrualAtSnapshot_in?: InputMaybe<Array<Scalars['BigInt']>>;
  totalInterestAccrualAtSnapshot_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  totalVaultFeesAtSnapshot?: InputMaybe<Scalars['BigInt']>;
  totalVaultFeesAtSnapshot_not?: InputMaybe<Scalars['BigInt']>;
  totalVaultFeesAtSnapshot_gt?: InputMaybe<Scalars['BigInt']>;
  totalVaultFeesAtSnapshot_lt?: InputMaybe<Scalars['BigInt']>;
  totalVaultFeesAtSnapshot_gte?: InputMaybe<Scalars['BigInt']>;
  totalVaultFeesAtSnapshot_lte?: InputMaybe<Scalars['BigInt']>;
  totalVaultFeesAtSnapshot_in?: InputMaybe<Array<Scalars['BigInt']>>;
  totalVaultFeesAtSnapshot_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  impliedFixedRate?: InputMaybe<Scalars['BigInt']>;
  impliedFixedRate_not?: InputMaybe<Scalars['BigInt']>;
  impliedFixedRate_gt?: InputMaybe<Scalars['BigInt']>;
  impliedFixedRate_lt?: InputMaybe<Scalars['BigInt']>;
  impliedFixedRate_gte?: InputMaybe<Scalars['BigInt']>;
  impliedFixedRate_lte?: InputMaybe<Scalars['BigInt']>;
  impliedFixedRate_in?: InputMaybe<Array<Scalars['BigInt']>>;
  impliedFixedRate_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  _accumulatedBalance?: InputMaybe<Scalars['BigInt']>;
  _accumulatedBalance_not?: InputMaybe<Scalars['BigInt']>;
  _accumulatedBalance_gt?: InputMaybe<Scalars['BigInt']>;
  _accumulatedBalance_lt?: InputMaybe<Scalars['BigInt']>;
  _accumulatedBalance_gte?: InputMaybe<Scalars['BigInt']>;
  _accumulatedBalance_lte?: InputMaybe<Scalars['BigInt']>;
  _accumulatedBalance_in?: InputMaybe<Array<Scalars['BigInt']>>;
  _accumulatedBalance_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  _accumulatedCostRealized?: InputMaybe<Scalars['BigInt']>;
  _accumulatedCostRealized_not?: InputMaybe<Scalars['BigInt']>;
  _accumulatedCostRealized_gt?: InputMaybe<Scalars['BigInt']>;
  _accumulatedCostRealized_lt?: InputMaybe<Scalars['BigInt']>;
  _accumulatedCostRealized_gte?: InputMaybe<Scalars['BigInt']>;
  _accumulatedCostRealized_lte?: InputMaybe<Scalars['BigInt']>;
  _accumulatedCostRealized_in?: InputMaybe<Array<Scalars['BigInt']>>;
  _accumulatedCostRealized_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  _lastInterestAccumulator?: InputMaybe<Scalars['BigInt']>;
  _lastInterestAccumulator_not?: InputMaybe<Scalars['BigInt']>;
  _lastInterestAccumulator_gt?: InputMaybe<Scalars['BigInt']>;
  _lastInterestAccumulator_lt?: InputMaybe<Scalars['BigInt']>;
  _lastInterestAccumulator_gte?: InputMaybe<Scalars['BigInt']>;
  _lastInterestAccumulator_lte?: InputMaybe<Scalars['BigInt']>;
  _lastInterestAccumulator_in?: InputMaybe<Array<Scalars['BigInt']>>;
  _lastInterestAccumulator_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  _lastVaultFeeAccumulator?: InputMaybe<Scalars['BigInt']>;
  _lastVaultFeeAccumulator_not?: InputMaybe<Scalars['BigInt']>;
  _lastVaultFeeAccumulator_gt?: InputMaybe<Scalars['BigInt']>;
  _lastVaultFeeAccumulator_lt?: InputMaybe<Scalars['BigInt']>;
  _lastVaultFeeAccumulator_gte?: InputMaybe<Scalars['BigInt']>;
  _lastVaultFeeAccumulator_lte?: InputMaybe<Scalars['BigInt']>;
  _lastVaultFeeAccumulator_in?: InputMaybe<Array<Scalars['BigInt']>>;
  _lastVaultFeeAccumulator_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  profitLossLineItems_?: InputMaybe<ProfitLossLineItem_filter>;
  incentives_?: InputMaybe<IncentiveSnapshot_filter>;
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
  | 'profitLossLineItems'
  | 'incentives';

export type Balance_filter = {
  id?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  token?: InputMaybe<Scalars['String']>;
  token_not?: InputMaybe<Scalars['String']>;
  token_gt?: InputMaybe<Scalars['String']>;
  token_lt?: InputMaybe<Scalars['String']>;
  token_gte?: InputMaybe<Scalars['String']>;
  token_lte?: InputMaybe<Scalars['String']>;
  token_in?: InputMaybe<Array<Scalars['String']>>;
  token_not_in?: InputMaybe<Array<Scalars['String']>>;
  token_contains?: InputMaybe<Scalars['String']>;
  token_contains_nocase?: InputMaybe<Scalars['String']>;
  token_not_contains?: InputMaybe<Scalars['String']>;
  token_not_contains_nocase?: InputMaybe<Scalars['String']>;
  token_starts_with?: InputMaybe<Scalars['String']>;
  token_starts_with_nocase?: InputMaybe<Scalars['String']>;
  token_not_starts_with?: InputMaybe<Scalars['String']>;
  token_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  token_ends_with?: InputMaybe<Scalars['String']>;
  token_ends_with_nocase?: InputMaybe<Scalars['String']>;
  token_not_ends_with?: InputMaybe<Scalars['String']>;
  token_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  token_?: InputMaybe<Token_filter>;
  account?: InputMaybe<Scalars['String']>;
  account_not?: InputMaybe<Scalars['String']>;
  account_gt?: InputMaybe<Scalars['String']>;
  account_lt?: InputMaybe<Scalars['String']>;
  account_gte?: InputMaybe<Scalars['String']>;
  account_lte?: InputMaybe<Scalars['String']>;
  account_in?: InputMaybe<Array<Scalars['String']>>;
  account_not_in?: InputMaybe<Array<Scalars['String']>>;
  account_contains?: InputMaybe<Scalars['String']>;
  account_contains_nocase?: InputMaybe<Scalars['String']>;
  account_not_contains?: InputMaybe<Scalars['String']>;
  account_not_contains_nocase?: InputMaybe<Scalars['String']>;
  account_starts_with?: InputMaybe<Scalars['String']>;
  account_starts_with_nocase?: InputMaybe<Scalars['String']>;
  account_not_starts_with?: InputMaybe<Scalars['String']>;
  account_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  account_ends_with?: InputMaybe<Scalars['String']>;
  account_ends_with_nocase?: InputMaybe<Scalars['String']>;
  account_not_ends_with?: InputMaybe<Scalars['String']>;
  account_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  account_?: InputMaybe<Account_filter>;
  firstUpdateBlockNumber?: InputMaybe<Scalars['BigInt']>;
  firstUpdateBlockNumber_not?: InputMaybe<Scalars['BigInt']>;
  firstUpdateBlockNumber_gt?: InputMaybe<Scalars['BigInt']>;
  firstUpdateBlockNumber_lt?: InputMaybe<Scalars['BigInt']>;
  firstUpdateBlockNumber_gte?: InputMaybe<Scalars['BigInt']>;
  firstUpdateBlockNumber_lte?: InputMaybe<Scalars['BigInt']>;
  firstUpdateBlockNumber_in?: InputMaybe<Array<Scalars['BigInt']>>;
  firstUpdateBlockNumber_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  firstUpdateTimestamp?: InputMaybe<Scalars['Int']>;
  firstUpdateTimestamp_not?: InputMaybe<Scalars['Int']>;
  firstUpdateTimestamp_gt?: InputMaybe<Scalars['Int']>;
  firstUpdateTimestamp_lt?: InputMaybe<Scalars['Int']>;
  firstUpdateTimestamp_gte?: InputMaybe<Scalars['Int']>;
  firstUpdateTimestamp_lte?: InputMaybe<Scalars['Int']>;
  firstUpdateTimestamp_in?: InputMaybe<Array<Scalars['Int']>>;
  firstUpdateTimestamp_not_in?: InputMaybe<Array<Scalars['Int']>>;
  firstUpdateTransactionHash?: InputMaybe<Scalars['Bytes']>;
  firstUpdateTransactionHash_not?: InputMaybe<Scalars['Bytes']>;
  firstUpdateTransactionHash_gt?: InputMaybe<Scalars['Bytes']>;
  firstUpdateTransactionHash_lt?: InputMaybe<Scalars['Bytes']>;
  firstUpdateTransactionHash_gte?: InputMaybe<Scalars['Bytes']>;
  firstUpdateTransactionHash_lte?: InputMaybe<Scalars['Bytes']>;
  firstUpdateTransactionHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
  firstUpdateTransactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  firstUpdateTransactionHash_contains?: InputMaybe<Scalars['Bytes']>;
  firstUpdateTransactionHash_not_contains?: InputMaybe<Scalars['Bytes']>;
  lastUpdateBlockNumber?: InputMaybe<Scalars['BigInt']>;
  lastUpdateBlockNumber_not?: InputMaybe<Scalars['BigInt']>;
  lastUpdateBlockNumber_gt?: InputMaybe<Scalars['BigInt']>;
  lastUpdateBlockNumber_lt?: InputMaybe<Scalars['BigInt']>;
  lastUpdateBlockNumber_gte?: InputMaybe<Scalars['BigInt']>;
  lastUpdateBlockNumber_lte?: InputMaybe<Scalars['BigInt']>;
  lastUpdateBlockNumber_in?: InputMaybe<Array<Scalars['BigInt']>>;
  lastUpdateBlockNumber_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  lastUpdateTimestamp?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_not?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_gt?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_lt?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_gte?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_lte?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_in?: InputMaybe<Array<Scalars['Int']>>;
  lastUpdateTimestamp_not_in?: InputMaybe<Array<Scalars['Int']>>;
  lastUpdateTransactionHash?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_not?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_gt?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_lt?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_gte?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_lte?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
  lastUpdateTransactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  lastUpdateTransactionHash_contains?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_not_contains?: InputMaybe<Scalars['Bytes']>;
  current?: InputMaybe<Scalars['String']>;
  current_not?: InputMaybe<Scalars['String']>;
  current_gt?: InputMaybe<Scalars['String']>;
  current_lt?: InputMaybe<Scalars['String']>;
  current_gte?: InputMaybe<Scalars['String']>;
  current_lte?: InputMaybe<Scalars['String']>;
  current_in?: InputMaybe<Array<Scalars['String']>>;
  current_not_in?: InputMaybe<Array<Scalars['String']>>;
  current_contains?: InputMaybe<Scalars['String']>;
  current_contains_nocase?: InputMaybe<Scalars['String']>;
  current_not_contains?: InputMaybe<Scalars['String']>;
  current_not_contains_nocase?: InputMaybe<Scalars['String']>;
  current_starts_with?: InputMaybe<Scalars['String']>;
  current_starts_with_nocase?: InputMaybe<Scalars['String']>;
  current_not_starts_with?: InputMaybe<Scalars['String']>;
  current_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  current_ends_with?: InputMaybe<Scalars['String']>;
  current_ends_with_nocase?: InputMaybe<Scalars['String']>;
  current_not_ends_with?: InputMaybe<Scalars['String']>;
  current_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  current_?: InputMaybe<BalanceSnapshot_filter>;
  withdrawRequest?: InputMaybe<Array<Scalars['String']>>;
  withdrawRequest_not?: InputMaybe<Array<Scalars['String']>>;
  withdrawRequest_contains?: InputMaybe<Array<Scalars['String']>>;
  withdrawRequest_contains_nocase?: InputMaybe<Array<Scalars['String']>>;
  withdrawRequest_not_contains?: InputMaybe<Array<Scalars['String']>>;
  withdrawRequest_not_contains_nocase?: InputMaybe<Array<Scalars['String']>>;
  withdrawRequest_?: InputMaybe<WithdrawRequest_filter>;
  snapshots_?: InputMaybe<BalanceSnapshot_filter>;
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
  | 'token__vaultAddress'
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
  | 'withdrawRequest'
  | 'snapshots';

export type BlockChangedFilter = {
  number_gte: Scalars['Int'];
};

export type Block_height = {
  hash?: InputMaybe<Scalars['Bytes']>;
  number?: InputMaybe<Scalars['Int']>;
  number_gte?: InputMaybe<Scalars['Int']>;
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
  id: Scalars['ID'];
  blockNumber: Scalars['BigInt'];
  timestamp: Scalars['Timestamp'];
  oracle: Oracle;
  rate: Scalars['BigInt'];
  totalSupply?: Maybe<Scalars['BigInt']>;
};

export type ExchangeRate_filter = {
  id?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  blockNumber?: InputMaybe<Scalars['BigInt']>;
  blockNumber_not?: InputMaybe<Scalars['BigInt']>;
  blockNumber_gt?: InputMaybe<Scalars['BigInt']>;
  blockNumber_lt?: InputMaybe<Scalars['BigInt']>;
  blockNumber_gte?: InputMaybe<Scalars['BigInt']>;
  blockNumber_lte?: InputMaybe<Scalars['BigInt']>;
  blockNumber_in?: InputMaybe<Array<Scalars['BigInt']>>;
  blockNumber_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  timestamp?: InputMaybe<Scalars['Timestamp']>;
  timestamp_not?: InputMaybe<Scalars['Timestamp']>;
  timestamp_gt?: InputMaybe<Scalars['Timestamp']>;
  timestamp_lt?: InputMaybe<Scalars['Timestamp']>;
  timestamp_gte?: InputMaybe<Scalars['Timestamp']>;
  timestamp_lte?: InputMaybe<Scalars['Timestamp']>;
  timestamp_in?: InputMaybe<Array<Scalars['Timestamp']>>;
  timestamp_not_in?: InputMaybe<Array<Scalars['Timestamp']>>;
  oracle?: InputMaybe<Scalars['String']>;
  oracle_not?: InputMaybe<Scalars['String']>;
  oracle_gt?: InputMaybe<Scalars['String']>;
  oracle_lt?: InputMaybe<Scalars['String']>;
  oracle_gte?: InputMaybe<Scalars['String']>;
  oracle_lte?: InputMaybe<Scalars['String']>;
  oracle_in?: InputMaybe<Array<Scalars['String']>>;
  oracle_not_in?: InputMaybe<Array<Scalars['String']>>;
  oracle_contains?: InputMaybe<Scalars['String']>;
  oracle_contains_nocase?: InputMaybe<Scalars['String']>;
  oracle_not_contains?: InputMaybe<Scalars['String']>;
  oracle_not_contains_nocase?: InputMaybe<Scalars['String']>;
  oracle_starts_with?: InputMaybe<Scalars['String']>;
  oracle_starts_with_nocase?: InputMaybe<Scalars['String']>;
  oracle_not_starts_with?: InputMaybe<Scalars['String']>;
  oracle_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  oracle_ends_with?: InputMaybe<Scalars['String']>;
  oracle_ends_with_nocase?: InputMaybe<Scalars['String']>;
  oracle_not_ends_with?: InputMaybe<Scalars['String']>;
  oracle_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  oracle_?: InputMaybe<Oracle_filter>;
  rate?: InputMaybe<Scalars['BigInt']>;
  rate_not?: InputMaybe<Scalars['BigInt']>;
  rate_gt?: InputMaybe<Scalars['BigInt']>;
  rate_lt?: InputMaybe<Scalars['BigInt']>;
  rate_gte?: InputMaybe<Scalars['BigInt']>;
  rate_lte?: InputMaybe<Scalars['BigInt']>;
  rate_in?: InputMaybe<Array<Scalars['BigInt']>>;
  rate_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  totalSupply?: InputMaybe<Scalars['BigInt']>;
  totalSupply_not?: InputMaybe<Scalars['BigInt']>;
  totalSupply_gt?: InputMaybe<Scalars['BigInt']>;
  totalSupply_lt?: InputMaybe<Scalars['BigInt']>;
  totalSupply_gte?: InputMaybe<Scalars['BigInt']>;
  totalSupply_lte?: InputMaybe<Scalars['BigInt']>;
  totalSupply_in?: InputMaybe<Array<Scalars['BigInt']>>;
  totalSupply_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
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
  id: Scalars['ID'];
  blockNumber: Scalars['BigInt'];
  timestamp: Scalars['Int'];
  transactionHash: Scalars['Bytes'];
  /** Address of the account that holds this balance */
  account: Account;
  /** Link back to the balance snapshot for this secondary incentive */
  balanceSnapshot: BalanceSnapshot;
  /** Reward token associated with this snapshot */
  rewardToken: Token;
  /** Total reward accrued over the lifetime of this balance */
  totalClaimed: Scalars['BigInt'];
  /** Reward earnings adjusted for balance changes */
  adjustedClaimed: Scalars['BigInt'];
};

export type IncentiveSnapshot_filter = {
  id?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  blockNumber?: InputMaybe<Scalars['BigInt']>;
  blockNumber_not?: InputMaybe<Scalars['BigInt']>;
  blockNumber_gt?: InputMaybe<Scalars['BigInt']>;
  blockNumber_lt?: InputMaybe<Scalars['BigInt']>;
  blockNumber_gte?: InputMaybe<Scalars['BigInt']>;
  blockNumber_lte?: InputMaybe<Scalars['BigInt']>;
  blockNumber_in?: InputMaybe<Array<Scalars['BigInt']>>;
  blockNumber_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  timestamp?: InputMaybe<Scalars['Int']>;
  timestamp_not?: InputMaybe<Scalars['Int']>;
  timestamp_gt?: InputMaybe<Scalars['Int']>;
  timestamp_lt?: InputMaybe<Scalars['Int']>;
  timestamp_gte?: InputMaybe<Scalars['Int']>;
  timestamp_lte?: InputMaybe<Scalars['Int']>;
  timestamp_in?: InputMaybe<Array<Scalars['Int']>>;
  timestamp_not_in?: InputMaybe<Array<Scalars['Int']>>;
  transactionHash?: InputMaybe<Scalars['Bytes']>;
  transactionHash_not?: InputMaybe<Scalars['Bytes']>;
  transactionHash_gt?: InputMaybe<Scalars['Bytes']>;
  transactionHash_lt?: InputMaybe<Scalars['Bytes']>;
  transactionHash_gte?: InputMaybe<Scalars['Bytes']>;
  transactionHash_lte?: InputMaybe<Scalars['Bytes']>;
  transactionHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
  transactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  transactionHash_contains?: InputMaybe<Scalars['Bytes']>;
  transactionHash_not_contains?: InputMaybe<Scalars['Bytes']>;
  account?: InputMaybe<Scalars['String']>;
  account_not?: InputMaybe<Scalars['String']>;
  account_gt?: InputMaybe<Scalars['String']>;
  account_lt?: InputMaybe<Scalars['String']>;
  account_gte?: InputMaybe<Scalars['String']>;
  account_lte?: InputMaybe<Scalars['String']>;
  account_in?: InputMaybe<Array<Scalars['String']>>;
  account_not_in?: InputMaybe<Array<Scalars['String']>>;
  account_contains?: InputMaybe<Scalars['String']>;
  account_contains_nocase?: InputMaybe<Scalars['String']>;
  account_not_contains?: InputMaybe<Scalars['String']>;
  account_not_contains_nocase?: InputMaybe<Scalars['String']>;
  account_starts_with?: InputMaybe<Scalars['String']>;
  account_starts_with_nocase?: InputMaybe<Scalars['String']>;
  account_not_starts_with?: InputMaybe<Scalars['String']>;
  account_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  account_ends_with?: InputMaybe<Scalars['String']>;
  account_ends_with_nocase?: InputMaybe<Scalars['String']>;
  account_not_ends_with?: InputMaybe<Scalars['String']>;
  account_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  account_?: InputMaybe<Account_filter>;
  balanceSnapshot?: InputMaybe<Scalars['String']>;
  balanceSnapshot_not?: InputMaybe<Scalars['String']>;
  balanceSnapshot_gt?: InputMaybe<Scalars['String']>;
  balanceSnapshot_lt?: InputMaybe<Scalars['String']>;
  balanceSnapshot_gte?: InputMaybe<Scalars['String']>;
  balanceSnapshot_lte?: InputMaybe<Scalars['String']>;
  balanceSnapshot_in?: InputMaybe<Array<Scalars['String']>>;
  balanceSnapshot_not_in?: InputMaybe<Array<Scalars['String']>>;
  balanceSnapshot_contains?: InputMaybe<Scalars['String']>;
  balanceSnapshot_contains_nocase?: InputMaybe<Scalars['String']>;
  balanceSnapshot_not_contains?: InputMaybe<Scalars['String']>;
  balanceSnapshot_not_contains_nocase?: InputMaybe<Scalars['String']>;
  balanceSnapshot_starts_with?: InputMaybe<Scalars['String']>;
  balanceSnapshot_starts_with_nocase?: InputMaybe<Scalars['String']>;
  balanceSnapshot_not_starts_with?: InputMaybe<Scalars['String']>;
  balanceSnapshot_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  balanceSnapshot_ends_with?: InputMaybe<Scalars['String']>;
  balanceSnapshot_ends_with_nocase?: InputMaybe<Scalars['String']>;
  balanceSnapshot_not_ends_with?: InputMaybe<Scalars['String']>;
  balanceSnapshot_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  balanceSnapshot_?: InputMaybe<BalanceSnapshot_filter>;
  rewardToken?: InputMaybe<Scalars['String']>;
  rewardToken_not?: InputMaybe<Scalars['String']>;
  rewardToken_gt?: InputMaybe<Scalars['String']>;
  rewardToken_lt?: InputMaybe<Scalars['String']>;
  rewardToken_gte?: InputMaybe<Scalars['String']>;
  rewardToken_lte?: InputMaybe<Scalars['String']>;
  rewardToken_in?: InputMaybe<Array<Scalars['String']>>;
  rewardToken_not_in?: InputMaybe<Array<Scalars['String']>>;
  rewardToken_contains?: InputMaybe<Scalars['String']>;
  rewardToken_contains_nocase?: InputMaybe<Scalars['String']>;
  rewardToken_not_contains?: InputMaybe<Scalars['String']>;
  rewardToken_not_contains_nocase?: InputMaybe<Scalars['String']>;
  rewardToken_starts_with?: InputMaybe<Scalars['String']>;
  rewardToken_starts_with_nocase?: InputMaybe<Scalars['String']>;
  rewardToken_not_starts_with?: InputMaybe<Scalars['String']>;
  rewardToken_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  rewardToken_ends_with?: InputMaybe<Scalars['String']>;
  rewardToken_ends_with_nocase?: InputMaybe<Scalars['String']>;
  rewardToken_not_ends_with?: InputMaybe<Scalars['String']>;
  rewardToken_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  rewardToken_?: InputMaybe<Token_filter>;
  totalClaimed?: InputMaybe<Scalars['BigInt']>;
  totalClaimed_not?: InputMaybe<Scalars['BigInt']>;
  totalClaimed_gt?: InputMaybe<Scalars['BigInt']>;
  totalClaimed_lt?: InputMaybe<Scalars['BigInt']>;
  totalClaimed_gte?: InputMaybe<Scalars['BigInt']>;
  totalClaimed_lte?: InputMaybe<Scalars['BigInt']>;
  totalClaimed_in?: InputMaybe<Array<Scalars['BigInt']>>;
  totalClaimed_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  adjustedClaimed?: InputMaybe<Scalars['BigInt']>;
  adjustedClaimed_not?: InputMaybe<Scalars['BigInt']>;
  adjustedClaimed_gt?: InputMaybe<Scalars['BigInt']>;
  adjustedClaimed_lt?: InputMaybe<Scalars['BigInt']>;
  adjustedClaimed_gte?: InputMaybe<Scalars['BigInt']>;
  adjustedClaimed_lte?: InputMaybe<Scalars['BigInt']>;
  adjustedClaimed_in?: InputMaybe<Array<Scalars['BigInt']>>;
  adjustedClaimed_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
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
  | 'rewardToken__vaultAddress'
  | 'rewardToken__tokenAddress'
  | 'totalClaimed'
  | 'adjustedClaimed';

export type LendingRouter = {
  id: Scalars['ID'];
  firstUpdateBlockNumber: Scalars['BigInt'];
  firstUpdateTimestamp: Scalars['Int'];
  firstUpdateTransactionHash: Scalars['Bytes'];
  lastUpdateBlockNumber: Scalars['BigInt'];
  lastUpdateTimestamp: Scalars['Int'];
  lastUpdateTransactionHash: Scalars['Bytes'];
  name: Scalars['String'];
  markets?: Maybe<Array<Market>>;
};


export type LendingRoutermarketsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Market_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<Market_filter>;
};

export type LendingRouter_filter = {
  id?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  firstUpdateBlockNumber?: InputMaybe<Scalars['BigInt']>;
  firstUpdateBlockNumber_not?: InputMaybe<Scalars['BigInt']>;
  firstUpdateBlockNumber_gt?: InputMaybe<Scalars['BigInt']>;
  firstUpdateBlockNumber_lt?: InputMaybe<Scalars['BigInt']>;
  firstUpdateBlockNumber_gte?: InputMaybe<Scalars['BigInt']>;
  firstUpdateBlockNumber_lte?: InputMaybe<Scalars['BigInt']>;
  firstUpdateBlockNumber_in?: InputMaybe<Array<Scalars['BigInt']>>;
  firstUpdateBlockNumber_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  firstUpdateTimestamp?: InputMaybe<Scalars['Int']>;
  firstUpdateTimestamp_not?: InputMaybe<Scalars['Int']>;
  firstUpdateTimestamp_gt?: InputMaybe<Scalars['Int']>;
  firstUpdateTimestamp_lt?: InputMaybe<Scalars['Int']>;
  firstUpdateTimestamp_gte?: InputMaybe<Scalars['Int']>;
  firstUpdateTimestamp_lte?: InputMaybe<Scalars['Int']>;
  firstUpdateTimestamp_in?: InputMaybe<Array<Scalars['Int']>>;
  firstUpdateTimestamp_not_in?: InputMaybe<Array<Scalars['Int']>>;
  firstUpdateTransactionHash?: InputMaybe<Scalars['Bytes']>;
  firstUpdateTransactionHash_not?: InputMaybe<Scalars['Bytes']>;
  firstUpdateTransactionHash_gt?: InputMaybe<Scalars['Bytes']>;
  firstUpdateTransactionHash_lt?: InputMaybe<Scalars['Bytes']>;
  firstUpdateTransactionHash_gte?: InputMaybe<Scalars['Bytes']>;
  firstUpdateTransactionHash_lte?: InputMaybe<Scalars['Bytes']>;
  firstUpdateTransactionHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
  firstUpdateTransactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  firstUpdateTransactionHash_contains?: InputMaybe<Scalars['Bytes']>;
  firstUpdateTransactionHash_not_contains?: InputMaybe<Scalars['Bytes']>;
  lastUpdateBlockNumber?: InputMaybe<Scalars['BigInt']>;
  lastUpdateBlockNumber_not?: InputMaybe<Scalars['BigInt']>;
  lastUpdateBlockNumber_gt?: InputMaybe<Scalars['BigInt']>;
  lastUpdateBlockNumber_lt?: InputMaybe<Scalars['BigInt']>;
  lastUpdateBlockNumber_gte?: InputMaybe<Scalars['BigInt']>;
  lastUpdateBlockNumber_lte?: InputMaybe<Scalars['BigInt']>;
  lastUpdateBlockNumber_in?: InputMaybe<Array<Scalars['BigInt']>>;
  lastUpdateBlockNumber_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  lastUpdateTimestamp?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_not?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_gt?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_lt?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_gte?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_lte?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_in?: InputMaybe<Array<Scalars['Int']>>;
  lastUpdateTimestamp_not_in?: InputMaybe<Array<Scalars['Int']>>;
  lastUpdateTransactionHash?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_not?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_gt?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_lt?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_gte?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_lte?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
  lastUpdateTransactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  lastUpdateTransactionHash_contains?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_not_contains?: InputMaybe<Scalars['Bytes']>;
  name?: InputMaybe<Scalars['String']>;
  name_not?: InputMaybe<Scalars['String']>;
  name_gt?: InputMaybe<Scalars['String']>;
  name_lt?: InputMaybe<Scalars['String']>;
  name_gte?: InputMaybe<Scalars['String']>;
  name_lte?: InputMaybe<Scalars['String']>;
  name_in?: InputMaybe<Array<Scalars['String']>>;
  name_not_in?: InputMaybe<Array<Scalars['String']>>;
  name_contains?: InputMaybe<Scalars['String']>;
  name_contains_nocase?: InputMaybe<Scalars['String']>;
  name_not_contains?: InputMaybe<Scalars['String']>;
  name_not_contains_nocase?: InputMaybe<Scalars['String']>;
  name_starts_with?: InputMaybe<Scalars['String']>;
  name_starts_with_nocase?: InputMaybe<Scalars['String']>;
  name_not_starts_with?: InputMaybe<Scalars['String']>;
  name_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  name_ends_with?: InputMaybe<Scalars['String']>;
  name_ends_with_nocase?: InputMaybe<Scalars['String']>;
  name_not_ends_with?: InputMaybe<Scalars['String']>;
  name_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
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
  id: Scalars['ID'];
  firstUpdateBlockNumber: Scalars['BigInt'];
  firstUpdateTimestamp: Scalars['Int'];
  firstUpdateTransactionHash: Scalars['Bytes'];
  lastUpdateBlockNumber: Scalars['BigInt'];
  lastUpdateTimestamp: Scalars['Int'];
  lastUpdateTransactionHash: Scalars['Bytes'];
  lendingRouter: LendingRouter;
  vault: Vault;
  /** Generic abi-encoded params for the market */
  params: Scalars['Bytes'];
};

export type Market_filter = {
  id?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  firstUpdateBlockNumber?: InputMaybe<Scalars['BigInt']>;
  firstUpdateBlockNumber_not?: InputMaybe<Scalars['BigInt']>;
  firstUpdateBlockNumber_gt?: InputMaybe<Scalars['BigInt']>;
  firstUpdateBlockNumber_lt?: InputMaybe<Scalars['BigInt']>;
  firstUpdateBlockNumber_gte?: InputMaybe<Scalars['BigInt']>;
  firstUpdateBlockNumber_lte?: InputMaybe<Scalars['BigInt']>;
  firstUpdateBlockNumber_in?: InputMaybe<Array<Scalars['BigInt']>>;
  firstUpdateBlockNumber_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  firstUpdateTimestamp?: InputMaybe<Scalars['Int']>;
  firstUpdateTimestamp_not?: InputMaybe<Scalars['Int']>;
  firstUpdateTimestamp_gt?: InputMaybe<Scalars['Int']>;
  firstUpdateTimestamp_lt?: InputMaybe<Scalars['Int']>;
  firstUpdateTimestamp_gte?: InputMaybe<Scalars['Int']>;
  firstUpdateTimestamp_lte?: InputMaybe<Scalars['Int']>;
  firstUpdateTimestamp_in?: InputMaybe<Array<Scalars['Int']>>;
  firstUpdateTimestamp_not_in?: InputMaybe<Array<Scalars['Int']>>;
  firstUpdateTransactionHash?: InputMaybe<Scalars['Bytes']>;
  firstUpdateTransactionHash_not?: InputMaybe<Scalars['Bytes']>;
  firstUpdateTransactionHash_gt?: InputMaybe<Scalars['Bytes']>;
  firstUpdateTransactionHash_lt?: InputMaybe<Scalars['Bytes']>;
  firstUpdateTransactionHash_gte?: InputMaybe<Scalars['Bytes']>;
  firstUpdateTransactionHash_lte?: InputMaybe<Scalars['Bytes']>;
  firstUpdateTransactionHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
  firstUpdateTransactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  firstUpdateTransactionHash_contains?: InputMaybe<Scalars['Bytes']>;
  firstUpdateTransactionHash_not_contains?: InputMaybe<Scalars['Bytes']>;
  lastUpdateBlockNumber?: InputMaybe<Scalars['BigInt']>;
  lastUpdateBlockNumber_not?: InputMaybe<Scalars['BigInt']>;
  lastUpdateBlockNumber_gt?: InputMaybe<Scalars['BigInt']>;
  lastUpdateBlockNumber_lt?: InputMaybe<Scalars['BigInt']>;
  lastUpdateBlockNumber_gte?: InputMaybe<Scalars['BigInt']>;
  lastUpdateBlockNumber_lte?: InputMaybe<Scalars['BigInt']>;
  lastUpdateBlockNumber_in?: InputMaybe<Array<Scalars['BigInt']>>;
  lastUpdateBlockNumber_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  lastUpdateTimestamp?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_not?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_gt?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_lt?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_gte?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_lte?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_in?: InputMaybe<Array<Scalars['Int']>>;
  lastUpdateTimestamp_not_in?: InputMaybe<Array<Scalars['Int']>>;
  lastUpdateTransactionHash?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_not?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_gt?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_lt?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_gte?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_lte?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
  lastUpdateTransactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  lastUpdateTransactionHash_contains?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_not_contains?: InputMaybe<Scalars['Bytes']>;
  lendingRouter?: InputMaybe<Scalars['String']>;
  lendingRouter_not?: InputMaybe<Scalars['String']>;
  lendingRouter_gt?: InputMaybe<Scalars['String']>;
  lendingRouter_lt?: InputMaybe<Scalars['String']>;
  lendingRouter_gte?: InputMaybe<Scalars['String']>;
  lendingRouter_lte?: InputMaybe<Scalars['String']>;
  lendingRouter_in?: InputMaybe<Array<Scalars['String']>>;
  lendingRouter_not_in?: InputMaybe<Array<Scalars['String']>>;
  lendingRouter_contains?: InputMaybe<Scalars['String']>;
  lendingRouter_contains_nocase?: InputMaybe<Scalars['String']>;
  lendingRouter_not_contains?: InputMaybe<Scalars['String']>;
  lendingRouter_not_contains_nocase?: InputMaybe<Scalars['String']>;
  lendingRouter_starts_with?: InputMaybe<Scalars['String']>;
  lendingRouter_starts_with_nocase?: InputMaybe<Scalars['String']>;
  lendingRouter_not_starts_with?: InputMaybe<Scalars['String']>;
  lendingRouter_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  lendingRouter_ends_with?: InputMaybe<Scalars['String']>;
  lendingRouter_ends_with_nocase?: InputMaybe<Scalars['String']>;
  lendingRouter_not_ends_with?: InputMaybe<Scalars['String']>;
  lendingRouter_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  lendingRouter_?: InputMaybe<LendingRouter_filter>;
  vault?: InputMaybe<Scalars['String']>;
  vault_not?: InputMaybe<Scalars['String']>;
  vault_gt?: InputMaybe<Scalars['String']>;
  vault_lt?: InputMaybe<Scalars['String']>;
  vault_gte?: InputMaybe<Scalars['String']>;
  vault_lte?: InputMaybe<Scalars['String']>;
  vault_in?: InputMaybe<Array<Scalars['String']>>;
  vault_not_in?: InputMaybe<Array<Scalars['String']>>;
  vault_contains?: InputMaybe<Scalars['String']>;
  vault_contains_nocase?: InputMaybe<Scalars['String']>;
  vault_not_contains?: InputMaybe<Scalars['String']>;
  vault_not_contains_nocase?: InputMaybe<Scalars['String']>;
  vault_starts_with?: InputMaybe<Scalars['String']>;
  vault_starts_with_nocase?: InputMaybe<Scalars['String']>;
  vault_not_starts_with?: InputMaybe<Scalars['String']>;
  vault_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  vault_ends_with?: InputMaybe<Scalars['String']>;
  vault_ends_with_nocase?: InputMaybe<Scalars['String']>;
  vault_not_ends_with?: InputMaybe<Scalars['String']>;
  vault_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  vault_?: InputMaybe<Vault_filter>;
  params?: InputMaybe<Scalars['Bytes']>;
  params_not?: InputMaybe<Scalars['Bytes']>;
  params_gt?: InputMaybe<Scalars['Bytes']>;
  params_lt?: InputMaybe<Scalars['Bytes']>;
  params_gte?: InputMaybe<Scalars['Bytes']>;
  params_lte?: InputMaybe<Scalars['Bytes']>;
  params_in?: InputMaybe<Array<Scalars['Bytes']>>;
  params_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  params_contains?: InputMaybe<Scalars['Bytes']>;
  params_not_contains?: InputMaybe<Scalars['Bytes']>;
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
  id: Scalars['ID'];
  lastUpdateBlockNumber: Scalars['BigInt'];
  lastUpdateTimestamp: Scalars['Int'];
  lastUpdateTransactionHash?: Maybe<Scalars['Bytes']>;
  base: Token;
  quote: Token;
  decimals: Scalars['Int'];
  ratePrecision: Scalars['BigInt'];
  oracleAddress: Scalars['Bytes'];
  oracleType: OracleType;
  mustInvert: Scalars['Boolean'];
  latestRate?: Maybe<Scalars['BigInt']>;
  matured: Scalars['Boolean'];
  historicalRates?: Maybe<Array<ExchangeRate>>;
};


export type OraclehistoricalRatesArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<ExchangeRate_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<ExchangeRate_filter>;
};

export type OracleRegistry = {
  /** ID is hardcoded to zero */
  id: Scalars['ID'];
  lastRefreshBlockNumber: Scalars['BigInt'];
  lastRefreshTimestamp: Scalars['Int'];
  chainlinkOracles: Array<Oracle>;
  /** Vault Addresses */
  listedVaults: Array<Scalars['Bytes']>;
  lendingRouters: Array<Scalars['Bytes']>;
  withdrawRequestManager: Array<Scalars['Bytes']>;
};


export type OracleRegistrychainlinkOraclesArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Oracle_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<Oracle_filter>;
};

export type OracleRegistry_filter = {
  id?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  lastRefreshBlockNumber?: InputMaybe<Scalars['BigInt']>;
  lastRefreshBlockNumber_not?: InputMaybe<Scalars['BigInt']>;
  lastRefreshBlockNumber_gt?: InputMaybe<Scalars['BigInt']>;
  lastRefreshBlockNumber_lt?: InputMaybe<Scalars['BigInt']>;
  lastRefreshBlockNumber_gte?: InputMaybe<Scalars['BigInt']>;
  lastRefreshBlockNumber_lte?: InputMaybe<Scalars['BigInt']>;
  lastRefreshBlockNumber_in?: InputMaybe<Array<Scalars['BigInt']>>;
  lastRefreshBlockNumber_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  lastRefreshTimestamp?: InputMaybe<Scalars['Int']>;
  lastRefreshTimestamp_not?: InputMaybe<Scalars['Int']>;
  lastRefreshTimestamp_gt?: InputMaybe<Scalars['Int']>;
  lastRefreshTimestamp_lt?: InputMaybe<Scalars['Int']>;
  lastRefreshTimestamp_gte?: InputMaybe<Scalars['Int']>;
  lastRefreshTimestamp_lte?: InputMaybe<Scalars['Int']>;
  lastRefreshTimestamp_in?: InputMaybe<Array<Scalars['Int']>>;
  lastRefreshTimestamp_not_in?: InputMaybe<Array<Scalars['Int']>>;
  chainlinkOracles?: InputMaybe<Array<Scalars['String']>>;
  chainlinkOracles_not?: InputMaybe<Array<Scalars['String']>>;
  chainlinkOracles_contains?: InputMaybe<Array<Scalars['String']>>;
  chainlinkOracles_contains_nocase?: InputMaybe<Array<Scalars['String']>>;
  chainlinkOracles_not_contains?: InputMaybe<Array<Scalars['String']>>;
  chainlinkOracles_not_contains_nocase?: InputMaybe<Array<Scalars['String']>>;
  chainlinkOracles_?: InputMaybe<Oracle_filter>;
  listedVaults?: InputMaybe<Array<Scalars['Bytes']>>;
  listedVaults_not?: InputMaybe<Array<Scalars['Bytes']>>;
  listedVaults_contains?: InputMaybe<Array<Scalars['Bytes']>>;
  listedVaults_contains_nocase?: InputMaybe<Array<Scalars['Bytes']>>;
  listedVaults_not_contains?: InputMaybe<Array<Scalars['Bytes']>>;
  listedVaults_not_contains_nocase?: InputMaybe<Array<Scalars['Bytes']>>;
  lendingRouters?: InputMaybe<Array<Scalars['Bytes']>>;
  lendingRouters_not?: InputMaybe<Array<Scalars['Bytes']>>;
  lendingRouters_contains?: InputMaybe<Array<Scalars['Bytes']>>;
  lendingRouters_contains_nocase?: InputMaybe<Array<Scalars['Bytes']>>;
  lendingRouters_not_contains?: InputMaybe<Array<Scalars['Bytes']>>;
  lendingRouters_not_contains_nocase?: InputMaybe<Array<Scalars['Bytes']>>;
  withdrawRequestManager?: InputMaybe<Array<Scalars['Bytes']>>;
  withdrawRequestManager_not?: InputMaybe<Array<Scalars['Bytes']>>;
  withdrawRequestManager_contains?: InputMaybe<Array<Scalars['Bytes']>>;
  withdrawRequestManager_contains_nocase?: InputMaybe<Array<Scalars['Bytes']>>;
  withdrawRequestManager_not_contains?: InputMaybe<Array<Scalars['Bytes']>>;
  withdrawRequestManager_not_contains_nocase?: InputMaybe<Array<Scalars['Bytes']>>;
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
  id?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  lastUpdateBlockNumber?: InputMaybe<Scalars['BigInt']>;
  lastUpdateBlockNumber_not?: InputMaybe<Scalars['BigInt']>;
  lastUpdateBlockNumber_gt?: InputMaybe<Scalars['BigInt']>;
  lastUpdateBlockNumber_lt?: InputMaybe<Scalars['BigInt']>;
  lastUpdateBlockNumber_gte?: InputMaybe<Scalars['BigInt']>;
  lastUpdateBlockNumber_lte?: InputMaybe<Scalars['BigInt']>;
  lastUpdateBlockNumber_in?: InputMaybe<Array<Scalars['BigInt']>>;
  lastUpdateBlockNumber_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  lastUpdateTimestamp?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_not?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_gt?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_lt?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_gte?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_lte?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_in?: InputMaybe<Array<Scalars['Int']>>;
  lastUpdateTimestamp_not_in?: InputMaybe<Array<Scalars['Int']>>;
  lastUpdateTransactionHash?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_not?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_gt?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_lt?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_gte?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_lte?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
  lastUpdateTransactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  lastUpdateTransactionHash_contains?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_not_contains?: InputMaybe<Scalars['Bytes']>;
  base?: InputMaybe<Scalars['String']>;
  base_not?: InputMaybe<Scalars['String']>;
  base_gt?: InputMaybe<Scalars['String']>;
  base_lt?: InputMaybe<Scalars['String']>;
  base_gte?: InputMaybe<Scalars['String']>;
  base_lte?: InputMaybe<Scalars['String']>;
  base_in?: InputMaybe<Array<Scalars['String']>>;
  base_not_in?: InputMaybe<Array<Scalars['String']>>;
  base_contains?: InputMaybe<Scalars['String']>;
  base_contains_nocase?: InputMaybe<Scalars['String']>;
  base_not_contains?: InputMaybe<Scalars['String']>;
  base_not_contains_nocase?: InputMaybe<Scalars['String']>;
  base_starts_with?: InputMaybe<Scalars['String']>;
  base_starts_with_nocase?: InputMaybe<Scalars['String']>;
  base_not_starts_with?: InputMaybe<Scalars['String']>;
  base_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  base_ends_with?: InputMaybe<Scalars['String']>;
  base_ends_with_nocase?: InputMaybe<Scalars['String']>;
  base_not_ends_with?: InputMaybe<Scalars['String']>;
  base_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  base_?: InputMaybe<Token_filter>;
  quote?: InputMaybe<Scalars['String']>;
  quote_not?: InputMaybe<Scalars['String']>;
  quote_gt?: InputMaybe<Scalars['String']>;
  quote_lt?: InputMaybe<Scalars['String']>;
  quote_gte?: InputMaybe<Scalars['String']>;
  quote_lte?: InputMaybe<Scalars['String']>;
  quote_in?: InputMaybe<Array<Scalars['String']>>;
  quote_not_in?: InputMaybe<Array<Scalars['String']>>;
  quote_contains?: InputMaybe<Scalars['String']>;
  quote_contains_nocase?: InputMaybe<Scalars['String']>;
  quote_not_contains?: InputMaybe<Scalars['String']>;
  quote_not_contains_nocase?: InputMaybe<Scalars['String']>;
  quote_starts_with?: InputMaybe<Scalars['String']>;
  quote_starts_with_nocase?: InputMaybe<Scalars['String']>;
  quote_not_starts_with?: InputMaybe<Scalars['String']>;
  quote_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  quote_ends_with?: InputMaybe<Scalars['String']>;
  quote_ends_with_nocase?: InputMaybe<Scalars['String']>;
  quote_not_ends_with?: InputMaybe<Scalars['String']>;
  quote_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  quote_?: InputMaybe<Token_filter>;
  decimals?: InputMaybe<Scalars['Int']>;
  decimals_not?: InputMaybe<Scalars['Int']>;
  decimals_gt?: InputMaybe<Scalars['Int']>;
  decimals_lt?: InputMaybe<Scalars['Int']>;
  decimals_gte?: InputMaybe<Scalars['Int']>;
  decimals_lte?: InputMaybe<Scalars['Int']>;
  decimals_in?: InputMaybe<Array<Scalars['Int']>>;
  decimals_not_in?: InputMaybe<Array<Scalars['Int']>>;
  ratePrecision?: InputMaybe<Scalars['BigInt']>;
  ratePrecision_not?: InputMaybe<Scalars['BigInt']>;
  ratePrecision_gt?: InputMaybe<Scalars['BigInt']>;
  ratePrecision_lt?: InputMaybe<Scalars['BigInt']>;
  ratePrecision_gte?: InputMaybe<Scalars['BigInt']>;
  ratePrecision_lte?: InputMaybe<Scalars['BigInt']>;
  ratePrecision_in?: InputMaybe<Array<Scalars['BigInt']>>;
  ratePrecision_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  oracleAddress?: InputMaybe<Scalars['Bytes']>;
  oracleAddress_not?: InputMaybe<Scalars['Bytes']>;
  oracleAddress_gt?: InputMaybe<Scalars['Bytes']>;
  oracleAddress_lt?: InputMaybe<Scalars['Bytes']>;
  oracleAddress_gte?: InputMaybe<Scalars['Bytes']>;
  oracleAddress_lte?: InputMaybe<Scalars['Bytes']>;
  oracleAddress_in?: InputMaybe<Array<Scalars['Bytes']>>;
  oracleAddress_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  oracleAddress_contains?: InputMaybe<Scalars['Bytes']>;
  oracleAddress_not_contains?: InputMaybe<Scalars['Bytes']>;
  oracleType?: InputMaybe<OracleType>;
  oracleType_not?: InputMaybe<OracleType>;
  oracleType_in?: InputMaybe<Array<OracleType>>;
  oracleType_not_in?: InputMaybe<Array<OracleType>>;
  mustInvert?: InputMaybe<Scalars['Boolean']>;
  mustInvert_not?: InputMaybe<Scalars['Boolean']>;
  mustInvert_in?: InputMaybe<Array<Scalars['Boolean']>>;
  mustInvert_not_in?: InputMaybe<Array<Scalars['Boolean']>>;
  latestRate?: InputMaybe<Scalars['BigInt']>;
  latestRate_not?: InputMaybe<Scalars['BigInt']>;
  latestRate_gt?: InputMaybe<Scalars['BigInt']>;
  latestRate_lt?: InputMaybe<Scalars['BigInt']>;
  latestRate_gte?: InputMaybe<Scalars['BigInt']>;
  latestRate_lte?: InputMaybe<Scalars['BigInt']>;
  latestRate_in?: InputMaybe<Array<Scalars['BigInt']>>;
  latestRate_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  matured?: InputMaybe<Scalars['Boolean']>;
  matured_not?: InputMaybe<Scalars['Boolean']>;
  matured_in?: InputMaybe<Array<Scalars['Boolean']>>;
  matured_not_in?: InputMaybe<Array<Scalars['Boolean']>>;
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
  | 'base__vaultAddress'
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
  | 'quote__vaultAddress'
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
  id: Scalars['ID'];
  blockNumber: Scalars['BigInt'];
  timestamp: Scalars['Int'];
  transactionHash: Scalars['Bytes'];
  account: Account;
  token: Token;
  balanceSnapshot: BalanceSnapshot;
  underlyingToken: Token;
  lineItemType: LineItemType;
  tokenAmount: Scalars['BigInt'];
  underlyingAmountRealized: Scalars['BigInt'];
  underlyingAmountSpot: Scalars['BigInt'];
  realizedPrice: Scalars['BigInt'];
  spotPrice: Scalars['BigInt'];
  impliedFixedRate?: Maybe<Scalars['BigInt']>;
};

export type ProfitLossLineItem_filter = {
  id?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  blockNumber?: InputMaybe<Scalars['BigInt']>;
  blockNumber_not?: InputMaybe<Scalars['BigInt']>;
  blockNumber_gt?: InputMaybe<Scalars['BigInt']>;
  blockNumber_lt?: InputMaybe<Scalars['BigInt']>;
  blockNumber_gte?: InputMaybe<Scalars['BigInt']>;
  blockNumber_lte?: InputMaybe<Scalars['BigInt']>;
  blockNumber_in?: InputMaybe<Array<Scalars['BigInt']>>;
  blockNumber_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  timestamp?: InputMaybe<Scalars['Int']>;
  timestamp_not?: InputMaybe<Scalars['Int']>;
  timestamp_gt?: InputMaybe<Scalars['Int']>;
  timestamp_lt?: InputMaybe<Scalars['Int']>;
  timestamp_gte?: InputMaybe<Scalars['Int']>;
  timestamp_lte?: InputMaybe<Scalars['Int']>;
  timestamp_in?: InputMaybe<Array<Scalars['Int']>>;
  timestamp_not_in?: InputMaybe<Array<Scalars['Int']>>;
  transactionHash?: InputMaybe<Scalars['Bytes']>;
  transactionHash_not?: InputMaybe<Scalars['Bytes']>;
  transactionHash_gt?: InputMaybe<Scalars['Bytes']>;
  transactionHash_lt?: InputMaybe<Scalars['Bytes']>;
  transactionHash_gte?: InputMaybe<Scalars['Bytes']>;
  transactionHash_lte?: InputMaybe<Scalars['Bytes']>;
  transactionHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
  transactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  transactionHash_contains?: InputMaybe<Scalars['Bytes']>;
  transactionHash_not_contains?: InputMaybe<Scalars['Bytes']>;
  account?: InputMaybe<Scalars['String']>;
  account_not?: InputMaybe<Scalars['String']>;
  account_gt?: InputMaybe<Scalars['String']>;
  account_lt?: InputMaybe<Scalars['String']>;
  account_gte?: InputMaybe<Scalars['String']>;
  account_lte?: InputMaybe<Scalars['String']>;
  account_in?: InputMaybe<Array<Scalars['String']>>;
  account_not_in?: InputMaybe<Array<Scalars['String']>>;
  account_contains?: InputMaybe<Scalars['String']>;
  account_contains_nocase?: InputMaybe<Scalars['String']>;
  account_not_contains?: InputMaybe<Scalars['String']>;
  account_not_contains_nocase?: InputMaybe<Scalars['String']>;
  account_starts_with?: InputMaybe<Scalars['String']>;
  account_starts_with_nocase?: InputMaybe<Scalars['String']>;
  account_not_starts_with?: InputMaybe<Scalars['String']>;
  account_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  account_ends_with?: InputMaybe<Scalars['String']>;
  account_ends_with_nocase?: InputMaybe<Scalars['String']>;
  account_not_ends_with?: InputMaybe<Scalars['String']>;
  account_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  account_?: InputMaybe<Account_filter>;
  token?: InputMaybe<Scalars['String']>;
  token_not?: InputMaybe<Scalars['String']>;
  token_gt?: InputMaybe<Scalars['String']>;
  token_lt?: InputMaybe<Scalars['String']>;
  token_gte?: InputMaybe<Scalars['String']>;
  token_lte?: InputMaybe<Scalars['String']>;
  token_in?: InputMaybe<Array<Scalars['String']>>;
  token_not_in?: InputMaybe<Array<Scalars['String']>>;
  token_contains?: InputMaybe<Scalars['String']>;
  token_contains_nocase?: InputMaybe<Scalars['String']>;
  token_not_contains?: InputMaybe<Scalars['String']>;
  token_not_contains_nocase?: InputMaybe<Scalars['String']>;
  token_starts_with?: InputMaybe<Scalars['String']>;
  token_starts_with_nocase?: InputMaybe<Scalars['String']>;
  token_not_starts_with?: InputMaybe<Scalars['String']>;
  token_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  token_ends_with?: InputMaybe<Scalars['String']>;
  token_ends_with_nocase?: InputMaybe<Scalars['String']>;
  token_not_ends_with?: InputMaybe<Scalars['String']>;
  token_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  token_?: InputMaybe<Token_filter>;
  balanceSnapshot?: InputMaybe<Scalars['String']>;
  balanceSnapshot_not?: InputMaybe<Scalars['String']>;
  balanceSnapshot_gt?: InputMaybe<Scalars['String']>;
  balanceSnapshot_lt?: InputMaybe<Scalars['String']>;
  balanceSnapshot_gte?: InputMaybe<Scalars['String']>;
  balanceSnapshot_lte?: InputMaybe<Scalars['String']>;
  balanceSnapshot_in?: InputMaybe<Array<Scalars['String']>>;
  balanceSnapshot_not_in?: InputMaybe<Array<Scalars['String']>>;
  balanceSnapshot_contains?: InputMaybe<Scalars['String']>;
  balanceSnapshot_contains_nocase?: InputMaybe<Scalars['String']>;
  balanceSnapshot_not_contains?: InputMaybe<Scalars['String']>;
  balanceSnapshot_not_contains_nocase?: InputMaybe<Scalars['String']>;
  balanceSnapshot_starts_with?: InputMaybe<Scalars['String']>;
  balanceSnapshot_starts_with_nocase?: InputMaybe<Scalars['String']>;
  balanceSnapshot_not_starts_with?: InputMaybe<Scalars['String']>;
  balanceSnapshot_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  balanceSnapshot_ends_with?: InputMaybe<Scalars['String']>;
  balanceSnapshot_ends_with_nocase?: InputMaybe<Scalars['String']>;
  balanceSnapshot_not_ends_with?: InputMaybe<Scalars['String']>;
  balanceSnapshot_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  balanceSnapshot_?: InputMaybe<BalanceSnapshot_filter>;
  underlyingToken?: InputMaybe<Scalars['String']>;
  underlyingToken_not?: InputMaybe<Scalars['String']>;
  underlyingToken_gt?: InputMaybe<Scalars['String']>;
  underlyingToken_lt?: InputMaybe<Scalars['String']>;
  underlyingToken_gte?: InputMaybe<Scalars['String']>;
  underlyingToken_lte?: InputMaybe<Scalars['String']>;
  underlyingToken_in?: InputMaybe<Array<Scalars['String']>>;
  underlyingToken_not_in?: InputMaybe<Array<Scalars['String']>>;
  underlyingToken_contains?: InputMaybe<Scalars['String']>;
  underlyingToken_contains_nocase?: InputMaybe<Scalars['String']>;
  underlyingToken_not_contains?: InputMaybe<Scalars['String']>;
  underlyingToken_not_contains_nocase?: InputMaybe<Scalars['String']>;
  underlyingToken_starts_with?: InputMaybe<Scalars['String']>;
  underlyingToken_starts_with_nocase?: InputMaybe<Scalars['String']>;
  underlyingToken_not_starts_with?: InputMaybe<Scalars['String']>;
  underlyingToken_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  underlyingToken_ends_with?: InputMaybe<Scalars['String']>;
  underlyingToken_ends_with_nocase?: InputMaybe<Scalars['String']>;
  underlyingToken_not_ends_with?: InputMaybe<Scalars['String']>;
  underlyingToken_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  underlyingToken_?: InputMaybe<Token_filter>;
  lineItemType?: InputMaybe<LineItemType>;
  lineItemType_not?: InputMaybe<LineItemType>;
  lineItemType_in?: InputMaybe<Array<LineItemType>>;
  lineItemType_not_in?: InputMaybe<Array<LineItemType>>;
  tokenAmount?: InputMaybe<Scalars['BigInt']>;
  tokenAmount_not?: InputMaybe<Scalars['BigInt']>;
  tokenAmount_gt?: InputMaybe<Scalars['BigInt']>;
  tokenAmount_lt?: InputMaybe<Scalars['BigInt']>;
  tokenAmount_gte?: InputMaybe<Scalars['BigInt']>;
  tokenAmount_lte?: InputMaybe<Scalars['BigInt']>;
  tokenAmount_in?: InputMaybe<Array<Scalars['BigInt']>>;
  tokenAmount_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  underlyingAmountRealized?: InputMaybe<Scalars['BigInt']>;
  underlyingAmountRealized_not?: InputMaybe<Scalars['BigInt']>;
  underlyingAmountRealized_gt?: InputMaybe<Scalars['BigInt']>;
  underlyingAmountRealized_lt?: InputMaybe<Scalars['BigInt']>;
  underlyingAmountRealized_gte?: InputMaybe<Scalars['BigInt']>;
  underlyingAmountRealized_lte?: InputMaybe<Scalars['BigInt']>;
  underlyingAmountRealized_in?: InputMaybe<Array<Scalars['BigInt']>>;
  underlyingAmountRealized_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  underlyingAmountSpot?: InputMaybe<Scalars['BigInt']>;
  underlyingAmountSpot_not?: InputMaybe<Scalars['BigInt']>;
  underlyingAmountSpot_gt?: InputMaybe<Scalars['BigInt']>;
  underlyingAmountSpot_lt?: InputMaybe<Scalars['BigInt']>;
  underlyingAmountSpot_gte?: InputMaybe<Scalars['BigInt']>;
  underlyingAmountSpot_lte?: InputMaybe<Scalars['BigInt']>;
  underlyingAmountSpot_in?: InputMaybe<Array<Scalars['BigInt']>>;
  underlyingAmountSpot_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  realizedPrice?: InputMaybe<Scalars['BigInt']>;
  realizedPrice_not?: InputMaybe<Scalars['BigInt']>;
  realizedPrice_gt?: InputMaybe<Scalars['BigInt']>;
  realizedPrice_lt?: InputMaybe<Scalars['BigInt']>;
  realizedPrice_gte?: InputMaybe<Scalars['BigInt']>;
  realizedPrice_lte?: InputMaybe<Scalars['BigInt']>;
  realizedPrice_in?: InputMaybe<Array<Scalars['BigInt']>>;
  realizedPrice_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  spotPrice?: InputMaybe<Scalars['BigInt']>;
  spotPrice_not?: InputMaybe<Scalars['BigInt']>;
  spotPrice_gt?: InputMaybe<Scalars['BigInt']>;
  spotPrice_lt?: InputMaybe<Scalars['BigInt']>;
  spotPrice_gte?: InputMaybe<Scalars['BigInt']>;
  spotPrice_lte?: InputMaybe<Scalars['BigInt']>;
  spotPrice_in?: InputMaybe<Array<Scalars['BigInt']>>;
  spotPrice_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  impliedFixedRate?: InputMaybe<Scalars['BigInt']>;
  impliedFixedRate_not?: InputMaybe<Scalars['BigInt']>;
  impliedFixedRate_gt?: InputMaybe<Scalars['BigInt']>;
  impliedFixedRate_lt?: InputMaybe<Scalars['BigInt']>;
  impliedFixedRate_gte?: InputMaybe<Scalars['BigInt']>;
  impliedFixedRate_lte?: InputMaybe<Scalars['BigInt']>;
  impliedFixedRate_in?: InputMaybe<Array<Scalars['BigInt']>>;
  impliedFixedRate_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
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
  | 'token__vaultAddress'
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
  | 'underlyingToken__vaultAddress'
  | 'underlyingToken__tokenAddress'
  | 'lineItemType'
  | 'tokenAmount'
  | 'underlyingAmountRealized'
  | 'underlyingAmountSpot'
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
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QuerytokensArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Token_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<Token_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryprofitLossLineItemArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryprofitLossLineItemsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<ProfitLossLineItem_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<ProfitLossLineItem_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryaccountArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryaccountsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Account_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<Account_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryoracleRegistryArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryoracleRegistriesArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<OracleRegistry_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<OracleRegistry_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryoracleArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryoraclesArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Oracle_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<Oracle_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryexchangeRateArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryexchangeRatesArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<ExchangeRate_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<ExchangeRate_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryvaultArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryvaultsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Vault_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<Vault_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QuerylendingRouterArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QuerylendingRoutersArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<LendingRouter_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<LendingRouter_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QuerymarketArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QuerymarketsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Market_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<Market_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QuerywithdrawRequestManagerArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QuerywithdrawRequestManagersArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<WithdrawRequestManager_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<WithdrawRequestManager_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QuerybalanceArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QuerybalancesArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Balance_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<Balance_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QuerybalanceSnapshotArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QuerybalanceSnapshotsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<BalanceSnapshot_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<BalanceSnapshot_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QuerywithdrawRequestArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QuerywithdrawRequestsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<WithdrawRequest_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<WithdrawRequest_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QuerytokenizedWithdrawRequestArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QuerytokenizedWithdrawRequestsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<TokenizedWithdrawRequest_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<TokenizedWithdrawRequest_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryincentiveSnapshotArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryincentiveSnapshotsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<IncentiveSnapshot_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<IncentiveSnapshot_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QuerytradingModulePermissionArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QuerytradingModulePermissionsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
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
  id: Scalars['ID'];
  firstUpdateBlockNumber: Scalars['BigInt'];
  firstUpdateTimestamp: Scalars['Int'];
  firstUpdateTransactionHash?: Maybe<Scalars['Bytes']>;
  lastUpdateBlockNumber: Scalars['BigInt'];
  lastUpdateTimestamp: Scalars['Int'];
  lastUpdateTransactionHash?: Maybe<Scalars['Bytes']>;
  tokenType: TokenType;
  tokenInterface: TokenInterface;
  /** A link to the underlying token if this token is not underlying itself */
  underlying?: Maybe<Token>;
  name: Scalars['String'];
  symbol: Scalars['String'];
  decimals: Scalars['Int'];
  precision: Scalars['BigInt'];
  /** Only updated for Notional entities */
  totalSupply?: Maybe<Scalars['BigInt']>;
  /** Maturities are only set for some token types */
  maturity?: Maybe<Scalars['BigInt']>;
  /** Vault address is set for vault token types */
  vaultAddress?: Maybe<Scalars['Bytes']>;
  /** Set to the ERC20 address or Notional Proxy for ERC1155 addresses */
  tokenAddress: Scalars['Bytes'];
  balanceOf?: Maybe<Array<Balance>>;
  oracles?: Maybe<Array<Oracle>>;
};


export type TokenbalanceOfArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Balance_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<Balance_filter>;
};


export type TokenoraclesArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
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
  id?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  firstUpdateBlockNumber?: InputMaybe<Scalars['BigInt']>;
  firstUpdateBlockNumber_not?: InputMaybe<Scalars['BigInt']>;
  firstUpdateBlockNumber_gt?: InputMaybe<Scalars['BigInt']>;
  firstUpdateBlockNumber_lt?: InputMaybe<Scalars['BigInt']>;
  firstUpdateBlockNumber_gte?: InputMaybe<Scalars['BigInt']>;
  firstUpdateBlockNumber_lte?: InputMaybe<Scalars['BigInt']>;
  firstUpdateBlockNumber_in?: InputMaybe<Array<Scalars['BigInt']>>;
  firstUpdateBlockNumber_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  firstUpdateTimestamp?: InputMaybe<Scalars['Int']>;
  firstUpdateTimestamp_not?: InputMaybe<Scalars['Int']>;
  firstUpdateTimestamp_gt?: InputMaybe<Scalars['Int']>;
  firstUpdateTimestamp_lt?: InputMaybe<Scalars['Int']>;
  firstUpdateTimestamp_gte?: InputMaybe<Scalars['Int']>;
  firstUpdateTimestamp_lte?: InputMaybe<Scalars['Int']>;
  firstUpdateTimestamp_in?: InputMaybe<Array<Scalars['Int']>>;
  firstUpdateTimestamp_not_in?: InputMaybe<Array<Scalars['Int']>>;
  firstUpdateTransactionHash?: InputMaybe<Scalars['Bytes']>;
  firstUpdateTransactionHash_not?: InputMaybe<Scalars['Bytes']>;
  firstUpdateTransactionHash_gt?: InputMaybe<Scalars['Bytes']>;
  firstUpdateTransactionHash_lt?: InputMaybe<Scalars['Bytes']>;
  firstUpdateTransactionHash_gte?: InputMaybe<Scalars['Bytes']>;
  firstUpdateTransactionHash_lte?: InputMaybe<Scalars['Bytes']>;
  firstUpdateTransactionHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
  firstUpdateTransactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  firstUpdateTransactionHash_contains?: InputMaybe<Scalars['Bytes']>;
  firstUpdateTransactionHash_not_contains?: InputMaybe<Scalars['Bytes']>;
  lastUpdateBlockNumber?: InputMaybe<Scalars['BigInt']>;
  lastUpdateBlockNumber_not?: InputMaybe<Scalars['BigInt']>;
  lastUpdateBlockNumber_gt?: InputMaybe<Scalars['BigInt']>;
  lastUpdateBlockNumber_lt?: InputMaybe<Scalars['BigInt']>;
  lastUpdateBlockNumber_gte?: InputMaybe<Scalars['BigInt']>;
  lastUpdateBlockNumber_lte?: InputMaybe<Scalars['BigInt']>;
  lastUpdateBlockNumber_in?: InputMaybe<Array<Scalars['BigInt']>>;
  lastUpdateBlockNumber_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  lastUpdateTimestamp?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_not?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_gt?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_lt?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_gte?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_lte?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_in?: InputMaybe<Array<Scalars['Int']>>;
  lastUpdateTimestamp_not_in?: InputMaybe<Array<Scalars['Int']>>;
  lastUpdateTransactionHash?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_not?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_gt?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_lt?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_gte?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_lte?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
  lastUpdateTransactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  lastUpdateTransactionHash_contains?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_not_contains?: InputMaybe<Scalars['Bytes']>;
  tokenType?: InputMaybe<TokenType>;
  tokenType_not?: InputMaybe<TokenType>;
  tokenType_in?: InputMaybe<Array<TokenType>>;
  tokenType_not_in?: InputMaybe<Array<TokenType>>;
  tokenInterface?: InputMaybe<TokenInterface>;
  tokenInterface_not?: InputMaybe<TokenInterface>;
  tokenInterface_in?: InputMaybe<Array<TokenInterface>>;
  tokenInterface_not_in?: InputMaybe<Array<TokenInterface>>;
  underlying?: InputMaybe<Scalars['String']>;
  underlying_not?: InputMaybe<Scalars['String']>;
  underlying_gt?: InputMaybe<Scalars['String']>;
  underlying_lt?: InputMaybe<Scalars['String']>;
  underlying_gte?: InputMaybe<Scalars['String']>;
  underlying_lte?: InputMaybe<Scalars['String']>;
  underlying_in?: InputMaybe<Array<Scalars['String']>>;
  underlying_not_in?: InputMaybe<Array<Scalars['String']>>;
  underlying_contains?: InputMaybe<Scalars['String']>;
  underlying_contains_nocase?: InputMaybe<Scalars['String']>;
  underlying_not_contains?: InputMaybe<Scalars['String']>;
  underlying_not_contains_nocase?: InputMaybe<Scalars['String']>;
  underlying_starts_with?: InputMaybe<Scalars['String']>;
  underlying_starts_with_nocase?: InputMaybe<Scalars['String']>;
  underlying_not_starts_with?: InputMaybe<Scalars['String']>;
  underlying_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  underlying_ends_with?: InputMaybe<Scalars['String']>;
  underlying_ends_with_nocase?: InputMaybe<Scalars['String']>;
  underlying_not_ends_with?: InputMaybe<Scalars['String']>;
  underlying_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  underlying_?: InputMaybe<Token_filter>;
  name?: InputMaybe<Scalars['String']>;
  name_not?: InputMaybe<Scalars['String']>;
  name_gt?: InputMaybe<Scalars['String']>;
  name_lt?: InputMaybe<Scalars['String']>;
  name_gte?: InputMaybe<Scalars['String']>;
  name_lte?: InputMaybe<Scalars['String']>;
  name_in?: InputMaybe<Array<Scalars['String']>>;
  name_not_in?: InputMaybe<Array<Scalars['String']>>;
  name_contains?: InputMaybe<Scalars['String']>;
  name_contains_nocase?: InputMaybe<Scalars['String']>;
  name_not_contains?: InputMaybe<Scalars['String']>;
  name_not_contains_nocase?: InputMaybe<Scalars['String']>;
  name_starts_with?: InputMaybe<Scalars['String']>;
  name_starts_with_nocase?: InputMaybe<Scalars['String']>;
  name_not_starts_with?: InputMaybe<Scalars['String']>;
  name_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  name_ends_with?: InputMaybe<Scalars['String']>;
  name_ends_with_nocase?: InputMaybe<Scalars['String']>;
  name_not_ends_with?: InputMaybe<Scalars['String']>;
  name_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  symbol?: InputMaybe<Scalars['String']>;
  symbol_not?: InputMaybe<Scalars['String']>;
  symbol_gt?: InputMaybe<Scalars['String']>;
  symbol_lt?: InputMaybe<Scalars['String']>;
  symbol_gte?: InputMaybe<Scalars['String']>;
  symbol_lte?: InputMaybe<Scalars['String']>;
  symbol_in?: InputMaybe<Array<Scalars['String']>>;
  symbol_not_in?: InputMaybe<Array<Scalars['String']>>;
  symbol_contains?: InputMaybe<Scalars['String']>;
  symbol_contains_nocase?: InputMaybe<Scalars['String']>;
  symbol_not_contains?: InputMaybe<Scalars['String']>;
  symbol_not_contains_nocase?: InputMaybe<Scalars['String']>;
  symbol_starts_with?: InputMaybe<Scalars['String']>;
  symbol_starts_with_nocase?: InputMaybe<Scalars['String']>;
  symbol_not_starts_with?: InputMaybe<Scalars['String']>;
  symbol_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  symbol_ends_with?: InputMaybe<Scalars['String']>;
  symbol_ends_with_nocase?: InputMaybe<Scalars['String']>;
  symbol_not_ends_with?: InputMaybe<Scalars['String']>;
  symbol_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  decimals?: InputMaybe<Scalars['Int']>;
  decimals_not?: InputMaybe<Scalars['Int']>;
  decimals_gt?: InputMaybe<Scalars['Int']>;
  decimals_lt?: InputMaybe<Scalars['Int']>;
  decimals_gte?: InputMaybe<Scalars['Int']>;
  decimals_lte?: InputMaybe<Scalars['Int']>;
  decimals_in?: InputMaybe<Array<Scalars['Int']>>;
  decimals_not_in?: InputMaybe<Array<Scalars['Int']>>;
  precision?: InputMaybe<Scalars['BigInt']>;
  precision_not?: InputMaybe<Scalars['BigInt']>;
  precision_gt?: InputMaybe<Scalars['BigInt']>;
  precision_lt?: InputMaybe<Scalars['BigInt']>;
  precision_gte?: InputMaybe<Scalars['BigInt']>;
  precision_lte?: InputMaybe<Scalars['BigInt']>;
  precision_in?: InputMaybe<Array<Scalars['BigInt']>>;
  precision_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  totalSupply?: InputMaybe<Scalars['BigInt']>;
  totalSupply_not?: InputMaybe<Scalars['BigInt']>;
  totalSupply_gt?: InputMaybe<Scalars['BigInt']>;
  totalSupply_lt?: InputMaybe<Scalars['BigInt']>;
  totalSupply_gte?: InputMaybe<Scalars['BigInt']>;
  totalSupply_lte?: InputMaybe<Scalars['BigInt']>;
  totalSupply_in?: InputMaybe<Array<Scalars['BigInt']>>;
  totalSupply_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  maturity?: InputMaybe<Scalars['BigInt']>;
  maturity_not?: InputMaybe<Scalars['BigInt']>;
  maturity_gt?: InputMaybe<Scalars['BigInt']>;
  maturity_lt?: InputMaybe<Scalars['BigInt']>;
  maturity_gte?: InputMaybe<Scalars['BigInt']>;
  maturity_lte?: InputMaybe<Scalars['BigInt']>;
  maturity_in?: InputMaybe<Array<Scalars['BigInt']>>;
  maturity_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  vaultAddress?: InputMaybe<Scalars['Bytes']>;
  vaultAddress_not?: InputMaybe<Scalars['Bytes']>;
  vaultAddress_gt?: InputMaybe<Scalars['Bytes']>;
  vaultAddress_lt?: InputMaybe<Scalars['Bytes']>;
  vaultAddress_gte?: InputMaybe<Scalars['Bytes']>;
  vaultAddress_lte?: InputMaybe<Scalars['Bytes']>;
  vaultAddress_in?: InputMaybe<Array<Scalars['Bytes']>>;
  vaultAddress_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  vaultAddress_contains?: InputMaybe<Scalars['Bytes']>;
  vaultAddress_not_contains?: InputMaybe<Scalars['Bytes']>;
  tokenAddress?: InputMaybe<Scalars['Bytes']>;
  tokenAddress_not?: InputMaybe<Scalars['Bytes']>;
  tokenAddress_gt?: InputMaybe<Scalars['Bytes']>;
  tokenAddress_lt?: InputMaybe<Scalars['Bytes']>;
  tokenAddress_gte?: InputMaybe<Scalars['Bytes']>;
  tokenAddress_lte?: InputMaybe<Scalars['Bytes']>;
  tokenAddress_in?: InputMaybe<Array<Scalars['Bytes']>>;
  tokenAddress_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  tokenAddress_contains?: InputMaybe<Scalars['Bytes']>;
  tokenAddress_not_contains?: InputMaybe<Scalars['Bytes']>;
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
  | 'underlying__vaultAddress'
  | 'underlying__tokenAddress'
  | 'name'
  | 'symbol'
  | 'decimals'
  | 'precision'
  | 'totalSupply'
  | 'maturity'
  | 'vaultAddress'
  | 'tokenAddress'
  | 'balanceOf'
  | 'oracles';

export type TokenizedWithdrawRequest = {
  /** Withdraw Request Manager:Request ID */
  id: Scalars['ID'];
  lastUpdateBlockNumber: Scalars['BigInt'];
  lastUpdateTimestamp: Scalars['Int'];
  lastUpdateTransactionHash: Scalars['Bytes'];
  finalizedBlockNumber?: Maybe<Scalars['BigInt']>;
  finalizedTimestamp?: Maybe<Scalars['Int']>;
  finalizedTransactionHash?: Maybe<Scalars['Bytes']>;
  /** Link to the withdraw request manager */
  withdrawRequestManager: WithdrawRequestManager;
  /** Total amount of yield tokens requested */
  totalYieldTokenAmount: Scalars['BigInt'];
  /** Total amount of withdraw tokens requested */
  totalWithdraw: Scalars['BigInt'];
  /** True when finalized */
  finalized: Scalars['Boolean'];
  /** Used to finalize all the holders of the tokenized withdraw request */
  _holders: Array<WithdrawRequest>;
  withdrawRequests?: Maybe<Array<WithdrawRequest>>;
};


export type TokenizedWithdrawRequest_holdersArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<WithdrawRequest_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<WithdrawRequest_filter>;
};


export type TokenizedWithdrawRequestwithdrawRequestsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<WithdrawRequest_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<WithdrawRequest_filter>;
};

export type TokenizedWithdrawRequest_filter = {
  id?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  lastUpdateBlockNumber?: InputMaybe<Scalars['BigInt']>;
  lastUpdateBlockNumber_not?: InputMaybe<Scalars['BigInt']>;
  lastUpdateBlockNumber_gt?: InputMaybe<Scalars['BigInt']>;
  lastUpdateBlockNumber_lt?: InputMaybe<Scalars['BigInt']>;
  lastUpdateBlockNumber_gte?: InputMaybe<Scalars['BigInt']>;
  lastUpdateBlockNumber_lte?: InputMaybe<Scalars['BigInt']>;
  lastUpdateBlockNumber_in?: InputMaybe<Array<Scalars['BigInt']>>;
  lastUpdateBlockNumber_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  lastUpdateTimestamp?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_not?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_gt?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_lt?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_gte?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_lte?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_in?: InputMaybe<Array<Scalars['Int']>>;
  lastUpdateTimestamp_not_in?: InputMaybe<Array<Scalars['Int']>>;
  lastUpdateTransactionHash?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_not?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_gt?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_lt?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_gte?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_lte?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
  lastUpdateTransactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  lastUpdateTransactionHash_contains?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_not_contains?: InputMaybe<Scalars['Bytes']>;
  finalizedBlockNumber?: InputMaybe<Scalars['BigInt']>;
  finalizedBlockNumber_not?: InputMaybe<Scalars['BigInt']>;
  finalizedBlockNumber_gt?: InputMaybe<Scalars['BigInt']>;
  finalizedBlockNumber_lt?: InputMaybe<Scalars['BigInt']>;
  finalizedBlockNumber_gte?: InputMaybe<Scalars['BigInt']>;
  finalizedBlockNumber_lte?: InputMaybe<Scalars['BigInt']>;
  finalizedBlockNumber_in?: InputMaybe<Array<Scalars['BigInt']>>;
  finalizedBlockNumber_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  finalizedTimestamp?: InputMaybe<Scalars['Int']>;
  finalizedTimestamp_not?: InputMaybe<Scalars['Int']>;
  finalizedTimestamp_gt?: InputMaybe<Scalars['Int']>;
  finalizedTimestamp_lt?: InputMaybe<Scalars['Int']>;
  finalizedTimestamp_gte?: InputMaybe<Scalars['Int']>;
  finalizedTimestamp_lte?: InputMaybe<Scalars['Int']>;
  finalizedTimestamp_in?: InputMaybe<Array<Scalars['Int']>>;
  finalizedTimestamp_not_in?: InputMaybe<Array<Scalars['Int']>>;
  finalizedTransactionHash?: InputMaybe<Scalars['Bytes']>;
  finalizedTransactionHash_not?: InputMaybe<Scalars['Bytes']>;
  finalizedTransactionHash_gt?: InputMaybe<Scalars['Bytes']>;
  finalizedTransactionHash_lt?: InputMaybe<Scalars['Bytes']>;
  finalizedTransactionHash_gte?: InputMaybe<Scalars['Bytes']>;
  finalizedTransactionHash_lte?: InputMaybe<Scalars['Bytes']>;
  finalizedTransactionHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
  finalizedTransactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  finalizedTransactionHash_contains?: InputMaybe<Scalars['Bytes']>;
  finalizedTransactionHash_not_contains?: InputMaybe<Scalars['Bytes']>;
  withdrawRequestManager?: InputMaybe<Scalars['String']>;
  withdrawRequestManager_not?: InputMaybe<Scalars['String']>;
  withdrawRequestManager_gt?: InputMaybe<Scalars['String']>;
  withdrawRequestManager_lt?: InputMaybe<Scalars['String']>;
  withdrawRequestManager_gte?: InputMaybe<Scalars['String']>;
  withdrawRequestManager_lte?: InputMaybe<Scalars['String']>;
  withdrawRequestManager_in?: InputMaybe<Array<Scalars['String']>>;
  withdrawRequestManager_not_in?: InputMaybe<Array<Scalars['String']>>;
  withdrawRequestManager_contains?: InputMaybe<Scalars['String']>;
  withdrawRequestManager_contains_nocase?: InputMaybe<Scalars['String']>;
  withdrawRequestManager_not_contains?: InputMaybe<Scalars['String']>;
  withdrawRequestManager_not_contains_nocase?: InputMaybe<Scalars['String']>;
  withdrawRequestManager_starts_with?: InputMaybe<Scalars['String']>;
  withdrawRequestManager_starts_with_nocase?: InputMaybe<Scalars['String']>;
  withdrawRequestManager_not_starts_with?: InputMaybe<Scalars['String']>;
  withdrawRequestManager_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  withdrawRequestManager_ends_with?: InputMaybe<Scalars['String']>;
  withdrawRequestManager_ends_with_nocase?: InputMaybe<Scalars['String']>;
  withdrawRequestManager_not_ends_with?: InputMaybe<Scalars['String']>;
  withdrawRequestManager_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  withdrawRequestManager_?: InputMaybe<WithdrawRequestManager_filter>;
  totalYieldTokenAmount?: InputMaybe<Scalars['BigInt']>;
  totalYieldTokenAmount_not?: InputMaybe<Scalars['BigInt']>;
  totalYieldTokenAmount_gt?: InputMaybe<Scalars['BigInt']>;
  totalYieldTokenAmount_lt?: InputMaybe<Scalars['BigInt']>;
  totalYieldTokenAmount_gte?: InputMaybe<Scalars['BigInt']>;
  totalYieldTokenAmount_lte?: InputMaybe<Scalars['BigInt']>;
  totalYieldTokenAmount_in?: InputMaybe<Array<Scalars['BigInt']>>;
  totalYieldTokenAmount_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  totalWithdraw?: InputMaybe<Scalars['BigInt']>;
  totalWithdraw_not?: InputMaybe<Scalars['BigInt']>;
  totalWithdraw_gt?: InputMaybe<Scalars['BigInt']>;
  totalWithdraw_lt?: InputMaybe<Scalars['BigInt']>;
  totalWithdraw_gte?: InputMaybe<Scalars['BigInt']>;
  totalWithdraw_lte?: InputMaybe<Scalars['BigInt']>;
  totalWithdraw_in?: InputMaybe<Array<Scalars['BigInt']>>;
  totalWithdraw_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  finalized?: InputMaybe<Scalars['Boolean']>;
  finalized_not?: InputMaybe<Scalars['Boolean']>;
  finalized_in?: InputMaybe<Array<Scalars['Boolean']>>;
  finalized_not_in?: InputMaybe<Array<Scalars['Boolean']>>;
  _holders?: InputMaybe<Array<Scalars['String']>>;
  _holders_not?: InputMaybe<Array<Scalars['String']>>;
  _holders_contains?: InputMaybe<Array<Scalars['String']>>;
  _holders_contains_nocase?: InputMaybe<Array<Scalars['String']>>;
  _holders_not_contains?: InputMaybe<Array<Scalars['String']>>;
  _holders_not_contains_nocase?: InputMaybe<Array<Scalars['String']>>;
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
  id: Scalars['ID'];
  lastUpdateBlockNumber: Scalars['BigInt'];
  lastUpdateTimestamp: Scalars['Int'];
  lastUpdateTransactionHash: Scalars['Bytes'];
  sender: Scalars['Bytes'];
  token?: Maybe<Token>;
  tokenAddress: Scalars['Bytes'];
  name: Scalars['String'];
  symbol: Scalars['String'];
  allowedDexes: Array<DEX>;
  allowSell: Scalars['Boolean'];
  allowedTradeTypes: Array<TradeType>;
};

export type TradingModulePermission_filter = {
  id?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  lastUpdateBlockNumber?: InputMaybe<Scalars['BigInt']>;
  lastUpdateBlockNumber_not?: InputMaybe<Scalars['BigInt']>;
  lastUpdateBlockNumber_gt?: InputMaybe<Scalars['BigInt']>;
  lastUpdateBlockNumber_lt?: InputMaybe<Scalars['BigInt']>;
  lastUpdateBlockNumber_gte?: InputMaybe<Scalars['BigInt']>;
  lastUpdateBlockNumber_lte?: InputMaybe<Scalars['BigInt']>;
  lastUpdateBlockNumber_in?: InputMaybe<Array<Scalars['BigInt']>>;
  lastUpdateBlockNumber_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  lastUpdateTimestamp?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_not?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_gt?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_lt?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_gte?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_lte?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_in?: InputMaybe<Array<Scalars['Int']>>;
  lastUpdateTimestamp_not_in?: InputMaybe<Array<Scalars['Int']>>;
  lastUpdateTransactionHash?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_not?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_gt?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_lt?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_gte?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_lte?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
  lastUpdateTransactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  lastUpdateTransactionHash_contains?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_not_contains?: InputMaybe<Scalars['Bytes']>;
  sender?: InputMaybe<Scalars['Bytes']>;
  sender_not?: InputMaybe<Scalars['Bytes']>;
  sender_gt?: InputMaybe<Scalars['Bytes']>;
  sender_lt?: InputMaybe<Scalars['Bytes']>;
  sender_gte?: InputMaybe<Scalars['Bytes']>;
  sender_lte?: InputMaybe<Scalars['Bytes']>;
  sender_in?: InputMaybe<Array<Scalars['Bytes']>>;
  sender_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  sender_contains?: InputMaybe<Scalars['Bytes']>;
  sender_not_contains?: InputMaybe<Scalars['Bytes']>;
  token?: InputMaybe<Scalars['String']>;
  token_not?: InputMaybe<Scalars['String']>;
  token_gt?: InputMaybe<Scalars['String']>;
  token_lt?: InputMaybe<Scalars['String']>;
  token_gte?: InputMaybe<Scalars['String']>;
  token_lte?: InputMaybe<Scalars['String']>;
  token_in?: InputMaybe<Array<Scalars['String']>>;
  token_not_in?: InputMaybe<Array<Scalars['String']>>;
  token_contains?: InputMaybe<Scalars['String']>;
  token_contains_nocase?: InputMaybe<Scalars['String']>;
  token_not_contains?: InputMaybe<Scalars['String']>;
  token_not_contains_nocase?: InputMaybe<Scalars['String']>;
  token_starts_with?: InputMaybe<Scalars['String']>;
  token_starts_with_nocase?: InputMaybe<Scalars['String']>;
  token_not_starts_with?: InputMaybe<Scalars['String']>;
  token_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  token_ends_with?: InputMaybe<Scalars['String']>;
  token_ends_with_nocase?: InputMaybe<Scalars['String']>;
  token_not_ends_with?: InputMaybe<Scalars['String']>;
  token_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  token_?: InputMaybe<Token_filter>;
  tokenAddress?: InputMaybe<Scalars['Bytes']>;
  tokenAddress_not?: InputMaybe<Scalars['Bytes']>;
  tokenAddress_gt?: InputMaybe<Scalars['Bytes']>;
  tokenAddress_lt?: InputMaybe<Scalars['Bytes']>;
  tokenAddress_gte?: InputMaybe<Scalars['Bytes']>;
  tokenAddress_lte?: InputMaybe<Scalars['Bytes']>;
  tokenAddress_in?: InputMaybe<Array<Scalars['Bytes']>>;
  tokenAddress_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  tokenAddress_contains?: InputMaybe<Scalars['Bytes']>;
  tokenAddress_not_contains?: InputMaybe<Scalars['Bytes']>;
  name?: InputMaybe<Scalars['String']>;
  name_not?: InputMaybe<Scalars['String']>;
  name_gt?: InputMaybe<Scalars['String']>;
  name_lt?: InputMaybe<Scalars['String']>;
  name_gte?: InputMaybe<Scalars['String']>;
  name_lte?: InputMaybe<Scalars['String']>;
  name_in?: InputMaybe<Array<Scalars['String']>>;
  name_not_in?: InputMaybe<Array<Scalars['String']>>;
  name_contains?: InputMaybe<Scalars['String']>;
  name_contains_nocase?: InputMaybe<Scalars['String']>;
  name_not_contains?: InputMaybe<Scalars['String']>;
  name_not_contains_nocase?: InputMaybe<Scalars['String']>;
  name_starts_with?: InputMaybe<Scalars['String']>;
  name_starts_with_nocase?: InputMaybe<Scalars['String']>;
  name_not_starts_with?: InputMaybe<Scalars['String']>;
  name_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  name_ends_with?: InputMaybe<Scalars['String']>;
  name_ends_with_nocase?: InputMaybe<Scalars['String']>;
  name_not_ends_with?: InputMaybe<Scalars['String']>;
  name_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  symbol?: InputMaybe<Scalars['String']>;
  symbol_not?: InputMaybe<Scalars['String']>;
  symbol_gt?: InputMaybe<Scalars['String']>;
  symbol_lt?: InputMaybe<Scalars['String']>;
  symbol_gte?: InputMaybe<Scalars['String']>;
  symbol_lte?: InputMaybe<Scalars['String']>;
  symbol_in?: InputMaybe<Array<Scalars['String']>>;
  symbol_not_in?: InputMaybe<Array<Scalars['String']>>;
  symbol_contains?: InputMaybe<Scalars['String']>;
  symbol_contains_nocase?: InputMaybe<Scalars['String']>;
  symbol_not_contains?: InputMaybe<Scalars['String']>;
  symbol_not_contains_nocase?: InputMaybe<Scalars['String']>;
  symbol_starts_with?: InputMaybe<Scalars['String']>;
  symbol_starts_with_nocase?: InputMaybe<Scalars['String']>;
  symbol_not_starts_with?: InputMaybe<Scalars['String']>;
  symbol_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  symbol_ends_with?: InputMaybe<Scalars['String']>;
  symbol_ends_with_nocase?: InputMaybe<Scalars['String']>;
  symbol_not_ends_with?: InputMaybe<Scalars['String']>;
  symbol_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  allowedDexes?: InputMaybe<Array<DEX>>;
  allowedDexes_not?: InputMaybe<Array<DEX>>;
  allowedDexes_contains?: InputMaybe<Array<DEX>>;
  allowedDexes_contains_nocase?: InputMaybe<Array<DEX>>;
  allowedDexes_not_contains?: InputMaybe<Array<DEX>>;
  allowedDexes_not_contains_nocase?: InputMaybe<Array<DEX>>;
  allowSell?: InputMaybe<Scalars['Boolean']>;
  allowSell_not?: InputMaybe<Scalars['Boolean']>;
  allowSell_in?: InputMaybe<Array<Scalars['Boolean']>>;
  allowSell_not_in?: InputMaybe<Array<Scalars['Boolean']>>;
  allowedTradeTypes?: InputMaybe<Array<TradeType>>;
  allowedTradeTypes_not?: InputMaybe<Array<TradeType>>;
  allowedTradeTypes_contains?: InputMaybe<Array<TradeType>>;
  allowedTradeTypes_contains_nocase?: InputMaybe<Array<TradeType>>;
  allowedTradeTypes_not_contains?: InputMaybe<Array<TradeType>>;
  allowedTradeTypes_not_contains_nocase?: InputMaybe<Array<TradeType>>;
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
  | 'token__vaultAddress'
  | 'token__tokenAddress'
  | 'tokenAddress'
  | 'name'
  | 'symbol'
  | 'allowedDexes'
  | 'allowSell'
  | 'allowedTradeTypes';

export type Vault = {
  /** ID is the address of the vault */
  id: Scalars['ID'];
  firstUpdateBlockNumber: Scalars['BigInt'];
  firstUpdateTimestamp: Scalars['Int'];
  firstUpdateTransactionHash: Scalars['Bytes'];
  lastUpdateBlockNumber: Scalars['BigInt'];
  lastUpdateTimestamp: Scalars['Int'];
  lastUpdateTransactionHash: Scalars['Bytes'];
  isWhitelisted: Scalars['Boolean'];
  /** Token that the vault borrows in */
  asset: Token;
  /** Token that the vault yields */
  yieldToken: Token;
  /** Token that represents the vault */
  vaultToken: Token;
  /** Fee rate of the vault */
  feeRate: Scalars['BigInt'];
  /** Strategy type of the vault */
  strategyType: Scalars['String'];
  withdrawRequestManagers: Array<WithdrawRequestManager>;
  withdrawRequests?: Maybe<Array<WithdrawRequest>>;
  markets?: Maybe<Array<Market>>;
};


export type VaultwithdrawRequestManagersArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<WithdrawRequestManager_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<WithdrawRequestManager_filter>;
};


export type VaultwithdrawRequestsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<WithdrawRequest_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<WithdrawRequest_filter>;
};


export type VaultmarketsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Market_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<Market_filter>;
};

export type Vault_filter = {
  id?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  firstUpdateBlockNumber?: InputMaybe<Scalars['BigInt']>;
  firstUpdateBlockNumber_not?: InputMaybe<Scalars['BigInt']>;
  firstUpdateBlockNumber_gt?: InputMaybe<Scalars['BigInt']>;
  firstUpdateBlockNumber_lt?: InputMaybe<Scalars['BigInt']>;
  firstUpdateBlockNumber_gte?: InputMaybe<Scalars['BigInt']>;
  firstUpdateBlockNumber_lte?: InputMaybe<Scalars['BigInt']>;
  firstUpdateBlockNumber_in?: InputMaybe<Array<Scalars['BigInt']>>;
  firstUpdateBlockNumber_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  firstUpdateTimestamp?: InputMaybe<Scalars['Int']>;
  firstUpdateTimestamp_not?: InputMaybe<Scalars['Int']>;
  firstUpdateTimestamp_gt?: InputMaybe<Scalars['Int']>;
  firstUpdateTimestamp_lt?: InputMaybe<Scalars['Int']>;
  firstUpdateTimestamp_gte?: InputMaybe<Scalars['Int']>;
  firstUpdateTimestamp_lte?: InputMaybe<Scalars['Int']>;
  firstUpdateTimestamp_in?: InputMaybe<Array<Scalars['Int']>>;
  firstUpdateTimestamp_not_in?: InputMaybe<Array<Scalars['Int']>>;
  firstUpdateTransactionHash?: InputMaybe<Scalars['Bytes']>;
  firstUpdateTransactionHash_not?: InputMaybe<Scalars['Bytes']>;
  firstUpdateTransactionHash_gt?: InputMaybe<Scalars['Bytes']>;
  firstUpdateTransactionHash_lt?: InputMaybe<Scalars['Bytes']>;
  firstUpdateTransactionHash_gte?: InputMaybe<Scalars['Bytes']>;
  firstUpdateTransactionHash_lte?: InputMaybe<Scalars['Bytes']>;
  firstUpdateTransactionHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
  firstUpdateTransactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  firstUpdateTransactionHash_contains?: InputMaybe<Scalars['Bytes']>;
  firstUpdateTransactionHash_not_contains?: InputMaybe<Scalars['Bytes']>;
  lastUpdateBlockNumber?: InputMaybe<Scalars['BigInt']>;
  lastUpdateBlockNumber_not?: InputMaybe<Scalars['BigInt']>;
  lastUpdateBlockNumber_gt?: InputMaybe<Scalars['BigInt']>;
  lastUpdateBlockNumber_lt?: InputMaybe<Scalars['BigInt']>;
  lastUpdateBlockNumber_gte?: InputMaybe<Scalars['BigInt']>;
  lastUpdateBlockNumber_lte?: InputMaybe<Scalars['BigInt']>;
  lastUpdateBlockNumber_in?: InputMaybe<Array<Scalars['BigInt']>>;
  lastUpdateBlockNumber_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  lastUpdateTimestamp?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_not?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_gt?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_lt?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_gte?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_lte?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_in?: InputMaybe<Array<Scalars['Int']>>;
  lastUpdateTimestamp_not_in?: InputMaybe<Array<Scalars['Int']>>;
  lastUpdateTransactionHash?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_not?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_gt?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_lt?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_gte?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_lte?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
  lastUpdateTransactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  lastUpdateTransactionHash_contains?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_not_contains?: InputMaybe<Scalars['Bytes']>;
  isWhitelisted?: InputMaybe<Scalars['Boolean']>;
  isWhitelisted_not?: InputMaybe<Scalars['Boolean']>;
  isWhitelisted_in?: InputMaybe<Array<Scalars['Boolean']>>;
  isWhitelisted_not_in?: InputMaybe<Array<Scalars['Boolean']>>;
  asset?: InputMaybe<Scalars['String']>;
  asset_not?: InputMaybe<Scalars['String']>;
  asset_gt?: InputMaybe<Scalars['String']>;
  asset_lt?: InputMaybe<Scalars['String']>;
  asset_gte?: InputMaybe<Scalars['String']>;
  asset_lte?: InputMaybe<Scalars['String']>;
  asset_in?: InputMaybe<Array<Scalars['String']>>;
  asset_not_in?: InputMaybe<Array<Scalars['String']>>;
  asset_contains?: InputMaybe<Scalars['String']>;
  asset_contains_nocase?: InputMaybe<Scalars['String']>;
  asset_not_contains?: InputMaybe<Scalars['String']>;
  asset_not_contains_nocase?: InputMaybe<Scalars['String']>;
  asset_starts_with?: InputMaybe<Scalars['String']>;
  asset_starts_with_nocase?: InputMaybe<Scalars['String']>;
  asset_not_starts_with?: InputMaybe<Scalars['String']>;
  asset_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  asset_ends_with?: InputMaybe<Scalars['String']>;
  asset_ends_with_nocase?: InputMaybe<Scalars['String']>;
  asset_not_ends_with?: InputMaybe<Scalars['String']>;
  asset_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  asset_?: InputMaybe<Token_filter>;
  yieldToken?: InputMaybe<Scalars['String']>;
  yieldToken_not?: InputMaybe<Scalars['String']>;
  yieldToken_gt?: InputMaybe<Scalars['String']>;
  yieldToken_lt?: InputMaybe<Scalars['String']>;
  yieldToken_gte?: InputMaybe<Scalars['String']>;
  yieldToken_lte?: InputMaybe<Scalars['String']>;
  yieldToken_in?: InputMaybe<Array<Scalars['String']>>;
  yieldToken_not_in?: InputMaybe<Array<Scalars['String']>>;
  yieldToken_contains?: InputMaybe<Scalars['String']>;
  yieldToken_contains_nocase?: InputMaybe<Scalars['String']>;
  yieldToken_not_contains?: InputMaybe<Scalars['String']>;
  yieldToken_not_contains_nocase?: InputMaybe<Scalars['String']>;
  yieldToken_starts_with?: InputMaybe<Scalars['String']>;
  yieldToken_starts_with_nocase?: InputMaybe<Scalars['String']>;
  yieldToken_not_starts_with?: InputMaybe<Scalars['String']>;
  yieldToken_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  yieldToken_ends_with?: InputMaybe<Scalars['String']>;
  yieldToken_ends_with_nocase?: InputMaybe<Scalars['String']>;
  yieldToken_not_ends_with?: InputMaybe<Scalars['String']>;
  yieldToken_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  yieldToken_?: InputMaybe<Token_filter>;
  vaultToken?: InputMaybe<Scalars['String']>;
  vaultToken_not?: InputMaybe<Scalars['String']>;
  vaultToken_gt?: InputMaybe<Scalars['String']>;
  vaultToken_lt?: InputMaybe<Scalars['String']>;
  vaultToken_gte?: InputMaybe<Scalars['String']>;
  vaultToken_lte?: InputMaybe<Scalars['String']>;
  vaultToken_in?: InputMaybe<Array<Scalars['String']>>;
  vaultToken_not_in?: InputMaybe<Array<Scalars['String']>>;
  vaultToken_contains?: InputMaybe<Scalars['String']>;
  vaultToken_contains_nocase?: InputMaybe<Scalars['String']>;
  vaultToken_not_contains?: InputMaybe<Scalars['String']>;
  vaultToken_not_contains_nocase?: InputMaybe<Scalars['String']>;
  vaultToken_starts_with?: InputMaybe<Scalars['String']>;
  vaultToken_starts_with_nocase?: InputMaybe<Scalars['String']>;
  vaultToken_not_starts_with?: InputMaybe<Scalars['String']>;
  vaultToken_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  vaultToken_ends_with?: InputMaybe<Scalars['String']>;
  vaultToken_ends_with_nocase?: InputMaybe<Scalars['String']>;
  vaultToken_not_ends_with?: InputMaybe<Scalars['String']>;
  vaultToken_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  vaultToken_?: InputMaybe<Token_filter>;
  feeRate?: InputMaybe<Scalars['BigInt']>;
  feeRate_not?: InputMaybe<Scalars['BigInt']>;
  feeRate_gt?: InputMaybe<Scalars['BigInt']>;
  feeRate_lt?: InputMaybe<Scalars['BigInt']>;
  feeRate_gte?: InputMaybe<Scalars['BigInt']>;
  feeRate_lte?: InputMaybe<Scalars['BigInt']>;
  feeRate_in?: InputMaybe<Array<Scalars['BigInt']>>;
  feeRate_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  strategyType?: InputMaybe<Scalars['String']>;
  strategyType_not?: InputMaybe<Scalars['String']>;
  strategyType_gt?: InputMaybe<Scalars['String']>;
  strategyType_lt?: InputMaybe<Scalars['String']>;
  strategyType_gte?: InputMaybe<Scalars['String']>;
  strategyType_lte?: InputMaybe<Scalars['String']>;
  strategyType_in?: InputMaybe<Array<Scalars['String']>>;
  strategyType_not_in?: InputMaybe<Array<Scalars['String']>>;
  strategyType_contains?: InputMaybe<Scalars['String']>;
  strategyType_contains_nocase?: InputMaybe<Scalars['String']>;
  strategyType_not_contains?: InputMaybe<Scalars['String']>;
  strategyType_not_contains_nocase?: InputMaybe<Scalars['String']>;
  strategyType_starts_with?: InputMaybe<Scalars['String']>;
  strategyType_starts_with_nocase?: InputMaybe<Scalars['String']>;
  strategyType_not_starts_with?: InputMaybe<Scalars['String']>;
  strategyType_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  strategyType_ends_with?: InputMaybe<Scalars['String']>;
  strategyType_ends_with_nocase?: InputMaybe<Scalars['String']>;
  strategyType_not_ends_with?: InputMaybe<Scalars['String']>;
  strategyType_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  withdrawRequestManagers?: InputMaybe<Array<Scalars['String']>>;
  withdrawRequestManagers_not?: InputMaybe<Array<Scalars['String']>>;
  withdrawRequestManagers_contains?: InputMaybe<Array<Scalars['String']>>;
  withdrawRequestManagers_contains_nocase?: InputMaybe<Array<Scalars['String']>>;
  withdrawRequestManagers_not_contains?: InputMaybe<Array<Scalars['String']>>;
  withdrawRequestManagers_not_contains_nocase?: InputMaybe<Array<Scalars['String']>>;
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
  | 'asset__vaultAddress'
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
  | 'yieldToken__vaultAddress'
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
  | 'vaultToken__vaultAddress'
  | 'vaultToken__tokenAddress'
  | 'feeRate'
  | 'strategyType'
  | 'withdrawRequestManagers'
  | 'withdrawRequests'
  | 'markets';

export type WithdrawRequest = {
  /** Withdraw Request Manager:Vault:Account */
  id: Scalars['ID'];
  lastUpdateBlockNumber: Scalars['BigInt'];
  lastUpdateTimestamp: Scalars['Int'];
  lastUpdateTransactionHash: Scalars['Bytes'];
  /** Link to the withdraw request manager */
  withdrawRequestManager: WithdrawRequestManager;
  /** Link to the account that requested the withdraw */
  account: Account;
  /** Link to the vault that the withdraw request is for */
  vault: Vault;
  /** Link to the vault share balance that the withdraw request is for */
  balance: Balance;
  /** Request identifier for the withdraw request */
  requestId: Scalars['BigInt'];
  /** Amount of yield tokens requested */
  yieldTokenAmount: Scalars['BigInt'];
  /** Amount of vault shares requested */
  sharesAmount: Scalars['BigInt'];
  /** Link to a tokenized withdraw request, if it exists */
  tokenizedWithdrawRequest?: Maybe<TokenizedWithdrawRequest>;
};

export type WithdrawRequestManager = {
  id: Scalars['ID'];
  firstUpdateBlockNumber: Scalars['BigInt'];
  firstUpdateTimestamp: Scalars['Int'];
  firstUpdateTransactionHash: Scalars['Bytes'];
  lastUpdateBlockNumber: Scalars['BigInt'];
  lastUpdateTimestamp: Scalars['Int'];
  lastUpdateTransactionHash: Scalars['Bytes'];
  yieldToken: Token;
  withdrawToken: Token;
  stakingToken: Token;
  approvedVaults?: Maybe<Array<Vault>>;
  withdrawRequests?: Maybe<Array<WithdrawRequest>>;
  tokenizedWithdrawRequests?: Maybe<Array<TokenizedWithdrawRequest>>;
};


export type WithdrawRequestManagerapprovedVaultsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Vault_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<Vault_filter>;
};


export type WithdrawRequestManagerwithdrawRequestsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<WithdrawRequest_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<WithdrawRequest_filter>;
};


export type WithdrawRequestManagertokenizedWithdrawRequestsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<TokenizedWithdrawRequest_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<TokenizedWithdrawRequest_filter>;
};

export type WithdrawRequestManager_filter = {
  id?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  firstUpdateBlockNumber?: InputMaybe<Scalars['BigInt']>;
  firstUpdateBlockNumber_not?: InputMaybe<Scalars['BigInt']>;
  firstUpdateBlockNumber_gt?: InputMaybe<Scalars['BigInt']>;
  firstUpdateBlockNumber_lt?: InputMaybe<Scalars['BigInt']>;
  firstUpdateBlockNumber_gte?: InputMaybe<Scalars['BigInt']>;
  firstUpdateBlockNumber_lte?: InputMaybe<Scalars['BigInt']>;
  firstUpdateBlockNumber_in?: InputMaybe<Array<Scalars['BigInt']>>;
  firstUpdateBlockNumber_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  firstUpdateTimestamp?: InputMaybe<Scalars['Int']>;
  firstUpdateTimestamp_not?: InputMaybe<Scalars['Int']>;
  firstUpdateTimestamp_gt?: InputMaybe<Scalars['Int']>;
  firstUpdateTimestamp_lt?: InputMaybe<Scalars['Int']>;
  firstUpdateTimestamp_gte?: InputMaybe<Scalars['Int']>;
  firstUpdateTimestamp_lte?: InputMaybe<Scalars['Int']>;
  firstUpdateTimestamp_in?: InputMaybe<Array<Scalars['Int']>>;
  firstUpdateTimestamp_not_in?: InputMaybe<Array<Scalars['Int']>>;
  firstUpdateTransactionHash?: InputMaybe<Scalars['Bytes']>;
  firstUpdateTransactionHash_not?: InputMaybe<Scalars['Bytes']>;
  firstUpdateTransactionHash_gt?: InputMaybe<Scalars['Bytes']>;
  firstUpdateTransactionHash_lt?: InputMaybe<Scalars['Bytes']>;
  firstUpdateTransactionHash_gte?: InputMaybe<Scalars['Bytes']>;
  firstUpdateTransactionHash_lte?: InputMaybe<Scalars['Bytes']>;
  firstUpdateTransactionHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
  firstUpdateTransactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  firstUpdateTransactionHash_contains?: InputMaybe<Scalars['Bytes']>;
  firstUpdateTransactionHash_not_contains?: InputMaybe<Scalars['Bytes']>;
  lastUpdateBlockNumber?: InputMaybe<Scalars['BigInt']>;
  lastUpdateBlockNumber_not?: InputMaybe<Scalars['BigInt']>;
  lastUpdateBlockNumber_gt?: InputMaybe<Scalars['BigInt']>;
  lastUpdateBlockNumber_lt?: InputMaybe<Scalars['BigInt']>;
  lastUpdateBlockNumber_gte?: InputMaybe<Scalars['BigInt']>;
  lastUpdateBlockNumber_lte?: InputMaybe<Scalars['BigInt']>;
  lastUpdateBlockNumber_in?: InputMaybe<Array<Scalars['BigInt']>>;
  lastUpdateBlockNumber_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  lastUpdateTimestamp?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_not?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_gt?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_lt?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_gte?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_lte?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_in?: InputMaybe<Array<Scalars['Int']>>;
  lastUpdateTimestamp_not_in?: InputMaybe<Array<Scalars['Int']>>;
  lastUpdateTransactionHash?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_not?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_gt?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_lt?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_gte?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_lte?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
  lastUpdateTransactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  lastUpdateTransactionHash_contains?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_not_contains?: InputMaybe<Scalars['Bytes']>;
  yieldToken?: InputMaybe<Scalars['String']>;
  yieldToken_not?: InputMaybe<Scalars['String']>;
  yieldToken_gt?: InputMaybe<Scalars['String']>;
  yieldToken_lt?: InputMaybe<Scalars['String']>;
  yieldToken_gte?: InputMaybe<Scalars['String']>;
  yieldToken_lte?: InputMaybe<Scalars['String']>;
  yieldToken_in?: InputMaybe<Array<Scalars['String']>>;
  yieldToken_not_in?: InputMaybe<Array<Scalars['String']>>;
  yieldToken_contains?: InputMaybe<Scalars['String']>;
  yieldToken_contains_nocase?: InputMaybe<Scalars['String']>;
  yieldToken_not_contains?: InputMaybe<Scalars['String']>;
  yieldToken_not_contains_nocase?: InputMaybe<Scalars['String']>;
  yieldToken_starts_with?: InputMaybe<Scalars['String']>;
  yieldToken_starts_with_nocase?: InputMaybe<Scalars['String']>;
  yieldToken_not_starts_with?: InputMaybe<Scalars['String']>;
  yieldToken_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  yieldToken_ends_with?: InputMaybe<Scalars['String']>;
  yieldToken_ends_with_nocase?: InputMaybe<Scalars['String']>;
  yieldToken_not_ends_with?: InputMaybe<Scalars['String']>;
  yieldToken_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  yieldToken_?: InputMaybe<Token_filter>;
  withdrawToken?: InputMaybe<Scalars['String']>;
  withdrawToken_not?: InputMaybe<Scalars['String']>;
  withdrawToken_gt?: InputMaybe<Scalars['String']>;
  withdrawToken_lt?: InputMaybe<Scalars['String']>;
  withdrawToken_gte?: InputMaybe<Scalars['String']>;
  withdrawToken_lte?: InputMaybe<Scalars['String']>;
  withdrawToken_in?: InputMaybe<Array<Scalars['String']>>;
  withdrawToken_not_in?: InputMaybe<Array<Scalars['String']>>;
  withdrawToken_contains?: InputMaybe<Scalars['String']>;
  withdrawToken_contains_nocase?: InputMaybe<Scalars['String']>;
  withdrawToken_not_contains?: InputMaybe<Scalars['String']>;
  withdrawToken_not_contains_nocase?: InputMaybe<Scalars['String']>;
  withdrawToken_starts_with?: InputMaybe<Scalars['String']>;
  withdrawToken_starts_with_nocase?: InputMaybe<Scalars['String']>;
  withdrawToken_not_starts_with?: InputMaybe<Scalars['String']>;
  withdrawToken_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  withdrawToken_ends_with?: InputMaybe<Scalars['String']>;
  withdrawToken_ends_with_nocase?: InputMaybe<Scalars['String']>;
  withdrawToken_not_ends_with?: InputMaybe<Scalars['String']>;
  withdrawToken_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  withdrawToken_?: InputMaybe<Token_filter>;
  stakingToken?: InputMaybe<Scalars['String']>;
  stakingToken_not?: InputMaybe<Scalars['String']>;
  stakingToken_gt?: InputMaybe<Scalars['String']>;
  stakingToken_lt?: InputMaybe<Scalars['String']>;
  stakingToken_gte?: InputMaybe<Scalars['String']>;
  stakingToken_lte?: InputMaybe<Scalars['String']>;
  stakingToken_in?: InputMaybe<Array<Scalars['String']>>;
  stakingToken_not_in?: InputMaybe<Array<Scalars['String']>>;
  stakingToken_contains?: InputMaybe<Scalars['String']>;
  stakingToken_contains_nocase?: InputMaybe<Scalars['String']>;
  stakingToken_not_contains?: InputMaybe<Scalars['String']>;
  stakingToken_not_contains_nocase?: InputMaybe<Scalars['String']>;
  stakingToken_starts_with?: InputMaybe<Scalars['String']>;
  stakingToken_starts_with_nocase?: InputMaybe<Scalars['String']>;
  stakingToken_not_starts_with?: InputMaybe<Scalars['String']>;
  stakingToken_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  stakingToken_ends_with?: InputMaybe<Scalars['String']>;
  stakingToken_ends_with_nocase?: InputMaybe<Scalars['String']>;
  stakingToken_not_ends_with?: InputMaybe<Scalars['String']>;
  stakingToken_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
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
  | 'yieldToken__vaultAddress'
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
  | 'withdrawToken__vaultAddress'
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
  | 'stakingToken__vaultAddress'
  | 'stakingToken__tokenAddress'
  | 'approvedVaults'
  | 'withdrawRequests'
  | 'tokenizedWithdrawRequests';

export type WithdrawRequest_filter = {
  id?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  lastUpdateBlockNumber?: InputMaybe<Scalars['BigInt']>;
  lastUpdateBlockNumber_not?: InputMaybe<Scalars['BigInt']>;
  lastUpdateBlockNumber_gt?: InputMaybe<Scalars['BigInt']>;
  lastUpdateBlockNumber_lt?: InputMaybe<Scalars['BigInt']>;
  lastUpdateBlockNumber_gte?: InputMaybe<Scalars['BigInt']>;
  lastUpdateBlockNumber_lte?: InputMaybe<Scalars['BigInt']>;
  lastUpdateBlockNumber_in?: InputMaybe<Array<Scalars['BigInt']>>;
  lastUpdateBlockNumber_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  lastUpdateTimestamp?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_not?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_gt?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_lt?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_gte?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_lte?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_in?: InputMaybe<Array<Scalars['Int']>>;
  lastUpdateTimestamp_not_in?: InputMaybe<Array<Scalars['Int']>>;
  lastUpdateTransactionHash?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_not?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_gt?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_lt?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_gte?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_lte?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
  lastUpdateTransactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  lastUpdateTransactionHash_contains?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_not_contains?: InputMaybe<Scalars['Bytes']>;
  withdrawRequestManager?: InputMaybe<Scalars['String']>;
  withdrawRequestManager_not?: InputMaybe<Scalars['String']>;
  withdrawRequestManager_gt?: InputMaybe<Scalars['String']>;
  withdrawRequestManager_lt?: InputMaybe<Scalars['String']>;
  withdrawRequestManager_gte?: InputMaybe<Scalars['String']>;
  withdrawRequestManager_lte?: InputMaybe<Scalars['String']>;
  withdrawRequestManager_in?: InputMaybe<Array<Scalars['String']>>;
  withdrawRequestManager_not_in?: InputMaybe<Array<Scalars['String']>>;
  withdrawRequestManager_contains?: InputMaybe<Scalars['String']>;
  withdrawRequestManager_contains_nocase?: InputMaybe<Scalars['String']>;
  withdrawRequestManager_not_contains?: InputMaybe<Scalars['String']>;
  withdrawRequestManager_not_contains_nocase?: InputMaybe<Scalars['String']>;
  withdrawRequestManager_starts_with?: InputMaybe<Scalars['String']>;
  withdrawRequestManager_starts_with_nocase?: InputMaybe<Scalars['String']>;
  withdrawRequestManager_not_starts_with?: InputMaybe<Scalars['String']>;
  withdrawRequestManager_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  withdrawRequestManager_ends_with?: InputMaybe<Scalars['String']>;
  withdrawRequestManager_ends_with_nocase?: InputMaybe<Scalars['String']>;
  withdrawRequestManager_not_ends_with?: InputMaybe<Scalars['String']>;
  withdrawRequestManager_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  withdrawRequestManager_?: InputMaybe<WithdrawRequestManager_filter>;
  account?: InputMaybe<Scalars['String']>;
  account_not?: InputMaybe<Scalars['String']>;
  account_gt?: InputMaybe<Scalars['String']>;
  account_lt?: InputMaybe<Scalars['String']>;
  account_gte?: InputMaybe<Scalars['String']>;
  account_lte?: InputMaybe<Scalars['String']>;
  account_in?: InputMaybe<Array<Scalars['String']>>;
  account_not_in?: InputMaybe<Array<Scalars['String']>>;
  account_contains?: InputMaybe<Scalars['String']>;
  account_contains_nocase?: InputMaybe<Scalars['String']>;
  account_not_contains?: InputMaybe<Scalars['String']>;
  account_not_contains_nocase?: InputMaybe<Scalars['String']>;
  account_starts_with?: InputMaybe<Scalars['String']>;
  account_starts_with_nocase?: InputMaybe<Scalars['String']>;
  account_not_starts_with?: InputMaybe<Scalars['String']>;
  account_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  account_ends_with?: InputMaybe<Scalars['String']>;
  account_ends_with_nocase?: InputMaybe<Scalars['String']>;
  account_not_ends_with?: InputMaybe<Scalars['String']>;
  account_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  account_?: InputMaybe<Account_filter>;
  vault?: InputMaybe<Scalars['String']>;
  vault_not?: InputMaybe<Scalars['String']>;
  vault_gt?: InputMaybe<Scalars['String']>;
  vault_lt?: InputMaybe<Scalars['String']>;
  vault_gte?: InputMaybe<Scalars['String']>;
  vault_lte?: InputMaybe<Scalars['String']>;
  vault_in?: InputMaybe<Array<Scalars['String']>>;
  vault_not_in?: InputMaybe<Array<Scalars['String']>>;
  vault_contains?: InputMaybe<Scalars['String']>;
  vault_contains_nocase?: InputMaybe<Scalars['String']>;
  vault_not_contains?: InputMaybe<Scalars['String']>;
  vault_not_contains_nocase?: InputMaybe<Scalars['String']>;
  vault_starts_with?: InputMaybe<Scalars['String']>;
  vault_starts_with_nocase?: InputMaybe<Scalars['String']>;
  vault_not_starts_with?: InputMaybe<Scalars['String']>;
  vault_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  vault_ends_with?: InputMaybe<Scalars['String']>;
  vault_ends_with_nocase?: InputMaybe<Scalars['String']>;
  vault_not_ends_with?: InputMaybe<Scalars['String']>;
  vault_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  vault_?: InputMaybe<Vault_filter>;
  balance?: InputMaybe<Scalars['String']>;
  balance_not?: InputMaybe<Scalars['String']>;
  balance_gt?: InputMaybe<Scalars['String']>;
  balance_lt?: InputMaybe<Scalars['String']>;
  balance_gte?: InputMaybe<Scalars['String']>;
  balance_lte?: InputMaybe<Scalars['String']>;
  balance_in?: InputMaybe<Array<Scalars['String']>>;
  balance_not_in?: InputMaybe<Array<Scalars['String']>>;
  balance_contains?: InputMaybe<Scalars['String']>;
  balance_contains_nocase?: InputMaybe<Scalars['String']>;
  balance_not_contains?: InputMaybe<Scalars['String']>;
  balance_not_contains_nocase?: InputMaybe<Scalars['String']>;
  balance_starts_with?: InputMaybe<Scalars['String']>;
  balance_starts_with_nocase?: InputMaybe<Scalars['String']>;
  balance_not_starts_with?: InputMaybe<Scalars['String']>;
  balance_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  balance_ends_with?: InputMaybe<Scalars['String']>;
  balance_ends_with_nocase?: InputMaybe<Scalars['String']>;
  balance_not_ends_with?: InputMaybe<Scalars['String']>;
  balance_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  balance_?: InputMaybe<Balance_filter>;
  requestId?: InputMaybe<Scalars['BigInt']>;
  requestId_not?: InputMaybe<Scalars['BigInt']>;
  requestId_gt?: InputMaybe<Scalars['BigInt']>;
  requestId_lt?: InputMaybe<Scalars['BigInt']>;
  requestId_gte?: InputMaybe<Scalars['BigInt']>;
  requestId_lte?: InputMaybe<Scalars['BigInt']>;
  requestId_in?: InputMaybe<Array<Scalars['BigInt']>>;
  requestId_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  yieldTokenAmount?: InputMaybe<Scalars['BigInt']>;
  yieldTokenAmount_not?: InputMaybe<Scalars['BigInt']>;
  yieldTokenAmount_gt?: InputMaybe<Scalars['BigInt']>;
  yieldTokenAmount_lt?: InputMaybe<Scalars['BigInt']>;
  yieldTokenAmount_gte?: InputMaybe<Scalars['BigInt']>;
  yieldTokenAmount_lte?: InputMaybe<Scalars['BigInt']>;
  yieldTokenAmount_in?: InputMaybe<Array<Scalars['BigInt']>>;
  yieldTokenAmount_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  sharesAmount?: InputMaybe<Scalars['BigInt']>;
  sharesAmount_not?: InputMaybe<Scalars['BigInt']>;
  sharesAmount_gt?: InputMaybe<Scalars['BigInt']>;
  sharesAmount_lt?: InputMaybe<Scalars['BigInt']>;
  sharesAmount_gte?: InputMaybe<Scalars['BigInt']>;
  sharesAmount_lte?: InputMaybe<Scalars['BigInt']>;
  sharesAmount_in?: InputMaybe<Array<Scalars['BigInt']>>;
  sharesAmount_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  tokenizedWithdrawRequest?: InputMaybe<Scalars['String']>;
  tokenizedWithdrawRequest_not?: InputMaybe<Scalars['String']>;
  tokenizedWithdrawRequest_gt?: InputMaybe<Scalars['String']>;
  tokenizedWithdrawRequest_lt?: InputMaybe<Scalars['String']>;
  tokenizedWithdrawRequest_gte?: InputMaybe<Scalars['String']>;
  tokenizedWithdrawRequest_lte?: InputMaybe<Scalars['String']>;
  tokenizedWithdrawRequest_in?: InputMaybe<Array<Scalars['String']>>;
  tokenizedWithdrawRequest_not_in?: InputMaybe<Array<Scalars['String']>>;
  tokenizedWithdrawRequest_contains?: InputMaybe<Scalars['String']>;
  tokenizedWithdrawRequest_contains_nocase?: InputMaybe<Scalars['String']>;
  tokenizedWithdrawRequest_not_contains?: InputMaybe<Scalars['String']>;
  tokenizedWithdrawRequest_not_contains_nocase?: InputMaybe<Scalars['String']>;
  tokenizedWithdrawRequest_starts_with?: InputMaybe<Scalars['String']>;
  tokenizedWithdrawRequest_starts_with_nocase?: InputMaybe<Scalars['String']>;
  tokenizedWithdrawRequest_not_starts_with?: InputMaybe<Scalars['String']>;
  tokenizedWithdrawRequest_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  tokenizedWithdrawRequest_ends_with?: InputMaybe<Scalars['String']>;
  tokenizedWithdrawRequest_ends_with_nocase?: InputMaybe<Scalars['String']>;
  tokenizedWithdrawRequest_not_ends_with?: InputMaybe<Scalars['String']>;
  tokenizedWithdrawRequest_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
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
  hash?: Maybe<Scalars['Bytes']>;
  /** The block number */
  number: Scalars['Int'];
  /** Integer representation of the timestamp stored in blocks for the chain */
  timestamp?: Maybe<Scalars['Int']>;
  /** The hash of the parent block */
  parentHash?: Maybe<Scalars['Bytes']>;
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
  deployment: Scalars['String'];
  /** If `true`, the subgraph encountered indexing errors at some past block */
  hasIndexingErrors: Scalars['Boolean'];
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
