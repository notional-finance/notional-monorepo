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
import BlockTrackingTransform from "@graphprotocol/client-block-tracking";
import AutoPaginationTransform from "@graphprotocol/client-auto-pagination";
import BareMerger from "@graphql-mesh/merger-bare";
import { printWithCache } from '@graphql-mesh/utils';
import { createMeshHTTPHandler, MeshHTTPHandler } from '@graphql-mesh/http';
import { getMesh, ExecuteMeshFn, SubscribeMeshFn, MeshContext as BaseMeshContext, MeshInstance } from '@graphql-mesh/runtime';
import { MeshStore, FsStoreStorageAdapter } from '@graphql-mesh/store';
import { path as pathModule } from '@graphql-mesh/cross-helpers';
import { ImportFn } from '@graphql-mesh/types';
import type { NotionalV3Types } from './sources/NotionalV3/types';
import * as importedModule$0 from "./sources/NotionalV3/introspectionSchema";
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };



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
};

export type Account = {
  /** Address of Account */
  id: Scalars['ID'];
  firstUpdateBlockNumber: Scalars['Int'];
  firstUpdateTimestamp: Scalars['Int'];
  firstUpdateTransactionHash: Scalars['Bytes'];
  lastUpdateBlockNumber: Scalars['Int'];
  lastUpdateTimestamp: Scalars['Int'];
  lastUpdateTransactionHash: Scalars['Bytes'];
  systemAccountType: SystemAccount;
  /** All current balances linked to this account */
  balances?: Maybe<Array<Balance>>;
  /** All historical token transfers linked to this account */
  transfersFrom?: Maybe<Array<Transfer>>;
  transfersTo?: Maybe<Array<Transfer>>;
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

export type Account_filter = {
  id?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  firstUpdateBlockNumber?: InputMaybe<Scalars['Int']>;
  firstUpdateBlockNumber_not?: InputMaybe<Scalars['Int']>;
  firstUpdateBlockNumber_gt?: InputMaybe<Scalars['Int']>;
  firstUpdateBlockNumber_lt?: InputMaybe<Scalars['Int']>;
  firstUpdateBlockNumber_gte?: InputMaybe<Scalars['Int']>;
  firstUpdateBlockNumber_lte?: InputMaybe<Scalars['Int']>;
  firstUpdateBlockNumber_in?: InputMaybe<Array<Scalars['Int']>>;
  firstUpdateBlockNumber_not_in?: InputMaybe<Array<Scalars['Int']>>;
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
  lastUpdateBlockNumber?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_not?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_gt?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_lt?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_gte?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_lte?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_in?: InputMaybe<Array<Scalars['Int']>>;
  lastUpdateBlockNumber_not_in?: InputMaybe<Array<Scalars['Int']>>;
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
  transfersFrom_?: InputMaybe<Transfer_filter>;
  transfersTo_?: InputMaybe<Transfer_filter>;
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
  | 'transfersFrom'
  | 'transfersTo';

export type ActiveMarket = {
  /** Currency ID */
  id: Scalars['ID'];
  lastUpdateBlockNumber: Scalars['Int'];
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
  lastUpdateBlockNumber?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_not?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_gt?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_lt?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_gte?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_lte?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_in?: InputMaybe<Array<Scalars['Int']>>;
  lastUpdateBlockNumber_not_in?: InputMaybe<Array<Scalars['Int']>>;
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

export type Balance = {
  /** Address of Account:ID of Token */
  id: Scalars['ID'];
  /** Link back to the token */
  token: Token;
  /** Address of the account that holds this balance */
  account: Account;
  firstUpdateBlockNumber: Scalars['Int'];
  firstUpdateTimestamp: Scalars['Int'];
  firstUpdateTransactionHash: Scalars['Bytes'];
  lastUpdateBlockNumber: Scalars['Int'];
  lastUpdateTimestamp: Scalars['Int'];
  lastUpdateTransactionHash: Scalars['Bytes'];
  balance: Scalars['BigInt'];
};

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
  firstUpdateBlockNumber?: InputMaybe<Scalars['Int']>;
  firstUpdateBlockNumber_not?: InputMaybe<Scalars['Int']>;
  firstUpdateBlockNumber_gt?: InputMaybe<Scalars['Int']>;
  firstUpdateBlockNumber_lt?: InputMaybe<Scalars['Int']>;
  firstUpdateBlockNumber_gte?: InputMaybe<Scalars['Int']>;
  firstUpdateBlockNumber_lte?: InputMaybe<Scalars['Int']>;
  firstUpdateBlockNumber_in?: InputMaybe<Array<Scalars['Int']>>;
  firstUpdateBlockNumber_not_in?: InputMaybe<Array<Scalars['Int']>>;
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
  lastUpdateBlockNumber?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_not?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_gt?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_lt?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_gte?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_lte?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_in?: InputMaybe<Array<Scalars['Int']>>;
  lastUpdateBlockNumber_not_in?: InputMaybe<Array<Scalars['Int']>>;
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
  balance?: InputMaybe<Scalars['BigInt']>;
  balance_not?: InputMaybe<Scalars['BigInt']>;
  balance_gt?: InputMaybe<Scalars['BigInt']>;
  balance_lt?: InputMaybe<Scalars['BigInt']>;
  balance_gte?: InputMaybe<Scalars['BigInt']>;
  balance_lte?: InputMaybe<Scalars['BigInt']>;
  balance_in?: InputMaybe<Array<Scalars['BigInt']>>;
  balance_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
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
  | 'firstUpdateBlockNumber'
  | 'firstUpdateTimestamp'
  | 'firstUpdateTransactionHash'
  | 'lastUpdateBlockNumber'
  | 'lastUpdateTimestamp'
  | 'lastUpdateTransactionHash'
  | 'balance';

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
  lastUpdateBlockNumber: Scalars['Int'];
  lastUpdateTimestamp: Scalars['Int'];
  lastUpdateTransactionHash: Scalars['Bytes'];
  underlying?: Maybe<Token>;
  pCash?: Maybe<Token>;
  /** Some currencies will not allow prime debt */
  pDebt?: Maybe<Token>;
  maxUnderlyingSupply?: Maybe<Scalars['BigInt']>;
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
  /** Rebalancing targets */
  rebalancingTargets?: Maybe<Array<Scalars['Int']>>;
  /** Rebalancing cooldown */
  rebalancingCooldown?: Maybe<Scalars['Int']>;
  /** Proportion of deposits that go into each corresponding market */
  depositShares?: Maybe<Array<Scalars['Int']>>;
  /** Maximum market proportion that the nToken will provide liquidity at */
  leverageThresholds?: Maybe<Array<Scalars['Int']>>;
  /** Market proportions used during market initialization */
  proportions?: Maybe<Array<Scalars['Int']>>;
  deprecated_anchorRates?: Maybe<Array<Scalars['Int']>>;
  /** Annual incentive emission rate */
  incentiveEmissionRate?: Maybe<Scalars['BigInt']>;
  secondaryIncentiveRewarder?: Maybe<Scalars['Bytes']>;
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
  lastUpdateBlockNumber?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_not?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_gt?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_lt?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_gte?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_lte?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_in?: InputMaybe<Array<Scalars['Int']>>;
  lastUpdateBlockNumber_not_in?: InputMaybe<Array<Scalars['Int']>>;
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
  primeCashRateOracleTimeWindowSeconds_not_in?: InputMaybe<Array<Scalars['Int']>>;
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
  fCashLiquidationDebtBufferBasisPoints_not_in?: InputMaybe<Array<Scalars['Int']>>;
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
  rebalancingTargets?: InputMaybe<Array<Scalars['Int']>>;
  rebalancingTargets_not?: InputMaybe<Array<Scalars['Int']>>;
  rebalancingTargets_contains?: InputMaybe<Array<Scalars['Int']>>;
  rebalancingTargets_contains_nocase?: InputMaybe<Array<Scalars['Int']>>;
  rebalancingTargets_not_contains?: InputMaybe<Array<Scalars['Int']>>;
  rebalancingTargets_not_contains_nocase?: InputMaybe<Array<Scalars['Int']>>;
  rebalancingCooldown?: InputMaybe<Scalars['Int']>;
  rebalancingCooldown_not?: InputMaybe<Scalars['Int']>;
  rebalancingCooldown_gt?: InputMaybe<Scalars['Int']>;
  rebalancingCooldown_lt?: InputMaybe<Scalars['Int']>;
  rebalancingCooldown_gte?: InputMaybe<Scalars['Int']>;
  rebalancingCooldown_lte?: InputMaybe<Scalars['Int']>;
  rebalancingCooldown_in?: InputMaybe<Array<Scalars['Int']>>;
  rebalancingCooldown_not_in?: InputMaybe<Array<Scalars['Int']>>;
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
  deprecated_anchorRates_not_contains_nocase?: InputMaybe<Array<Scalars['Int']>>;
  incentiveEmissionRate?: InputMaybe<Scalars['BigInt']>;
  incentiveEmissionRate_not?: InputMaybe<Scalars['BigInt']>;
  incentiveEmissionRate_gt?: InputMaybe<Scalars['BigInt']>;
  incentiveEmissionRate_lt?: InputMaybe<Scalars['BigInt']>;
  incentiveEmissionRate_gte?: InputMaybe<Scalars['BigInt']>;
  incentiveEmissionRate_lte?: InputMaybe<Scalars['BigInt']>;
  incentiveEmissionRate_in?: InputMaybe<Array<Scalars['BigInt']>>;
  incentiveEmissionRate_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
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
  residualPurchaseIncentiveBasisPoints?: InputMaybe<Scalars['Int']>;
  residualPurchaseIncentiveBasisPoints_not?: InputMaybe<Scalars['Int']>;
  residualPurchaseIncentiveBasisPoints_gt?: InputMaybe<Scalars['Int']>;
  residualPurchaseIncentiveBasisPoints_lt?: InputMaybe<Scalars['Int']>;
  residualPurchaseIncentiveBasisPoints_gte?: InputMaybe<Scalars['Int']>;
  residualPurchaseIncentiveBasisPoints_lte?: InputMaybe<Scalars['Int']>;
  residualPurchaseIncentiveBasisPoints_in?: InputMaybe<Array<Scalars['Int']>>;
  residualPurchaseIncentiveBasisPoints_not_in?: InputMaybe<Array<Scalars['Int']>>;
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
  | 'rebalancingTargets'
  | 'rebalancingCooldown'
  | 'depositShares'
  | 'leverageThresholds'
  | 'proportions'
  | 'deprecated_anchorRates'
  | 'incentiveEmissionRate'
  | 'secondaryIncentiveRewarder'
  | 'residualPurchaseIncentiveBasisPoints'
  | 'residualPurchaseTimeBufferSeconds'
  | 'cashWithholdingBufferBasisPoints'
  | 'pvHaircutPercentage'
  | 'liquidationHaircutPercentage';

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
  blockNumber: Scalars['Int'];
  timestamp: Scalars['Int'];
  transaction?: Maybe<Transaction>;
  oracle: Oracle;
  rate: Scalars['BigInt'];
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
  blockNumber?: InputMaybe<Scalars['Int']>;
  blockNumber_not?: InputMaybe<Scalars['Int']>;
  blockNumber_gt?: InputMaybe<Scalars['Int']>;
  blockNumber_lt?: InputMaybe<Scalars['Int']>;
  blockNumber_gte?: InputMaybe<Scalars['Int']>;
  blockNumber_lte?: InputMaybe<Scalars['Int']>;
  blockNumber_in?: InputMaybe<Array<Scalars['Int']>>;
  blockNumber_not_in?: InputMaybe<Array<Scalars['Int']>>;
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
  | 'rate';

export type Incentive = {
  /** ID is the currency id */
  id: Scalars['ID'];
  lastUpdateBlockNumber: Scalars['Int'];
  lastUpdateTimestamp: Scalars['Int'];
  lastUpdateTransactionHash: Scalars['Bytes'];
  currencyConfiguration: CurrencyConfiguration;
  /** Current accumulated NOTE per nToken */
  accumulatedNOTEPerNToken?: Maybe<Scalars['BigInt']>;
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
};

export type Incentive_filter = {
  id?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  lastUpdateBlockNumber?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_not?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_gt?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_lt?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_gte?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_lte?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_in?: InputMaybe<Array<Scalars['Int']>>;
  lastUpdateBlockNumber_not_in?: InputMaybe<Array<Scalars['Int']>>;
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
  accumulatedNOTEPerNToken?: InputMaybe<Scalars['BigInt']>;
  accumulatedNOTEPerNToken_not?: InputMaybe<Scalars['BigInt']>;
  accumulatedNOTEPerNToken_gt?: InputMaybe<Scalars['BigInt']>;
  accumulatedNOTEPerNToken_lt?: InputMaybe<Scalars['BigInt']>;
  accumulatedNOTEPerNToken_gte?: InputMaybe<Scalars['BigInt']>;
  accumulatedNOTEPerNToken_lte?: InputMaybe<Scalars['BigInt']>;
  accumulatedNOTEPerNToken_in?: InputMaybe<Array<Scalars['BigInt']>>;
  accumulatedNOTEPerNToken_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
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
  | 'currencyConfiguration__rebalancingCooldown'
  | 'currencyConfiguration__incentiveEmissionRate'
  | 'currencyConfiguration__secondaryIncentiveRewarder'
  | 'currencyConfiguration__residualPurchaseIncentiveBasisPoints'
  | 'currencyConfiguration__residualPurchaseTimeBufferSeconds'
  | 'currencyConfiguration__cashWithholdingBufferBasisPoints'
  | 'currencyConfiguration__pvHaircutPercentage'
  | 'currencyConfiguration__liquidationHaircutPercentage'
  | 'accumulatedNOTEPerNToken'
  | 'deprecated_lastSupplyChangeTime'
  | 'deprecated_integralTotalSupply'
  | 'migrationEmissionRate'
  | 'finalIntegralTotalSupply'
  | 'migrationTime';

export type InterestRateCurve = {
  /** ID is the currency id:market index:true if current */
  id: Scalars['ID'];
  lastUpdateBlockNumber: Scalars['Int'];
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
  lastUpdateBlockNumber?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_not?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_gt?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_lt?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_gte?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_lte?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_in?: InputMaybe<Array<Scalars['Int']>>;
  lastUpdateBlockNumber_not_in?: InputMaybe<Array<Scalars['Int']>>;
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
  lastUpdateBlockNumber: Scalars['Int'];
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
  lastRefreshBlockNumber: Scalars['Int'];
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
  lastRefreshBlockNumber?: InputMaybe<Scalars['Int']>;
  lastRefreshBlockNumber_not?: InputMaybe<Scalars['Int']>;
  lastRefreshBlockNumber_gt?: InputMaybe<Scalars['Int']>;
  lastRefreshBlockNumber_lt?: InputMaybe<Scalars['Int']>;
  lastRefreshBlockNumber_gte?: InputMaybe<Scalars['Int']>;
  lastRefreshBlockNumber_lte?: InputMaybe<Scalars['Int']>;
  lastRefreshBlockNumber_in?: InputMaybe<Array<Scalars['Int']>>;
  lastRefreshBlockNumber_not_in?: InputMaybe<Array<Scalars['Int']>>;
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
  | 'MoneyMarketToUnderlyingOracleInterestRate'
  | 'PrimeCashToUnderlyingExchangeRate'
  | 'PrimeCashToMoneyMarketExchangeRate'
  | 'PrimeDebtToUnderlyingExchangeRate'
  | 'PrimeDebtToMoneyMarketExchangeRate'
  | 'MoneyMarketToUnderlyingExchangeRate'
  | 'VaultShareOracleRate'
  | 'nTokenToUnderlyingExchangeRate';

export type Oracle_filter = {
  id?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  lastUpdateBlockNumber?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_not?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_gt?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_lt?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_gte?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_lte?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_in?: InputMaybe<Array<Scalars['Int']>>;
  lastUpdateBlockNumber_not_in?: InputMaybe<Array<Scalars['Int']>>;
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
  | 'historicalRates';

/** Defines the order direction, either ascending or descending */
export type OrderDirection =
  | 'asc'
  | 'desc';

export type PrimeCashMarket = {
  /** Currency ID */
  id: Scalars['ID'];
  lastUpdateBlockNumber: Scalars['Int'];
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
  blockNumber: Scalars['Int'];
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
  /** Spot prime cash interest rate */
  supplyInterestRate?: Maybe<Scalars['Int']>;
  /** Spot prime debt interest rate */
  debtInterestRate?: Maybe<Scalars['Int']>;
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
  blockNumber?: InputMaybe<Scalars['Int']>;
  blockNumber_not?: InputMaybe<Scalars['Int']>;
  blockNumber_gt?: InputMaybe<Scalars['Int']>;
  blockNumber_lt?: InputMaybe<Scalars['Int']>;
  blockNumber_gte?: InputMaybe<Scalars['Int']>;
  blockNumber_lte?: InputMaybe<Scalars['Int']>;
  blockNumber_in?: InputMaybe<Array<Scalars['Int']>>;
  blockNumber_not_in?: InputMaybe<Array<Scalars['Int']>>;
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
  supplyInterestRate?: InputMaybe<Scalars['Int']>;
  supplyInterestRate_not?: InputMaybe<Scalars['Int']>;
  supplyInterestRate_gt?: InputMaybe<Scalars['Int']>;
  supplyInterestRate_lt?: InputMaybe<Scalars['Int']>;
  supplyInterestRate_gte?: InputMaybe<Scalars['Int']>;
  supplyInterestRate_lte?: InputMaybe<Scalars['Int']>;
  supplyInterestRate_in?: InputMaybe<Array<Scalars['Int']>>;
  supplyInterestRate_not_in?: InputMaybe<Array<Scalars['Int']>>;
  debtInterestRate?: InputMaybe<Scalars['Int']>;
  debtInterestRate_not?: InputMaybe<Scalars['Int']>;
  debtInterestRate_gt?: InputMaybe<Scalars['Int']>;
  debtInterestRate_lt?: InputMaybe<Scalars['Int']>;
  debtInterestRate_gte?: InputMaybe<Scalars['Int']>;
  debtInterestRate_lte?: InputMaybe<Scalars['Int']>;
  debtInterestRate_in?: InputMaybe<Array<Scalars['Int']>>;
  debtInterestRate_not_in?: InputMaybe<Array<Scalars['Int']>>;
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
  | 'debtInterestRate';

export type PrimeCashMarket_filter = {
  id?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  lastUpdateBlockNumber?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_not?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_gt?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_lt?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_gte?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_lte?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_in?: InputMaybe<Array<Scalars['Int']>>;
  lastUpdateBlockNumber_not_in?: InputMaybe<Array<Scalars['Int']>>;
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
  | 'snapshots';

export type Query = {
  token?: Maybe<Token>;
  tokens: Array<Token>;
  transfer?: Maybe<Transfer>;
  transfers: Array<Transfer>;
  transferBundle?: Maybe<TransferBundle>;
  transferBundles: Array<TransferBundle>;
  transaction?: Maybe<Transaction>;
  transactions: Array<Transaction>;
  account?: Maybe<Account>;
  accounts: Array<Account>;
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


export type Query_metaArgs = {
  block?: InputMaybe<Block_height>;
};

export type Subscription = {
  token?: Maybe<Token>;
  tokens: Array<Token>;
  transfer?: Maybe<Transfer>;
  transfers: Array<Transfer>;
  transferBundle?: Maybe<TransferBundle>;
  transferBundles: Array<TransferBundle>;
  transaction?: Maybe<Transaction>;
  transactions: Array<Transaction>;
  account?: Maybe<Account>;
  accounts: Array<Account>;
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
  | 'NOTE';

export type Token = {
  /**
   * ID space varies by token type:
   * - ERC20: token address
   * - ERC1155: `emitter address:tokenId`
   *
   */
  id: Scalars['ID'];
  firstUpdateBlockNumber: Scalars['Int'];
  firstUpdateTimestamp: Scalars['Int'];
  firstUpdateTransactionHash?: Maybe<Scalars['Bytes']>;
  lastUpdateBlockNumber: Scalars['Int'];
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
  maturity?: Maybe<Scalars['Int']>;
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
  firstUpdateBlockNumber?: InputMaybe<Scalars['Int']>;
  firstUpdateBlockNumber_not?: InputMaybe<Scalars['Int']>;
  firstUpdateBlockNumber_gt?: InputMaybe<Scalars['Int']>;
  firstUpdateBlockNumber_lt?: InputMaybe<Scalars['Int']>;
  firstUpdateBlockNumber_gte?: InputMaybe<Scalars['Int']>;
  firstUpdateBlockNumber_lte?: InputMaybe<Scalars['Int']>;
  firstUpdateBlockNumber_in?: InputMaybe<Array<Scalars['Int']>>;
  firstUpdateBlockNumber_not_in?: InputMaybe<Array<Scalars['Int']>>;
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
  lastUpdateBlockNumber?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_not?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_gt?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_lt?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_gte?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_lte?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_in?: InputMaybe<Array<Scalars['Int']>>;
  lastUpdateBlockNumber_not_in?: InputMaybe<Array<Scalars['Int']>>;
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
  maturity?: InputMaybe<Scalars['Int']>;
  maturity_not?: InputMaybe<Scalars['Int']>;
  maturity_gt?: InputMaybe<Scalars['Int']>;
  maturity_lt?: InputMaybe<Scalars['Int']>;
  maturity_gte?: InputMaybe<Scalars['Int']>;
  maturity_lte?: InputMaybe<Scalars['Int']>;
  maturity_in?: InputMaybe<Array<Scalars['Int']>>;
  maturity_not_in?: InputMaybe<Array<Scalars['Int']>>;
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
  lastUpdateBlockNumber: Scalars['Int'];
  lastUpdateTimestamp: Scalars['Int'];
  lastUpdateTransactionHash: Scalars['Bytes'];
  sender: Account;
  token: Token;
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
  lastUpdateBlockNumber?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_not?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_gt?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_lt?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_gte?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_lte?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_in?: InputMaybe<Array<Scalars['Int']>>;
  lastUpdateBlockNumber_not_in?: InputMaybe<Array<Scalars['Int']>>;
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
  | 'allowedDexes'
  | 'allowSell'
  | 'allowedTradeTypes';

export type Transaction = {
  /** Transaction Hash */
  id: Scalars['ID'];
  blockNumber: Scalars['Int'];
  timestamp: Scalars['Int'];
  transactionHash: Scalars['Bytes'];
  _transfers: Array<Transfer>;
  _transferBundles: Array<TransferBundle>;
  /** Internal index of the next index in _transfer to start scanning at */
  _nextStartIndex: Scalars['Int'];
  transfers?: Maybe<Array<Transfer>>;
  transferBundles?: Maybe<Array<TransferBundle>>;
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

export type Transaction_filter = {
  id?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  blockNumber?: InputMaybe<Scalars['Int']>;
  blockNumber_not?: InputMaybe<Scalars['Int']>;
  blockNumber_gt?: InputMaybe<Scalars['Int']>;
  blockNumber_lt?: InputMaybe<Scalars['Int']>;
  blockNumber_gte?: InputMaybe<Scalars['Int']>;
  blockNumber_lte?: InputMaybe<Scalars['Int']>;
  blockNumber_in?: InputMaybe<Array<Scalars['Int']>>;
  blockNumber_not_in?: InputMaybe<Array<Scalars['Int']>>;
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
  | 'transferBundles';

export type Transfer = {
  /** Transaction Hash:Log Index */
  id: Scalars['ID'];
  blockNumber: Scalars['Int'];
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
  maturity?: Maybe<Scalars['Int']>;
};

export type TransferBundle = {
  /** Transaction Hash:Start Log Index:End Log Index:Bundle Name */
  id: Scalars['ID'];
  blockNumber: Scalars['Int'];
  timestamp: Scalars['Int'];
  transactionHash: Transaction;
  bundleName: Scalars['String'];
  startLogIndex: Scalars['Int'];
  endLogIndex: Scalars['Int'];
  transfers: Array<Transfer>;
};


export type TransferBundletransfersArgs = {
  skip?: InputMaybe<Scalars['Int']>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Transfer_orderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  where?: InputMaybe<Transfer_filter>;
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
  blockNumber?: InputMaybe<Scalars['Int']>;
  blockNumber_not?: InputMaybe<Scalars['Int']>;
  blockNumber_gt?: InputMaybe<Scalars['Int']>;
  blockNumber_lt?: InputMaybe<Scalars['Int']>;
  blockNumber_gte?: InputMaybe<Scalars['Int']>;
  blockNumber_lte?: InputMaybe<Scalars['Int']>;
  blockNumber_in?: InputMaybe<Array<Scalars['Int']>>;
  blockNumber_not_in?: InputMaybe<Array<Scalars['Int']>>;
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
  | 'transfers';

export type TransferType =
  | 'Mint'
  | 'Burn'
  | 'Transfer';

export type Transfer_filter = {
  id?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  blockNumber?: InputMaybe<Scalars['Int']>;
  blockNumber_not?: InputMaybe<Scalars['Int']>;
  blockNumber_gt?: InputMaybe<Scalars['Int']>;
  blockNumber_lt?: InputMaybe<Scalars['Int']>;
  blockNumber_gte?: InputMaybe<Scalars['Int']>;
  blockNumber_lte?: InputMaybe<Scalars['Int']>;
  blockNumber_in?: InputMaybe<Array<Scalars['Int']>>;
  blockNumber_not_in?: InputMaybe<Array<Scalars['Int']>>;
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
  maturity?: InputMaybe<Scalars['Int']>;
  maturity_not?: InputMaybe<Scalars['Int']>;
  maturity_gt?: InputMaybe<Scalars['Int']>;
  maturity_lt?: InputMaybe<Scalars['Int']>;
  maturity_gte?: InputMaybe<Scalars['Int']>;
  maturity_lte?: InputMaybe<Scalars['Int']>;
  maturity_in?: InputMaybe<Array<Scalars['Int']>>;
  maturity_not_in?: InputMaybe<Array<Scalars['Int']>>;
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
  | 'to'
  | 'to__id'
  | 'to__firstUpdateBlockNumber'
  | 'to__firstUpdateTimestamp'
  | 'to__firstUpdateTransactionHash'
  | 'to__lastUpdateBlockNumber'
  | 'to__lastUpdateTimestamp'
  | 'to__lastUpdateTransactionHash'
  | 'to__systemAccountType'
  | 'operator'
  | 'operator__id'
  | 'operator__firstUpdateBlockNumber'
  | 'operator__firstUpdateTimestamp'
  | 'operator__firstUpdateTransactionHash'
  | 'operator__lastUpdateBlockNumber'
  | 'operator__lastUpdateTimestamp'
  | 'operator__lastUpdateTransactionHash'
  | 'operator__systemAccountType'
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

export type VaultConfiguration = {
  /** ID is the address of the vault */
  id: Scalars['ID'];
  lastUpdateBlockHash: Scalars['Bytes'];
  lastUpdateBlockNumber: Scalars['Int'];
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
  lastUpdateBlockNumber?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_not?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_gt?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_lt?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_gte?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_lte?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_in?: InputMaybe<Array<Scalars['Int']>>;
  lastUpdateBlockNumber_not_in?: InputMaybe<Array<Scalars['Int']>>;
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
  maxDeleverageCollateralRatioBasisPoints_in?: InputMaybe<Array<Scalars['Int']>>;
  maxDeleverageCollateralRatioBasisPoints_not_in?: InputMaybe<Array<Scalars['Int']>>;
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
  secondaryBorrowCurrencies_contains_nocase?: InputMaybe<Array<Scalars['String']>>;
  secondaryBorrowCurrencies_not_contains?: InputMaybe<Array<Scalars['String']>>;
  secondaryBorrowCurrencies_not_contains_nocase?: InputMaybe<Array<Scalars['String']>>;
  secondaryBorrowCurrencies_?: InputMaybe<Token_filter>;
  maxRequiredAccountCollateralRatioBasisPoints?: InputMaybe<Scalars['Int']>;
  maxRequiredAccountCollateralRatioBasisPoints_not?: InputMaybe<Scalars['Int']>;
  maxRequiredAccountCollateralRatioBasisPoints_gt?: InputMaybe<Scalars['Int']>;
  maxRequiredAccountCollateralRatioBasisPoints_lt?: InputMaybe<Scalars['Int']>;
  maxRequiredAccountCollateralRatioBasisPoints_gte?: InputMaybe<Scalars['Int']>;
  maxRequiredAccountCollateralRatioBasisPoints_lte?: InputMaybe<Scalars['Int']>;
  maxRequiredAccountCollateralRatioBasisPoints_in?: InputMaybe<Array<Scalars['Int']>>;
  maxRequiredAccountCollateralRatioBasisPoints_not_in?: InputMaybe<Array<Scalars['Int']>>;
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
  maxSecondaryBorrowCapacity_contains_nocase?: InputMaybe<Array<Scalars['BigInt']>>;
  maxSecondaryBorrowCapacity_not_contains?: InputMaybe<Array<Scalars['BigInt']>>;
  maxSecondaryBorrowCapacity_not_contains_nocase?: InputMaybe<Array<Scalars['BigInt']>>;
  totalUsedSecondaryBorrowCapacity?: InputMaybe<Array<Scalars['BigInt']>>;
  totalUsedSecondaryBorrowCapacity_not?: InputMaybe<Array<Scalars['BigInt']>>;
  totalUsedSecondaryBorrowCapacity_contains?: InputMaybe<Array<Scalars['BigInt']>>;
  totalUsedSecondaryBorrowCapacity_contains_nocase?: InputMaybe<Array<Scalars['BigInt']>>;
  totalUsedSecondaryBorrowCapacity_not_contains?: InputMaybe<Array<Scalars['BigInt']>>;
  totalUsedSecondaryBorrowCapacity_not_contains_nocase?: InputMaybe<Array<Scalars['BigInt']>>;
  minAccountSecondaryBorrow?: InputMaybe<Array<Scalars['BigInt']>>;
  minAccountSecondaryBorrow_not?: InputMaybe<Array<Scalars['BigInt']>>;
  minAccountSecondaryBorrow_contains?: InputMaybe<Array<Scalars['BigInt']>>;
  minAccountSecondaryBorrow_contains_nocase?: InputMaybe<Array<Scalars['BigInt']>>;
  minAccountSecondaryBorrow_not_contains?: InputMaybe<Array<Scalars['BigInt']>>;
  minAccountSecondaryBorrow_not_contains_nocase?: InputMaybe<Array<Scalars['BigInt']>>;
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

/** All maturities of this strategy vault */
export type WhitelistedCapability =
  | 'GlobalTransferOperator'
  | 'AuthorizedCallbackContract';

export type WhitelistedContract = {
  id: Scalars['ID'];
  lastUpdateBlockNumber: Scalars['Int'];
  lastUpdateTimestamp: Scalars['Int'];
  lastUpdateTransactionHash: Scalars['Bytes'];
  capability: Array<WhitelistedCapability>;
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
  lastUpdateBlockNumber?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_not?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_gt?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_lt?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_gte?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_lte?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_in?: InputMaybe<Array<Scalars['Int']>>;
  lastUpdateBlockNumber_not_in?: InputMaybe<Array<Scalars['Int']>>;
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
  | 'capability';

export type _Block_ = {
  /** The hash of the block */
  hash?: Maybe<Scalars['Bytes']>;
  /** The block number */
  number: Scalars['Int'];
  /** Integer representation of the timestamp stored in blocks for the chain */
  timestamp?: Maybe<Scalars['Int']>;
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
  lastUpdateBlockNumber: Scalars['Int'];
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
  blockNumber: Scalars['Int'];
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
  blockNumber?: InputMaybe<Scalars['Int']>;
  blockNumber_not?: InputMaybe<Scalars['Int']>;
  blockNumber_gt?: InputMaybe<Scalars['Int']>;
  blockNumber_lt?: InputMaybe<Scalars['Int']>;
  blockNumber_gte?: InputMaybe<Scalars['Int']>;
  blockNumber_lte?: InputMaybe<Scalars['Int']>;
  blockNumber_in?: InputMaybe<Array<Scalars['Int']>>;
  blockNumber_not_in?: InputMaybe<Array<Scalars['Int']>>;
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
  totalfCashDebtOutstandingPresentValue_in?: InputMaybe<Array<Scalars['BigInt']>>;
  totalfCashDebtOutstandingPresentValue_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
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
  lastUpdateBlockNumber?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_not?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_gt?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_lt?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_gte?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_lte?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_in?: InputMaybe<Array<Scalars['Int']>>;
  lastUpdateBlockNumber_not_in?: InputMaybe<Array<Scalars['Int']>>;
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
  ActiveMarket: ResolverTypeWrapper<ActiveMarket>;
  ActiveMarket_filter: ActiveMarket_filter;
  ActiveMarket_orderBy: ActiveMarket_orderBy;
  Balance: ResolverTypeWrapper<Balance>;
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
  Float: ResolverTypeWrapper<Scalars['Float']>;
  ID: ResolverTypeWrapper<Scalars['ID']>;
  Incentive: ResolverTypeWrapper<Incentive>;
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
  Query: ResolverTypeWrapper<{}>;
  String: ResolverTypeWrapper<Scalars['String']>;
  Subscription: ResolverTypeWrapper<{}>;
  SystemAccount: SystemAccount;
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
}>;

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = ResolversObject<{
  Account: Account;
  Account_filter: Account_filter;
  ActiveMarket: ActiveMarket;
  ActiveMarket_filter: ActiveMarket_filter;
  Balance: Balance;
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
  Float: Scalars['Float'];
  ID: Scalars['ID'];
  Incentive: Incentive;
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
  Query: {};
  String: Scalars['String'];
  Subscription: {};
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
}>;

export type entityDirectiveArgs = { };

export type entityDirectiveResolver<Result, Parent, ContextType = MeshContext & { chainName: string }, Args = entityDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type subgraphIdDirectiveArgs = {
  id: Scalars['String'];
};

export type subgraphIdDirectiveResolver<Result, Parent, ContextType = MeshContext & { chainName: string }, Args = subgraphIdDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type derivedFromDirectiveArgs = {
  field: Scalars['String'];
};

export type derivedFromDirectiveResolver<Result, Parent, ContextType = MeshContext & { chainName: string }, Args = derivedFromDirectiveArgs> = DirectiveResolverFn<Result, Parent, ContextType, Args>;

export type AccountResolvers<ContextType = MeshContext & { chainName: string }, ParentType extends ResolversParentTypes['Account'] = ResolversParentTypes['Account']> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  firstUpdateBlockNumber?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  firstUpdateTimestamp?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  firstUpdateTransactionHash?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  lastUpdateBlockNumber?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  lastUpdateTimestamp?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  lastUpdateTransactionHash?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  systemAccountType?: Resolver<ResolversTypes['SystemAccount'], ParentType, ContextType>;
  balances?: Resolver<Maybe<Array<ResolversTypes['Balance']>>, ParentType, ContextType, RequireFields<AccountbalancesArgs, 'skip' | 'first'>>;
  transfersFrom?: Resolver<Maybe<Array<ResolversTypes['Transfer']>>, ParentType, ContextType, RequireFields<AccounttransfersFromArgs, 'skip' | 'first'>>;
  transfersTo?: Resolver<Maybe<Array<ResolversTypes['Transfer']>>, ParentType, ContextType, RequireFields<AccounttransfersToArgs, 'skip' | 'first'>>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ActiveMarketResolvers<ContextType = MeshContext & { chainName: string }, ParentType extends ResolversParentTypes['ActiveMarket'] = ResolversParentTypes['ActiveMarket']> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  lastUpdateBlockNumber?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  lastUpdateTimestamp?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  lastUpdateTransaction?: Resolver<Maybe<ResolversTypes['Transaction']>, ParentType, ContextType>;
  underlying?: Resolver<ResolversTypes['Token'], ParentType, ContextType>;
  pCashMarket?: Resolver<ResolversTypes['PrimeCashMarket'], ParentType, ContextType>;
  fCashMarkets?: Resolver<Array<ResolversTypes['fCashMarket']>, ParentType, ContextType, RequireFields<ActiveMarketfCashMarketsArgs, 'skip' | 'first'>>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type BalanceResolvers<ContextType = MeshContext & { chainName: string }, ParentType extends ResolversParentTypes['Balance'] = ResolversParentTypes['Balance']> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  token?: Resolver<ResolversTypes['Token'], ParentType, ContextType>;
  account?: Resolver<ResolversTypes['Account'], ParentType, ContextType>;
  firstUpdateBlockNumber?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  firstUpdateTimestamp?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  firstUpdateTransactionHash?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  lastUpdateBlockNumber?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  lastUpdateTimestamp?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  lastUpdateTransactionHash?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  balance?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
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

export type CurrencyConfigurationResolvers<ContextType = MeshContext & { chainName: string }, ParentType extends ResolversParentTypes['CurrencyConfiguration'] = ResolversParentTypes['CurrencyConfiguration']> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  lastUpdateBlockNumber?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  lastUpdateTimestamp?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  lastUpdateTransactionHash?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  underlying?: Resolver<Maybe<ResolversTypes['Token']>, ParentType, ContextType>;
  pCash?: Resolver<Maybe<ResolversTypes['Token']>, ParentType, ContextType>;
  pDebt?: Resolver<Maybe<ResolversTypes['Token']>, ParentType, ContextType>;
  maxUnderlyingSupply?: Resolver<Maybe<ResolversTypes['BigInt']>, ParentType, ContextType>;
  collateralHaircut?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  debtBuffer?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  liquidationDiscount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  primeCashRateOracleTimeWindowSeconds?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  primeCashHoldingsOracle?: Resolver<Maybe<ResolversTypes['Bytes']>, ParentType, ContextType>;
  primeCashCurve?: Resolver<Maybe<ResolversTypes['InterestRateCurve']>, ParentType, ContextType>;
  primeDebtAllowed?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  fCashRateOracleTimeWindowSeconds?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  fCashReserveFeeSharePercent?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  fCashDebtBufferBasisPoints?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  fCashHaircutBasisPoints?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  fCashMinOracleRate?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  fCashMaxOracleRate?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  fCashMaxDiscountFactor?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  fCashLiquidationHaircutBasisPoints?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  fCashLiquidationDebtBufferBasisPoints?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  fCashActiveCurves?: Resolver<Maybe<Array<ResolversTypes['InterestRateCurve']>>, ParentType, ContextType, RequireFields<CurrencyConfigurationfCashActiveCurvesArgs, 'skip' | 'first'>>;
  fCashNextCurves?: Resolver<Maybe<Array<ResolversTypes['InterestRateCurve']>>, ParentType, ContextType, RequireFields<CurrencyConfigurationfCashNextCurvesArgs, 'skip' | 'first'>>;
  treasuryReserveBuffer?: Resolver<Maybe<ResolversTypes['BigInt']>, ParentType, ContextType>;
  primeCashHoldings?: Resolver<Maybe<Array<ResolversTypes['Bytes']>>, ParentType, ContextType>;
  rebalancingTargets?: Resolver<Maybe<Array<ResolversTypes['Int']>>, ParentType, ContextType>;
  rebalancingCooldown?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  depositShares?: Resolver<Maybe<Array<ResolversTypes['Int']>>, ParentType, ContextType>;
  leverageThresholds?: Resolver<Maybe<Array<ResolversTypes['Int']>>, ParentType, ContextType>;
  proportions?: Resolver<Maybe<Array<ResolversTypes['Int']>>, ParentType, ContextType>;
  deprecated_anchorRates?: Resolver<Maybe<Array<ResolversTypes['Int']>>, ParentType, ContextType>;
  incentiveEmissionRate?: Resolver<Maybe<ResolversTypes['BigInt']>, ParentType, ContextType>;
  secondaryIncentiveRewarder?: Resolver<Maybe<ResolversTypes['Bytes']>, ParentType, ContextType>;
  residualPurchaseIncentiveBasisPoints?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  residualPurchaseTimeBufferSeconds?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  cashWithholdingBufferBasisPoints?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  pvHaircutPercentage?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  liquidationHaircutPercentage?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type ExchangeRateResolvers<ContextType = MeshContext & { chainName: string }, ParentType extends ResolversParentTypes['ExchangeRate'] = ResolversParentTypes['ExchangeRate']> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  blockNumber?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  timestamp?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  transaction?: Resolver<Maybe<ResolversTypes['Transaction']>, ParentType, ContextType>;
  oracle?: Resolver<ResolversTypes['Oracle'], ParentType, ContextType>;
  rate?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type IncentiveResolvers<ContextType = MeshContext & { chainName: string }, ParentType extends ResolversParentTypes['Incentive'] = ResolversParentTypes['Incentive']> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  lastUpdateBlockNumber?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  lastUpdateTimestamp?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  lastUpdateTransactionHash?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  currencyConfiguration?: Resolver<ResolversTypes['CurrencyConfiguration'], ParentType, ContextType>;
  accumulatedNOTEPerNToken?: Resolver<Maybe<ResolversTypes['BigInt']>, ParentType, ContextType>;
  deprecated_lastSupplyChangeTime?: Resolver<Maybe<ResolversTypes['BigInt']>, ParentType, ContextType>;
  deprecated_integralTotalSupply?: Resolver<Maybe<ResolversTypes['BigInt']>, ParentType, ContextType>;
  migrationEmissionRate?: Resolver<Maybe<ResolversTypes['BigInt']>, ParentType, ContextType>;
  finalIntegralTotalSupply?: Resolver<Maybe<ResolversTypes['BigInt']>, ParentType, ContextType>;
  migrationTime?: Resolver<Maybe<ResolversTypes['BigInt']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export interface Int8ScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['Int8'], any> {
  name: 'Int8';
}

export type InterestRateCurveResolvers<ContextType = MeshContext & { chainName: string }, ParentType extends ResolversParentTypes['InterestRateCurve'] = ResolversParentTypes['InterestRateCurve']> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  lastUpdateBlockNumber?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  lastUpdateTimestamp?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  lastUpdateTransactionHash?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
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

export type OracleResolvers<ContextType = MeshContext & { chainName: string }, ParentType extends ResolversParentTypes['Oracle'] = ResolversParentTypes['Oracle']> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  lastUpdateBlockNumber?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  lastUpdateTimestamp?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  lastUpdateTransaction?: Resolver<Maybe<ResolversTypes['Transaction']>, ParentType, ContextType>;
  base?: Resolver<ResolversTypes['Token'], ParentType, ContextType>;
  quote?: Resolver<ResolversTypes['Token'], ParentType, ContextType>;
  decimals?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  ratePrecision?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  oracleAddress?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  oracleType?: Resolver<ResolversTypes['OracleType'], ParentType, ContextType>;
  mustInvert?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  latestRate?: Resolver<Maybe<ResolversTypes['BigInt']>, ParentType, ContextType>;
  historicalRates?: Resolver<Maybe<Array<ResolversTypes['ExchangeRate']>>, ParentType, ContextType, RequireFields<OraclehistoricalRatesArgs, 'skip' | 'first'>>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type OracleRegistryResolvers<ContextType = MeshContext & { chainName: string }, ParentType extends ResolversParentTypes['OracleRegistry'] = ResolversParentTypes['OracleRegistry']> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  lastRefreshBlockNumber?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  lastRefreshTimestamp?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  chainlinkOracles?: Resolver<Array<ResolversTypes['Oracle']>, ParentType, ContextType, RequireFields<OracleRegistrychainlinkOraclesArgs, 'skip' | 'first'>>;
  fCashEnabled?: Resolver<Array<ResolversTypes['Token']>, ParentType, ContextType, RequireFields<OracleRegistryfCashEnabledArgs, 'skip' | 'first'>>;
  listedVaults?: Resolver<Array<ResolversTypes['Bytes']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type PrimeCashMarketResolvers<ContextType = MeshContext & { chainName: string }, ParentType extends ResolversParentTypes['PrimeCashMarket'] = ResolversParentTypes['PrimeCashMarket']> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  lastUpdateBlockNumber?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  lastUpdateTimestamp?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  lastUpdateTransaction?: Resolver<Maybe<ResolversTypes['Transaction']>, ParentType, ContextType>;
  underlying?: Resolver<ResolversTypes['Token'], ParentType, ContextType>;
  primeCash?: Resolver<ResolversTypes['Token'], ParentType, ContextType>;
  primeDebt?: Resolver<Maybe<ResolversTypes['Token']>, ParentType, ContextType>;
  current?: Resolver<ResolversTypes['PrimeCashMarketSnapshot'], ParentType, ContextType>;
  snapshots?: Resolver<Maybe<Array<ResolversTypes['PrimeCashMarketSnapshot']>>, ParentType, ContextType, RequireFields<PrimeCashMarketsnapshotsArgs, 'skip' | 'first'>>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type PrimeCashMarketSnapshotResolvers<ContextType = MeshContext & { chainName: string }, ParentType extends ResolversParentTypes['PrimeCashMarketSnapshot'] = ResolversParentTypes['PrimeCashMarketSnapshot']> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  blockNumber?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  timestamp?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  transaction?: Resolver<Maybe<ResolversTypes['Transaction']>, ParentType, ContextType>;
  market?: Resolver<ResolversTypes['PrimeCashMarket'], ParentType, ContextType>;
  totalPrimeCash?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  totalPrimeDebt?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  totalUnderlyingHeld?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  totalPrimeCashInUnderlying?: Resolver<Maybe<ResolversTypes['BigInt']>, ParentType, ContextType>;
  totalPrimeDebtInUnderlying?: Resolver<Maybe<ResolversTypes['BigInt']>, ParentType, ContextType>;
  supplyScalar?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  debtScalar?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  underlyingScalar?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  supplyInterestRate?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  debtInterestRate?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type QueryResolvers<ContextType = MeshContext & { chainName: string }, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = ResolversObject<{
  token?: Resolver<Maybe<ResolversTypes['Token']>, ParentType, ContextType, RequireFields<QuerytokenArgs, 'id' | 'subgraphError'>>;
  tokens?: Resolver<Array<ResolversTypes['Token']>, ParentType, ContextType, RequireFields<QuerytokensArgs, 'skip' | 'first' | 'subgraphError'>>;
  transfer?: Resolver<Maybe<ResolversTypes['Transfer']>, ParentType, ContextType, RequireFields<QuerytransferArgs, 'id' | 'subgraphError'>>;
  transfers?: Resolver<Array<ResolversTypes['Transfer']>, ParentType, ContextType, RequireFields<QuerytransfersArgs, 'skip' | 'first' | 'subgraphError'>>;
  transferBundle?: Resolver<Maybe<ResolversTypes['TransferBundle']>, ParentType, ContextType, RequireFields<QuerytransferBundleArgs, 'id' | 'subgraphError'>>;
  transferBundles?: Resolver<Array<ResolversTypes['TransferBundle']>, ParentType, ContextType, RequireFields<QuerytransferBundlesArgs, 'skip' | 'first' | 'subgraphError'>>;
  transaction?: Resolver<Maybe<ResolversTypes['Transaction']>, ParentType, ContextType, RequireFields<QuerytransactionArgs, 'id' | 'subgraphError'>>;
  transactions?: Resolver<Array<ResolversTypes['Transaction']>, ParentType, ContextType, RequireFields<QuerytransactionsArgs, 'skip' | 'first' | 'subgraphError'>>;
  account?: Resolver<Maybe<ResolversTypes['Account']>, ParentType, ContextType, RequireFields<QueryaccountArgs, 'id' | 'subgraphError'>>;
  accounts?: Resolver<Array<ResolversTypes['Account']>, ParentType, ContextType, RequireFields<QueryaccountsArgs, 'skip' | 'first' | 'subgraphError'>>;
  oracleRegistry?: Resolver<Maybe<ResolversTypes['OracleRegistry']>, ParentType, ContextType, RequireFields<QueryoracleRegistryArgs, 'id' | 'subgraphError'>>;
  oracleRegistries?: Resolver<Array<ResolversTypes['OracleRegistry']>, ParentType, ContextType, RequireFields<QueryoracleRegistriesArgs, 'skip' | 'first' | 'subgraphError'>>;
  oracle?: Resolver<Maybe<ResolversTypes['Oracle']>, ParentType, ContextType, RequireFields<QueryoracleArgs, 'id' | 'subgraphError'>>;
  oracles?: Resolver<Array<ResolversTypes['Oracle']>, ParentType, ContextType, RequireFields<QueryoraclesArgs, 'skip' | 'first' | 'subgraphError'>>;
  exchangeRate?: Resolver<Maybe<ResolversTypes['ExchangeRate']>, ParentType, ContextType, RequireFields<QueryexchangeRateArgs, 'id' | 'subgraphError'>>;
  exchangeRates?: Resolver<Array<ResolversTypes['ExchangeRate']>, ParentType, ContextType, RequireFields<QueryexchangeRatesArgs, 'skip' | 'first' | 'subgraphError'>>;
  currencyConfiguration?: Resolver<Maybe<ResolversTypes['CurrencyConfiguration']>, ParentType, ContextType, RequireFields<QuerycurrencyConfigurationArgs, 'id' | 'subgraphError'>>;
  currencyConfigurations?: Resolver<Array<ResolversTypes['CurrencyConfiguration']>, ParentType, ContextType, RequireFields<QuerycurrencyConfigurationsArgs, 'skip' | 'first' | 'subgraphError'>>;
  interestRateCurve?: Resolver<Maybe<ResolversTypes['InterestRateCurve']>, ParentType, ContextType, RequireFields<QueryinterestRateCurveArgs, 'id' | 'subgraphError'>>;
  interestRateCurves?: Resolver<Array<ResolversTypes['InterestRateCurve']>, ParentType, ContextType, RequireFields<QueryinterestRateCurvesArgs, 'skip' | 'first' | 'subgraphError'>>;
  vaultConfiguration?: Resolver<Maybe<ResolversTypes['VaultConfiguration']>, ParentType, ContextType, RequireFields<QueryvaultConfigurationArgs, 'id' | 'subgraphError'>>;
  vaultConfigurations?: Resolver<Array<ResolversTypes['VaultConfiguration']>, ParentType, ContextType, RequireFields<QueryvaultConfigurationsArgs, 'skip' | 'first' | 'subgraphError'>>;
  whitelistedContract?: Resolver<Maybe<ResolversTypes['WhitelistedContract']>, ParentType, ContextType, RequireFields<QuerywhitelistedContractArgs, 'id' | 'subgraphError'>>;
  whitelistedContracts?: Resolver<Array<ResolversTypes['WhitelistedContract']>, ParentType, ContextType, RequireFields<QuerywhitelistedContractsArgs, 'skip' | 'first' | 'subgraphError'>>;
  balance?: Resolver<Maybe<ResolversTypes['Balance']>, ParentType, ContextType, RequireFields<QuerybalanceArgs, 'id' | 'subgraphError'>>;
  balances?: Resolver<Array<ResolversTypes['Balance']>, ParentType, ContextType, RequireFields<QuerybalancesArgs, 'skip' | 'first' | 'subgraphError'>>;
  activeMarket?: Resolver<Maybe<ResolversTypes['ActiveMarket']>, ParentType, ContextType, RequireFields<QueryactiveMarketArgs, 'id' | 'subgraphError'>>;
  activeMarkets?: Resolver<Array<ResolversTypes['ActiveMarket']>, ParentType, ContextType, RequireFields<QueryactiveMarketsArgs, 'skip' | 'first' | 'subgraphError'>>;
  primeCashMarket?: Resolver<Maybe<ResolversTypes['PrimeCashMarket']>, ParentType, ContextType, RequireFields<QueryprimeCashMarketArgs, 'id' | 'subgraphError'>>;
  primeCashMarkets?: Resolver<Array<ResolversTypes['PrimeCashMarket']>, ParentType, ContextType, RequireFields<QueryprimeCashMarketsArgs, 'skip' | 'first' | 'subgraphError'>>;
  primeCashMarketSnapshot?: Resolver<Maybe<ResolversTypes['PrimeCashMarketSnapshot']>, ParentType, ContextType, RequireFields<QueryprimeCashMarketSnapshotArgs, 'id' | 'subgraphError'>>;
  primeCashMarketSnapshots?: Resolver<Array<ResolversTypes['PrimeCashMarketSnapshot']>, ParentType, ContextType, RequireFields<QueryprimeCashMarketSnapshotsArgs, 'skip' | 'first' | 'subgraphError'>>;
  fCashMarket?: Resolver<Maybe<ResolversTypes['fCashMarket']>, ParentType, ContextType, RequireFields<QueryfCashMarketArgs, 'id' | 'subgraphError'>>;
  fCashMarkets?: Resolver<Array<ResolversTypes['fCashMarket']>, ParentType, ContextType, RequireFields<QueryfCashMarketsArgs, 'skip' | 'first' | 'subgraphError'>>;
  fCashMarketSnapshot?: Resolver<Maybe<ResolversTypes['fCashMarketSnapshot']>, ParentType, ContextType, RequireFields<QueryfCashMarketSnapshotArgs, 'id' | 'subgraphError'>>;
  fCashMarketSnapshots?: Resolver<Array<ResolversTypes['fCashMarketSnapshot']>, ParentType, ContextType, RequireFields<QueryfCashMarketSnapshotsArgs, 'skip' | 'first' | 'subgraphError'>>;
  incentive?: Resolver<Maybe<ResolversTypes['Incentive']>, ParentType, ContextType, RequireFields<QueryincentiveArgs, 'id' | 'subgraphError'>>;
  incentives?: Resolver<Array<ResolversTypes['Incentive']>, ParentType, ContextType, RequireFields<QueryincentivesArgs, 'skip' | 'first' | 'subgraphError'>>;
  tradingModulePermission?: Resolver<Maybe<ResolversTypes['TradingModulePermission']>, ParentType, ContextType, RequireFields<QuerytradingModulePermissionArgs, 'id' | 'subgraphError'>>;
  tradingModulePermissions?: Resolver<Array<ResolversTypes['TradingModulePermission']>, ParentType, ContextType, RequireFields<QuerytradingModulePermissionsArgs, 'skip' | 'first' | 'subgraphError'>>;
  _meta?: Resolver<Maybe<ResolversTypes['_Meta_']>, ParentType, ContextType, Partial<Query_metaArgs>>;
}>;

export type SubscriptionResolvers<ContextType = MeshContext & { chainName: string }, ParentType extends ResolversParentTypes['Subscription'] = ResolversParentTypes['Subscription']> = ResolversObject<{
  token?: SubscriptionResolver<Maybe<ResolversTypes['Token']>, "token", ParentType, ContextType, RequireFields<SubscriptiontokenArgs, 'id' | 'subgraphError'>>;
  tokens?: SubscriptionResolver<Array<ResolversTypes['Token']>, "tokens", ParentType, ContextType, RequireFields<SubscriptiontokensArgs, 'skip' | 'first' | 'subgraphError'>>;
  transfer?: SubscriptionResolver<Maybe<ResolversTypes['Transfer']>, "transfer", ParentType, ContextType, RequireFields<SubscriptiontransferArgs, 'id' | 'subgraphError'>>;
  transfers?: SubscriptionResolver<Array<ResolversTypes['Transfer']>, "transfers", ParentType, ContextType, RequireFields<SubscriptiontransfersArgs, 'skip' | 'first' | 'subgraphError'>>;
  transferBundle?: SubscriptionResolver<Maybe<ResolversTypes['TransferBundle']>, "transferBundle", ParentType, ContextType, RequireFields<SubscriptiontransferBundleArgs, 'id' | 'subgraphError'>>;
  transferBundles?: SubscriptionResolver<Array<ResolversTypes['TransferBundle']>, "transferBundles", ParentType, ContextType, RequireFields<SubscriptiontransferBundlesArgs, 'skip' | 'first' | 'subgraphError'>>;
  transaction?: SubscriptionResolver<Maybe<ResolversTypes['Transaction']>, "transaction", ParentType, ContextType, RequireFields<SubscriptiontransactionArgs, 'id' | 'subgraphError'>>;
  transactions?: SubscriptionResolver<Array<ResolversTypes['Transaction']>, "transactions", ParentType, ContextType, RequireFields<SubscriptiontransactionsArgs, 'skip' | 'first' | 'subgraphError'>>;
  account?: SubscriptionResolver<Maybe<ResolversTypes['Account']>, "account", ParentType, ContextType, RequireFields<SubscriptionaccountArgs, 'id' | 'subgraphError'>>;
  accounts?: SubscriptionResolver<Array<ResolversTypes['Account']>, "accounts", ParentType, ContextType, RequireFields<SubscriptionaccountsArgs, 'skip' | 'first' | 'subgraphError'>>;
  oracleRegistry?: SubscriptionResolver<Maybe<ResolversTypes['OracleRegistry']>, "oracleRegistry", ParentType, ContextType, RequireFields<SubscriptionoracleRegistryArgs, 'id' | 'subgraphError'>>;
  oracleRegistries?: SubscriptionResolver<Array<ResolversTypes['OracleRegistry']>, "oracleRegistries", ParentType, ContextType, RequireFields<SubscriptionoracleRegistriesArgs, 'skip' | 'first' | 'subgraphError'>>;
  oracle?: SubscriptionResolver<Maybe<ResolversTypes['Oracle']>, "oracle", ParentType, ContextType, RequireFields<SubscriptionoracleArgs, 'id' | 'subgraphError'>>;
  oracles?: SubscriptionResolver<Array<ResolversTypes['Oracle']>, "oracles", ParentType, ContextType, RequireFields<SubscriptionoraclesArgs, 'skip' | 'first' | 'subgraphError'>>;
  exchangeRate?: SubscriptionResolver<Maybe<ResolversTypes['ExchangeRate']>, "exchangeRate", ParentType, ContextType, RequireFields<SubscriptionexchangeRateArgs, 'id' | 'subgraphError'>>;
  exchangeRates?: SubscriptionResolver<Array<ResolversTypes['ExchangeRate']>, "exchangeRates", ParentType, ContextType, RequireFields<SubscriptionexchangeRatesArgs, 'skip' | 'first' | 'subgraphError'>>;
  currencyConfiguration?: SubscriptionResolver<Maybe<ResolversTypes['CurrencyConfiguration']>, "currencyConfiguration", ParentType, ContextType, RequireFields<SubscriptioncurrencyConfigurationArgs, 'id' | 'subgraphError'>>;
  currencyConfigurations?: SubscriptionResolver<Array<ResolversTypes['CurrencyConfiguration']>, "currencyConfigurations", ParentType, ContextType, RequireFields<SubscriptioncurrencyConfigurationsArgs, 'skip' | 'first' | 'subgraphError'>>;
  interestRateCurve?: SubscriptionResolver<Maybe<ResolversTypes['InterestRateCurve']>, "interestRateCurve", ParentType, ContextType, RequireFields<SubscriptioninterestRateCurveArgs, 'id' | 'subgraphError'>>;
  interestRateCurves?: SubscriptionResolver<Array<ResolversTypes['InterestRateCurve']>, "interestRateCurves", ParentType, ContextType, RequireFields<SubscriptioninterestRateCurvesArgs, 'skip' | 'first' | 'subgraphError'>>;
  vaultConfiguration?: SubscriptionResolver<Maybe<ResolversTypes['VaultConfiguration']>, "vaultConfiguration", ParentType, ContextType, RequireFields<SubscriptionvaultConfigurationArgs, 'id' | 'subgraphError'>>;
  vaultConfigurations?: SubscriptionResolver<Array<ResolversTypes['VaultConfiguration']>, "vaultConfigurations", ParentType, ContextType, RequireFields<SubscriptionvaultConfigurationsArgs, 'skip' | 'first' | 'subgraphError'>>;
  whitelistedContract?: SubscriptionResolver<Maybe<ResolversTypes['WhitelistedContract']>, "whitelistedContract", ParentType, ContextType, RequireFields<SubscriptionwhitelistedContractArgs, 'id' | 'subgraphError'>>;
  whitelistedContracts?: SubscriptionResolver<Array<ResolversTypes['WhitelistedContract']>, "whitelistedContracts", ParentType, ContextType, RequireFields<SubscriptionwhitelistedContractsArgs, 'skip' | 'first' | 'subgraphError'>>;
  balance?: SubscriptionResolver<Maybe<ResolversTypes['Balance']>, "balance", ParentType, ContextType, RequireFields<SubscriptionbalanceArgs, 'id' | 'subgraphError'>>;
  balances?: SubscriptionResolver<Array<ResolversTypes['Balance']>, "balances", ParentType, ContextType, RequireFields<SubscriptionbalancesArgs, 'skip' | 'first' | 'subgraphError'>>;
  activeMarket?: SubscriptionResolver<Maybe<ResolversTypes['ActiveMarket']>, "activeMarket", ParentType, ContextType, RequireFields<SubscriptionactiveMarketArgs, 'id' | 'subgraphError'>>;
  activeMarkets?: SubscriptionResolver<Array<ResolversTypes['ActiveMarket']>, "activeMarkets", ParentType, ContextType, RequireFields<SubscriptionactiveMarketsArgs, 'skip' | 'first' | 'subgraphError'>>;
  primeCashMarket?: SubscriptionResolver<Maybe<ResolversTypes['PrimeCashMarket']>, "primeCashMarket", ParentType, ContextType, RequireFields<SubscriptionprimeCashMarketArgs, 'id' | 'subgraphError'>>;
  primeCashMarkets?: SubscriptionResolver<Array<ResolversTypes['PrimeCashMarket']>, "primeCashMarkets", ParentType, ContextType, RequireFields<SubscriptionprimeCashMarketsArgs, 'skip' | 'first' | 'subgraphError'>>;
  primeCashMarketSnapshot?: SubscriptionResolver<Maybe<ResolversTypes['PrimeCashMarketSnapshot']>, "primeCashMarketSnapshot", ParentType, ContextType, RequireFields<SubscriptionprimeCashMarketSnapshotArgs, 'id' | 'subgraphError'>>;
  primeCashMarketSnapshots?: SubscriptionResolver<Array<ResolversTypes['PrimeCashMarketSnapshot']>, "primeCashMarketSnapshots", ParentType, ContextType, RequireFields<SubscriptionprimeCashMarketSnapshotsArgs, 'skip' | 'first' | 'subgraphError'>>;
  fCashMarket?: SubscriptionResolver<Maybe<ResolversTypes['fCashMarket']>, "fCashMarket", ParentType, ContextType, RequireFields<SubscriptionfCashMarketArgs, 'id' | 'subgraphError'>>;
  fCashMarkets?: SubscriptionResolver<Array<ResolversTypes['fCashMarket']>, "fCashMarkets", ParentType, ContextType, RequireFields<SubscriptionfCashMarketsArgs, 'skip' | 'first' | 'subgraphError'>>;
  fCashMarketSnapshot?: SubscriptionResolver<Maybe<ResolversTypes['fCashMarketSnapshot']>, "fCashMarketSnapshot", ParentType, ContextType, RequireFields<SubscriptionfCashMarketSnapshotArgs, 'id' | 'subgraphError'>>;
  fCashMarketSnapshots?: SubscriptionResolver<Array<ResolversTypes['fCashMarketSnapshot']>, "fCashMarketSnapshots", ParentType, ContextType, RequireFields<SubscriptionfCashMarketSnapshotsArgs, 'skip' | 'first' | 'subgraphError'>>;
  incentive?: SubscriptionResolver<Maybe<ResolversTypes['Incentive']>, "incentive", ParentType, ContextType, RequireFields<SubscriptionincentiveArgs, 'id' | 'subgraphError'>>;
  incentives?: SubscriptionResolver<Array<ResolversTypes['Incentive']>, "incentives", ParentType, ContextType, RequireFields<SubscriptionincentivesArgs, 'skip' | 'first' | 'subgraphError'>>;
  tradingModulePermission?: SubscriptionResolver<Maybe<ResolversTypes['TradingModulePermission']>, "tradingModulePermission", ParentType, ContextType, RequireFields<SubscriptiontradingModulePermissionArgs, 'id' | 'subgraphError'>>;
  tradingModulePermissions?: SubscriptionResolver<Array<ResolversTypes['TradingModulePermission']>, "tradingModulePermissions", ParentType, ContextType, RequireFields<SubscriptiontradingModulePermissionsArgs, 'skip' | 'first' | 'subgraphError'>>;
  _meta?: SubscriptionResolver<Maybe<ResolversTypes['_Meta_']>, "_meta", ParentType, ContextType, Partial<Subscription_metaArgs>>;
}>;

export type TokenResolvers<ContextType = MeshContext & { chainName: string }, ParentType extends ResolversParentTypes['Token'] = ResolversParentTypes['Token']> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  firstUpdateBlockNumber?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  firstUpdateTimestamp?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  firstUpdateTransactionHash?: Resolver<Maybe<ResolversTypes['Bytes']>, ParentType, ContextType>;
  lastUpdateBlockNumber?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  lastUpdateTimestamp?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  lastUpdateTransactionHash?: Resolver<Maybe<ResolversTypes['Bytes']>, ParentType, ContextType>;
  tokenType?: Resolver<ResolversTypes['TokenType'], ParentType, ContextType>;
  tokenInterface?: Resolver<ResolversTypes['TokenInterface'], ParentType, ContextType>;
  underlying?: Resolver<Maybe<ResolversTypes['Token']>, ParentType, ContextType>;
  currencyId?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  symbol?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  decimals?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  precision?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  totalSupply?: Resolver<Maybe<ResolversTypes['BigInt']>, ParentType, ContextType>;
  hasTransferFee?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  isfCashDebt?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  maturity?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  vaultAddress?: Resolver<Maybe<ResolversTypes['Bytes']>, ParentType, ContextType>;
  tokenAddress?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  balanceOf?: Resolver<Maybe<Array<ResolversTypes['Balance']>>, ParentType, ContextType, RequireFields<TokenbalanceOfArgs, 'skip' | 'first'>>;
  transfers?: Resolver<Maybe<Array<ResolversTypes['Transfer']>>, ParentType, ContextType, RequireFields<TokentransfersArgs, 'skip' | 'first'>>;
  oracles?: Resolver<Maybe<Array<ResolversTypes['Oracle']>>, ParentType, ContextType, RequireFields<TokenoraclesArgs, 'skip' | 'first'>>;
  activeMarkets?: Resolver<Maybe<ResolversTypes['ActiveMarket']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TradingModulePermissionResolvers<ContextType = MeshContext & { chainName: string }, ParentType extends ResolversParentTypes['TradingModulePermission'] = ResolversParentTypes['TradingModulePermission']> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  lastUpdateBlockNumber?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  lastUpdateTimestamp?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  lastUpdateTransactionHash?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  sender?: Resolver<ResolversTypes['Account'], ParentType, ContextType>;
  token?: Resolver<ResolversTypes['Token'], ParentType, ContextType>;
  allowedDexes?: Resolver<Array<ResolversTypes['DEX']>, ParentType, ContextType>;
  allowSell?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  allowedTradeTypes?: Resolver<Array<ResolversTypes['TradeType']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TransactionResolvers<ContextType = MeshContext & { chainName: string }, ParentType extends ResolversParentTypes['Transaction'] = ResolversParentTypes['Transaction']> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  blockNumber?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  timestamp?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  transactionHash?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  _transfers?: Resolver<Array<ResolversTypes['Transfer']>, ParentType, ContextType, RequireFields<Transaction_transfersArgs, 'skip' | 'first'>>;
  _transferBundles?: Resolver<Array<ResolversTypes['TransferBundle']>, ParentType, ContextType, RequireFields<Transaction_transferBundlesArgs, 'skip' | 'first'>>;
  _nextStartIndex?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  transfers?: Resolver<Maybe<Array<ResolversTypes['Transfer']>>, ParentType, ContextType, RequireFields<TransactiontransfersArgs, 'skip' | 'first'>>;
  transferBundles?: Resolver<Maybe<Array<ResolversTypes['TransferBundle']>>, ParentType, ContextType, RequireFields<TransactiontransferBundlesArgs, 'skip' | 'first'>>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TransferResolvers<ContextType = MeshContext & { chainName: string }, ParentType extends ResolversParentTypes['Transfer'] = ResolversParentTypes['Transfer']> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  blockNumber?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  timestamp?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  transactionHash?: Resolver<ResolversTypes['Transaction'], ParentType, ContextType>;
  logIndex?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  from?: Resolver<ResolversTypes['Account'], ParentType, ContextType>;
  to?: Resolver<ResolversTypes['Account'], ParentType, ContextType>;
  operator?: Resolver<Maybe<ResolversTypes['Account']>, ParentType, ContextType>;
  transferType?: Resolver<ResolversTypes['TransferType'], ParentType, ContextType>;
  fromSystemAccount?: Resolver<ResolversTypes['SystemAccount'], ParentType, ContextType>;
  toSystemAccount?: Resolver<ResolversTypes['SystemAccount'], ParentType, ContextType>;
  value?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  valueInUnderlying?: Resolver<Maybe<ResolversTypes['BigInt']>, ParentType, ContextType>;
  token?: Resolver<ResolversTypes['Token'], ParentType, ContextType>;
  tokenType?: Resolver<ResolversTypes['TokenType'], ParentType, ContextType>;
  underlying?: Resolver<ResolversTypes['Token'], ParentType, ContextType>;
  maturity?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type TransferBundleResolvers<ContextType = MeshContext & { chainName: string }, ParentType extends ResolversParentTypes['TransferBundle'] = ResolversParentTypes['TransferBundle']> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  blockNumber?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  timestamp?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  transactionHash?: Resolver<ResolversTypes['Transaction'], ParentType, ContextType>;
  bundleName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  startLogIndex?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  endLogIndex?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  transfers?: Resolver<Array<ResolversTypes['Transfer']>, ParentType, ContextType, RequireFields<TransferBundletransfersArgs, 'skip' | 'first'>>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type VaultConfigurationResolvers<ContextType = MeshContext & { chainName: string }, ParentType extends ResolversParentTypes['VaultConfiguration'] = ResolversParentTypes['VaultConfiguration']> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  lastUpdateBlockHash?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  lastUpdateBlockNumber?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  lastUpdateTimestamp?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  lastUpdateTransactionHash?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  vaultAddress?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  strategy?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  primaryBorrowCurrency?: Resolver<ResolversTypes['Token'], ParentType, ContextType>;
  minAccountBorrowSize?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  minCollateralRatioBasisPoints?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  maxDeleverageCollateralRatioBasisPoints?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  feeRateBasisPoints?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  reserveFeeSharePercent?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  liquidationRatePercent?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  maxBorrowMarketIndex?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  secondaryBorrowCurrencies?: Resolver<Maybe<Array<ResolversTypes['Token']>>, ParentType, ContextType, RequireFields<VaultConfigurationsecondaryBorrowCurrenciesArgs, 'skip' | 'first'>>;
  maxRequiredAccountCollateralRatioBasisPoints?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  enabled?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  allowRollPosition?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  onlyVaultEntry?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  onlyVaultExit?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  onlyVaultRoll?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  onlyVaultDeleverage?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  onlyVaultSettle?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  discountfCash?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  allowsReentrancy?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  deleverageDisabled?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  maxPrimaryBorrowCapacity?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  totalUsedPrimaryBorrowCapacity?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  maxSecondaryBorrowCapacity?: Resolver<Maybe<Array<ResolversTypes['BigInt']>>, ParentType, ContextType>;
  totalUsedSecondaryBorrowCapacity?: Resolver<Maybe<Array<ResolversTypes['BigInt']>>, ParentType, ContextType>;
  minAccountSecondaryBorrow?: Resolver<Maybe<Array<ResolversTypes['BigInt']>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type WhitelistedContractResolvers<ContextType = MeshContext & { chainName: string }, ParentType extends ResolversParentTypes['WhitelistedContract'] = ResolversParentTypes['WhitelistedContract']> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  lastUpdateBlockNumber?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  lastUpdateTimestamp?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  lastUpdateTransactionHash?: Resolver<ResolversTypes['Bytes'], ParentType, ContextType>;
  capability?: Resolver<Array<ResolversTypes['WhitelistedCapability']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type _Block_Resolvers<ContextType = MeshContext & { chainName: string }, ParentType extends ResolversParentTypes['_Block_'] = ResolversParentTypes['_Block_']> = ResolversObject<{
  hash?: Resolver<Maybe<ResolversTypes['Bytes']>, ParentType, ContextType>;
  number?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  timestamp?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type _Meta_Resolvers<ContextType = MeshContext & { chainName: string }, ParentType extends ResolversParentTypes['_Meta_'] = ResolversParentTypes['_Meta_']> = ResolversObject<{
  block?: Resolver<ResolversTypes['_Block_'], ParentType, ContextType>;
  deployment?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  hasIndexingErrors?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type fCashMarketResolvers<ContextType = MeshContext & { chainName: string }, ParentType extends ResolversParentTypes['fCashMarket'] = ResolversParentTypes['fCashMarket']> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  lastUpdateBlockNumber?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  lastUpdateTimestamp?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  lastUpdateTransaction?: Resolver<Maybe<ResolversTypes['Transaction']>, ParentType, ContextType>;
  underlying?: Resolver<ResolversTypes['Token'], ParentType, ContextType>;
  fCash?: Resolver<ResolversTypes['Token'], ParentType, ContextType>;
  maturity?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  settlementDate?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  marketIndex?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  marketMaturityLengthSeconds?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  current?: Resolver<ResolversTypes['fCashMarketSnapshot'], ParentType, ContextType>;
  snapshots?: Resolver<Maybe<Array<ResolversTypes['fCashMarketSnapshot']>>, ParentType, ContextType, RequireFields<fCashMarketsnapshotsArgs, 'skip' | 'first'>>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type fCashMarketSnapshotResolvers<ContextType = MeshContext & { chainName: string }, ParentType extends ResolversParentTypes['fCashMarketSnapshot'] = ResolversParentTypes['fCashMarketSnapshot']> = ResolversObject<{
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  blockNumber?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  timestamp?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  transaction?: Resolver<Maybe<ResolversTypes['Transaction']>, ParentType, ContextType>;
  market?: Resolver<ResolversTypes['fCashMarket'], ParentType, ContextType>;
  totalfCash?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  totalPrimeCash?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  totalLiquidity?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  lastImpliedRate?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  oracleRate?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  previousTradeTime?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  totalPrimeCashInUnderlying?: Resolver<Maybe<ResolversTypes['BigInt']>, ParentType, ContextType>;
  totalfCashPresentValue?: Resolver<Maybe<ResolversTypes['BigInt']>, ParentType, ContextType>;
  totalfCashDebtOutstanding?: Resolver<ResolversTypes['BigInt'], ParentType, ContextType>;
  totalfCashDebtOutstandingPresentValue?: Resolver<Maybe<ResolversTypes['BigInt']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
}>;

export type Resolvers<ContextType = MeshContext & { chainName: string }> = ResolversObject<{
  Account?: AccountResolvers<ContextType>;
  ActiveMarket?: ActiveMarketResolvers<ContextType>;
  Balance?: BalanceResolvers<ContextType>;
  BigDecimal?: GraphQLScalarType;
  BigInt?: GraphQLScalarType;
  Bytes?: GraphQLScalarType;
  CurrencyConfiguration?: CurrencyConfigurationResolvers<ContextType>;
  ExchangeRate?: ExchangeRateResolvers<ContextType>;
  Incentive?: IncentiveResolvers<ContextType>;
  Int8?: GraphQLScalarType;
  InterestRateCurve?: InterestRateCurveResolvers<ContextType>;
  Oracle?: OracleResolvers<ContextType>;
  OracleRegistry?: OracleRegistryResolvers<ContextType>;
  PrimeCashMarket?: PrimeCashMarketResolvers<ContextType>;
  PrimeCashMarketSnapshot?: PrimeCashMarketSnapshotResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  Subscription?: SubscriptionResolvers<ContextType>;
  Token?: TokenResolvers<ContextType>;
  TradingModulePermission?: TradingModulePermissionResolvers<ContextType>;
  Transaction?: TransactionResolvers<ContextType>;
  Transfer?: TransferResolvers<ContextType>;
  TransferBundle?: TransferBundleResolvers<ContextType>;
  VaultConfiguration?: VaultConfigurationResolvers<ContextType>;
  WhitelistedContract?: WhitelistedContractResolvers<ContextType>;
  _Block_?: _Block_Resolvers<ContextType>;
  _Meta_?: _Meta_Resolvers<ContextType>;
  fCashMarket?: fCashMarketResolvers<ContextType>;
  fCashMarketSnapshot?: fCashMarketSnapshotResolvers<ContextType>;
}>;

export type DirectiveResolvers<ContextType = MeshContext & { chainName: string }> = ResolversObject<{
  entity?: entityDirectiveResolver<any, any, ContextType>;
  subgraphId?: subgraphIdDirectiveResolver<any, any, ContextType>;
  derivedFrom?: derivedFromDirectiveResolver<any, any, ContextType>;
}>;

export type MeshContext = NotionalV3Types.Context & BaseMeshContext;


const baseDir = pathModule.join(typeof __dirname === 'string' ? __dirname : '/', '..');

const importFn: ImportFn = <T>(moduleId: string) => {
  const relativeModuleId = (pathModule.isAbsolute(moduleId) ? pathModule.relative(baseDir, moduleId) : moduleId).split('\\').join('/').replace(baseDir + '/', '');
  switch(relativeModuleId) {
    case ".graphclient/sources/NotionalV3/introspectionSchema":
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
const notionalV3Transforms = [];
const additionalTypeDefs = [] as any[];
const notionalV3Handler = new GraphqlHandler({
              name: "NotionalV3",
              config: {"endpoint":"https://api.studio.thegraph.com/query/33671/notional-finance-v3-{context.chainName:arbitrum}/v0.0.70"},
              baseDir,
              cache,
              pubsub,
              store: sourcesStore.child("NotionalV3"),
              logger: logger.child("NotionalV3"),
              importFn,
            });
notionalV3Transforms[0] = new BlockTrackingTransform({
                  apiName: "NotionalV3",
                  config: {"validateSchema":false},
                  baseDir,
                  cache,
                  pubsub,
                  importFn,
                  logger,
                });
notionalV3Transforms[1] = new AutoPaginationTransform({
                  apiName: "NotionalV3",
                  config: {"validateSchema":false},
                  baseDir,
                  cache,
                  pubsub,
                  importFn,
                  logger,
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
        document: TransferDocument,
        get rawSDL() {
          return printWithCache(TransferDocument);
        },
        location: 'TransferDocument.graphql'
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

export function getBuiltGraphClient(): Promise<MeshInstance> {
  if (meshInstance$ == null) {
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
export type TransferQueryVariables = Exact<{ [key: string]: never; }>;


export type TransferQuery = { transfers: Array<(
    Pick<Transfer, 'id' | 'blockNumber' | 'timestamp' | 'logIndex' | 'transferType' | 'fromSystemAccount' | 'toSystemAccount' | 'value' | 'tokenType' | 'maturity'>
    & { transactionHash: Pick<Transaction, 'id'>, from: Pick<Account, 'id'>, to: Pick<Account, 'id'>, token: Pick<Token, 'id'> }
  )> };


export const TransferDocument = gql`
    query Transfer {
  transfers(first: 1) {
    id
    blockNumber
    timestamp
    transactionHash {
      id
    }
    logIndex
    from {
      id
    }
    to {
      id
    }
    transferType
    fromSystemAccount
    toSystemAccount
    value
    token {
      id
    }
    tokenType
    maturity
  }
}
    ` as unknown as DocumentNode<TransferQuery, TransferQueryVariables>;


export type Requester<C = {}, E = unknown> = <R, V>(doc: DocumentNode, vars?: V, options?: C) => Promise<R> | AsyncIterable<R>
export function getSdk<C, E>(requester: Requester<C, E>) {
  return {
    Transfer(variables?: TransferQueryVariables, options?: C): Promise<TransferQuery> {
      return requester<TransferQuery, TransferQueryVariables>(TransferDocument, variables, options) as Promise<TransferQuery>;
    }
  };
}
export type Sdk = ReturnType<typeof getSdk>;