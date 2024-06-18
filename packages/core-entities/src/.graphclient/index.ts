// @ts-nocheck
import {
  GraphQLResolveInfo,
  SelectionSetNode,
  FieldNode,
  GraphQLScalarType,
  GraphQLScalarTypeConfig,
} from 'graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
import { gql } from '@graphql-mesh/utils';

import type { GetMeshOptions } from '@graphql-mesh/runtime';
import type { YamlConfig } from '@graphql-mesh/types';
import { PubSub } from '@graphql-mesh/utils';
import { DefaultLogger } from '@graphql-mesh/utils';
import MeshCache from '@graphql-mesh/cache-localforage';
import { fetch as fetchFn } from '@whatwg-node/fetch';

import { MeshResolvedSource } from '@graphql-mesh/runtime';
import { MeshTransform, MeshPlugin } from '@graphql-mesh/types';
import GraphqlHandler from '@graphql-mesh/graphql';
import BareMerger from '@graphql-mesh/merger-bare';
import { printWithCache } from '@graphql-mesh/utils';
import { createMeshHTTPHandler, MeshHTTPHandler } from '@graphql-mesh/http';
import {
  getMesh,
  ExecuteMeshFn,
  SubscribeMeshFn,
  MeshContext as BaseMeshContext,
  MeshInstance,
} from '@graphql-mesh/runtime';
import { MeshStore, FsStoreStorageAdapter } from '@graphql-mesh/store';
import { path as pathModule } from '@graphql-mesh/cross-helpers';
import { ImportFn } from '@graphql-mesh/types';
import type { NotionalV3Types } from './sources/NotionalV3/types';
import * as importedModule$0 from './sources/NotionalV3/introspectionSchema';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>;
};
export type RequireFields<T, K extends keyof T> = Omit<T, K> & {
  [P in K]-?: NonNullable<T[P]>;
};

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
  allowPrimeBorrow?: Maybe<Scalars['Boolean']>;
  nextSettleTime?: Maybe<Scalars['BigInt']>;
  hasPortfolioAssetDebt?: Maybe<Scalars['Boolean']>;
  hasCashDebt?: Maybe<Scalars['Boolean']>;
  bitmapCurrencyId?: Maybe<Scalars['Int']>;
  /** All current balances linked to this account */
  balances?: Maybe<Array<Balance>>;
  /** All historical token transfers linked to this account */
  transfersFrom?: Maybe<Array<Transfer>>;
  transfersTo?: Maybe<Array<Transfer>>;
  profitLossLineItems?: Maybe<Array<ProfitLossLineItem>>;
};

export type AccountbalancesArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Balance_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<Balance_filter>;
};

export type AccounttransfersFromArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Transfer_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<Transfer_filter>;
};

export type AccounttransfersToArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Transfer_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<Transfer_filter>;
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
  allowPrimeBorrow?: InputMaybe<Scalars['Boolean']>;
  allowPrimeBorrow_not?: InputMaybe<Scalars['Boolean']>;
  allowPrimeBorrow_in?: InputMaybe<Array<Scalars['Boolean']>>;
  allowPrimeBorrow_not_in?: InputMaybe<Array<Scalars['Boolean']>>;
  nextSettleTime?: InputMaybe<Scalars['BigInt']>;
  nextSettleTime_not?: InputMaybe<Scalars['BigInt']>;
  nextSettleTime_gt?: InputMaybe<Scalars['BigInt']>;
  nextSettleTime_lt?: InputMaybe<Scalars['BigInt']>;
  nextSettleTime_gte?: InputMaybe<Scalars['BigInt']>;
  nextSettleTime_lte?: InputMaybe<Scalars['BigInt']>;
  nextSettleTime_in?: InputMaybe<Array<Scalars['BigInt']>>;
  nextSettleTime_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  hasPortfolioAssetDebt?: InputMaybe<Scalars['Boolean']>;
  hasPortfolioAssetDebt_not?: InputMaybe<Scalars['Boolean']>;
  hasPortfolioAssetDebt_in?: InputMaybe<Array<Scalars['Boolean']>>;
  hasPortfolioAssetDebt_not_in?: InputMaybe<Array<Scalars['Boolean']>>;
  hasCashDebt?: InputMaybe<Scalars['Boolean']>;
  hasCashDebt_not?: InputMaybe<Scalars['Boolean']>;
  hasCashDebt_in?: InputMaybe<Array<Scalars['Boolean']>>;
  hasCashDebt_not_in?: InputMaybe<Array<Scalars['Boolean']>>;
  bitmapCurrencyId?: InputMaybe<Scalars['Int']>;
  bitmapCurrencyId_not?: InputMaybe<Scalars['Int']>;
  bitmapCurrencyId_gt?: InputMaybe<Scalars['Int']>;
  bitmapCurrencyId_lt?: InputMaybe<Scalars['Int']>;
  bitmapCurrencyId_gte?: InputMaybe<Scalars['Int']>;
  bitmapCurrencyId_lte?: InputMaybe<Scalars['Int']>;
  bitmapCurrencyId_in?: InputMaybe<Array<Scalars['Int']>>;
  bitmapCurrencyId_not_in?: InputMaybe<Array<Scalars['Int']>>;
  balances_?: InputMaybe<Balance_filter>;
  transfersFrom_?: InputMaybe<Transfer_filter>;
  transfersTo_?: InputMaybe<Transfer_filter>;
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
  | 'allowPrimeBorrow'
  | 'nextSettleTime'
  | 'hasPortfolioAssetDebt'
  | 'hasCashDebt'
  | 'bitmapCurrencyId'
  | 'balances'
  | 'transfersFrom'
  | 'transfersTo'
  | 'profitLossLineItems';

export type ActiveMarket = {
  /** Currency ID */
  id: Scalars['ID'];
  lastUpdateBlockNumber: Scalars['BigInt'];
  lastUpdateTimestamp: Scalars['Int'];
  lastUpdateTransaction?: Maybe<Transaction>;
  underlying: Token;
  pCashMarket: PrimeCashMarket;
  fCashMarkets: Array<fCashMarket>;
};

export type ActiveMarketfCashMarketsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<fCashMarket_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<fCashMarket_filter>;
};

export type ActiveMarket_filter = {
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
  lastUpdateTransaction?: InputMaybe<Scalars['String']>;
  lastUpdateTransaction_not?: InputMaybe<Scalars['String']>;
  lastUpdateTransaction_gt?: InputMaybe<Scalars['String']>;
  lastUpdateTransaction_lt?: InputMaybe<Scalars['String']>;
  lastUpdateTransaction_gte?: InputMaybe<Scalars['String']>;
  lastUpdateTransaction_lte?: InputMaybe<Scalars['String']>;
  lastUpdateTransaction_in?: InputMaybe<Array<Scalars['String']>>;
  lastUpdateTransaction_not_in?: InputMaybe<Array<Scalars['String']>>;
  lastUpdateTransaction_contains?: InputMaybe<Scalars['String']>;
  lastUpdateTransaction_contains_nocase?: InputMaybe<Scalars['String']>;
  lastUpdateTransaction_not_contains?: InputMaybe<Scalars['String']>;
  lastUpdateTransaction_not_contains_nocase?: InputMaybe<Scalars['String']>;
  lastUpdateTransaction_starts_with?: InputMaybe<Scalars['String']>;
  lastUpdateTransaction_starts_with_nocase?: InputMaybe<Scalars['String']>;
  lastUpdateTransaction_not_starts_with?: InputMaybe<Scalars['String']>;
  lastUpdateTransaction_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  lastUpdateTransaction_ends_with?: InputMaybe<Scalars['String']>;
  lastUpdateTransaction_ends_with_nocase?: InputMaybe<Scalars['String']>;
  lastUpdateTransaction_not_ends_with?: InputMaybe<Scalars['String']>;
  lastUpdateTransaction_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  lastUpdateTransaction_?: InputMaybe<Transaction_filter>;
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
  pCashMarket?: InputMaybe<Scalars['String']>;
  pCashMarket_not?: InputMaybe<Scalars['String']>;
  pCashMarket_gt?: InputMaybe<Scalars['String']>;
  pCashMarket_lt?: InputMaybe<Scalars['String']>;
  pCashMarket_gte?: InputMaybe<Scalars['String']>;
  pCashMarket_lte?: InputMaybe<Scalars['String']>;
  pCashMarket_in?: InputMaybe<Array<Scalars['String']>>;
  pCashMarket_not_in?: InputMaybe<Array<Scalars['String']>>;
  pCashMarket_contains?: InputMaybe<Scalars['String']>;
  pCashMarket_contains_nocase?: InputMaybe<Scalars['String']>;
  pCashMarket_not_contains?: InputMaybe<Scalars['String']>;
  pCashMarket_not_contains_nocase?: InputMaybe<Scalars['String']>;
  pCashMarket_starts_with?: InputMaybe<Scalars['String']>;
  pCashMarket_starts_with_nocase?: InputMaybe<Scalars['String']>;
  pCashMarket_not_starts_with?: InputMaybe<Scalars['String']>;
  pCashMarket_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  pCashMarket_ends_with?: InputMaybe<Scalars['String']>;
  pCashMarket_ends_with_nocase?: InputMaybe<Scalars['String']>;
  pCashMarket_not_ends_with?: InputMaybe<Scalars['String']>;
  pCashMarket_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  pCashMarket_?: InputMaybe<PrimeCashMarket_filter>;
  fCashMarkets?: InputMaybe<Array<Scalars['String']>>;
  fCashMarkets_not?: InputMaybe<Array<Scalars['String']>>;
  fCashMarkets_contains?: InputMaybe<Array<Scalars['String']>>;
  fCashMarkets_contains_nocase?: InputMaybe<Array<Scalars['String']>>;
  fCashMarkets_not_contains?: InputMaybe<Array<Scalars['String']>>;
  fCashMarkets_not_contains_nocase?: InputMaybe<Array<Scalars['String']>>;
  fCashMarkets_?: InputMaybe<fCashMarket_filter>;
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<ActiveMarket_filter>>>;
  or?: InputMaybe<Array<InputMaybe<ActiveMarket_filter>>>;
};

export type ActiveMarket_orderBy =
  | 'id'
  | 'lastUpdateBlockNumber'
  | 'lastUpdateTimestamp'
  | 'lastUpdateTransaction'
  | 'lastUpdateTransaction__id'
  | 'lastUpdateTransaction__blockNumber'
  | 'lastUpdateTransaction__timestamp'
  | 'lastUpdateTransaction__transactionHash'
  | 'lastUpdateTransaction___nextStartIndex'
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
  | 'underlying__currencyId'
  | 'underlying__name'
  | 'underlying__symbol'
  | 'underlying__decimals'
  | 'underlying__precision'
  | 'underlying__totalSupply'
  | 'underlying__hasTransferFee'
  | 'underlying__isfCashDebt'
  | 'underlying__maturity'
  | 'underlying__vaultAddress'
  | 'underlying__tokenAddress'
  | 'pCashMarket'
  | 'pCashMarket__id'
  | 'pCashMarket__lastUpdateBlockNumber'
  | 'pCashMarket__lastUpdateTimestamp'
  | 'fCashMarkets';

export type Aggregation_interval = 'hour' | 'day';

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
  snapshots?: Maybe<Array<BalanceSnapshot>>;
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
  transaction: Transaction;
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
  /** Total profit or loss at the snapshot since balance inception */
  totalProfitAndLossAtSnapshot: Scalars['BigInt'];
  /** Portion of the PnL due to market movements in price */
  totalILAndFeesAtSnapshot: Scalars['BigInt'];
  /** Portion of the PnL due to interest accrual */
  totalInterestAccrualAtSnapshot: Scalars['BigInt'];
  /** Implied Fixed Rate for fCash balances */
  impliedFixedRate?: Maybe<Scalars['BigInt']>;
  /** Cumulative balance used for internal PnL calculations */
  _accumulatedBalance: Scalars['BigInt'];
  /** Cumulative realized cost for internal PnL calculations */
  _accumulatedCostRealized: Scalars['BigInt'];
  /** Internal interest accumulator */
  _lastInterestAccumulator: Scalars['BigInt'];
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
  transaction?: InputMaybe<Scalars['String']>;
  transaction_not?: InputMaybe<Scalars['String']>;
  transaction_gt?: InputMaybe<Scalars['String']>;
  transaction_lt?: InputMaybe<Scalars['String']>;
  transaction_gte?: InputMaybe<Scalars['String']>;
  transaction_lte?: InputMaybe<Scalars['String']>;
  transaction_in?: InputMaybe<Array<Scalars['String']>>;
  transaction_not_in?: InputMaybe<Array<Scalars['String']>>;
  transaction_contains?: InputMaybe<Scalars['String']>;
  transaction_contains_nocase?: InputMaybe<Scalars['String']>;
  transaction_not_contains?: InputMaybe<Scalars['String']>;
  transaction_not_contains_nocase?: InputMaybe<Scalars['String']>;
  transaction_starts_with?: InputMaybe<Scalars['String']>;
  transaction_starts_with_nocase?: InputMaybe<Scalars['String']>;
  transaction_not_starts_with?: InputMaybe<Scalars['String']>;
  transaction_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  transaction_ends_with?: InputMaybe<Scalars['String']>;
  transaction_ends_with_nocase?: InputMaybe<Scalars['String']>;
  transaction_not_ends_with?: InputMaybe<Scalars['String']>;
  transaction_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  transaction_?: InputMaybe<Transaction_filter>;
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
  totalProfitAndLossAtSnapshot?: InputMaybe<Scalars['BigInt']>;
  totalProfitAndLossAtSnapshot_not?: InputMaybe<Scalars['BigInt']>;
  totalProfitAndLossAtSnapshot_gt?: InputMaybe<Scalars['BigInt']>;
  totalProfitAndLossAtSnapshot_lt?: InputMaybe<Scalars['BigInt']>;
  totalProfitAndLossAtSnapshot_gte?: InputMaybe<Scalars['BigInt']>;
  totalProfitAndLossAtSnapshot_lte?: InputMaybe<Scalars['BigInt']>;
  totalProfitAndLossAtSnapshot_in?: InputMaybe<Array<Scalars['BigInt']>>;
  totalProfitAndLossAtSnapshot_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  totalILAndFeesAtSnapshot?: InputMaybe<Scalars['BigInt']>;
  totalILAndFeesAtSnapshot_not?: InputMaybe<Scalars['BigInt']>;
  totalILAndFeesAtSnapshot_gt?: InputMaybe<Scalars['BigInt']>;
  totalILAndFeesAtSnapshot_lt?: InputMaybe<Scalars['BigInt']>;
  totalILAndFeesAtSnapshot_gte?: InputMaybe<Scalars['BigInt']>;
  totalILAndFeesAtSnapshot_lte?: InputMaybe<Scalars['BigInt']>;
  totalILAndFeesAtSnapshot_in?: InputMaybe<Array<Scalars['BigInt']>>;
  totalILAndFeesAtSnapshot_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  totalInterestAccrualAtSnapshot?: InputMaybe<Scalars['BigInt']>;
  totalInterestAccrualAtSnapshot_not?: InputMaybe<Scalars['BigInt']>;
  totalInterestAccrualAtSnapshot_gt?: InputMaybe<Scalars['BigInt']>;
  totalInterestAccrualAtSnapshot_lt?: InputMaybe<Scalars['BigInt']>;
  totalInterestAccrualAtSnapshot_gte?: InputMaybe<Scalars['BigInt']>;
  totalInterestAccrualAtSnapshot_lte?: InputMaybe<Scalars['BigInt']>;
  totalInterestAccrualAtSnapshot_in?: InputMaybe<Array<Scalars['BigInt']>>;
  totalInterestAccrualAtSnapshot_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
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
  | 'transaction'
  | 'transaction__id'
  | 'transaction__blockNumber'
  | 'transaction__timestamp'
  | 'transaction__transactionHash'
  | 'transaction___nextStartIndex'
  | 'previousSnapshot'
  | 'previousSnapshot__id'
  | 'previousSnapshot__blockNumber'
  | 'previousSnapshot__timestamp'
  | 'previousSnapshot__currentBalance'
  | 'previousSnapshot__previousBalance'
  | 'previousSnapshot__adjustedCostBasis'
  | 'previousSnapshot__currentProfitAndLossAtSnapshot'
  | 'previousSnapshot__totalProfitAndLossAtSnapshot'
  | 'previousSnapshot__totalILAndFeesAtSnapshot'
  | 'previousSnapshot__totalInterestAccrualAtSnapshot'
  | 'previousSnapshot__impliedFixedRate'
  | 'previousSnapshot___accumulatedBalance'
  | 'previousSnapshot___accumulatedCostRealized'
  | 'previousSnapshot___lastInterestAccumulator'
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
  | 'totalProfitAndLossAtSnapshot'
  | 'totalILAndFeesAtSnapshot'
  | 'totalInterestAccrualAtSnapshot'
  | 'impliedFixedRate'
  | '_accumulatedBalance'
  | '_accumulatedCostRealized'
  | '_lastInterestAccumulator'
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
  | 'token__currencyId'
  | 'token__name'
  | 'token__symbol'
  | 'token__decimals'
  | 'token__precision'
  | 'token__totalSupply'
  | 'token__hasTransferFee'
  | 'token__isfCashDebt'
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
  | 'account__allowPrimeBorrow'
  | 'account__nextSettleTime'
  | 'account__hasPortfolioAssetDebt'
  | 'account__hasCashDebt'
  | 'account__bitmapCurrencyId'
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
  | 'current__currentBalance'
  | 'current__previousBalance'
  | 'current__adjustedCostBasis'
  | 'current__currentProfitAndLossAtSnapshot'
  | 'current__totalProfitAndLossAtSnapshot'
  | 'current__totalILAndFeesAtSnapshot'
  | 'current__totalInterestAccrualAtSnapshot'
  | 'current__impliedFixedRate'
  | 'current___accumulatedBalance'
  | 'current___accumulatedCostRealized'
  | 'current___lastInterestAccumulator'
  | 'snapshots';

export type BlockChangedFilter = {
  number_gte: Scalars['Int'];
};

export type Block_height = {
  hash?: InputMaybe<Scalars['Bytes']>;
  number?: InputMaybe<Scalars['Int']>;
  number_gte?: InputMaybe<Scalars['Int']>;
};

export type CurrencyConfiguration = {
  /** Currency ID */
  id: Scalars['ID'];
  lastUpdateBlockNumber: Scalars['BigInt'];
  lastUpdateTimestamp: Scalars['Int'];
  lastUpdateTransactionHash: Scalars['Bytes'];
  underlying?: Maybe<Token>;
  pCash?: Maybe<Token>;
  /** Some currencies will not allow prime debt */
  pDebt?: Maybe<Token>;
  /** Maximum supply in underlying terms (in 8 decimals) */
  maxUnderlyingSupply?: Maybe<Scalars['BigInt']>;
  /** Maximum utilization of the max underlying supply by prime debt */
  maxPrimeDebtUtilization?: Maybe<Scalars['BigInt']>;
  /** Exchange Rate Parameters */
  collateralHaircut?: Maybe<Scalars['Int']>;
  debtBuffer?: Maybe<Scalars['Int']>;
  liquidationDiscount?: Maybe<Scalars['Int']>;
  /** Prime Cash Parameters */
  primeCashRateOracleTimeWindowSeconds?: Maybe<Scalars['Int']>;
  primeCashHoldingsOracle?: Maybe<Scalars['Bytes']>;
  primeCashCurve?: Maybe<InterestRateCurve>;
  primeDebtAllowed?: Maybe<Scalars['Boolean']>;
  /** Time window in seconds that the rate oracle will be averaged over */
  fCashRateOracleTimeWindowSeconds?: Maybe<Scalars['Int']>;
  /** Share of the fees given to the protocol, denominated in percentage */
  fCashReserveFeeSharePercent?: Maybe<Scalars['Int']>;
  /** Debt buffer specified in basis points */
  fCashDebtBufferBasisPoints?: Maybe<Scalars['Int']>;
  /** fCash haircut specified in basis points */
  fCashHaircutBasisPoints?: Maybe<Scalars['Int']>;
  /** Minimum oracle rate applied to fCash haircut */
  fCashMinOracleRate?: Maybe<Scalars['Int']>;
  /** Maximum oracle rate applied to fCash buffer */
  fCashMaxOracleRate?: Maybe<Scalars['Int']>;
  /** Maximum discount factor applied to fCash haircut */
  fCashMaxDiscountFactor?: Maybe<Scalars['Int']>;
  /** Discount on fCash given to the liquidator in basis points */
  fCashLiquidationHaircutBasisPoints?: Maybe<Scalars['Int']>;
  /** Discount on negative fCash given to the liquidator in basis points */
  fCashLiquidationDebtBufferBasisPoints?: Maybe<Scalars['Int']>;
  /** Current set of interest rate curves for the fCash markets */
  fCashActiveCurves?: Maybe<Array<InterestRateCurve>>;
  /** Next set of interest rate curves for the fCash markets */
  fCashNextCurves?: Maybe<Array<InterestRateCurve>>;
  /** The minimum threshold of the reserve before they can be harvested */
  treasuryReserveBuffer?: Maybe<Scalars['BigInt']>;
  /** Addresses of potential prime cash holdings */
  primeCashHoldings?: Maybe<Array<Scalars['Bytes']>>;
  /** Proportion of deposits that go into each corresponding market */
  depositShares?: Maybe<Array<Scalars['Int']>>;
  /** Maximum market proportion that the nToken will provide liquidity at */
  leverageThresholds?: Maybe<Array<Scalars['Int']>>;
  /** Market proportions used during market initialization */
  proportions?: Maybe<Array<Scalars['Int']>>;
  deprecated_anchorRates?: Maybe<Array<Scalars['Int']>>;
  /** Residual purchase incentive in basis points */
  residualPurchaseIncentiveBasisPoints?: Maybe<Scalars['Int']>;
  /** Seconds until residuals become available to purchase after market initialization */
  residualPurchaseTimeBufferSeconds?: Maybe<Scalars['Int']>;
  /** Basis points of cash withholding for negative fCash */
  cashWithholdingBufferBasisPoints?: Maybe<Scalars['Int']>;
  /** Percentage of the nToken PV that is used during free collateral */
  pvHaircutPercentage?: Maybe<Scalars['Int']>;
  /** Discount on nToken PV given to liquidators */
  liquidationHaircutPercentage?: Maybe<Scalars['Int']>;
  /** Maximum valuation deviation in basis points for nToken minting */
  maxMintDeviationBasisPoints?: Maybe<Scalars['Int']>;
  incentives?: Maybe<Incentive>;
  externalLending?: Maybe<ExternalLending>;
};

export type CurrencyConfigurationfCashActiveCurvesArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<InterestRateCurve_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<InterestRateCurve_filter>;
};

export type CurrencyConfigurationfCashNextCurvesArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<InterestRateCurve_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<InterestRateCurve_filter>;
};

export type CurrencyConfiguration_filter = {
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
  pCash?: InputMaybe<Scalars['String']>;
  pCash_not?: InputMaybe<Scalars['String']>;
  pCash_gt?: InputMaybe<Scalars['String']>;
  pCash_lt?: InputMaybe<Scalars['String']>;
  pCash_gte?: InputMaybe<Scalars['String']>;
  pCash_lte?: InputMaybe<Scalars['String']>;
  pCash_in?: InputMaybe<Array<Scalars['String']>>;
  pCash_not_in?: InputMaybe<Array<Scalars['String']>>;
  pCash_contains?: InputMaybe<Scalars['String']>;
  pCash_contains_nocase?: InputMaybe<Scalars['String']>;
  pCash_not_contains?: InputMaybe<Scalars['String']>;
  pCash_not_contains_nocase?: InputMaybe<Scalars['String']>;
  pCash_starts_with?: InputMaybe<Scalars['String']>;
  pCash_starts_with_nocase?: InputMaybe<Scalars['String']>;
  pCash_not_starts_with?: InputMaybe<Scalars['String']>;
  pCash_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  pCash_ends_with?: InputMaybe<Scalars['String']>;
  pCash_ends_with_nocase?: InputMaybe<Scalars['String']>;
  pCash_not_ends_with?: InputMaybe<Scalars['String']>;
  pCash_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  pCash_?: InputMaybe<Token_filter>;
  pDebt?: InputMaybe<Scalars['String']>;
  pDebt_not?: InputMaybe<Scalars['String']>;
  pDebt_gt?: InputMaybe<Scalars['String']>;
  pDebt_lt?: InputMaybe<Scalars['String']>;
  pDebt_gte?: InputMaybe<Scalars['String']>;
  pDebt_lte?: InputMaybe<Scalars['String']>;
  pDebt_in?: InputMaybe<Array<Scalars['String']>>;
  pDebt_not_in?: InputMaybe<Array<Scalars['String']>>;
  pDebt_contains?: InputMaybe<Scalars['String']>;
  pDebt_contains_nocase?: InputMaybe<Scalars['String']>;
  pDebt_not_contains?: InputMaybe<Scalars['String']>;
  pDebt_not_contains_nocase?: InputMaybe<Scalars['String']>;
  pDebt_starts_with?: InputMaybe<Scalars['String']>;
  pDebt_starts_with_nocase?: InputMaybe<Scalars['String']>;
  pDebt_not_starts_with?: InputMaybe<Scalars['String']>;
  pDebt_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  pDebt_ends_with?: InputMaybe<Scalars['String']>;
  pDebt_ends_with_nocase?: InputMaybe<Scalars['String']>;
  pDebt_not_ends_with?: InputMaybe<Scalars['String']>;
  pDebt_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  pDebt_?: InputMaybe<Token_filter>;
  maxUnderlyingSupply?: InputMaybe<Scalars['BigInt']>;
  maxUnderlyingSupply_not?: InputMaybe<Scalars['BigInt']>;
  maxUnderlyingSupply_gt?: InputMaybe<Scalars['BigInt']>;
  maxUnderlyingSupply_lt?: InputMaybe<Scalars['BigInt']>;
  maxUnderlyingSupply_gte?: InputMaybe<Scalars['BigInt']>;
  maxUnderlyingSupply_lte?: InputMaybe<Scalars['BigInt']>;
  maxUnderlyingSupply_in?: InputMaybe<Array<Scalars['BigInt']>>;
  maxUnderlyingSupply_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  maxPrimeDebtUtilization?: InputMaybe<Scalars['BigInt']>;
  maxPrimeDebtUtilization_not?: InputMaybe<Scalars['BigInt']>;
  maxPrimeDebtUtilization_gt?: InputMaybe<Scalars['BigInt']>;
  maxPrimeDebtUtilization_lt?: InputMaybe<Scalars['BigInt']>;
  maxPrimeDebtUtilization_gte?: InputMaybe<Scalars['BigInt']>;
  maxPrimeDebtUtilization_lte?: InputMaybe<Scalars['BigInt']>;
  maxPrimeDebtUtilization_in?: InputMaybe<Array<Scalars['BigInt']>>;
  maxPrimeDebtUtilization_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  collateralHaircut?: InputMaybe<Scalars['Int']>;
  collateralHaircut_not?: InputMaybe<Scalars['Int']>;
  collateralHaircut_gt?: InputMaybe<Scalars['Int']>;
  collateralHaircut_lt?: InputMaybe<Scalars['Int']>;
  collateralHaircut_gte?: InputMaybe<Scalars['Int']>;
  collateralHaircut_lte?: InputMaybe<Scalars['Int']>;
  collateralHaircut_in?: InputMaybe<Array<Scalars['Int']>>;
  collateralHaircut_not_in?: InputMaybe<Array<Scalars['Int']>>;
  debtBuffer?: InputMaybe<Scalars['Int']>;
  debtBuffer_not?: InputMaybe<Scalars['Int']>;
  debtBuffer_gt?: InputMaybe<Scalars['Int']>;
  debtBuffer_lt?: InputMaybe<Scalars['Int']>;
  debtBuffer_gte?: InputMaybe<Scalars['Int']>;
  debtBuffer_lte?: InputMaybe<Scalars['Int']>;
  debtBuffer_in?: InputMaybe<Array<Scalars['Int']>>;
  debtBuffer_not_in?: InputMaybe<Array<Scalars['Int']>>;
  liquidationDiscount?: InputMaybe<Scalars['Int']>;
  liquidationDiscount_not?: InputMaybe<Scalars['Int']>;
  liquidationDiscount_gt?: InputMaybe<Scalars['Int']>;
  liquidationDiscount_lt?: InputMaybe<Scalars['Int']>;
  liquidationDiscount_gte?: InputMaybe<Scalars['Int']>;
  liquidationDiscount_lte?: InputMaybe<Scalars['Int']>;
  liquidationDiscount_in?: InputMaybe<Array<Scalars['Int']>>;
  liquidationDiscount_not_in?: InputMaybe<Array<Scalars['Int']>>;
  primeCashRateOracleTimeWindowSeconds?: InputMaybe<Scalars['Int']>;
  primeCashRateOracleTimeWindowSeconds_not?: InputMaybe<Scalars['Int']>;
  primeCashRateOracleTimeWindowSeconds_gt?: InputMaybe<Scalars['Int']>;
  primeCashRateOracleTimeWindowSeconds_lt?: InputMaybe<Scalars['Int']>;
  primeCashRateOracleTimeWindowSeconds_gte?: InputMaybe<Scalars['Int']>;
  primeCashRateOracleTimeWindowSeconds_lte?: InputMaybe<Scalars['Int']>;
  primeCashRateOracleTimeWindowSeconds_in?: InputMaybe<Array<Scalars['Int']>>;
  primeCashRateOracleTimeWindowSeconds_not_in?: InputMaybe<
    Array<Scalars['Int']>
  >;
  primeCashHoldingsOracle?: InputMaybe<Scalars['Bytes']>;
  primeCashHoldingsOracle_not?: InputMaybe<Scalars['Bytes']>;
  primeCashHoldingsOracle_gt?: InputMaybe<Scalars['Bytes']>;
  primeCashHoldingsOracle_lt?: InputMaybe<Scalars['Bytes']>;
  primeCashHoldingsOracle_gte?: InputMaybe<Scalars['Bytes']>;
  primeCashHoldingsOracle_lte?: InputMaybe<Scalars['Bytes']>;
  primeCashHoldingsOracle_in?: InputMaybe<Array<Scalars['Bytes']>>;
  primeCashHoldingsOracle_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  primeCashHoldingsOracle_contains?: InputMaybe<Scalars['Bytes']>;
  primeCashHoldingsOracle_not_contains?: InputMaybe<Scalars['Bytes']>;
  primeCashCurve?: InputMaybe<Scalars['String']>;
  primeCashCurve_not?: InputMaybe<Scalars['String']>;
  primeCashCurve_gt?: InputMaybe<Scalars['String']>;
  primeCashCurve_lt?: InputMaybe<Scalars['String']>;
  primeCashCurve_gte?: InputMaybe<Scalars['String']>;
  primeCashCurve_lte?: InputMaybe<Scalars['String']>;
  primeCashCurve_in?: InputMaybe<Array<Scalars['String']>>;
  primeCashCurve_not_in?: InputMaybe<Array<Scalars['String']>>;
  primeCashCurve_contains?: InputMaybe<Scalars['String']>;
  primeCashCurve_contains_nocase?: InputMaybe<Scalars['String']>;
  primeCashCurve_not_contains?: InputMaybe<Scalars['String']>;
  primeCashCurve_not_contains_nocase?: InputMaybe<Scalars['String']>;
  primeCashCurve_starts_with?: InputMaybe<Scalars['String']>;
  primeCashCurve_starts_with_nocase?: InputMaybe<Scalars['String']>;
  primeCashCurve_not_starts_with?: InputMaybe<Scalars['String']>;
  primeCashCurve_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  primeCashCurve_ends_with?: InputMaybe<Scalars['String']>;
  primeCashCurve_ends_with_nocase?: InputMaybe<Scalars['String']>;
  primeCashCurve_not_ends_with?: InputMaybe<Scalars['String']>;
  primeCashCurve_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  primeCashCurve_?: InputMaybe<InterestRateCurve_filter>;
  primeDebtAllowed?: InputMaybe<Scalars['Boolean']>;
  primeDebtAllowed_not?: InputMaybe<Scalars['Boolean']>;
  primeDebtAllowed_in?: InputMaybe<Array<Scalars['Boolean']>>;
  primeDebtAllowed_not_in?: InputMaybe<Array<Scalars['Boolean']>>;
  fCashRateOracleTimeWindowSeconds?: InputMaybe<Scalars['Int']>;
  fCashRateOracleTimeWindowSeconds_not?: InputMaybe<Scalars['Int']>;
  fCashRateOracleTimeWindowSeconds_gt?: InputMaybe<Scalars['Int']>;
  fCashRateOracleTimeWindowSeconds_lt?: InputMaybe<Scalars['Int']>;
  fCashRateOracleTimeWindowSeconds_gte?: InputMaybe<Scalars['Int']>;
  fCashRateOracleTimeWindowSeconds_lte?: InputMaybe<Scalars['Int']>;
  fCashRateOracleTimeWindowSeconds_in?: InputMaybe<Array<Scalars['Int']>>;
  fCashRateOracleTimeWindowSeconds_not_in?: InputMaybe<Array<Scalars['Int']>>;
  fCashReserveFeeSharePercent?: InputMaybe<Scalars['Int']>;
  fCashReserveFeeSharePercent_not?: InputMaybe<Scalars['Int']>;
  fCashReserveFeeSharePercent_gt?: InputMaybe<Scalars['Int']>;
  fCashReserveFeeSharePercent_lt?: InputMaybe<Scalars['Int']>;
  fCashReserveFeeSharePercent_gte?: InputMaybe<Scalars['Int']>;
  fCashReserveFeeSharePercent_lte?: InputMaybe<Scalars['Int']>;
  fCashReserveFeeSharePercent_in?: InputMaybe<Array<Scalars['Int']>>;
  fCashReserveFeeSharePercent_not_in?: InputMaybe<Array<Scalars['Int']>>;
  fCashDebtBufferBasisPoints?: InputMaybe<Scalars['Int']>;
  fCashDebtBufferBasisPoints_not?: InputMaybe<Scalars['Int']>;
  fCashDebtBufferBasisPoints_gt?: InputMaybe<Scalars['Int']>;
  fCashDebtBufferBasisPoints_lt?: InputMaybe<Scalars['Int']>;
  fCashDebtBufferBasisPoints_gte?: InputMaybe<Scalars['Int']>;
  fCashDebtBufferBasisPoints_lte?: InputMaybe<Scalars['Int']>;
  fCashDebtBufferBasisPoints_in?: InputMaybe<Array<Scalars['Int']>>;
  fCashDebtBufferBasisPoints_not_in?: InputMaybe<Array<Scalars['Int']>>;
  fCashHaircutBasisPoints?: InputMaybe<Scalars['Int']>;
  fCashHaircutBasisPoints_not?: InputMaybe<Scalars['Int']>;
  fCashHaircutBasisPoints_gt?: InputMaybe<Scalars['Int']>;
  fCashHaircutBasisPoints_lt?: InputMaybe<Scalars['Int']>;
  fCashHaircutBasisPoints_gte?: InputMaybe<Scalars['Int']>;
  fCashHaircutBasisPoints_lte?: InputMaybe<Scalars['Int']>;
  fCashHaircutBasisPoints_in?: InputMaybe<Array<Scalars['Int']>>;
  fCashHaircutBasisPoints_not_in?: InputMaybe<Array<Scalars['Int']>>;
  fCashMinOracleRate?: InputMaybe<Scalars['Int']>;
  fCashMinOracleRate_not?: InputMaybe<Scalars['Int']>;
  fCashMinOracleRate_gt?: InputMaybe<Scalars['Int']>;
  fCashMinOracleRate_lt?: InputMaybe<Scalars['Int']>;
  fCashMinOracleRate_gte?: InputMaybe<Scalars['Int']>;
  fCashMinOracleRate_lte?: InputMaybe<Scalars['Int']>;
  fCashMinOracleRate_in?: InputMaybe<Array<Scalars['Int']>>;
  fCashMinOracleRate_not_in?: InputMaybe<Array<Scalars['Int']>>;
  fCashMaxOracleRate?: InputMaybe<Scalars['Int']>;
  fCashMaxOracleRate_not?: InputMaybe<Scalars['Int']>;
  fCashMaxOracleRate_gt?: InputMaybe<Scalars['Int']>;
  fCashMaxOracleRate_lt?: InputMaybe<Scalars['Int']>;
  fCashMaxOracleRate_gte?: InputMaybe<Scalars['Int']>;
  fCashMaxOracleRate_lte?: InputMaybe<Scalars['Int']>;
  fCashMaxOracleRate_in?: InputMaybe<Array<Scalars['Int']>>;
  fCashMaxOracleRate_not_in?: InputMaybe<Array<Scalars['Int']>>;
  fCashMaxDiscountFactor?: InputMaybe<Scalars['Int']>;
  fCashMaxDiscountFactor_not?: InputMaybe<Scalars['Int']>;
  fCashMaxDiscountFactor_gt?: InputMaybe<Scalars['Int']>;
  fCashMaxDiscountFactor_lt?: InputMaybe<Scalars['Int']>;
  fCashMaxDiscountFactor_gte?: InputMaybe<Scalars['Int']>;
  fCashMaxDiscountFactor_lte?: InputMaybe<Scalars['Int']>;
  fCashMaxDiscountFactor_in?: InputMaybe<Array<Scalars['Int']>>;
  fCashMaxDiscountFactor_not_in?: InputMaybe<Array<Scalars['Int']>>;
  fCashLiquidationHaircutBasisPoints?: InputMaybe<Scalars['Int']>;
  fCashLiquidationHaircutBasisPoints_not?: InputMaybe<Scalars['Int']>;
  fCashLiquidationHaircutBasisPoints_gt?: InputMaybe<Scalars['Int']>;
  fCashLiquidationHaircutBasisPoints_lt?: InputMaybe<Scalars['Int']>;
  fCashLiquidationHaircutBasisPoints_gte?: InputMaybe<Scalars['Int']>;
  fCashLiquidationHaircutBasisPoints_lte?: InputMaybe<Scalars['Int']>;
  fCashLiquidationHaircutBasisPoints_in?: InputMaybe<Array<Scalars['Int']>>;
  fCashLiquidationHaircutBasisPoints_not_in?: InputMaybe<Array<Scalars['Int']>>;
  fCashLiquidationDebtBufferBasisPoints?: InputMaybe<Scalars['Int']>;
  fCashLiquidationDebtBufferBasisPoints_not?: InputMaybe<Scalars['Int']>;
  fCashLiquidationDebtBufferBasisPoints_gt?: InputMaybe<Scalars['Int']>;
  fCashLiquidationDebtBufferBasisPoints_lt?: InputMaybe<Scalars['Int']>;
  fCashLiquidationDebtBufferBasisPoints_gte?: InputMaybe<Scalars['Int']>;
  fCashLiquidationDebtBufferBasisPoints_lte?: InputMaybe<Scalars['Int']>;
  fCashLiquidationDebtBufferBasisPoints_in?: InputMaybe<Array<Scalars['Int']>>;
  fCashLiquidationDebtBufferBasisPoints_not_in?: InputMaybe<
    Array<Scalars['Int']>
  >;
  fCashActiveCurves?: InputMaybe<Array<Scalars['String']>>;
  fCashActiveCurves_not?: InputMaybe<Array<Scalars['String']>>;
  fCashActiveCurves_contains?: InputMaybe<Array<Scalars['String']>>;
  fCashActiveCurves_contains_nocase?: InputMaybe<Array<Scalars['String']>>;
  fCashActiveCurves_not_contains?: InputMaybe<Array<Scalars['String']>>;
  fCashActiveCurves_not_contains_nocase?: InputMaybe<Array<Scalars['String']>>;
  fCashActiveCurves_?: InputMaybe<InterestRateCurve_filter>;
  fCashNextCurves?: InputMaybe<Array<Scalars['String']>>;
  fCashNextCurves_not?: InputMaybe<Array<Scalars['String']>>;
  fCashNextCurves_contains?: InputMaybe<Array<Scalars['String']>>;
  fCashNextCurves_contains_nocase?: InputMaybe<Array<Scalars['String']>>;
  fCashNextCurves_not_contains?: InputMaybe<Array<Scalars['String']>>;
  fCashNextCurves_not_contains_nocase?: InputMaybe<Array<Scalars['String']>>;
  fCashNextCurves_?: InputMaybe<InterestRateCurve_filter>;
  treasuryReserveBuffer?: InputMaybe<Scalars['BigInt']>;
  treasuryReserveBuffer_not?: InputMaybe<Scalars['BigInt']>;
  treasuryReserveBuffer_gt?: InputMaybe<Scalars['BigInt']>;
  treasuryReserveBuffer_lt?: InputMaybe<Scalars['BigInt']>;
  treasuryReserveBuffer_gte?: InputMaybe<Scalars['BigInt']>;
  treasuryReserveBuffer_lte?: InputMaybe<Scalars['BigInt']>;
  treasuryReserveBuffer_in?: InputMaybe<Array<Scalars['BigInt']>>;
  treasuryReserveBuffer_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  primeCashHoldings?: InputMaybe<Array<Scalars['Bytes']>>;
  primeCashHoldings_not?: InputMaybe<Array<Scalars['Bytes']>>;
  primeCashHoldings_contains?: InputMaybe<Array<Scalars['Bytes']>>;
  primeCashHoldings_contains_nocase?: InputMaybe<Array<Scalars['Bytes']>>;
  primeCashHoldings_not_contains?: InputMaybe<Array<Scalars['Bytes']>>;
  primeCashHoldings_not_contains_nocase?: InputMaybe<Array<Scalars['Bytes']>>;
  depositShares?: InputMaybe<Array<Scalars['Int']>>;
  depositShares_not?: InputMaybe<Array<Scalars['Int']>>;
  depositShares_contains?: InputMaybe<Array<Scalars['Int']>>;
  depositShares_contains_nocase?: InputMaybe<Array<Scalars['Int']>>;
  depositShares_not_contains?: InputMaybe<Array<Scalars['Int']>>;
  depositShares_not_contains_nocase?: InputMaybe<Array<Scalars['Int']>>;
  leverageThresholds?: InputMaybe<Array<Scalars['Int']>>;
  leverageThresholds_not?: InputMaybe<Array<Scalars['Int']>>;
  leverageThresholds_contains?: InputMaybe<Array<Scalars['Int']>>;
  leverageThresholds_contains_nocase?: InputMaybe<Array<Scalars['Int']>>;
  leverageThresholds_not_contains?: InputMaybe<Array<Scalars['Int']>>;
  leverageThresholds_not_contains_nocase?: InputMaybe<Array<Scalars['Int']>>;
  proportions?: InputMaybe<Array<Scalars['Int']>>;
  proportions_not?: InputMaybe<Array<Scalars['Int']>>;
  proportions_contains?: InputMaybe<Array<Scalars['Int']>>;
  proportions_contains_nocase?: InputMaybe<Array<Scalars['Int']>>;
  proportions_not_contains?: InputMaybe<Array<Scalars['Int']>>;
  proportions_not_contains_nocase?: InputMaybe<Array<Scalars['Int']>>;
  deprecated_anchorRates?: InputMaybe<Array<Scalars['Int']>>;
  deprecated_anchorRates_not?: InputMaybe<Array<Scalars['Int']>>;
  deprecated_anchorRates_contains?: InputMaybe<Array<Scalars['Int']>>;
  deprecated_anchorRates_contains_nocase?: InputMaybe<Array<Scalars['Int']>>;
  deprecated_anchorRates_not_contains?: InputMaybe<Array<Scalars['Int']>>;
  deprecated_anchorRates_not_contains_nocase?: InputMaybe<
    Array<Scalars['Int']>
  >;
  residualPurchaseIncentiveBasisPoints?: InputMaybe<Scalars['Int']>;
  residualPurchaseIncentiveBasisPoints_not?: InputMaybe<Scalars['Int']>;
  residualPurchaseIncentiveBasisPoints_gt?: InputMaybe<Scalars['Int']>;
  residualPurchaseIncentiveBasisPoints_lt?: InputMaybe<Scalars['Int']>;
  residualPurchaseIncentiveBasisPoints_gte?: InputMaybe<Scalars['Int']>;
  residualPurchaseIncentiveBasisPoints_lte?: InputMaybe<Scalars['Int']>;
  residualPurchaseIncentiveBasisPoints_in?: InputMaybe<Array<Scalars['Int']>>;
  residualPurchaseIncentiveBasisPoints_not_in?: InputMaybe<
    Array<Scalars['Int']>
  >;
  residualPurchaseTimeBufferSeconds?: InputMaybe<Scalars['Int']>;
  residualPurchaseTimeBufferSeconds_not?: InputMaybe<Scalars['Int']>;
  residualPurchaseTimeBufferSeconds_gt?: InputMaybe<Scalars['Int']>;
  residualPurchaseTimeBufferSeconds_lt?: InputMaybe<Scalars['Int']>;
  residualPurchaseTimeBufferSeconds_gte?: InputMaybe<Scalars['Int']>;
  residualPurchaseTimeBufferSeconds_lte?: InputMaybe<Scalars['Int']>;
  residualPurchaseTimeBufferSeconds_in?: InputMaybe<Array<Scalars['Int']>>;
  residualPurchaseTimeBufferSeconds_not_in?: InputMaybe<Array<Scalars['Int']>>;
  cashWithholdingBufferBasisPoints?: InputMaybe<Scalars['Int']>;
  cashWithholdingBufferBasisPoints_not?: InputMaybe<Scalars['Int']>;
  cashWithholdingBufferBasisPoints_gt?: InputMaybe<Scalars['Int']>;
  cashWithholdingBufferBasisPoints_lt?: InputMaybe<Scalars['Int']>;
  cashWithholdingBufferBasisPoints_gte?: InputMaybe<Scalars['Int']>;
  cashWithholdingBufferBasisPoints_lte?: InputMaybe<Scalars['Int']>;
  cashWithholdingBufferBasisPoints_in?: InputMaybe<Array<Scalars['Int']>>;
  cashWithholdingBufferBasisPoints_not_in?: InputMaybe<Array<Scalars['Int']>>;
  pvHaircutPercentage?: InputMaybe<Scalars['Int']>;
  pvHaircutPercentage_not?: InputMaybe<Scalars['Int']>;
  pvHaircutPercentage_gt?: InputMaybe<Scalars['Int']>;
  pvHaircutPercentage_lt?: InputMaybe<Scalars['Int']>;
  pvHaircutPercentage_gte?: InputMaybe<Scalars['Int']>;
  pvHaircutPercentage_lte?: InputMaybe<Scalars['Int']>;
  pvHaircutPercentage_in?: InputMaybe<Array<Scalars['Int']>>;
  pvHaircutPercentage_not_in?: InputMaybe<Array<Scalars['Int']>>;
  liquidationHaircutPercentage?: InputMaybe<Scalars['Int']>;
  liquidationHaircutPercentage_not?: InputMaybe<Scalars['Int']>;
  liquidationHaircutPercentage_gt?: InputMaybe<Scalars['Int']>;
  liquidationHaircutPercentage_lt?: InputMaybe<Scalars['Int']>;
  liquidationHaircutPercentage_gte?: InputMaybe<Scalars['Int']>;
  liquidationHaircutPercentage_lte?: InputMaybe<Scalars['Int']>;
  liquidationHaircutPercentage_in?: InputMaybe<Array<Scalars['Int']>>;
  liquidationHaircutPercentage_not_in?: InputMaybe<Array<Scalars['Int']>>;
  maxMintDeviationBasisPoints?: InputMaybe<Scalars['Int']>;
  maxMintDeviationBasisPoints_not?: InputMaybe<Scalars['Int']>;
  maxMintDeviationBasisPoints_gt?: InputMaybe<Scalars['Int']>;
  maxMintDeviationBasisPoints_lt?: InputMaybe<Scalars['Int']>;
  maxMintDeviationBasisPoints_gte?: InputMaybe<Scalars['Int']>;
  maxMintDeviationBasisPoints_lte?: InputMaybe<Scalars['Int']>;
  maxMintDeviationBasisPoints_in?: InputMaybe<Array<Scalars['Int']>>;
  maxMintDeviationBasisPoints_not_in?: InputMaybe<Array<Scalars['Int']>>;
  incentives_?: InputMaybe<Incentive_filter>;
  externalLending_?: InputMaybe<ExternalLending_filter>;
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<CurrencyConfiguration_filter>>>;
  or?: InputMaybe<Array<InputMaybe<CurrencyConfiguration_filter>>>;
};

export type CurrencyConfiguration_orderBy =
  | 'id'
  | 'lastUpdateBlockNumber'
  | 'lastUpdateTimestamp'
  | 'lastUpdateTransactionHash'
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
  | 'underlying__currencyId'
  | 'underlying__name'
  | 'underlying__symbol'
  | 'underlying__decimals'
  | 'underlying__precision'
  | 'underlying__totalSupply'
  | 'underlying__hasTransferFee'
  | 'underlying__isfCashDebt'
  | 'underlying__maturity'
  | 'underlying__vaultAddress'
  | 'underlying__tokenAddress'
  | 'pCash'
  | 'pCash__id'
  | 'pCash__firstUpdateBlockNumber'
  | 'pCash__firstUpdateTimestamp'
  | 'pCash__firstUpdateTransactionHash'
  | 'pCash__lastUpdateBlockNumber'
  | 'pCash__lastUpdateTimestamp'
  | 'pCash__lastUpdateTransactionHash'
  | 'pCash__tokenType'
  | 'pCash__tokenInterface'
  | 'pCash__currencyId'
  | 'pCash__name'
  | 'pCash__symbol'
  | 'pCash__decimals'
  | 'pCash__precision'
  | 'pCash__totalSupply'
  | 'pCash__hasTransferFee'
  | 'pCash__isfCashDebt'
  | 'pCash__maturity'
  | 'pCash__vaultAddress'
  | 'pCash__tokenAddress'
  | 'pDebt'
  | 'pDebt__id'
  | 'pDebt__firstUpdateBlockNumber'
  | 'pDebt__firstUpdateTimestamp'
  | 'pDebt__firstUpdateTransactionHash'
  | 'pDebt__lastUpdateBlockNumber'
  | 'pDebt__lastUpdateTimestamp'
  | 'pDebt__lastUpdateTransactionHash'
  | 'pDebt__tokenType'
  | 'pDebt__tokenInterface'
  | 'pDebt__currencyId'
  | 'pDebt__name'
  | 'pDebt__symbol'
  | 'pDebt__decimals'
  | 'pDebt__precision'
  | 'pDebt__totalSupply'
  | 'pDebt__hasTransferFee'
  | 'pDebt__isfCashDebt'
  | 'pDebt__maturity'
  | 'pDebt__vaultAddress'
  | 'pDebt__tokenAddress'
  | 'maxUnderlyingSupply'
  | 'maxPrimeDebtUtilization'
  | 'collateralHaircut'
  | 'debtBuffer'
  | 'liquidationDiscount'
  | 'primeCashRateOracleTimeWindowSeconds'
  | 'primeCashHoldingsOracle'
  | 'primeCashCurve'
  | 'primeCashCurve__id'
  | 'primeCashCurve__lastUpdateBlockNumber'
  | 'primeCashCurve__lastUpdateTimestamp'
  | 'primeCashCurve__lastUpdateTransactionHash'
  | 'primeCashCurve__kinkUtilization1'
  | 'primeCashCurve__kinkUtilization2'
  | 'primeCashCurve__kinkRate1'
  | 'primeCashCurve__kinkRate2'
  | 'primeCashCurve__maxRate'
  | 'primeCashCurve__minFeeRate'
  | 'primeCashCurve__maxFeeRate'
  | 'primeCashCurve__feeRatePercent'
  | 'primeDebtAllowed'
  | 'fCashRateOracleTimeWindowSeconds'
  | 'fCashReserveFeeSharePercent'
  | 'fCashDebtBufferBasisPoints'
  | 'fCashHaircutBasisPoints'
  | 'fCashMinOracleRate'
  | 'fCashMaxOracleRate'
  | 'fCashMaxDiscountFactor'
  | 'fCashLiquidationHaircutBasisPoints'
  | 'fCashLiquidationDebtBufferBasisPoints'
  | 'fCashActiveCurves'
  | 'fCashNextCurves'
  | 'treasuryReserveBuffer'
  | 'primeCashHoldings'
  | 'depositShares'
  | 'leverageThresholds'
  | 'proportions'
  | 'deprecated_anchorRates'
  | 'residualPurchaseIncentiveBasisPoints'
  | 'residualPurchaseTimeBufferSeconds'
  | 'cashWithholdingBufferBasisPoints'
  | 'pvHaircutPercentage'
  | 'liquidationHaircutPercentage'
  | 'maxMintDeviationBasisPoints'
  | 'incentives'
  | 'incentives__id'
  | 'incentives__lastUpdateBlockNumber'
  | 'incentives__lastUpdateTimestamp'
  | 'incentives__lastUpdateTransactionHash'
  | 'incentives__secondaryIncentiveRewarder'
  | 'incentives__incentiveEmissionRate'
  | 'incentives__accumulatedNOTEPerNToken'
  | 'incentives__lastAccumulatedTime'
  | 'incentives__deprecated_lastSupplyChangeTime'
  | 'incentives__deprecated_integralTotalSupply'
  | 'incentives__migrationEmissionRate'
  | 'incentives__finalIntegralTotalSupply'
  | 'incentives__migrationTime'
  | 'incentives__accumulatedSecondaryRewardPerNToken'
  | 'incentives__lastSecondaryAccumulatedTime'
  | 'incentives__secondaryEmissionRate'
  | 'incentives__secondaryRewardEndTime'
  | 'externalLending'
  | 'externalLending__id'
  | 'externalLending__lastUpdateBlockNumber'
  | 'externalLending__lastUpdateTimestamp'
  | 'externalLending__protocolRevenueAllTime';

export type DEX =
  | '_UNUSED'
  | 'UNISWAP_V2'
  | 'UNISWAP_V3'
  | 'ZERO_EX'
  | 'BALANCER_V2'
  | 'CURVE'
  | 'NOTIONAL_VAULT';

export type ExchangeRate = {
  /** External Oracle ID:Block Number:Transaction Hash */
  id: Scalars['ID'];
  blockNumber: Scalars['BigInt'];
  timestamp: Scalars['Int'];
  transaction?: Maybe<Transaction>;
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
  timestamp?: InputMaybe<Scalars['Int']>;
  timestamp_not?: InputMaybe<Scalars['Int']>;
  timestamp_gt?: InputMaybe<Scalars['Int']>;
  timestamp_lt?: InputMaybe<Scalars['Int']>;
  timestamp_gte?: InputMaybe<Scalars['Int']>;
  timestamp_lte?: InputMaybe<Scalars['Int']>;
  timestamp_in?: InputMaybe<Array<Scalars['Int']>>;
  timestamp_not_in?: InputMaybe<Array<Scalars['Int']>>;
  transaction?: InputMaybe<Scalars['String']>;
  transaction_not?: InputMaybe<Scalars['String']>;
  transaction_gt?: InputMaybe<Scalars['String']>;
  transaction_lt?: InputMaybe<Scalars['String']>;
  transaction_gte?: InputMaybe<Scalars['String']>;
  transaction_lte?: InputMaybe<Scalars['String']>;
  transaction_in?: InputMaybe<Array<Scalars['String']>>;
  transaction_not_in?: InputMaybe<Array<Scalars['String']>>;
  transaction_contains?: InputMaybe<Scalars['String']>;
  transaction_contains_nocase?: InputMaybe<Scalars['String']>;
  transaction_not_contains?: InputMaybe<Scalars['String']>;
  transaction_not_contains_nocase?: InputMaybe<Scalars['String']>;
  transaction_starts_with?: InputMaybe<Scalars['String']>;
  transaction_starts_with_nocase?: InputMaybe<Scalars['String']>;
  transaction_not_starts_with?: InputMaybe<Scalars['String']>;
  transaction_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  transaction_ends_with?: InputMaybe<Scalars['String']>;
  transaction_ends_with_nocase?: InputMaybe<Scalars['String']>;
  transaction_not_ends_with?: InputMaybe<Scalars['String']>;
  transaction_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  transaction_?: InputMaybe<Transaction_filter>;
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
  | 'transaction'
  | 'transaction__id'
  | 'transaction__blockNumber'
  | 'transaction__timestamp'
  | 'transaction__transactionHash'
  | 'transaction___nextStartIndex'
  | 'oracle'
  | 'oracle__id'
  | 'oracle__lastUpdateBlockNumber'
  | 'oracle__lastUpdateTimestamp'
  | 'oracle__decimals'
  | 'oracle__ratePrecision'
  | 'oracle__oracleAddress'
  | 'oracle__oracleType'
  | 'oracle__mustInvert'
  | 'oracle__latestRate'
  | 'oracle__matured'
  | 'rate'
  | 'totalSupply';

export type ExternalLending = {
  /** Currency ID */
  id: Scalars['ID'];
  lastUpdateBlockNumber: Scalars['BigInt'];
  lastUpdateTimestamp: Scalars['Int'];
  currencyConfiguration: CurrencyConfiguration;
  /** Reference to the underlying token */
  underlying: Token;
  /** Accumulate the revenue from snapshots */
  protocolRevenueAllTime: Scalars['BigInt'];
  currentExternal?: Maybe<ExternalLendingSnapshot>;
  externalSnapshots?: Maybe<Array<ExternalLendingSnapshot>>;
  currentUnderlying: UnderlyingSnapshot;
  underlyingSnapshots?: Maybe<Array<UnderlyingSnapshot>>;
};

export type ExternalLendingexternalSnapshotsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<ExternalLendingSnapshot_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<ExternalLendingSnapshot_filter>;
};

export type ExternalLendingunderlyingSnapshotsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<UnderlyingSnapshot_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<UnderlyingSnapshot_filter>;
};

export type ExternalLendingSnapshot = {
  /** CurrencyID:ExternalLendingToken:Block Number */
  id: Scalars['ID'];
  blockNumber: Scalars['BigInt'];
  timestamp: Scalars['BigInt'];
  transactionHash: Scalars['Bytes'];
  /** Reference to the parent object */
  externalLending: ExternalLending;
  prevSnapshot?: Maybe<ExternalLendingSnapshot>;
  /** Reference to the external lending token, this may change over time so referenced inside the snapshot */
  externalLendingToken: Token;
  /** Direct balanceOf the external lending token held by the contract */
  balanceOf: Scalars['BigInt'];
  /** Direct balanceOf the external lending token in underlying of held by the contract */
  balanceOfUnderlying: Scalars['BigInt'];
  /** Stored balanceOf of the external lending token held by the contract */
  storedBalanceOf: Scalars['BigInt'];
  /** Stored balanceOf in underlying of the external lending held by the contract */
  storedBalanceOfUnderlying: Scalars['BigInt'];
  /** Lending revenue accrued to protocol */
  protocolRevenueSinceLastSnapshot: Scalars['BigInt'];
  /** Updated when protocol interest has been harvested */
  protocolInterestHarvested: Scalars['BigInt'];
  /** Target time between rebalance calls */
  cooldownTime: Scalars['Int'];
  /** Required threshold to withdraw from external lending protocol */
  withdrawThreshold: Scalars['Int'];
  /** Target utilization for external lending */
  targetUtilization: Scalars['Int'];
  /** Current utilization of the market at the snapshot */
  currentUtilization: Scalars['Int'];
  /** Amount in underlying available to withdraw of the holding from the external market */
  holdingAvailableToWithdraw: Scalars['BigInt'];
};

export type ExternalLendingSnapshot_filter = {
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
  timestamp?: InputMaybe<Scalars['BigInt']>;
  timestamp_not?: InputMaybe<Scalars['BigInt']>;
  timestamp_gt?: InputMaybe<Scalars['BigInt']>;
  timestamp_lt?: InputMaybe<Scalars['BigInt']>;
  timestamp_gte?: InputMaybe<Scalars['BigInt']>;
  timestamp_lte?: InputMaybe<Scalars['BigInt']>;
  timestamp_in?: InputMaybe<Array<Scalars['BigInt']>>;
  timestamp_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
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
  externalLending?: InputMaybe<Scalars['String']>;
  externalLending_not?: InputMaybe<Scalars['String']>;
  externalLending_gt?: InputMaybe<Scalars['String']>;
  externalLending_lt?: InputMaybe<Scalars['String']>;
  externalLending_gte?: InputMaybe<Scalars['String']>;
  externalLending_lte?: InputMaybe<Scalars['String']>;
  externalLending_in?: InputMaybe<Array<Scalars['String']>>;
  externalLending_not_in?: InputMaybe<Array<Scalars['String']>>;
  externalLending_contains?: InputMaybe<Scalars['String']>;
  externalLending_contains_nocase?: InputMaybe<Scalars['String']>;
  externalLending_not_contains?: InputMaybe<Scalars['String']>;
  externalLending_not_contains_nocase?: InputMaybe<Scalars['String']>;
  externalLending_starts_with?: InputMaybe<Scalars['String']>;
  externalLending_starts_with_nocase?: InputMaybe<Scalars['String']>;
  externalLending_not_starts_with?: InputMaybe<Scalars['String']>;
  externalLending_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  externalLending_ends_with?: InputMaybe<Scalars['String']>;
  externalLending_ends_with_nocase?: InputMaybe<Scalars['String']>;
  externalLending_not_ends_with?: InputMaybe<Scalars['String']>;
  externalLending_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  externalLending_?: InputMaybe<ExternalLending_filter>;
  prevSnapshot?: InputMaybe<Scalars['String']>;
  prevSnapshot_not?: InputMaybe<Scalars['String']>;
  prevSnapshot_gt?: InputMaybe<Scalars['String']>;
  prevSnapshot_lt?: InputMaybe<Scalars['String']>;
  prevSnapshot_gte?: InputMaybe<Scalars['String']>;
  prevSnapshot_lte?: InputMaybe<Scalars['String']>;
  prevSnapshot_in?: InputMaybe<Array<Scalars['String']>>;
  prevSnapshot_not_in?: InputMaybe<Array<Scalars['String']>>;
  prevSnapshot_contains?: InputMaybe<Scalars['String']>;
  prevSnapshot_contains_nocase?: InputMaybe<Scalars['String']>;
  prevSnapshot_not_contains?: InputMaybe<Scalars['String']>;
  prevSnapshot_not_contains_nocase?: InputMaybe<Scalars['String']>;
  prevSnapshot_starts_with?: InputMaybe<Scalars['String']>;
  prevSnapshot_starts_with_nocase?: InputMaybe<Scalars['String']>;
  prevSnapshot_not_starts_with?: InputMaybe<Scalars['String']>;
  prevSnapshot_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  prevSnapshot_ends_with?: InputMaybe<Scalars['String']>;
  prevSnapshot_ends_with_nocase?: InputMaybe<Scalars['String']>;
  prevSnapshot_not_ends_with?: InputMaybe<Scalars['String']>;
  prevSnapshot_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  prevSnapshot_?: InputMaybe<ExternalLendingSnapshot_filter>;
  externalLendingToken?: InputMaybe<Scalars['String']>;
  externalLendingToken_not?: InputMaybe<Scalars['String']>;
  externalLendingToken_gt?: InputMaybe<Scalars['String']>;
  externalLendingToken_lt?: InputMaybe<Scalars['String']>;
  externalLendingToken_gte?: InputMaybe<Scalars['String']>;
  externalLendingToken_lte?: InputMaybe<Scalars['String']>;
  externalLendingToken_in?: InputMaybe<Array<Scalars['String']>>;
  externalLendingToken_not_in?: InputMaybe<Array<Scalars['String']>>;
  externalLendingToken_contains?: InputMaybe<Scalars['String']>;
  externalLendingToken_contains_nocase?: InputMaybe<Scalars['String']>;
  externalLendingToken_not_contains?: InputMaybe<Scalars['String']>;
  externalLendingToken_not_contains_nocase?: InputMaybe<Scalars['String']>;
  externalLendingToken_starts_with?: InputMaybe<Scalars['String']>;
  externalLendingToken_starts_with_nocase?: InputMaybe<Scalars['String']>;
  externalLendingToken_not_starts_with?: InputMaybe<Scalars['String']>;
  externalLendingToken_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  externalLendingToken_ends_with?: InputMaybe<Scalars['String']>;
  externalLendingToken_ends_with_nocase?: InputMaybe<Scalars['String']>;
  externalLendingToken_not_ends_with?: InputMaybe<Scalars['String']>;
  externalLendingToken_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  externalLendingToken_?: InputMaybe<Token_filter>;
  balanceOf?: InputMaybe<Scalars['BigInt']>;
  balanceOf_not?: InputMaybe<Scalars['BigInt']>;
  balanceOf_gt?: InputMaybe<Scalars['BigInt']>;
  balanceOf_lt?: InputMaybe<Scalars['BigInt']>;
  balanceOf_gte?: InputMaybe<Scalars['BigInt']>;
  balanceOf_lte?: InputMaybe<Scalars['BigInt']>;
  balanceOf_in?: InputMaybe<Array<Scalars['BigInt']>>;
  balanceOf_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  balanceOfUnderlying?: InputMaybe<Scalars['BigInt']>;
  balanceOfUnderlying_not?: InputMaybe<Scalars['BigInt']>;
  balanceOfUnderlying_gt?: InputMaybe<Scalars['BigInt']>;
  balanceOfUnderlying_lt?: InputMaybe<Scalars['BigInt']>;
  balanceOfUnderlying_gte?: InputMaybe<Scalars['BigInt']>;
  balanceOfUnderlying_lte?: InputMaybe<Scalars['BigInt']>;
  balanceOfUnderlying_in?: InputMaybe<Array<Scalars['BigInt']>>;
  balanceOfUnderlying_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  storedBalanceOf?: InputMaybe<Scalars['BigInt']>;
  storedBalanceOf_not?: InputMaybe<Scalars['BigInt']>;
  storedBalanceOf_gt?: InputMaybe<Scalars['BigInt']>;
  storedBalanceOf_lt?: InputMaybe<Scalars['BigInt']>;
  storedBalanceOf_gte?: InputMaybe<Scalars['BigInt']>;
  storedBalanceOf_lte?: InputMaybe<Scalars['BigInt']>;
  storedBalanceOf_in?: InputMaybe<Array<Scalars['BigInt']>>;
  storedBalanceOf_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  storedBalanceOfUnderlying?: InputMaybe<Scalars['BigInt']>;
  storedBalanceOfUnderlying_not?: InputMaybe<Scalars['BigInt']>;
  storedBalanceOfUnderlying_gt?: InputMaybe<Scalars['BigInt']>;
  storedBalanceOfUnderlying_lt?: InputMaybe<Scalars['BigInt']>;
  storedBalanceOfUnderlying_gte?: InputMaybe<Scalars['BigInt']>;
  storedBalanceOfUnderlying_lte?: InputMaybe<Scalars['BigInt']>;
  storedBalanceOfUnderlying_in?: InputMaybe<Array<Scalars['BigInt']>>;
  storedBalanceOfUnderlying_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  protocolRevenueSinceLastSnapshot?: InputMaybe<Scalars['BigInt']>;
  protocolRevenueSinceLastSnapshot_not?: InputMaybe<Scalars['BigInt']>;
  protocolRevenueSinceLastSnapshot_gt?: InputMaybe<Scalars['BigInt']>;
  protocolRevenueSinceLastSnapshot_lt?: InputMaybe<Scalars['BigInt']>;
  protocolRevenueSinceLastSnapshot_gte?: InputMaybe<Scalars['BigInt']>;
  protocolRevenueSinceLastSnapshot_lte?: InputMaybe<Scalars['BigInt']>;
  protocolRevenueSinceLastSnapshot_in?: InputMaybe<Array<Scalars['BigInt']>>;
  protocolRevenueSinceLastSnapshot_not_in?: InputMaybe<
    Array<Scalars['BigInt']>
  >;
  protocolInterestHarvested?: InputMaybe<Scalars['BigInt']>;
  protocolInterestHarvested_not?: InputMaybe<Scalars['BigInt']>;
  protocolInterestHarvested_gt?: InputMaybe<Scalars['BigInt']>;
  protocolInterestHarvested_lt?: InputMaybe<Scalars['BigInt']>;
  protocolInterestHarvested_gte?: InputMaybe<Scalars['BigInt']>;
  protocolInterestHarvested_lte?: InputMaybe<Scalars['BigInt']>;
  protocolInterestHarvested_in?: InputMaybe<Array<Scalars['BigInt']>>;
  protocolInterestHarvested_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  cooldownTime?: InputMaybe<Scalars['Int']>;
  cooldownTime_not?: InputMaybe<Scalars['Int']>;
  cooldownTime_gt?: InputMaybe<Scalars['Int']>;
  cooldownTime_lt?: InputMaybe<Scalars['Int']>;
  cooldownTime_gte?: InputMaybe<Scalars['Int']>;
  cooldownTime_lte?: InputMaybe<Scalars['Int']>;
  cooldownTime_in?: InputMaybe<Array<Scalars['Int']>>;
  cooldownTime_not_in?: InputMaybe<Array<Scalars['Int']>>;
  withdrawThreshold?: InputMaybe<Scalars['Int']>;
  withdrawThreshold_not?: InputMaybe<Scalars['Int']>;
  withdrawThreshold_gt?: InputMaybe<Scalars['Int']>;
  withdrawThreshold_lt?: InputMaybe<Scalars['Int']>;
  withdrawThreshold_gte?: InputMaybe<Scalars['Int']>;
  withdrawThreshold_lte?: InputMaybe<Scalars['Int']>;
  withdrawThreshold_in?: InputMaybe<Array<Scalars['Int']>>;
  withdrawThreshold_not_in?: InputMaybe<Array<Scalars['Int']>>;
  targetUtilization?: InputMaybe<Scalars['Int']>;
  targetUtilization_not?: InputMaybe<Scalars['Int']>;
  targetUtilization_gt?: InputMaybe<Scalars['Int']>;
  targetUtilization_lt?: InputMaybe<Scalars['Int']>;
  targetUtilization_gte?: InputMaybe<Scalars['Int']>;
  targetUtilization_lte?: InputMaybe<Scalars['Int']>;
  targetUtilization_in?: InputMaybe<Array<Scalars['Int']>>;
  targetUtilization_not_in?: InputMaybe<Array<Scalars['Int']>>;
  currentUtilization?: InputMaybe<Scalars['Int']>;
  currentUtilization_not?: InputMaybe<Scalars['Int']>;
  currentUtilization_gt?: InputMaybe<Scalars['Int']>;
  currentUtilization_lt?: InputMaybe<Scalars['Int']>;
  currentUtilization_gte?: InputMaybe<Scalars['Int']>;
  currentUtilization_lte?: InputMaybe<Scalars['Int']>;
  currentUtilization_in?: InputMaybe<Array<Scalars['Int']>>;
  currentUtilization_not_in?: InputMaybe<Array<Scalars['Int']>>;
  holdingAvailableToWithdraw?: InputMaybe<Scalars['BigInt']>;
  holdingAvailableToWithdraw_not?: InputMaybe<Scalars['BigInt']>;
  holdingAvailableToWithdraw_gt?: InputMaybe<Scalars['BigInt']>;
  holdingAvailableToWithdraw_lt?: InputMaybe<Scalars['BigInt']>;
  holdingAvailableToWithdraw_gte?: InputMaybe<Scalars['BigInt']>;
  holdingAvailableToWithdraw_lte?: InputMaybe<Scalars['BigInt']>;
  holdingAvailableToWithdraw_in?: InputMaybe<Array<Scalars['BigInt']>>;
  holdingAvailableToWithdraw_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<ExternalLendingSnapshot_filter>>>;
  or?: InputMaybe<Array<InputMaybe<ExternalLendingSnapshot_filter>>>;
};

export type ExternalLendingSnapshot_orderBy =
  | 'id'
  | 'blockNumber'
  | 'timestamp'
  | 'transactionHash'
  | 'externalLending'
  | 'externalLending__id'
  | 'externalLending__lastUpdateBlockNumber'
  | 'externalLending__lastUpdateTimestamp'
  | 'externalLending__protocolRevenueAllTime'
  | 'prevSnapshot'
  | 'prevSnapshot__id'
  | 'prevSnapshot__blockNumber'
  | 'prevSnapshot__timestamp'
  | 'prevSnapshot__transactionHash'
  | 'prevSnapshot__balanceOf'
  | 'prevSnapshot__balanceOfUnderlying'
  | 'prevSnapshot__storedBalanceOf'
  | 'prevSnapshot__storedBalanceOfUnderlying'
  | 'prevSnapshot__protocolRevenueSinceLastSnapshot'
  | 'prevSnapshot__protocolInterestHarvested'
  | 'prevSnapshot__cooldownTime'
  | 'prevSnapshot__withdrawThreshold'
  | 'prevSnapshot__targetUtilization'
  | 'prevSnapshot__currentUtilization'
  | 'prevSnapshot__holdingAvailableToWithdraw'
  | 'externalLendingToken'
  | 'externalLendingToken__id'
  | 'externalLendingToken__firstUpdateBlockNumber'
  | 'externalLendingToken__firstUpdateTimestamp'
  | 'externalLendingToken__firstUpdateTransactionHash'
  | 'externalLendingToken__lastUpdateBlockNumber'
  | 'externalLendingToken__lastUpdateTimestamp'
  | 'externalLendingToken__lastUpdateTransactionHash'
  | 'externalLendingToken__tokenType'
  | 'externalLendingToken__tokenInterface'
  | 'externalLendingToken__currencyId'
  | 'externalLendingToken__name'
  | 'externalLendingToken__symbol'
  | 'externalLendingToken__decimals'
  | 'externalLendingToken__precision'
  | 'externalLendingToken__totalSupply'
  | 'externalLendingToken__hasTransferFee'
  | 'externalLendingToken__isfCashDebt'
  | 'externalLendingToken__maturity'
  | 'externalLendingToken__vaultAddress'
  | 'externalLendingToken__tokenAddress'
  | 'balanceOf'
  | 'balanceOfUnderlying'
  | 'storedBalanceOf'
  | 'storedBalanceOfUnderlying'
  | 'protocolRevenueSinceLastSnapshot'
  | 'protocolInterestHarvested'
  | 'cooldownTime'
  | 'withdrawThreshold'
  | 'targetUtilization'
  | 'currentUtilization'
  | 'holdingAvailableToWithdraw';

export type ExternalLending_filter = {
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
  currencyConfiguration?: InputMaybe<Scalars['String']>;
  currencyConfiguration_not?: InputMaybe<Scalars['String']>;
  currencyConfiguration_gt?: InputMaybe<Scalars['String']>;
  currencyConfiguration_lt?: InputMaybe<Scalars['String']>;
  currencyConfiguration_gte?: InputMaybe<Scalars['String']>;
  currencyConfiguration_lte?: InputMaybe<Scalars['String']>;
  currencyConfiguration_in?: InputMaybe<Array<Scalars['String']>>;
  currencyConfiguration_not_in?: InputMaybe<Array<Scalars['String']>>;
  currencyConfiguration_contains?: InputMaybe<Scalars['String']>;
  currencyConfiguration_contains_nocase?: InputMaybe<Scalars['String']>;
  currencyConfiguration_not_contains?: InputMaybe<Scalars['String']>;
  currencyConfiguration_not_contains_nocase?: InputMaybe<Scalars['String']>;
  currencyConfiguration_starts_with?: InputMaybe<Scalars['String']>;
  currencyConfiguration_starts_with_nocase?: InputMaybe<Scalars['String']>;
  currencyConfiguration_not_starts_with?: InputMaybe<Scalars['String']>;
  currencyConfiguration_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  currencyConfiguration_ends_with?: InputMaybe<Scalars['String']>;
  currencyConfiguration_ends_with_nocase?: InputMaybe<Scalars['String']>;
  currencyConfiguration_not_ends_with?: InputMaybe<Scalars['String']>;
  currencyConfiguration_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  currencyConfiguration_?: InputMaybe<CurrencyConfiguration_filter>;
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
  protocolRevenueAllTime?: InputMaybe<Scalars['BigInt']>;
  protocolRevenueAllTime_not?: InputMaybe<Scalars['BigInt']>;
  protocolRevenueAllTime_gt?: InputMaybe<Scalars['BigInt']>;
  protocolRevenueAllTime_lt?: InputMaybe<Scalars['BigInt']>;
  protocolRevenueAllTime_gte?: InputMaybe<Scalars['BigInt']>;
  protocolRevenueAllTime_lte?: InputMaybe<Scalars['BigInt']>;
  protocolRevenueAllTime_in?: InputMaybe<Array<Scalars['BigInt']>>;
  protocolRevenueAllTime_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  currentExternal?: InputMaybe<Scalars['String']>;
  currentExternal_not?: InputMaybe<Scalars['String']>;
  currentExternal_gt?: InputMaybe<Scalars['String']>;
  currentExternal_lt?: InputMaybe<Scalars['String']>;
  currentExternal_gte?: InputMaybe<Scalars['String']>;
  currentExternal_lte?: InputMaybe<Scalars['String']>;
  currentExternal_in?: InputMaybe<Array<Scalars['String']>>;
  currentExternal_not_in?: InputMaybe<Array<Scalars['String']>>;
  currentExternal_contains?: InputMaybe<Scalars['String']>;
  currentExternal_contains_nocase?: InputMaybe<Scalars['String']>;
  currentExternal_not_contains?: InputMaybe<Scalars['String']>;
  currentExternal_not_contains_nocase?: InputMaybe<Scalars['String']>;
  currentExternal_starts_with?: InputMaybe<Scalars['String']>;
  currentExternal_starts_with_nocase?: InputMaybe<Scalars['String']>;
  currentExternal_not_starts_with?: InputMaybe<Scalars['String']>;
  currentExternal_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  currentExternal_ends_with?: InputMaybe<Scalars['String']>;
  currentExternal_ends_with_nocase?: InputMaybe<Scalars['String']>;
  currentExternal_not_ends_with?: InputMaybe<Scalars['String']>;
  currentExternal_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  currentExternal_?: InputMaybe<ExternalLendingSnapshot_filter>;
  externalSnapshots_?: InputMaybe<ExternalLendingSnapshot_filter>;
  currentUnderlying?: InputMaybe<Scalars['String']>;
  currentUnderlying_not?: InputMaybe<Scalars['String']>;
  currentUnderlying_gt?: InputMaybe<Scalars['String']>;
  currentUnderlying_lt?: InputMaybe<Scalars['String']>;
  currentUnderlying_gte?: InputMaybe<Scalars['String']>;
  currentUnderlying_lte?: InputMaybe<Scalars['String']>;
  currentUnderlying_in?: InputMaybe<Array<Scalars['String']>>;
  currentUnderlying_not_in?: InputMaybe<Array<Scalars['String']>>;
  currentUnderlying_contains?: InputMaybe<Scalars['String']>;
  currentUnderlying_contains_nocase?: InputMaybe<Scalars['String']>;
  currentUnderlying_not_contains?: InputMaybe<Scalars['String']>;
  currentUnderlying_not_contains_nocase?: InputMaybe<Scalars['String']>;
  currentUnderlying_starts_with?: InputMaybe<Scalars['String']>;
  currentUnderlying_starts_with_nocase?: InputMaybe<Scalars['String']>;
  currentUnderlying_not_starts_with?: InputMaybe<Scalars['String']>;
  currentUnderlying_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  currentUnderlying_ends_with?: InputMaybe<Scalars['String']>;
  currentUnderlying_ends_with_nocase?: InputMaybe<Scalars['String']>;
  currentUnderlying_not_ends_with?: InputMaybe<Scalars['String']>;
  currentUnderlying_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  currentUnderlying_?: InputMaybe<UnderlyingSnapshot_filter>;
  underlyingSnapshots_?: InputMaybe<UnderlyingSnapshot_filter>;
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<ExternalLending_filter>>>;
  or?: InputMaybe<Array<InputMaybe<ExternalLending_filter>>>;
};

export type ExternalLending_orderBy =
  | 'id'
  | 'lastUpdateBlockNumber'
  | 'lastUpdateTimestamp'
  | 'currencyConfiguration'
  | 'currencyConfiguration__id'
  | 'currencyConfiguration__lastUpdateBlockNumber'
  | 'currencyConfiguration__lastUpdateTimestamp'
  | 'currencyConfiguration__lastUpdateTransactionHash'
  | 'currencyConfiguration__maxUnderlyingSupply'
  | 'currencyConfiguration__maxPrimeDebtUtilization'
  | 'currencyConfiguration__collateralHaircut'
  | 'currencyConfiguration__debtBuffer'
  | 'currencyConfiguration__liquidationDiscount'
  | 'currencyConfiguration__primeCashRateOracleTimeWindowSeconds'
  | 'currencyConfiguration__primeCashHoldingsOracle'
  | 'currencyConfiguration__primeDebtAllowed'
  | 'currencyConfiguration__fCashRateOracleTimeWindowSeconds'
  | 'currencyConfiguration__fCashReserveFeeSharePercent'
  | 'currencyConfiguration__fCashDebtBufferBasisPoints'
  | 'currencyConfiguration__fCashHaircutBasisPoints'
  | 'currencyConfiguration__fCashMinOracleRate'
  | 'currencyConfiguration__fCashMaxOracleRate'
  | 'currencyConfiguration__fCashMaxDiscountFactor'
  | 'currencyConfiguration__fCashLiquidationHaircutBasisPoints'
  | 'currencyConfiguration__fCashLiquidationDebtBufferBasisPoints'
  | 'currencyConfiguration__treasuryReserveBuffer'
  | 'currencyConfiguration__residualPurchaseIncentiveBasisPoints'
  | 'currencyConfiguration__residualPurchaseTimeBufferSeconds'
  | 'currencyConfiguration__cashWithholdingBufferBasisPoints'
  | 'currencyConfiguration__pvHaircutPercentage'
  | 'currencyConfiguration__liquidationHaircutPercentage'
  | 'currencyConfiguration__maxMintDeviationBasisPoints'
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
  | 'underlying__currencyId'
  | 'underlying__name'
  | 'underlying__symbol'
  | 'underlying__decimals'
  | 'underlying__precision'
  | 'underlying__totalSupply'
  | 'underlying__hasTransferFee'
  | 'underlying__isfCashDebt'
  | 'underlying__maturity'
  | 'underlying__vaultAddress'
  | 'underlying__tokenAddress'
  | 'protocolRevenueAllTime'
  | 'currentExternal'
  | 'currentExternal__id'
  | 'currentExternal__blockNumber'
  | 'currentExternal__timestamp'
  | 'currentExternal__transactionHash'
  | 'currentExternal__balanceOf'
  | 'currentExternal__balanceOfUnderlying'
  | 'currentExternal__storedBalanceOf'
  | 'currentExternal__storedBalanceOfUnderlying'
  | 'currentExternal__protocolRevenueSinceLastSnapshot'
  | 'currentExternal__protocolInterestHarvested'
  | 'currentExternal__cooldownTime'
  | 'currentExternal__withdrawThreshold'
  | 'currentExternal__targetUtilization'
  | 'currentExternal__currentUtilization'
  | 'currentExternal__holdingAvailableToWithdraw'
  | 'externalSnapshots'
  | 'currentUnderlying'
  | 'currentUnderlying__id'
  | 'currentUnderlying__blockNumber'
  | 'currentUnderlying__timestamp'
  | 'currentUnderlying__balanceOf'
  | 'currentUnderlying__storedBalanceOf'
  | 'underlyingSnapshots';

export type Incentive = {
  /** ID is the currency id */
  id: Scalars['ID'];
  lastUpdateBlockNumber: Scalars['BigInt'];
  lastUpdateTimestamp: Scalars['Int'];
  lastUpdateTransactionHash: Scalars['Bytes'];
  currencyConfiguration: CurrencyConfiguration;
  /** If set, a secondary incentive rewarder is set */
  secondaryIncentiveRewarder?: Maybe<Scalars['Bytes']>;
  /** Annual incentive emission rate for NOTE */
  incentiveEmissionRate?: Maybe<Scalars['BigInt']>;
  /** Current accumulated NOTE per nToken */
  accumulatedNOTEPerNToken?: Maybe<Scalars['BigInt']>;
  /** Last accumulation time */
  lastAccumulatedTime?: Maybe<Scalars['BigInt']>;
  /** Deprecated last supply change time value */
  deprecated_lastSupplyChangeTime?: Maybe<Scalars['BigInt']>;
  /** Deprecated integral total supply value */
  deprecated_integralTotalSupply?: Maybe<Scalars['BigInt']>;
  /** Snapshot of the incentive emission rate at migration */
  migrationEmissionRate?: Maybe<Scalars['BigInt']>;
  /** Snapshot of the integral total supply at migration */
  finalIntegralTotalSupply?: Maybe<Scalars['BigInt']>;
  /** Time when the currency was migrated */
  migrationTime?: Maybe<Scalars['BigInt']>;
  /** Current secondary reward token set for this currency */
  currentSecondaryReward?: Maybe<Token>;
  /** Total accumulated secondary reward per nToken for the current rewarder */
  accumulatedSecondaryRewardPerNToken?: Maybe<Scalars['BigInt']>;
  /** Last accumulated time for the current rewarder */
  lastSecondaryAccumulatedTime?: Maybe<Scalars['BigInt']>;
  /** Secondary incentive emission rate in INTERNAL_TOKEN_PRECISION */
  secondaryEmissionRate?: Maybe<Scalars['BigInt']>;
  /** End time for the current secondary rewarder */
  secondaryRewardEndTime?: Maybe<Scalars['BigInt']>;
};

export type IncentiveSnapshot = {
  /** Balance Snapshot ID:Reward Token */
  id: Scalars['ID'];
  blockNumber: Scalars['BigInt'];
  timestamp: Scalars['Int'];
  transaction: Transaction;
  /** Link back to the balance snapshot for this secondary incentive */
  balanceSnapshot: BalanceSnapshot;
  /** Reward token associated with this snapshot */
  rewardToken: Token;
  /** Current account incentive debt for reward */
  currentIncentiveDebt: Scalars['BigInt'];
  /** Previous account incentive debt for reward */
  previousIncentiveDebt: Scalars['BigInt'];
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
  transaction?: InputMaybe<Scalars['String']>;
  transaction_not?: InputMaybe<Scalars['String']>;
  transaction_gt?: InputMaybe<Scalars['String']>;
  transaction_lt?: InputMaybe<Scalars['String']>;
  transaction_gte?: InputMaybe<Scalars['String']>;
  transaction_lte?: InputMaybe<Scalars['String']>;
  transaction_in?: InputMaybe<Array<Scalars['String']>>;
  transaction_not_in?: InputMaybe<Array<Scalars['String']>>;
  transaction_contains?: InputMaybe<Scalars['String']>;
  transaction_contains_nocase?: InputMaybe<Scalars['String']>;
  transaction_not_contains?: InputMaybe<Scalars['String']>;
  transaction_not_contains_nocase?: InputMaybe<Scalars['String']>;
  transaction_starts_with?: InputMaybe<Scalars['String']>;
  transaction_starts_with_nocase?: InputMaybe<Scalars['String']>;
  transaction_not_starts_with?: InputMaybe<Scalars['String']>;
  transaction_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  transaction_ends_with?: InputMaybe<Scalars['String']>;
  transaction_ends_with_nocase?: InputMaybe<Scalars['String']>;
  transaction_not_ends_with?: InputMaybe<Scalars['String']>;
  transaction_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  transaction_?: InputMaybe<Transaction_filter>;
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
  currentIncentiveDebt?: InputMaybe<Scalars['BigInt']>;
  currentIncentiveDebt_not?: InputMaybe<Scalars['BigInt']>;
  currentIncentiveDebt_gt?: InputMaybe<Scalars['BigInt']>;
  currentIncentiveDebt_lt?: InputMaybe<Scalars['BigInt']>;
  currentIncentiveDebt_gte?: InputMaybe<Scalars['BigInt']>;
  currentIncentiveDebt_lte?: InputMaybe<Scalars['BigInt']>;
  currentIncentiveDebt_in?: InputMaybe<Array<Scalars['BigInt']>>;
  currentIncentiveDebt_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  previousIncentiveDebt?: InputMaybe<Scalars['BigInt']>;
  previousIncentiveDebt_not?: InputMaybe<Scalars['BigInt']>;
  previousIncentiveDebt_gt?: InputMaybe<Scalars['BigInt']>;
  previousIncentiveDebt_lt?: InputMaybe<Scalars['BigInt']>;
  previousIncentiveDebt_gte?: InputMaybe<Scalars['BigInt']>;
  previousIncentiveDebt_lte?: InputMaybe<Scalars['BigInt']>;
  previousIncentiveDebt_in?: InputMaybe<Array<Scalars['BigInt']>>;
  previousIncentiveDebt_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
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
  | 'transaction'
  | 'transaction__id'
  | 'transaction__blockNumber'
  | 'transaction__timestamp'
  | 'transaction__transactionHash'
  | 'transaction___nextStartIndex'
  | 'balanceSnapshot'
  | 'balanceSnapshot__id'
  | 'balanceSnapshot__blockNumber'
  | 'balanceSnapshot__timestamp'
  | 'balanceSnapshot__currentBalance'
  | 'balanceSnapshot__previousBalance'
  | 'balanceSnapshot__adjustedCostBasis'
  | 'balanceSnapshot__currentProfitAndLossAtSnapshot'
  | 'balanceSnapshot__totalProfitAndLossAtSnapshot'
  | 'balanceSnapshot__totalILAndFeesAtSnapshot'
  | 'balanceSnapshot__totalInterestAccrualAtSnapshot'
  | 'balanceSnapshot__impliedFixedRate'
  | 'balanceSnapshot___accumulatedBalance'
  | 'balanceSnapshot___accumulatedCostRealized'
  | 'balanceSnapshot___lastInterestAccumulator'
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
  | 'rewardToken__currencyId'
  | 'rewardToken__name'
  | 'rewardToken__symbol'
  | 'rewardToken__decimals'
  | 'rewardToken__precision'
  | 'rewardToken__totalSupply'
  | 'rewardToken__hasTransferFee'
  | 'rewardToken__isfCashDebt'
  | 'rewardToken__maturity'
  | 'rewardToken__vaultAddress'
  | 'rewardToken__tokenAddress'
  | 'currentIncentiveDebt'
  | 'previousIncentiveDebt'
  | 'totalClaimed'
  | 'adjustedClaimed';

export type Incentive_filter = {
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
  currencyConfiguration?: InputMaybe<Scalars['String']>;
  currencyConfiguration_not?: InputMaybe<Scalars['String']>;
  currencyConfiguration_gt?: InputMaybe<Scalars['String']>;
  currencyConfiguration_lt?: InputMaybe<Scalars['String']>;
  currencyConfiguration_gte?: InputMaybe<Scalars['String']>;
  currencyConfiguration_lte?: InputMaybe<Scalars['String']>;
  currencyConfiguration_in?: InputMaybe<Array<Scalars['String']>>;
  currencyConfiguration_not_in?: InputMaybe<Array<Scalars['String']>>;
  currencyConfiguration_contains?: InputMaybe<Scalars['String']>;
  currencyConfiguration_contains_nocase?: InputMaybe<Scalars['String']>;
  currencyConfiguration_not_contains?: InputMaybe<Scalars['String']>;
  currencyConfiguration_not_contains_nocase?: InputMaybe<Scalars['String']>;
  currencyConfiguration_starts_with?: InputMaybe<Scalars['String']>;
  currencyConfiguration_starts_with_nocase?: InputMaybe<Scalars['String']>;
  currencyConfiguration_not_starts_with?: InputMaybe<Scalars['String']>;
  currencyConfiguration_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  currencyConfiguration_ends_with?: InputMaybe<Scalars['String']>;
  currencyConfiguration_ends_with_nocase?: InputMaybe<Scalars['String']>;
  currencyConfiguration_not_ends_with?: InputMaybe<Scalars['String']>;
  currencyConfiguration_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  currencyConfiguration_?: InputMaybe<CurrencyConfiguration_filter>;
  secondaryIncentiveRewarder?: InputMaybe<Scalars['Bytes']>;
  secondaryIncentiveRewarder_not?: InputMaybe<Scalars['Bytes']>;
  secondaryIncentiveRewarder_gt?: InputMaybe<Scalars['Bytes']>;
  secondaryIncentiveRewarder_lt?: InputMaybe<Scalars['Bytes']>;
  secondaryIncentiveRewarder_gte?: InputMaybe<Scalars['Bytes']>;
  secondaryIncentiveRewarder_lte?: InputMaybe<Scalars['Bytes']>;
  secondaryIncentiveRewarder_in?: InputMaybe<Array<Scalars['Bytes']>>;
  secondaryIncentiveRewarder_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  secondaryIncentiveRewarder_contains?: InputMaybe<Scalars['Bytes']>;
  secondaryIncentiveRewarder_not_contains?: InputMaybe<Scalars['Bytes']>;
  incentiveEmissionRate?: InputMaybe<Scalars['BigInt']>;
  incentiveEmissionRate_not?: InputMaybe<Scalars['BigInt']>;
  incentiveEmissionRate_gt?: InputMaybe<Scalars['BigInt']>;
  incentiveEmissionRate_lt?: InputMaybe<Scalars['BigInt']>;
  incentiveEmissionRate_gte?: InputMaybe<Scalars['BigInt']>;
  incentiveEmissionRate_lte?: InputMaybe<Scalars['BigInt']>;
  incentiveEmissionRate_in?: InputMaybe<Array<Scalars['BigInt']>>;
  incentiveEmissionRate_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  accumulatedNOTEPerNToken?: InputMaybe<Scalars['BigInt']>;
  accumulatedNOTEPerNToken_not?: InputMaybe<Scalars['BigInt']>;
  accumulatedNOTEPerNToken_gt?: InputMaybe<Scalars['BigInt']>;
  accumulatedNOTEPerNToken_lt?: InputMaybe<Scalars['BigInt']>;
  accumulatedNOTEPerNToken_gte?: InputMaybe<Scalars['BigInt']>;
  accumulatedNOTEPerNToken_lte?: InputMaybe<Scalars['BigInt']>;
  accumulatedNOTEPerNToken_in?: InputMaybe<Array<Scalars['BigInt']>>;
  accumulatedNOTEPerNToken_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  lastAccumulatedTime?: InputMaybe<Scalars['BigInt']>;
  lastAccumulatedTime_not?: InputMaybe<Scalars['BigInt']>;
  lastAccumulatedTime_gt?: InputMaybe<Scalars['BigInt']>;
  lastAccumulatedTime_lt?: InputMaybe<Scalars['BigInt']>;
  lastAccumulatedTime_gte?: InputMaybe<Scalars['BigInt']>;
  lastAccumulatedTime_lte?: InputMaybe<Scalars['BigInt']>;
  lastAccumulatedTime_in?: InputMaybe<Array<Scalars['BigInt']>>;
  lastAccumulatedTime_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  deprecated_lastSupplyChangeTime?: InputMaybe<Scalars['BigInt']>;
  deprecated_lastSupplyChangeTime_not?: InputMaybe<Scalars['BigInt']>;
  deprecated_lastSupplyChangeTime_gt?: InputMaybe<Scalars['BigInt']>;
  deprecated_lastSupplyChangeTime_lt?: InputMaybe<Scalars['BigInt']>;
  deprecated_lastSupplyChangeTime_gte?: InputMaybe<Scalars['BigInt']>;
  deprecated_lastSupplyChangeTime_lte?: InputMaybe<Scalars['BigInt']>;
  deprecated_lastSupplyChangeTime_in?: InputMaybe<Array<Scalars['BigInt']>>;
  deprecated_lastSupplyChangeTime_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  deprecated_integralTotalSupply?: InputMaybe<Scalars['BigInt']>;
  deprecated_integralTotalSupply_not?: InputMaybe<Scalars['BigInt']>;
  deprecated_integralTotalSupply_gt?: InputMaybe<Scalars['BigInt']>;
  deprecated_integralTotalSupply_lt?: InputMaybe<Scalars['BigInt']>;
  deprecated_integralTotalSupply_gte?: InputMaybe<Scalars['BigInt']>;
  deprecated_integralTotalSupply_lte?: InputMaybe<Scalars['BigInt']>;
  deprecated_integralTotalSupply_in?: InputMaybe<Array<Scalars['BigInt']>>;
  deprecated_integralTotalSupply_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  migrationEmissionRate?: InputMaybe<Scalars['BigInt']>;
  migrationEmissionRate_not?: InputMaybe<Scalars['BigInt']>;
  migrationEmissionRate_gt?: InputMaybe<Scalars['BigInt']>;
  migrationEmissionRate_lt?: InputMaybe<Scalars['BigInt']>;
  migrationEmissionRate_gte?: InputMaybe<Scalars['BigInt']>;
  migrationEmissionRate_lte?: InputMaybe<Scalars['BigInt']>;
  migrationEmissionRate_in?: InputMaybe<Array<Scalars['BigInt']>>;
  migrationEmissionRate_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  finalIntegralTotalSupply?: InputMaybe<Scalars['BigInt']>;
  finalIntegralTotalSupply_not?: InputMaybe<Scalars['BigInt']>;
  finalIntegralTotalSupply_gt?: InputMaybe<Scalars['BigInt']>;
  finalIntegralTotalSupply_lt?: InputMaybe<Scalars['BigInt']>;
  finalIntegralTotalSupply_gte?: InputMaybe<Scalars['BigInt']>;
  finalIntegralTotalSupply_lte?: InputMaybe<Scalars['BigInt']>;
  finalIntegralTotalSupply_in?: InputMaybe<Array<Scalars['BigInt']>>;
  finalIntegralTotalSupply_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  migrationTime?: InputMaybe<Scalars['BigInt']>;
  migrationTime_not?: InputMaybe<Scalars['BigInt']>;
  migrationTime_gt?: InputMaybe<Scalars['BigInt']>;
  migrationTime_lt?: InputMaybe<Scalars['BigInt']>;
  migrationTime_gte?: InputMaybe<Scalars['BigInt']>;
  migrationTime_lte?: InputMaybe<Scalars['BigInt']>;
  migrationTime_in?: InputMaybe<Array<Scalars['BigInt']>>;
  migrationTime_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  currentSecondaryReward?: InputMaybe<Scalars['String']>;
  currentSecondaryReward_not?: InputMaybe<Scalars['String']>;
  currentSecondaryReward_gt?: InputMaybe<Scalars['String']>;
  currentSecondaryReward_lt?: InputMaybe<Scalars['String']>;
  currentSecondaryReward_gte?: InputMaybe<Scalars['String']>;
  currentSecondaryReward_lte?: InputMaybe<Scalars['String']>;
  currentSecondaryReward_in?: InputMaybe<Array<Scalars['String']>>;
  currentSecondaryReward_not_in?: InputMaybe<Array<Scalars['String']>>;
  currentSecondaryReward_contains?: InputMaybe<Scalars['String']>;
  currentSecondaryReward_contains_nocase?: InputMaybe<Scalars['String']>;
  currentSecondaryReward_not_contains?: InputMaybe<Scalars['String']>;
  currentSecondaryReward_not_contains_nocase?: InputMaybe<Scalars['String']>;
  currentSecondaryReward_starts_with?: InputMaybe<Scalars['String']>;
  currentSecondaryReward_starts_with_nocase?: InputMaybe<Scalars['String']>;
  currentSecondaryReward_not_starts_with?: InputMaybe<Scalars['String']>;
  currentSecondaryReward_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  currentSecondaryReward_ends_with?: InputMaybe<Scalars['String']>;
  currentSecondaryReward_ends_with_nocase?: InputMaybe<Scalars['String']>;
  currentSecondaryReward_not_ends_with?: InputMaybe<Scalars['String']>;
  currentSecondaryReward_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  currentSecondaryReward_?: InputMaybe<Token_filter>;
  accumulatedSecondaryRewardPerNToken?: InputMaybe<Scalars['BigInt']>;
  accumulatedSecondaryRewardPerNToken_not?: InputMaybe<Scalars['BigInt']>;
  accumulatedSecondaryRewardPerNToken_gt?: InputMaybe<Scalars['BigInt']>;
  accumulatedSecondaryRewardPerNToken_lt?: InputMaybe<Scalars['BigInt']>;
  accumulatedSecondaryRewardPerNToken_gte?: InputMaybe<Scalars['BigInt']>;
  accumulatedSecondaryRewardPerNToken_lte?: InputMaybe<Scalars['BigInt']>;
  accumulatedSecondaryRewardPerNToken_in?: InputMaybe<Array<Scalars['BigInt']>>;
  accumulatedSecondaryRewardPerNToken_not_in?: InputMaybe<
    Array<Scalars['BigInt']>
  >;
  lastSecondaryAccumulatedTime?: InputMaybe<Scalars['BigInt']>;
  lastSecondaryAccumulatedTime_not?: InputMaybe<Scalars['BigInt']>;
  lastSecondaryAccumulatedTime_gt?: InputMaybe<Scalars['BigInt']>;
  lastSecondaryAccumulatedTime_lt?: InputMaybe<Scalars['BigInt']>;
  lastSecondaryAccumulatedTime_gte?: InputMaybe<Scalars['BigInt']>;
  lastSecondaryAccumulatedTime_lte?: InputMaybe<Scalars['BigInt']>;
  lastSecondaryAccumulatedTime_in?: InputMaybe<Array<Scalars['BigInt']>>;
  lastSecondaryAccumulatedTime_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  secondaryEmissionRate?: InputMaybe<Scalars['BigInt']>;
  secondaryEmissionRate_not?: InputMaybe<Scalars['BigInt']>;
  secondaryEmissionRate_gt?: InputMaybe<Scalars['BigInt']>;
  secondaryEmissionRate_lt?: InputMaybe<Scalars['BigInt']>;
  secondaryEmissionRate_gte?: InputMaybe<Scalars['BigInt']>;
  secondaryEmissionRate_lte?: InputMaybe<Scalars['BigInt']>;
  secondaryEmissionRate_in?: InputMaybe<Array<Scalars['BigInt']>>;
  secondaryEmissionRate_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  secondaryRewardEndTime?: InputMaybe<Scalars['BigInt']>;
  secondaryRewardEndTime_not?: InputMaybe<Scalars['BigInt']>;
  secondaryRewardEndTime_gt?: InputMaybe<Scalars['BigInt']>;
  secondaryRewardEndTime_lt?: InputMaybe<Scalars['BigInt']>;
  secondaryRewardEndTime_gte?: InputMaybe<Scalars['BigInt']>;
  secondaryRewardEndTime_lte?: InputMaybe<Scalars['BigInt']>;
  secondaryRewardEndTime_in?: InputMaybe<Array<Scalars['BigInt']>>;
  secondaryRewardEndTime_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<Incentive_filter>>>;
  or?: InputMaybe<Array<InputMaybe<Incentive_filter>>>;
};

export type Incentive_orderBy =
  | 'id'
  | 'lastUpdateBlockNumber'
  | 'lastUpdateTimestamp'
  | 'lastUpdateTransactionHash'
  | 'currencyConfiguration'
  | 'currencyConfiguration__id'
  | 'currencyConfiguration__lastUpdateBlockNumber'
  | 'currencyConfiguration__lastUpdateTimestamp'
  | 'currencyConfiguration__lastUpdateTransactionHash'
  | 'currencyConfiguration__maxUnderlyingSupply'
  | 'currencyConfiguration__maxPrimeDebtUtilization'
  | 'currencyConfiguration__collateralHaircut'
  | 'currencyConfiguration__debtBuffer'
  | 'currencyConfiguration__liquidationDiscount'
  | 'currencyConfiguration__primeCashRateOracleTimeWindowSeconds'
  | 'currencyConfiguration__primeCashHoldingsOracle'
  | 'currencyConfiguration__primeDebtAllowed'
  | 'currencyConfiguration__fCashRateOracleTimeWindowSeconds'
  | 'currencyConfiguration__fCashReserveFeeSharePercent'
  | 'currencyConfiguration__fCashDebtBufferBasisPoints'
  | 'currencyConfiguration__fCashHaircutBasisPoints'
  | 'currencyConfiguration__fCashMinOracleRate'
  | 'currencyConfiguration__fCashMaxOracleRate'
  | 'currencyConfiguration__fCashMaxDiscountFactor'
  | 'currencyConfiguration__fCashLiquidationHaircutBasisPoints'
  | 'currencyConfiguration__fCashLiquidationDebtBufferBasisPoints'
  | 'currencyConfiguration__treasuryReserveBuffer'
  | 'currencyConfiguration__residualPurchaseIncentiveBasisPoints'
  | 'currencyConfiguration__residualPurchaseTimeBufferSeconds'
  | 'currencyConfiguration__cashWithholdingBufferBasisPoints'
  | 'currencyConfiguration__pvHaircutPercentage'
  | 'currencyConfiguration__liquidationHaircutPercentage'
  | 'currencyConfiguration__maxMintDeviationBasisPoints'
  | 'secondaryIncentiveRewarder'
  | 'incentiveEmissionRate'
  | 'accumulatedNOTEPerNToken'
  | 'lastAccumulatedTime'
  | 'deprecated_lastSupplyChangeTime'
  | 'deprecated_integralTotalSupply'
  | 'migrationEmissionRate'
  | 'finalIntegralTotalSupply'
  | 'migrationTime'
  | 'currentSecondaryReward'
  | 'currentSecondaryReward__id'
  | 'currentSecondaryReward__firstUpdateBlockNumber'
  | 'currentSecondaryReward__firstUpdateTimestamp'
  | 'currentSecondaryReward__firstUpdateTransactionHash'
  | 'currentSecondaryReward__lastUpdateBlockNumber'
  | 'currentSecondaryReward__lastUpdateTimestamp'
  | 'currentSecondaryReward__lastUpdateTransactionHash'
  | 'currentSecondaryReward__tokenType'
  | 'currentSecondaryReward__tokenInterface'
  | 'currentSecondaryReward__currencyId'
  | 'currentSecondaryReward__name'
  | 'currentSecondaryReward__symbol'
  | 'currentSecondaryReward__decimals'
  | 'currentSecondaryReward__precision'
  | 'currentSecondaryReward__totalSupply'
  | 'currentSecondaryReward__hasTransferFee'
  | 'currentSecondaryReward__isfCashDebt'
  | 'currentSecondaryReward__maturity'
  | 'currentSecondaryReward__vaultAddress'
  | 'currentSecondaryReward__tokenAddress'
  | 'accumulatedSecondaryRewardPerNToken'
  | 'lastSecondaryAccumulatedTime'
  | 'secondaryEmissionRate'
  | 'secondaryRewardEndTime';

export type InterestRateCurve = {
  /** ID is the currency id:market index:true if current */
  id: Scalars['ID'];
  lastUpdateBlockNumber: Scalars['BigInt'];
  lastUpdateTimestamp: Scalars['Int'];
  lastUpdateTransactionHash: Scalars['Bytes'];
  kinkUtilization1: Scalars['Int'];
  kinkUtilization2: Scalars['Int'];
  kinkRate1: Scalars['Int'];
  kinkRate2: Scalars['Int'];
  maxRate: Scalars['Int'];
  minFeeRate: Scalars['Int'];
  maxFeeRate: Scalars['Int'];
  feeRatePercent: Scalars['Int'];
};

export type InterestRateCurve_filter = {
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
  kinkUtilization1?: InputMaybe<Scalars['Int']>;
  kinkUtilization1_not?: InputMaybe<Scalars['Int']>;
  kinkUtilization1_gt?: InputMaybe<Scalars['Int']>;
  kinkUtilization1_lt?: InputMaybe<Scalars['Int']>;
  kinkUtilization1_gte?: InputMaybe<Scalars['Int']>;
  kinkUtilization1_lte?: InputMaybe<Scalars['Int']>;
  kinkUtilization1_in?: InputMaybe<Array<Scalars['Int']>>;
  kinkUtilization1_not_in?: InputMaybe<Array<Scalars['Int']>>;
  kinkUtilization2?: InputMaybe<Scalars['Int']>;
  kinkUtilization2_not?: InputMaybe<Scalars['Int']>;
  kinkUtilization2_gt?: InputMaybe<Scalars['Int']>;
  kinkUtilization2_lt?: InputMaybe<Scalars['Int']>;
  kinkUtilization2_gte?: InputMaybe<Scalars['Int']>;
  kinkUtilization2_lte?: InputMaybe<Scalars['Int']>;
  kinkUtilization2_in?: InputMaybe<Array<Scalars['Int']>>;
  kinkUtilization2_not_in?: InputMaybe<Array<Scalars['Int']>>;
  kinkRate1?: InputMaybe<Scalars['Int']>;
  kinkRate1_not?: InputMaybe<Scalars['Int']>;
  kinkRate1_gt?: InputMaybe<Scalars['Int']>;
  kinkRate1_lt?: InputMaybe<Scalars['Int']>;
  kinkRate1_gte?: InputMaybe<Scalars['Int']>;
  kinkRate1_lte?: InputMaybe<Scalars['Int']>;
  kinkRate1_in?: InputMaybe<Array<Scalars['Int']>>;
  kinkRate1_not_in?: InputMaybe<Array<Scalars['Int']>>;
  kinkRate2?: InputMaybe<Scalars['Int']>;
  kinkRate2_not?: InputMaybe<Scalars['Int']>;
  kinkRate2_gt?: InputMaybe<Scalars['Int']>;
  kinkRate2_lt?: InputMaybe<Scalars['Int']>;
  kinkRate2_gte?: InputMaybe<Scalars['Int']>;
  kinkRate2_lte?: InputMaybe<Scalars['Int']>;
  kinkRate2_in?: InputMaybe<Array<Scalars['Int']>>;
  kinkRate2_not_in?: InputMaybe<Array<Scalars['Int']>>;
  maxRate?: InputMaybe<Scalars['Int']>;
  maxRate_not?: InputMaybe<Scalars['Int']>;
  maxRate_gt?: InputMaybe<Scalars['Int']>;
  maxRate_lt?: InputMaybe<Scalars['Int']>;
  maxRate_gte?: InputMaybe<Scalars['Int']>;
  maxRate_lte?: InputMaybe<Scalars['Int']>;
  maxRate_in?: InputMaybe<Array<Scalars['Int']>>;
  maxRate_not_in?: InputMaybe<Array<Scalars['Int']>>;
  minFeeRate?: InputMaybe<Scalars['Int']>;
  minFeeRate_not?: InputMaybe<Scalars['Int']>;
  minFeeRate_gt?: InputMaybe<Scalars['Int']>;
  minFeeRate_lt?: InputMaybe<Scalars['Int']>;
  minFeeRate_gte?: InputMaybe<Scalars['Int']>;
  minFeeRate_lte?: InputMaybe<Scalars['Int']>;
  minFeeRate_in?: InputMaybe<Array<Scalars['Int']>>;
  minFeeRate_not_in?: InputMaybe<Array<Scalars['Int']>>;
  maxFeeRate?: InputMaybe<Scalars['Int']>;
  maxFeeRate_not?: InputMaybe<Scalars['Int']>;
  maxFeeRate_gt?: InputMaybe<Scalars['Int']>;
  maxFeeRate_lt?: InputMaybe<Scalars['Int']>;
  maxFeeRate_gte?: InputMaybe<Scalars['Int']>;
  maxFeeRate_lte?: InputMaybe<Scalars['Int']>;
  maxFeeRate_in?: InputMaybe<Array<Scalars['Int']>>;
  maxFeeRate_not_in?: InputMaybe<Array<Scalars['Int']>>;
  feeRatePercent?: InputMaybe<Scalars['Int']>;
  feeRatePercent_not?: InputMaybe<Scalars['Int']>;
  feeRatePercent_gt?: InputMaybe<Scalars['Int']>;
  feeRatePercent_lt?: InputMaybe<Scalars['Int']>;
  feeRatePercent_gte?: InputMaybe<Scalars['Int']>;
  feeRatePercent_lte?: InputMaybe<Scalars['Int']>;
  feeRatePercent_in?: InputMaybe<Array<Scalars['Int']>>;
  feeRatePercent_not_in?: InputMaybe<Array<Scalars['Int']>>;
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<InterestRateCurve_filter>>>;
  or?: InputMaybe<Array<InputMaybe<InterestRateCurve_filter>>>;
};

export type InterestRateCurve_orderBy =
  | 'id'
  | 'lastUpdateBlockNumber'
  | 'lastUpdateTimestamp'
  | 'lastUpdateTransactionHash'
  | 'kinkUtilization1'
  | 'kinkUtilization2'
  | 'kinkRate1'
  | 'kinkRate2'
  | 'maxRate'
  | 'minFeeRate'
  | 'maxFeeRate'
  | 'feeRatePercent';

export type Oracle = {
  /** Base Token Id:Quote Token Id:Oracle Type */
  id: Scalars['ID'];
  lastUpdateBlockNumber: Scalars['BigInt'];
  lastUpdateTimestamp: Scalars['Int'];
  /** Some oracles are updated via block handlers and do not have a txn hash for updates */
  lastUpdateTransaction?: Maybe<Transaction>;
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
  /** Underlying tokens that have fCash listed */
  fCashEnabled: Array<Token>;
  /** Vault Addresses */
  listedVaults: Array<Scalars['Bytes']>;
};

export type OracleRegistrychainlinkOraclesArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Oracle_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<Oracle_filter>;
};

export type OracleRegistryfCashEnabledArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Token_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<Token_filter>;
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
  fCashEnabled?: InputMaybe<Array<Scalars['String']>>;
  fCashEnabled_not?: InputMaybe<Array<Scalars['String']>>;
  fCashEnabled_contains?: InputMaybe<Array<Scalars['String']>>;
  fCashEnabled_contains_nocase?: InputMaybe<Array<Scalars['String']>>;
  fCashEnabled_not_contains?: InputMaybe<Array<Scalars['String']>>;
  fCashEnabled_not_contains_nocase?: InputMaybe<Array<Scalars['String']>>;
  fCashEnabled_?: InputMaybe<Token_filter>;
  listedVaults?: InputMaybe<Array<Scalars['Bytes']>>;
  listedVaults_not?: InputMaybe<Array<Scalars['Bytes']>>;
  listedVaults_contains?: InputMaybe<Array<Scalars['Bytes']>>;
  listedVaults_contains_nocase?: InputMaybe<Array<Scalars['Bytes']>>;
  listedVaults_not_contains?: InputMaybe<Array<Scalars['Bytes']>>;
  listedVaults_not_contains_nocase?: InputMaybe<Array<Scalars['Bytes']>>;
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
  | 'fCashEnabled'
  | 'listedVaults';

export type OracleType =
  | 'Chainlink'
  | 'fCashOracleRate'
  | 'fCashSettlementRate'
  | 'fCashToUnderlyingExchangeRate'
  | 'fCashSpotRate'
  | 'PrimeCashToUnderlyingOracleInterestRate'
  | 'PrimeCashPremiumInterestRate'
  | 'PrimeDebtPremiumInterestRate'
  | 'PrimeCashExternalLendingInterestRate'
  | 'PrimeCashToUnderlyingExchangeRate'
  | 'PrimeCashToMoneyMarketExchangeRate'
  | 'PrimeDebtToUnderlyingExchangeRate'
  | 'PrimeDebtToMoneyMarketExchangeRate'
  | 'MoneyMarketToUnderlyingExchangeRate'
  | 'VaultShareOracleRate'
  | 'VaultShareInterestAccrued'
  | 'nTokenToUnderlyingExchangeRate'
  | 'nTokenBlendedInterestRate'
  | 'nTokenInterestAccrued'
  | 'nTokenFeeRate'
  | 'nTokenIncentiveRate'
  | 'nTokenSecondaryIncentiveRate';

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
  lastUpdateTransaction?: InputMaybe<Scalars['String']>;
  lastUpdateTransaction_not?: InputMaybe<Scalars['String']>;
  lastUpdateTransaction_gt?: InputMaybe<Scalars['String']>;
  lastUpdateTransaction_lt?: InputMaybe<Scalars['String']>;
  lastUpdateTransaction_gte?: InputMaybe<Scalars['String']>;
  lastUpdateTransaction_lte?: InputMaybe<Scalars['String']>;
  lastUpdateTransaction_in?: InputMaybe<Array<Scalars['String']>>;
  lastUpdateTransaction_not_in?: InputMaybe<Array<Scalars['String']>>;
  lastUpdateTransaction_contains?: InputMaybe<Scalars['String']>;
  lastUpdateTransaction_contains_nocase?: InputMaybe<Scalars['String']>;
  lastUpdateTransaction_not_contains?: InputMaybe<Scalars['String']>;
  lastUpdateTransaction_not_contains_nocase?: InputMaybe<Scalars['String']>;
  lastUpdateTransaction_starts_with?: InputMaybe<Scalars['String']>;
  lastUpdateTransaction_starts_with_nocase?: InputMaybe<Scalars['String']>;
  lastUpdateTransaction_not_starts_with?: InputMaybe<Scalars['String']>;
  lastUpdateTransaction_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  lastUpdateTransaction_ends_with?: InputMaybe<Scalars['String']>;
  lastUpdateTransaction_ends_with_nocase?: InputMaybe<Scalars['String']>;
  lastUpdateTransaction_not_ends_with?: InputMaybe<Scalars['String']>;
  lastUpdateTransaction_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  lastUpdateTransaction_?: InputMaybe<Transaction_filter>;
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
  | 'lastUpdateTransaction'
  | 'lastUpdateTransaction__id'
  | 'lastUpdateTransaction__blockNumber'
  | 'lastUpdateTransaction__timestamp'
  | 'lastUpdateTransaction__transactionHash'
  | 'lastUpdateTransaction___nextStartIndex'
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
  | 'base__currencyId'
  | 'base__name'
  | 'base__symbol'
  | 'base__decimals'
  | 'base__precision'
  | 'base__totalSupply'
  | 'base__hasTransferFee'
  | 'base__isfCashDebt'
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
  | 'quote__currencyId'
  | 'quote__name'
  | 'quote__symbol'
  | 'quote__decimals'
  | 'quote__precision'
  | 'quote__totalSupply'
  | 'quote__hasTransferFee'
  | 'quote__isfCashDebt'
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
export type OrderDirection = 'asc' | 'desc';

export type PrimeCashMarket = {
  /** Currency ID */
  id: Scalars['ID'];
  lastUpdateBlockNumber: Scalars['BigInt'];
  lastUpdateTimestamp: Scalars['Int'];
  lastUpdateTransaction?: Maybe<Transaction>;
  /** Currency of this market */
  underlying: Token;
  /** Prime Cash token for this market */
  primeCash: Token;
  /** Prime Debt token for this market */
  primeDebt?: Maybe<Token>;
  current: PrimeCashMarketSnapshot;
  snapshots?: Maybe<Array<PrimeCashMarketSnapshot>>;
};

export type PrimeCashMarketsnapshotsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<PrimeCashMarketSnapshot_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<PrimeCashMarketSnapshot_filter>;
};

export type PrimeCashMarketSnapshot = {
  /** Currency ID:Block Number:Transaction Hash */
  id: Scalars['ID'];
  blockNumber: Scalars['BigInt'];
  timestamp: Scalars['Int'];
  transaction?: Maybe<Transaction>;
  market: PrimeCashMarket;
  /** Total Prime Cash Supply */
  totalPrimeCash: Scalars['BigInt'];
  /** Total Prime Debt */
  totalPrimeDebt: Scalars['BigInt'];
  /** Total underlying held by the contract */
  totalUnderlyingHeld: Scalars['BigInt'];
  /** Total prime cash converted to underlying */
  totalPrimeCashInUnderlying?: Maybe<Scalars['BigInt']>;
  /** Total prime debt converted to underlying */
  totalPrimeDebtInUnderlying?: Maybe<Scalars['BigInt']>;
  /** Snapshot value of the supply scalar */
  supplyScalar: Scalars['BigInt'];
  /** Snapshot value of the debt scalar */
  debtScalar: Scalars['BigInt'];
  /** Snapshot value of the underlying scalar */
  underlyingScalar: Scalars['BigInt'];
  /** Prime cash premium interest rate */
  supplyInterestRate?: Maybe<Scalars['BigInt']>;
  /** Prime debt premium interest rate */
  debtInterestRate?: Maybe<Scalars['BigInt']>;
  /** External lending interest rate */
  externalLendingRate?: Maybe<Scalars['BigInt']>;
};

export type PrimeCashMarketSnapshot_filter = {
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
  transaction?: InputMaybe<Scalars['String']>;
  transaction_not?: InputMaybe<Scalars['String']>;
  transaction_gt?: InputMaybe<Scalars['String']>;
  transaction_lt?: InputMaybe<Scalars['String']>;
  transaction_gte?: InputMaybe<Scalars['String']>;
  transaction_lte?: InputMaybe<Scalars['String']>;
  transaction_in?: InputMaybe<Array<Scalars['String']>>;
  transaction_not_in?: InputMaybe<Array<Scalars['String']>>;
  transaction_contains?: InputMaybe<Scalars['String']>;
  transaction_contains_nocase?: InputMaybe<Scalars['String']>;
  transaction_not_contains?: InputMaybe<Scalars['String']>;
  transaction_not_contains_nocase?: InputMaybe<Scalars['String']>;
  transaction_starts_with?: InputMaybe<Scalars['String']>;
  transaction_starts_with_nocase?: InputMaybe<Scalars['String']>;
  transaction_not_starts_with?: InputMaybe<Scalars['String']>;
  transaction_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  transaction_ends_with?: InputMaybe<Scalars['String']>;
  transaction_ends_with_nocase?: InputMaybe<Scalars['String']>;
  transaction_not_ends_with?: InputMaybe<Scalars['String']>;
  transaction_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  transaction_?: InputMaybe<Transaction_filter>;
  market?: InputMaybe<Scalars['String']>;
  market_not?: InputMaybe<Scalars['String']>;
  market_gt?: InputMaybe<Scalars['String']>;
  market_lt?: InputMaybe<Scalars['String']>;
  market_gte?: InputMaybe<Scalars['String']>;
  market_lte?: InputMaybe<Scalars['String']>;
  market_in?: InputMaybe<Array<Scalars['String']>>;
  market_not_in?: InputMaybe<Array<Scalars['String']>>;
  market_contains?: InputMaybe<Scalars['String']>;
  market_contains_nocase?: InputMaybe<Scalars['String']>;
  market_not_contains?: InputMaybe<Scalars['String']>;
  market_not_contains_nocase?: InputMaybe<Scalars['String']>;
  market_starts_with?: InputMaybe<Scalars['String']>;
  market_starts_with_nocase?: InputMaybe<Scalars['String']>;
  market_not_starts_with?: InputMaybe<Scalars['String']>;
  market_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  market_ends_with?: InputMaybe<Scalars['String']>;
  market_ends_with_nocase?: InputMaybe<Scalars['String']>;
  market_not_ends_with?: InputMaybe<Scalars['String']>;
  market_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  market_?: InputMaybe<PrimeCashMarket_filter>;
  totalPrimeCash?: InputMaybe<Scalars['BigInt']>;
  totalPrimeCash_not?: InputMaybe<Scalars['BigInt']>;
  totalPrimeCash_gt?: InputMaybe<Scalars['BigInt']>;
  totalPrimeCash_lt?: InputMaybe<Scalars['BigInt']>;
  totalPrimeCash_gte?: InputMaybe<Scalars['BigInt']>;
  totalPrimeCash_lte?: InputMaybe<Scalars['BigInt']>;
  totalPrimeCash_in?: InputMaybe<Array<Scalars['BigInt']>>;
  totalPrimeCash_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  totalPrimeDebt?: InputMaybe<Scalars['BigInt']>;
  totalPrimeDebt_not?: InputMaybe<Scalars['BigInt']>;
  totalPrimeDebt_gt?: InputMaybe<Scalars['BigInt']>;
  totalPrimeDebt_lt?: InputMaybe<Scalars['BigInt']>;
  totalPrimeDebt_gte?: InputMaybe<Scalars['BigInt']>;
  totalPrimeDebt_lte?: InputMaybe<Scalars['BigInt']>;
  totalPrimeDebt_in?: InputMaybe<Array<Scalars['BigInt']>>;
  totalPrimeDebt_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  totalUnderlyingHeld?: InputMaybe<Scalars['BigInt']>;
  totalUnderlyingHeld_not?: InputMaybe<Scalars['BigInt']>;
  totalUnderlyingHeld_gt?: InputMaybe<Scalars['BigInt']>;
  totalUnderlyingHeld_lt?: InputMaybe<Scalars['BigInt']>;
  totalUnderlyingHeld_gte?: InputMaybe<Scalars['BigInt']>;
  totalUnderlyingHeld_lte?: InputMaybe<Scalars['BigInt']>;
  totalUnderlyingHeld_in?: InputMaybe<Array<Scalars['BigInt']>>;
  totalUnderlyingHeld_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  totalPrimeCashInUnderlying?: InputMaybe<Scalars['BigInt']>;
  totalPrimeCashInUnderlying_not?: InputMaybe<Scalars['BigInt']>;
  totalPrimeCashInUnderlying_gt?: InputMaybe<Scalars['BigInt']>;
  totalPrimeCashInUnderlying_lt?: InputMaybe<Scalars['BigInt']>;
  totalPrimeCashInUnderlying_gte?: InputMaybe<Scalars['BigInt']>;
  totalPrimeCashInUnderlying_lte?: InputMaybe<Scalars['BigInt']>;
  totalPrimeCashInUnderlying_in?: InputMaybe<Array<Scalars['BigInt']>>;
  totalPrimeCashInUnderlying_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  totalPrimeDebtInUnderlying?: InputMaybe<Scalars['BigInt']>;
  totalPrimeDebtInUnderlying_not?: InputMaybe<Scalars['BigInt']>;
  totalPrimeDebtInUnderlying_gt?: InputMaybe<Scalars['BigInt']>;
  totalPrimeDebtInUnderlying_lt?: InputMaybe<Scalars['BigInt']>;
  totalPrimeDebtInUnderlying_gte?: InputMaybe<Scalars['BigInt']>;
  totalPrimeDebtInUnderlying_lte?: InputMaybe<Scalars['BigInt']>;
  totalPrimeDebtInUnderlying_in?: InputMaybe<Array<Scalars['BigInt']>>;
  totalPrimeDebtInUnderlying_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  supplyScalar?: InputMaybe<Scalars['BigInt']>;
  supplyScalar_not?: InputMaybe<Scalars['BigInt']>;
  supplyScalar_gt?: InputMaybe<Scalars['BigInt']>;
  supplyScalar_lt?: InputMaybe<Scalars['BigInt']>;
  supplyScalar_gte?: InputMaybe<Scalars['BigInt']>;
  supplyScalar_lte?: InputMaybe<Scalars['BigInt']>;
  supplyScalar_in?: InputMaybe<Array<Scalars['BigInt']>>;
  supplyScalar_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  debtScalar?: InputMaybe<Scalars['BigInt']>;
  debtScalar_not?: InputMaybe<Scalars['BigInt']>;
  debtScalar_gt?: InputMaybe<Scalars['BigInt']>;
  debtScalar_lt?: InputMaybe<Scalars['BigInt']>;
  debtScalar_gte?: InputMaybe<Scalars['BigInt']>;
  debtScalar_lte?: InputMaybe<Scalars['BigInt']>;
  debtScalar_in?: InputMaybe<Array<Scalars['BigInt']>>;
  debtScalar_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  underlyingScalar?: InputMaybe<Scalars['BigInt']>;
  underlyingScalar_not?: InputMaybe<Scalars['BigInt']>;
  underlyingScalar_gt?: InputMaybe<Scalars['BigInt']>;
  underlyingScalar_lt?: InputMaybe<Scalars['BigInt']>;
  underlyingScalar_gte?: InputMaybe<Scalars['BigInt']>;
  underlyingScalar_lte?: InputMaybe<Scalars['BigInt']>;
  underlyingScalar_in?: InputMaybe<Array<Scalars['BigInt']>>;
  underlyingScalar_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  supplyInterestRate?: InputMaybe<Scalars['BigInt']>;
  supplyInterestRate_not?: InputMaybe<Scalars['BigInt']>;
  supplyInterestRate_gt?: InputMaybe<Scalars['BigInt']>;
  supplyInterestRate_lt?: InputMaybe<Scalars['BigInt']>;
  supplyInterestRate_gte?: InputMaybe<Scalars['BigInt']>;
  supplyInterestRate_lte?: InputMaybe<Scalars['BigInt']>;
  supplyInterestRate_in?: InputMaybe<Array<Scalars['BigInt']>>;
  supplyInterestRate_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  debtInterestRate?: InputMaybe<Scalars['BigInt']>;
  debtInterestRate_not?: InputMaybe<Scalars['BigInt']>;
  debtInterestRate_gt?: InputMaybe<Scalars['BigInt']>;
  debtInterestRate_lt?: InputMaybe<Scalars['BigInt']>;
  debtInterestRate_gte?: InputMaybe<Scalars['BigInt']>;
  debtInterestRate_lte?: InputMaybe<Scalars['BigInt']>;
  debtInterestRate_in?: InputMaybe<Array<Scalars['BigInt']>>;
  debtInterestRate_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  externalLendingRate?: InputMaybe<Scalars['BigInt']>;
  externalLendingRate_not?: InputMaybe<Scalars['BigInt']>;
  externalLendingRate_gt?: InputMaybe<Scalars['BigInt']>;
  externalLendingRate_lt?: InputMaybe<Scalars['BigInt']>;
  externalLendingRate_gte?: InputMaybe<Scalars['BigInt']>;
  externalLendingRate_lte?: InputMaybe<Scalars['BigInt']>;
  externalLendingRate_in?: InputMaybe<Array<Scalars['BigInt']>>;
  externalLendingRate_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<PrimeCashMarketSnapshot_filter>>>;
  or?: InputMaybe<Array<InputMaybe<PrimeCashMarketSnapshot_filter>>>;
};

export type PrimeCashMarketSnapshot_orderBy =
  | 'id'
  | 'blockNumber'
  | 'timestamp'
  | 'transaction'
  | 'transaction__id'
  | 'transaction__blockNumber'
  | 'transaction__timestamp'
  | 'transaction__transactionHash'
  | 'transaction___nextStartIndex'
  | 'market'
  | 'market__id'
  | 'market__lastUpdateBlockNumber'
  | 'market__lastUpdateTimestamp'
  | 'totalPrimeCash'
  | 'totalPrimeDebt'
  | 'totalUnderlyingHeld'
  | 'totalPrimeCashInUnderlying'
  | 'totalPrimeDebtInUnderlying'
  | 'supplyScalar'
  | 'debtScalar'
  | 'underlyingScalar'
  | 'supplyInterestRate'
  | 'debtInterestRate'
  | 'externalLendingRate';

export type PrimeCashMarket_filter = {
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
  lastUpdateTransaction?: InputMaybe<Scalars['String']>;
  lastUpdateTransaction_not?: InputMaybe<Scalars['String']>;
  lastUpdateTransaction_gt?: InputMaybe<Scalars['String']>;
  lastUpdateTransaction_lt?: InputMaybe<Scalars['String']>;
  lastUpdateTransaction_gte?: InputMaybe<Scalars['String']>;
  lastUpdateTransaction_lte?: InputMaybe<Scalars['String']>;
  lastUpdateTransaction_in?: InputMaybe<Array<Scalars['String']>>;
  lastUpdateTransaction_not_in?: InputMaybe<Array<Scalars['String']>>;
  lastUpdateTransaction_contains?: InputMaybe<Scalars['String']>;
  lastUpdateTransaction_contains_nocase?: InputMaybe<Scalars['String']>;
  lastUpdateTransaction_not_contains?: InputMaybe<Scalars['String']>;
  lastUpdateTransaction_not_contains_nocase?: InputMaybe<Scalars['String']>;
  lastUpdateTransaction_starts_with?: InputMaybe<Scalars['String']>;
  lastUpdateTransaction_starts_with_nocase?: InputMaybe<Scalars['String']>;
  lastUpdateTransaction_not_starts_with?: InputMaybe<Scalars['String']>;
  lastUpdateTransaction_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  lastUpdateTransaction_ends_with?: InputMaybe<Scalars['String']>;
  lastUpdateTransaction_ends_with_nocase?: InputMaybe<Scalars['String']>;
  lastUpdateTransaction_not_ends_with?: InputMaybe<Scalars['String']>;
  lastUpdateTransaction_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  lastUpdateTransaction_?: InputMaybe<Transaction_filter>;
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
  primeCash?: InputMaybe<Scalars['String']>;
  primeCash_not?: InputMaybe<Scalars['String']>;
  primeCash_gt?: InputMaybe<Scalars['String']>;
  primeCash_lt?: InputMaybe<Scalars['String']>;
  primeCash_gte?: InputMaybe<Scalars['String']>;
  primeCash_lte?: InputMaybe<Scalars['String']>;
  primeCash_in?: InputMaybe<Array<Scalars['String']>>;
  primeCash_not_in?: InputMaybe<Array<Scalars['String']>>;
  primeCash_contains?: InputMaybe<Scalars['String']>;
  primeCash_contains_nocase?: InputMaybe<Scalars['String']>;
  primeCash_not_contains?: InputMaybe<Scalars['String']>;
  primeCash_not_contains_nocase?: InputMaybe<Scalars['String']>;
  primeCash_starts_with?: InputMaybe<Scalars['String']>;
  primeCash_starts_with_nocase?: InputMaybe<Scalars['String']>;
  primeCash_not_starts_with?: InputMaybe<Scalars['String']>;
  primeCash_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  primeCash_ends_with?: InputMaybe<Scalars['String']>;
  primeCash_ends_with_nocase?: InputMaybe<Scalars['String']>;
  primeCash_not_ends_with?: InputMaybe<Scalars['String']>;
  primeCash_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  primeCash_?: InputMaybe<Token_filter>;
  primeDebt?: InputMaybe<Scalars['String']>;
  primeDebt_not?: InputMaybe<Scalars['String']>;
  primeDebt_gt?: InputMaybe<Scalars['String']>;
  primeDebt_lt?: InputMaybe<Scalars['String']>;
  primeDebt_gte?: InputMaybe<Scalars['String']>;
  primeDebt_lte?: InputMaybe<Scalars['String']>;
  primeDebt_in?: InputMaybe<Array<Scalars['String']>>;
  primeDebt_not_in?: InputMaybe<Array<Scalars['String']>>;
  primeDebt_contains?: InputMaybe<Scalars['String']>;
  primeDebt_contains_nocase?: InputMaybe<Scalars['String']>;
  primeDebt_not_contains?: InputMaybe<Scalars['String']>;
  primeDebt_not_contains_nocase?: InputMaybe<Scalars['String']>;
  primeDebt_starts_with?: InputMaybe<Scalars['String']>;
  primeDebt_starts_with_nocase?: InputMaybe<Scalars['String']>;
  primeDebt_not_starts_with?: InputMaybe<Scalars['String']>;
  primeDebt_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  primeDebt_ends_with?: InputMaybe<Scalars['String']>;
  primeDebt_ends_with_nocase?: InputMaybe<Scalars['String']>;
  primeDebt_not_ends_with?: InputMaybe<Scalars['String']>;
  primeDebt_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  primeDebt_?: InputMaybe<Token_filter>;
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
  current_?: InputMaybe<PrimeCashMarketSnapshot_filter>;
  snapshots_?: InputMaybe<PrimeCashMarketSnapshot_filter>;
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<PrimeCashMarket_filter>>>;
  or?: InputMaybe<Array<InputMaybe<PrimeCashMarket_filter>>>;
};

export type PrimeCashMarket_orderBy =
  | 'id'
  | 'lastUpdateBlockNumber'
  | 'lastUpdateTimestamp'
  | 'lastUpdateTransaction'
  | 'lastUpdateTransaction__id'
  | 'lastUpdateTransaction__blockNumber'
  | 'lastUpdateTransaction__timestamp'
  | 'lastUpdateTransaction__transactionHash'
  | 'lastUpdateTransaction___nextStartIndex'
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
  | 'underlying__currencyId'
  | 'underlying__name'
  | 'underlying__symbol'
  | 'underlying__decimals'
  | 'underlying__precision'
  | 'underlying__totalSupply'
  | 'underlying__hasTransferFee'
  | 'underlying__isfCashDebt'
  | 'underlying__maturity'
  | 'underlying__vaultAddress'
  | 'underlying__tokenAddress'
  | 'primeCash'
  | 'primeCash__id'
  | 'primeCash__firstUpdateBlockNumber'
  | 'primeCash__firstUpdateTimestamp'
  | 'primeCash__firstUpdateTransactionHash'
  | 'primeCash__lastUpdateBlockNumber'
  | 'primeCash__lastUpdateTimestamp'
  | 'primeCash__lastUpdateTransactionHash'
  | 'primeCash__tokenType'
  | 'primeCash__tokenInterface'
  | 'primeCash__currencyId'
  | 'primeCash__name'
  | 'primeCash__symbol'
  | 'primeCash__decimals'
  | 'primeCash__precision'
  | 'primeCash__totalSupply'
  | 'primeCash__hasTransferFee'
  | 'primeCash__isfCashDebt'
  | 'primeCash__maturity'
  | 'primeCash__vaultAddress'
  | 'primeCash__tokenAddress'
  | 'primeDebt'
  | 'primeDebt__id'
  | 'primeDebt__firstUpdateBlockNumber'
  | 'primeDebt__firstUpdateTimestamp'
  | 'primeDebt__firstUpdateTransactionHash'
  | 'primeDebt__lastUpdateBlockNumber'
  | 'primeDebt__lastUpdateTimestamp'
  | 'primeDebt__lastUpdateTransactionHash'
  | 'primeDebt__tokenType'
  | 'primeDebt__tokenInterface'
  | 'primeDebt__currencyId'
  | 'primeDebt__name'
  | 'primeDebt__symbol'
  | 'primeDebt__decimals'
  | 'primeDebt__precision'
  | 'primeDebt__totalSupply'
  | 'primeDebt__hasTransferFee'
  | 'primeDebt__isfCashDebt'
  | 'primeDebt__maturity'
  | 'primeDebt__vaultAddress'
  | 'primeDebt__tokenAddress'
  | 'current'
  | 'current__id'
  | 'current__blockNumber'
  | 'current__timestamp'
  | 'current__totalPrimeCash'
  | 'current__totalPrimeDebt'
  | 'current__totalUnderlyingHeld'
  | 'current__totalPrimeCashInUnderlying'
  | 'current__totalPrimeDebtInUnderlying'
  | 'current__supplyScalar'
  | 'current__debtScalar'
  | 'current__underlyingScalar'
  | 'current__supplyInterestRate'
  | 'current__debtInterestRate'
  | 'current__externalLendingRate'
  | 'snapshots';

export type ProfitLossLineItem = {
  /** Bundle ID:Index */
  id: Scalars['ID'];
  blockNumber: Scalars['BigInt'];
  timestamp: Scalars['Int'];
  transactionHash: Transaction;
  bundle: TransferBundle;
  balanceSnapshot: BalanceSnapshot;
  account: Account;
  tokenAmount: Scalars['BigInt'];
  token: Token;
  underlyingAmountRealized: Scalars['BigInt'];
  underlyingAmountSpot: Scalars['BigInt'];
  underlyingToken: Token;
  realizedPrice: Scalars['BigInt'];
  spotPrice: Scalars['BigInt'];
  impliedFixedRate?: Maybe<Scalars['BigInt']>;
  /** Set to true for line items that do not materially change the balance at the end of the txn */
  isTransientLineItem: Scalars['Boolean'];
  /** Set to a value that points to the token that generated an incentive payment */
  incentivizedToken?: Maybe<Token>;
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
  transactionHash?: InputMaybe<Scalars['String']>;
  transactionHash_not?: InputMaybe<Scalars['String']>;
  transactionHash_gt?: InputMaybe<Scalars['String']>;
  transactionHash_lt?: InputMaybe<Scalars['String']>;
  transactionHash_gte?: InputMaybe<Scalars['String']>;
  transactionHash_lte?: InputMaybe<Scalars['String']>;
  transactionHash_in?: InputMaybe<Array<Scalars['String']>>;
  transactionHash_not_in?: InputMaybe<Array<Scalars['String']>>;
  transactionHash_contains?: InputMaybe<Scalars['String']>;
  transactionHash_contains_nocase?: InputMaybe<Scalars['String']>;
  transactionHash_not_contains?: InputMaybe<Scalars['String']>;
  transactionHash_not_contains_nocase?: InputMaybe<Scalars['String']>;
  transactionHash_starts_with?: InputMaybe<Scalars['String']>;
  transactionHash_starts_with_nocase?: InputMaybe<Scalars['String']>;
  transactionHash_not_starts_with?: InputMaybe<Scalars['String']>;
  transactionHash_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  transactionHash_ends_with?: InputMaybe<Scalars['String']>;
  transactionHash_ends_with_nocase?: InputMaybe<Scalars['String']>;
  transactionHash_not_ends_with?: InputMaybe<Scalars['String']>;
  transactionHash_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  transactionHash_?: InputMaybe<Transaction_filter>;
  bundle?: InputMaybe<Scalars['String']>;
  bundle_not?: InputMaybe<Scalars['String']>;
  bundle_gt?: InputMaybe<Scalars['String']>;
  bundle_lt?: InputMaybe<Scalars['String']>;
  bundle_gte?: InputMaybe<Scalars['String']>;
  bundle_lte?: InputMaybe<Scalars['String']>;
  bundle_in?: InputMaybe<Array<Scalars['String']>>;
  bundle_not_in?: InputMaybe<Array<Scalars['String']>>;
  bundle_contains?: InputMaybe<Scalars['String']>;
  bundle_contains_nocase?: InputMaybe<Scalars['String']>;
  bundle_not_contains?: InputMaybe<Scalars['String']>;
  bundle_not_contains_nocase?: InputMaybe<Scalars['String']>;
  bundle_starts_with?: InputMaybe<Scalars['String']>;
  bundle_starts_with_nocase?: InputMaybe<Scalars['String']>;
  bundle_not_starts_with?: InputMaybe<Scalars['String']>;
  bundle_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  bundle_ends_with?: InputMaybe<Scalars['String']>;
  bundle_ends_with_nocase?: InputMaybe<Scalars['String']>;
  bundle_not_ends_with?: InputMaybe<Scalars['String']>;
  bundle_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  bundle_?: InputMaybe<TransferBundle_filter>;
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
  tokenAmount?: InputMaybe<Scalars['BigInt']>;
  tokenAmount_not?: InputMaybe<Scalars['BigInt']>;
  tokenAmount_gt?: InputMaybe<Scalars['BigInt']>;
  tokenAmount_lt?: InputMaybe<Scalars['BigInt']>;
  tokenAmount_gte?: InputMaybe<Scalars['BigInt']>;
  tokenAmount_lte?: InputMaybe<Scalars['BigInt']>;
  tokenAmount_in?: InputMaybe<Array<Scalars['BigInt']>>;
  tokenAmount_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
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
  isTransientLineItem?: InputMaybe<Scalars['Boolean']>;
  isTransientLineItem_not?: InputMaybe<Scalars['Boolean']>;
  isTransientLineItem_in?: InputMaybe<Array<Scalars['Boolean']>>;
  isTransientLineItem_not_in?: InputMaybe<Array<Scalars['Boolean']>>;
  incentivizedToken?: InputMaybe<Scalars['String']>;
  incentivizedToken_not?: InputMaybe<Scalars['String']>;
  incentivizedToken_gt?: InputMaybe<Scalars['String']>;
  incentivizedToken_lt?: InputMaybe<Scalars['String']>;
  incentivizedToken_gte?: InputMaybe<Scalars['String']>;
  incentivizedToken_lte?: InputMaybe<Scalars['String']>;
  incentivizedToken_in?: InputMaybe<Array<Scalars['String']>>;
  incentivizedToken_not_in?: InputMaybe<Array<Scalars['String']>>;
  incentivizedToken_contains?: InputMaybe<Scalars['String']>;
  incentivizedToken_contains_nocase?: InputMaybe<Scalars['String']>;
  incentivizedToken_not_contains?: InputMaybe<Scalars['String']>;
  incentivizedToken_not_contains_nocase?: InputMaybe<Scalars['String']>;
  incentivizedToken_starts_with?: InputMaybe<Scalars['String']>;
  incentivizedToken_starts_with_nocase?: InputMaybe<Scalars['String']>;
  incentivizedToken_not_starts_with?: InputMaybe<Scalars['String']>;
  incentivizedToken_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  incentivizedToken_ends_with?: InputMaybe<Scalars['String']>;
  incentivizedToken_ends_with_nocase?: InputMaybe<Scalars['String']>;
  incentivizedToken_not_ends_with?: InputMaybe<Scalars['String']>;
  incentivizedToken_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  incentivizedToken_?: InputMaybe<Token_filter>;
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
  | 'transactionHash__id'
  | 'transactionHash__blockNumber'
  | 'transactionHash__timestamp'
  | 'transactionHash__transactionHash'
  | 'transactionHash___nextStartIndex'
  | 'bundle'
  | 'bundle__id'
  | 'bundle__blockNumber'
  | 'bundle__timestamp'
  | 'bundle__bundleName'
  | 'bundle__startLogIndex'
  | 'bundle__endLogIndex'
  | 'balanceSnapshot'
  | 'balanceSnapshot__id'
  | 'balanceSnapshot__blockNumber'
  | 'balanceSnapshot__timestamp'
  | 'balanceSnapshot__currentBalance'
  | 'balanceSnapshot__previousBalance'
  | 'balanceSnapshot__adjustedCostBasis'
  | 'balanceSnapshot__currentProfitAndLossAtSnapshot'
  | 'balanceSnapshot__totalProfitAndLossAtSnapshot'
  | 'balanceSnapshot__totalILAndFeesAtSnapshot'
  | 'balanceSnapshot__totalInterestAccrualAtSnapshot'
  | 'balanceSnapshot__impliedFixedRate'
  | 'balanceSnapshot___accumulatedBalance'
  | 'balanceSnapshot___accumulatedCostRealized'
  | 'balanceSnapshot___lastInterestAccumulator'
  | 'account'
  | 'account__id'
  | 'account__firstUpdateBlockNumber'
  | 'account__firstUpdateTimestamp'
  | 'account__firstUpdateTransactionHash'
  | 'account__lastUpdateBlockNumber'
  | 'account__lastUpdateTimestamp'
  | 'account__lastUpdateTransactionHash'
  | 'account__systemAccountType'
  | 'account__allowPrimeBorrow'
  | 'account__nextSettleTime'
  | 'account__hasPortfolioAssetDebt'
  | 'account__hasCashDebt'
  | 'account__bitmapCurrencyId'
  | 'tokenAmount'
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
  | 'token__currencyId'
  | 'token__name'
  | 'token__symbol'
  | 'token__decimals'
  | 'token__precision'
  | 'token__totalSupply'
  | 'token__hasTransferFee'
  | 'token__isfCashDebt'
  | 'token__maturity'
  | 'token__vaultAddress'
  | 'token__tokenAddress'
  | 'underlyingAmountRealized'
  | 'underlyingAmountSpot'
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
  | 'underlyingToken__currencyId'
  | 'underlyingToken__name'
  | 'underlyingToken__symbol'
  | 'underlyingToken__decimals'
  | 'underlyingToken__precision'
  | 'underlyingToken__totalSupply'
  | 'underlyingToken__hasTransferFee'
  | 'underlyingToken__isfCashDebt'
  | 'underlyingToken__maturity'
  | 'underlyingToken__vaultAddress'
  | 'underlyingToken__tokenAddress'
  | 'realizedPrice'
  | 'spotPrice'
  | 'impliedFixedRate'
  | 'isTransientLineItem'
  | 'incentivizedToken'
  | 'incentivizedToken__id'
  | 'incentivizedToken__firstUpdateBlockNumber'
  | 'incentivizedToken__firstUpdateTimestamp'
  | 'incentivizedToken__firstUpdateTransactionHash'
  | 'incentivizedToken__lastUpdateBlockNumber'
  | 'incentivizedToken__lastUpdateTimestamp'
  | 'incentivizedToken__lastUpdateTransactionHash'
  | 'incentivizedToken__tokenType'
  | 'incentivizedToken__tokenInterface'
  | 'incentivizedToken__currencyId'
  | 'incentivizedToken__name'
  | 'incentivizedToken__symbol'
  | 'incentivizedToken__decimals'
  | 'incentivizedToken__precision'
  | 'incentivizedToken__totalSupply'
  | 'incentivizedToken__hasTransferFee'
  | 'incentivizedToken__isfCashDebt'
  | 'incentivizedToken__maturity'
  | 'incentivizedToken__vaultAddress'
  | 'incentivizedToken__tokenAddress';

export type Query = {
  token?: Maybe<Token>;
  tokens: Array<Token>;
  transfer?: Maybe<Transfer>;
  transfers: Array<Transfer>;
  transferBundle?: Maybe<TransferBundle>;
  transferBundles: Array<TransferBundle>;
  profitLossLineItem?: Maybe<ProfitLossLineItem>;
  profitLossLineItems: Array<ProfitLossLineItem>;
  transaction?: Maybe<Transaction>;
  transactions: Array<Transaction>;
  account?: Maybe<Account>;
  accounts: Array<Account>;
  nTokenFeeBuffer?: Maybe<nTokenFeeBuffer>;
  nTokenFeeBuffers: Array<nTokenFeeBuffer>;
  oracleRegistry?: Maybe<OracleRegistry>;
  oracleRegistries: Array<OracleRegistry>;
  oracle?: Maybe<Oracle>;
  oracles: Array<Oracle>;
  exchangeRate?: Maybe<ExchangeRate>;
  exchangeRates: Array<ExchangeRate>;
  currencyConfiguration?: Maybe<CurrencyConfiguration>;
  currencyConfigurations: Array<CurrencyConfiguration>;
  interestRateCurve?: Maybe<InterestRateCurve>;
  interestRateCurves: Array<InterestRateCurve>;
  vaultConfiguration?: Maybe<VaultConfiguration>;
  vaultConfigurations: Array<VaultConfiguration>;
  whitelistedContract?: Maybe<WhitelistedContract>;
  whitelistedContracts: Array<WhitelistedContract>;
  balance?: Maybe<Balance>;
  balances: Array<Balance>;
  balanceSnapshot?: Maybe<BalanceSnapshot>;
  balanceSnapshots: Array<BalanceSnapshot>;
  incentiveSnapshot?: Maybe<IncentiveSnapshot>;
  incentiveSnapshots: Array<IncentiveSnapshot>;
  activeMarket?: Maybe<ActiveMarket>;
  activeMarkets: Array<ActiveMarket>;
  primeCashMarket?: Maybe<PrimeCashMarket>;
  primeCashMarkets: Array<PrimeCashMarket>;
  primeCashMarketSnapshot?: Maybe<PrimeCashMarketSnapshot>;
  primeCashMarketSnapshots: Array<PrimeCashMarketSnapshot>;
  fCashMarket?: Maybe<fCashMarket>;
  fCashMarkets: Array<fCashMarket>;
  fCashMarketSnapshot?: Maybe<fCashMarketSnapshot>;
  fCashMarketSnapshots: Array<fCashMarketSnapshot>;
  incentive?: Maybe<Incentive>;
  incentives: Array<Incentive>;
  tradingModulePermission?: Maybe<TradingModulePermission>;
  tradingModulePermissions: Array<TradingModulePermission>;
  reinvestment?: Maybe<Reinvestment>;
  reinvestments: Array<Reinvestment>;
  externalLending?: Maybe<ExternalLending>;
  externalLendings: Array<ExternalLending>;
  underlyingSnapshot?: Maybe<UnderlyingSnapshot>;
  underlyingSnapshots: Array<UnderlyingSnapshot>;
  externalLendingSnapshot?: Maybe<ExternalLendingSnapshot>;
  externalLendingSnapshots: Array<ExternalLendingSnapshot>;
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

export type QuerytransferArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QuerytransfersArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Transfer_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<Transfer_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QuerytransferBundleArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QuerytransferBundlesArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<TransferBundle_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<TransferBundle_filter>;
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

export type QuerytransactionArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QuerytransactionsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Transaction_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<Transaction_filter>;
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

export type QuerynTokenFeeBufferArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QuerynTokenFeeBuffersArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<nTokenFeeBuffer_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<nTokenFeeBuffer_filter>;
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

export type QuerycurrencyConfigurationArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QuerycurrencyConfigurationsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<CurrencyConfiguration_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<CurrencyConfiguration_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryinterestRateCurveArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryinterestRateCurvesArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<InterestRateCurve_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<InterestRateCurve_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryvaultConfigurationArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryvaultConfigurationsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<VaultConfiguration_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<VaultConfiguration_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QuerywhitelistedContractArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QuerywhitelistedContractsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<WhitelistedContract_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<WhitelistedContract_filter>;
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

export type QueryactiveMarketArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryactiveMarketsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<ActiveMarket_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<ActiveMarket_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryprimeCashMarketArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryprimeCashMarketsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<PrimeCashMarket_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<PrimeCashMarket_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryprimeCashMarketSnapshotArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryprimeCashMarketSnapshotsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<PrimeCashMarketSnapshot_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<PrimeCashMarketSnapshot_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryfCashMarketArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryfCashMarketsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<fCashMarket_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<fCashMarket_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryfCashMarketSnapshotArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryfCashMarketSnapshotsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<fCashMarketSnapshot_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<fCashMarketSnapshot_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryincentiveArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryincentivesArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Incentive_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<Incentive_filter>;
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

export type QueryreinvestmentArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryreinvestmentsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Reinvestment_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<Reinvestment_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryexternalLendingArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryexternalLendingsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<ExternalLending_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<ExternalLending_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryunderlyingSnapshotArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryunderlyingSnapshotsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<UnderlyingSnapshot_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<UnderlyingSnapshot_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryexternalLendingSnapshotArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};

export type QueryexternalLendingSnapshotsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<ExternalLendingSnapshot_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<ExternalLendingSnapshot_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};

export type Query_metaArgs = {
  block?: InputMaybe<Block_height>;
};

export type Reinvestment = {
  /** Vault:TxnHash */
  id: Scalars['ID'];
  blockNumber: Scalars['BigInt'];
  timestamp: Scalars['Int'];
  transactionHash: Scalars['Bytes'];
  vault: VaultConfiguration;
  /** Address of the token sold */
  rewardTokenSold: Token;
  /** Amount of reward tokens sold */
  rewardAmountSold: Scalars['BigInt'];
  /** Amount of LP tokens reinvested */
  tokensReinvested: Scalars['BigInt'];
  tokensPerVaultShare?: Maybe<Scalars['BigInt']>;
  /** Value of the tokens reinvested */
  underlyingAmountRealized?: Maybe<Scalars['BigInt']>;
  /** Vault Share Price after Reinvestment */
  vaultSharePrice?: Maybe<Scalars['BigInt']>;
};

export type Reinvestment_filter = {
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
  vault_?: InputMaybe<VaultConfiguration_filter>;
  rewardTokenSold?: InputMaybe<Scalars['String']>;
  rewardTokenSold_not?: InputMaybe<Scalars['String']>;
  rewardTokenSold_gt?: InputMaybe<Scalars['String']>;
  rewardTokenSold_lt?: InputMaybe<Scalars['String']>;
  rewardTokenSold_gte?: InputMaybe<Scalars['String']>;
  rewardTokenSold_lte?: InputMaybe<Scalars['String']>;
  rewardTokenSold_in?: InputMaybe<Array<Scalars['String']>>;
  rewardTokenSold_not_in?: InputMaybe<Array<Scalars['String']>>;
  rewardTokenSold_contains?: InputMaybe<Scalars['String']>;
  rewardTokenSold_contains_nocase?: InputMaybe<Scalars['String']>;
  rewardTokenSold_not_contains?: InputMaybe<Scalars['String']>;
  rewardTokenSold_not_contains_nocase?: InputMaybe<Scalars['String']>;
  rewardTokenSold_starts_with?: InputMaybe<Scalars['String']>;
  rewardTokenSold_starts_with_nocase?: InputMaybe<Scalars['String']>;
  rewardTokenSold_not_starts_with?: InputMaybe<Scalars['String']>;
  rewardTokenSold_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  rewardTokenSold_ends_with?: InputMaybe<Scalars['String']>;
  rewardTokenSold_ends_with_nocase?: InputMaybe<Scalars['String']>;
  rewardTokenSold_not_ends_with?: InputMaybe<Scalars['String']>;
  rewardTokenSold_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  rewardTokenSold_?: InputMaybe<Token_filter>;
  rewardAmountSold?: InputMaybe<Scalars['BigInt']>;
  rewardAmountSold_not?: InputMaybe<Scalars['BigInt']>;
  rewardAmountSold_gt?: InputMaybe<Scalars['BigInt']>;
  rewardAmountSold_lt?: InputMaybe<Scalars['BigInt']>;
  rewardAmountSold_gte?: InputMaybe<Scalars['BigInt']>;
  rewardAmountSold_lte?: InputMaybe<Scalars['BigInt']>;
  rewardAmountSold_in?: InputMaybe<Array<Scalars['BigInt']>>;
  rewardAmountSold_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  tokensReinvested?: InputMaybe<Scalars['BigInt']>;
  tokensReinvested_not?: InputMaybe<Scalars['BigInt']>;
  tokensReinvested_gt?: InputMaybe<Scalars['BigInt']>;
  tokensReinvested_lt?: InputMaybe<Scalars['BigInt']>;
  tokensReinvested_gte?: InputMaybe<Scalars['BigInt']>;
  tokensReinvested_lte?: InputMaybe<Scalars['BigInt']>;
  tokensReinvested_in?: InputMaybe<Array<Scalars['BigInt']>>;
  tokensReinvested_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  tokensPerVaultShare?: InputMaybe<Scalars['BigInt']>;
  tokensPerVaultShare_not?: InputMaybe<Scalars['BigInt']>;
  tokensPerVaultShare_gt?: InputMaybe<Scalars['BigInt']>;
  tokensPerVaultShare_lt?: InputMaybe<Scalars['BigInt']>;
  tokensPerVaultShare_gte?: InputMaybe<Scalars['BigInt']>;
  tokensPerVaultShare_lte?: InputMaybe<Scalars['BigInt']>;
  tokensPerVaultShare_in?: InputMaybe<Array<Scalars['BigInt']>>;
  tokensPerVaultShare_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  underlyingAmountRealized?: InputMaybe<Scalars['BigInt']>;
  underlyingAmountRealized_not?: InputMaybe<Scalars['BigInt']>;
  underlyingAmountRealized_gt?: InputMaybe<Scalars['BigInt']>;
  underlyingAmountRealized_lt?: InputMaybe<Scalars['BigInt']>;
  underlyingAmountRealized_gte?: InputMaybe<Scalars['BigInt']>;
  underlyingAmountRealized_lte?: InputMaybe<Scalars['BigInt']>;
  underlyingAmountRealized_in?: InputMaybe<Array<Scalars['BigInt']>>;
  underlyingAmountRealized_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  vaultSharePrice?: InputMaybe<Scalars['BigInt']>;
  vaultSharePrice_not?: InputMaybe<Scalars['BigInt']>;
  vaultSharePrice_gt?: InputMaybe<Scalars['BigInt']>;
  vaultSharePrice_lt?: InputMaybe<Scalars['BigInt']>;
  vaultSharePrice_gte?: InputMaybe<Scalars['BigInt']>;
  vaultSharePrice_lte?: InputMaybe<Scalars['BigInt']>;
  vaultSharePrice_in?: InputMaybe<Array<Scalars['BigInt']>>;
  vaultSharePrice_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<Reinvestment_filter>>>;
  or?: InputMaybe<Array<InputMaybe<Reinvestment_filter>>>;
};

export type Reinvestment_orderBy =
  | 'id'
  | 'blockNumber'
  | 'timestamp'
  | 'transactionHash'
  | 'vault'
  | 'vault__id'
  | 'vault__lastUpdateBlockHash'
  | 'vault__lastUpdateBlockNumber'
  | 'vault__lastUpdateTimestamp'
  | 'vault__lastUpdateTransactionHash'
  | 'vault__vaultAddress'
  | 'vault__strategy'
  | 'vault__name'
  | 'vault__minAccountBorrowSize'
  | 'vault__minCollateralRatioBasisPoints'
  | 'vault__maxDeleverageCollateralRatioBasisPoints'
  | 'vault__feeRateBasisPoints'
  | 'vault__reserveFeeSharePercent'
  | 'vault__liquidationRatePercent'
  | 'vault__maxBorrowMarketIndex'
  | 'vault__maxRequiredAccountCollateralRatioBasisPoints'
  | 'vault__enabled'
  | 'vault__allowRollPosition'
  | 'vault__onlyVaultEntry'
  | 'vault__onlyVaultExit'
  | 'vault__onlyVaultRoll'
  | 'vault__onlyVaultDeleverage'
  | 'vault__onlyVaultSettle'
  | 'vault__discountfCash'
  | 'vault__allowsReentrancy'
  | 'vault__deleverageDisabled'
  | 'vault__maxPrimaryBorrowCapacity'
  | 'vault__totalUsedPrimaryBorrowCapacity'
  | 'rewardTokenSold'
  | 'rewardTokenSold__id'
  | 'rewardTokenSold__firstUpdateBlockNumber'
  | 'rewardTokenSold__firstUpdateTimestamp'
  | 'rewardTokenSold__firstUpdateTransactionHash'
  | 'rewardTokenSold__lastUpdateBlockNumber'
  | 'rewardTokenSold__lastUpdateTimestamp'
  | 'rewardTokenSold__lastUpdateTransactionHash'
  | 'rewardTokenSold__tokenType'
  | 'rewardTokenSold__tokenInterface'
  | 'rewardTokenSold__currencyId'
  | 'rewardTokenSold__name'
  | 'rewardTokenSold__symbol'
  | 'rewardTokenSold__decimals'
  | 'rewardTokenSold__precision'
  | 'rewardTokenSold__totalSupply'
  | 'rewardTokenSold__hasTransferFee'
  | 'rewardTokenSold__isfCashDebt'
  | 'rewardTokenSold__maturity'
  | 'rewardTokenSold__vaultAddress'
  | 'rewardTokenSold__tokenAddress'
  | 'rewardAmountSold'
  | 'tokensReinvested'
  | 'tokensPerVaultShare'
  | 'underlyingAmountRealized'
  | 'vaultSharePrice';

export type Subscription = {
  token?: Maybe<Token>;
  tokens: Array<Token>;
  transfer?: Maybe<Transfer>;
  transfers: Array<Transfer>;
  transferBundle?: Maybe<TransferBundle>;
  transferBundles: Array<TransferBundle>;
  profitLossLineItem?: Maybe<ProfitLossLineItem>;
  profitLossLineItems: Array<ProfitLossLineItem>;
  transaction?: Maybe<Transaction>;
  transactions: Array<Transaction>;
  account?: Maybe<Account>;
  accounts: Array<Account>;
  nTokenFeeBuffer?: Maybe<nTokenFeeBuffer>;
  nTokenFeeBuffers: Array<nTokenFeeBuffer>;
  oracleRegistry?: Maybe<OracleRegistry>;
  oracleRegistries: Array<OracleRegistry>;
  oracle?: Maybe<Oracle>;
  oracles: Array<Oracle>;
  exchangeRate?: Maybe<ExchangeRate>;
  exchangeRates: Array<ExchangeRate>;
  currencyConfiguration?: Maybe<CurrencyConfiguration>;
  currencyConfigurations: Array<CurrencyConfiguration>;
  interestRateCurve?: Maybe<InterestRateCurve>;
  interestRateCurves: Array<InterestRateCurve>;
  vaultConfiguration?: Maybe<VaultConfiguration>;
  vaultConfigurations: Array<VaultConfiguration>;
  whitelistedContract?: Maybe<WhitelistedContract>;
  whitelistedContracts: Array<WhitelistedContract>;
  balance?: Maybe<Balance>;
  balances: Array<Balance>;
  balanceSnapshot?: Maybe<BalanceSnapshot>;
  balanceSnapshots: Array<BalanceSnapshot>;
  incentiveSnapshot?: Maybe<IncentiveSnapshot>;
  incentiveSnapshots: Array<IncentiveSnapshot>;
  activeMarket?: Maybe<ActiveMarket>;
  activeMarkets: Array<ActiveMarket>;
  primeCashMarket?: Maybe<PrimeCashMarket>;
  primeCashMarkets: Array<PrimeCashMarket>;
  primeCashMarketSnapshot?: Maybe<PrimeCashMarketSnapshot>;
  primeCashMarketSnapshots: Array<PrimeCashMarketSnapshot>;
  fCashMarket?: Maybe<fCashMarket>;
  fCashMarkets: Array<fCashMarket>;
  fCashMarketSnapshot?: Maybe<fCashMarketSnapshot>;
  fCashMarketSnapshots: Array<fCashMarketSnapshot>;
  incentive?: Maybe<Incentive>;
  incentives: Array<Incentive>;
  tradingModulePermission?: Maybe<TradingModulePermission>;
  tradingModulePermissions: Array<TradingModulePermission>;
  reinvestment?: Maybe<Reinvestment>;
  reinvestments: Array<Reinvestment>;
  externalLending?: Maybe<ExternalLending>;
  externalLendings: Array<ExternalLending>;
  underlyingSnapshot?: Maybe<UnderlyingSnapshot>;
  underlyingSnapshots: Array<UnderlyingSnapshot>;
  externalLendingSnapshot?: Maybe<ExternalLendingSnapshot>;
  externalLendingSnapshots: Array<ExternalLendingSnapshot>;
  /** Access to subgraph metadata */
  _meta?: Maybe<_Meta_>;
};

export type SubscriptiontokenArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptiontokensArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Token_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<Token_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptiontransferArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptiontransfersArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Transfer_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<Transfer_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptiontransferBundleArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptiontransferBundlesArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<TransferBundle_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<TransferBundle_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionprofitLossLineItemArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionprofitLossLineItemsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<ProfitLossLineItem_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<ProfitLossLineItem_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptiontransactionArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptiontransactionsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Transaction_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<Transaction_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionaccountArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionaccountsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Account_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<Account_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionnTokenFeeBufferArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionnTokenFeeBuffersArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<nTokenFeeBuffer_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<nTokenFeeBuffer_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionoracleRegistryArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionoracleRegistriesArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<OracleRegistry_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<OracleRegistry_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionoracleArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionoraclesArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Oracle_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<Oracle_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionexchangeRateArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionexchangeRatesArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<ExchangeRate_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<ExchangeRate_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptioncurrencyConfigurationArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptioncurrencyConfigurationsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<CurrencyConfiguration_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<CurrencyConfiguration_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptioninterestRateCurveArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptioninterestRateCurvesArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<InterestRateCurve_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<InterestRateCurve_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionvaultConfigurationArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionvaultConfigurationsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<VaultConfiguration_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<VaultConfiguration_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionwhitelistedContractArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionwhitelistedContractsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<WhitelistedContract_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<WhitelistedContract_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionbalanceArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionbalancesArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Balance_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<Balance_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionbalanceSnapshotArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionbalanceSnapshotsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<BalanceSnapshot_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<BalanceSnapshot_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionincentiveSnapshotArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionincentiveSnapshotsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<IncentiveSnapshot_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<IncentiveSnapshot_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionactiveMarketArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionactiveMarketsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<ActiveMarket_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<ActiveMarket_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionprimeCashMarketArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionprimeCashMarketsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<PrimeCashMarket_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<PrimeCashMarket_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionprimeCashMarketSnapshotArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionprimeCashMarketSnapshotsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<PrimeCashMarketSnapshot_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<PrimeCashMarketSnapshot_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionfCashMarketArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionfCashMarketsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<fCashMarket_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<fCashMarket_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionfCashMarketSnapshotArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionfCashMarketSnapshotsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<fCashMarketSnapshot_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<fCashMarketSnapshot_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionincentiveArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionincentivesArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Incentive_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<Incentive_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptiontradingModulePermissionArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptiontradingModulePermissionsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<TradingModulePermission_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<TradingModulePermission_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionreinvestmentArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionreinvestmentsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Reinvestment_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<Reinvestment_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionexternalLendingArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionexternalLendingsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<ExternalLending_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<ExternalLending_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionunderlyingSnapshotArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionunderlyingSnapshotsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<UnderlyingSnapshot_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<UnderlyingSnapshot_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionexternalLendingSnapshotArgs = {
  id: Scalars['ID'];
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};

export type SubscriptionexternalLendingSnapshotsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<ExternalLendingSnapshot_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<ExternalLendingSnapshot_filter>;
  block?: InputMaybe<Block_height>;
  subgraphError?: _SubgraphErrorPolicy_;
};

export type Subscription_metaArgs = {
  block?: InputMaybe<Block_height>;
};

export type SystemAccount =
  | 'None'
  | 'ZeroAddress'
  | 'FeeReserve'
  | 'SettlementReserve'
  | 'Vault'
  | 'nToken'
  | 'PrimeCash'
  | 'PrimeDebt'
  | 'Notional'
  | 'NOTE'
  | 'SecondaryIncentiveRewarder';

export type Token = {
  /**
   * ID space varies by token type:
   * - ERC20: token address
   * - ERC1155: `emitter address:tokenId`
   *
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
  /** Set to the notional currency id if this token is listed on Notional */
  currencyId?: Maybe<Scalars['Int']>;
  name: Scalars['String'];
  symbol: Scalars['String'];
  decimals: Scalars['Int'];
  precision: Scalars['BigInt'];
  /** Only updated for Notional entities */
  totalSupply?: Maybe<Scalars['BigInt']>;
  /** Set to true for underlying tokens that have a transfer fee */
  hasTransferFee: Scalars['Boolean'];
  isfCashDebt: Scalars['Boolean'];
  /** Maturities are only set for some token types */
  maturity?: Maybe<Scalars['BigInt']>;
  /** Vault address is set for vault token types */
  vaultAddress?: Maybe<Scalars['Bytes']>;
  /** Set to the ERC20 address or Notional Proxy for ERC1155 addresses */
  tokenAddress: Scalars['Bytes'];
  balanceOf?: Maybe<Array<Balance>>;
  transfers?: Maybe<Array<Transfer>>;
  oracles?: Maybe<Array<Oracle>>;
  activeMarkets?: Maybe<ActiveMarket>;
};

export type TokenbalanceOfArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Balance_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<Balance_filter>;
};

export type TokentransfersArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Transfer_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<Transfer_filter>;
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
  | 'nToken'
  | 'WrappedfCash'
  | 'PrimeCash'
  | 'PrimeDebt'
  | 'fCash'
  | 'VaultShare'
  | 'VaultDebt'
  | 'VaultCash'
  | 'NOTE'
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
  currencyId?: InputMaybe<Scalars['Int']>;
  currencyId_not?: InputMaybe<Scalars['Int']>;
  currencyId_gt?: InputMaybe<Scalars['Int']>;
  currencyId_lt?: InputMaybe<Scalars['Int']>;
  currencyId_gte?: InputMaybe<Scalars['Int']>;
  currencyId_lte?: InputMaybe<Scalars['Int']>;
  currencyId_in?: InputMaybe<Array<Scalars['Int']>>;
  currencyId_not_in?: InputMaybe<Array<Scalars['Int']>>;
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
  hasTransferFee?: InputMaybe<Scalars['Boolean']>;
  hasTransferFee_not?: InputMaybe<Scalars['Boolean']>;
  hasTransferFee_in?: InputMaybe<Array<Scalars['Boolean']>>;
  hasTransferFee_not_in?: InputMaybe<Array<Scalars['Boolean']>>;
  isfCashDebt?: InputMaybe<Scalars['Boolean']>;
  isfCashDebt_not?: InputMaybe<Scalars['Boolean']>;
  isfCashDebt_in?: InputMaybe<Array<Scalars['Boolean']>>;
  isfCashDebt_not_in?: InputMaybe<Array<Scalars['Boolean']>>;
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
  transfers_?: InputMaybe<Transfer_filter>;
  oracles_?: InputMaybe<Oracle_filter>;
  activeMarkets_?: InputMaybe<ActiveMarket_filter>;
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
  | 'underlying__currencyId'
  | 'underlying__name'
  | 'underlying__symbol'
  | 'underlying__decimals'
  | 'underlying__precision'
  | 'underlying__totalSupply'
  | 'underlying__hasTransferFee'
  | 'underlying__isfCashDebt'
  | 'underlying__maturity'
  | 'underlying__vaultAddress'
  | 'underlying__tokenAddress'
  | 'currencyId'
  | 'name'
  | 'symbol'
  | 'decimals'
  | 'precision'
  | 'totalSupply'
  | 'hasTransferFee'
  | 'isfCashDebt'
  | 'maturity'
  | 'vaultAddress'
  | 'tokenAddress'
  | 'balanceOf'
  | 'transfers'
  | 'oracles'
  | 'activeMarkets'
  | 'activeMarkets__id'
  | 'activeMarkets__lastUpdateBlockNumber'
  | 'activeMarkets__lastUpdateTimestamp';

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
  sender: Account;
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
  sender?: InputMaybe<Scalars['String']>;
  sender_not?: InputMaybe<Scalars['String']>;
  sender_gt?: InputMaybe<Scalars['String']>;
  sender_lt?: InputMaybe<Scalars['String']>;
  sender_gte?: InputMaybe<Scalars['String']>;
  sender_lte?: InputMaybe<Scalars['String']>;
  sender_in?: InputMaybe<Array<Scalars['String']>>;
  sender_not_in?: InputMaybe<Array<Scalars['String']>>;
  sender_contains?: InputMaybe<Scalars['String']>;
  sender_contains_nocase?: InputMaybe<Scalars['String']>;
  sender_not_contains?: InputMaybe<Scalars['String']>;
  sender_not_contains_nocase?: InputMaybe<Scalars['String']>;
  sender_starts_with?: InputMaybe<Scalars['String']>;
  sender_starts_with_nocase?: InputMaybe<Scalars['String']>;
  sender_not_starts_with?: InputMaybe<Scalars['String']>;
  sender_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  sender_ends_with?: InputMaybe<Scalars['String']>;
  sender_ends_with_nocase?: InputMaybe<Scalars['String']>;
  sender_not_ends_with?: InputMaybe<Scalars['String']>;
  sender_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  sender_?: InputMaybe<Account_filter>;
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
  | 'sender__id'
  | 'sender__firstUpdateBlockNumber'
  | 'sender__firstUpdateTimestamp'
  | 'sender__firstUpdateTransactionHash'
  | 'sender__lastUpdateBlockNumber'
  | 'sender__lastUpdateTimestamp'
  | 'sender__lastUpdateTransactionHash'
  | 'sender__systemAccountType'
  | 'sender__allowPrimeBorrow'
  | 'sender__nextSettleTime'
  | 'sender__hasPortfolioAssetDebt'
  | 'sender__hasCashDebt'
  | 'sender__bitmapCurrencyId'
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
  | 'token__currencyId'
  | 'token__name'
  | 'token__symbol'
  | 'token__decimals'
  | 'token__precision'
  | 'token__totalSupply'
  | 'token__hasTransferFee'
  | 'token__isfCashDebt'
  | 'token__maturity'
  | 'token__vaultAddress'
  | 'token__tokenAddress'
  | 'tokenAddress'
  | 'name'
  | 'symbol'
  | 'allowedDexes'
  | 'allowSell'
  | 'allowedTradeTypes';

export type Transaction = {
  /** Transaction Hash */
  id: Scalars['ID'];
  blockNumber: Scalars['BigInt'];
  timestamp: Scalars['Int'];
  transactionHash: Scalars['Bytes'];
  _transfers: Array<Transfer>;
  _transferBundles: Array<TransferBundle>;
  /** Internal index of the next index in _transfer to start scanning at */
  _nextStartIndex: Scalars['Int'];
  transfers?: Maybe<Array<Transfer>>;
  transferBundles?: Maybe<Array<TransferBundle>>;
  profitLossLineItems?: Maybe<Array<ProfitLossLineItem>>;
};

export type Transaction_transfersArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Transfer_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<Transfer_filter>;
};

export type Transaction_transferBundlesArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<TransferBundle_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<TransferBundle_filter>;
};

export type TransactiontransfersArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Transfer_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<Transfer_filter>;
};

export type TransactiontransferBundlesArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<TransferBundle_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<TransferBundle_filter>;
};

export type TransactionprofitLossLineItemsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<ProfitLossLineItem_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<ProfitLossLineItem_filter>;
};

export type Transaction_filter = {
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
  _transfers?: InputMaybe<Array<Scalars['String']>>;
  _transfers_not?: InputMaybe<Array<Scalars['String']>>;
  _transfers_contains?: InputMaybe<Array<Scalars['String']>>;
  _transfers_contains_nocase?: InputMaybe<Array<Scalars['String']>>;
  _transfers_not_contains?: InputMaybe<Array<Scalars['String']>>;
  _transfers_not_contains_nocase?: InputMaybe<Array<Scalars['String']>>;
  _transfers_?: InputMaybe<Transfer_filter>;
  _transferBundles?: InputMaybe<Array<Scalars['String']>>;
  _transferBundles_not?: InputMaybe<Array<Scalars['String']>>;
  _transferBundles_contains?: InputMaybe<Array<Scalars['String']>>;
  _transferBundles_contains_nocase?: InputMaybe<Array<Scalars['String']>>;
  _transferBundles_not_contains?: InputMaybe<Array<Scalars['String']>>;
  _transferBundles_not_contains_nocase?: InputMaybe<Array<Scalars['String']>>;
  _transferBundles_?: InputMaybe<TransferBundle_filter>;
  _nextStartIndex?: InputMaybe<Scalars['Int']>;
  _nextStartIndex_not?: InputMaybe<Scalars['Int']>;
  _nextStartIndex_gt?: InputMaybe<Scalars['Int']>;
  _nextStartIndex_lt?: InputMaybe<Scalars['Int']>;
  _nextStartIndex_gte?: InputMaybe<Scalars['Int']>;
  _nextStartIndex_lte?: InputMaybe<Scalars['Int']>;
  _nextStartIndex_in?: InputMaybe<Array<Scalars['Int']>>;
  _nextStartIndex_not_in?: InputMaybe<Array<Scalars['Int']>>;
  transfers_?: InputMaybe<Transfer_filter>;
  transferBundles_?: InputMaybe<TransferBundle_filter>;
  profitLossLineItems_?: InputMaybe<ProfitLossLineItem_filter>;
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<Transaction_filter>>>;
  or?: InputMaybe<Array<InputMaybe<Transaction_filter>>>;
};

export type Transaction_orderBy =
  | 'id'
  | 'blockNumber'
  | 'timestamp'
  | 'transactionHash'
  | '_transfers'
  | '_transferBundles'
  | '_nextStartIndex'
  | 'transfers'
  | 'transferBundles'
  | 'profitLossLineItems';

export type Transfer = {
  /** Transaction Hash:Log Index */
  id: Scalars['ID'];
  blockNumber: Scalars['BigInt'];
  timestamp: Scalars['Int'];
  transactionHash: Transaction;
  logIndex: Scalars['Int'];
  from: Account;
  to: Account;
  /** Operator is logged for ERC1155 transfer events */
  operator?: Maybe<Account>;
  /** Categorizes the transfer as a mint, burn or transfer */
  transferType: TransferType;
  fromSystemAccount: SystemAccount;
  toSystemAccount: SystemAccount;
  value: Scalars['BigInt'];
  /** Value of the transfer in underlying terms at the time of transfer */
  valueInUnderlying?: Maybe<Scalars['BigInt']>;
  /** Link to the token entity for this transfer */
  token: Token;
  tokenType: TokenType;
  underlying: Token;
  /** Only set for some transfer types */
  maturity?: Maybe<Scalars['BigInt']>;
};

export type TransferBundle = {
  /** Transaction Hash:Start Log Index:End Log Index:Bundle Name */
  id: Scalars['ID'];
  blockNumber: Scalars['BigInt'];
  timestamp: Scalars['Int'];
  transactionHash: Transaction;
  bundleName: Scalars['String'];
  startLogIndex: Scalars['Int'];
  endLogIndex: Scalars['Int'];
  transfers: Array<Transfer>;
  profitLossLineItems?: Maybe<Array<ProfitLossLineItem>>;
};

export type TransferBundletransfersArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Transfer_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<Transfer_filter>;
};

export type TransferBundleprofitLossLineItemsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<ProfitLossLineItem_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<ProfitLossLineItem_filter>;
};

export type TransferBundle_filter = {
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
  transactionHash?: InputMaybe<Scalars['String']>;
  transactionHash_not?: InputMaybe<Scalars['String']>;
  transactionHash_gt?: InputMaybe<Scalars['String']>;
  transactionHash_lt?: InputMaybe<Scalars['String']>;
  transactionHash_gte?: InputMaybe<Scalars['String']>;
  transactionHash_lte?: InputMaybe<Scalars['String']>;
  transactionHash_in?: InputMaybe<Array<Scalars['String']>>;
  transactionHash_not_in?: InputMaybe<Array<Scalars['String']>>;
  transactionHash_contains?: InputMaybe<Scalars['String']>;
  transactionHash_contains_nocase?: InputMaybe<Scalars['String']>;
  transactionHash_not_contains?: InputMaybe<Scalars['String']>;
  transactionHash_not_contains_nocase?: InputMaybe<Scalars['String']>;
  transactionHash_starts_with?: InputMaybe<Scalars['String']>;
  transactionHash_starts_with_nocase?: InputMaybe<Scalars['String']>;
  transactionHash_not_starts_with?: InputMaybe<Scalars['String']>;
  transactionHash_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  transactionHash_ends_with?: InputMaybe<Scalars['String']>;
  transactionHash_ends_with_nocase?: InputMaybe<Scalars['String']>;
  transactionHash_not_ends_with?: InputMaybe<Scalars['String']>;
  transactionHash_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  transactionHash_?: InputMaybe<Transaction_filter>;
  bundleName?: InputMaybe<Scalars['String']>;
  bundleName_not?: InputMaybe<Scalars['String']>;
  bundleName_gt?: InputMaybe<Scalars['String']>;
  bundleName_lt?: InputMaybe<Scalars['String']>;
  bundleName_gte?: InputMaybe<Scalars['String']>;
  bundleName_lte?: InputMaybe<Scalars['String']>;
  bundleName_in?: InputMaybe<Array<Scalars['String']>>;
  bundleName_not_in?: InputMaybe<Array<Scalars['String']>>;
  bundleName_contains?: InputMaybe<Scalars['String']>;
  bundleName_contains_nocase?: InputMaybe<Scalars['String']>;
  bundleName_not_contains?: InputMaybe<Scalars['String']>;
  bundleName_not_contains_nocase?: InputMaybe<Scalars['String']>;
  bundleName_starts_with?: InputMaybe<Scalars['String']>;
  bundleName_starts_with_nocase?: InputMaybe<Scalars['String']>;
  bundleName_not_starts_with?: InputMaybe<Scalars['String']>;
  bundleName_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  bundleName_ends_with?: InputMaybe<Scalars['String']>;
  bundleName_ends_with_nocase?: InputMaybe<Scalars['String']>;
  bundleName_not_ends_with?: InputMaybe<Scalars['String']>;
  bundleName_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  startLogIndex?: InputMaybe<Scalars['Int']>;
  startLogIndex_not?: InputMaybe<Scalars['Int']>;
  startLogIndex_gt?: InputMaybe<Scalars['Int']>;
  startLogIndex_lt?: InputMaybe<Scalars['Int']>;
  startLogIndex_gte?: InputMaybe<Scalars['Int']>;
  startLogIndex_lte?: InputMaybe<Scalars['Int']>;
  startLogIndex_in?: InputMaybe<Array<Scalars['Int']>>;
  startLogIndex_not_in?: InputMaybe<Array<Scalars['Int']>>;
  endLogIndex?: InputMaybe<Scalars['Int']>;
  endLogIndex_not?: InputMaybe<Scalars['Int']>;
  endLogIndex_gt?: InputMaybe<Scalars['Int']>;
  endLogIndex_lt?: InputMaybe<Scalars['Int']>;
  endLogIndex_gte?: InputMaybe<Scalars['Int']>;
  endLogIndex_lte?: InputMaybe<Scalars['Int']>;
  endLogIndex_in?: InputMaybe<Array<Scalars['Int']>>;
  endLogIndex_not_in?: InputMaybe<Array<Scalars['Int']>>;
  transfers?: InputMaybe<Array<Scalars['String']>>;
  transfers_not?: InputMaybe<Array<Scalars['String']>>;
  transfers_contains?: InputMaybe<Array<Scalars['String']>>;
  transfers_contains_nocase?: InputMaybe<Array<Scalars['String']>>;
  transfers_not_contains?: InputMaybe<Array<Scalars['String']>>;
  transfers_not_contains_nocase?: InputMaybe<Array<Scalars['String']>>;
  transfers_?: InputMaybe<Transfer_filter>;
  profitLossLineItems_?: InputMaybe<ProfitLossLineItem_filter>;
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<TransferBundle_filter>>>;
  or?: InputMaybe<Array<InputMaybe<TransferBundle_filter>>>;
};

export type TransferBundle_orderBy =
  | 'id'
  | 'blockNumber'
  | 'timestamp'
  | 'transactionHash'
  | 'transactionHash__id'
  | 'transactionHash__blockNumber'
  | 'transactionHash__timestamp'
  | 'transactionHash__transactionHash'
  | 'transactionHash___nextStartIndex'
  | 'bundleName'
  | 'startLogIndex'
  | 'endLogIndex'
  | 'transfers'
  | 'profitLossLineItems';

export type TransferType = 'Mint' | 'Burn' | 'Transfer';

export type Transfer_filter = {
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
  transactionHash?: InputMaybe<Scalars['String']>;
  transactionHash_not?: InputMaybe<Scalars['String']>;
  transactionHash_gt?: InputMaybe<Scalars['String']>;
  transactionHash_lt?: InputMaybe<Scalars['String']>;
  transactionHash_gte?: InputMaybe<Scalars['String']>;
  transactionHash_lte?: InputMaybe<Scalars['String']>;
  transactionHash_in?: InputMaybe<Array<Scalars['String']>>;
  transactionHash_not_in?: InputMaybe<Array<Scalars['String']>>;
  transactionHash_contains?: InputMaybe<Scalars['String']>;
  transactionHash_contains_nocase?: InputMaybe<Scalars['String']>;
  transactionHash_not_contains?: InputMaybe<Scalars['String']>;
  transactionHash_not_contains_nocase?: InputMaybe<Scalars['String']>;
  transactionHash_starts_with?: InputMaybe<Scalars['String']>;
  transactionHash_starts_with_nocase?: InputMaybe<Scalars['String']>;
  transactionHash_not_starts_with?: InputMaybe<Scalars['String']>;
  transactionHash_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  transactionHash_ends_with?: InputMaybe<Scalars['String']>;
  transactionHash_ends_with_nocase?: InputMaybe<Scalars['String']>;
  transactionHash_not_ends_with?: InputMaybe<Scalars['String']>;
  transactionHash_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  transactionHash_?: InputMaybe<Transaction_filter>;
  logIndex?: InputMaybe<Scalars['Int']>;
  logIndex_not?: InputMaybe<Scalars['Int']>;
  logIndex_gt?: InputMaybe<Scalars['Int']>;
  logIndex_lt?: InputMaybe<Scalars['Int']>;
  logIndex_gte?: InputMaybe<Scalars['Int']>;
  logIndex_lte?: InputMaybe<Scalars['Int']>;
  logIndex_in?: InputMaybe<Array<Scalars['Int']>>;
  logIndex_not_in?: InputMaybe<Array<Scalars['Int']>>;
  from?: InputMaybe<Scalars['String']>;
  from_not?: InputMaybe<Scalars['String']>;
  from_gt?: InputMaybe<Scalars['String']>;
  from_lt?: InputMaybe<Scalars['String']>;
  from_gte?: InputMaybe<Scalars['String']>;
  from_lte?: InputMaybe<Scalars['String']>;
  from_in?: InputMaybe<Array<Scalars['String']>>;
  from_not_in?: InputMaybe<Array<Scalars['String']>>;
  from_contains?: InputMaybe<Scalars['String']>;
  from_contains_nocase?: InputMaybe<Scalars['String']>;
  from_not_contains?: InputMaybe<Scalars['String']>;
  from_not_contains_nocase?: InputMaybe<Scalars['String']>;
  from_starts_with?: InputMaybe<Scalars['String']>;
  from_starts_with_nocase?: InputMaybe<Scalars['String']>;
  from_not_starts_with?: InputMaybe<Scalars['String']>;
  from_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  from_ends_with?: InputMaybe<Scalars['String']>;
  from_ends_with_nocase?: InputMaybe<Scalars['String']>;
  from_not_ends_with?: InputMaybe<Scalars['String']>;
  from_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  from_?: InputMaybe<Account_filter>;
  to?: InputMaybe<Scalars['String']>;
  to_not?: InputMaybe<Scalars['String']>;
  to_gt?: InputMaybe<Scalars['String']>;
  to_lt?: InputMaybe<Scalars['String']>;
  to_gte?: InputMaybe<Scalars['String']>;
  to_lte?: InputMaybe<Scalars['String']>;
  to_in?: InputMaybe<Array<Scalars['String']>>;
  to_not_in?: InputMaybe<Array<Scalars['String']>>;
  to_contains?: InputMaybe<Scalars['String']>;
  to_contains_nocase?: InputMaybe<Scalars['String']>;
  to_not_contains?: InputMaybe<Scalars['String']>;
  to_not_contains_nocase?: InputMaybe<Scalars['String']>;
  to_starts_with?: InputMaybe<Scalars['String']>;
  to_starts_with_nocase?: InputMaybe<Scalars['String']>;
  to_not_starts_with?: InputMaybe<Scalars['String']>;
  to_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  to_ends_with?: InputMaybe<Scalars['String']>;
  to_ends_with_nocase?: InputMaybe<Scalars['String']>;
  to_not_ends_with?: InputMaybe<Scalars['String']>;
  to_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  to_?: InputMaybe<Account_filter>;
  operator?: InputMaybe<Scalars['String']>;
  operator_not?: InputMaybe<Scalars['String']>;
  operator_gt?: InputMaybe<Scalars['String']>;
  operator_lt?: InputMaybe<Scalars['String']>;
  operator_gte?: InputMaybe<Scalars['String']>;
  operator_lte?: InputMaybe<Scalars['String']>;
  operator_in?: InputMaybe<Array<Scalars['String']>>;
  operator_not_in?: InputMaybe<Array<Scalars['String']>>;
  operator_contains?: InputMaybe<Scalars['String']>;
  operator_contains_nocase?: InputMaybe<Scalars['String']>;
  operator_not_contains?: InputMaybe<Scalars['String']>;
  operator_not_contains_nocase?: InputMaybe<Scalars['String']>;
  operator_starts_with?: InputMaybe<Scalars['String']>;
  operator_starts_with_nocase?: InputMaybe<Scalars['String']>;
  operator_not_starts_with?: InputMaybe<Scalars['String']>;
  operator_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  operator_ends_with?: InputMaybe<Scalars['String']>;
  operator_ends_with_nocase?: InputMaybe<Scalars['String']>;
  operator_not_ends_with?: InputMaybe<Scalars['String']>;
  operator_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  operator_?: InputMaybe<Account_filter>;
  transferType?: InputMaybe<TransferType>;
  transferType_not?: InputMaybe<TransferType>;
  transferType_in?: InputMaybe<Array<TransferType>>;
  transferType_not_in?: InputMaybe<Array<TransferType>>;
  fromSystemAccount?: InputMaybe<SystemAccount>;
  fromSystemAccount_not?: InputMaybe<SystemAccount>;
  fromSystemAccount_in?: InputMaybe<Array<SystemAccount>>;
  fromSystemAccount_not_in?: InputMaybe<Array<SystemAccount>>;
  toSystemAccount?: InputMaybe<SystemAccount>;
  toSystemAccount_not?: InputMaybe<SystemAccount>;
  toSystemAccount_in?: InputMaybe<Array<SystemAccount>>;
  toSystemAccount_not_in?: InputMaybe<Array<SystemAccount>>;
  value?: InputMaybe<Scalars['BigInt']>;
  value_not?: InputMaybe<Scalars['BigInt']>;
  value_gt?: InputMaybe<Scalars['BigInt']>;
  value_lt?: InputMaybe<Scalars['BigInt']>;
  value_gte?: InputMaybe<Scalars['BigInt']>;
  value_lte?: InputMaybe<Scalars['BigInt']>;
  value_in?: InputMaybe<Array<Scalars['BigInt']>>;
  value_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  valueInUnderlying?: InputMaybe<Scalars['BigInt']>;
  valueInUnderlying_not?: InputMaybe<Scalars['BigInt']>;
  valueInUnderlying_gt?: InputMaybe<Scalars['BigInt']>;
  valueInUnderlying_lt?: InputMaybe<Scalars['BigInt']>;
  valueInUnderlying_gte?: InputMaybe<Scalars['BigInt']>;
  valueInUnderlying_lte?: InputMaybe<Scalars['BigInt']>;
  valueInUnderlying_in?: InputMaybe<Array<Scalars['BigInt']>>;
  valueInUnderlying_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
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
  tokenType?: InputMaybe<TokenType>;
  tokenType_not?: InputMaybe<TokenType>;
  tokenType_in?: InputMaybe<Array<TokenType>>;
  tokenType_not_in?: InputMaybe<Array<TokenType>>;
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
  maturity?: InputMaybe<Scalars['BigInt']>;
  maturity_not?: InputMaybe<Scalars['BigInt']>;
  maturity_gt?: InputMaybe<Scalars['BigInt']>;
  maturity_lt?: InputMaybe<Scalars['BigInt']>;
  maturity_gte?: InputMaybe<Scalars['BigInt']>;
  maturity_lte?: InputMaybe<Scalars['BigInt']>;
  maturity_in?: InputMaybe<Array<Scalars['BigInt']>>;
  maturity_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<Transfer_filter>>>;
  or?: InputMaybe<Array<InputMaybe<Transfer_filter>>>;
};

export type Transfer_orderBy =
  | 'id'
  | 'blockNumber'
  | 'timestamp'
  | 'transactionHash'
  | 'transactionHash__id'
  | 'transactionHash__blockNumber'
  | 'transactionHash__timestamp'
  | 'transactionHash__transactionHash'
  | 'transactionHash___nextStartIndex'
  | 'logIndex'
  | 'from'
  | 'from__id'
  | 'from__firstUpdateBlockNumber'
  | 'from__firstUpdateTimestamp'
  | 'from__firstUpdateTransactionHash'
  | 'from__lastUpdateBlockNumber'
  | 'from__lastUpdateTimestamp'
  | 'from__lastUpdateTransactionHash'
  | 'from__systemAccountType'
  | 'from__allowPrimeBorrow'
  | 'from__nextSettleTime'
  | 'from__hasPortfolioAssetDebt'
  | 'from__hasCashDebt'
  | 'from__bitmapCurrencyId'
  | 'to'
  | 'to__id'
  | 'to__firstUpdateBlockNumber'
  | 'to__firstUpdateTimestamp'
  | 'to__firstUpdateTransactionHash'
  | 'to__lastUpdateBlockNumber'
  | 'to__lastUpdateTimestamp'
  | 'to__lastUpdateTransactionHash'
  | 'to__systemAccountType'
  | 'to__allowPrimeBorrow'
  | 'to__nextSettleTime'
  | 'to__hasPortfolioAssetDebt'
  | 'to__hasCashDebt'
  | 'to__bitmapCurrencyId'
  | 'operator'
  | 'operator__id'
  | 'operator__firstUpdateBlockNumber'
  | 'operator__firstUpdateTimestamp'
  | 'operator__firstUpdateTransactionHash'
  | 'operator__lastUpdateBlockNumber'
  | 'operator__lastUpdateTimestamp'
  | 'operator__lastUpdateTransactionHash'
  | 'operator__systemAccountType'
  | 'operator__allowPrimeBorrow'
  | 'operator__nextSettleTime'
  | 'operator__hasPortfolioAssetDebt'
  | 'operator__hasCashDebt'
  | 'operator__bitmapCurrencyId'
  | 'transferType'
  | 'fromSystemAccount'
  | 'toSystemAccount'
  | 'value'
  | 'valueInUnderlying'
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
  | 'token__currencyId'
  | 'token__name'
  | 'token__symbol'
  | 'token__decimals'
  | 'token__precision'
  | 'token__totalSupply'
  | 'token__hasTransferFee'
  | 'token__isfCashDebt'
  | 'token__maturity'
  | 'token__vaultAddress'
  | 'token__tokenAddress'
  | 'tokenType'
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
  | 'underlying__currencyId'
  | 'underlying__name'
  | 'underlying__symbol'
  | 'underlying__decimals'
  | 'underlying__precision'
  | 'underlying__totalSupply'
  | 'underlying__hasTransferFee'
  | 'underlying__isfCashDebt'
  | 'underlying__maturity'
  | 'underlying__vaultAddress'
  | 'underlying__tokenAddress'
  | 'maturity';

export type UnderlyingSnapshot = {
  id: Scalars['ID'];
  blockNumber: Scalars['BigInt'];
  timestamp: Scalars['BigInt'];
  transaction?: Maybe<Transaction>;
  /** Reference to the parent object */
  externalLending: ExternalLending;
  prevSnapshot?: Maybe<UnderlyingSnapshot>;
  /** Direct balanceOf the underlying token held by the contract */
  balanceOf: Scalars['BigInt'];
  /** Stored balanceOf of the underlying token held by the contract */
  storedBalanceOf: Scalars['BigInt'];
};

export type UnderlyingSnapshot_filter = {
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
  timestamp?: InputMaybe<Scalars['BigInt']>;
  timestamp_not?: InputMaybe<Scalars['BigInt']>;
  timestamp_gt?: InputMaybe<Scalars['BigInt']>;
  timestamp_lt?: InputMaybe<Scalars['BigInt']>;
  timestamp_gte?: InputMaybe<Scalars['BigInt']>;
  timestamp_lte?: InputMaybe<Scalars['BigInt']>;
  timestamp_in?: InputMaybe<Array<Scalars['BigInt']>>;
  timestamp_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  transaction?: InputMaybe<Scalars['String']>;
  transaction_not?: InputMaybe<Scalars['String']>;
  transaction_gt?: InputMaybe<Scalars['String']>;
  transaction_lt?: InputMaybe<Scalars['String']>;
  transaction_gte?: InputMaybe<Scalars['String']>;
  transaction_lte?: InputMaybe<Scalars['String']>;
  transaction_in?: InputMaybe<Array<Scalars['String']>>;
  transaction_not_in?: InputMaybe<Array<Scalars['String']>>;
  transaction_contains?: InputMaybe<Scalars['String']>;
  transaction_contains_nocase?: InputMaybe<Scalars['String']>;
  transaction_not_contains?: InputMaybe<Scalars['String']>;
  transaction_not_contains_nocase?: InputMaybe<Scalars['String']>;
  transaction_starts_with?: InputMaybe<Scalars['String']>;
  transaction_starts_with_nocase?: InputMaybe<Scalars['String']>;
  transaction_not_starts_with?: InputMaybe<Scalars['String']>;
  transaction_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  transaction_ends_with?: InputMaybe<Scalars['String']>;
  transaction_ends_with_nocase?: InputMaybe<Scalars['String']>;
  transaction_not_ends_with?: InputMaybe<Scalars['String']>;
  transaction_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  transaction_?: InputMaybe<Transaction_filter>;
  externalLending?: InputMaybe<Scalars['String']>;
  externalLending_not?: InputMaybe<Scalars['String']>;
  externalLending_gt?: InputMaybe<Scalars['String']>;
  externalLending_lt?: InputMaybe<Scalars['String']>;
  externalLending_gte?: InputMaybe<Scalars['String']>;
  externalLending_lte?: InputMaybe<Scalars['String']>;
  externalLending_in?: InputMaybe<Array<Scalars['String']>>;
  externalLending_not_in?: InputMaybe<Array<Scalars['String']>>;
  externalLending_contains?: InputMaybe<Scalars['String']>;
  externalLending_contains_nocase?: InputMaybe<Scalars['String']>;
  externalLending_not_contains?: InputMaybe<Scalars['String']>;
  externalLending_not_contains_nocase?: InputMaybe<Scalars['String']>;
  externalLending_starts_with?: InputMaybe<Scalars['String']>;
  externalLending_starts_with_nocase?: InputMaybe<Scalars['String']>;
  externalLending_not_starts_with?: InputMaybe<Scalars['String']>;
  externalLending_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  externalLending_ends_with?: InputMaybe<Scalars['String']>;
  externalLending_ends_with_nocase?: InputMaybe<Scalars['String']>;
  externalLending_not_ends_with?: InputMaybe<Scalars['String']>;
  externalLending_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  externalLending_?: InputMaybe<ExternalLending_filter>;
  prevSnapshot?: InputMaybe<Scalars['String']>;
  prevSnapshot_not?: InputMaybe<Scalars['String']>;
  prevSnapshot_gt?: InputMaybe<Scalars['String']>;
  prevSnapshot_lt?: InputMaybe<Scalars['String']>;
  prevSnapshot_gte?: InputMaybe<Scalars['String']>;
  prevSnapshot_lte?: InputMaybe<Scalars['String']>;
  prevSnapshot_in?: InputMaybe<Array<Scalars['String']>>;
  prevSnapshot_not_in?: InputMaybe<Array<Scalars['String']>>;
  prevSnapshot_contains?: InputMaybe<Scalars['String']>;
  prevSnapshot_contains_nocase?: InputMaybe<Scalars['String']>;
  prevSnapshot_not_contains?: InputMaybe<Scalars['String']>;
  prevSnapshot_not_contains_nocase?: InputMaybe<Scalars['String']>;
  prevSnapshot_starts_with?: InputMaybe<Scalars['String']>;
  prevSnapshot_starts_with_nocase?: InputMaybe<Scalars['String']>;
  prevSnapshot_not_starts_with?: InputMaybe<Scalars['String']>;
  prevSnapshot_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  prevSnapshot_ends_with?: InputMaybe<Scalars['String']>;
  prevSnapshot_ends_with_nocase?: InputMaybe<Scalars['String']>;
  prevSnapshot_not_ends_with?: InputMaybe<Scalars['String']>;
  prevSnapshot_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  prevSnapshot_?: InputMaybe<UnderlyingSnapshot_filter>;
  balanceOf?: InputMaybe<Scalars['BigInt']>;
  balanceOf_not?: InputMaybe<Scalars['BigInt']>;
  balanceOf_gt?: InputMaybe<Scalars['BigInt']>;
  balanceOf_lt?: InputMaybe<Scalars['BigInt']>;
  balanceOf_gte?: InputMaybe<Scalars['BigInt']>;
  balanceOf_lte?: InputMaybe<Scalars['BigInt']>;
  balanceOf_in?: InputMaybe<Array<Scalars['BigInt']>>;
  balanceOf_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  storedBalanceOf?: InputMaybe<Scalars['BigInt']>;
  storedBalanceOf_not?: InputMaybe<Scalars['BigInt']>;
  storedBalanceOf_gt?: InputMaybe<Scalars['BigInt']>;
  storedBalanceOf_lt?: InputMaybe<Scalars['BigInt']>;
  storedBalanceOf_gte?: InputMaybe<Scalars['BigInt']>;
  storedBalanceOf_lte?: InputMaybe<Scalars['BigInt']>;
  storedBalanceOf_in?: InputMaybe<Array<Scalars['BigInt']>>;
  storedBalanceOf_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<UnderlyingSnapshot_filter>>>;
  or?: InputMaybe<Array<InputMaybe<UnderlyingSnapshot_filter>>>;
};

export type UnderlyingSnapshot_orderBy =
  | 'id'
  | 'blockNumber'
  | 'timestamp'
  | 'transaction'
  | 'transaction__id'
  | 'transaction__blockNumber'
  | 'transaction__timestamp'
  | 'transaction__transactionHash'
  | 'transaction___nextStartIndex'
  | 'externalLending'
  | 'externalLending__id'
  | 'externalLending__lastUpdateBlockNumber'
  | 'externalLending__lastUpdateTimestamp'
  | 'externalLending__protocolRevenueAllTime'
  | 'prevSnapshot'
  | 'prevSnapshot__id'
  | 'prevSnapshot__blockNumber'
  | 'prevSnapshot__timestamp'
  | 'prevSnapshot__balanceOf'
  | 'prevSnapshot__storedBalanceOf'
  | 'balanceOf'
  | 'storedBalanceOf';

export type VaultConfiguration = {
  /** ID is the address of the vault */
  id: Scalars['ID'];
  lastUpdateBlockHash: Scalars['Bytes'];
  lastUpdateBlockNumber: Scalars['BigInt'];
  lastUpdateTimestamp: Scalars['Int'];
  lastUpdateTransactionHash: Scalars['Bytes'];
  /** Address of the strategy vault */
  vaultAddress: Scalars['Bytes'];
  /** Strategy identifier for the vault */
  strategy: Scalars['Bytes'];
  /** Name of the strategy vault */
  name: Scalars['String'];
  /** Primary currency the vault borrows in */
  primaryBorrowCurrency: Token;
  /** Minimum amount of primary currency that must be borrowed */
  minAccountBorrowSize: Scalars['BigInt'];
  /** Minimum collateral ratio before liquidation */
  minCollateralRatioBasisPoints: Scalars['Int'];
  /** Maximum collateral ratio that liquidation can reach */
  maxDeleverageCollateralRatioBasisPoints: Scalars['Int'];
  /** Fee assessed on primary borrow paid to the nToken and protocol */
  feeRateBasisPoints: Scalars['Int'];
  /** Share of fee paid to protocol reserve */
  reserveFeeSharePercent: Scalars['Int'];
  /** Discount rate given to liquidators */
  liquidationRatePercent: Scalars['Int'];
  /** Maximum market index for borrowing terms */
  maxBorrowMarketIndex: Scalars['Int'];
  /** Secondary borrow currencies (if any) */
  secondaryBorrowCurrencies?: Maybe<Array<Token>>;
  /** Max required collateral ratio for vault accounts */
  maxRequiredAccountCollateralRatioBasisPoints?: Maybe<Scalars['Int']>;
  /** Can the vault be entered */
  enabled: Scalars['Boolean'];
  /** Allows positions to be rolled forward */
  allowRollPosition: Scalars['Boolean'];
  /** Only the vault can enter */
  onlyVaultEntry: Scalars['Boolean'];
  /** Only the vault can exit */
  onlyVaultExit: Scalars['Boolean'];
  /** Only the vault can roll */
  onlyVaultRoll: Scalars['Boolean'];
  /** Only the vault can liquidate */
  onlyVaultDeleverage: Scalars['Boolean'];
  /** Only the vault can settle */
  onlyVaultSettle: Scalars['Boolean'];
  /** fCash discounting is enabled on the vault */
  discountfCash?: Maybe<Scalars['Boolean']>;
  /** Vault is allowed to re-enter Notional */
  allowsReentrancy: Scalars['Boolean'];
  /** Deleveraging is disabled on this vault */
  deleverageDisabled?: Maybe<Scalars['Boolean']>;
  maxPrimaryBorrowCapacity: Scalars['BigInt'];
  totalUsedPrimaryBorrowCapacity: Scalars['BigInt'];
  maxSecondaryBorrowCapacity?: Maybe<Array<Scalars['BigInt']>>;
  totalUsedSecondaryBorrowCapacity?: Maybe<Array<Scalars['BigInt']>>;
  minAccountSecondaryBorrow?: Maybe<Array<Scalars['BigInt']>>;
};

export type VaultConfigurationsecondaryBorrowCurrenciesArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Token_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<Token_filter>;
};

export type VaultConfiguration_filter = {
  id?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  lastUpdateBlockHash?: InputMaybe<Scalars['Bytes']>;
  lastUpdateBlockHash_not?: InputMaybe<Scalars['Bytes']>;
  lastUpdateBlockHash_gt?: InputMaybe<Scalars['Bytes']>;
  lastUpdateBlockHash_lt?: InputMaybe<Scalars['Bytes']>;
  lastUpdateBlockHash_gte?: InputMaybe<Scalars['Bytes']>;
  lastUpdateBlockHash_lte?: InputMaybe<Scalars['Bytes']>;
  lastUpdateBlockHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
  lastUpdateBlockHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  lastUpdateBlockHash_contains?: InputMaybe<Scalars['Bytes']>;
  lastUpdateBlockHash_not_contains?: InputMaybe<Scalars['Bytes']>;
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
  strategy?: InputMaybe<Scalars['Bytes']>;
  strategy_not?: InputMaybe<Scalars['Bytes']>;
  strategy_gt?: InputMaybe<Scalars['Bytes']>;
  strategy_lt?: InputMaybe<Scalars['Bytes']>;
  strategy_gte?: InputMaybe<Scalars['Bytes']>;
  strategy_lte?: InputMaybe<Scalars['Bytes']>;
  strategy_in?: InputMaybe<Array<Scalars['Bytes']>>;
  strategy_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  strategy_contains?: InputMaybe<Scalars['Bytes']>;
  strategy_not_contains?: InputMaybe<Scalars['Bytes']>;
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
  primaryBorrowCurrency?: InputMaybe<Scalars['String']>;
  primaryBorrowCurrency_not?: InputMaybe<Scalars['String']>;
  primaryBorrowCurrency_gt?: InputMaybe<Scalars['String']>;
  primaryBorrowCurrency_lt?: InputMaybe<Scalars['String']>;
  primaryBorrowCurrency_gte?: InputMaybe<Scalars['String']>;
  primaryBorrowCurrency_lte?: InputMaybe<Scalars['String']>;
  primaryBorrowCurrency_in?: InputMaybe<Array<Scalars['String']>>;
  primaryBorrowCurrency_not_in?: InputMaybe<Array<Scalars['String']>>;
  primaryBorrowCurrency_contains?: InputMaybe<Scalars['String']>;
  primaryBorrowCurrency_contains_nocase?: InputMaybe<Scalars['String']>;
  primaryBorrowCurrency_not_contains?: InputMaybe<Scalars['String']>;
  primaryBorrowCurrency_not_contains_nocase?: InputMaybe<Scalars['String']>;
  primaryBorrowCurrency_starts_with?: InputMaybe<Scalars['String']>;
  primaryBorrowCurrency_starts_with_nocase?: InputMaybe<Scalars['String']>;
  primaryBorrowCurrency_not_starts_with?: InputMaybe<Scalars['String']>;
  primaryBorrowCurrency_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  primaryBorrowCurrency_ends_with?: InputMaybe<Scalars['String']>;
  primaryBorrowCurrency_ends_with_nocase?: InputMaybe<Scalars['String']>;
  primaryBorrowCurrency_not_ends_with?: InputMaybe<Scalars['String']>;
  primaryBorrowCurrency_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  primaryBorrowCurrency_?: InputMaybe<Token_filter>;
  minAccountBorrowSize?: InputMaybe<Scalars['BigInt']>;
  minAccountBorrowSize_not?: InputMaybe<Scalars['BigInt']>;
  minAccountBorrowSize_gt?: InputMaybe<Scalars['BigInt']>;
  minAccountBorrowSize_lt?: InputMaybe<Scalars['BigInt']>;
  minAccountBorrowSize_gte?: InputMaybe<Scalars['BigInt']>;
  minAccountBorrowSize_lte?: InputMaybe<Scalars['BigInt']>;
  minAccountBorrowSize_in?: InputMaybe<Array<Scalars['BigInt']>>;
  minAccountBorrowSize_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  minCollateralRatioBasisPoints?: InputMaybe<Scalars['Int']>;
  minCollateralRatioBasisPoints_not?: InputMaybe<Scalars['Int']>;
  minCollateralRatioBasisPoints_gt?: InputMaybe<Scalars['Int']>;
  minCollateralRatioBasisPoints_lt?: InputMaybe<Scalars['Int']>;
  minCollateralRatioBasisPoints_gte?: InputMaybe<Scalars['Int']>;
  minCollateralRatioBasisPoints_lte?: InputMaybe<Scalars['Int']>;
  minCollateralRatioBasisPoints_in?: InputMaybe<Array<Scalars['Int']>>;
  minCollateralRatioBasisPoints_not_in?: InputMaybe<Array<Scalars['Int']>>;
  maxDeleverageCollateralRatioBasisPoints?: InputMaybe<Scalars['Int']>;
  maxDeleverageCollateralRatioBasisPoints_not?: InputMaybe<Scalars['Int']>;
  maxDeleverageCollateralRatioBasisPoints_gt?: InputMaybe<Scalars['Int']>;
  maxDeleverageCollateralRatioBasisPoints_lt?: InputMaybe<Scalars['Int']>;
  maxDeleverageCollateralRatioBasisPoints_gte?: InputMaybe<Scalars['Int']>;
  maxDeleverageCollateralRatioBasisPoints_lte?: InputMaybe<Scalars['Int']>;
  maxDeleverageCollateralRatioBasisPoints_in?: InputMaybe<
    Array<Scalars['Int']>
  >;
  maxDeleverageCollateralRatioBasisPoints_not_in?: InputMaybe<
    Array<Scalars['Int']>
  >;
  feeRateBasisPoints?: InputMaybe<Scalars['Int']>;
  feeRateBasisPoints_not?: InputMaybe<Scalars['Int']>;
  feeRateBasisPoints_gt?: InputMaybe<Scalars['Int']>;
  feeRateBasisPoints_lt?: InputMaybe<Scalars['Int']>;
  feeRateBasisPoints_gte?: InputMaybe<Scalars['Int']>;
  feeRateBasisPoints_lte?: InputMaybe<Scalars['Int']>;
  feeRateBasisPoints_in?: InputMaybe<Array<Scalars['Int']>>;
  feeRateBasisPoints_not_in?: InputMaybe<Array<Scalars['Int']>>;
  reserveFeeSharePercent?: InputMaybe<Scalars['Int']>;
  reserveFeeSharePercent_not?: InputMaybe<Scalars['Int']>;
  reserveFeeSharePercent_gt?: InputMaybe<Scalars['Int']>;
  reserveFeeSharePercent_lt?: InputMaybe<Scalars['Int']>;
  reserveFeeSharePercent_gte?: InputMaybe<Scalars['Int']>;
  reserveFeeSharePercent_lte?: InputMaybe<Scalars['Int']>;
  reserveFeeSharePercent_in?: InputMaybe<Array<Scalars['Int']>>;
  reserveFeeSharePercent_not_in?: InputMaybe<Array<Scalars['Int']>>;
  liquidationRatePercent?: InputMaybe<Scalars['Int']>;
  liquidationRatePercent_not?: InputMaybe<Scalars['Int']>;
  liquidationRatePercent_gt?: InputMaybe<Scalars['Int']>;
  liquidationRatePercent_lt?: InputMaybe<Scalars['Int']>;
  liquidationRatePercent_gte?: InputMaybe<Scalars['Int']>;
  liquidationRatePercent_lte?: InputMaybe<Scalars['Int']>;
  liquidationRatePercent_in?: InputMaybe<Array<Scalars['Int']>>;
  liquidationRatePercent_not_in?: InputMaybe<Array<Scalars['Int']>>;
  maxBorrowMarketIndex?: InputMaybe<Scalars['Int']>;
  maxBorrowMarketIndex_not?: InputMaybe<Scalars['Int']>;
  maxBorrowMarketIndex_gt?: InputMaybe<Scalars['Int']>;
  maxBorrowMarketIndex_lt?: InputMaybe<Scalars['Int']>;
  maxBorrowMarketIndex_gte?: InputMaybe<Scalars['Int']>;
  maxBorrowMarketIndex_lte?: InputMaybe<Scalars['Int']>;
  maxBorrowMarketIndex_in?: InputMaybe<Array<Scalars['Int']>>;
  maxBorrowMarketIndex_not_in?: InputMaybe<Array<Scalars['Int']>>;
  secondaryBorrowCurrencies?: InputMaybe<Array<Scalars['String']>>;
  secondaryBorrowCurrencies_not?: InputMaybe<Array<Scalars['String']>>;
  secondaryBorrowCurrencies_contains?: InputMaybe<Array<Scalars['String']>>;
  secondaryBorrowCurrencies_contains_nocase?: InputMaybe<
    Array<Scalars['String']>
  >;
  secondaryBorrowCurrencies_not_contains?: InputMaybe<Array<Scalars['String']>>;
  secondaryBorrowCurrencies_not_contains_nocase?: InputMaybe<
    Array<Scalars['String']>
  >;
  secondaryBorrowCurrencies_?: InputMaybe<Token_filter>;
  maxRequiredAccountCollateralRatioBasisPoints?: InputMaybe<Scalars['Int']>;
  maxRequiredAccountCollateralRatioBasisPoints_not?: InputMaybe<Scalars['Int']>;
  maxRequiredAccountCollateralRatioBasisPoints_gt?: InputMaybe<Scalars['Int']>;
  maxRequiredAccountCollateralRatioBasisPoints_lt?: InputMaybe<Scalars['Int']>;
  maxRequiredAccountCollateralRatioBasisPoints_gte?: InputMaybe<Scalars['Int']>;
  maxRequiredAccountCollateralRatioBasisPoints_lte?: InputMaybe<Scalars['Int']>;
  maxRequiredAccountCollateralRatioBasisPoints_in?: InputMaybe<
    Array<Scalars['Int']>
  >;
  maxRequiredAccountCollateralRatioBasisPoints_not_in?: InputMaybe<
    Array<Scalars['Int']>
  >;
  enabled?: InputMaybe<Scalars['Boolean']>;
  enabled_not?: InputMaybe<Scalars['Boolean']>;
  enabled_in?: InputMaybe<Array<Scalars['Boolean']>>;
  enabled_not_in?: InputMaybe<Array<Scalars['Boolean']>>;
  allowRollPosition?: InputMaybe<Scalars['Boolean']>;
  allowRollPosition_not?: InputMaybe<Scalars['Boolean']>;
  allowRollPosition_in?: InputMaybe<Array<Scalars['Boolean']>>;
  allowRollPosition_not_in?: InputMaybe<Array<Scalars['Boolean']>>;
  onlyVaultEntry?: InputMaybe<Scalars['Boolean']>;
  onlyVaultEntry_not?: InputMaybe<Scalars['Boolean']>;
  onlyVaultEntry_in?: InputMaybe<Array<Scalars['Boolean']>>;
  onlyVaultEntry_not_in?: InputMaybe<Array<Scalars['Boolean']>>;
  onlyVaultExit?: InputMaybe<Scalars['Boolean']>;
  onlyVaultExit_not?: InputMaybe<Scalars['Boolean']>;
  onlyVaultExit_in?: InputMaybe<Array<Scalars['Boolean']>>;
  onlyVaultExit_not_in?: InputMaybe<Array<Scalars['Boolean']>>;
  onlyVaultRoll?: InputMaybe<Scalars['Boolean']>;
  onlyVaultRoll_not?: InputMaybe<Scalars['Boolean']>;
  onlyVaultRoll_in?: InputMaybe<Array<Scalars['Boolean']>>;
  onlyVaultRoll_not_in?: InputMaybe<Array<Scalars['Boolean']>>;
  onlyVaultDeleverage?: InputMaybe<Scalars['Boolean']>;
  onlyVaultDeleverage_not?: InputMaybe<Scalars['Boolean']>;
  onlyVaultDeleverage_in?: InputMaybe<Array<Scalars['Boolean']>>;
  onlyVaultDeleverage_not_in?: InputMaybe<Array<Scalars['Boolean']>>;
  onlyVaultSettle?: InputMaybe<Scalars['Boolean']>;
  onlyVaultSettle_not?: InputMaybe<Scalars['Boolean']>;
  onlyVaultSettle_in?: InputMaybe<Array<Scalars['Boolean']>>;
  onlyVaultSettle_not_in?: InputMaybe<Array<Scalars['Boolean']>>;
  discountfCash?: InputMaybe<Scalars['Boolean']>;
  discountfCash_not?: InputMaybe<Scalars['Boolean']>;
  discountfCash_in?: InputMaybe<Array<Scalars['Boolean']>>;
  discountfCash_not_in?: InputMaybe<Array<Scalars['Boolean']>>;
  allowsReentrancy?: InputMaybe<Scalars['Boolean']>;
  allowsReentrancy_not?: InputMaybe<Scalars['Boolean']>;
  allowsReentrancy_in?: InputMaybe<Array<Scalars['Boolean']>>;
  allowsReentrancy_not_in?: InputMaybe<Array<Scalars['Boolean']>>;
  deleverageDisabled?: InputMaybe<Scalars['Boolean']>;
  deleverageDisabled_not?: InputMaybe<Scalars['Boolean']>;
  deleverageDisabled_in?: InputMaybe<Array<Scalars['Boolean']>>;
  deleverageDisabled_not_in?: InputMaybe<Array<Scalars['Boolean']>>;
  maxPrimaryBorrowCapacity?: InputMaybe<Scalars['BigInt']>;
  maxPrimaryBorrowCapacity_not?: InputMaybe<Scalars['BigInt']>;
  maxPrimaryBorrowCapacity_gt?: InputMaybe<Scalars['BigInt']>;
  maxPrimaryBorrowCapacity_lt?: InputMaybe<Scalars['BigInt']>;
  maxPrimaryBorrowCapacity_gte?: InputMaybe<Scalars['BigInt']>;
  maxPrimaryBorrowCapacity_lte?: InputMaybe<Scalars['BigInt']>;
  maxPrimaryBorrowCapacity_in?: InputMaybe<Array<Scalars['BigInt']>>;
  maxPrimaryBorrowCapacity_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  totalUsedPrimaryBorrowCapacity?: InputMaybe<Scalars['BigInt']>;
  totalUsedPrimaryBorrowCapacity_not?: InputMaybe<Scalars['BigInt']>;
  totalUsedPrimaryBorrowCapacity_gt?: InputMaybe<Scalars['BigInt']>;
  totalUsedPrimaryBorrowCapacity_lt?: InputMaybe<Scalars['BigInt']>;
  totalUsedPrimaryBorrowCapacity_gte?: InputMaybe<Scalars['BigInt']>;
  totalUsedPrimaryBorrowCapacity_lte?: InputMaybe<Scalars['BigInt']>;
  totalUsedPrimaryBorrowCapacity_in?: InputMaybe<Array<Scalars['BigInt']>>;
  totalUsedPrimaryBorrowCapacity_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  maxSecondaryBorrowCapacity?: InputMaybe<Array<Scalars['BigInt']>>;
  maxSecondaryBorrowCapacity_not?: InputMaybe<Array<Scalars['BigInt']>>;
  maxSecondaryBorrowCapacity_contains?: InputMaybe<Array<Scalars['BigInt']>>;
  maxSecondaryBorrowCapacity_contains_nocase?: InputMaybe<
    Array<Scalars['BigInt']>
  >;
  maxSecondaryBorrowCapacity_not_contains?: InputMaybe<
    Array<Scalars['BigInt']>
  >;
  maxSecondaryBorrowCapacity_not_contains_nocase?: InputMaybe<
    Array<Scalars['BigInt']>
  >;
  totalUsedSecondaryBorrowCapacity?: InputMaybe<Array<Scalars['BigInt']>>;
  totalUsedSecondaryBorrowCapacity_not?: InputMaybe<Array<Scalars['BigInt']>>;
  totalUsedSecondaryBorrowCapacity_contains?: InputMaybe<
    Array<Scalars['BigInt']>
  >;
  totalUsedSecondaryBorrowCapacity_contains_nocase?: InputMaybe<
    Array<Scalars['BigInt']>
  >;
  totalUsedSecondaryBorrowCapacity_not_contains?: InputMaybe<
    Array<Scalars['BigInt']>
  >;
  totalUsedSecondaryBorrowCapacity_not_contains_nocase?: InputMaybe<
    Array<Scalars['BigInt']>
  >;
  minAccountSecondaryBorrow?: InputMaybe<Array<Scalars['BigInt']>>;
  minAccountSecondaryBorrow_not?: InputMaybe<Array<Scalars['BigInt']>>;
  minAccountSecondaryBorrow_contains?: InputMaybe<Array<Scalars['BigInt']>>;
  minAccountSecondaryBorrow_contains_nocase?: InputMaybe<
    Array<Scalars['BigInt']>
  >;
  minAccountSecondaryBorrow_not_contains?: InputMaybe<Array<Scalars['BigInt']>>;
  minAccountSecondaryBorrow_not_contains_nocase?: InputMaybe<
    Array<Scalars['BigInt']>
  >;
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<VaultConfiguration_filter>>>;
  or?: InputMaybe<Array<InputMaybe<VaultConfiguration_filter>>>;
};

export type VaultConfiguration_orderBy =
  | 'id'
  | 'lastUpdateBlockHash'
  | 'lastUpdateBlockNumber'
  | 'lastUpdateTimestamp'
  | 'lastUpdateTransactionHash'
  | 'vaultAddress'
  | 'strategy'
  | 'name'
  | 'primaryBorrowCurrency'
  | 'primaryBorrowCurrency__id'
  | 'primaryBorrowCurrency__firstUpdateBlockNumber'
  | 'primaryBorrowCurrency__firstUpdateTimestamp'
  | 'primaryBorrowCurrency__firstUpdateTransactionHash'
  | 'primaryBorrowCurrency__lastUpdateBlockNumber'
  | 'primaryBorrowCurrency__lastUpdateTimestamp'
  | 'primaryBorrowCurrency__lastUpdateTransactionHash'
  | 'primaryBorrowCurrency__tokenType'
  | 'primaryBorrowCurrency__tokenInterface'
  | 'primaryBorrowCurrency__currencyId'
  | 'primaryBorrowCurrency__name'
  | 'primaryBorrowCurrency__symbol'
  | 'primaryBorrowCurrency__decimals'
  | 'primaryBorrowCurrency__precision'
  | 'primaryBorrowCurrency__totalSupply'
  | 'primaryBorrowCurrency__hasTransferFee'
  | 'primaryBorrowCurrency__isfCashDebt'
  | 'primaryBorrowCurrency__maturity'
  | 'primaryBorrowCurrency__vaultAddress'
  | 'primaryBorrowCurrency__tokenAddress'
  | 'minAccountBorrowSize'
  | 'minCollateralRatioBasisPoints'
  | 'maxDeleverageCollateralRatioBasisPoints'
  | 'feeRateBasisPoints'
  | 'reserveFeeSharePercent'
  | 'liquidationRatePercent'
  | 'maxBorrowMarketIndex'
  | 'secondaryBorrowCurrencies'
  | 'maxRequiredAccountCollateralRatioBasisPoints'
  | 'enabled'
  | 'allowRollPosition'
  | 'onlyVaultEntry'
  | 'onlyVaultExit'
  | 'onlyVaultRoll'
  | 'onlyVaultDeleverage'
  | 'onlyVaultSettle'
  | 'discountfCash'
  | 'allowsReentrancy'
  | 'deleverageDisabled'
  | 'maxPrimaryBorrowCapacity'
  | 'totalUsedPrimaryBorrowCapacity'
  | 'maxSecondaryBorrowCapacity'
  | 'totalUsedSecondaryBorrowCapacity'
  | 'minAccountSecondaryBorrow';

export type WhitelistedCapability =
  | 'GlobalTransferOperator'
  | 'AuthorizedCallbackContract'
  | 'SecondaryIncentiveRewarder'
  | 'DetachedSecondaryIncentiveRewarder';

export type WhitelistedContract = {
  id: Scalars['ID'];
  lastUpdateBlockNumber: Scalars['BigInt'];
  lastUpdateTimestamp: Scalars['Int'];
  lastUpdateTransactionHash: Scalars['Bytes'];
  capability: Array<WhitelistedCapability>;
  name: Scalars['String'];
  currency?: Maybe<CurrencyConfiguration>;
};

export type WhitelistedContract_filter = {
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
  capability?: InputMaybe<Array<WhitelistedCapability>>;
  capability_not?: InputMaybe<Array<WhitelistedCapability>>;
  capability_contains?: InputMaybe<Array<WhitelistedCapability>>;
  capability_contains_nocase?: InputMaybe<Array<WhitelistedCapability>>;
  capability_not_contains?: InputMaybe<Array<WhitelistedCapability>>;
  capability_not_contains_nocase?: InputMaybe<Array<WhitelistedCapability>>;
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
  currency?: InputMaybe<Scalars['String']>;
  currency_not?: InputMaybe<Scalars['String']>;
  currency_gt?: InputMaybe<Scalars['String']>;
  currency_lt?: InputMaybe<Scalars['String']>;
  currency_gte?: InputMaybe<Scalars['String']>;
  currency_lte?: InputMaybe<Scalars['String']>;
  currency_in?: InputMaybe<Array<Scalars['String']>>;
  currency_not_in?: InputMaybe<Array<Scalars['String']>>;
  currency_contains?: InputMaybe<Scalars['String']>;
  currency_contains_nocase?: InputMaybe<Scalars['String']>;
  currency_not_contains?: InputMaybe<Scalars['String']>;
  currency_not_contains_nocase?: InputMaybe<Scalars['String']>;
  currency_starts_with?: InputMaybe<Scalars['String']>;
  currency_starts_with_nocase?: InputMaybe<Scalars['String']>;
  currency_not_starts_with?: InputMaybe<Scalars['String']>;
  currency_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  currency_ends_with?: InputMaybe<Scalars['String']>;
  currency_ends_with_nocase?: InputMaybe<Scalars['String']>;
  currency_not_ends_with?: InputMaybe<Scalars['String']>;
  currency_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  currency_?: InputMaybe<CurrencyConfiguration_filter>;
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<WhitelistedContract_filter>>>;
  or?: InputMaybe<Array<InputMaybe<WhitelistedContract_filter>>>;
};

export type WhitelistedContract_orderBy =
  | 'id'
  | 'lastUpdateBlockNumber'
  | 'lastUpdateTimestamp'
  | 'lastUpdateTransactionHash'
  | 'capability'
  | 'name'
  | 'currency'
  | 'currency__id'
  | 'currency__lastUpdateBlockNumber'
  | 'currency__lastUpdateTimestamp'
  | 'currency__lastUpdateTransactionHash'
  | 'currency__maxUnderlyingSupply'
  | 'currency__maxPrimeDebtUtilization'
  | 'currency__collateralHaircut'
  | 'currency__debtBuffer'
  | 'currency__liquidationDiscount'
  | 'currency__primeCashRateOracleTimeWindowSeconds'
  | 'currency__primeCashHoldingsOracle'
  | 'currency__primeDebtAllowed'
  | 'currency__fCashRateOracleTimeWindowSeconds'
  | 'currency__fCashReserveFeeSharePercent'
  | 'currency__fCashDebtBufferBasisPoints'
  | 'currency__fCashHaircutBasisPoints'
  | 'currency__fCashMinOracleRate'
  | 'currency__fCashMaxOracleRate'
  | 'currency__fCashMaxDiscountFactor'
  | 'currency__fCashLiquidationHaircutBasisPoints'
  | 'currency__fCashLiquidationDebtBufferBasisPoints'
  | 'currency__treasuryReserveBuffer'
  | 'currency__residualPurchaseIncentiveBasisPoints'
  | 'currency__residualPurchaseTimeBufferSeconds'
  | 'currency__cashWithholdingBufferBasisPoints'
  | 'currency__pvHaircutPercentage'
  | 'currency__liquidationHaircutPercentage'
  | 'currency__maxMintDeviationBasisPoints';

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
   *
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

export type fCashMarket = {
  /** Currency Id:Settlement Date:Maturity combination */
  id: Scalars['ID'];
  lastUpdateBlockNumber: Scalars['BigInt'];
  lastUpdateTimestamp: Scalars['Int'];
  lastUpdateTransaction?: Maybe<Transaction>;
  /** Currency of this market */
  underlying: Token;
  /** fCash token traded by this market */
  fCash: Token;
  /** Date that fCash from this market will mature */
  maturity: Scalars['Int'];
  /** Date that this market will settle */
  settlementDate: Scalars['Int'];
  /** Market index */
  marketIndex: Scalars['Int'];
  /** Length of market maturity in seconds */
  marketMaturityLengthSeconds: Scalars['Int'];
  current: fCashMarketSnapshot;
  snapshots?: Maybe<Array<fCashMarketSnapshot>>;
};

export type fCashMarketsnapshotsArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<fCashMarketSnapshot_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<fCashMarketSnapshot_filter>;
};

export type fCashMarketSnapshot = {
  /** Market ID:Block Number */
  id: Scalars['ID'];
  blockNumber: Scalars['BigInt'];
  timestamp: Scalars['Int'];
  transaction?: Maybe<Transaction>;
  market: fCashMarket;
  /** Total fCash available in the market */
  totalfCash: Scalars['BigInt'];
  /** Total prime cash available in the market */
  totalPrimeCash: Scalars['BigInt'];
  /** Total liquidity tokens available in the market */
  totalLiquidity: Scalars['BigInt'];
  /** Last annualized interest rate the market traded at */
  lastImpliedRate: Scalars['Int'];
  /** Oracle rate for the market, must be averaged in using previousTradeTime */
  oracleRate: Scalars['Int'];
  /** Last time when a trade occurred on the market */
  previousTradeTime: Scalars['Int'];
  /** Total prime cash converted to underlying in the market */
  totalPrimeCashInUnderlying?: Maybe<Scalars['BigInt']>;
  /** Total fCash converted to present value in the market */
  totalfCashPresentValue?: Maybe<Scalars['BigInt']>;
  /** Total fCash debt outstanding for the given fCash asset */
  totalfCashDebtOutstanding: Scalars['BigInt'];
  /** Total fCash debt outstanding in present value terms for the given fCash asset */
  totalfCashDebtOutstandingPresentValue?: Maybe<Scalars['BigInt']>;
};

export type fCashMarketSnapshot_filter = {
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
  transaction?: InputMaybe<Scalars['String']>;
  transaction_not?: InputMaybe<Scalars['String']>;
  transaction_gt?: InputMaybe<Scalars['String']>;
  transaction_lt?: InputMaybe<Scalars['String']>;
  transaction_gte?: InputMaybe<Scalars['String']>;
  transaction_lte?: InputMaybe<Scalars['String']>;
  transaction_in?: InputMaybe<Array<Scalars['String']>>;
  transaction_not_in?: InputMaybe<Array<Scalars['String']>>;
  transaction_contains?: InputMaybe<Scalars['String']>;
  transaction_contains_nocase?: InputMaybe<Scalars['String']>;
  transaction_not_contains?: InputMaybe<Scalars['String']>;
  transaction_not_contains_nocase?: InputMaybe<Scalars['String']>;
  transaction_starts_with?: InputMaybe<Scalars['String']>;
  transaction_starts_with_nocase?: InputMaybe<Scalars['String']>;
  transaction_not_starts_with?: InputMaybe<Scalars['String']>;
  transaction_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  transaction_ends_with?: InputMaybe<Scalars['String']>;
  transaction_ends_with_nocase?: InputMaybe<Scalars['String']>;
  transaction_not_ends_with?: InputMaybe<Scalars['String']>;
  transaction_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  transaction_?: InputMaybe<Transaction_filter>;
  market?: InputMaybe<Scalars['String']>;
  market_not?: InputMaybe<Scalars['String']>;
  market_gt?: InputMaybe<Scalars['String']>;
  market_lt?: InputMaybe<Scalars['String']>;
  market_gte?: InputMaybe<Scalars['String']>;
  market_lte?: InputMaybe<Scalars['String']>;
  market_in?: InputMaybe<Array<Scalars['String']>>;
  market_not_in?: InputMaybe<Array<Scalars['String']>>;
  market_contains?: InputMaybe<Scalars['String']>;
  market_contains_nocase?: InputMaybe<Scalars['String']>;
  market_not_contains?: InputMaybe<Scalars['String']>;
  market_not_contains_nocase?: InputMaybe<Scalars['String']>;
  market_starts_with?: InputMaybe<Scalars['String']>;
  market_starts_with_nocase?: InputMaybe<Scalars['String']>;
  market_not_starts_with?: InputMaybe<Scalars['String']>;
  market_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  market_ends_with?: InputMaybe<Scalars['String']>;
  market_ends_with_nocase?: InputMaybe<Scalars['String']>;
  market_not_ends_with?: InputMaybe<Scalars['String']>;
  market_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  market_?: InputMaybe<fCashMarket_filter>;
  totalfCash?: InputMaybe<Scalars['BigInt']>;
  totalfCash_not?: InputMaybe<Scalars['BigInt']>;
  totalfCash_gt?: InputMaybe<Scalars['BigInt']>;
  totalfCash_lt?: InputMaybe<Scalars['BigInt']>;
  totalfCash_gte?: InputMaybe<Scalars['BigInt']>;
  totalfCash_lte?: InputMaybe<Scalars['BigInt']>;
  totalfCash_in?: InputMaybe<Array<Scalars['BigInt']>>;
  totalfCash_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  totalPrimeCash?: InputMaybe<Scalars['BigInt']>;
  totalPrimeCash_not?: InputMaybe<Scalars['BigInt']>;
  totalPrimeCash_gt?: InputMaybe<Scalars['BigInt']>;
  totalPrimeCash_lt?: InputMaybe<Scalars['BigInt']>;
  totalPrimeCash_gte?: InputMaybe<Scalars['BigInt']>;
  totalPrimeCash_lte?: InputMaybe<Scalars['BigInt']>;
  totalPrimeCash_in?: InputMaybe<Array<Scalars['BigInt']>>;
  totalPrimeCash_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  totalLiquidity?: InputMaybe<Scalars['BigInt']>;
  totalLiquidity_not?: InputMaybe<Scalars['BigInt']>;
  totalLiquidity_gt?: InputMaybe<Scalars['BigInt']>;
  totalLiquidity_lt?: InputMaybe<Scalars['BigInt']>;
  totalLiquidity_gte?: InputMaybe<Scalars['BigInt']>;
  totalLiquidity_lte?: InputMaybe<Scalars['BigInt']>;
  totalLiquidity_in?: InputMaybe<Array<Scalars['BigInt']>>;
  totalLiquidity_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  lastImpliedRate?: InputMaybe<Scalars['Int']>;
  lastImpliedRate_not?: InputMaybe<Scalars['Int']>;
  lastImpliedRate_gt?: InputMaybe<Scalars['Int']>;
  lastImpliedRate_lt?: InputMaybe<Scalars['Int']>;
  lastImpliedRate_gte?: InputMaybe<Scalars['Int']>;
  lastImpliedRate_lte?: InputMaybe<Scalars['Int']>;
  lastImpliedRate_in?: InputMaybe<Array<Scalars['Int']>>;
  lastImpliedRate_not_in?: InputMaybe<Array<Scalars['Int']>>;
  oracleRate?: InputMaybe<Scalars['Int']>;
  oracleRate_not?: InputMaybe<Scalars['Int']>;
  oracleRate_gt?: InputMaybe<Scalars['Int']>;
  oracleRate_lt?: InputMaybe<Scalars['Int']>;
  oracleRate_gte?: InputMaybe<Scalars['Int']>;
  oracleRate_lte?: InputMaybe<Scalars['Int']>;
  oracleRate_in?: InputMaybe<Array<Scalars['Int']>>;
  oracleRate_not_in?: InputMaybe<Array<Scalars['Int']>>;
  previousTradeTime?: InputMaybe<Scalars['Int']>;
  previousTradeTime_not?: InputMaybe<Scalars['Int']>;
  previousTradeTime_gt?: InputMaybe<Scalars['Int']>;
  previousTradeTime_lt?: InputMaybe<Scalars['Int']>;
  previousTradeTime_gte?: InputMaybe<Scalars['Int']>;
  previousTradeTime_lte?: InputMaybe<Scalars['Int']>;
  previousTradeTime_in?: InputMaybe<Array<Scalars['Int']>>;
  previousTradeTime_not_in?: InputMaybe<Array<Scalars['Int']>>;
  totalPrimeCashInUnderlying?: InputMaybe<Scalars['BigInt']>;
  totalPrimeCashInUnderlying_not?: InputMaybe<Scalars['BigInt']>;
  totalPrimeCashInUnderlying_gt?: InputMaybe<Scalars['BigInt']>;
  totalPrimeCashInUnderlying_lt?: InputMaybe<Scalars['BigInt']>;
  totalPrimeCashInUnderlying_gte?: InputMaybe<Scalars['BigInt']>;
  totalPrimeCashInUnderlying_lte?: InputMaybe<Scalars['BigInt']>;
  totalPrimeCashInUnderlying_in?: InputMaybe<Array<Scalars['BigInt']>>;
  totalPrimeCashInUnderlying_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  totalfCashPresentValue?: InputMaybe<Scalars['BigInt']>;
  totalfCashPresentValue_not?: InputMaybe<Scalars['BigInt']>;
  totalfCashPresentValue_gt?: InputMaybe<Scalars['BigInt']>;
  totalfCashPresentValue_lt?: InputMaybe<Scalars['BigInt']>;
  totalfCashPresentValue_gte?: InputMaybe<Scalars['BigInt']>;
  totalfCashPresentValue_lte?: InputMaybe<Scalars['BigInt']>;
  totalfCashPresentValue_in?: InputMaybe<Array<Scalars['BigInt']>>;
  totalfCashPresentValue_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  totalfCashDebtOutstanding?: InputMaybe<Scalars['BigInt']>;
  totalfCashDebtOutstanding_not?: InputMaybe<Scalars['BigInt']>;
  totalfCashDebtOutstanding_gt?: InputMaybe<Scalars['BigInt']>;
  totalfCashDebtOutstanding_lt?: InputMaybe<Scalars['BigInt']>;
  totalfCashDebtOutstanding_gte?: InputMaybe<Scalars['BigInt']>;
  totalfCashDebtOutstanding_lte?: InputMaybe<Scalars['BigInt']>;
  totalfCashDebtOutstanding_in?: InputMaybe<Array<Scalars['BigInt']>>;
  totalfCashDebtOutstanding_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  totalfCashDebtOutstandingPresentValue?: InputMaybe<Scalars['BigInt']>;
  totalfCashDebtOutstandingPresentValue_not?: InputMaybe<Scalars['BigInt']>;
  totalfCashDebtOutstandingPresentValue_gt?: InputMaybe<Scalars['BigInt']>;
  totalfCashDebtOutstandingPresentValue_lt?: InputMaybe<Scalars['BigInt']>;
  totalfCashDebtOutstandingPresentValue_gte?: InputMaybe<Scalars['BigInt']>;
  totalfCashDebtOutstandingPresentValue_lte?: InputMaybe<Scalars['BigInt']>;
  totalfCashDebtOutstandingPresentValue_in?: InputMaybe<
    Array<Scalars['BigInt']>
  >;
  totalfCashDebtOutstandingPresentValue_not_in?: InputMaybe<
    Array<Scalars['BigInt']>
  >;
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<fCashMarketSnapshot_filter>>>;
  or?: InputMaybe<Array<InputMaybe<fCashMarketSnapshot_filter>>>;
};

export type fCashMarketSnapshot_orderBy =
  | 'id'
  | 'blockNumber'
  | 'timestamp'
  | 'transaction'
  | 'transaction__id'
  | 'transaction__blockNumber'
  | 'transaction__timestamp'
  | 'transaction__transactionHash'
  | 'transaction___nextStartIndex'
  | 'market'
  | 'market__id'
  | 'market__lastUpdateBlockNumber'
  | 'market__lastUpdateTimestamp'
  | 'market__maturity'
  | 'market__settlementDate'
  | 'market__marketIndex'
  | 'market__marketMaturityLengthSeconds'
  | 'totalfCash'
  | 'totalPrimeCash'
  | 'totalLiquidity'
  | 'lastImpliedRate'
  | 'oracleRate'
  | 'previousTradeTime'
  | 'totalPrimeCashInUnderlying'
  | 'totalfCashPresentValue'
  | 'totalfCashDebtOutstanding'
  | 'totalfCashDebtOutstandingPresentValue';

export type fCashMarket_filter = {
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
  lastUpdateTransaction?: InputMaybe<Scalars['String']>;
  lastUpdateTransaction_not?: InputMaybe<Scalars['String']>;
  lastUpdateTransaction_gt?: InputMaybe<Scalars['String']>;
  lastUpdateTransaction_lt?: InputMaybe<Scalars['String']>;
  lastUpdateTransaction_gte?: InputMaybe<Scalars['String']>;
  lastUpdateTransaction_lte?: InputMaybe<Scalars['String']>;
  lastUpdateTransaction_in?: InputMaybe<Array<Scalars['String']>>;
  lastUpdateTransaction_not_in?: InputMaybe<Array<Scalars['String']>>;
  lastUpdateTransaction_contains?: InputMaybe<Scalars['String']>;
  lastUpdateTransaction_contains_nocase?: InputMaybe<Scalars['String']>;
  lastUpdateTransaction_not_contains?: InputMaybe<Scalars['String']>;
  lastUpdateTransaction_not_contains_nocase?: InputMaybe<Scalars['String']>;
  lastUpdateTransaction_starts_with?: InputMaybe<Scalars['String']>;
  lastUpdateTransaction_starts_with_nocase?: InputMaybe<Scalars['String']>;
  lastUpdateTransaction_not_starts_with?: InputMaybe<Scalars['String']>;
  lastUpdateTransaction_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  lastUpdateTransaction_ends_with?: InputMaybe<Scalars['String']>;
  lastUpdateTransaction_ends_with_nocase?: InputMaybe<Scalars['String']>;
  lastUpdateTransaction_not_ends_with?: InputMaybe<Scalars['String']>;
  lastUpdateTransaction_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  lastUpdateTransaction_?: InputMaybe<Transaction_filter>;
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
  fCash?: InputMaybe<Scalars['String']>;
  fCash_not?: InputMaybe<Scalars['String']>;
  fCash_gt?: InputMaybe<Scalars['String']>;
  fCash_lt?: InputMaybe<Scalars['String']>;
  fCash_gte?: InputMaybe<Scalars['String']>;
  fCash_lte?: InputMaybe<Scalars['String']>;
  fCash_in?: InputMaybe<Array<Scalars['String']>>;
  fCash_not_in?: InputMaybe<Array<Scalars['String']>>;
  fCash_contains?: InputMaybe<Scalars['String']>;
  fCash_contains_nocase?: InputMaybe<Scalars['String']>;
  fCash_not_contains?: InputMaybe<Scalars['String']>;
  fCash_not_contains_nocase?: InputMaybe<Scalars['String']>;
  fCash_starts_with?: InputMaybe<Scalars['String']>;
  fCash_starts_with_nocase?: InputMaybe<Scalars['String']>;
  fCash_not_starts_with?: InputMaybe<Scalars['String']>;
  fCash_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  fCash_ends_with?: InputMaybe<Scalars['String']>;
  fCash_ends_with_nocase?: InputMaybe<Scalars['String']>;
  fCash_not_ends_with?: InputMaybe<Scalars['String']>;
  fCash_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  fCash_?: InputMaybe<Token_filter>;
  maturity?: InputMaybe<Scalars['Int']>;
  maturity_not?: InputMaybe<Scalars['Int']>;
  maturity_gt?: InputMaybe<Scalars['Int']>;
  maturity_lt?: InputMaybe<Scalars['Int']>;
  maturity_gte?: InputMaybe<Scalars['Int']>;
  maturity_lte?: InputMaybe<Scalars['Int']>;
  maturity_in?: InputMaybe<Array<Scalars['Int']>>;
  maturity_not_in?: InputMaybe<Array<Scalars['Int']>>;
  settlementDate?: InputMaybe<Scalars['Int']>;
  settlementDate_not?: InputMaybe<Scalars['Int']>;
  settlementDate_gt?: InputMaybe<Scalars['Int']>;
  settlementDate_lt?: InputMaybe<Scalars['Int']>;
  settlementDate_gte?: InputMaybe<Scalars['Int']>;
  settlementDate_lte?: InputMaybe<Scalars['Int']>;
  settlementDate_in?: InputMaybe<Array<Scalars['Int']>>;
  settlementDate_not_in?: InputMaybe<Array<Scalars['Int']>>;
  marketIndex?: InputMaybe<Scalars['Int']>;
  marketIndex_not?: InputMaybe<Scalars['Int']>;
  marketIndex_gt?: InputMaybe<Scalars['Int']>;
  marketIndex_lt?: InputMaybe<Scalars['Int']>;
  marketIndex_gte?: InputMaybe<Scalars['Int']>;
  marketIndex_lte?: InputMaybe<Scalars['Int']>;
  marketIndex_in?: InputMaybe<Array<Scalars['Int']>>;
  marketIndex_not_in?: InputMaybe<Array<Scalars['Int']>>;
  marketMaturityLengthSeconds?: InputMaybe<Scalars['Int']>;
  marketMaturityLengthSeconds_not?: InputMaybe<Scalars['Int']>;
  marketMaturityLengthSeconds_gt?: InputMaybe<Scalars['Int']>;
  marketMaturityLengthSeconds_lt?: InputMaybe<Scalars['Int']>;
  marketMaturityLengthSeconds_gte?: InputMaybe<Scalars['Int']>;
  marketMaturityLengthSeconds_lte?: InputMaybe<Scalars['Int']>;
  marketMaturityLengthSeconds_in?: InputMaybe<Array<Scalars['Int']>>;
  marketMaturityLengthSeconds_not_in?: InputMaybe<Array<Scalars['Int']>>;
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
  current_?: InputMaybe<fCashMarketSnapshot_filter>;
  snapshots_?: InputMaybe<fCashMarketSnapshot_filter>;
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<fCashMarket_filter>>>;
  or?: InputMaybe<Array<InputMaybe<fCashMarket_filter>>>;
};

export type fCashMarket_orderBy =
  | 'id'
  | 'lastUpdateBlockNumber'
  | 'lastUpdateTimestamp'
  | 'lastUpdateTransaction'
  | 'lastUpdateTransaction__id'
  | 'lastUpdateTransaction__blockNumber'
  | 'lastUpdateTransaction__timestamp'
  | 'lastUpdateTransaction__transactionHash'
  | 'lastUpdateTransaction___nextStartIndex'
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
  | 'underlying__currencyId'
  | 'underlying__name'
  | 'underlying__symbol'
  | 'underlying__decimals'
  | 'underlying__precision'
  | 'underlying__totalSupply'
  | 'underlying__hasTransferFee'
  | 'underlying__isfCashDebt'
  | 'underlying__maturity'
  | 'underlying__vaultAddress'
  | 'underlying__tokenAddress'
  | 'fCash'
  | 'fCash__id'
  | 'fCash__firstUpdateBlockNumber'
  | 'fCash__firstUpdateTimestamp'
  | 'fCash__firstUpdateTransactionHash'
  | 'fCash__lastUpdateBlockNumber'
  | 'fCash__lastUpdateTimestamp'
  | 'fCash__lastUpdateTransactionHash'
  | 'fCash__tokenType'
  | 'fCash__tokenInterface'
  | 'fCash__currencyId'
  | 'fCash__name'
  | 'fCash__symbol'
  | 'fCash__decimals'
  | 'fCash__precision'
  | 'fCash__totalSupply'
  | 'fCash__hasTransferFee'
  | 'fCash__isfCashDebt'
  | 'fCash__maturity'
  | 'fCash__vaultAddress'
  | 'fCash__tokenAddress'
  | 'maturity'
  | 'settlementDate'
  | 'marketIndex'
  | 'marketMaturityLengthSeconds'
  | 'current'
  | 'current__id'
  | 'current__blockNumber'
  | 'current__timestamp'
  | 'current__totalfCash'
  | 'current__totalPrimeCash'
  | 'current__totalLiquidity'
  | 'current__lastImpliedRate'
  | 'current__oracleRate'
  | 'current__previousTradeTime'
  | 'current__totalPrimeCashInUnderlying'
  | 'current__totalfCashPresentValue'
  | 'current__totalfCashDebtOutstanding'
  | 'current__totalfCashDebtOutstandingPresentValue'
  | 'snapshots';

export type nTokenFeeBuffer = {
  /** Currency ID */
  id: Scalars['ID'];
  lastUpdateBlockNumber: Scalars['BigInt'];
  lastUpdateTimestamp: Scalars['Int'];
  /** Circular buffer of transfers over the last 30 days, used for nToken fee APY calculation */
  feeTransfers: Array<Transfer>;
  feeTransferAmount: Array<Scalars['BigInt']>;
  /** Current sum of the nToken fees over the last 30 days */
  last30DayNTokenFees: Scalars['BigInt'];
};

export type nTokenFeeBufferfeeTransfersArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Transfer_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<Transfer_filter>;
};

export type nTokenFeeBuffer_filter = {
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
  feeTransfers?: InputMaybe<Array<Scalars['String']>>;
  feeTransfers_not?: InputMaybe<Array<Scalars['String']>>;
  feeTransfers_contains?: InputMaybe<Array<Scalars['String']>>;
  feeTransfers_contains_nocase?: InputMaybe<Array<Scalars['String']>>;
  feeTransfers_not_contains?: InputMaybe<Array<Scalars['String']>>;
  feeTransfers_not_contains_nocase?: InputMaybe<Array<Scalars['String']>>;
  feeTransfers_?: InputMaybe<Transfer_filter>;
  feeTransferAmount?: InputMaybe<Array<Scalars['BigInt']>>;
  feeTransferAmount_not?: InputMaybe<Array<Scalars['BigInt']>>;
  feeTransferAmount_contains?: InputMaybe<Array<Scalars['BigInt']>>;
  feeTransferAmount_contains_nocase?: InputMaybe<Array<Scalars['BigInt']>>;
  feeTransferAmount_not_contains?: InputMaybe<Array<Scalars['BigInt']>>;
  feeTransferAmount_not_contains_nocase?: InputMaybe<Array<Scalars['BigInt']>>;
  last30DayNTokenFees?: InputMaybe<Scalars['BigInt']>;
  last30DayNTokenFees_not?: InputMaybe<Scalars['BigInt']>;
  last30DayNTokenFees_gt?: InputMaybe<Scalars['BigInt']>;
  last30DayNTokenFees_lt?: InputMaybe<Scalars['BigInt']>;
  last30DayNTokenFees_gte?: InputMaybe<Scalars['BigInt']>;
  last30DayNTokenFees_lte?: InputMaybe<Scalars['BigInt']>;
  last30DayNTokenFees_in?: InputMaybe<Array<Scalars['BigInt']>>;
  last30DayNTokenFees_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<nTokenFeeBuffer_filter>>>;
  or?: InputMaybe<Array<InputMaybe<nTokenFeeBuffer_filter>>>;
};

export type nTokenFeeBuffer_orderBy =
  | 'id'
  | 'lastUpdateBlockNumber'
  | 'lastUpdateTimestamp'
  | 'feeTransfers'
  | 'feeTransferAmount'
  | 'last30DayNTokenFees';

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
export type StitchingResolver<TResult, TParent, TContext, TArgs> =
  | LegacyStitchingResolver<TResult, TParent, TContext, TArgs>
  | NewStitchingResolver<TResult, TParent, TContext, TArgs>;
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

export interface SubscriptionSubscriberObject<
  TResult,
  TKey extends string,
  TParent,
  TContext,
  TArgs
> {
  subscribe: SubscriptionSubscribeFn<
    { [key in TKey]: TResult },
    TParent,
    TContext,
    TArgs
  >;
  resolve?: SubscriptionResolveFn<
    TResult,
    { [key in TKey]: TResult },
    TContext,
    TArgs
  >;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<
  TResult,
  TKey extends string,
  TParent,
  TContext,
  TArgs
> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<
  TResult,
  TKey extends string,
  TParent = {},
  TContext = {},
  TArgs = {}
> =
  | ((
      ...args: any[]
    ) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (
  obj: T,
  context: TContext,
  info: GraphQLResolveInfo
) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<
  TResult = {},
  TParent = {},
  TContext = {},
  TArgs = {}
> = (
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
  ActiveMarket: ResolverTypeWrapper<ActiveMarket>;
  ActiveMarket_filter: ActiveMarket_filter;
  ActiveMarket_orderBy: ActiveMarket_orderBy;
  Aggregation_interval: Aggregation_interval;
  Balance: ResolverTypeWrapper<Balance>;
  BalanceSnapshot: ResolverTypeWrapper<BalanceSnapshot>;
  BalanceSnapshot_filter: BalanceSnapshot_filter;
  BalanceSnapshot_orderBy: BalanceSnapshot_orderBy;
  Balance_filter: Balance_filter;
  Balance_orderBy: Balance_orderBy;
  BigDecimal: ResolverTypeWrapper<Scalars['BigDecimal']>;
  BigInt: ResolverTypeWrapper<Scalars['BigInt']>;
  BlockChangedFilter: BlockChangedFilter;
  Block_height: Block_height;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
  Bytes: ResolverTypeWrapper<Scalars['Bytes']>;
  CurrencyConfiguration: ResolverTypeWrapper<CurrencyConfiguration>;
  CurrencyConfiguration_filter: CurrencyConfiguration_filter;
  CurrencyConfiguration_orderBy: CurrencyConfiguration_orderBy;
  DEX: DEX;
  ExchangeRate: ResolverTypeWrapper<ExchangeRate>;
  ExchangeRate_filter: ExchangeRate_filter;
  ExchangeRate_orderBy: ExchangeRate_orderBy;
  ExternalLending: ResolverTypeWrapper<ExternalLending>;
  ExternalLendingSnapshot: ResolverTypeWrapper<ExternalLendingSnapshot>;
  ExternalLendingSnapshot_filter: ExternalLendingSnapshot_filter;
  ExternalLendingSnapshot_orderBy: ExternalLendingSnapshot_orderBy;
  ExternalLending_filter: ExternalLending_filter;
  ExternalLending_orderBy: ExternalLending_orderBy;
  Float: ResolverTypeWrapper<Scalars['Float']>;
  ID: ResolverTypeWrapper<Scalars['ID']>;
  Incentive: ResolverTypeWrapper<Incentive>;
  IncentiveSnapshot: ResolverTypeWrapper<IncentiveSnapshot>;
  IncentiveSnapshot_filter: IncentiveSnapshot_filter;
  IncentiveSnapshot_orderBy: IncentiveSnapshot_orderBy;
  Incentive_filter: Incentive_filter;
  Incentive_orderBy: Incentive_orderBy;
  Int: ResolverTypeWrapper<Scalars['Int']>;
  Int8: ResolverTypeWrapper<Scalars['Int8']>;
  InterestRateCurve: ResolverTypeWrapper<InterestRateCurve>;
  InterestRateCurve_filter: InterestRateCurve_filter;
  InterestRateCurve_orderBy: InterestRateCurve_orderBy;
  Oracle: ResolverTypeWrapper<Oracle>;
  OracleRegistry: ResolverTypeWrapper<OracleRegistry>;
  OracleRegistry_filter: OracleRegistry_filter;
  OracleRegistry_orderBy: OracleRegistry_orderBy;
  OracleType: OracleType;
  Oracle_filter: Oracle_filter;
  Oracle_orderBy: Oracle_orderBy;
  OrderDirection: OrderDirection;
  PrimeCashMarket: ResolverTypeWrapper<PrimeCashMarket>;
  PrimeCashMarketSnapshot: ResolverTypeWrapper<PrimeCashMarketSnapshot>;
  PrimeCashMarketSnapshot_filter: PrimeCashMarketSnapshot_filter;
  PrimeCashMarketSnapshot_orderBy: PrimeCashMarketSnapshot_orderBy;
  PrimeCashMarket_filter: PrimeCashMarket_filter;
  PrimeCashMarket_orderBy: PrimeCashMarket_orderBy;
  ProfitLossLineItem: ResolverTypeWrapper<ProfitLossLineItem>;
  ProfitLossLineItem_filter: ProfitLossLineItem_filter;
  ProfitLossLineItem_orderBy: ProfitLossLineItem_orderBy;
  Query: ResolverTypeWrapper<{}>;
  Reinvestment: ResolverTypeWrapper<Reinvestment>;
  Reinvestment_filter: Reinvestment_filter;
  Reinvestment_orderBy: Reinvestment_orderBy;
  String: ResolverTypeWrapper<Scalars['String']>;
  Subscription: ResolverTypeWrapper<{}>;
  SystemAccount: SystemAccount;
  Timestamp: ResolverTypeWrapper<Scalars['Timestamp']>;
  Token: ResolverTypeWrapper<Token>;
  TokenInterface: TokenInterface;
  TokenType: TokenType;
  Token_filter: Token_filter;
  Token_orderBy: Token_orderBy;
  TradeType: TradeType;
  TradingModulePermission: ResolverTypeWrapper<TradingModulePermission>;
  TradingModulePermission_filter: TradingModulePermission_filter;
  TradingModulePermission_orderBy: TradingModulePermission_orderBy;
  Transaction: ResolverTypeWrapper<Transaction>;
  Transaction_filter: Transaction_filter;
  Transaction_orderBy: Transaction_orderBy;
  Transfer: ResolverTypeWrapper<Transfer>;
  TransferBundle: ResolverTypeWrapper<TransferBundle>;
  TransferBundle_filter: TransferBundle_filter;
  TransferBundle_orderBy: TransferBundle_orderBy;
  TransferType: TransferType;
  Transfer_filter: Transfer_filter;
  Transfer_orderBy: Transfer_orderBy;
  UnderlyingSnapshot: ResolverTypeWrapper<UnderlyingSnapshot>;
  UnderlyingSnapshot_filter: UnderlyingSnapshot_filter;
  UnderlyingSnapshot_orderBy: UnderlyingSnapshot_orderBy;
  VaultConfiguration: ResolverTypeWrapper<VaultConfiguration>;
  VaultConfiguration_filter: VaultConfiguration_filter;
  VaultConfiguration_orderBy: VaultConfiguration_orderBy;
  WhitelistedCapability: WhitelistedCapability;
  WhitelistedContract: ResolverTypeWrapper<WhitelistedContract>;
  WhitelistedContract_filter: WhitelistedContract_filter;
  WhitelistedContract_orderBy: WhitelistedContract_orderBy;
  _Block_: ResolverTypeWrapper<_Block_>;
  _Meta_: ResolverTypeWrapper<_Meta_>;
  _SubgraphErrorPolicy_: _SubgraphErrorPolicy_;
  fCashMarket: ResolverTypeWrapper<fCashMarket>;
  fCashMarketSnapshot: ResolverTypeWrapper<fCashMarketSnapshot>;
  fCashMarketSnapshot_filter: fCashMarketSnapshot_filter;
  fCashMarketSnapshot_orderBy: fCashMarketSnapshot_orderBy;
  fCashMarket_filter: fCashMarket_filter;
  fCashMarket_orderBy: fCashMarket_orderBy;
  nTokenFeeBuffer: ResolverTypeWrapper<nTokenFeeBuffer>;
  nTokenFeeBuffer_filter: nTokenFeeBuffer_filter;
  nTokenFeeBuffer_orderBy: nTokenFeeBuffer_orderBy;
}>;

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = ResolversObject<{
  Account: Account;
  Account_filter: Account_filter;
  ActiveMarket: ActiveMarket;
  ActiveMarket_filter: ActiveMarket_filter;
  Balance: Balance;
  BalanceSnapshot: BalanceSnapshot;
  BalanceSnapshot_filter: BalanceSnapshot_filter;
  Balance_filter: Balance_filter;
  BigDecimal: Scalars['BigDecimal'];
  BigInt: Scalars['BigInt'];
  BlockChangedFilter: BlockChangedFilter;
  Block_height: Block_height;
  Boolean: Scalars['Boolean'];
  Bytes: Scalars['Bytes'];
  CurrencyConfiguration: CurrencyConfiguration;
  CurrencyConfiguration_filter: CurrencyConfiguration_filter;
  ExchangeRate: ExchangeRate;
  ExchangeRate_filter: ExchangeRate_filter;
  ExternalLending: ExternalLending;
  ExternalLendingSnapshot: ExternalLendingSnapshot;
  ExternalLendingSnapshot_filter: ExternalLendingSnapshot_filter;
  ExternalLending_filter: ExternalLending_filter;
  Float: Scalars['Float'];
  ID: Scalars['ID'];
  Incentive: Incentive;
  IncentiveSnapshot: IncentiveSnapshot;
  IncentiveSnapshot_filter: IncentiveSnapshot_filter;
  Incentive_filter: Incentive_filter;
  Int: Scalars['Int'];
  Int8: Scalars['Int8'];
  InterestRateCurve: InterestRateCurve;
  InterestRateCurve_filter: InterestRateCurve_filter;
  Oracle: Oracle;
  OracleRegistry: OracleRegistry;
  OracleRegistry_filter: OracleRegistry_filter;
  Oracle_filter: Oracle_filter;
  PrimeCashMarket: PrimeCashMarket;
  PrimeCashMarketSnapshot: PrimeCashMarketSnapshot;
  PrimeCashMarketSnapshot_filter: PrimeCashMarketSnapshot_filter;
  PrimeCashMarket_filter: PrimeCashMarket_filter;
  ProfitLossLineItem: ProfitLossLineItem;
  ProfitLossLineItem_filter: ProfitLossLineItem_filter;
  Query: {};
  Reinvestment: Reinvestment;
  Reinvestment_filter: Reinvestment_filter;
  String: Scalars['String'];
  Subscription: {};
  Timestamp: Scalars['Timestamp'];
  Token: Token;
  Token_filter: Token_filter;
  TradingModulePermission: TradingModulePermission;
  TradingModulePermission_filter: TradingModulePermission_filter;
  Transaction: Transaction;
  Transaction_filter: Transaction_filter;
  Transfer: Transfer;
  TransferBundle: TransferBundle;
  TransferBundle_filter: TransferBundle_filter;
  Transfer_filter: Transfer_filter;
  UnderlyingSnapshot: UnderlyingSnapshot;
  UnderlyingSnapshot_filter: UnderlyingSnapshot_filter;
  VaultConfiguration: VaultConfiguration;
  VaultConfiguration_filter: VaultConfiguration_filter;
  WhitelistedContract: WhitelistedContract;
  WhitelistedContract_filter: WhitelistedContract_filter;
  _Block_: _Block_;
  _Meta_: _Meta_;
  fCashMarket: fCashMarket;
  fCashMarketSnapshot: fCashMarketSnapshot;
  fCashMarketSnapshot_filter: fCashMarketSnapshot_filter;
  fCashMarket_filter: fCashMarket_filter;
  nTokenFeeBuffer: nTokenFeeBuffer;
  nTokenFeeBuffer_filter: nTokenFeeBuffer_filter;
}>;

export type entityDirectiveArgs = {};

export type entityDirectiveResolver<
  Result,
  Parent,
  ContextType = MeshContext & { apiKey: string; subgraphId: string },
  Args = entityDirectiveArgs
> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type subgraphIdDirectiveArgs = {
  id: Scalars['String'];
};

export type subgraphIdDirectiveResolver<
  Result,
  Parent,
  ContextType = MeshContext & { apiKey: string; subgraphId: string },
  Args = subgraphIdDirectiveArgs
> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type derivedFromDirectiveArgs = {
  field: Scalars['String'];
};

export type derivedFromDirectiveResolver<
  Result,
  Parent,
  ContextType = MeshContext & { apiKey: string; subgraphId: string },
  Args = derivedFromDirectiveArgs
> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type AccountResolvers<
  ContextType = MeshContext & { apiKey: string; subgraphId: string },
  ParentType extends ResolversParentTypes['Account'] = ResolversParentTypes['Account']
> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  firstUpdateBlockNumber?: Resolver<
    ResolversTypes['BigInt'],
    ParentType,
    ContextType
  >;
  firstUpdateTimestamp?: Resolver<
    ResolversTypes['Int'],
    ParentType,
    ContextType
  >;
  firstUpdateTransactionHash?: Resolver<
    ResolversTypes['Bytes'],
    ParentType,
    ContextType
  >;
  lastUpdateBlockNumber?: Resolver<
    ResolversTypes['BigInt'],
    ParentType,
    ContextType
  >;
  lastUpdateTimestamp?: Resolver<
    ResolversTypes['Int'],
    ParentType,
    ContextType
  >;
  lastUpdateTransactionHash?: Resolver<
    ResolversTypes['Bytes'],
    ParentType,
    ContextType
  >;
  systemAccountType?: Resolver<
    ResolversTypes['SystemAccount'],
    ParentType,
    ContextType
  >;
  allowPrimeBorrow?: Resolver<
    Maybe<ResolversTypes['Boolean']>,
    ParentType,
    ContextType
  >;
  nextSettleTime?: Resolver<
    Maybe<ResolversTypes['BigInt']>,
    ParentType,
    ContextType
  >;
  hasPortfolioAssetDebt?: Resolver<
    Maybe<ResolversTypes['Boolean']>,
    ParentType,
    ContextType
  >;
  hasCashDebt?: Resolver<
    Maybe<ResolversTypes['Boolean']>,
    ParentType,
    ContextType
  >;
  bitmapCurrencyId?: Resolver<
    Maybe<ResolversTypes['Int']>,
    ParentType,
    ContextType
  >;
  balances?: Resolver<
    Maybe<Array<ResolversTypes['Balance']>>,
    ParentType,
    ContextType,
    RequireFields<AccountbalancesArgs, 'skip' | 'first'>
  >;
  transfersFrom?: Resolver<
    Maybe<Array<ResolversTypes['Transfer']>>,
    ParentType,
    ContextType,
    RequireFields<AccounttransfersFromArgs, 'skip' | 'first'>
  >;
  transfersTo?: Resolver<
    Maybe<Array<ResolversTypes['Transfer']>>,
    ParentType,
    ContextType,
    RequireFields<AccounttransfersToArgs, 'skip' | 'first'>
  >;
  profitLossLineItems?: Resolver<
    Maybe<Array<ResolversTypes['ProfitLossLineItem']>>,
    ParentType,
    ContextType,
    RequireFields<AccountprofitLossLineItemsArgs, 'skip' | 'first'>
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ActiveMarketResolvers<
  ContextType = MeshContext & { apiKey: string; subgraphId: string },
  ParentType extends ResolversParentTypes['ActiveMarket'] = ResolversParentTypes['ActiveMarket']
> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  lastUpdateBlockNumber?: Resolver<
    ResolversTypes['BigInt'],
    ParentType,
    ContextType
  >;
  lastUpdateTimestamp?: Resolver<
    ResolversTypes['Int'],
    ParentType,
    ContextType
  >;
  lastUpdateTransaction?: Resolver<
    Maybe<ResolversTypes['Transaction']>,
    ParentType,
    ContextType
  >;
  underlying?: Resolver<ResolversTypes['Token'], ParentType, ContextType>;
  pCashMarket?: Resolver<
    ResolversTypes['PrimeCashMarket'],
    ParentType,
    ContextType
  >;
  fCashMarkets?: Resolver<
    Array<ResolversTypes['fCashMarket']>,
    ParentType,
    ContextType,
    RequireFields<ActiveMarketfCashMarketsArgs, 'skip' | 'first'>
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type BalanceResolvers<
  ContextType = MeshContext & { apiKey: string; subgraphId: string },
  ParentType extends ResolversParentTypes['Balance'] = ResolversParentTypes['Balance']
> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  token?: Resolver<ResolversTypes['Token'], ParentType, ContextType>;
  account?: Resolver<ResolversTypes['Account'], ParentType, ContextType>;
  firstUpdateBlockNumber?: Resolver<
    ResolversTypes['BigInt'],
    ParentType,
    ContextType
  >;
  firstUpdateTimestamp?: Resolver<
    ResolversTypes['Int'],
    ParentType,
    ContextType
  >;
  firstUpdateTransactionHash?: Resolver<
    ResolversTypes['Bytes'],
    ParentType,
    ContextType
  >;
  lastUpdateBlockNumber?: Resolver<
    ResolversTypes['BigInt'],
    ParentType,
    ContextType
  >;
  lastUpdateTimestamp?: Resolver<
    ResolversTypes['Int'],
    ParentType,
    ContextType
  >;
  lastUpdateTransactionHash?: Resolver<
    ResolversTypes['Bytes'],
    ParentType,
    ContextType
  >;
  current?: Resolver<
    ResolversTypes['BalanceSnapshot'],
    ParentType,
    ContextType
  >;
  snapshots?: Resolver<
    Maybe<Array<ResolversTypes['BalanceSnapshot']>>,
    ParentType,
    ContextType,
    RequireFields<BalancesnapshotsArgs, 'skip' | 'first'>
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type BalanceSnapshotResolvers<
  ContextType = MeshContext & { apiKey: string; subgraphId: string },
  ParentType extends ResolversParentTypes['BalanceSnapshot'] = ResolversParentTypes['BalanceSnapshot']
> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  blockNumber?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  timestamp?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  transaction?: Resolver<
    ResolversTypes['Transaction'],
    ParentType,
    ContextType
  >;
  previousSnapshot?: Resolver<
    Maybe<ResolversTypes['BalanceSnapshot']>,
    ParentType,
    ContextType
  >;
  balance?: Resolver<ResolversTypes['Balance'], ParentType, ContextType>;
  currentBalance?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  previousBalance?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  adjustedCostBasis?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  currentProfitAndLossAtSnapshot?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  totalProfitAndLossAtSnapshot?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  totalILAndFeesAtSnapshot?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  totalInterestAccrualAtSnapshot?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  impliedFixedRate?: Resolver<Maybe<ResolversTypes['BigInt']>, ParentType, ContextType>;
  _accumulatedBalance?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  _accumulatedCostRealized?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  _lastInterestAccumulator?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  profitLossLineItems?: Resolver<Maybe<Array<ResolversTypes['ProfitLossLineItem']>>, ParentType, ContextType, RequireFields<BalanceSnapshotprofitLossLineItemsArgs, 'skip' | 'first'>>;
  incentives?: Resolver<Maybe<Array<ResolversTypes['IncentiveSnapshot']>>, ParentType, ContextType, RequireFields<BalanceSnapshotincentivesArgs, 'skip' | 'first'>>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export interface BigDecimalScalarConfig
  extends GraphQLScalarTypeConfig<ResolversTypes['BigDecimal'], any> {
  name: 'BigDecimal';
}

export interface BigIntScalarConfig
  extends GraphQLScalarTypeConfig<ResolversTypes['BigInt'], any> {
  name: 'BigInt';
}

export interface BytesScalarConfig
  extends GraphQLScalarTypeConfig<ResolversTypes['Bytes'], any> {
  name: 'Bytes';
}

export type CurrencyConfigurationResolvers<
  ContextType = MeshContext & { apiKey: string; subgraphId: string },
  ParentType extends ResolversParentTypes['CurrencyConfiguration'] = ResolversParentTypes['CurrencyConfiguration']
> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  lastUpdateBlockNumber?: Resolver<
    ResolversTypes['BigInt'],
    ParentType,
    ContextType
  >;
  lastUpdateTimestamp?: Resolver<
    ResolversTypes['Int'],
    ParentType,
    ContextType
  >;
  lastUpdateTransactionHash?: Resolver<
    ResolversTypes['Bytes'],
    ParentType,
    ContextType
  >;
  underlying?: Resolver<
    Maybe<ResolversTypes['Token']>,
    ParentType,
    ContextType
  >;
  pCash?: Resolver<Maybe<ResolversTypes['Token']>, ParentType, ContextType>;
  pDebt?: Resolver<Maybe<ResolversTypes['Token']>, ParentType, ContextType>;
  maxUnderlyingSupply?: Resolver<
    Maybe<ResolversTypes['BigInt']>,
    ParentType,
    ContextType
  >;
  maxPrimeDebtUtilization?: Resolver<
    Maybe<ResolversTypes['BigInt']>,
    ParentType,
    ContextType
  >;
  collateralHaircut?: Resolver<
    Maybe<ResolversTypes['Int']>,
    ParentType,
    ContextType
  >;
  debtBuffer?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  liquidationDiscount?: Resolver<
    Maybe<ResolversTypes['Int']>,
    ParentType,
    ContextType
  >;
  primeCashRateOracleTimeWindowSeconds?: Resolver<
    Maybe<ResolversTypes['Int']>,
    ParentType,
    ContextType
  >;
  primeCashHoldingsOracle?: Resolver<
    Maybe<ResolversTypes['Bytes']>,
    ParentType,
    ContextType
  >;
  primeCashCurve?: Resolver<
    Maybe<ResolversTypes['InterestRateCurve']>,
    ParentType,
    ContextType
  >;
  primeDebtAllowed?: Resolver<
    Maybe<ResolversTypes['Boolean']>,
    ParentType,
    ContextType
  >;
  fCashRateOracleTimeWindowSeconds?: Resolver<
    Maybe<ResolversTypes['Int']>,
    ParentType,
    ContextType
  >;
  fCashReserveFeeSharePercent?: Resolver<
    Maybe<ResolversTypes['Int']>,
    ParentType,
    ContextType
  >;
  fCashDebtBufferBasisPoints?: Resolver<
    Maybe<ResolversTypes['Int']>,
    ParentType,
    ContextType
  >;
  fCashHaircutBasisPoints?: Resolver<
    Maybe<ResolversTypes['Int']>,
    ParentType,
    ContextType
  >;
  fCashMinOracleRate?: Resolver<
    Maybe<ResolversTypes['Int']>,
    ParentType,
    ContextType
  >;
  fCashMaxOracleRate?: Resolver<
    Maybe<ResolversTypes['Int']>,
    ParentType,
    ContextType
  >;
  fCashMaxDiscountFactor?: Resolver<
    Maybe<ResolversTypes['Int']>,
    ParentType,
    ContextType
  >;
  fCashLiquidationHaircutBasisPoints?: Resolver<
    Maybe<ResolversTypes['Int']>,
    ParentType,
    ContextType
  >;
  fCashLiquidationDebtBufferBasisPoints?: Resolver<
    Maybe<ResolversTypes['Int']>,
    ParentType,
    ContextType
  >;
  fCashActiveCurves?: Resolver<
    Maybe<Array<ResolversTypes['InterestRateCurve']>>,
    ParentType,
    ContextType,
    RequireFields<CurrencyConfigurationfCashActiveCurvesArgs, 'skip' | 'first'>
  >;
  fCashNextCurves?: Resolver<
    Maybe<Array<ResolversTypes['InterestRateCurve']>>,
    ParentType,
    ContextType,
    RequireFields<CurrencyConfigurationfCashNextCurvesArgs, 'skip' | 'first'>
  >;
  treasuryReserveBuffer?: Resolver<
    Maybe<ResolversTypes['BigInt']>,
    ParentType,
    ContextType
  >;
  primeCashHoldings?: Resolver<
    Maybe<Array<ResolversTypes['Bytes']>>,
    ParentType,
    ContextType
  >;
  depositShares?: Resolver<
    Maybe<Array<ResolversTypes['Int']>>,
    ParentType,
    ContextType
  >;
  leverageThresholds?: Resolver<
    Maybe<Array<ResolversTypes['Int']>>,
    ParentType,
    ContextType
  >;
  proportions?: Resolver<
    Maybe<Array<ResolversTypes['Int']>>,
    ParentType,
    ContextType
  >;
  deprecated_anchorRates?: Resolver<
    Maybe<Array<ResolversTypes['Int']>>,
    ParentType,
    ContextType
  >;
  residualPurchaseIncentiveBasisPoints?: Resolver<
    Maybe<ResolversTypes['Int']>,
    ParentType,
    ContextType
  >;
  residualPurchaseTimeBufferSeconds?: Resolver<
    Maybe<ResolversTypes['Int']>,
    ParentType,
    ContextType
  >;
  cashWithholdingBufferBasisPoints?: Resolver<
    Maybe<ResolversTypes['Int']>,
    ParentType,
    ContextType
  >;
  pvHaircutPercentage?: Resolver<
    Maybe<ResolversTypes['Int']>,
    ParentType,
    ContextType
  >;
  liquidationHaircutPercentage?: Resolver<
    Maybe<ResolversTypes['Int']>,
    ParentType,
    ContextType
  >;
  maxMintDeviationBasisPoints?: Resolver<
    Maybe<ResolversTypes['Int']>,
    ParentType,
    ContextType
  >;
  incentives?: Resolver<
    Maybe<ResolversTypes['Incentive']>,
    ParentType,
    ContextType
  >;
  externalLending?: Resolver<
    Maybe<ResolversTypes['ExternalLending']>,
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ExchangeRateResolvers<
  ContextType = MeshContext & { apiKey: string; subgraphId: string },
  ParentType extends ResolversParentTypes['ExchangeRate'] = ResolversParentTypes['ExchangeRate']
> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  blockNumber?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  timestamp?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  transaction?: Resolver<
    Maybe<ResolversTypes['Transaction']>,
    ParentType,
    ContextType
  >;
  oracle?: Resolver<ResolversTypes['Oracle'], ParentType, ContextType>;
  rate?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  totalSupply?: Resolver<
    Maybe<ResolversTypes['BigInt']>,
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ExternalLendingResolvers<
  ContextType = MeshContext & { apiKey: string; subgraphId: string },
  ParentType extends ResolversParentTypes['ExternalLending'] = ResolversParentTypes['ExternalLending']
> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  lastUpdateBlockNumber?: Resolver<
    ResolversTypes['BigInt'],
    ParentType,
    ContextType
  >;
  lastUpdateTimestamp?: Resolver<
    ResolversTypes['Int'],
    ParentType,
    ContextType
  >;
  currencyConfiguration?: Resolver<
    ResolversTypes['CurrencyConfiguration'],
    ParentType,
    ContextType
  >;
  underlying?: Resolver<ResolversTypes['Token'], ParentType, ContextType>;
  protocolRevenueAllTime?: Resolver<
    ResolversTypes['BigInt'],
    ParentType,
    ContextType
  >;
  currentExternal?: Resolver<
    Maybe<ResolversTypes['ExternalLendingSnapshot']>,
    ParentType,
    ContextType
  >;
  externalSnapshots?: Resolver<
    Maybe<Array<ResolversTypes['ExternalLendingSnapshot']>>,
    ParentType,
    ContextType,
    RequireFields<ExternalLendingexternalSnapshotsArgs, 'skip' | 'first'>
  >;
  currentUnderlying?: Resolver<
    ResolversTypes['UnderlyingSnapshot'],
    ParentType,
    ContextType
  >;
  underlyingSnapshots?: Resolver<
    Maybe<Array<ResolversTypes['UnderlyingSnapshot']>>,
    ParentType,
    ContextType,
    RequireFields<ExternalLendingunderlyingSnapshotsArgs, 'skip' | 'first'>
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ExternalLendingSnapshotResolvers<
  ContextType = MeshContext & { apiKey: string; subgraphId: string },
  ParentType extends ResolversParentTypes['ExternalLendingSnapshot'] = ResolversParentTypes['ExternalLendingSnapshot']
> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  blockNumber?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  timestamp?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  transactionHash?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  externalLending?: Resolver<
    ResolversTypes['ExternalLending'],
    ParentType,
    ContextType
  >;
  prevSnapshot?: Resolver<
    Maybe<ResolversTypes['ExternalLendingSnapshot']>,
    ParentType,
    ContextType
  >;
  externalLendingToken?: Resolver<
    ResolversTypes['Token'],
    ParentType,
    ContextType
  >;
  balanceOf?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  balanceOfUnderlying?: Resolver<
    ResolversTypes['BigInt'],
    ParentType,
    ContextType
  >;
  storedBalanceOf?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  storedBalanceOfUnderlying?: Resolver<
    ResolversTypes['BigInt'],
    ParentType,
    ContextType
  >;
  protocolRevenueSinceLastSnapshot?: Resolver<
    ResolversTypes['BigInt'],
    ParentType,
    ContextType
  >;
  protocolInterestHarvested?: Resolver<
    ResolversTypes['BigInt'],
    ParentType,
    ContextType
  >;
  cooldownTime?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  withdrawThreshold?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  targetUtilization?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  currentUtilization?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  holdingAvailableToWithdraw?: Resolver<
    ResolversTypes['BigInt'],
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type IncentiveResolvers<
  ContextType = MeshContext & { apiKey: string; subgraphId: string },
  ParentType extends ResolversParentTypes['Incentive'] = ResolversParentTypes['Incentive']
> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  lastUpdateBlockNumber?: Resolver<
    ResolversTypes['BigInt'],
    ParentType,
    ContextType
  >;
  lastUpdateTimestamp?: Resolver<
    ResolversTypes['Int'],
    ParentType,
    ContextType
  >;
  lastUpdateTransactionHash?: Resolver<
    ResolversTypes['Bytes'],
    ParentType,
    ContextType
  >;
  currencyConfiguration?: Resolver<
    ResolversTypes['CurrencyConfiguration'],
    ParentType,
    ContextType
  >;
  secondaryIncentiveRewarder?: Resolver<
    Maybe<ResolversTypes['Bytes']>,
    ParentType,
    ContextType
  >;
  incentiveEmissionRate?: Resolver<
    Maybe<ResolversTypes['BigInt']>,
    ParentType,
    ContextType
  >;
  accumulatedNOTEPerNToken?: Resolver<
    Maybe<ResolversTypes['BigInt']>,
    ParentType,
    ContextType
  >;
  lastAccumulatedTime?: Resolver<
    Maybe<ResolversTypes['BigInt']>,
    ParentType,
    ContextType
  >;
  deprecated_lastSupplyChangeTime?: Resolver<
    Maybe<ResolversTypes['BigInt']>,
    ParentType,
    ContextType
  >;
  deprecated_integralTotalSupply?: Resolver<
    Maybe<ResolversTypes['BigInt']>,
    ParentType,
    ContextType
  >;
  migrationEmissionRate?: Resolver<
    Maybe<ResolversTypes['BigInt']>,
    ParentType,
    ContextType
  >;
  finalIntegralTotalSupply?: Resolver<
    Maybe<ResolversTypes['BigInt']>,
    ParentType,
    ContextType
  >;
  migrationTime?: Resolver<
    Maybe<ResolversTypes['BigInt']>,
    ParentType,
    ContextType
  >;
  currentSecondaryReward?: Resolver<
    Maybe<ResolversTypes['Token']>,
    ParentType,
    ContextType
  >;
  accumulatedSecondaryRewardPerNToken?: Resolver<
    Maybe<ResolversTypes['BigInt']>,
    ParentType,
    ContextType
  >;
  lastSecondaryAccumulatedTime?: Resolver<
    Maybe<ResolversTypes['BigInt']>,
    ParentType,
    ContextType
  >;
  secondaryEmissionRate?: Resolver<
    Maybe<ResolversTypes['BigInt']>,
    ParentType,
    ContextType
  >;
  secondaryRewardEndTime?: Resolver<
    Maybe<ResolversTypes['BigInt']>,
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type IncentiveSnapshotResolvers<
  ContextType = MeshContext & { apiKey: string; subgraphId: string },
  ParentType extends ResolversParentTypes['IncentiveSnapshot'] = ResolversParentTypes['IncentiveSnapshot']
> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  blockNumber?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  timestamp?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  transaction?: Resolver<
    ResolversTypes['Transaction'],
    ParentType,
    ContextType
  >;
  balanceSnapshot?: Resolver<
    ResolversTypes['BalanceSnapshot'],
    ParentType,
    ContextType
  >;
  rewardToken?: Resolver<ResolversTypes['Token'], ParentType, ContextType>;
  currentIncentiveDebt?: Resolver<
    ResolversTypes['BigInt'],
    ParentType,
    ContextType
  >;
  previousIncentiveDebt?: Resolver<
    ResolversTypes['BigInt'],
    ParentType,
    ContextType
  >;
  totalClaimed?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  adjustedClaimed?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export interface Int8ScalarConfig
  extends GraphQLScalarTypeConfig<ResolversTypes['Int8'], any> {
  name: 'Int8';
}

export type InterestRateCurveResolvers<
  ContextType = MeshContext & { apiKey: string; subgraphId: string },
  ParentType extends ResolversParentTypes['InterestRateCurve'] = ResolversParentTypes['InterestRateCurve']
> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  lastUpdateBlockNumber?: Resolver<
    ResolversTypes['BigInt'],
    ParentType,
    ContextType
  >;
  lastUpdateTimestamp?: Resolver<
    ResolversTypes['Int'],
    ParentType,
    ContextType
  >;
  lastUpdateTransactionHash?: Resolver<
    ResolversTypes['Bytes'],
    ParentType,
    ContextType
  >;
  kinkUtilization1?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  kinkUtilization2?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  kinkRate1?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  kinkRate2?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  maxRate?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  minFeeRate?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  maxFeeRate?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  feeRatePercent?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type OracleResolvers<
  ContextType = MeshContext & { apiKey: string; subgraphId: string },
  ParentType extends ResolversParentTypes['Oracle'] = ResolversParentTypes['Oracle']
> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  lastUpdateBlockNumber?: Resolver<
    ResolversTypes['BigInt'],
    ParentType,
    ContextType
  >;
  lastUpdateTimestamp?: Resolver<
    ResolversTypes['Int'],
    ParentType,
    ContextType
  >;
  lastUpdateTransaction?: Resolver<
    Maybe<ResolversTypes['Transaction']>,
    ParentType,
    ContextType
  >;
  base?: Resolver<ResolversTypes['Token'], ParentType, ContextType>;
  quote?: Resolver<ResolversTypes['Token'], ParentType, ContextType>;
  decimals?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  ratePrecision?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  oracleAddress?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  oracleType?: Resolver<ResolversTypes['OracleType'], ParentType, ContextType>;
  mustInvert?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  latestRate?: Resolver<
    Maybe<ResolversTypes['BigInt']>,
    ParentType,
    ContextType
  >;
  matured?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  historicalRates?: Resolver<
    Maybe<Array<ResolversTypes['ExchangeRate']>>,
    ParentType,
    ContextType,
    RequireFields<OraclehistoricalRatesArgs, 'skip' | 'first'>
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type OracleRegistryResolvers<
  ContextType = MeshContext & { apiKey: string; subgraphId: string },
  ParentType extends ResolversParentTypes['OracleRegistry'] = ResolversParentTypes['OracleRegistry']
> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  lastRefreshBlockNumber?: Resolver<
    ResolversTypes['BigInt'],
    ParentType,
    ContextType
  >;
  lastRefreshTimestamp?: Resolver<
    ResolversTypes['Int'],
    ParentType,
    ContextType
  >;
  chainlinkOracles?: Resolver<
    Array<ResolversTypes['Oracle']>,
    ParentType,
    ContextType,
    RequireFields<OracleRegistrychainlinkOraclesArgs, 'skip' | 'first'>
  >;
  fCashEnabled?: Resolver<
    Array<ResolversTypes['Token']>,
    ParentType,
    ContextType,
    RequireFields<OracleRegistryfCashEnabledArgs, 'skip' | 'first'>
  >;
  listedVaults?: Resolver<
    Array<ResolversTypes['Bytes']>,
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type PrimeCashMarketResolvers<
  ContextType = MeshContext & { apiKey: string; subgraphId: string },
  ParentType extends ResolversParentTypes['PrimeCashMarket'] = ResolversParentTypes['PrimeCashMarket']
> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  lastUpdateBlockNumber?: Resolver<
    ResolversTypes['BigInt'],
    ParentType,
    ContextType
  >;
  lastUpdateTimestamp?: Resolver<
    ResolversTypes['Int'],
    ParentType,
    ContextType
  >;
  lastUpdateTransaction?: Resolver<
    Maybe<ResolversTypes['Transaction']>,
    ParentType,
    ContextType
  >;
  underlying?: Resolver<ResolversTypes['Token'], ParentType, ContextType>;
  primeCash?: Resolver<ResolversTypes['Token'], ParentType, ContextType>;
  primeDebt?: Resolver<Maybe<ResolversTypes['Token']>, ParentType, ContextType>;
  current?: Resolver<
    ResolversTypes['PrimeCashMarketSnapshot'],
    ParentType,
    ContextType
  >;
  snapshots?: Resolver<
    Maybe<Array<ResolversTypes['PrimeCashMarketSnapshot']>>,
    ParentType,
    ContextType,
    RequireFields<PrimeCashMarketsnapshotsArgs, 'skip' | 'first'>
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type PrimeCashMarketSnapshotResolvers<
  ContextType = MeshContext & { apiKey: string; subgraphId: string },
  ParentType extends ResolversParentTypes['PrimeCashMarketSnapshot'] = ResolversParentTypes['PrimeCashMarketSnapshot']
> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  blockNumber?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  timestamp?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  transaction?: Resolver<
    Maybe<ResolversTypes['Transaction']>,
    ParentType,
    ContextType
  >;
  market?: Resolver<ResolversTypes['PrimeCashMarket'], ParentType, ContextType>;
  totalPrimeCash?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  totalPrimeDebt?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  totalUnderlyingHeld?: Resolver<
    ResolversTypes['BigInt'],
    ParentType,
    ContextType
  >;
  totalPrimeCashInUnderlying?: Resolver<
    Maybe<ResolversTypes['BigInt']>,
    ParentType,
    ContextType
  >;
  totalPrimeDebtInUnderlying?: Resolver<
    Maybe<ResolversTypes['BigInt']>,
    ParentType,
    ContextType
  >;
  supplyScalar?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  debtScalar?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  underlyingScalar?: Resolver<
    ResolversTypes['BigInt'],
    ParentType,
    ContextType
  >;
  supplyInterestRate?: Resolver<
    Maybe<ResolversTypes['BigInt']>,
    ParentType,
    ContextType
  >;
  debtInterestRate?: Resolver<
    Maybe<ResolversTypes['BigInt']>,
    ParentType,
    ContextType
  >;
  externalLendingRate?: Resolver<
    Maybe<ResolversTypes['BigInt']>,
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ProfitLossLineItemResolvers<
  ContextType = MeshContext & { apiKey: string; subgraphId: string },
  ParentType extends ResolversParentTypes['ProfitLossLineItem'] = ResolversParentTypes['ProfitLossLineItem']
> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  blockNumber?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  timestamp?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  transactionHash?: Resolver<
    ResolversTypes['Transaction'],
    ParentType,
    ContextType
  >;
  bundle?: Resolver<ResolversTypes['TransferBundle'], ParentType, ContextType>;
  balanceSnapshot?: Resolver<
    ResolversTypes['BalanceSnapshot'],
    ParentType,
    ContextType
  >;
  account?: Resolver<ResolversTypes['Account'], ParentType, ContextType>;
  tokenAmount?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  token?: Resolver<ResolversTypes['Token'], ParentType, ContextType>;
  underlyingAmountRealized?: Resolver<
    ResolversTypes['BigInt'],
    ParentType,
    ContextType
  >;
  underlyingAmountSpot?: Resolver<
    ResolversTypes['BigInt'],
    ParentType,
    ContextType
  >;
  underlyingToken?: Resolver<ResolversTypes['Token'], ParentType, ContextType>;
  realizedPrice?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  spotPrice?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  impliedFixedRate?: Resolver<
    Maybe<ResolversTypes['BigInt']>,
    ParentType,
    ContextType
  >;
  isTransientLineItem?: Resolver<
    ResolversTypes['Boolean'],
    ParentType,
    ContextType
  >;
  incentivizedToken?: Resolver<
    Maybe<ResolversTypes['Token']>,
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type QueryResolvers<
  ContextType = MeshContext & { apiKey: string; subgraphId: string },
  ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']
> = ResolversObject<{
  token?: Resolver<
    Maybe<ResolversTypes['Token']>,
    ParentType,
    ContextType,
    RequireFields<QuerytokenArgs, 'id' | 'subgraphError'>
  >;
  tokens?: Resolver<
    Array<ResolversTypes['Token']>,
    ParentType,
    ContextType,
    RequireFields<QuerytokensArgs, 'skip' | 'first' | 'subgraphError'>
  >;
  transfer?: Resolver<
    Maybe<ResolversTypes['Transfer']>,
    ParentType,
    ContextType,
    RequireFields<QuerytransferArgs, 'id' | 'subgraphError'>
  >;
  transfers?: Resolver<
    Array<ResolversTypes['Transfer']>,
    ParentType,
    ContextType,
    RequireFields<QuerytransfersArgs, 'skip' | 'first' | 'subgraphError'>
  >;
  transferBundle?: Resolver<
    Maybe<ResolversTypes['TransferBundle']>,
    ParentType,
    ContextType,
    RequireFields<QuerytransferBundleArgs, 'id' | 'subgraphError'>
  >;
  transferBundles?: Resolver<
    Array<ResolversTypes['TransferBundle']>,
    ParentType,
    ContextType,
    RequireFields<QuerytransferBundlesArgs, 'skip' | 'first' | 'subgraphError'>
  >;
  profitLossLineItem?: Resolver<
    Maybe<ResolversTypes['ProfitLossLineItem']>,
    ParentType,
    ContextType,
    RequireFields<QueryprofitLossLineItemArgs, 'id' | 'subgraphError'>
  >;
  profitLossLineItems?: Resolver<
    Array<ResolversTypes['ProfitLossLineItem']>,
    ParentType,
    ContextType,
    RequireFields<
      QueryprofitLossLineItemsArgs,
      'skip' | 'first' | 'subgraphError'
    >
  >;
  transaction?: Resolver<
    Maybe<ResolversTypes['Transaction']>,
    ParentType,
    ContextType,
    RequireFields<QuerytransactionArgs, 'id' | 'subgraphError'>
  >;
  transactions?: Resolver<
    Array<ResolversTypes['Transaction']>,
    ParentType,
    ContextType,
    RequireFields<QuerytransactionsArgs, 'skip' | 'first' | 'subgraphError'>
  >;
  account?: Resolver<
    Maybe<ResolversTypes['Account']>,
    ParentType,
    ContextType,
    RequireFields<QueryaccountArgs, 'id' | 'subgraphError'>
  >;
  accounts?: Resolver<
    Array<ResolversTypes['Account']>,
    ParentType,
    ContextType,
    RequireFields<QueryaccountsArgs, 'skip' | 'first' | 'subgraphError'>
  >;
  nTokenFeeBuffer?: Resolver<
    Maybe<ResolversTypes['nTokenFeeBuffer']>,
    ParentType,
    ContextType,
    RequireFields<QuerynTokenFeeBufferArgs, 'id' | 'subgraphError'>
  >;
  nTokenFeeBuffers?: Resolver<
    Array<ResolversTypes['nTokenFeeBuffer']>,
    ParentType,
    ContextType,
    RequireFields<QuerynTokenFeeBuffersArgs, 'skip' | 'first' | 'subgraphError'>
  >;
  oracleRegistry?: Resolver<
    Maybe<ResolversTypes['OracleRegistry']>,
    ParentType,
    ContextType,
    RequireFields<QueryoracleRegistryArgs, 'id' | 'subgraphError'>
  >;
  oracleRegistries?: Resolver<
    Array<ResolversTypes['OracleRegistry']>,
    ParentType,
    ContextType,
    RequireFields<QueryoracleRegistriesArgs, 'skip' | 'first' | 'subgraphError'>
  >;
  oracle?: Resolver<
    Maybe<ResolversTypes['Oracle']>,
    ParentType,
    ContextType,
    RequireFields<QueryoracleArgs, 'id' | 'subgraphError'>
  >;
  oracles?: Resolver<
    Array<ResolversTypes['Oracle']>,
    ParentType,
    ContextType,
    RequireFields<QueryoraclesArgs, 'skip' | 'first' | 'subgraphError'>
  >;
  exchangeRate?: Resolver<
    Maybe<ResolversTypes['ExchangeRate']>,
    ParentType,
    ContextType,
    RequireFields<QueryexchangeRateArgs, 'id' | 'subgraphError'>
  >;
  exchangeRates?: Resolver<
    Array<ResolversTypes['ExchangeRate']>,
    ParentType,
    ContextType,
    RequireFields<QueryexchangeRatesArgs, 'skip' | 'first' | 'subgraphError'>
  >;
  currencyConfiguration?: Resolver<
    Maybe<ResolversTypes['CurrencyConfiguration']>,
    ParentType,
    ContextType,
    RequireFields<QuerycurrencyConfigurationArgs, 'id' | 'subgraphError'>
  >;
  currencyConfigurations?: Resolver<
    Array<ResolversTypes['CurrencyConfiguration']>,
    ParentType,
    ContextType,
    RequireFields<
      QuerycurrencyConfigurationsArgs,
      'skip' | 'first' | 'subgraphError'
    >
  >;
  interestRateCurve?: Resolver<
    Maybe<ResolversTypes['InterestRateCurve']>,
    ParentType,
    ContextType,
    RequireFields<QueryinterestRateCurveArgs, 'id' | 'subgraphError'>
  >;
  interestRateCurves?: Resolver<
    Array<ResolversTypes['InterestRateCurve']>,
    ParentType,
    ContextType,
    RequireFields<
      QueryinterestRateCurvesArgs,
      'skip' | 'first' | 'subgraphError'
    >
  >;
  vaultConfiguration?: Resolver<
    Maybe<ResolversTypes['VaultConfiguration']>,
    ParentType,
    ContextType,
    RequireFields<QueryvaultConfigurationArgs, 'id' | 'subgraphError'>
  >;
  vaultConfigurations?: Resolver<
    Array<ResolversTypes['VaultConfiguration']>,
    ParentType,
    ContextType,
    RequireFields<
      QueryvaultConfigurationsArgs,
      'skip' | 'first' | 'subgraphError'
    >
  >;
  whitelistedContract?: Resolver<
    Maybe<ResolversTypes['WhitelistedContract']>,
    ParentType,
    ContextType,
    RequireFields<QuerywhitelistedContractArgs, 'id' | 'subgraphError'>
  >;
  whitelistedContracts?: Resolver<
    Array<ResolversTypes['WhitelistedContract']>,
    ParentType,
    ContextType,
    RequireFields<
      QuerywhitelistedContractsArgs,
      'skip' | 'first' | 'subgraphError'
    >
  >;
  balance?: Resolver<
    Maybe<ResolversTypes['Balance']>,
    ParentType,
    ContextType,
    RequireFields<QuerybalanceArgs, 'id' | 'subgraphError'>
  >;
  balances?: Resolver<
    Array<ResolversTypes['Balance']>,
    ParentType,
    ContextType,
    RequireFields<QuerybalancesArgs, 'skip' | 'first' | 'subgraphError'>
  >;
  balanceSnapshot?: Resolver<
    Maybe<ResolversTypes['BalanceSnapshot']>,
    ParentType,
    ContextType,
    RequireFields<QuerybalanceSnapshotArgs, 'id' | 'subgraphError'>
  >;
  balanceSnapshots?: Resolver<
    Array<ResolversTypes['BalanceSnapshot']>,
    ParentType,
    ContextType,
    RequireFields<QuerybalanceSnapshotsArgs, 'skip' | 'first' | 'subgraphError'>
  >;
  incentiveSnapshot?: Resolver<
    Maybe<ResolversTypes['IncentiveSnapshot']>,
    ParentType,
    ContextType,
    RequireFields<QueryincentiveSnapshotArgs, 'id' | 'subgraphError'>
  >;
  incentiveSnapshots?: Resolver<
    Array<ResolversTypes['IncentiveSnapshot']>,
    ParentType,
    ContextType,
    RequireFields<
      QueryincentiveSnapshotsArgs,
      'skip' | 'first' | 'subgraphError'
    >
  >;
  activeMarket?: Resolver<
    Maybe<ResolversTypes['ActiveMarket']>,
    ParentType,
    ContextType,
    RequireFields<QueryactiveMarketArgs, 'id' | 'subgraphError'>
  >;
  activeMarkets?: Resolver<
    Array<ResolversTypes['ActiveMarket']>,
    ParentType,
    ContextType,
    RequireFields<QueryactiveMarketsArgs, 'skip' | 'first' | 'subgraphError'>
  >;
  primeCashMarket?: Resolver<
    Maybe<ResolversTypes['PrimeCashMarket']>,
    ParentType,
    ContextType,
    RequireFields<QueryprimeCashMarketArgs, 'id' | 'subgraphError'>
  >;
  primeCashMarkets?: Resolver<
    Array<ResolversTypes['PrimeCashMarket']>,
    ParentType,
    ContextType,
    RequireFields<QueryprimeCashMarketsArgs, 'skip' | 'first' | 'subgraphError'>
  >;
  primeCashMarketSnapshot?: Resolver<
    Maybe<ResolversTypes['PrimeCashMarketSnapshot']>,
    ParentType,
    ContextType,
    RequireFields<QueryprimeCashMarketSnapshotArgs, 'id' | 'subgraphError'>
  >;
  primeCashMarketSnapshots?: Resolver<
    Array<ResolversTypes['PrimeCashMarketSnapshot']>,
    ParentType,
    ContextType,
    RequireFields<
      QueryprimeCashMarketSnapshotsArgs,
      'skip' | 'first' | 'subgraphError'
    >
  >;
  fCashMarket?: Resolver<
    Maybe<ResolversTypes['fCashMarket']>,
    ParentType,
    ContextType,
    RequireFields<QueryfCashMarketArgs, 'id' | 'subgraphError'>
  >;
  fCashMarkets?: Resolver<
    Array<ResolversTypes['fCashMarket']>,
    ParentType,
    ContextType,
    RequireFields<QueryfCashMarketsArgs, 'skip' | 'first' | 'subgraphError'>
  >;
  fCashMarketSnapshot?: Resolver<
    Maybe<ResolversTypes['fCashMarketSnapshot']>,
    ParentType,
    ContextType,
    RequireFields<QueryfCashMarketSnapshotArgs, 'id' | 'subgraphError'>
  >;
  fCashMarketSnapshots?: Resolver<
    Array<ResolversTypes['fCashMarketSnapshot']>,
    ParentType,
    ContextType,
    RequireFields<
      QueryfCashMarketSnapshotsArgs,
      'skip' | 'first' | 'subgraphError'
    >
  >;
  incentive?: Resolver<
    Maybe<ResolversTypes['Incentive']>,
    ParentType,
    ContextType,
    RequireFields<QueryincentiveArgs, 'id' | 'subgraphError'>
  >;
  incentives?: Resolver<
    Array<ResolversTypes['Incentive']>,
    ParentType,
    ContextType,
    RequireFields<QueryincentivesArgs, 'skip' | 'first' | 'subgraphError'>
  >;
  tradingModulePermission?: Resolver<
    Maybe<ResolversTypes['TradingModulePermission']>,
    ParentType,
    ContextType,
    RequireFields<QuerytradingModulePermissionArgs, 'id' | 'subgraphError'>
  >;
  tradingModulePermissions?: Resolver<
    Array<ResolversTypes['TradingModulePermission']>,
    ParentType,
    ContextType,
    RequireFields<
      QuerytradingModulePermissionsArgs,
      'skip' | 'first' | 'subgraphError'
    >
  >;
  reinvestment?: Resolver<
    Maybe<ResolversTypes['Reinvestment']>,
    ParentType,
    ContextType,
    RequireFields<QueryreinvestmentArgs, 'id' | 'subgraphError'>
  >;
  reinvestments?: Resolver<
    Array<ResolversTypes['Reinvestment']>,
    ParentType,
    ContextType,
    RequireFields<QueryreinvestmentsArgs, 'skip' | 'first' | 'subgraphError'>
  >;
  externalLending?: Resolver<
    Maybe<ResolversTypes['ExternalLending']>,
    ParentType,
    ContextType,
    RequireFields<QueryexternalLendingArgs, 'id' | 'subgraphError'>
  >;
  externalLendings?: Resolver<
    Array<ResolversTypes['ExternalLending']>,
    ParentType,
    ContextType,
    RequireFields<QueryexternalLendingsArgs, 'skip' | 'first' | 'subgraphError'>
  >;
  underlyingSnapshot?: Resolver<
    Maybe<ResolversTypes['UnderlyingSnapshot']>,
    ParentType,
    ContextType,
    RequireFields<QueryunderlyingSnapshotArgs, 'id' | 'subgraphError'>
  >;
  underlyingSnapshots?: Resolver<
    Array<ResolversTypes['UnderlyingSnapshot']>,
    ParentType,
    ContextType,
    RequireFields<
      QueryunderlyingSnapshotsArgs,
      'skip' | 'first' | 'subgraphError'
    >
  >;
  externalLendingSnapshot?: Resolver<
    Maybe<ResolversTypes['ExternalLendingSnapshot']>,
    ParentType,
    ContextType,
    RequireFields<QueryexternalLendingSnapshotArgs, 'id' | 'subgraphError'>
  >;
  externalLendingSnapshots?: Resolver<
    Array<ResolversTypes['ExternalLendingSnapshot']>,
    ParentType,
    ContextType,
    RequireFields<
      QueryexternalLendingSnapshotsArgs,
      'skip' | 'first' | 'subgraphError'
    >
  >;
  _meta?: Resolver<
    Maybe<ResolversTypes['_Meta_']>,
    ParentType,
    ContextType,
    Partial<Query_metaArgs>
  >;
}>;

export type ReinvestmentResolvers<
  ContextType = MeshContext & { apiKey: string; subgraphId: string },
  ParentType extends ResolversParentTypes['Reinvestment'] = ResolversParentTypes['Reinvestment']
> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  blockNumber?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  timestamp?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  transactionHash?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  vault?: Resolver<
    ResolversTypes['VaultConfiguration'],
    ParentType,
    ContextType
  >;
  rewardTokenSold?: Resolver<ResolversTypes['Token'], ParentType, ContextType>;
  rewardAmountSold?: Resolver<
    ResolversTypes['BigInt'],
    ParentType,
    ContextType
  >;
  tokensReinvested?: Resolver<
    ResolversTypes['BigInt'],
    ParentType,
    ContextType
  >;
  tokensPerVaultShare?: Resolver<
    Maybe<ResolversTypes['BigInt']>,
    ParentType,
    ContextType
  >;
  underlyingAmountRealized?: Resolver<
    Maybe<ResolversTypes['BigInt']>,
    ParentType,
    ContextType
  >;
  vaultSharePrice?: Resolver<
    Maybe<ResolversTypes['BigInt']>,
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type SubscriptionResolvers<
  ContextType = MeshContext & { apiKey: string; subgraphId: string },
  ParentType extends ResolversParentTypes['Subscription'] = ResolversParentTypes['Subscription']
> = ResolversObject<{
  token?: SubscriptionResolver<
    Maybe<ResolversTypes['Token']>,
    'token',
    ParentType,
    ContextType,
    RequireFields<SubscriptiontokenArgs, 'id' | 'subgraphError'>
  >;
  tokens?: SubscriptionResolver<
    Array<ResolversTypes['Token']>,
    'tokens',
    ParentType,
    ContextType,
    RequireFields<SubscriptiontokensArgs, 'skip' | 'first' | 'subgraphError'>
  >;
  transfer?: SubscriptionResolver<
    Maybe<ResolversTypes['Transfer']>,
    'transfer',
    ParentType,
    ContextType,
    RequireFields<SubscriptiontransferArgs, 'id' | 'subgraphError'>
  >;
  transfers?: SubscriptionResolver<
    Array<ResolversTypes['Transfer']>,
    'transfers',
    ParentType,
    ContextType,
    RequireFields<SubscriptiontransfersArgs, 'skip' | 'first' | 'subgraphError'>
  >;
  transferBundle?: SubscriptionResolver<
    Maybe<ResolversTypes['TransferBundle']>,
    'transferBundle',
    ParentType,
    ContextType,
    RequireFields<SubscriptiontransferBundleArgs, 'id' | 'subgraphError'>
  >;
  transferBundles?: SubscriptionResolver<
    Array<ResolversTypes['TransferBundle']>,
    'transferBundles',
    ParentType,
    ContextType,
    RequireFields<
      SubscriptiontransferBundlesArgs,
      'skip' | 'first' | 'subgraphError'
    >
  >;
  profitLossLineItem?: SubscriptionResolver<
    Maybe<ResolversTypes['ProfitLossLineItem']>,
    'profitLossLineItem',
    ParentType,
    ContextType,
    RequireFields<SubscriptionprofitLossLineItemArgs, 'id' | 'subgraphError'>
  >;
  profitLossLineItems?: SubscriptionResolver<
    Array<ResolversTypes['ProfitLossLineItem']>,
    'profitLossLineItems',
    ParentType,
    ContextType,
    RequireFields<
      SubscriptionprofitLossLineItemsArgs,
      'skip' | 'first' | 'subgraphError'
    >
  >;
  transaction?: SubscriptionResolver<
    Maybe<ResolversTypes['Transaction']>,
    'transaction',
    ParentType,
    ContextType,
    RequireFields<SubscriptiontransactionArgs, 'id' | 'subgraphError'>
  >;
  transactions?: SubscriptionResolver<
    Array<ResolversTypes['Transaction']>,
    'transactions',
    ParentType,
    ContextType,
    RequireFields<
      SubscriptiontransactionsArgs,
      'skip' | 'first' | 'subgraphError'
    >
  >;
  account?: SubscriptionResolver<
    Maybe<ResolversTypes['Account']>,
    'account',
    ParentType,
    ContextType,
    RequireFields<SubscriptionaccountArgs, 'id' | 'subgraphError'>
  >;
  accounts?: SubscriptionResolver<
    Array<ResolversTypes['Account']>,
    'accounts',
    ParentType,
    ContextType,
    RequireFields<SubscriptionaccountsArgs, 'skip' | 'first' | 'subgraphError'>
  >;
  nTokenFeeBuffer?: SubscriptionResolver<
    Maybe<ResolversTypes['nTokenFeeBuffer']>,
    'nTokenFeeBuffer',
    ParentType,
    ContextType,
    RequireFields<SubscriptionnTokenFeeBufferArgs, 'id' | 'subgraphError'>
  >;
  nTokenFeeBuffers?: SubscriptionResolver<
    Array<ResolversTypes['nTokenFeeBuffer']>,
    'nTokenFeeBuffers',
    ParentType,
    ContextType,
    RequireFields<
      SubscriptionnTokenFeeBuffersArgs,
      'skip' | 'first' | 'subgraphError'
    >
  >;
  oracleRegistry?: SubscriptionResolver<
    Maybe<ResolversTypes['OracleRegistry']>,
    'oracleRegistry',
    ParentType,
    ContextType,
    RequireFields<SubscriptionoracleRegistryArgs, 'id' | 'subgraphError'>
  >;
  oracleRegistries?: SubscriptionResolver<
    Array<ResolversTypes['OracleRegistry']>,
    'oracleRegistries',
    ParentType,
    ContextType,
    RequireFields<
      SubscriptionoracleRegistriesArgs,
      'skip' | 'first' | 'subgraphError'
    >
  >;
  oracle?: SubscriptionResolver<
    Maybe<ResolversTypes['Oracle']>,
    'oracle',
    ParentType,
    ContextType,
    RequireFields<SubscriptionoracleArgs, 'id' | 'subgraphError'>
  >;
  oracles?: SubscriptionResolver<
    Array<ResolversTypes['Oracle']>,
    'oracles',
    ParentType,
    ContextType,
    RequireFields<SubscriptionoraclesArgs, 'skip' | 'first' | 'subgraphError'>
  >;
  exchangeRate?: SubscriptionResolver<
    Maybe<ResolversTypes['ExchangeRate']>,
    'exchangeRate',
    ParentType,
    ContextType,
    RequireFields<SubscriptionexchangeRateArgs, 'id' | 'subgraphError'>
  >;
  exchangeRates?: SubscriptionResolver<
    Array<ResolversTypes['ExchangeRate']>,
    'exchangeRates',
    ParentType,
    ContextType,
    RequireFields<
      SubscriptionexchangeRatesArgs,
      'skip' | 'first' | 'subgraphError'
    >
  >;
  currencyConfiguration?: SubscriptionResolver<
    Maybe<ResolversTypes['CurrencyConfiguration']>,
    'currencyConfiguration',
    ParentType,
    ContextType,
    RequireFields<SubscriptioncurrencyConfigurationArgs, 'id' | 'subgraphError'>
  >;
  currencyConfigurations?: SubscriptionResolver<
    Array<ResolversTypes['CurrencyConfiguration']>,
    'currencyConfigurations',
    ParentType,
    ContextType,
    RequireFields<
      SubscriptioncurrencyConfigurationsArgs,
      'skip' | 'first' | 'subgraphError'
    >
  >;
  interestRateCurve?: SubscriptionResolver<
    Maybe<ResolversTypes['InterestRateCurve']>,
    'interestRateCurve',
    ParentType,
    ContextType,
    RequireFields<SubscriptioninterestRateCurveArgs, 'id' | 'subgraphError'>
  >;
  interestRateCurves?: SubscriptionResolver<
    Array<ResolversTypes['InterestRateCurve']>,
    'interestRateCurves',
    ParentType,
    ContextType,
    RequireFields<
      SubscriptioninterestRateCurvesArgs,
      'skip' | 'first' | 'subgraphError'
    >
  >;
  vaultConfiguration?: SubscriptionResolver<
    Maybe<ResolversTypes['VaultConfiguration']>,
    'vaultConfiguration',
    ParentType,
    ContextType,
    RequireFields<SubscriptionvaultConfigurationArgs, 'id' | 'subgraphError'>
  >;
  vaultConfigurations?: SubscriptionResolver<
    Array<ResolversTypes['VaultConfiguration']>,
    'vaultConfigurations',
    ParentType,
    ContextType,
    RequireFields<
      SubscriptionvaultConfigurationsArgs,
      'skip' | 'first' | 'subgraphError'
    >
  >;
  whitelistedContract?: SubscriptionResolver<
    Maybe<ResolversTypes['WhitelistedContract']>,
    'whitelistedContract',
    ParentType,
    ContextType,
    RequireFields<SubscriptionwhitelistedContractArgs, 'id' | 'subgraphError'>
  >;
  whitelistedContracts?: SubscriptionResolver<
    Array<ResolversTypes['WhitelistedContract']>,
    'whitelistedContracts',
    ParentType,
    ContextType,
    RequireFields<
      SubscriptionwhitelistedContractsArgs,
      'skip' | 'first' | 'subgraphError'
    >
  >;
  balance?: SubscriptionResolver<
    Maybe<ResolversTypes['Balance']>,
    'balance',
    ParentType,
    ContextType,
    RequireFields<SubscriptionbalanceArgs, 'id' | 'subgraphError'>
  >;
  balances?: SubscriptionResolver<
    Array<ResolversTypes['Balance']>,
    'balances',
    ParentType,
    ContextType,
    RequireFields<SubscriptionbalancesArgs, 'skip' | 'first' | 'subgraphError'>
  >;
  balanceSnapshot?: SubscriptionResolver<
    Maybe<ResolversTypes['BalanceSnapshot']>,
    'balanceSnapshot',
    ParentType,
    ContextType,
    RequireFields<SubscriptionbalanceSnapshotArgs, 'id' | 'subgraphError'>
  >;
  balanceSnapshots?: SubscriptionResolver<
    Array<ResolversTypes['BalanceSnapshot']>,
    'balanceSnapshots',
    ParentType,
    ContextType,
    RequireFields<
      SubscriptionbalanceSnapshotsArgs,
      'skip' | 'first' | 'subgraphError'
    >
  >;
  incentiveSnapshot?: SubscriptionResolver<
    Maybe<ResolversTypes['IncentiveSnapshot']>,
    'incentiveSnapshot',
    ParentType,
    ContextType,
    RequireFields<SubscriptionincentiveSnapshotArgs, 'id' | 'subgraphError'>
  >;
  incentiveSnapshots?: SubscriptionResolver<
    Array<ResolversTypes['IncentiveSnapshot']>,
    'incentiveSnapshots',
    ParentType,
    ContextType,
    RequireFields<
      SubscriptionincentiveSnapshotsArgs,
      'skip' | 'first' | 'subgraphError'
    >
  >;
  activeMarket?: SubscriptionResolver<
    Maybe<ResolversTypes['ActiveMarket']>,
    'activeMarket',
    ParentType,
    ContextType,
    RequireFields<SubscriptionactiveMarketArgs, 'id' | 'subgraphError'>
  >;
  activeMarkets?: SubscriptionResolver<
    Array<ResolversTypes['ActiveMarket']>,
    'activeMarkets',
    ParentType,
    ContextType,
    RequireFields<
      SubscriptionactiveMarketsArgs,
      'skip' | 'first' | 'subgraphError'
    >
  >;
  primeCashMarket?: SubscriptionResolver<
    Maybe<ResolversTypes['PrimeCashMarket']>,
    'primeCashMarket',
    ParentType,
    ContextType,
    RequireFields<SubscriptionprimeCashMarketArgs, 'id' | 'subgraphError'>
  >;
  primeCashMarkets?: SubscriptionResolver<
    Array<ResolversTypes['PrimeCashMarket']>,
    'primeCashMarkets',
    ParentType,
    ContextType,
    RequireFields<
      SubscriptionprimeCashMarketsArgs,
      'skip' | 'first' | 'subgraphError'
    >
  >;
  primeCashMarketSnapshot?: SubscriptionResolver<
    Maybe<ResolversTypes['PrimeCashMarketSnapshot']>,
    'primeCashMarketSnapshot',
    ParentType,
    ContextType,
    RequireFields<
      SubscriptionprimeCashMarketSnapshotArgs,
      'id' | 'subgraphError'
    >
  >;
  primeCashMarketSnapshots?: SubscriptionResolver<
    Array<ResolversTypes['PrimeCashMarketSnapshot']>,
    'primeCashMarketSnapshots',
    ParentType,
    ContextType,
    RequireFields<
      SubscriptionprimeCashMarketSnapshotsArgs,
      'skip' | 'first' | 'subgraphError'
    >
  >;
  fCashMarket?: SubscriptionResolver<
    Maybe<ResolversTypes['fCashMarket']>,
    'fCashMarket',
    ParentType,
    ContextType,
    RequireFields<SubscriptionfCashMarketArgs, 'id' | 'subgraphError'>
  >;
  fCashMarkets?: SubscriptionResolver<
    Array<ResolversTypes['fCashMarket']>,
    'fCashMarkets',
    ParentType,
    ContextType,
    RequireFields<
      SubscriptionfCashMarketsArgs,
      'skip' | 'first' | 'subgraphError'
    >
  >;
  fCashMarketSnapshot?: SubscriptionResolver<
    Maybe<ResolversTypes['fCashMarketSnapshot']>,
    'fCashMarketSnapshot',
    ParentType,
    ContextType,
    RequireFields<SubscriptionfCashMarketSnapshotArgs, 'id' | 'subgraphError'>
  >;
  fCashMarketSnapshots?: SubscriptionResolver<
    Array<ResolversTypes['fCashMarketSnapshot']>,
    'fCashMarketSnapshots',
    ParentType,
    ContextType,
    RequireFields<
      SubscriptionfCashMarketSnapshotsArgs,
      'skip' | 'first' | 'subgraphError'
    >
  >;
  incentive?: SubscriptionResolver<
    Maybe<ResolversTypes['Incentive']>,
    'incentive',
    ParentType,
    ContextType,
    RequireFields<SubscriptionincentiveArgs, 'id' | 'subgraphError'>
  >;
  incentives?: SubscriptionResolver<
    Array<ResolversTypes['Incentive']>,
    'incentives',
    ParentType,
    ContextType,
    RequireFields<
      SubscriptionincentivesArgs,
      'skip' | 'first' | 'subgraphError'
    >
  >;
  tradingModulePermission?: SubscriptionResolver<
    Maybe<ResolversTypes['TradingModulePermission']>,
    'tradingModulePermission',
    ParentType,
    ContextType,
    RequireFields<
      SubscriptiontradingModulePermissionArgs,
      'id' | 'subgraphError'
    >
  >;
  tradingModulePermissions?: SubscriptionResolver<
    Array<ResolversTypes['TradingModulePermission']>,
    'tradingModulePermissions',
    ParentType,
    ContextType,
    RequireFields<
      SubscriptiontradingModulePermissionsArgs,
      'skip' | 'first' | 'subgraphError'
    >
  >;
  reinvestment?: SubscriptionResolver<
    Maybe<ResolversTypes['Reinvestment']>,
    'reinvestment',
    ParentType,
    ContextType,
    RequireFields<SubscriptionreinvestmentArgs, 'id' | 'subgraphError'>
  >;
  reinvestments?: SubscriptionResolver<
    Array<ResolversTypes['Reinvestment']>,
    'reinvestments',
    ParentType,
    ContextType,
    RequireFields<
      SubscriptionreinvestmentsArgs,
      'skip' | 'first' | 'subgraphError'
    >
  >;
  externalLending?: SubscriptionResolver<
    Maybe<ResolversTypes['ExternalLending']>,
    'externalLending',
    ParentType,
    ContextType,
    RequireFields<SubscriptionexternalLendingArgs, 'id' | 'subgraphError'>
  >;
  externalLendings?: SubscriptionResolver<
    Array<ResolversTypes['ExternalLending']>,
    'externalLendings',
    ParentType,
    ContextType,
    RequireFields<
      SubscriptionexternalLendingsArgs,
      'skip' | 'first' | 'subgraphError'
    >
  >;
  underlyingSnapshot?: SubscriptionResolver<
    Maybe<ResolversTypes['UnderlyingSnapshot']>,
    'underlyingSnapshot',
    ParentType,
    ContextType,
    RequireFields<SubscriptionunderlyingSnapshotArgs, 'id' | 'subgraphError'>
  >;
  underlyingSnapshots?: SubscriptionResolver<
    Array<ResolversTypes['UnderlyingSnapshot']>,
    'underlyingSnapshots',
    ParentType,
    ContextType,
    RequireFields<
      SubscriptionunderlyingSnapshotsArgs,
      'skip' | 'first' | 'subgraphError'
    >
  >;
  externalLendingSnapshot?: SubscriptionResolver<
    Maybe<ResolversTypes['ExternalLendingSnapshot']>,
    'externalLendingSnapshot',
    ParentType,
    ContextType,
    RequireFields<
      SubscriptionexternalLendingSnapshotArgs,
      'id' | 'subgraphError'
    >
  >;
  externalLendingSnapshots?: SubscriptionResolver<
    Array<ResolversTypes['ExternalLendingSnapshot']>,
    'externalLendingSnapshots',
    ParentType,
    ContextType,
    RequireFields<
      SubscriptionexternalLendingSnapshotsArgs,
      'skip' | 'first' | 'subgraphError'
    >
  >;
  _meta?: SubscriptionResolver<
    Maybe<ResolversTypes['_Meta_']>,
    '_meta',
    ParentType,
    ContextType,
    Partial<Subscription_metaArgs>
  >;
}>;

export interface TimestampScalarConfig
  extends GraphQLScalarTypeConfig<ResolversTypes['Timestamp'], any> {
  name: 'Timestamp';
}

export type TokenResolvers<
  ContextType = MeshContext & { apiKey: string; subgraphId: string },
  ParentType extends ResolversParentTypes['Token'] = ResolversParentTypes['Token']
> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  firstUpdateBlockNumber?: Resolver<
    ResolversTypes['BigInt'],
    ParentType,
    ContextType
  >;
  firstUpdateTimestamp?: Resolver<
    ResolversTypes['Int'],
    ParentType,
    ContextType
  >;
  firstUpdateTransactionHash?: Resolver<
    Maybe<ResolversTypes['Bytes']>,
    ParentType,
    ContextType
  >;
  lastUpdateBlockNumber?: Resolver<
    ResolversTypes['BigInt'],
    ParentType,
    ContextType
  >;
  lastUpdateTimestamp?: Resolver<
    ResolversTypes['Int'],
    ParentType,
    ContextType
  >;
  lastUpdateTransactionHash?: Resolver<
    Maybe<ResolversTypes['Bytes']>,
    ParentType,
    ContextType
  >;
  tokenType?: Resolver<ResolversTypes['TokenType'], ParentType, ContextType>;
  tokenInterface?: Resolver<
    ResolversTypes['TokenInterface'],
    ParentType,
    ContextType
  >;
  underlying?: Resolver<
    Maybe<ResolversTypes['Token']>,
    ParentType,
    ContextType
  >;
  currencyId?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  symbol?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  decimals?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  precision?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  totalSupply?: Resolver<
    Maybe<ResolversTypes['BigInt']>,
    ParentType,
    ContextType
  >;
  hasTransferFee?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  isfCashDebt?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  maturity?: Resolver<Maybe<ResolversTypes['BigInt']>, ParentType, ContextType>;
  vaultAddress?: Resolver<
    Maybe<ResolversTypes['Bytes']>,
    ParentType,
    ContextType
  >;
  tokenAddress?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  balanceOf?: Resolver<
    Maybe<Array<ResolversTypes['Balance']>>,
    ParentType,
    ContextType,
    RequireFields<TokenbalanceOfArgs, 'skip' | 'first'>
  >;
  transfers?: Resolver<
    Maybe<Array<ResolversTypes['Transfer']>>,
    ParentType,
    ContextType,
    RequireFields<TokentransfersArgs, 'skip' | 'first'>
  >;
  oracles?: Resolver<
    Maybe<Array<ResolversTypes['Oracle']>>,
    ParentType,
    ContextType,
    RequireFields<TokenoraclesArgs, 'skip' | 'first'>
  >;
  activeMarkets?: Resolver<
    Maybe<ResolversTypes['ActiveMarket']>,
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TradingModulePermissionResolvers<
  ContextType = MeshContext & { apiKey: string; subgraphId: string },
  ParentType extends ResolversParentTypes['TradingModulePermission'] = ResolversParentTypes['TradingModulePermission']
> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  lastUpdateBlockNumber?: Resolver<
    ResolversTypes['BigInt'],
    ParentType,
    ContextType
  >;
  lastUpdateTimestamp?: Resolver<
    ResolversTypes['Int'],
    ParentType,
    ContextType
  >;
  lastUpdateTransactionHash?: Resolver<
    ResolversTypes['Bytes'],
    ParentType,
    ContextType
  >;
  sender?: Resolver<ResolversTypes['Account'], ParentType, ContextType>;
  token?: Resolver<Maybe<ResolversTypes['Token']>, ParentType, ContextType>;
  tokenAddress?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  symbol?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  allowedDexes?: Resolver<
    Array<ResolversTypes['DEX']>,
    ParentType,
    ContextType
  >;
  allowSell?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  allowedTradeTypes?: Resolver<
    Array<ResolversTypes['TradeType']>,
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TransactionResolvers<
  ContextType = MeshContext & { apiKey: string; subgraphId: string },
  ParentType extends ResolversParentTypes['Transaction'] = ResolversParentTypes['Transaction']
> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  blockNumber?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  timestamp?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  transactionHash?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  _transfers?: Resolver<
    Array<ResolversTypes['Transfer']>,
    ParentType,
    ContextType,
    RequireFields<Transaction_transfersArgs, 'skip' | 'first'>
  >;
  _transferBundles?: Resolver<
    Array<ResolversTypes['TransferBundle']>,
    ParentType,
    ContextType,
    RequireFields<Transaction_transferBundlesArgs, 'skip' | 'first'>
  >;
  _nextStartIndex?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  transfers?: Resolver<
    Maybe<Array<ResolversTypes['Transfer']>>,
    ParentType,
    ContextType,
    RequireFields<TransactiontransfersArgs, 'skip' | 'first'>
  >;
  transferBundles?: Resolver<
    Maybe<Array<ResolversTypes['TransferBundle']>>,
    ParentType,
    ContextType,
    RequireFields<TransactiontransferBundlesArgs, 'skip' | 'first'>
  >;
  profitLossLineItems?: Resolver<
    Maybe<Array<ResolversTypes['ProfitLossLineItem']>>,
    ParentType,
    ContextType,
    RequireFields<TransactionprofitLossLineItemsArgs, 'skip' | 'first'>
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TransferResolvers<
  ContextType = MeshContext & { apiKey: string; subgraphId: string },
  ParentType extends ResolversParentTypes['Transfer'] = ResolversParentTypes['Transfer']
> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  blockNumber?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  timestamp?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  transactionHash?: Resolver<
    ResolversTypes['Transaction'],
    ParentType,
    ContextType
  >;
  logIndex?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  from?: Resolver<ResolversTypes['Account'], ParentType, ContextType>;
  to?: Resolver<ResolversTypes['Account'], ParentType, ContextType>;
  operator?: Resolver<
    Maybe<ResolversTypes['Account']>,
    ParentType,
    ContextType
  >;
  transferType?: Resolver<
    ResolversTypes['TransferType'],
    ParentType,
    ContextType
  >;
  fromSystemAccount?: Resolver<
    ResolversTypes['SystemAccount'],
    ParentType,
    ContextType
  >;
  toSystemAccount?: Resolver<
    ResolversTypes['SystemAccount'],
    ParentType,
    ContextType
  >;
  value?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  valueInUnderlying?: Resolver<
    Maybe<ResolversTypes['BigInt']>,
    ParentType,
    ContextType
  >;
  token?: Resolver<ResolversTypes['Token'], ParentType, ContextType>;
  tokenType?: Resolver<ResolversTypes['TokenType'], ParentType, ContextType>;
  underlying?: Resolver<ResolversTypes['Token'], ParentType, ContextType>;
  maturity?: Resolver<Maybe<ResolversTypes['BigInt']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TransferBundleResolvers<
  ContextType = MeshContext & { apiKey: string; subgraphId: string },
  ParentType extends ResolversParentTypes['TransferBundle'] = ResolversParentTypes['TransferBundle']
> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  blockNumber?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  timestamp?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  transactionHash?: Resolver<
    ResolversTypes['Transaction'],
    ParentType,
    ContextType
  >;
  bundleName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  startLogIndex?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  endLogIndex?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  transfers?: Resolver<
    Array<ResolversTypes['Transfer']>,
    ParentType,
    ContextType,
    RequireFields<TransferBundletransfersArgs, 'skip' | 'first'>
  >;
  profitLossLineItems?: Resolver<
    Maybe<Array<ResolversTypes['ProfitLossLineItem']>>,
    ParentType,
    ContextType,
    RequireFields<TransferBundleprofitLossLineItemsArgs, 'skip' | 'first'>
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type UnderlyingSnapshotResolvers<
  ContextType = MeshContext & { apiKey: string; subgraphId: string },
  ParentType extends ResolversParentTypes['UnderlyingSnapshot'] = ResolversParentTypes['UnderlyingSnapshot']
> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  blockNumber?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  timestamp?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  transaction?: Resolver<
    Maybe<ResolversTypes['Transaction']>,
    ParentType,
    ContextType
  >;
  externalLending?: Resolver<
    ResolversTypes['ExternalLending'],
    ParentType,
    ContextType
  >;
  prevSnapshot?: Resolver<
    Maybe<ResolversTypes['UnderlyingSnapshot']>,
    ParentType,
    ContextType
  >;
  balanceOf?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  storedBalanceOf?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type VaultConfigurationResolvers<
  ContextType = MeshContext & { apiKey: string; subgraphId: string },
  ParentType extends ResolversParentTypes['VaultConfiguration'] = ResolversParentTypes['VaultConfiguration']
> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  lastUpdateBlockHash?: Resolver<
    ResolversTypes['Bytes'],
    ParentType,
    ContextType
  >;
  lastUpdateBlockNumber?: Resolver<
    ResolversTypes['BigInt'],
    ParentType,
    ContextType
  >;
  lastUpdateTimestamp?: Resolver<
    ResolversTypes['Int'],
    ParentType,
    ContextType
  >;
  lastUpdateTransactionHash?: Resolver<
    ResolversTypes['Bytes'],
    ParentType,
    ContextType
  >;
  vaultAddress?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  strategy?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  primaryBorrowCurrency?: Resolver<
    ResolversTypes['Token'],
    ParentType,
    ContextType
  >;
  minAccountBorrowSize?: Resolver<
    ResolversTypes['BigInt'],
    ParentType,
    ContextType
  >;
  minCollateralRatioBasisPoints?: Resolver<
    ResolversTypes['Int'],
    ParentType,
    ContextType
  >;
  maxDeleverageCollateralRatioBasisPoints?: Resolver<
    ResolversTypes['Int'],
    ParentType,
    ContextType
  >;
  feeRateBasisPoints?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  reserveFeeSharePercent?: Resolver<
    ResolversTypes['Int'],
    ParentType,
    ContextType
  >;
  liquidationRatePercent?: Resolver<
    ResolversTypes['Int'],
    ParentType,
    ContextType
  >;
  maxBorrowMarketIndex?: Resolver<
    ResolversTypes['Int'],
    ParentType,
    ContextType
  >;
  secondaryBorrowCurrencies?: Resolver<
    Maybe<Array<ResolversTypes['Token']>>,
    ParentType,
    ContextType,
    RequireFields<
      VaultConfigurationsecondaryBorrowCurrenciesArgs,
      'skip' | 'first'
    >
  >;
  maxRequiredAccountCollateralRatioBasisPoints?: Resolver<
    Maybe<ResolversTypes['Int']>,
    ParentType,
    ContextType
  >;
  enabled?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  allowRollPosition?: Resolver<
    ResolversTypes['Boolean'],
    ParentType,
    ContextType
  >;
  onlyVaultEntry?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  onlyVaultExit?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  onlyVaultRoll?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  onlyVaultDeleverage?: Resolver<
    ResolversTypes['Boolean'],
    ParentType,
    ContextType
  >;
  onlyVaultSettle?: Resolver<
    ResolversTypes['Boolean'],
    ParentType,
    ContextType
  >;
  discountfCash?: Resolver<
    Maybe<ResolversTypes['Boolean']>,
    ParentType,
    ContextType
  >;
  allowsReentrancy?: Resolver<
    ResolversTypes['Boolean'],
    ParentType,
    ContextType
  >;
  deleverageDisabled?: Resolver<
    Maybe<ResolversTypes['Boolean']>,
    ParentType,
    ContextType
  >;
  maxPrimaryBorrowCapacity?: Resolver<
    ResolversTypes['BigInt'],
    ParentType,
    ContextType
  >;
  totalUsedPrimaryBorrowCapacity?: Resolver<
    ResolversTypes['BigInt'],
    ParentType,
    ContextType
  >;
  maxSecondaryBorrowCapacity?: Resolver<
    Maybe<Array<ResolversTypes['BigInt']>>,
    ParentType,
    ContextType
  >;
  totalUsedSecondaryBorrowCapacity?: Resolver<
    Maybe<Array<ResolversTypes['BigInt']>>,
    ParentType,
    ContextType
  >;
  minAccountSecondaryBorrow?: Resolver<
    Maybe<Array<ResolversTypes['BigInt']>>,
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type WhitelistedContractResolvers<
  ContextType = MeshContext & { apiKey: string; subgraphId: string },
  ParentType extends ResolversParentTypes['WhitelistedContract'] = ResolversParentTypes['WhitelistedContract']
> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  lastUpdateBlockNumber?: Resolver<
    ResolversTypes['BigInt'],
    ParentType,
    ContextType
  >;
  lastUpdateTimestamp?: Resolver<
    ResolversTypes['Int'],
    ParentType,
    ContextType
  >;
  lastUpdateTransactionHash?: Resolver<
    ResolversTypes['Bytes'],
    ParentType,
    ContextType
  >;
  capability?: Resolver<
    Array<ResolversTypes['WhitelistedCapability']>,
    ParentType,
    ContextType
  >;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  currency?: Resolver<
    Maybe<ResolversTypes['CurrencyConfiguration']>,
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type _Block_Resolvers<
  ContextType = MeshContext & { apiKey: string; subgraphId: string },
  ParentType extends ResolversParentTypes['_Block_'] = ResolversParentTypes['_Block_']
> = ResolversObject<{
  hash?: Resolver<Maybe<ResolversTypes['Bytes']>, ParentType, ContextType>;
  number?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  timestamp?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  parentHash?: Resolver<
    Maybe<ResolversTypes['Bytes']>,
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type _Meta_Resolvers<
  ContextType = MeshContext & { apiKey: string; subgraphId: string },
  ParentType extends ResolversParentTypes['_Meta_'] = ResolversParentTypes['_Meta_']
> = ResolversObject<{
  block?: Resolver<ResolversTypes['_Block_'], ParentType, ContextType>;
  deployment?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  hasIndexingErrors?: Resolver<
    ResolversTypes['Boolean'],
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type fCashMarketResolvers<
  ContextType = MeshContext & { apiKey: string; subgraphId: string },
  ParentType extends ResolversParentTypes['fCashMarket'] = ResolversParentTypes['fCashMarket']
> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  lastUpdateBlockNumber?: Resolver<
    ResolversTypes['BigInt'],
    ParentType,
    ContextType
  >;
  lastUpdateTimestamp?: Resolver<
    ResolversTypes['Int'],
    ParentType,
    ContextType
  >;
  lastUpdateTransaction?: Resolver<
    Maybe<ResolversTypes['Transaction']>,
    ParentType,
    ContextType
  >;
  underlying?: Resolver<ResolversTypes['Token'], ParentType, ContextType>;
  fCash?: Resolver<ResolversTypes['Token'], ParentType, ContextType>;
  maturity?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  settlementDate?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  marketIndex?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  marketMaturityLengthSeconds?: Resolver<
    ResolversTypes['Int'],
    ParentType,
    ContextType
  >;
  current?: Resolver<
    ResolversTypes['fCashMarketSnapshot'],
    ParentType,
    ContextType
  >;
  snapshots?: Resolver<
    Maybe<Array<ResolversTypes['fCashMarketSnapshot']>>,
    ParentType,
    ContextType,
    RequireFields<fCashMarketsnapshotsArgs, 'skip' | 'first'>
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type fCashMarketSnapshotResolvers<
  ContextType = MeshContext & { apiKey: string; subgraphId: string },
  ParentType extends ResolversParentTypes['fCashMarketSnapshot'] = ResolversParentTypes['fCashMarketSnapshot']
> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  blockNumber?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  timestamp?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  transaction?: Resolver<
    Maybe<ResolversTypes['Transaction']>,
    ParentType,
    ContextType
  >;
  market?: Resolver<ResolversTypes['fCashMarket'], ParentType, ContextType>;
  totalfCash?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  totalPrimeCash?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  totalLiquidity?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  lastImpliedRate?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  oracleRate?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  previousTradeTime?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  totalPrimeCashInUnderlying?: Resolver<
    Maybe<ResolversTypes['BigInt']>,
    ParentType,
    ContextType
  >;
  totalfCashPresentValue?: Resolver<
    Maybe<ResolversTypes['BigInt']>,
    ParentType,
    ContextType
  >;
  totalfCashDebtOutstanding?: Resolver<
    ResolversTypes['BigInt'],
    ParentType,
    ContextType
  >;
  totalfCashDebtOutstandingPresentValue?: Resolver<
    Maybe<ResolversTypes['BigInt']>,
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type nTokenFeeBufferResolvers<
  ContextType = MeshContext & { apiKey: string; subgraphId: string },
  ParentType extends ResolversParentTypes['nTokenFeeBuffer'] = ResolversParentTypes['nTokenFeeBuffer']
> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  lastUpdateBlockNumber?: Resolver<
    ResolversTypes['BigInt'],
    ParentType,
    ContextType
  >;
  lastUpdateTimestamp?: Resolver<
    ResolversTypes['Int'],
    ParentType,
    ContextType
  >;
  feeTransfers?: Resolver<
    Array<ResolversTypes['Transfer']>,
    ParentType,
    ContextType,
    RequireFields<nTokenFeeBufferfeeTransfersArgs, 'skip' | 'first'>
  >;
  feeTransferAmount?: Resolver<
    Array<ResolversTypes['BigInt']>,
    ParentType,
    ContextType
  >;
  last30DayNTokenFees?: Resolver<
    ResolversTypes['BigInt'],
    ParentType,
    ContextType
  >;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type Resolvers<
  ContextType = MeshContext & { apiKey: string; subgraphId: string }
> = ResolversObject<{
  Account?: AccountResolvers<ContextType>;
  ActiveMarket?: ActiveMarketResolvers<ContextType>;
  Balance?: BalanceResolvers<ContextType>;
  BalanceSnapshot?: BalanceSnapshotResolvers<ContextType>;
  BigDecimal?: GraphQLScalarType;
  BigInt?: GraphQLScalarType;
  Bytes?: GraphQLScalarType;
  CurrencyConfiguration?: CurrencyConfigurationResolvers<ContextType>;
  ExchangeRate?: ExchangeRateResolvers<ContextType>;
  ExternalLending?: ExternalLendingResolvers<ContextType>;
  ExternalLendingSnapshot?: ExternalLendingSnapshotResolvers<ContextType>;
  Incentive?: IncentiveResolvers<ContextType>;
  IncentiveSnapshot?: IncentiveSnapshotResolvers<ContextType>;
  Int8?: GraphQLScalarType;
  InterestRateCurve?: InterestRateCurveResolvers<ContextType>;
  Oracle?: OracleResolvers<ContextType>;
  OracleRegistry?: OracleRegistryResolvers<ContextType>;
  PrimeCashMarket?: PrimeCashMarketResolvers<ContextType>;
  PrimeCashMarketSnapshot?: PrimeCashMarketSnapshotResolvers<ContextType>;
  ProfitLossLineItem?: ProfitLossLineItemResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  Reinvestment?: ReinvestmentResolvers<ContextType>;
  Subscription?: SubscriptionResolvers<ContextType>;
  Timestamp?: GraphQLScalarType;
  Token?: TokenResolvers<ContextType>;
  TradingModulePermission?: TradingModulePermissionResolvers<ContextType>;
  Transaction?: TransactionResolvers<ContextType>;
  Transfer?: TransferResolvers<ContextType>;
  TransferBundle?: TransferBundleResolvers<ContextType>;
  UnderlyingSnapshot?: UnderlyingSnapshotResolvers<ContextType>;
  VaultConfiguration?: VaultConfigurationResolvers<ContextType>;
  WhitelistedContract?: WhitelistedContractResolvers<ContextType>;
  _Block_?: _Block_Resolvers<ContextType>;
  _Meta_?: _Meta_Resolvers<ContextType>;
  fCashMarket?: fCashMarketResolvers<ContextType>;
  fCashMarketSnapshot?: fCashMarketSnapshotResolvers<ContextType>;
  nTokenFeeBuffer?: nTokenFeeBufferResolvers<ContextType>;
}>;

export type DirectiveResolvers<
  ContextType = MeshContext & { apiKey: string; subgraphId: string }
> = ResolversObject<{
  entity?: entityDirectiveResolver<any, any, ContextType>;
  subgraphId?: subgraphIdDirectiveResolver<any, any, ContextType>;
  derivedFrom?: derivedFromDirectiveResolver<any, any, ContextType>;
}>;

export type MeshContext = NotionalV3Types.Context & BaseMeshContext;

const baseDir = pathModule.join(
  typeof __dirname === 'string' ? __dirname : '/',
  '..'
);

const importFn: ImportFn = <T>(moduleId: string) => {
  const relativeModuleId = (
    pathModule.isAbsolute(moduleId)
      ? pathModule.relative(baseDir, moduleId)
      : moduleId
  )
    .split('\\')
    .join('/')
    .replace(baseDir + '/', '');
  switch (relativeModuleId) {
    case '.graphclient/sources/NotionalV3/introspectionSchema':
      return Promise.resolve(importedModule$0) as T;

    default:
      return Promise.reject(
        new Error(`Cannot find module '${relativeModuleId}'.`)
      );
  }
};

const rootStore = new MeshStore(
  '.graphclient',
  new FsStoreStorageAdapter({
    cwd: baseDir,
    importFn,
    fileType: 'ts',
  }),
  {
    readonly: true,
    validate: false,
  }
);

export const rawServeConfig: YamlConfig.Config['serve'] = undefined as any;
export async function getMeshOptions(): Promise<GetMeshOptions> {
  const pubsub = new PubSub();
  const sourcesStore = rootStore.child('sources');
  const logger = new DefaultLogger('GraphClient');
  const cache = new (MeshCache as any)({
    ...({} as any),
    importFn,
    store: rootStore.child('cache'),
    pubsub,
    logger,
  } as any);

const sources: MeshResolvedSource[] = [];
const transforms: MeshTransform[] = [];
const additionalEnvelopPlugins: MeshPlugin<any>[] = [];
const notionalV3Transforms = [];
const additionalTypeDefs = [] as any[];
const notionalV3Handler = new GraphqlHandler({
              name: "NotionalV3",
              config: {"endpoint":"https://api.studio.thegraph.com/query/36749/notional-finance-v3-{context.chainName:arbitrum}/version/latest"},
              baseDir,
              cache,
              pubsub,
              store: sourcesStore.child("NotionalV3"),
              logger: logger.child("NotionalV3"),
              importFn,
            });
sources[0] = {
          name: 'NotionalV3',
          handler: notionalV3Handler,
          transforms: notionalV3Transforms
        }
const additionalResolvers = [] as any[]
const merger = new(BareMerger as any)({
        cache,
        pubsub,
        logger: logger.child('bareMerger'),
        store: rootStore.child('bareMerger')
      })

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
        },
        location: 'AccountBalanceStatementDocument.graphql'
      },{
        document: AccountHoldingsHistoricalDocument,
        get rawSDL() {
          return printWithCache(AccountHoldingsHistoricalDocument);
        },
        location: 'AccountHoldingsHistoricalDocument.graphql'
      },{
        document: AccountTransactionHistoryDocument,
        get rawSDL() {
          return printWithCache(AccountTransactionHistoryDocument);
        },
        {
          document: ActiveAccountsDocument,
          get rawSDL() {
            return printWithCache(ActiveAccountsDocument);
          },
          location: 'ActiveAccountsDocument.graphql',
        },
        {
          document: AllAccountsDocument,
          get rawSDL() {
            return printWithCache(AllAccountsDocument);
          },
          location: 'AllAccountsDocument.graphql',
        },
        {
          document: AllConfigurationDocument,
          get rawSDL() {
            return printWithCache(AllConfigurationDocument);
          },
          location: 'AllConfigurationDocument.graphql',
        },
        {
          document: AllConfigurationByBlockDocument,
          get rawSDL() {
            return printWithCache(AllConfigurationByBlockDocument);
          },
          location: 'AllConfigurationByBlockDocument.graphql',
        },
        {
          document: AllOraclesDocument,
          get rawSDL() {
            return printWithCache(AllOraclesDocument);
          },
          location: 'AllOraclesDocument.graphql',
        },
        {
          document: AllOraclesByBlockDocument,
          get rawSDL() {
            return printWithCache(AllOraclesByBlockDocument);
          },
          location: 'AllOraclesByBlockDocument.graphql',
        },
        {
          document: AllTokensDocument,
          get rawSDL() {
            return printWithCache(AllTokensDocument);
          },
          location: 'AllTokensDocument.graphql',
        },
        {
          document: AllTokensByBlockDocument,
          get rawSDL() {
            return printWithCache(AllTokensByBlockDocument);
          },
          location: 'AllTokensByBlockDocument.graphql',
        },
        {
          document: AllVaultAccountsDocument,
          get rawSDL() {
            return printWithCache(AllVaultAccountsDocument);
          },
          location: 'AllVaultAccountsDocument.graphql',
        },
        {
          document: AllVaultsDocument,
          get rawSDL() {
            return printWithCache(AllVaultsDocument);
          },
          location: 'AllVaultsDocument.graphql',
        },
        {
          document: AllVaultsByBlockDocument,
          get rawSDL() {
            return printWithCache(AllVaultsByBlockDocument);
          },
          location: 'AllVaultsByBlockDocument.graphql',
        },
        {
          document: ExchangeRateValuesDocument,
          get rawSDL() {
            return printWithCache(ExchangeRateValuesDocument);
          },
          location: 'ExchangeRateValuesDocument.graphql',
        },
        {
          document: ExternalLendingHistoryDocument,
          get rawSDL() {
            return printWithCache(ExternalLendingHistoryDocument);
          },
          location: 'ExternalLendingHistoryDocument.graphql',
        },
        {
          document: HistoricalOracleValuesDocument,
          get rawSDL() {
            return printWithCache(HistoricalOracleValuesDocument);
          },
          location: 'HistoricalOracleValuesDocument.graphql',
        },
        {
          document: HistoricalTradingActivityDocument,
          get rawSDL() {
            return printWithCache(HistoricalTradingActivityDocument);
          },
          location: 'HistoricalTradingActivityDocument.graphql',
        },
        {
          document: MetaDocument,
          get rawSDL() {
            return printWithCache(MetaDocument);
          },
          location: 'MetaDocument.graphql',
        },
        {
          document: NetworkTransactionHistoryDocument,
          get rawSDL() {
            return printWithCache(NetworkTransactionHistoryDocument);
          },
          location: 'NetworkTransactionHistoryDocument.graphql',
        },
        {
          document: VaultReinvestmentDocument,
          get rawSDL() {
            return printWithCache(VaultReinvestmentDocument);
          },
          location: 'VaultReinvestmentDocument.graphql',
        },
      ];
    },
    fetchFn,
  };
}

export function createBuiltMeshHTTPHandler<
  TServerContext = {}
>(): MeshHTTPHandler<TServerContext> {
  return createMeshHTTPHandler<TServerContext>({
    baseDir,
    getBuiltMesh: getBuiltGraphClient,
    rawServeConfig: undefined,
  });
}

let meshInstance$: Promise<MeshInstance> | undefined;

export function getBuiltGraphClient(): Promise<MeshInstance> {
  if (meshInstance$ == null) {
    meshInstance$ = getMeshOptions()
      .then((meshOptions) => getMesh(meshOptions))
      .then((mesh) => {
        const id = mesh.pubsub.subscribe('destroy', () => {
          meshInstance$ = undefined;
          mesh.pubsub.unsubscribe(id);
        });
        return mesh;
      });
  }
  return meshInstance$;
}

export const execute: ExecuteMeshFn = (...args) =>
  getBuiltGraphClient().then(({ execute }) => execute(...args));

export const subscribe: SubscribeMeshFn = (...args) =>
  getBuiltGraphClient().then(({ subscribe }) => subscribe(...args));
export function getBuiltGraphSDK<TGlobalContext = any, TOperationContext = any>(
  globalContext?: TGlobalContext
) {
  const sdkRequester$ = getBuiltGraphClient().then(({ sdkRequesterFactory }) =>
    sdkRequesterFactory(globalContext)
  );
  return getSdk<TOperationContext, TGlobalContext>((...args) =>
    sdkRequester$.then((sdkRequester) => sdkRequester(...args))
  );
}
export type AccountBalanceStatementQueryVariables = Exact<{
  accountId: Scalars['ID'];
}>;


export type AccountBalanceStatementQuery = { account?: Maybe<(
    Pick<Account, 'id'>
    & { balances?: Maybe<Array<{ token: (
        Pick<Token, 'id'>
        & { underlying?: Maybe<Pick<Token, 'id'>> }
      ), current: (
        Pick<BalanceSnapshot, 'timestamp' | 'blockNumber' | 'currentBalance' | '_accumulatedCostRealized' | 'adjustedCostBasis' | 'currentProfitAndLossAtSnapshot' | 'totalILAndFeesAtSnapshot' | 'totalProfitAndLossAtSnapshot' | 'totalInterestAccrualAtSnapshot' | '_lastInterestAccumulator' | 'impliedFixedRate'>
        & { incentives?: Maybe<Array<(
          Pick<IncentiveSnapshot, 'totalClaimed' | 'adjustedClaimed'>
          & { rewardToken: Pick<Token, 'id' | 'symbol'> }
        )>> }
      ) }>> }
  )> };

export type AccountHoldingsHistoricalQueryVariables = Exact<{
  accountId: Scalars['ID'];
  minTimestamp: Scalars['Int'];
}>;


export type AccountHoldingsHistoricalQuery = { account?: Maybe<{ balances?: Maybe<Array<{ snapshots?: Maybe<Array<Pick<BalanceSnapshot, 'timestamp' | 'currentBalance'>>> }>> }> };

export type AccountTransactionHistoryQueryVariables = Exact<{
  accountId: Scalars['String'];
}>;

export type AccountTransactionHistoryQuery = {
  transactions: Array<
    Pick<Transaction, 'timestamp' | 'blockNumber' | 'transactionHash'> & {
      profitLossLineItems?: Maybe<
        Array<
          Pick<
            ProfitLossLineItem,
            | 'timestamp'
            | 'blockNumber'
            | 'tokenAmount'
            | 'underlyingAmountRealized'
            | 'underlyingAmountSpot'
            | 'realizedPrice'
            | 'spotPrice'
            | 'impliedFixedRate'
            | 'isTransientLineItem'
          > & {
            transactionHash: Pick<Transaction, 'id'>;
            token: Pick<Token, 'id' | 'tokenType'>;
            underlyingToken: Pick<Token, 'id'>;
            bundle: Pick<TransferBundle, 'bundleName'>;
            account: Pick<Account, 'id'>;
          }
        >
      >;
    }
  >;
};

export type ActiveAccountsQueryVariables = Exact<{
  skip?: InputMaybe<Scalars['Int']>;
}>;

export type ActiveAccountsQuery = {
  accounts: Array<
    Pick<Account, 'id' | 'systemAccountType'> & {
      balances?: Maybe<
        Array<{
          token: Pick<Token, 'id' | 'tokenType' | 'currencyId' | 'isfCashDebt'>;
          current: Pick<BalanceSnapshot, 'currentBalance'>;
        }>
      >;
    }
  >;
};

export type AllAccountsQueryVariables = Exact<{
  skip?: InputMaybe<Scalars['Int']>;
}>;

export type AllAccountsQuery = {
  accounts: Array<
    Pick<Account, 'id' | 'systemAccountType'> & {
      balances?: Maybe<
        Array<{
          token: Pick<Token, 'id' | 'currencyId'> & {
            underlying?: Maybe<Pick<Token, 'id'>>;
          };
          current: Pick<
            BalanceSnapshot,
            'timestamp' | 'blockNumber' | 'currentBalance'
          >;
        }>
      >;
    }
  >;
};

export type AllConfigurationQueryVariables = Exact<{ [key: string]: never }>;

export type AllConfigurationQuery = {
  currencyConfigurations: Array<
    Pick<
      CurrencyConfiguration,
      | 'id'
      | 'maxUnderlyingSupply'
      | 'collateralHaircut'
      | 'debtBuffer'
      | 'liquidationDiscount'
      | 'primeCashRateOracleTimeWindowSeconds'
      | 'primeCashHoldingsOracle'
      | 'primeDebtAllowed'
      | 'fCashRateOracleTimeWindowSeconds'
      | 'fCashReserveFeeSharePercent'
      | 'fCashDebtBufferBasisPoints'
      | 'fCashHaircutBasisPoints'
      | 'fCashMinOracleRate'
      | 'fCashMaxOracleRate'
      | 'fCashMaxDiscountFactor'
      | 'fCashLiquidationHaircutBasisPoints'
      | 'fCashLiquidationDebtBufferBasisPoints'
      | 'treasuryReserveBuffer'
      | 'primeCashHoldings'
      | 'depositShares'
      | 'leverageThresholds'
      | 'proportions'
      | 'residualPurchaseIncentiveBasisPoints'
      | 'residualPurchaseTimeBufferSeconds'
      | 'cashWithholdingBufferBasisPoints'
      | 'pvHaircutPercentage'
      | 'liquidationHaircutPercentage'
      | 'maxMintDeviationBasisPoints'
    > & {
      underlying?: Maybe<Pick<Token, 'id'>>;
      pCash?: Maybe<Pick<Token, 'id'>>;
      pDebt?: Maybe<Pick<Token, 'id'>>;
      primeCashCurve?: Maybe<
        Pick<
          InterestRateCurve,
          | 'kinkUtilization1'
          | 'kinkUtilization2'
          | 'kinkRate1'
          | 'kinkRate2'
          | 'maxRate'
          | 'minFeeRate'
          | 'maxFeeRate'
          | 'feeRatePercent'
        >
      >;
      fCashActiveCurves?: Maybe<
        Array<
          Pick<
            InterestRateCurve,
            | 'kinkUtilization1'
            | 'kinkUtilization2'
            | 'kinkRate1'
            | 'kinkRate2'
            | 'maxRate'
            | 'minFeeRate'
            | 'maxFeeRate'
            | 'feeRatePercent'
          >
        >
      >;
      fCashNextCurves?: Maybe<
        Array<
          Pick<
            InterestRateCurve,
            | 'kinkUtilization1'
            | 'kinkUtilization2'
            | 'kinkRate1'
            | 'kinkRate2'
            | 'maxRate'
            | 'minFeeRate'
            | 'maxFeeRate'
            | 'feeRatePercent'
          >
        >
      >;
      incentives?: Maybe<
        Pick<
          Incentive,
          | 'incentiveEmissionRate'
          | 'accumulatedNOTEPerNToken'
          | 'lastAccumulatedTime'
          | 'secondaryIncentiveRewarder'
          | 'secondaryEmissionRate'
          | 'accumulatedSecondaryRewardPerNToken'
          | 'lastSecondaryAccumulatedTime'
          | 'secondaryRewardEndTime'
        > & { currentSecondaryReward?: Maybe<Pick<Token, 'id' | 'symbol'>> }
      >;
    }
  >;
  vaultConfigurations: Array<
    Pick<
      VaultConfiguration,
      | 'id'
      | 'vaultAddress'
      | 'strategy'
      | 'name'
      | 'minAccountBorrowSize'
      | 'minCollateralRatioBasisPoints'
      | 'maxDeleverageCollateralRatioBasisPoints'
      | 'feeRateBasisPoints'
      | 'reserveFeeSharePercent'
      | 'liquidationRatePercent'
      | 'maxBorrowMarketIndex'
      | 'maxRequiredAccountCollateralRatioBasisPoints'
      | 'enabled'
      | 'allowRollPosition'
      | 'onlyVaultEntry'
      | 'onlyVaultExit'
      | 'onlyVaultRoll'
      | 'onlyVaultDeleverage'
      | 'onlyVaultSettle'
      | 'discountfCash'
      | 'allowsReentrancy'
      | 'deleverageDisabled'
      | 'maxPrimaryBorrowCapacity'
      | 'totalUsedPrimaryBorrowCapacity'
      | 'maxSecondaryBorrowCapacity'
      | 'totalUsedSecondaryBorrowCapacity'
      | 'minAccountSecondaryBorrow'
    > & {
      primaryBorrowCurrency: Pick<Token, 'id'>;
      secondaryBorrowCurrencies?: Maybe<Array<Pick<Token, 'id'>>>;
    }
  >;
  whitelistedContracts: Array<
    Pick<WhitelistedContract, 'id' | 'name' | 'capability'>
  >;
  _meta?: Maybe<{ block: Pick<_Block_, 'number'> }>;
};

export type AllConfigurationByBlockQueryVariables = Exact<{
  blockNumber?: InputMaybe<Scalars['Int']>;
}>;

export type AllConfigurationByBlockQuery = {
  currencyConfigurations: Array<
    Pick<
      CurrencyConfiguration,
      | 'id'
      | 'maxUnderlyingSupply'
      | 'collateralHaircut'
      | 'debtBuffer'
      | 'liquidationDiscount'
      | 'primeCashRateOracleTimeWindowSeconds'
      | 'primeCashHoldingsOracle'
      | 'primeDebtAllowed'
      | 'fCashRateOracleTimeWindowSeconds'
      | 'fCashReserveFeeSharePercent'
      | 'fCashDebtBufferBasisPoints'
      | 'fCashHaircutBasisPoints'
      | 'fCashMinOracleRate'
      | 'fCashMaxOracleRate'
      | 'fCashMaxDiscountFactor'
      | 'fCashLiquidationHaircutBasisPoints'
      | 'fCashLiquidationDebtBufferBasisPoints'
      | 'treasuryReserveBuffer'
      | 'primeCashHoldings'
      | 'depositShares'
      | 'leverageThresholds'
      | 'proportions'
      | 'residualPurchaseIncentiveBasisPoints'
      | 'residualPurchaseTimeBufferSeconds'
      | 'cashWithholdingBufferBasisPoints'
      | 'pvHaircutPercentage'
      | 'liquidationHaircutPercentage'
    > & {
      underlying?: Maybe<Pick<Token, 'id'>>;
      pCash?: Maybe<Pick<Token, 'id'>>;
      pDebt?: Maybe<Pick<Token, 'id'>>;
      primeCashCurve?: Maybe<
        Pick<
          InterestRateCurve,
          | 'kinkUtilization1'
          | 'kinkUtilization2'
          | 'kinkRate1'
          | 'kinkRate2'
          | 'maxRate'
          | 'minFeeRate'
          | 'maxFeeRate'
          | 'feeRatePercent'
        >
      >;
      fCashActiveCurves?: Maybe<
        Array<
          Pick<
            InterestRateCurve,
            | 'kinkUtilization1'
            | 'kinkUtilization2'
            | 'kinkRate1'
            | 'kinkRate2'
            | 'maxRate'
            | 'minFeeRate'
            | 'maxFeeRate'
            | 'feeRatePercent'
          >
        >
      >;
      fCashNextCurves?: Maybe<
        Array<
          Pick<
            InterestRateCurve,
            | 'kinkUtilization1'
            | 'kinkUtilization2'
            | 'kinkRate1'
            | 'kinkRate2'
            | 'maxRate'
            | 'minFeeRate'
            | 'maxFeeRate'
            | 'feeRatePercent'
          >
        >
      >;
      incentives?: Maybe<
        Pick<
          Incentive,
          | 'incentiveEmissionRate'
          | 'accumulatedNOTEPerNToken'
          | 'lastAccumulatedTime'
          | 'secondaryIncentiveRewarder'
          | 'secondaryEmissionRate'
          | 'accumulatedSecondaryRewardPerNToken'
          | 'lastSecondaryAccumulatedTime'
          | 'secondaryRewardEndTime'
        > & { currentSecondaryReward?: Maybe<Pick<Token, 'id' | 'symbol'>> }
      >;
    }
  >;
  vaultConfigurations: Array<
    Pick<
      VaultConfiguration,
      | 'id'
      | 'vaultAddress'
      | 'strategy'
      | 'name'
      | 'minAccountBorrowSize'
      | 'minCollateralRatioBasisPoints'
      | 'maxDeleverageCollateralRatioBasisPoints'
      | 'feeRateBasisPoints'
      | 'reserveFeeSharePercent'
      | 'liquidationRatePercent'
      | 'maxBorrowMarketIndex'
      | 'maxRequiredAccountCollateralRatioBasisPoints'
      | 'enabled'
      | 'allowRollPosition'
      | 'onlyVaultEntry'
      | 'onlyVaultExit'
      | 'onlyVaultRoll'
      | 'onlyVaultDeleverage'
      | 'onlyVaultSettle'
      | 'discountfCash'
      | 'allowsReentrancy'
      | 'deleverageDisabled'
      | 'maxPrimaryBorrowCapacity'
      | 'totalUsedPrimaryBorrowCapacity'
      | 'maxSecondaryBorrowCapacity'
      | 'totalUsedSecondaryBorrowCapacity'
      | 'minAccountSecondaryBorrow'
    > & {
      primaryBorrowCurrency: Pick<Token, 'id'>;
      secondaryBorrowCurrencies?: Maybe<Array<Pick<Token, 'id'>>>;
    }
  >;
  _meta?: Maybe<{ block: Pick<_Block_, 'number'> }>;
};

export type AllOraclesQueryVariables = Exact<{
  skip: Scalars['Int'];
}>;

export type AllOraclesQuery = {
  oracles: Array<
    Pick<
      Oracle,
      | 'id'
      | 'lastUpdateBlockNumber'
      | 'lastUpdateTimestamp'
      | 'decimals'
      | 'oracleAddress'
      | 'oracleType'
      | 'mustInvert'
      | 'latestRate'
    > & {
      base: Pick<Token, 'id' | 'decimals'>;
      quote: Pick<Token, 'id' | 'currencyId'>;
    }
  >;
  _meta?: Maybe<{ block: Pick<_Block_, 'number'> }>;
};

export type AllOraclesByBlockQueryVariables = Exact<{
  blockNumber?: InputMaybe<Scalars['Int']>;
}>;

export type AllOraclesByBlockQuery = {
  oracles: Array<
    Pick<
      Oracle,
      | 'id'
      | 'lastUpdateBlockNumber'
      | 'lastUpdateTimestamp'
      | 'decimals'
      | 'oracleAddress'
      | 'oracleType'
      | 'mustInvert'
      | 'latestRate'
    > & {
      base: Pick<Token, 'id' | 'decimals'>;
      quote: Pick<Token, 'id' | 'currencyId'>;
    }
  >;
  _meta?: Maybe<{ block: Pick<_Block_, 'number'> }>;
};

export type AllTokensQueryVariables = Exact<{ [key: string]: never }>;

export type AllTokensQuery = {
  tokens: Array<
    Pick<
      Token,
      | 'id'
      | 'tokenType'
      | 'tokenInterface'
      | 'currencyId'
      | 'name'
      | 'symbol'
      | 'decimals'
      | 'totalSupply'
      | 'hasTransferFee'
      | 'isfCashDebt'
      | 'maturity'
      | 'vaultAddress'
      | 'tokenAddress'
    > & { underlying?: Maybe<Pick<Token, 'id'>> }
  >;
  _meta?: Maybe<{ block: Pick<_Block_, 'number'> }>;
};

export type AllTokensByBlockQueryVariables = Exact<{
  blockNumber?: InputMaybe<Scalars['Int']>;
}>;

export type AllTokensByBlockQuery = {
  tokens: Array<
    Pick<
      Token,
      | 'id'
      | 'tokenType'
      | 'tokenInterface'
      | 'currencyId'
      | 'name'
      | 'symbol'
      | 'decimals'
      | 'totalSupply'
      | 'hasTransferFee'
      | 'isfCashDebt'
      | 'maturity'
      | 'vaultAddress'
      | 'tokenAddress'
    > & { underlying?: Maybe<Pick<Token, 'id'>> }
  >;
  _meta?: Maybe<{ block: Pick<_Block_, 'number'> }>;
};

export type AllVaultAccountsQueryVariables = Exact<{
  blockNumber: Scalars['Int'];
  vaultAddress: Scalars['Bytes'];
  skip?: InputMaybe<Scalars['Int']>;
}>;

export type AllVaultAccountsQuery = {
  balances: Array<
    Pick<Balance, 'id'> & {
      account: Pick<Account, 'id'>;
      current: Pick<BalanceSnapshot, 'currentBalance'>;
    }
  >;
};

export type AllVaultsQueryVariables = Exact<{
  skip?: InputMaybe<Scalars['Int']>;
}>;

export type AllVaultsQuery = {
  vaultConfigurations: Array<
    Pick<
      VaultConfiguration,
      'id' | 'vaultAddress' | 'strategy' | 'name' | 'enabled'
    >
  >;
  _meta?: Maybe<{ block: Pick<_Block_, 'number'> }>;
};

export type AllVaultsByBlockQueryVariables = Exact<{
  blockNumber?: InputMaybe<Scalars['Int']>;
  skip?: InputMaybe<Scalars['Int']>;
}>;

export type AllVaultsByBlockQuery = {
  vaultConfigurations: Array<
    Pick<
      VaultConfiguration,
      'id' | 'vaultAddress' | 'strategy' | 'name' | 'enabled'
    >
  >;
  _meta?: Maybe<{ block: Pick<_Block_, 'number'> }>;
};

export type ExchangeRateValuesQueryVariables = Exact<{
  skip?: InputMaybe<Scalars['Int']>;
  oracleId?: InputMaybe<Scalars['String']>;
  minTimestamp?: InputMaybe<Scalars['Int']>;
}>;

export type ExchangeRateValuesQuery = {
  exchangeRates: Array<Pick<ExchangeRate, 'timestamp' | 'rate'>>;
};

export type ExternalLendingHistoryQueryVariables = Exact<{
  [key: string]: never;
}>;

export type ExternalLendingHistoryQuery = {
  externalLendings: Array<
    Pick<ExternalLending, 'id'> & {
      underlying: Pick<Token, 'id'>;
      underlyingSnapshots?: Maybe<
        Array<
          Pick<
            UnderlyingSnapshot,
            'timestamp' | 'balanceOf' | 'storedBalanceOf'
          >
        >
      >;
    }
  >;
  _meta?: Maybe<{ block: Pick<_Block_, 'number'> }>;
};

export type HistoricalOracleValuesQueryVariables = Exact<{
  skip?: InputMaybe<Scalars['Int']>;
  minTimestamp?: InputMaybe<Scalars['Int']>;
}>;

export type HistoricalOracleValuesQuery = {
  oracles: Array<
    Pick<
      Oracle,
      | 'id'
      | 'lastUpdateTimestamp'
      | 'lastUpdateBlockNumber'
      | 'oracleAddress'
      | 'decimals'
      | 'ratePrecision'
      | 'oracleType'
      | 'latestRate'
    > & {
      base: Pick<Token, 'id'>;
      quote: Pick<Token, 'id'>;
      historicalRates?: Maybe<
        Array<
          Pick<
            ExchangeRate,
            'totalSupply' | 'blockNumber' | 'timestamp' | 'rate'
          >
        >
      >;
    }
  >;
  _meta?: Maybe<{ block: Pick<_Block_, 'number'> }>;
};

export type HistoricalTradingActivityQueryVariables = Exact<{
  skip?: InputMaybe<Scalars['Int']>;
  minTimestamp?: InputMaybe<Scalars['Int']>;
}>;

export type HistoricalTradingActivityQuery = {
  tradingActivity: Array<
    Pick<TransferBundle, 'id' | 'bundleName' | 'blockNumber' | 'timestamp'> & {
      transactionHash: Pick<Transaction, 'id'>;
      transfers: Array<
        Pick<
          Transfer,
          | 'toSystemAccount'
          | 'fromSystemAccount'
          | 'value'
          | 'valueInUnderlying'
        > & {
          to: Pick<Account, 'id'>;
          from: Pick<Account, 'id'>;
          token: Pick<Token, 'id' | 'currencyId'>;
        }
      >;
    }
  >;
  _meta?: Maybe<{ block: Pick<_Block_, 'number'> }>;
};

export type MetaQueryVariables = Exact<{ [key: string]: never }>;

export type MetaQuery = {
  _meta?: Maybe<
    Pick<_Meta_, 'deployment' | 'hasIndexingErrors'> & {
      block: Pick<_Block_, 'number' | 'hash' | 'timestamp'>;
    }
  >;
};

export type NetworkTransactionHistoryQueryVariables = Exact<{
  skip: Scalars['Int'];
}>;

export type NetworkTransactionHistoryQuery = {
  transactions: Array<
    Pick<Transaction, 'timestamp' | 'blockNumber' | 'transactionHash'> & {
      profitLossLineItems?: Maybe<
        Array<
          Pick<
            ProfitLossLineItem,
            | 'timestamp'
            | 'blockNumber'
            | 'tokenAmount'
            | 'underlyingAmountRealized'
            | 'underlyingAmountSpot'
            | 'realizedPrice'
            | 'spotPrice'
            | 'impliedFixedRate'
            | 'isTransientLineItem'
          > & {
            account: Pick<Account, 'id'>;
            transactionHash: Pick<Transaction, 'id'>;
            token: Pick<Token, 'id' | 'tokenType'>;
            underlyingToken: Pick<Token, 'id'>;
            bundle: Pick<TransferBundle, 'bundleName'>;
          }
        >
      >;
    }
  >;
};

export type VaultReinvestmentQueryVariables = Exact<{
  skip?: InputMaybe<Scalars['Int']>;
  minTimestamp?: InputMaybe<Scalars['Int']>;
}>;

export type VaultReinvestmentQuery = {
  reinvestments: Array<
    Pick<
      Reinvestment,
      | 'timestamp'
      | 'blockNumber'
      | 'transactionHash'
      | 'rewardAmountSold'
      | 'tokensReinvested'
      | 'tokensPerVaultShare'
      | 'underlyingAmountRealized'
      | 'vaultSharePrice'
    > & {
      vault: Pick<VaultConfiguration, 'id'>;
      rewardTokenSold: Pick<Token, 'id'>;
    }
  >;
  _meta?: Maybe<{ block: Pick<_Block_, 'number'> }>;
};

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
      }
      current {
        timestamp
        blockNumber
        currentBalance
        _accumulatedCostRealized
        adjustedCostBasis
        currentProfitAndLossAtSnapshot
        totalILAndFeesAtSnapshot
        totalProfitAndLossAtSnapshot
        totalInterestAccrualAtSnapshot
        _lastInterestAccumulator
        impliedFixedRate
        incentives {
          rewardToken {
            id
          }
        }
      }
    }
  }
}
    ` as unknown as DocumentNode<AccountBalanceStatementQuery, AccountBalanceStatementQueryVariables>;
export const AccountHoldingsHistoricalDocument = gql`
    query AccountHoldingsHistorical($accountId: ID!, $minTimestamp: Int!) {
  account(id: $accountId) {
    balances {
      snapshots(
        where: {timestamp_gte: $minTimestamp}
        orderBy: timestamp
        orderDirection: asc
      ) {
        timestamp
        currentBalance
      }
    }
  }
}
    ` as unknown as DocumentNode<AccountHoldingsHistoricalQuery, AccountHoldingsHistoricalQueryVariables>;
export const AccountTransactionHistoryDocument = gql`
  query AccountTransactionHistory($accountId: String!) {
    transactions(
      where: { profitLossLineItems_: { account: $accountId } }
      orderBy: timestamp
      orderDirection: desc
    ) {
      timestamp
      blockNumber
      transactionHash
      profitLossLineItems(
        where: { account: $accountId, isTransientLineItem: false }
      ) {
        timestamp
        blockNumber
        transactionHash {
          id
        }
        token {
          id
          tokenType
        }
        underlyingToken {
          id
        }
        tokenAmount
        bundle {
          bundleName
        }
        underlyingAmountRealized
        underlyingAmountSpot
        realizedPrice
        spotPrice
        impliedFixedRate
        isTransientLineItem
        account {
          id
        }
      }
    }
  }
` as unknown as DocumentNode<
  AccountTransactionHistoryQuery,
  AccountTransactionHistoryQueryVariables
>;
export const ActiveAccountsDocument = gql`
  query ActiveAccounts($skip: Int) {
    accounts(
      first: 1000
      skip: $skip
      where: { systemAccountType_in: [None] }
    ) {
      id
      systemAccountType
      balances {
        token {
          id
          tokenType
          currencyId
          isfCashDebt
        }
        current {
          currentBalance
        }
      }
    }
  }
` as unknown as DocumentNode<ActiveAccountsQuery, ActiveAccountsQueryVariables>;
export const AllAccountsDocument = gql`
  query AllAccounts($skip: Int) {
    accounts(
      first: 1000
      skip: $skip
      where: {
        systemAccountType_in: [None, nToken, FeeReserve, SettlementReserve]
      }
    ) {
      id
      systemAccountType
      balances {
        token {
          id
          currencyId
          underlying {
            id
          }
        }
        current {
          timestamp
          blockNumber
          currentBalance
        }
      }
    }
  }
` as unknown as DocumentNode<AllAccountsQuery, AllAccountsQueryVariables>;
export const AllConfigurationDocument = gql`
  query AllConfiguration {
    currencyConfigurations {
      id
      underlying {
        id
      }
      pCash {
        id
      }
      pDebt {
        id
      }
      maxUnderlyingSupply
      collateralHaircut
      debtBuffer
      liquidationDiscount
      primeCashRateOracleTimeWindowSeconds
      primeCashHoldingsOracle
      primeCashCurve {
        kinkUtilization1
        kinkUtilization2
        kinkRate1
        kinkRate2
        maxRate
        minFeeRate
        maxFeeRate
        feeRatePercent
      }
      primeDebtAllowed
      fCashRateOracleTimeWindowSeconds
      fCashReserveFeeSharePercent
      fCashDebtBufferBasisPoints
      fCashHaircutBasisPoints
      fCashMinOracleRate
      fCashMaxOracleRate
      fCashMaxDiscountFactor
      fCashLiquidationHaircutBasisPoints
      fCashLiquidationDebtBufferBasisPoints
      fCashActiveCurves {
        kinkUtilization1
        kinkUtilization2
        kinkRate1
        kinkRate2
        maxRate
        minFeeRate
        maxFeeRate
        feeRatePercent
      }
      fCashNextCurves {
        kinkUtilization1
        kinkUtilization2
        kinkRate1
        kinkRate2
        maxRate
        minFeeRate
        maxFeeRate
        feeRatePercent
      }
      treasuryReserveBuffer
      primeCashHoldings
      depositShares
      leverageThresholds
      proportions
      residualPurchaseIncentiveBasisPoints
      residualPurchaseTimeBufferSeconds
      cashWithholdingBufferBasisPoints
      pvHaircutPercentage
      liquidationHaircutPercentage
      maxMintDeviationBasisPoints
      incentives {
        incentiveEmissionRate
        accumulatedNOTEPerNToken
        lastAccumulatedTime
        currentSecondaryReward {
          id
          symbol
        }
        secondaryIncentiveRewarder
        secondaryEmissionRate
        accumulatedSecondaryRewardPerNToken
        lastSecondaryAccumulatedTime
        secondaryRewardEndTime
      }
    }
    vaultConfigurations {
      id
      vaultAddress
      strategy
      name
      primaryBorrowCurrency {
        id
      }
      minAccountBorrowSize
      minCollateralRatioBasisPoints
      maxDeleverageCollateralRatioBasisPoints
      feeRateBasisPoints
      reserveFeeSharePercent
      liquidationRatePercent
      maxBorrowMarketIndex
      secondaryBorrowCurrencies {
        id
      }
      maxRequiredAccountCollateralRatioBasisPoints
      enabled
      allowRollPosition
      onlyVaultEntry
      onlyVaultExit
      onlyVaultRoll
      onlyVaultDeleverage
      onlyVaultSettle
      discountfCash
      allowsReentrancy
      deleverageDisabled
      maxPrimaryBorrowCapacity
      totalUsedPrimaryBorrowCapacity
      maxSecondaryBorrowCapacity
      totalUsedSecondaryBorrowCapacity
      minAccountSecondaryBorrow
    }
    whitelistedContracts {
      id
      name
      capability
    }
    _meta {
      block {
        number
      }
    }
  }
` as unknown as DocumentNode<
  AllConfigurationQuery,
  AllConfigurationQueryVariables
>;
export const AllConfigurationByBlockDocument = gql`
  query AllConfigurationByBlock($blockNumber: Int) {
    currencyConfigurations(block: { number: $blockNumber }) {
      id
      underlying {
        id
      }
      pCash {
        id
      }
      pDebt {
        id
      }
      maxUnderlyingSupply
      collateralHaircut
      debtBuffer
      liquidationDiscount
      primeCashRateOracleTimeWindowSeconds
      primeCashHoldingsOracle
      primeCashCurve {
        kinkUtilization1
        kinkUtilization2
        kinkRate1
        kinkRate2
        maxRate
        minFeeRate
        maxFeeRate
        feeRatePercent
      }
      primeDebtAllowed
      fCashRateOracleTimeWindowSeconds
      fCashReserveFeeSharePercent
      fCashDebtBufferBasisPoints
      fCashHaircutBasisPoints
      fCashMinOracleRate
      fCashMaxOracleRate
      fCashMaxDiscountFactor
      fCashLiquidationHaircutBasisPoints
      fCashLiquidationDebtBufferBasisPoints
      fCashActiveCurves {
        kinkUtilization1
        kinkUtilization2
        kinkRate1
        kinkRate2
        maxRate
        minFeeRate
        maxFeeRate
        feeRatePercent
      }
      fCashNextCurves {
        kinkUtilization1
        kinkUtilization2
        kinkRate1
        kinkRate2
        maxRate
        minFeeRate
        maxFeeRate
        feeRatePercent
      }
      treasuryReserveBuffer
      primeCashHoldings
      depositShares
      leverageThresholds
      proportions
      residualPurchaseIncentiveBasisPoints
      residualPurchaseTimeBufferSeconds
      cashWithholdingBufferBasisPoints
      pvHaircutPercentage
      liquidationHaircutPercentage
      incentives {
        incentiveEmissionRate
        accumulatedNOTEPerNToken
        lastAccumulatedTime
        currentSecondaryReward {
          id
          symbol
        }
        secondaryIncentiveRewarder
        secondaryEmissionRate
        accumulatedSecondaryRewardPerNToken
        lastSecondaryAccumulatedTime
        secondaryRewardEndTime
      }
    }
    vaultConfigurations(
      where: { enabled: true }
      block: { number: $blockNumber }
    ) {
      id
      vaultAddress
      strategy
      name
      primaryBorrowCurrency {
        id
      }
      minAccountBorrowSize
      minCollateralRatioBasisPoints
      maxDeleverageCollateralRatioBasisPoints
      feeRateBasisPoints
      reserveFeeSharePercent
      liquidationRatePercent
      maxBorrowMarketIndex
      secondaryBorrowCurrencies {
        id
      }
      maxRequiredAccountCollateralRatioBasisPoints
      enabled
      allowRollPosition
      onlyVaultEntry
      onlyVaultExit
      onlyVaultRoll
      onlyVaultDeleverage
      onlyVaultSettle
      discountfCash
      allowsReentrancy
      deleverageDisabled
      maxPrimaryBorrowCapacity
      totalUsedPrimaryBorrowCapacity
      maxSecondaryBorrowCapacity
      totalUsedSecondaryBorrowCapacity
      minAccountSecondaryBorrow
    }
    _meta {
      block {
        number
      }
    }
  }
` as unknown as DocumentNode<
  AllConfigurationByBlockQuery,
  AllConfigurationByBlockQueryVariables
>;
export const AllOraclesDocument = gql`
  query AllOracles($skip: Int!) {
    oracles(
      where: {
        oracleType_in: [
          Chainlink
          fCashOracleRate
          fCashSettlementRate
          PrimeCashToUnderlyingExchangeRate
          PrimeDebtToUnderlyingExchangeRate
          VaultShareOracleRate
          nTokenToUnderlyingExchangeRate
          fCashSpotRate
        ]
        matured: false
      }
      first: 1000
      skip: $skip
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
        currencyId
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
export const AllOraclesByBlockDocument = gql`
  query AllOraclesByBlock($blockNumber: Int) {
    oracles(
      where: {
        oracleType_in: [
          Chainlink
          fCashOracleRate
          fCashSettlementRate
          PrimeCashToUnderlyingExchangeRate
          PrimeDebtToUnderlyingExchangeRate
          VaultShareOracleRate
          nTokenToUnderlyingExchangeRate
          PrimeCashPremiumInterestRate
          PrimeDebtPremiumInterestRate
          PrimeCashExternalLendingInterestRate
          fCashSpotRate
          PrimeCashToUnderlyingOracleInterestRate
          fCashToUnderlyingExchangeRate
        ]
        matured: false
      }
      first: 1000
      block: { number: $blockNumber }
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
        currencyId
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
` as unknown as DocumentNode<
  AllOraclesByBlockQuery,
  AllOraclesByBlockQueryVariables
>;
export const AllTokensDocument = gql`
  query AllTokens {
    tokens(first: 1000) {
      id
      tokenType
      tokenInterface
      underlying {
        id
      }
      currencyId
      name
      symbol
      decimals
      totalSupply
      hasTransferFee
      isfCashDebt
      maturity
      vaultAddress
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
export const AllTokensByBlockDocument = gql`
  query AllTokensByBlock($blockNumber: Int) {
    tokens(first: 1000, block: { number: $blockNumber }) {
      id
      tokenType
      tokenInterface
      underlying {
        id
      }
      currencyId
      name
      symbol
      decimals
      totalSupply
      hasTransferFee
      isfCashDebt
      maturity
      vaultAddress
      tokenAddress
      totalSupply
    }
    _meta {
      block {
        number
      }
    }
  }
` as unknown as DocumentNode<
  AllTokensByBlockQuery,
  AllTokensByBlockQueryVariables
>;
export const AllVaultAccountsDocument = gql`
  query AllVaultAccounts(
    $blockNumber: Int!
    $vaultAddress: Bytes!
    $skip: Int
  ) {
    balances(
      where: { token_: { vaultAddress: $vaultAddress, tokenType: VaultShare } }
      block: { number: $blockNumber }
      first: 1000
      skip: $skip
    ) {
      id
      account {
        id
      }
      current {
        currentBalance
      }
    }
  }
}
    ` as unknown as DocumentNode<ActiveAccountsQuery, ActiveAccountsQueryVariables>;
export const AllAccountsDocument = gql`
    query AllAccounts($skip: Int) {
  accounts(
    first: 1000
    skip: $skip
    where: {systemAccountType_in: [None, nToken, FeeReserve, SettlementReserve]}
  ) {
    id
    systemAccountType
    balances {
      token {
        id
        currencyId
        underlying {
          id
        }
      }
      current {
        timestamp
        blockNumber
        currentBalance
      }
    }
  }
}
    ` as unknown as DocumentNode<AllAccountsQuery, AllAccountsQueryVariables>;
export const AllConfigurationDocument = gql`
    query AllConfiguration {
  currencyConfigurations {
    id
    underlying {
      id
    }
    pCash {
      id
    }
    pDebt {
      id
    }
    maxUnderlyingSupply
    collateralHaircut
    debtBuffer
    liquidationDiscount
    primeCashRateOracleTimeWindowSeconds
    primeCashHoldingsOracle
    primeCashCurve {
      kinkUtilization1
      kinkUtilization2
      kinkRate1
      kinkRate2
      maxRate
      minFeeRate
      maxFeeRate
      feeRatePercent
    }
    primeDebtAllowed
    fCashRateOracleTimeWindowSeconds
    fCashReserveFeeSharePercent
    fCashDebtBufferBasisPoints
    fCashHaircutBasisPoints
    fCashMinOracleRate
    fCashMaxOracleRate
    fCashMaxDiscountFactor
    fCashLiquidationHaircutBasisPoints
    fCashLiquidationDebtBufferBasisPoints
    fCashActiveCurves {
      kinkUtilization1
      kinkUtilization2
      kinkRate1
      kinkRate2
      maxRate
      minFeeRate
      maxFeeRate
      feeRatePercent
    }
    fCashNextCurves {
      kinkUtilization1
      kinkUtilization2
      kinkRate1
      kinkRate2
      maxRate
      minFeeRate
      maxFeeRate
      feeRatePercent
    }
    treasuryReserveBuffer
    primeCashHoldings
    depositShares
    leverageThresholds
    proportions
    residualPurchaseIncentiveBasisPoints
    residualPurchaseTimeBufferSeconds
    cashWithholdingBufferBasisPoints
    pvHaircutPercentage
    liquidationHaircutPercentage
    maxMintDeviationBasisPoints
    incentives {
      incentiveEmissionRate
      accumulatedNOTEPerNToken
      lastAccumulatedTime
      currentSecondaryReward {
        id
        symbol
      }
      secondaryIncentiveRewarder
      secondaryEmissionRate
      accumulatedSecondaryRewardPerNToken
      lastSecondaryAccumulatedTime
      secondaryRewardEndTime
    }
  }
  vaultConfigurations {
    id
    vaultAddress
    strategy
    name
    primaryBorrowCurrency {
      id
    }
    minAccountBorrowSize
    minCollateralRatioBasisPoints
    maxDeleverageCollateralRatioBasisPoints
    feeRateBasisPoints
    reserveFeeSharePercent
    liquidationRatePercent
    maxBorrowMarketIndex
    secondaryBorrowCurrencies {
      id
    }
    maxRequiredAccountCollateralRatioBasisPoints
    enabled
    allowRollPosition
    onlyVaultEntry
    onlyVaultExit
    onlyVaultRoll
    onlyVaultDeleverage
    onlyVaultSettle
    discountfCash
    allowsReentrancy
    deleverageDisabled
    maxPrimaryBorrowCapacity
    totalUsedPrimaryBorrowCapacity
    maxSecondaryBorrowCapacity
    totalUsedSecondaryBorrowCapacity
    minAccountSecondaryBorrow
  }
  whitelistedContracts {
    id
    name
    capability
  }
  _meta {
    block {
      number
    }
  }
}
    ` as unknown as DocumentNode<AllConfigurationQuery, AllConfigurationQueryVariables>;
export const AllConfigurationByBlockDocument = gql`
    query AllConfigurationByBlock($blockNumber: Int) {
  currencyConfigurations(block: {number: $blockNumber}) {
    id
    underlying {
      id
    }
    pCash {
      id
    }
    pDebt {
      id
    }
    maxUnderlyingSupply
    collateralHaircut
    debtBuffer
    liquidationDiscount
    primeCashRateOracleTimeWindowSeconds
    primeCashHoldingsOracle
    primeCashCurve {
      kinkUtilization1
      kinkUtilization2
      kinkRate1
      kinkRate2
      maxRate
      minFeeRate
      maxFeeRate
      feeRatePercent
    }
    primeDebtAllowed
    fCashRateOracleTimeWindowSeconds
    fCashReserveFeeSharePercent
    fCashDebtBufferBasisPoints
    fCashHaircutBasisPoints
    fCashMinOracleRate
    fCashMaxOracleRate
    fCashMaxDiscountFactor
    fCashLiquidationHaircutBasisPoints
    fCashLiquidationDebtBufferBasisPoints
    fCashActiveCurves {
      kinkUtilization1
      kinkUtilization2
      kinkRate1
      kinkRate2
      maxRate
      minFeeRate
      maxFeeRate
      feeRatePercent
    }
    fCashNextCurves {
      kinkUtilization1
      kinkUtilization2
      kinkRate1
      kinkRate2
      maxRate
      minFeeRate
      maxFeeRate
      feeRatePercent
    }
    treasuryReserveBuffer
    primeCashHoldings
    depositShares
    leverageThresholds
    proportions
    residualPurchaseIncentiveBasisPoints
    residualPurchaseTimeBufferSeconds
    cashWithholdingBufferBasisPoints
    pvHaircutPercentage
    liquidationHaircutPercentage
    incentives {
      incentiveEmissionRate
      accumulatedNOTEPerNToken
      lastAccumulatedTime
      currentSecondaryReward {
        id
        symbol
      }
      secondaryIncentiveRewarder
      secondaryEmissionRate
      accumulatedSecondaryRewardPerNToken
      lastSecondaryAccumulatedTime
      secondaryRewardEndTime
    }
  }
  vaultConfigurations(where: {enabled: true}, block: {number: $blockNumber}) {
    id
    vaultAddress
    strategy
    name
    primaryBorrowCurrency {
      id
    }
    minAccountBorrowSize
    minCollateralRatioBasisPoints
    maxDeleverageCollateralRatioBasisPoints
    feeRateBasisPoints
    reserveFeeSharePercent
    liquidationRatePercent
    maxBorrowMarketIndex
    secondaryBorrowCurrencies {
      id
    }
    maxRequiredAccountCollateralRatioBasisPoints
    enabled
    allowRollPosition
    onlyVaultEntry
    onlyVaultExit
    onlyVaultRoll
    onlyVaultDeleverage
    onlyVaultSettle
    discountfCash
    allowsReentrancy
    deleverageDisabled
    maxPrimaryBorrowCapacity
    totalUsedPrimaryBorrowCapacity
    maxSecondaryBorrowCapacity
    totalUsedSecondaryBorrowCapacity
    minAccountSecondaryBorrow
  }
  _meta {
    block {
      number
    }
  }
}
    ` as unknown as DocumentNode<AllConfigurationByBlockQuery, AllConfigurationByBlockQueryVariables>;
export const AllOraclesDocument = gql`
    query AllOracles($skip: Int!) {
  oracles(
    where: {oracleType_in: [Chainlink, fCashOracleRate, fCashSettlementRate, PrimeCashToUnderlyingExchangeRate, PrimeDebtToUnderlyingExchangeRate, VaultShareOracleRate, nTokenToUnderlyingExchangeRate, fCashSpotRate, VaultShareInterestAccrued, nTokenInterestAccrued], matured: false}
    first: 1000
    skip: $skip
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
      currencyId
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
export const AllOraclesByBlockDocument = gql`
    query AllOraclesByBlock($blockNumber: Int) {
  oracles(
    where: {oracleType_in: [Chainlink, fCashOracleRate, fCashSettlementRate, PrimeCashToUnderlyingExchangeRate, PrimeDebtToUnderlyingExchangeRate, VaultShareOracleRate, nTokenToUnderlyingExchangeRate, PrimeCashPremiumInterestRate, PrimeDebtPremiumInterestRate, PrimeCashExternalLendingInterestRate, fCashSpotRate, PrimeCashToUnderlyingOracleInterestRate, fCashToUnderlyingExchangeRate], matured: false}
    first: 1000
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
      currencyId
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
    ` as unknown as DocumentNode<AllOraclesByBlockQuery, AllOraclesByBlockQueryVariables>;
export const AllTokensDocument = gql`
    query AllTokens {
  tokens(first: 1000) {
    id
    tokenType
    tokenInterface
    underlying {
      id
    }
    currencyId
    name
    symbol
    decimals
    totalSupply
    hasTransferFee
    isfCashDebt
    maturity
    vaultAddress
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
export const AllTokensByBlockDocument = gql`
    query AllTokensByBlock($blockNumber: Int) {
  tokens(first: 1000, block: {number: $blockNumber}) {
    id
    tokenType
    tokenInterface
    underlying {
      id
    }
    currencyId
    name
    symbol
    decimals
    totalSupply
    hasTransferFee
    isfCashDebt
    maturity
    vaultAddress
    tokenAddress
    totalSupply
  }
  _meta {
    block {
      number
    }
  }
}
    ` as unknown as DocumentNode<AllTokensByBlockQuery, AllTokensByBlockQueryVariables>;
export const AllVaultAccountsDocument = gql`
    query AllVaultAccounts($blockNumber: Int!, $vaultAddress: Bytes!) {
  balances(
    where: {token_: {vaultAddress: $vaultAddress, tokenType: VaultShare}}
    block: {number: $blockNumber}
  ) {
    id
    account {
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
    vaultConfigurations(first: 1000, skip: $skip) {
      id
      vaultAddress
      strategy
      name
      enabled
    }
    _meta {
      block {
        number
      }
    }
  }
` as unknown as DocumentNode<AllVaultsQuery, AllVaultsQueryVariables>;
export const AllVaultsByBlockDocument = gql`
  query AllVaultsByBlock($blockNumber: Int, $skip: Int) {
    vaultConfigurations(
      where: { enabled: true }
      block: { number: $blockNumber }
      first: 1000
      skip: $skip
    ) {
      id
      vaultAddress
      strategy
      name
      enabled
    }
    _meta {
      block {
        number
      }
    }
  }
` as unknown as DocumentNode<
  AllVaultsByBlockQuery,
  AllVaultsByBlockQueryVariables
>;
export const ExchangeRateValuesDocument = gql`
  query ExchangeRateValues($skip: Int, $oracleId: String, $minTimestamp: Int) {
    exchangeRates(
      where: { oracle: $oracleId, timestamp_gt: $minTimestamp }
      first: 1000
      skip: $skip
      orderBy: timestamp
      orderDirection: desc
    ) {
      timestamp
      rate
    }
  }
` as unknown as DocumentNode<
  ExchangeRateValuesQuery,
  ExchangeRateValuesQueryVariables
>;
export const ExternalLendingHistoryDocument = gql`
  query ExternalLendingHistory {
    externalLendings {
      id
      underlying {
        id
      }
      underlyingSnapshots(orderBy: timestamp, orderDirection: desc, first: 10) {
        timestamp
        balanceOf
        storedBalanceOf
      }
    }
    _meta {
      block {
        number
      }
    }
  }
` as unknown as DocumentNode<
  ExternalLendingHistoryQuery,
  ExternalLendingHistoryQueryVariables
>;
export const HistoricalOracleValuesDocument = gql`
  query HistoricalOracleValues($skip: Int, $minTimestamp: Int) {
    oracles(
      where: {
        oracleType_in: [
          Chainlink
          fCashSettlementRate
          nTokenToUnderlyingExchangeRate
          PrimeCashToUnderlyingExchangeRate
          PrimeDebtToUnderlyingExchangeRate
          VaultShareOracleRate
          fCashOracleRate
          PrimeCashPremiumInterestRate
          PrimeDebtPremiumInterestRate
          nTokenBlendedInterestRate
          nTokenFeeRate
          nTokenIncentiveRate
          nTokenSecondaryIncentiveRate
        ]
        matured: false
      }
      first: 1000
      skip: $skip
    ) {
      id
      base {
        id
      }
      quote {
        id
      }
      lastUpdateTimestamp
      lastUpdateBlockNumber
      oracleAddress
      decimals
      ratePrecision
      oracleType
      latestRate
      historicalRates(
        where: { timestamp_gt: $minTimestamp }
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
` as unknown as DocumentNode<
  HistoricalOracleValuesQuery,
  HistoricalOracleValuesQueryVariables
>;
export const HistoricalTradingActivityDocument = gql`
  query HistoricalTradingActivity($skip: Int, $minTimestamp: Int) {
    tradingActivity: transferBundles(
      where: {
        bundleName_in: [
          "Buy fCash"
          "Buy fCash Vault"
          "Sell fCash"
          "Sell fCash Vault"
        ]
        timestamp_gt: $minTimestamp
      }
      orderBy: timestamp
      orderDirection: desc
      first: 1000
      skip: $skip
    ) {
      id
      bundleName
      blockNumber
      timestamp
      transactionHash {
        id
      }
      transfers {
        to {
          id
        }
        toSystemAccount
        from {
          id
        }
        fromSystemAccount
        value
        valueInUnderlying
        token {
          id
          currencyId
        }
      }
    }
    _meta {
      block {
        number
      }
    }
  }
` as unknown as DocumentNode<
  HistoricalTradingActivityQuery,
  HistoricalTradingActivityQueryVariables
>;
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
    transactions(
      orderBy: timestamp
      orderDirection: desc
      skip: $skip
      first: 100
    ) {
      timestamp
      blockNumber
      transactionHash
      profitLossLineItems(where: { isTransientLineItem: false }) {
        account {
          id
        }
        timestamp
        blockNumber
        transactionHash {
          id
        }
        token {
          id
          tokenType
        }
        underlyingToken {
          id
        }
        tokenAmount
        bundle {
          bundleName
        }
        underlyingAmountRealized
        underlyingAmountSpot
        realizedPrice
        spotPrice
        impliedFixedRate
        isTransientLineItem
      }
    }
  }
` as unknown as DocumentNode<
  NetworkTransactionHistoryQuery,
  NetworkTransactionHistoryQueryVariables
>;
export const VaultReinvestmentDocument = gql`
  query VaultReinvestment($skip: Int, $minTimestamp: Int) {
    reinvestments(
      orderBy: timestamp
      orderDirection: desc
      first: 1000
      skip: $skip
      where: { timestamp_gt: $minTimestamp }
    ) {
      timestamp
      blockNumber
      transactionHash
      vault {
        id
      }
      rewardTokenSold {
        id
      }
      rewardAmountSold
      tokensReinvested
      tokensPerVaultShare
      underlyingAmountRealized
      vaultSharePrice
    }
    _meta {
      block {
        number
      }
    }
  }
` as unknown as DocumentNode<
  VaultReinvestmentQuery,
  VaultReinvestmentQueryVariables
>;






















export type Requester<C = {}, E = unknown> = <R, V>(doc: DocumentNode, vars?: V, options?: C) => Promise<R> | AsyncIterable<R>
export function getSdk<C, E>(requester: Requester<C, E>) {
  return {
    AccountBalanceStatement(
      variables: AccountBalanceStatementQueryVariables,
      options?: C
    ): Promise<AccountBalanceStatementQuery> {
      return requester<
        AccountBalanceStatementQuery,
        AccountBalanceStatementQueryVariables
      >(
        AccountBalanceStatementDocument,
        variables,
        options
      ) as Promise<AccountBalanceStatementQuery>;
    },
    AccountHoldingsHistorical(variables: AccountHoldingsHistoricalQueryVariables, options?: C): Promise<AccountHoldingsHistoricalQuery> {
      return requester<AccountHoldingsHistoricalQuery, AccountHoldingsHistoricalQueryVariables>(AccountHoldingsHistoricalDocument, variables, options) as Promise<AccountHoldingsHistoricalQuery>;
    },
    AccountTransactionHistory(variables: AccountTransactionHistoryQueryVariables, options?: C): Promise<AccountTransactionHistoryQuery> {
      return requester<AccountTransactionHistoryQuery, AccountTransactionHistoryQueryVariables>(AccountTransactionHistoryDocument, variables, options) as Promise<AccountTransactionHistoryQuery>;
    },
    ActiveAccounts(
      variables?: ActiveAccountsQueryVariables,
      options?: C
    ): Promise<ActiveAccountsQuery> {
      return requester<ActiveAccountsQuery, ActiveAccountsQueryVariables>(
        ActiveAccountsDocument,
        variables,
        options
      ) as Promise<ActiveAccountsQuery>;
    },
    AllAccounts(
      variables?: AllAccountsQueryVariables,
      options?: C
    ): Promise<AllAccountsQuery> {
      return requester<AllAccountsQuery, AllAccountsQueryVariables>(
        AllAccountsDocument,
        variables,
        options
      ) as Promise<AllAccountsQuery>;
    },
    AllConfiguration(
      variables?: AllConfigurationQueryVariables,
      options?: C
    ): Promise<AllConfigurationQuery> {
      return requester<AllConfigurationQuery, AllConfigurationQueryVariables>(
        AllConfigurationDocument,
        variables,
        options
      ) as Promise<AllConfigurationQuery>;
    },
    AllConfigurationByBlock(
      variables?: AllConfigurationByBlockQueryVariables,
      options?: C
    ): Promise<AllConfigurationByBlockQuery> {
      return requester<
        AllConfigurationByBlockQuery,
        AllConfigurationByBlockQueryVariables
      >(
        AllConfigurationByBlockDocument,
        variables,
        options
      ) as Promise<AllConfigurationByBlockQuery>;
    },
    AllOracles(
      variables: AllOraclesQueryVariables,
      options?: C
    ): Promise<AllOraclesQuery> {
      return requester<AllOraclesQuery, AllOraclesQueryVariables>(
        AllOraclesDocument,
        variables,
        options
      ) as Promise<AllOraclesQuery>;
    },
    AllOraclesByBlock(
      variables?: AllOraclesByBlockQueryVariables,
      options?: C
    ): Promise<AllOraclesByBlockQuery> {
      return requester<AllOraclesByBlockQuery, AllOraclesByBlockQueryVariables>(
        AllOraclesByBlockDocument,
        variables,
        options
      ) as Promise<AllOraclesByBlockQuery>;
    },
    AllTokens(
      variables?: AllTokensQueryVariables,
      options?: C
    ): Promise<AllTokensQuery> {
      return requester<AllTokensQuery, AllTokensQueryVariables>(
        AllTokensDocument,
        variables,
        options
      ) as Promise<AllTokensQuery>;
    },
    AllTokensByBlock(
      variables?: AllTokensByBlockQueryVariables,
      options?: C
    ): Promise<AllTokensByBlockQuery> {
      return requester<AllTokensByBlockQuery, AllTokensByBlockQueryVariables>(
        AllTokensByBlockDocument,
        variables,
        options
      ) as Promise<AllTokensByBlockQuery>;
    },
    AllVaultAccounts(
      variables: AllVaultAccountsQueryVariables,
      options?: C
    ): Promise<AllVaultAccountsQuery> {
      return requester<AllVaultAccountsQuery, AllVaultAccountsQueryVariables>(
        AllVaultAccountsDocument,
        variables,
        options
      ) as Promise<AllVaultAccountsQuery>;
    },
    AllVaults(
      variables?: AllVaultsQueryVariables,
      options?: C
    ): Promise<AllVaultsQuery> {
      return requester<AllVaultsQuery, AllVaultsQueryVariables>(
        AllVaultsDocument,
        variables,
        options
      ) as Promise<AllVaultsQuery>;
    },
    AllVaultsByBlock(
      variables?: AllVaultsByBlockQueryVariables,
      options?: C
    ): Promise<AllVaultsByBlockQuery> {
      return requester<AllVaultsByBlockQuery, AllVaultsByBlockQueryVariables>(
        AllVaultsByBlockDocument,
        variables,
        options
      ) as Promise<AllVaultsByBlockQuery>;
    },
    ExchangeRateValues(
      variables?: ExchangeRateValuesQueryVariables,
      options?: C
    ): Promise<ExchangeRateValuesQuery> {
      return requester<
        ExchangeRateValuesQuery,
        ExchangeRateValuesQueryVariables
      >(
        ExchangeRateValuesDocument,
        variables,
        options
      ) as Promise<ExchangeRateValuesQuery>;
    },
    ExternalLendingHistory(
      variables?: ExternalLendingHistoryQueryVariables,
      options?: C
    ): Promise<ExternalLendingHistoryQuery> {
      return requester<
        ExternalLendingHistoryQuery,
        ExternalLendingHistoryQueryVariables
      >(
        ExternalLendingHistoryDocument,
        variables,
        options
      ) as Promise<ExternalLendingHistoryQuery>;
    },
    HistoricalOracleValues(
      variables?: HistoricalOracleValuesQueryVariables,
      options?: C
    ): Promise<HistoricalOracleValuesQuery> {
      return requester<
        HistoricalOracleValuesQuery,
        HistoricalOracleValuesQueryVariables
      >(
        HistoricalOracleValuesDocument,
        variables,
        options
      ) as Promise<HistoricalOracleValuesQuery>;
    },
    HistoricalTradingActivity(
      variables?: HistoricalTradingActivityQueryVariables,
      options?: C
    ): Promise<HistoricalTradingActivityQuery> {
      return requester<
        HistoricalTradingActivityQuery,
        HistoricalTradingActivityQueryVariables
      >(
        HistoricalTradingActivityDocument,
        variables,
        options
      ) as Promise<HistoricalTradingActivityQuery>;
    },
    Meta(variables?: MetaQueryVariables, options?: C): Promise<MetaQuery> {
      return requester<MetaQuery, MetaQueryVariables>(
        MetaDocument,
        variables,
        options
      ) as Promise<MetaQuery>;
    },
    NetworkTransactionHistory(
      variables: NetworkTransactionHistoryQueryVariables,
      options?: C
    ): Promise<NetworkTransactionHistoryQuery> {
      return requester<
        NetworkTransactionHistoryQuery,
        NetworkTransactionHistoryQueryVariables
      >(
        NetworkTransactionHistoryDocument,
        variables,
        options
      ) as Promise<NetworkTransactionHistoryQuery>;
    },
    VaultReinvestment(
      variables?: VaultReinvestmentQueryVariables,
      options?: C
    ): Promise<VaultReinvestmentQuery> {
      return requester<VaultReinvestmentQuery, VaultReinvestmentQueryVariables>(
        VaultReinvestmentDocument,
        variables,
        options
      ) as Promise<VaultReinvestmentQuery>;
    },
  };
}
export type Sdk = ReturnType<typeof getSdk>;
