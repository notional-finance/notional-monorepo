// @ts-nocheck
import { GraphQLResolveInfo, SelectionSetNode, FieldNode, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
import { gql } from '@graphql-mesh/utils';

import type { GetMeshOptions } from '@graphql-mesh/runtime';
import type { YamlConfig } from '@graphql-mesh/types';
import { PubSub } from '@graphql-mesh/utils';
import { DefaultLogger } from '@graphql-mesh/utils';
import MeshCache from "@graphql-mesh/cache-localforage";
import { fetch as fetchFn } from '@whatwg-node/fetch';

import { MeshResolvedSource } from '@graphql-mesh/runtime';
import { MeshTransform, MeshPlugin } from '@graphql-mesh/types';
import GraphqlHandler from "@graphql-mesh/graphql"
import BareMerger from "@graphql-mesh/merger-bare";
import { printWithCache } from '@graphql-mesh/utils';
import { usePersistedOperations } from '@graphql-yoga/plugin-persisted-operations';
import { createMeshHTTPHandler, MeshHTTPHandler } from '@graphql-mesh/http';
import { getMesh, ExecuteMeshFn, SubscribeMeshFn, MeshContext as BaseMeshContext, MeshInstance } from '@graphql-mesh/runtime';
import { MeshStore, FsStoreStorageAdapter } from '@graphql-mesh/store';
import { path as pathModule } from '@graphql-mesh/cross-helpers';
import { ImportFn } from '@graphql-mesh/types';
import type { NotionalExponentTypes } from './sources/NotionalExponent/types';
import * as importedModule$0 from "./sources/NotionalExponent/introspectionSchema";
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };



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
  | 'TradeExecution'
  | 'EnterPositionWithYieldToken';

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

export type WithIndex<TObject> = TObject & Record<string, any>;
export type ResolversObject<TObject> = WithIndex<TObject>;

export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};

export type LegacyStitchingResolver<TResult, TParent, TContext, TArgs> = {
  fragment: string;
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};

export type NewStitchingResolver<TResult, TParent, TContext, TArgs> = {
  selectionSet: string | ((fieldNode: FieldNode) => SelectionSetNode);
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type StitchingResolver<TResult, TParent, TContext, TArgs> = LegacyStitchingResolver<TResult, TParent, TContext, TArgs> | NewStitchingResolver<TResult, TParent, TContext, TArgs>;
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> =
  | ResolverFn<TResult, TParent, TContext, TArgs>
  | ResolverWithResolve<TResult, TParent, TContext, TArgs>
  | StitchingResolver<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;



/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = ResolversObject<{
  Account: ResolverTypeWrapper<Account>;
  Account_filter: Account_filter;
  Account_orderBy: Account_orderBy;
  Aggregation_current: Aggregation_current;
  Aggregation_interval: Aggregation_interval;
  Balance: ResolverTypeWrapper<Balance>;
  BalanceSnapshot: ResolverTypeWrapper<BalanceSnapshot>;
  BalanceSnapshot_filter: BalanceSnapshot_filter;
  BalanceSnapshot_orderBy: BalanceSnapshot_orderBy;
  Balance_filter: Balance_filter;
  Balance_orderBy: Balance_orderBy;
  BigDecimal: ResolverTypeWrapper<Scalars['BigDecimal']['output']>;
  BigInt: ResolverTypeWrapper<Scalars['BigInt']['output']>;
  BlockChangedFilter: BlockChangedFilter;
  Block_height: Block_height;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  Bytes: ResolverTypeWrapper<Scalars['Bytes']['output']>;
  DEX: DEX;
  ExchangeRate: ResolverTypeWrapper<ExchangeRate>;
  ExchangeRate_filter: ExchangeRate_filter;
  ExchangeRate_orderBy: ExchangeRate_orderBy;
  Float: ResolverTypeWrapper<Scalars['Float']['output']>;
  ID: ResolverTypeWrapper<Scalars['ID']['output']>;
  IncentiveSnapshot: ResolverTypeWrapper<IncentiveSnapshot>;
  IncentiveSnapshot_filter: IncentiveSnapshot_filter;
  IncentiveSnapshot_orderBy: IncentiveSnapshot_orderBy;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  Int8: ResolverTypeWrapper<Scalars['Int8']['output']>;
  LendingRouter: ResolverTypeWrapper<LendingRouter>;
  LendingRouter_filter: LendingRouter_filter;
  LendingRouter_orderBy: LendingRouter_orderBy;
  LineItemType: LineItemType;
  Market: ResolverTypeWrapper<Market>;
  Market_filter: Market_filter;
  Market_orderBy: Market_orderBy;
  Oracle: ResolverTypeWrapper<Oracle>;
  OracleRegistry: ResolverTypeWrapper<OracleRegistry>;
  OracleRegistry_filter: OracleRegistry_filter;
  OracleRegistry_orderBy: OracleRegistry_orderBy;
  OracleType: OracleType;
  Oracle_filter: Oracle_filter;
  Oracle_orderBy: Oracle_orderBy;
  OrderDirection: OrderDirection;
  ProfitLossLineItem: ResolverTypeWrapper<ProfitLossLineItem>;
  ProfitLossLineItem_filter: ProfitLossLineItem_filter;
  ProfitLossLineItem_orderBy: ProfitLossLineItem_orderBy;
  Query: ResolverTypeWrapper<{}>;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  SystemAccount: SystemAccount;
  Timestamp: ResolverTypeWrapper<Scalars['Timestamp']['output']>;
  Token: ResolverTypeWrapper<Token>;
  TokenInterface: TokenInterface;
  TokenType: TokenType;
  Token_filter: Token_filter;
  Token_orderBy: Token_orderBy;
  TokenizedWithdrawRequest: ResolverTypeWrapper<TokenizedWithdrawRequest>;
  TokenizedWithdrawRequest_filter: TokenizedWithdrawRequest_filter;
  TokenizedWithdrawRequest_orderBy: TokenizedWithdrawRequest_orderBy;
  TradeType: TradeType;
  TradingModulePermission: ResolverTypeWrapper<TradingModulePermission>;
  TradingModulePermission_filter: TradingModulePermission_filter;
  TradingModulePermission_orderBy: TradingModulePermission_orderBy;
  Vault: ResolverTypeWrapper<Vault>;
  Vault_filter: Vault_filter;
  Vault_orderBy: Vault_orderBy;
  WithdrawRequest: ResolverTypeWrapper<WithdrawRequest>;
  WithdrawRequestManager: ResolverTypeWrapper<WithdrawRequestManager>;
  WithdrawRequestManager_filter: WithdrawRequestManager_filter;
  WithdrawRequestManager_orderBy: WithdrawRequestManager_orderBy;
  WithdrawRequest_filter: WithdrawRequest_filter;
  WithdrawRequest_orderBy: WithdrawRequest_orderBy;
  _Block_: ResolverTypeWrapper<_Block_>;
  _Meta_: ResolverTypeWrapper<_Meta_>;
  _SubgraphErrorPolicy_: _SubgraphErrorPolicy_;
}>;

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = ResolversObject<{
  Account: Account;
  Account_filter: Account_filter;
  Balance: Balance;
  BalanceSnapshot: BalanceSnapshot;
  BalanceSnapshot_filter: BalanceSnapshot_filter;
  Balance_filter: Balance_filter;
  BigDecimal: Scalars['BigDecimal']['output'];
  BigInt: Scalars['BigInt']['output'];
  BlockChangedFilter: BlockChangedFilter;
  Block_height: Block_height;
  Boolean: Scalars['Boolean']['output'];
  Bytes: Scalars['Bytes']['output'];
  ExchangeRate: ExchangeRate;
  ExchangeRate_filter: ExchangeRate_filter;
  Float: Scalars['Float']['output'];
  ID: Scalars['ID']['output'];
  IncentiveSnapshot: IncentiveSnapshot;
  IncentiveSnapshot_filter: IncentiveSnapshot_filter;
  Int: Scalars['Int']['output'];
  Int8: Scalars['Int8']['output'];
  LendingRouter: LendingRouter;
  LendingRouter_filter: LendingRouter_filter;
  Market: Market;
  Market_filter: Market_filter;
  Oracle: Oracle;
  OracleRegistry: OracleRegistry;
  OracleRegistry_filter: OracleRegistry_filter;
  Oracle_filter: Oracle_filter;
  ProfitLossLineItem: ProfitLossLineItem;
  ProfitLossLineItem_filter: ProfitLossLineItem_filter;
  Query: {};
  String: Scalars['String']['output'];
  Timestamp: Scalars['Timestamp']['output'];
  Token: Token;
  Token_filter: Token_filter;
  TokenizedWithdrawRequest: TokenizedWithdrawRequest;
  TokenizedWithdrawRequest_filter: TokenizedWithdrawRequest_filter;
  TradingModulePermission: TradingModulePermission;
  TradingModulePermission_filter: TradingModulePermission_filter;
  Vault: Vault;
  Vault_filter: Vault_filter;
  WithdrawRequest: WithdrawRequest;
  WithdrawRequestManager: WithdrawRequestManager;
  WithdrawRequestManager_filter: WithdrawRequestManager_filter;
  WithdrawRequest_filter: WithdrawRequest_filter;
  _Block_: _Block_;
  _Meta_: _Meta_;
}>;

export type entityDirectiveArgs = { };

export type entityDirectiveResolver<Result, Parent, ContextType = MeshContext & { apiKey: string, subgraphId: string, network: string }, Args = entityDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type subgraphIdDirectiveArgs = {
  id: Scalars['String']['input'];
};

export type subgraphIdDirectiveResolver<Result, Parent, ContextType = MeshContext & { apiKey: string, subgraphId: string, network: string }, Args = subgraphIdDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type derivedFromDirectiveArgs = {
  field: Scalars['String']['input'];
};

export type derivedFromDirectiveResolver<Result, Parent, ContextType = MeshContext & { apiKey: string, subgraphId: string, network: string }, Args = derivedFromDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type AccountResolvers<ContextType = MeshContext & { apiKey: string, subgraphId: string, network: string }, ParentType extends ResolversParentTypes['Account'] = ResolversParentTypes['Account']> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  firstUpdateBlockNumber?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  firstUpdateTimestamp?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  firstUpdateTransactionHash?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  lastUpdateBlockNumber?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  lastUpdateTimestamp?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  lastUpdateTransactionHash?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  systemAccountType?: Resolver<ResolversTypes['SystemAccount'], ParentType, ContextType>;
  balances?: Resolver<Maybe<Array<ResolversTypes['Balance']>>, ParentType, ContextType, RequireFields<AccountbalancesArgs, 'skip' | 'first'>>;
  profitLossLineItems?: Resolver<Maybe<Array<ResolversTypes['ProfitLossLineItem']>>, ParentType, ContextType, RequireFields<AccountprofitLossLineItemsArgs, 'skip' | 'first'>>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type BalanceResolvers<ContextType = MeshContext & { apiKey: string, subgraphId: string, network: string }, ParentType extends ResolversParentTypes['Balance'] = ResolversParentTypes['Balance']> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  token?: Resolver<ResolversTypes['Token'], ParentType, ContextType>;
  account?: Resolver<ResolversTypes['Account'], ParentType, ContextType>;
  firstUpdateBlockNumber?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  firstUpdateTimestamp?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  firstUpdateTransactionHash?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  lastUpdateBlockNumber?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  lastUpdateTimestamp?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  lastUpdateTransactionHash?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  current?: Resolver<ResolversTypes['BalanceSnapshot'], ParentType, ContextType>;
  lendingRouter?: Resolver<Maybe<ResolversTypes['LendingRouter']>, ParentType, ContextType>;
  _lastIncentiveSnapshotBlockNumber?: Resolver<Maybe<ResolversTypes['BigInt']>, ParentType, ContextType>;
  withdrawRequest?: Resolver<Maybe<Array<ResolversTypes['WithdrawRequest']>>, ParentType, ContextType, RequireFields<BalancewithdrawRequestArgs, 'skip' | 'first'>>;
  snapshots?: Resolver<Maybe<Array<ResolversTypes['BalanceSnapshot']>>, ParentType, ContextType, RequireFields<BalancesnapshotsArgs, 'skip' | 'first'>>;
  incentives?: Resolver<Maybe<Array<ResolversTypes['IncentiveSnapshot']>>, ParentType, ContextType, RequireFields<BalanceincentivesArgs, 'skip' | 'first'>>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type BalanceSnapshotResolvers<ContextType = MeshContext & { apiKey: string, subgraphId: string, network: string }, ParentType extends ResolversParentTypes['BalanceSnapshot'] = ResolversParentTypes['BalanceSnapshot']> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  blockNumber?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  timestamp?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  transactionHash?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  previousSnapshot?: Resolver<Maybe<ResolversTypes['BalanceSnapshot']>, ParentType, ContextType>;
  balance?: Resolver<ResolversTypes['Balance'], ParentType, ContextType>;
  currentBalance?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  previousBalance?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  adjustedCostBasis?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  currentProfitAndLossAtSnapshot?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  totalInterestAccrualAtSnapshot?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  totalVaultFeesAtSnapshot?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  impliedFixedRate?: Resolver<Maybe<ResolversTypes['BigInt']>, ParentType, ContextType>;
  _accumulatedBalance?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  _accumulatedCostRealized?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  _lastInterestAccumulator?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  _lastVaultFeeAccumulator?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  profitLossLineItems?: Resolver<Maybe<Array<ResolversTypes['ProfitLossLineItem']>>, ParentType, ContextType, RequireFields<BalanceSnapshotprofitLossLineItemsArgs, 'skip' | 'first'>>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export interface BigDecimalScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['BigDecimal'], any> {
  name: 'BigDecimal';
}

export interface BigIntScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['BigInt'], any> {
  name: 'BigInt';
}

export interface BytesScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Bytes'], any> {
  name: 'Bytes';
}

export type ExchangeRateResolvers<ContextType = MeshContext & { apiKey: string, subgraphId: string, network: string }, ParentType extends ResolversParentTypes['ExchangeRate'] = ResolversParentTypes['ExchangeRate']> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  blockNumber?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  timestamp?: Resolver<ResolversTypes['Timestamp'], ParentType, ContextType>;
  oracle?: Resolver<ResolversTypes['Oracle'], ParentType, ContextType>;
  rate?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  totalSupply?: Resolver<Maybe<ResolversTypes['BigInt']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type IncentiveSnapshotResolvers<ContextType = MeshContext & { apiKey: string, subgraphId: string, network: string }, ParentType extends ResolversParentTypes['IncentiveSnapshot'] = ResolversParentTypes['IncentiveSnapshot']> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  blockNumber?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  timestamp?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  transactionHash?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  account?: Resolver<ResolversTypes['Account'], ParentType, ContextType>;
  balance?: Resolver<ResolversTypes['Balance'], ParentType, ContextType>;
  previousIncentiveSnapshot?: Resolver<Maybe<ResolversTypes['IncentiveSnapshot']>, ParentType, ContextType>;
  rewardToken?: Resolver<ResolversTypes['Token'], ParentType, ContextType>;
  totalClaimed?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  adjustedClaimed?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  amountClaimed?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export interface Int8ScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Int8'], any> {
  name: 'Int8';
}

export type LendingRouterResolvers<ContextType = MeshContext & { apiKey: string, subgraphId: string, network: string }, ParentType extends ResolversParentTypes['LendingRouter'] = ResolversParentTypes['LendingRouter']> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  firstUpdateBlockNumber?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  firstUpdateTimestamp?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  firstUpdateTransactionHash?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  lastUpdateBlockNumber?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  lastUpdateTimestamp?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  lastUpdateTransactionHash?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  markets?: Resolver<Maybe<Array<ResolversTypes['Market']>>, ParentType, ContextType, RequireFields<LendingRoutermarketsArgs, 'skip' | 'first'>>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type MarketResolvers<ContextType = MeshContext & { apiKey: string, subgraphId: string, network: string }, ParentType extends ResolversParentTypes['Market'] = ResolversParentTypes['Market']> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  firstUpdateBlockNumber?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  firstUpdateTimestamp?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  firstUpdateTransactionHash?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  lastUpdateBlockNumber?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  lastUpdateTimestamp?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  lastUpdateTransactionHash?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  lendingRouter?: Resolver<ResolversTypes['LendingRouter'], ParentType, ContextType>;
  vault?: Resolver<ResolversTypes['Vault'], ParentType, ContextType>;
  params?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type OracleResolvers<ContextType = MeshContext & { apiKey: string, subgraphId: string, network: string }, ParentType extends ResolversParentTypes['Oracle'] = ResolversParentTypes['Oracle']> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  lastUpdateBlockNumber?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  lastUpdateTimestamp?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  lastUpdateTransactionHash?: Resolver<Maybe<ResolversTypes['Bytes']>, ParentType, ContextType>;
  base?: Resolver<ResolversTypes['Token'], ParentType, ContextType>;
  quote?: Resolver<ResolversTypes['Token'], ParentType, ContextType>;
  decimals?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  ratePrecision?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  oracleAddress?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  oracleType?: Resolver<ResolversTypes['OracleType'], ParentType, ContextType>;
  mustInvert?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  latestRate?: Resolver<Maybe<ResolversTypes['BigInt']>, ParentType, ContextType>;
  matured?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  historicalRates?: Resolver<Maybe<Array<ResolversTypes['ExchangeRate']>>, ParentType, ContextType, RequireFields<OraclehistoricalRatesArgs, 'skip' | 'first'>>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type OracleRegistryResolvers<ContextType = MeshContext & { apiKey: string, subgraphId: string, network: string }, ParentType extends ResolversParentTypes['OracleRegistry'] = ResolversParentTypes['OracleRegistry']> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  lastRefreshBlockNumber?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  lastRefreshTimestamp?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  chainlinkOracles?: Resolver<Array<ResolversTypes['Oracle']>, ParentType, ContextType, RequireFields<OracleRegistrychainlinkOraclesArgs, 'skip' | 'first'>>;
  listedVaults?: Resolver<Array<ResolversTypes['Bytes']>, ParentType, ContextType>;
  lendingRouters?: Resolver<Array<ResolversTypes['Bytes']>, ParentType, ContextType>;
  withdrawRequestManager?: Resolver<Array<ResolversTypes['Bytes']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ProfitLossLineItemResolvers<ContextType = MeshContext & { apiKey: string, subgraphId: string, network: string }, ParentType extends ResolversParentTypes['ProfitLossLineItem'] = ResolversParentTypes['ProfitLossLineItem']> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  blockNumber?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  timestamp?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  transactionHash?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  account?: Resolver<ResolversTypes['Account'], ParentType, ContextType>;
  token?: Resolver<ResolversTypes['Token'], ParentType, ContextType>;
  balanceSnapshot?: Resolver<ResolversTypes['BalanceSnapshot'], ParentType, ContextType>;
  underlyingToken?: Resolver<ResolversTypes['Token'], ParentType, ContextType>;
  lineItemType?: Resolver<ResolversTypes['LineItemType'], ParentType, ContextType>;
  tokenAmount?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  underlyingAmountRealized?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  underlyingAmountSpot?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  yieldTokenAmount?: Resolver<Maybe<ResolversTypes['BigInt']>, ParentType, ContextType>;
  realizedPrice?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  spotPrice?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  impliedFixedRate?: Resolver<Maybe<ResolversTypes['BigInt']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type QueryResolvers<ContextType = MeshContext & { apiKey: string, subgraphId: string, network: string }, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = ResolversObject<{
  token?: Resolver<Maybe<ResolversTypes['Token']>, ParentType, ContextType, RequireFields<QuerytokenArgs, 'id' | 'subgraphError'>>;
  tokens?: Resolver<Array<ResolversTypes['Token']>, ParentType, ContextType, RequireFields<QuerytokensArgs, 'skip' | 'first' | 'subgraphError'>>;
  profitLossLineItem?: Resolver<Maybe<ResolversTypes['ProfitLossLineItem']>, ParentType, ContextType, RequireFields<QueryprofitLossLineItemArgs, 'id' | 'subgraphError'>>;
  profitLossLineItems?: Resolver<Array<ResolversTypes['ProfitLossLineItem']>, ParentType, ContextType, RequireFields<QueryprofitLossLineItemsArgs, 'skip' | 'first' | 'subgraphError'>>;
  account?: Resolver<Maybe<ResolversTypes['Account']>, ParentType, ContextType, RequireFields<QueryaccountArgs, 'id' | 'subgraphError'>>;
  accounts?: Resolver<Array<ResolversTypes['Account']>, ParentType, ContextType, RequireFields<QueryaccountsArgs, 'skip' | 'first' | 'subgraphError'>>;
  oracleRegistry?: Resolver<Maybe<ResolversTypes['OracleRegistry']>, ParentType, ContextType, RequireFields<QueryoracleRegistryArgs, 'id' | 'subgraphError'>>;
  oracleRegistries?: Resolver<Array<ResolversTypes['OracleRegistry']>, ParentType, ContextType, RequireFields<QueryoracleRegistriesArgs, 'skip' | 'first' | 'subgraphError'>>;
  oracle?: Resolver<Maybe<ResolversTypes['Oracle']>, ParentType, ContextType, RequireFields<QueryoracleArgs, 'id' | 'subgraphError'>>;
  oracles?: Resolver<Array<ResolversTypes['Oracle']>, ParentType, ContextType, RequireFields<QueryoraclesArgs, 'skip' | 'first' | 'subgraphError'>>;
  exchangeRate?: Resolver<Maybe<ResolversTypes['ExchangeRate']>, ParentType, ContextType, RequireFields<QueryexchangeRateArgs, 'id' | 'subgraphError'>>;
  exchangeRates?: Resolver<Array<ResolversTypes['ExchangeRate']>, ParentType, ContextType, RequireFields<QueryexchangeRatesArgs, 'skip' | 'first' | 'subgraphError'>>;
  vault?: Resolver<Maybe<ResolversTypes['Vault']>, ParentType, ContextType, RequireFields<QueryvaultArgs, 'id' | 'subgraphError'>>;
  vaults?: Resolver<Array<ResolversTypes['Vault']>, ParentType, ContextType, RequireFields<QueryvaultsArgs, 'skip' | 'first' | 'subgraphError'>>;
  lendingRouter?: Resolver<Maybe<ResolversTypes['LendingRouter']>, ParentType, ContextType, RequireFields<QuerylendingRouterArgs, 'id' | 'subgraphError'>>;
  lendingRouters?: Resolver<Array<ResolversTypes['LendingRouter']>, ParentType, ContextType, RequireFields<QuerylendingRoutersArgs, 'skip' | 'first' | 'subgraphError'>>;
  market?: Resolver<Maybe<ResolversTypes['Market']>, ParentType, ContextType, RequireFields<QuerymarketArgs, 'id' | 'subgraphError'>>;
  markets?: Resolver<Array<ResolversTypes['Market']>, ParentType, ContextType, RequireFields<QuerymarketsArgs, 'skip' | 'first' | 'subgraphError'>>;
  withdrawRequestManager?: Resolver<Maybe<ResolversTypes['WithdrawRequestManager']>, ParentType, ContextType, RequireFields<QuerywithdrawRequestManagerArgs, 'id' | 'subgraphError'>>;
  withdrawRequestManagers?: Resolver<Array<ResolversTypes['WithdrawRequestManager']>, ParentType, ContextType, RequireFields<QuerywithdrawRequestManagersArgs, 'skip' | 'first' | 'subgraphError'>>;
  balance?: Resolver<Maybe<ResolversTypes['Balance']>, ParentType, ContextType, RequireFields<QuerybalanceArgs, 'id' | 'subgraphError'>>;
  balances?: Resolver<Array<ResolversTypes['Balance']>, ParentType, ContextType, RequireFields<QuerybalancesArgs, 'skip' | 'first' | 'subgraphError'>>;
  balanceSnapshot?: Resolver<Maybe<ResolversTypes['BalanceSnapshot']>, ParentType, ContextType, RequireFields<QuerybalanceSnapshotArgs, 'id' | 'subgraphError'>>;
  balanceSnapshots?: Resolver<Array<ResolversTypes['BalanceSnapshot']>, ParentType, ContextType, RequireFields<QuerybalanceSnapshotsArgs, 'skip' | 'first' | 'subgraphError'>>;
  withdrawRequest?: Resolver<Maybe<ResolversTypes['WithdrawRequest']>, ParentType, ContextType, RequireFields<QuerywithdrawRequestArgs, 'id' | 'subgraphError'>>;
  withdrawRequests?: Resolver<Array<ResolversTypes['WithdrawRequest']>, ParentType, ContextType, RequireFields<QuerywithdrawRequestsArgs, 'skip' | 'first' | 'subgraphError'>>;
  tokenizedWithdrawRequest?: Resolver<Maybe<ResolversTypes['TokenizedWithdrawRequest']>, ParentType, ContextType, RequireFields<QuerytokenizedWithdrawRequestArgs, 'id' | 'subgraphError'>>;
  tokenizedWithdrawRequests?: Resolver<Array<ResolversTypes['TokenizedWithdrawRequest']>, ParentType, ContextType, RequireFields<QuerytokenizedWithdrawRequestsArgs, 'skip' | 'first' | 'subgraphError'>>;
  incentiveSnapshot?: Resolver<Maybe<ResolversTypes['IncentiveSnapshot']>, ParentType, ContextType, RequireFields<QueryincentiveSnapshotArgs, 'id' | 'subgraphError'>>;
  incentiveSnapshots?: Resolver<Array<ResolversTypes['IncentiveSnapshot']>, ParentType, ContextType, RequireFields<QueryincentiveSnapshotsArgs, 'skip' | 'first' | 'subgraphError'>>;
  tradingModulePermission?: Resolver<Maybe<ResolversTypes['TradingModulePermission']>, ParentType, ContextType, RequireFields<QuerytradingModulePermissionArgs, 'id' | 'subgraphError'>>;
  tradingModulePermissions?: Resolver<Array<ResolversTypes['TradingModulePermission']>, ParentType, ContextType, RequireFields<QuerytradingModulePermissionsArgs, 'skip' | 'first' | 'subgraphError'>>;
  _meta?: Resolver<Maybe<ResolversTypes['_Meta_']>, ParentType, ContextType, Partial<Query_metaArgs>>;
}>;

export interface TimestampScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Timestamp'], any> {
  name: 'Timestamp';
}

export type TokenResolvers<ContextType = MeshContext & { apiKey: string, subgraphId: string, network: string }, ParentType extends ResolversParentTypes['Token'] = ResolversParentTypes['Token']> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  firstUpdateBlockNumber?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  firstUpdateTimestamp?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  firstUpdateTransactionHash?: Resolver<Maybe<ResolversTypes['Bytes']>, ParentType, ContextType>;
  lastUpdateBlockNumber?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  lastUpdateTimestamp?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  lastUpdateTransactionHash?: Resolver<Maybe<ResolversTypes['Bytes']>, ParentType, ContextType>;
  tokenType?: Resolver<ResolversTypes['TokenType'], ParentType, ContextType>;
  tokenInterface?: Resolver<ResolversTypes['TokenInterface'], ParentType, ContextType>;
  underlying?: Resolver<Maybe<ResolversTypes['Token']>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  symbol?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  decimals?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  precision?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  totalSupply?: Resolver<Maybe<ResolversTypes['BigInt']>, ParentType, ContextType>;
  maturity?: Resolver<Maybe<ResolversTypes['BigInt']>, ParentType, ContextType>;
  vaultAddress?: Resolver<Maybe<ResolversTypes['Vault']>, ParentType, ContextType>;
  tokenAddress?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  balanceOf?: Resolver<Maybe<Array<ResolversTypes['Balance']>>, ParentType, ContextType, RequireFields<TokenbalanceOfArgs, 'skip' | 'first'>>;
  oracles?: Resolver<Maybe<Array<ResolversTypes['Oracle']>>, ParentType, ContextType, RequireFields<TokenoraclesArgs, 'skip' | 'first'>>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TokenizedWithdrawRequestResolvers<ContextType = MeshContext & { apiKey: string, subgraphId: string, network: string }, ParentType extends ResolversParentTypes['TokenizedWithdrawRequest'] = ResolversParentTypes['TokenizedWithdrawRequest']> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  lastUpdateBlockNumber?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  lastUpdateTimestamp?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  lastUpdateTransactionHash?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  finalizedBlockNumber?: Resolver<Maybe<ResolversTypes['BigInt']>, ParentType, ContextType>;
  finalizedTimestamp?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  finalizedTransactionHash?: Resolver<Maybe<ResolversTypes['Bytes']>, ParentType, ContextType>;
  withdrawRequestManager?: Resolver<ResolversTypes['WithdrawRequestManager'], ParentType, ContextType>;
  totalYieldTokenAmount?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  totalWithdraw?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  finalized?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  _holders?: Resolver<Array<ResolversTypes['WithdrawRequest']>, ParentType, ContextType, RequireFields<TokenizedWithdrawRequest_holdersArgs, 'skip' | 'first'>>;
  withdrawRequests?: Resolver<Maybe<Array<ResolversTypes['WithdrawRequest']>>, ParentType, ContextType, RequireFields<TokenizedWithdrawRequestwithdrawRequestsArgs, 'skip' | 'first'>>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TradingModulePermissionResolvers<ContextType = MeshContext & { apiKey: string, subgraphId: string, network: string }, ParentType extends ResolversParentTypes['TradingModulePermission'] = ResolversParentTypes['TradingModulePermission']> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  lastUpdateBlockNumber?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  lastUpdateTimestamp?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  lastUpdateTransactionHash?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  sender?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  token?: Resolver<Maybe<ResolversTypes['Token']>, ParentType, ContextType>;
  tokenAddress?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  symbol?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  allowedDexes?: Resolver<Array<ResolversTypes['DEX']>, ParentType, ContextType>;
  allowSell?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  allowedTradeTypes?: Resolver<Array<ResolversTypes['TradeType']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type VaultResolvers<ContextType = MeshContext & { apiKey: string, subgraphId: string, network: string }, ParentType extends ResolversParentTypes['Vault'] = ResolversParentTypes['Vault']> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  firstUpdateBlockNumber?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  firstUpdateTimestamp?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  firstUpdateTransactionHash?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  lastUpdateBlockNumber?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  lastUpdateTimestamp?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  lastUpdateTransactionHash?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  isWhitelisted?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  asset?: Resolver<ResolversTypes['Token'], ParentType, ContextType>;
  yieldToken?: Resolver<ResolversTypes['Token'], ParentType, ContextType>;
  vaultToken?: Resolver<ResolversTypes['Token'], ParentType, ContextType>;
  accountingAsset?: Resolver<ResolversTypes['Token'], ParentType, ContextType>;
  feeRate?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  strategyType?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  withdrawRequestManagers?: Resolver<Array<ResolversTypes['WithdrawRequestManager']>, ParentType, ContextType, RequireFields<VaultwithdrawRequestManagersArgs, 'skip' | 'first'>>;
  withdrawRequests?: Resolver<Maybe<Array<ResolversTypes['WithdrawRequest']>>, ParentType, ContextType, RequireFields<VaultwithdrawRequestsArgs, 'skip' | 'first'>>;
  markets?: Resolver<Maybe<Array<ResolversTypes['Market']>>, ParentType, ContextType, RequireFields<VaultmarketsArgs, 'skip' | 'first'>>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type WithdrawRequestResolvers<ContextType = MeshContext & { apiKey: string, subgraphId: string, network: string }, ParentType extends ResolversParentTypes['WithdrawRequest'] = ResolversParentTypes['WithdrawRequest']> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  lastUpdateBlockNumber?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  lastUpdateTimestamp?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  lastUpdateTransactionHash?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  withdrawRequestManager?: Resolver<ResolversTypes['WithdrawRequestManager'], ParentType, ContextType>;
  account?: Resolver<ResolversTypes['Account'], ParentType, ContextType>;
  vault?: Resolver<ResolversTypes['Vault'], ParentType, ContextType>;
  balance?: Resolver<ResolversTypes['Balance'], ParentType, ContextType>;
  requestId?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  yieldTokenAmount?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  sharesAmount?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  tokenizedWithdrawRequest?: Resolver<Maybe<ResolversTypes['TokenizedWithdrawRequest']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type WithdrawRequestManagerResolvers<ContextType = MeshContext & { apiKey: string, subgraphId: string, network: string }, ParentType extends ResolversParentTypes['WithdrawRequestManager'] = ResolversParentTypes['WithdrawRequestManager']> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  firstUpdateBlockNumber?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  firstUpdateTimestamp?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  firstUpdateTransactionHash?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  lastUpdateBlockNumber?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  lastUpdateTimestamp?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  lastUpdateTransactionHash?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  yieldToken?: Resolver<ResolversTypes['Token'], ParentType, ContextType>;
  withdrawToken?: Resolver<ResolversTypes['Token'], ParentType, ContextType>;
  stakingToken?: Resolver<ResolversTypes['Token'], ParentType, ContextType>;
  approvedVaults?: Resolver<Maybe<Array<ResolversTypes['Vault']>>, ParentType, ContextType, RequireFields<WithdrawRequestManagerapprovedVaultsArgs, 'skip' | 'first'>>;
  withdrawRequests?: Resolver<Maybe<Array<ResolversTypes['WithdrawRequest']>>, ParentType, ContextType, RequireFields<WithdrawRequestManagerwithdrawRequestsArgs, 'skip' | 'first'>>;
  tokenizedWithdrawRequests?: Resolver<Maybe<Array<ResolversTypes['TokenizedWithdrawRequest']>>, ParentType, ContextType, RequireFields<WithdrawRequestManagertokenizedWithdrawRequestsArgs, 'skip' | 'first'>>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type _Block_Resolvers<ContextType = MeshContext & { apiKey: string, subgraphId: string, network: string }, ParentType extends ResolversParentTypes['_Block_'] = ResolversParentTypes['_Block_']> = ResolversObject<{
  hash?: Resolver<Maybe<ResolversTypes['Bytes']>, ParentType, ContextType>;
  number?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  timestamp?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  parentHash?: Resolver<Maybe<ResolversTypes['Bytes']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type _Meta_Resolvers<ContextType = MeshContext & { apiKey: string, subgraphId: string, network: string }, ParentType extends ResolversParentTypes['_Meta_'] = ResolversParentTypes['_Meta_']> = ResolversObject<{
  block?: Resolver<ResolversTypes['_Block_'], ParentType, ContextType>;
  deployment?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  hasIndexingErrors?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type Resolvers<ContextType = MeshContext & { apiKey: string, subgraphId: string, network: string }> = ResolversObject<{
  Account?: AccountResolvers<ContextType>;
  Balance?: BalanceResolvers<ContextType>;
  BalanceSnapshot?: BalanceSnapshotResolvers<ContextType>;
  BigDecimal?: GraphQLScalarType;
  BigInt?: GraphQLScalarType;
  Bytes?: GraphQLScalarType;
  ExchangeRate?: ExchangeRateResolvers<ContextType>;
  IncentiveSnapshot?: IncentiveSnapshotResolvers<ContextType>;
  Int8?: GraphQLScalarType;
  LendingRouter?: LendingRouterResolvers<ContextType>;
  Market?: MarketResolvers<ContextType>;
  Oracle?: OracleResolvers<ContextType>;
  OracleRegistry?: OracleRegistryResolvers<ContextType>;
  ProfitLossLineItem?: ProfitLossLineItemResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  Timestamp?: GraphQLScalarType;
  Token?: TokenResolvers<ContextType>;
  TokenizedWithdrawRequest?: TokenizedWithdrawRequestResolvers<ContextType>;
  TradingModulePermission?: TradingModulePermissionResolvers<ContextType>;
  Vault?: VaultResolvers<ContextType>;
  WithdrawRequest?: WithdrawRequestResolvers<ContextType>;
  WithdrawRequestManager?: WithdrawRequestManagerResolvers<ContextType>;
  _Block_?: _Block_Resolvers<ContextType>;
  _Meta_?: _Meta_Resolvers<ContextType>;
}>;

export type DirectiveResolvers<ContextType = MeshContext & { apiKey: string, subgraphId: string, network: string }> = ResolversObject<{
  entity?: entityDirectiveResolver<any, any, ContextType>;
  subgraphId?: subgraphIdDirectiveResolver<any, any, ContextType>;
  derivedFrom?: derivedFromDirectiveResolver<any, any, ContextType>;
}>;

export type MeshContext = NotionalExponentTypes.Context & BaseMeshContext;


const baseDir = pathModule.join(typeof __dirname === 'string' ? __dirname : '/', '..');

const importFn: ImportFn = <T>(moduleId: string) => {
  const relativeModuleId = (pathModule.isAbsolute(moduleId) ? pathModule.relative(baseDir, moduleId) : moduleId).split('\\').join('/').replace(baseDir + '/', '');
  switch(relativeModuleId) {
    case ".graphclient/sources/NotionalExponent/introspectionSchema":
      return Promise.resolve(importedModule$0) as T;
    
    default:
      return Promise.reject(new Error(`Cannot find module '${relativeModuleId}'.`));
  }
};

const rootStore = new MeshStore('.graphclient', new FsStoreStorageAdapter({
  cwd: baseDir,
  importFn,
  fileType: "ts",
}), {
  readonly: true,
  validate: false
});

export const rawServeConfig: YamlConfig.Config['serve'] = undefined as any
export async function getMeshOptions(): Promise<GetMeshOptions> {
const pubsub = new PubSub();
const sourcesStore = rootStore.child('sources');
const logger = new DefaultLogger("GraphClient");
const cache = new (MeshCache as any)({
      ...({} as any),
      importFn,
      store: rootStore.child('cache'),
      pubsub,
      logger,
    } as any)

const sources: MeshResolvedSource[] = [];
const transforms: MeshTransform[] = [];
const additionalEnvelopPlugins: MeshPlugin<any>[] = [];
const notionalExponentTransforms = [];
const additionalTypeDefs = [] as any[];
const notionalExponentHandler = new GraphqlHandler({
              name: "NotionalExponent",
              config: {"endpoint":"https://gateway-arbitrum.network.thegraph.com/api/f9f58a6131e8807672eaa304ed6abef8/subgraphs/id/9fw42E6QrezaPxixKN9H79nWmpVWURkLmcJdgGHyC14B","retry":2},
              baseDir,
              cache,
              pubsub,
              store: sourcesStore.child("NotionalExponent"),
              logger: logger.child("NotionalExponent"),
              importFn,
            });
sources[0] = {
          name: 'NotionalExponent',
          handler: notionalExponentHandler,
          transforms: notionalExponentTransforms
        }
const additionalResolvers = [] as any[]
const merger = new(BareMerger as any)({
        cache,
        pubsub,
        logger: logger.child('bareMerger'),
        store: rootStore.child('bareMerger')
      })
const documentHashMap = {
        "f025231933038b0abd9e80ec20b014aa56b5b2d0090d1bd2a27afafe30a06a4b": AccountBalanceStatementDocument,
"b7aae423c7c493a71c03ed0bd678a04ec44a663dec8df173d687e889d30c8113": AccountHoldingsHistoricalDocument,
"257286d52c180cc7e75909850ff12dc5d6a7d779ac0fbaceee24f5cf9ef94037": AccountIncentiveSnapshotsDocument,
"918b83cfd464ef3f17c742038656d9d3b12c24349c4d5cde5596d307121e3434": AccountPositionsDocument,
"dafd4d227ae753f313f7308579e37e5a7087b6a5f56dc8d95840d4873c185eba": AccountTransactionHistoryDocument,
"2b82dae20a6c13b62f528c205924427589a1388dba5fdf157908212c6df9e2b4": AllAccountsDocument,
"68a1908f95cf8343d742716d67541e942500eb0bfbf23625890ed3d80125cacc": AllLendingRoutersDocument,
"ba008351484965ba1d6d3f1224e75c149080630db68ff630858f49a5f1fcaded": AllOraclesDocument,
"eef1829d295aeb9acb81def8719e1ef23cb133e59853c6ea6426afd2a3e6d11e": AllOraclesByBlockNumberDocument,
"e94740872f6c85c11385633250906f51dd2789b83ed72e83ddf759e40bc08f3e": AllTokensDocument,
"92d2e2019584a34173cdb14f308270dce8bde2dd1d4212dbb46ab17b89986dff": AllVaultAccountsDocument,
"70ed50c5e67fbedd9cbf69eb7e0c6b896c222841c054b1317c8821e6854d254a": AllVaultsDocument,
"3b7e2c75f58fad36fce3572c493b1ab826db61a5b6bf8b9486c2e7578c03ba15": AllWithdrawRequestManagersDocument,
"da832fd911b34bb4f0ffee2213f39ed44320a63f8d16d0a91ae3fe2db18323b4": ExchangeRateValuesDocument,
"bc44cf31197fbf575729d279bca28c1c4d96faf0e2b767b42d84fbd564dfbbba": HistoricalOracleValuesDocument,
"41f050e433813826bebb9bbbbe4de3c1b1451a249f29dd4b7d6dabe760911906": MetaDocument,
"0bac19b9e19b0aa12533e4e45edd68a64acde7afbac18a2191ee060ef1333b91": NetworkTransactionHistoryDocument
      }
additionalEnvelopPlugins.push(usePersistedOperations({
        getPersistedOperation(key) {
          return documentHashMap[key];
        },
        ...{}
      }))

  return {
    sources,
    transforms,
    additionalTypeDefs,
    additionalResolvers,
    cache,
    pubsub,
    merger,
    logger,
    additionalEnvelopPlugins,
    get documents() {
      return [
      {
        document: AccountBalanceStatementDocument,
        get rawSDL() {
          return printWithCache(AccountBalanceStatementDocument);
        },
        location: 'AccountBalanceStatementDocument.graphql',
        sha256Hash: 'f025231933038b0abd9e80ec20b014aa56b5b2d0090d1bd2a27afafe30a06a4b'
      },{
        document: AccountHoldingsHistoricalDocument,
        get rawSDL() {
          return printWithCache(AccountHoldingsHistoricalDocument);
        },
        location: 'AccountHoldingsHistoricalDocument.graphql',
        sha256Hash: 'b7aae423c7c493a71c03ed0bd678a04ec44a663dec8df173d687e889d30c8113'
      },{
        document: AccountIncentiveSnapshotsDocument,
        get rawSDL() {
          return printWithCache(AccountIncentiveSnapshotsDocument);
        },
        location: 'AccountIncentiveSnapshotsDocument.graphql',
        sha256Hash: '257286d52c180cc7e75909850ff12dc5d6a7d779ac0fbaceee24f5cf9ef94037'
      },{
        document: AccountPositionsDocument,
        get rawSDL() {
          return printWithCache(AccountPositionsDocument);
        },
        location: 'AccountPositionsDocument.graphql',
        sha256Hash: '918b83cfd464ef3f17c742038656d9d3b12c24349c4d5cde5596d307121e3434'
      },{
        document: AccountTransactionHistoryDocument,
        get rawSDL() {
          return printWithCache(AccountTransactionHistoryDocument);
        },
        location: 'AccountTransactionHistoryDocument.graphql',
        sha256Hash: 'dafd4d227ae753f313f7308579e37e5a7087b6a5f56dc8d95840d4873c185eba'
      },{
        document: AllAccountsDocument,
        get rawSDL() {
          return printWithCache(AllAccountsDocument);
        },
        location: 'AllAccountsDocument.graphql',
        sha256Hash: '2b82dae20a6c13b62f528c205924427589a1388dba5fdf157908212c6df9e2b4'
      },{
        document: AllLendingRoutersDocument,
        get rawSDL() {
          return printWithCache(AllLendingRoutersDocument);
        },
        location: 'AllLendingRoutersDocument.graphql',
        sha256Hash: '68a1908f95cf8343d742716d67541e942500eb0bfbf23625890ed3d80125cacc'
      },{
        document: AllOraclesDocument,
        get rawSDL() {
          return printWithCache(AllOraclesDocument);
        },
        location: 'AllOraclesDocument.graphql',
        sha256Hash: 'ba008351484965ba1d6d3f1224e75c149080630db68ff630858f49a5f1fcaded'
      },{
        document: AllOraclesByBlockNumberDocument,
        get rawSDL() {
          return printWithCache(AllOraclesByBlockNumberDocument);
        },
        location: 'AllOraclesByBlockNumberDocument.graphql',
        sha256Hash: 'eef1829d295aeb9acb81def8719e1ef23cb133e59853c6ea6426afd2a3e6d11e'
      },{
        document: AllTokensDocument,
        get rawSDL() {
          return printWithCache(AllTokensDocument);
        },
        location: 'AllTokensDocument.graphql',
        sha256Hash: 'e94740872f6c85c11385633250906f51dd2789b83ed72e83ddf759e40bc08f3e'
      },{
        document: AllVaultAccountsDocument,
        get rawSDL() {
          return printWithCache(AllVaultAccountsDocument);
        },
        location: 'AllVaultAccountsDocument.graphql',
        sha256Hash: '92d2e2019584a34173cdb14f308270dce8bde2dd1d4212dbb46ab17b89986dff'
      },{
        document: AllVaultsDocument,
        get rawSDL() {
          return printWithCache(AllVaultsDocument);
        },
        location: 'AllVaultsDocument.graphql',
        sha256Hash: '70ed50c5e67fbedd9cbf69eb7e0c6b896c222841c054b1317c8821e6854d254a'
      },{
        document: AllWithdrawRequestManagersDocument,
        get rawSDL() {
          return printWithCache(AllWithdrawRequestManagersDocument);
        },
        location: 'AllWithdrawRequestManagersDocument.graphql',
        sha256Hash: '3b7e2c75f58fad36fce3572c493b1ab826db61a5b6bf8b9486c2e7578c03ba15'
      },{
        document: ExchangeRateValuesDocument,
        get rawSDL() {
          return printWithCache(ExchangeRateValuesDocument);
        },
        location: 'ExchangeRateValuesDocument.graphql',
        sha256Hash: 'da832fd911b34bb4f0ffee2213f39ed44320a63f8d16d0a91ae3fe2db18323b4'
      },{
        document: HistoricalOracleValuesDocument,
        get rawSDL() {
          return printWithCache(HistoricalOracleValuesDocument);
        },
        location: 'HistoricalOracleValuesDocument.graphql',
        sha256Hash: 'bc44cf31197fbf575729d279bca28c1c4d96faf0e2b767b42d84fbd564dfbbba'
      },{
        document: MetaDocument,
        get rawSDL() {
          return printWithCache(MetaDocument);
        },
        location: 'MetaDocument.graphql',
        sha256Hash: '41f050e433813826bebb9bbbbe4de3c1b1451a249f29dd4b7d6dabe760911906'
      },{
        document: NetworkTransactionHistoryDocument,
        get rawSDL() {
          return printWithCache(NetworkTransactionHistoryDocument);
        },
        location: 'NetworkTransactionHistoryDocument.graphql',
        sha256Hash: '0bac19b9e19b0aa12533e4e45edd68a64acde7afbac18a2191ee060ef1333b91'
      }
    ];
    },
    fetchFn,
  };
}

export function createBuiltMeshHTTPHandler<TServerContext = {}>(): MeshHTTPHandler<TServerContext> {
  return createMeshHTTPHandler<TServerContext>({
    baseDir,
    getBuiltMesh: getBuiltGraphClient,
    rawServeConfig: undefined,
  })
}


let meshInstance$: Promise<MeshInstance> | undefined;

export const pollingInterval = null;

export function getBuiltGraphClient(): Promise<MeshInstance> {
  if (meshInstance$ == null) {
    if (pollingInterval) {
      setInterval(() => {
        getMeshOptions()
        .then(meshOptions => getMesh(meshOptions))
        .then(newMesh =>
          meshInstance$.then(oldMesh => {
            oldMesh.destroy()
            meshInstance$ = Promise.resolve(newMesh)
          })
        ).catch(err => {
          console.error("Mesh polling failed so the existing version will be used:", err);
        });
      }, pollingInterval)
    }
    meshInstance$ = getMeshOptions().then(meshOptions => getMesh(meshOptions)).then(mesh => {
      const id = mesh.pubsub.subscribe('destroy', () => {
        meshInstance$ = undefined;
        mesh.pubsub.unsubscribe(id);
      });
      return mesh;
    });
  }
  return meshInstance$;
}

export const execute: ExecuteMeshFn = (...args) => getBuiltGraphClient().then(({ execute }) => execute(...args));

export const subscribe: SubscribeMeshFn = (...args) => getBuiltGraphClient().then(({ subscribe }) => subscribe(...args));
export function getBuiltGraphSDK<TGlobalContext = any, TOperationContext = any>(globalContext?: TGlobalContext) {
  const sdkRequester$ = getBuiltGraphClient().then(({ sdkRequesterFactory }) => sdkRequesterFactory(globalContext));
  return getSdk<TOperationContext, TGlobalContext>((...args) => sdkRequester$.then(sdkRequester => sdkRequester(...args)));
}
export type AccountBalanceStatementQueryVariables = Exact<{
  accountId: Scalars['ID']['input'];
}>;


export type AccountBalanceStatementQuery = { account?: Maybe<(
    Pick<Account, 'id'>
    & { balances?: Maybe<Array<{ token: (
        Pick<Token, 'id'>
        & { underlying?: Maybe<Pick<Token, 'id'>>, vaultAddress?: Maybe<{ accountingAsset: Pick<Token, 'id'> }> }
      ), withdrawRequest?: Maybe<Array<(
        Pick<WithdrawRequest, 'id' | 'lastUpdateTimestamp' | 'requestId' | 'yieldTokenAmount' | 'sharesAmount'>
        & { tokenizedWithdrawRequest?: Maybe<Pick<TokenizedWithdrawRequest, 'totalYieldTokenAmount' | 'totalWithdraw' | 'finalized'>> }
      )>>, current: Pick<BalanceSnapshot, 'timestamp' | 'blockNumber' | 'currentBalance' | '_accumulatedCostRealized' | 'adjustedCostBasis' | 'currentProfitAndLossAtSnapshot' | 'totalVaultFeesAtSnapshot' | 'totalInterestAccrualAtSnapshot' | '_lastInterestAccumulator' | '_lastVaultFeeAccumulator' | 'impliedFixedRate'>, incentives?: Maybe<Array<(
        Pick<IncentiveSnapshot, 'totalClaimed' | 'adjustedClaimed'>
        & { rewardToken: Pick<Token, 'id' | 'symbol'> }
      )>> }>> }
  )> };

export type AccountHoldingsHistoricalQueryVariables = Exact<{
  accountId: Scalars['ID']['input'];
  minTimestamp: Scalars['Int']['input'];
}>;


export type AccountHoldingsHistoricalQuery = { account?: Maybe<{ balances?: Maybe<Array<{ token: Pick<Token, 'id'>, current: Pick<BalanceSnapshot, 'timestamp' | 'currentBalance'>, snapshots?: Maybe<Array<Pick<BalanceSnapshot, 'timestamp' | 'currentBalance'>>> }>> }> };

export type AccountIncentiveSnapshotsQueryVariables = Exact<{
  accountId: Scalars['String']['input'];
  skip: Scalars['Int']['input'];
}>;


export type AccountIncentiveSnapshotsQuery = { incentiveSnapshots: Array<(
    Pick<IncentiveSnapshot, 'timestamp' | 'blockNumber' | 'transactionHash' | 'amountClaimed'>
    & { rewardToken: Pick<Token, 'id'>, balance: { token: { vaultAddress?: Maybe<Pick<Vault, 'id'>> } } }
  )> };

export type AccountPositionsQueryVariables = Exact<{
  account: Scalars['String']['input'];
  skip?: InputMaybe<Scalars['Int']['input']>;
}>;


export type AccountPositionsQuery = { balances: Array<(
    Pick<Balance, 'id'>
    & { token: Pick<Token, 'id'>, current: Pick<BalanceSnapshot, 'currentBalance'> }
  )> };

export type AccountTransactionHistoryQueryVariables = Exact<{
  accountId: Scalars['String']['input'];
  skip: Scalars['Int']['input'];
}>;


export type AccountTransactionHistoryQuery = { profitLossLineItems: Array<(
    Pick<ProfitLossLineItem, 'timestamp' | 'blockNumber' | 'transactionHash' | 'lineItemType' | 'tokenAmount' | 'underlyingAmountRealized' | 'underlyingAmountSpot' | 'realizedPrice' | 'spotPrice' | 'impliedFixedRate' | 'yieldTokenAmount'>
    & { account: Pick<Account, 'id'>, token: Pick<Token, 'id' | 'symbol'>, underlyingToken: Pick<Token, 'id' | 'symbol'>, balanceSnapshot: { balance: { token: { vaultAddress?: Maybe<Pick<Vault, 'id'>> } } } }
  )> };

export type AllAccountsQueryVariables = Exact<{
  skip?: InputMaybe<Scalars['Int']['input']>;
  startId: Scalars['ID']['input'];
  endId: Scalars['ID']['input'];
}>;


export type AllAccountsQuery = { accounts: Array<(
    Pick<Account, 'id'>
    & { balances?: Maybe<Array<{ token: Pick<Token, 'id'>, current: Pick<BalanceSnapshot, 'currentBalance'> }>> }
  )> };

export type AllLendingRoutersQueryVariables = Exact<{
  skip?: InputMaybe<Scalars['Int']['input']>;
}>;


export type AllLendingRoutersQuery = { lendingRouters: Array<(
    Pick<LendingRouter, 'id' | 'name'>
    & { markets?: Maybe<Array<(
      Pick<Market, 'params'>
      & { vault: Pick<Vault, 'id'> }
    )>> }
  )>, _meta?: Maybe<{ block: Pick<_Block_, 'number'> }> };

export type AllOraclesQueryVariables = Exact<{
  skip: Scalars['Int']['input'];
}>;


export type AllOraclesQuery = { oracles: Array<(
    Pick<Oracle, 'id' | 'lastUpdateBlockNumber' | 'lastUpdateTimestamp' | 'decimals' | 'oracleAddress' | 'oracleType' | 'mustInvert' | 'latestRate'>
    & { base: Pick<Token, 'id' | 'decimals'>, quote: (
      Pick<Token, 'id' | 'decimals'>
      & { vaultAddress?: Maybe<(
        Pick<Vault, 'strategyType'>
        & { yieldToken: Pick<Token, 'id'> }
      )> }
    ) }
  )>, _meta?: Maybe<{ block: Pick<_Block_, 'number'> }> };

export type AllOraclesByBlockNumberQueryVariables = Exact<{
  skip: Scalars['Int']['input'];
  blockNumber: Scalars['Int']['input'];
}>;


export type AllOraclesByBlockNumberQuery = { oracles: Array<(
    Pick<Oracle, 'id' | 'lastUpdateBlockNumber' | 'lastUpdateTimestamp' | 'decimals' | 'oracleAddress' | 'oracleType' | 'mustInvert' | 'latestRate'>
    & { base: Pick<Token, 'id' | 'decimals'>, quote: Pick<Token, 'id' | 'decimals'> }
  )>, _meta?: Maybe<{ block: Pick<_Block_, 'number'> }> };

export type AllTokensQueryVariables = Exact<{
  skip?: InputMaybe<Scalars['Int']['input']>;
}>;


export type AllTokensQuery = { tokens: Array<(
    Pick<Token, 'id' | 'tokenType' | 'tokenInterface' | 'name' | 'symbol' | 'decimals' | 'totalSupply' | 'maturity' | 'tokenAddress'>
    & { underlying?: Maybe<Pick<Token, 'id'>>, vaultAddress?: Maybe<Pick<Vault, 'id'>> }
  )>, _meta?: Maybe<{ block: Pick<_Block_, 'number'> }> };

export type AllVaultAccountsQueryVariables = Exact<{
  skip?: InputMaybe<Scalars['Int']['input']>;
}>;


export type AllVaultAccountsQuery = { balances: Array<{ account: Pick<Account, 'id'>, token: Pick<Token, 'id'>, current: Pick<BalanceSnapshot, 'currentBalance'> }> };

export type AllVaultsQueryVariables = Exact<{
  skip?: InputMaybe<Scalars['Int']['input']>;
}>;


export type AllVaultsQuery = { vaults: Array<(
    Pick<Vault, 'id' | 'isWhitelisted' | 'feeRate' | 'strategyType'>
    & { asset: Pick<Token, 'id'>, yieldToken: Pick<Token, 'id'>, vaultToken: Pick<Token, 'id'>, withdrawRequestManagers: Array<Pick<WithdrawRequestManager, 'id'>> }
  )>, _meta?: Maybe<{ block: Pick<_Block_, 'number'> }> };

export type AllWithdrawRequestManagersQueryVariables = Exact<{
  skip?: InputMaybe<Scalars['Int']['input']>;
}>;


export type AllWithdrawRequestManagersQuery = { withdrawRequestManagers: Array<(
    Pick<WithdrawRequestManager, 'id'>
    & { yieldToken: Pick<Token, 'id'>, withdrawToken: Pick<Token, 'id'>, stakingToken: Pick<Token, 'id'> }
  )>, _meta?: Maybe<{ block: Pick<_Block_, 'number'> }> };

export type ExchangeRateValuesQueryVariables = Exact<{
  skip?: InputMaybe<Scalars['Int']['input']>;
  oracleId?: InputMaybe<Scalars['String']['input']>;
  minTimestamp?: InputMaybe<Scalars['Timestamp']['input']>;
}>;


export type ExchangeRateValuesQuery = { exchangeRates: Array<Pick<ExchangeRate, 'timestamp' | 'rate'>> };

export type HistoricalOracleValuesQueryVariables = Exact<{
  skip?: InputMaybe<Scalars['Int']['input']>;
  minTimestamp?: InputMaybe<Scalars['Timestamp']['input']>;
}>;


export type HistoricalOracleValuesQuery = { oracles: Array<(
    Pick<Oracle, 'id' | 'decimals' | 'ratePrecision' | 'oracleAddress' | 'oracleType' | 'latestRate'>
    & { base: Pick<Token, 'id' | 'tokenType'>, quote: (
      Pick<Token, 'id' | 'tokenType' | 'maturity'>
      & { underlying?: Maybe<Pick<Token, 'id'>> }
    ), historicalRates?: Maybe<Array<Pick<ExchangeRate, 'totalSupply' | 'blockNumber' | 'timestamp' | 'rate'>>> }
  )>, _meta?: Maybe<{ block: Pick<_Block_, 'number'> }> };

export type MetaQueryVariables = Exact<{ [key: string]: never; }>;


export type MetaQuery = { _meta?: Maybe<(
    Pick<_Meta_, 'deployment' | 'hasIndexingErrors'>
    & { block: Pick<_Block_, 'number' | 'hash' | 'timestamp'> }
  )> };

export type NetworkTransactionHistoryQueryVariables = Exact<{
  skip: Scalars['Int']['input'];
}>;


export type NetworkTransactionHistoryQuery = { profitLossLineItems: Array<(
    Pick<ProfitLossLineItem, 'timestamp' | 'blockNumber' | 'transactionHash' | 'lineItemType' | 'tokenAmount' | 'underlyingAmountRealized' | 'underlyingAmountSpot' | 'realizedPrice' | 'spotPrice' | 'impliedFixedRate'>
    & { token: Pick<Token, 'id'>, underlyingToken: Pick<Token, 'id'> }
  )> };


export const AccountBalanceStatementDocument = gql`
    query AccountBalanceStatement($accountId: ID!) {
  account(id: $accountId) {
    id
    balances(where: {current_: {currentBalance_not: 0}}) {
      token {
        id
        underlying {
          id
        }
        vaultAddress {
          accountingAsset {
            id
          }
        }
      }
      withdrawRequest {
        id
        lastUpdateTimestamp
        requestId
        yieldTokenAmount
        sharesAmount
        tokenizedWithdrawRequest {
          totalYieldTokenAmount
          totalWithdraw
          finalized
        }
      }
      current {
        timestamp
        blockNumber
        currentBalance
        _accumulatedCostRealized
        adjustedCostBasis
        currentProfitAndLossAtSnapshot
        totalVaultFeesAtSnapshot
        totalInterestAccrualAtSnapshot
        _lastInterestAccumulator
        _lastVaultFeeAccumulator
        impliedFixedRate
      }
      incentives {
        rewardToken {
          id
          symbol
        }
        totalClaimed
        adjustedClaimed
      }
    }
  }
}
    ` as unknown as DocumentNode<AccountBalanceStatementQuery, AccountBalanceStatementQueryVariables>;
export const AccountHoldingsHistoricalDocument = gql`
    query AccountHoldingsHistorical($accountId: ID!, $minTimestamp: Int!) {
  account(id: $accountId) {
    balances {
      token {
        id
      }
      current {
        timestamp
        currentBalance
      }
      snapshots(
        where: {timestamp_gte: $minTimestamp}
        orderBy: timestamp
        orderDirection: desc
        first: 1000
      ) {
        timestamp
        currentBalance
      }
    }
  }
}
    ` as unknown as DocumentNode<AccountHoldingsHistoricalQuery, AccountHoldingsHistoricalQueryVariables>;
export const AccountIncentiveSnapshotsDocument = gql`
    query AccountIncentiveSnapshots($accountId: String!, $skip: Int!) {
  incentiveSnapshots(
    where: {account: $accountId}
    orderBy: timestamp
    orderDirection: desc
    skip: $skip
    first: 1000
  ) {
    timestamp
    blockNumber
    transactionHash
    rewardToken {
      id
    }
    amountClaimed
    balance {
      token {
        vaultAddress {
          id
        }
      }
    }
  }
}
    ` as unknown as DocumentNode<AccountIncentiveSnapshotsQuery, AccountIncentiveSnapshotsQueryVariables>;
export const AccountPositionsDocument = gql`
    query AccountPositions($account: String!, $skip: Int) {
  balances(
    where: {account: $account, current_: {currentBalance_not: 0}}
    first: 1000
    skip: $skip
  ) {
    id
    token {
      id
    }
    current {
      currentBalance
    }
  }
}
    ` as unknown as DocumentNode<AccountPositionsQuery, AccountPositionsQueryVariables>;
export const AccountTransactionHistoryDocument = gql`
    query AccountTransactionHistory($accountId: String!, $skip: Int!) {
  profitLossLineItems(
    where: {account: $accountId}
    orderBy: timestamp
    orderDirection: desc
    skip: $skip
    first: 1000
  ) {
    timestamp
    blockNumber
    transactionHash
    lineItemType
    account {
      id
    }
    token {
      id
      symbol
    }
    underlyingToken {
      id
      symbol
    }
    tokenAmount
    underlyingAmountRealized
    underlyingAmountSpot
    realizedPrice
    spotPrice
    impliedFixedRate
    yieldTokenAmount
    balanceSnapshot {
      balance {
        token {
          vaultAddress {
            id
          }
        }
      }
    }
  }
}
    ` as unknown as DocumentNode<AccountTransactionHistoryQuery, AccountTransactionHistoryQueryVariables>;
export const AllAccountsDocument = gql`
    query AllAccounts($skip: Int, $startId: ID!, $endId: ID!) {
  accounts(
    where: {id_gt: $startId, id_lt: $endId, systemAccountType_in: [None]}
    first: 1000
    skip: $skip
  ) {
    id
    balances(where: {current_: {currentBalance_not: 0}}) {
      token {
        id
      }
      current {
        currentBalance
      }
    }
  }
}
    ` as unknown as DocumentNode<AllAccountsQuery, AllAccountsQueryVariables>;
export const AllLendingRoutersDocument = gql`
    query AllLendingRouters($skip: Int) {
  lendingRouters(first: 1000, skip: $skip) {
    id
    name
    markets(first: 1000) {
      vault {
        id
      }
      params
    }
  }
  _meta {
    block {
      number
    }
  }
}
    ` as unknown as DocumentNode<AllLendingRoutersQuery, AllLendingRoutersQueryVariables>;
export const AllOraclesDocument = gql`
    query AllOracles($skip: Int!) {
  oracles(where: {matured: false}, first: 1000, skip: $skip) {
    id
    lastUpdateBlockNumber
    lastUpdateTimestamp
    base {
      id
      decimals
    }
    quote {
      id
      decimals
      vaultAddress {
        strategyType
        yieldToken {
          id
        }
      }
    }
    decimals
    oracleAddress
    oracleType
    mustInvert
    latestRate
  }
  _meta {
    block {
      number
    }
  }
}
    ` as unknown as DocumentNode<AllOraclesQuery, AllOraclesQueryVariables>;
export const AllOraclesByBlockNumberDocument = gql`
    query AllOraclesByBlockNumber($skip: Int!, $blockNumber: Int!) {
  oracles(
    where: {matured: false}
    first: 1000
    skip: $skip
    block: {number: $blockNumber}
  ) {
    id
    lastUpdateBlockNumber
    lastUpdateTimestamp
    base {
      id
      decimals
    }
    quote {
      id
      decimals
    }
    decimals
    oracleAddress
    oracleType
    mustInvert
    latestRate
  }
  _meta {
    block {
      number
    }
  }
}
    ` as unknown as DocumentNode<AllOraclesByBlockNumberQuery, AllOraclesByBlockNumberQueryVariables>;
export const AllTokensDocument = gql`
    query AllTokens($skip: Int) {
  tokens(first: 1000, skip: $skip) {
    id
    tokenType
    tokenInterface
    underlying {
      id
    }
    name
    symbol
    decimals
    totalSupply
    maturity
    vaultAddress {
      id
    }
    tokenAddress
    totalSupply
  }
  _meta {
    block {
      number
    }
  }
}
    ` as unknown as DocumentNode<AllTokensQuery, AllTokensQueryVariables>;
export const AllVaultAccountsDocument = gql`
    query AllVaultAccounts($skip: Int) {
  balances(
    where: {token_: {tokenType: VaultShare}, current_: {currentBalance_not: 0}}
    first: 1000
    skip: $skip
  ) {
    account {
      id
    }
    token {
      id
    }
    current {
      currentBalance
    }
  }
}
    ` as unknown as DocumentNode<AllVaultAccountsQuery, AllVaultAccountsQueryVariables>;
export const AllVaultsDocument = gql`
    query AllVaults($skip: Int) {
  vaults(first: 1000, skip: $skip) {
    id
    isWhitelisted
    asset {
      id
    }
    yieldToken {
      id
    }
    vaultToken {
      id
    }
    feeRate
    strategyType
    withdrawRequestManagers {
      id
    }
  }
  _meta {
    block {
      number
    }
  }
}
    ` as unknown as DocumentNode<AllVaultsQuery, AllVaultsQueryVariables>;
export const AllWithdrawRequestManagersDocument = gql`
    query AllWithdrawRequestManagers($skip: Int) {
  withdrawRequestManagers(first: 1000, skip: $skip) {
    id
    yieldToken {
      id
    }
    withdrawToken {
      id
    }
    stakingToken {
      id
    }
  }
  _meta {
    block {
      number
    }
  }
}
    ` as unknown as DocumentNode<AllWithdrawRequestManagersQuery, AllWithdrawRequestManagersQueryVariables>;
export const ExchangeRateValuesDocument = gql`
    query ExchangeRateValues($skip: Int, $oracleId: String, $minTimestamp: Timestamp) {
  exchangeRates(
    where: {oracle: $oracleId, timestamp_gt: $minTimestamp}
    first: 1000
    skip: $skip
    orderBy: timestamp
    orderDirection: desc
  ) {
    timestamp
    rate
  }
}
    ` as unknown as DocumentNode<ExchangeRateValuesQuery, ExchangeRateValuesQueryVariables>;
export const HistoricalOracleValuesDocument = gql`
    query HistoricalOracleValues($skip: Int, $minTimestamp: Timestamp) {
  oracles(where: {matured: false}, first: 1000, skip: $skip) {
    id
    base {
      id
      tokenType
    }
    quote {
      id
      tokenType
      maturity
      underlying {
        id
      }
    }
    decimals
    ratePrecision
    oracleAddress
    oracleType
    latestRate
    historicalRates(
      where: {timestamp_gt: $minTimestamp}
      orderBy: timestamp
      orderDirection: desc
      first: 500
    ) {
      totalSupply
      blockNumber
      timestamp
      rate
    }
  }
  _meta {
    block {
      number
    }
  }
}
    ` as unknown as DocumentNode<HistoricalOracleValuesQuery, HistoricalOracleValuesQueryVariables>;
export const MetaDocument = gql`
    query Meta {
  _meta {
    block {
      number
      hash
      timestamp
    }
    deployment
    hasIndexingErrors
  }
}
    ` as unknown as DocumentNode<MetaQuery, MetaQueryVariables>;
export const NetworkTransactionHistoryDocument = gql`
    query NetworkTransactionHistory($skip: Int!) {
  profitLossLineItems(
    orderBy: timestamp
    orderDirection: desc
    skip: $skip
    first: 1000
  ) {
    timestamp
    blockNumber
    transactionHash
    lineItemType
    token {
      id
    }
    underlyingToken {
      id
    }
    tokenAmount
    underlyingAmountRealized
    underlyingAmountSpot
    realizedPrice
    spotPrice
    impliedFixedRate
  }
}
    ` as unknown as DocumentNode<NetworkTransactionHistoryQuery, NetworkTransactionHistoryQueryVariables>;


















export type Requester<C = {}, E = unknown> = <R, V>(doc: DocumentNode, vars?: V, options?: C) => Promise<R> | AsyncIterable<R>
export function getSdk<C, E>(requester: Requester<C, E>) {
  return {
    AccountBalanceStatement(variables: AccountBalanceStatementQueryVariables, options?: C): Promise<AccountBalanceStatementQuery> {
      return requester<AccountBalanceStatementQuery, AccountBalanceStatementQueryVariables>(AccountBalanceStatementDocument, variables, options) as Promise<AccountBalanceStatementQuery>;
    },
    AccountHoldingsHistorical(variables: AccountHoldingsHistoricalQueryVariables, options?: C): Promise<AccountHoldingsHistoricalQuery> {
      return requester<AccountHoldingsHistoricalQuery, AccountHoldingsHistoricalQueryVariables>(AccountHoldingsHistoricalDocument, variables, options) as Promise<AccountHoldingsHistoricalQuery>;
    },
    AccountIncentiveSnapshots(variables: AccountIncentiveSnapshotsQueryVariables, options?: C): Promise<AccountIncentiveSnapshotsQuery> {
      return requester<AccountIncentiveSnapshotsQuery, AccountIncentiveSnapshotsQueryVariables>(AccountIncentiveSnapshotsDocument, variables, options) as Promise<AccountIncentiveSnapshotsQuery>;
    },
    AccountPositions(variables: AccountPositionsQueryVariables, options?: C): Promise<AccountPositionsQuery> {
      return requester<AccountPositionsQuery, AccountPositionsQueryVariables>(AccountPositionsDocument, variables, options) as Promise<AccountPositionsQuery>;
    },
    AccountTransactionHistory(variables: AccountTransactionHistoryQueryVariables, options?: C): Promise<AccountTransactionHistoryQuery> {
      return requester<AccountTransactionHistoryQuery, AccountTransactionHistoryQueryVariables>(AccountTransactionHistoryDocument, variables, options) as Promise<AccountTransactionHistoryQuery>;
    },
    AllAccounts(variables: AllAccountsQueryVariables, options?: C): Promise<AllAccountsQuery> {
      return requester<AllAccountsQuery, AllAccountsQueryVariables>(AllAccountsDocument, variables, options) as Promise<AllAccountsQuery>;
    },
    AllLendingRouters(variables?: AllLendingRoutersQueryVariables, options?: C): Promise<AllLendingRoutersQuery> {
      return requester<AllLendingRoutersQuery, AllLendingRoutersQueryVariables>(AllLendingRoutersDocument, variables, options) as Promise<AllLendingRoutersQuery>;
    },
    AllOracles(variables: AllOraclesQueryVariables, options?: C): Promise<AllOraclesQuery> {
      return requester<AllOraclesQuery, AllOraclesQueryVariables>(AllOraclesDocument, variables, options) as Promise<AllOraclesQuery>;
    },
    AllOraclesByBlockNumber(variables: AllOraclesByBlockNumberQueryVariables, options?: C): Promise<AllOraclesByBlockNumberQuery> {
      return requester<AllOraclesByBlockNumberQuery, AllOraclesByBlockNumberQueryVariables>(AllOraclesByBlockNumberDocument, variables, options) as Promise<AllOraclesByBlockNumberQuery>;
    },
    AllTokens(variables?: AllTokensQueryVariables, options?: C): Promise<AllTokensQuery> {
      return requester<AllTokensQuery, AllTokensQueryVariables>(AllTokensDocument, variables, options) as Promise<AllTokensQuery>;
    },
    AllVaultAccounts(variables?: AllVaultAccountsQueryVariables, options?: C): Promise<AllVaultAccountsQuery> {
      return requester<AllVaultAccountsQuery, AllVaultAccountsQueryVariables>(AllVaultAccountsDocument, variables, options) as Promise<AllVaultAccountsQuery>;
    },
    AllVaults(variables?: AllVaultsQueryVariables, options?: C): Promise<AllVaultsQuery> {
      return requester<AllVaultsQuery, AllVaultsQueryVariables>(AllVaultsDocument, variables, options) as Promise<AllVaultsQuery>;
    },
    AllWithdrawRequestManagers(variables?: AllWithdrawRequestManagersQueryVariables, options?: C): Promise<AllWithdrawRequestManagersQuery> {
      return requester<AllWithdrawRequestManagersQuery, AllWithdrawRequestManagersQueryVariables>(AllWithdrawRequestManagersDocument, variables, options) as Promise<AllWithdrawRequestManagersQuery>;
    },
    ExchangeRateValues(variables?: ExchangeRateValuesQueryVariables, options?: C): Promise<ExchangeRateValuesQuery> {
      return requester<ExchangeRateValuesQuery, ExchangeRateValuesQueryVariables>(ExchangeRateValuesDocument, variables, options) as Promise<ExchangeRateValuesQuery>;
    },
    HistoricalOracleValues(variables?: HistoricalOracleValuesQueryVariables, options?: C): Promise<HistoricalOracleValuesQuery> {
      return requester<HistoricalOracleValuesQuery, HistoricalOracleValuesQueryVariables>(HistoricalOracleValuesDocument, variables, options) as Promise<HistoricalOracleValuesQuery>;
    },
    Meta(variables?: MetaQueryVariables, options?: C): Promise<MetaQuery> {
      return requester<MetaQuery, MetaQueryVariables>(MetaDocument, variables, options) as Promise<MetaQuery>;
    },
    NetworkTransactionHistory(variables: NetworkTransactionHistoryQueryVariables, options?: C): Promise<NetworkTransactionHistoryQuery> {
      return requester<NetworkTransactionHistoryQuery, NetworkTransactionHistoryQueryVariables>(NetworkTransactionHistoryDocument, variables, options) as Promise<NetworkTransactionHistoryQuery>;
    }
  };
}
export type Sdk = ReturnType<typeof getSdk>;