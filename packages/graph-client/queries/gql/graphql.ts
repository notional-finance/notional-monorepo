/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
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
};

export type Account = {
  __typename?: 'Account';
  /** Currency id of an asset bitmap, if set */
  assetBitmapCurrency?: Maybe<Currency>;
  assetChanges?: Maybe<Array<AssetChange>>;
  balanceChanges?: Maybe<Array<BalanceChange>>;
  /** Account's balances of both cash and nTokens */
  balances: Array<Balance>;
  /** True if the account's cash balances have debt, may be temporarily inconsistent after a SettleCashEvent */
  hasCashDebt: Scalars['Boolean'];
  /** True if the account's portfolio has debt assets */
  hasPortfolioAssetDebt: Scalars['Boolean'];
  /** Account address */
  id: Scalars['ID'];
  lastUpdateBlockHash: Scalars['Bytes'];
  lastUpdateBlockNumber: Scalars['Int'];
  lastUpdateTimestamp: Scalars['Int'];
  lastUpdateTransactionHash: Scalars['Bytes'];
  leveragedVaults?: Maybe<Array<LeveragedVaultAccount>>;
  /** A link to the nToken object if this is an nToken */
  nToken?: Maybe<NToken>;
  nTokenChanges?: Maybe<Array<NTokenChange>>;
  /** Timestamp of the next time that the account will require settlement */
  nextSettleTime: Scalars['BigInt'];
  /** Account's portfolio assets */
  portfolio: Array<Asset>;
  stakedNoteBalance?: Maybe<StakedNoteBalance>;
  stakedNoteChanges?: Maybe<Array<StakedNoteChange>>;
  tradeHistory?: Maybe<Array<Trade>>;
};


export type AccountAssetChangesArgs = {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<AssetChange_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<AssetChange_Filter>;
};


export type AccountBalanceChangesArgs = {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<BalanceChange_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<BalanceChange_Filter>;
};


export type AccountBalancesArgs = {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Balance_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<Balance_Filter>;
};


export type AccountLeveragedVaultsArgs = {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<LeveragedVaultAccount_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<LeveragedVaultAccount_Filter>;
};


export type AccountNTokenChangesArgs = {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<NTokenChange_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<NTokenChange_Filter>;
};


export type AccountPortfolioArgs = {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Asset_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<Asset_Filter>;
};


export type AccountStakedNoteChangesArgs = {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<StakedNoteChange_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<StakedNoteChange_Filter>;
};


export type AccountTradeHistoryArgs = {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Trade_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<Trade_Filter>;
};

export type Account_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  assetBitmapCurrency?: InputMaybe<Scalars['String']>;
  assetBitmapCurrency_?: InputMaybe<Currency_Filter>;
  assetBitmapCurrency_contains?: InputMaybe<Scalars['String']>;
  assetBitmapCurrency_contains_nocase?: InputMaybe<Scalars['String']>;
  assetBitmapCurrency_ends_with?: InputMaybe<Scalars['String']>;
  assetBitmapCurrency_ends_with_nocase?: InputMaybe<Scalars['String']>;
  assetBitmapCurrency_gt?: InputMaybe<Scalars['String']>;
  assetBitmapCurrency_gte?: InputMaybe<Scalars['String']>;
  assetBitmapCurrency_in?: InputMaybe<Array<Scalars['String']>>;
  assetBitmapCurrency_lt?: InputMaybe<Scalars['String']>;
  assetBitmapCurrency_lte?: InputMaybe<Scalars['String']>;
  assetBitmapCurrency_not?: InputMaybe<Scalars['String']>;
  assetBitmapCurrency_not_contains?: InputMaybe<Scalars['String']>;
  assetBitmapCurrency_not_contains_nocase?: InputMaybe<Scalars['String']>;
  assetBitmapCurrency_not_ends_with?: InputMaybe<Scalars['String']>;
  assetBitmapCurrency_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  assetBitmapCurrency_not_in?: InputMaybe<Array<Scalars['String']>>;
  assetBitmapCurrency_not_starts_with?: InputMaybe<Scalars['String']>;
  assetBitmapCurrency_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  assetBitmapCurrency_starts_with?: InputMaybe<Scalars['String']>;
  assetBitmapCurrency_starts_with_nocase?: InputMaybe<Scalars['String']>;
  assetChanges_?: InputMaybe<AssetChange_Filter>;
  balanceChanges_?: InputMaybe<BalanceChange_Filter>;
  balances?: InputMaybe<Array<Scalars['String']>>;
  balances_?: InputMaybe<Balance_Filter>;
  balances_contains?: InputMaybe<Array<Scalars['String']>>;
  balances_contains_nocase?: InputMaybe<Array<Scalars['String']>>;
  balances_not?: InputMaybe<Array<Scalars['String']>>;
  balances_not_contains?: InputMaybe<Array<Scalars['String']>>;
  balances_not_contains_nocase?: InputMaybe<Array<Scalars['String']>>;
  hasCashDebt?: InputMaybe<Scalars['Boolean']>;
  hasCashDebt_in?: InputMaybe<Array<Scalars['Boolean']>>;
  hasCashDebt_not?: InputMaybe<Scalars['Boolean']>;
  hasCashDebt_not_in?: InputMaybe<Array<Scalars['Boolean']>>;
  hasPortfolioAssetDebt?: InputMaybe<Scalars['Boolean']>;
  hasPortfolioAssetDebt_in?: InputMaybe<Array<Scalars['Boolean']>>;
  hasPortfolioAssetDebt_not?: InputMaybe<Scalars['Boolean']>;
  hasPortfolioAssetDebt_not_in?: InputMaybe<Array<Scalars['Boolean']>>;
  id?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  lastUpdateBlockHash?: InputMaybe<Scalars['Bytes']>;
  lastUpdateBlockHash_contains?: InputMaybe<Scalars['Bytes']>;
  lastUpdateBlockHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
  lastUpdateBlockHash_not?: InputMaybe<Scalars['Bytes']>;
  lastUpdateBlockHash_not_contains?: InputMaybe<Scalars['Bytes']>;
  lastUpdateBlockHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  lastUpdateBlockNumber?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_gt?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_gte?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_in?: InputMaybe<Array<Scalars['Int']>>;
  lastUpdateBlockNumber_lt?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_lte?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_not?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_not_in?: InputMaybe<Array<Scalars['Int']>>;
  lastUpdateTimestamp?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_gt?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_gte?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_in?: InputMaybe<Array<Scalars['Int']>>;
  lastUpdateTimestamp_lt?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_lte?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_not?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_not_in?: InputMaybe<Array<Scalars['Int']>>;
  lastUpdateTransactionHash?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_contains?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
  lastUpdateTransactionHash_not?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_not_contains?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  leveragedVaults_?: InputMaybe<LeveragedVaultAccount_Filter>;
  nToken?: InputMaybe<Scalars['String']>;
  nTokenChanges_?: InputMaybe<NTokenChange_Filter>;
  nToken_?: InputMaybe<NToken_Filter>;
  nToken_contains?: InputMaybe<Scalars['String']>;
  nToken_contains_nocase?: InputMaybe<Scalars['String']>;
  nToken_ends_with?: InputMaybe<Scalars['String']>;
  nToken_ends_with_nocase?: InputMaybe<Scalars['String']>;
  nToken_gt?: InputMaybe<Scalars['String']>;
  nToken_gte?: InputMaybe<Scalars['String']>;
  nToken_in?: InputMaybe<Array<Scalars['String']>>;
  nToken_lt?: InputMaybe<Scalars['String']>;
  nToken_lte?: InputMaybe<Scalars['String']>;
  nToken_not?: InputMaybe<Scalars['String']>;
  nToken_not_contains?: InputMaybe<Scalars['String']>;
  nToken_not_contains_nocase?: InputMaybe<Scalars['String']>;
  nToken_not_ends_with?: InputMaybe<Scalars['String']>;
  nToken_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  nToken_not_in?: InputMaybe<Array<Scalars['String']>>;
  nToken_not_starts_with?: InputMaybe<Scalars['String']>;
  nToken_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  nToken_starts_with?: InputMaybe<Scalars['String']>;
  nToken_starts_with_nocase?: InputMaybe<Scalars['String']>;
  nextSettleTime?: InputMaybe<Scalars['BigInt']>;
  nextSettleTime_gt?: InputMaybe<Scalars['BigInt']>;
  nextSettleTime_gte?: InputMaybe<Scalars['BigInt']>;
  nextSettleTime_in?: InputMaybe<Array<Scalars['BigInt']>>;
  nextSettleTime_lt?: InputMaybe<Scalars['BigInt']>;
  nextSettleTime_lte?: InputMaybe<Scalars['BigInt']>;
  nextSettleTime_not?: InputMaybe<Scalars['BigInt']>;
  nextSettleTime_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  portfolio?: InputMaybe<Array<Scalars['String']>>;
  portfolio_?: InputMaybe<Asset_Filter>;
  portfolio_contains?: InputMaybe<Array<Scalars['String']>>;
  portfolio_contains_nocase?: InputMaybe<Array<Scalars['String']>>;
  portfolio_not?: InputMaybe<Array<Scalars['String']>>;
  portfolio_not_contains?: InputMaybe<Array<Scalars['String']>>;
  portfolio_not_contains_nocase?: InputMaybe<Array<Scalars['String']>>;
  stakedNoteBalance_?: InputMaybe<StakedNoteBalance_Filter>;
  stakedNoteChanges_?: InputMaybe<StakedNoteChange_Filter>;
  tradeHistory_?: InputMaybe<Trade_Filter>;
};

export enum Account_OrderBy {
  AssetBitmapCurrency = 'assetBitmapCurrency',
  AssetChanges = 'assetChanges',
  BalanceChanges = 'balanceChanges',
  Balances = 'balances',
  HasCashDebt = 'hasCashDebt',
  HasPortfolioAssetDebt = 'hasPortfolioAssetDebt',
  Id = 'id',
  LastUpdateBlockHash = 'lastUpdateBlockHash',
  LastUpdateBlockNumber = 'lastUpdateBlockNumber',
  LastUpdateTimestamp = 'lastUpdateTimestamp',
  LastUpdateTransactionHash = 'lastUpdateTransactionHash',
  LeveragedVaults = 'leveragedVaults',
  NToken = 'nToken',
  NTokenChanges = 'nTokenChanges',
  NextSettleTime = 'nextSettleTime',
  Portfolio = 'portfolio',
  StakedNoteBalance = 'stakedNoteBalance',
  StakedNoteChanges = 'stakedNoteChanges',
  TradeHistory = 'tradeHistory'
}

export type Asset = {
  __typename?: 'Asset';
  /** Asset type */
  assetType: AssetType;
  /** Reference to currency that this balance represents */
  currency: Currency;
  /** Account:CurrencyId:AssetType:Maturity */
  id: Scalars['ID'];
  lastUpdateBlockHash: Scalars['Bytes'];
  lastUpdateBlockNumber: Scalars['Int'];
  lastUpdateTimestamp: Scalars['Int'];
  lastUpdateTransactionHash: Scalars['Bytes'];
  /** Timestamp when fCash matures, if liquidity token this will still refer to fCash maturity date */
  maturity: Scalars['BigInt'];
  /** Notional amount */
  notional: Scalars['BigInt'];
  /** Date when assets will be settled, quarterly for liquidity tokens and at maturity for fCash */
  settlementDate: Scalars['BigInt'];
};

export type AssetChange = {
  __typename?: 'AssetChange';
  account: Account;
  assetType: AssetType;
  blockHash: Scalars['Bytes'];
  blockNumber: Scalars['Int'];
  currency: Currency;
  /** Account:CurrencyId:AssetType:Maturity:Transaction hash */
  id: Scalars['ID'];
  maturity: Scalars['BigInt'];
  notionalAfter: Scalars['BigInt'];
  notionalBefore: Scalars['BigInt'];
  settlementDate: Scalars['BigInt'];
  timestamp: Scalars['Int'];
  transactionHash: Scalars['Bytes'];
  transactionOrigin: Scalars['Bytes'];
};

export type AssetChange_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  account?: InputMaybe<Scalars['String']>;
  account_?: InputMaybe<Account_Filter>;
  account_contains?: InputMaybe<Scalars['String']>;
  account_contains_nocase?: InputMaybe<Scalars['String']>;
  account_ends_with?: InputMaybe<Scalars['String']>;
  account_ends_with_nocase?: InputMaybe<Scalars['String']>;
  account_gt?: InputMaybe<Scalars['String']>;
  account_gte?: InputMaybe<Scalars['String']>;
  account_in?: InputMaybe<Array<Scalars['String']>>;
  account_lt?: InputMaybe<Scalars['String']>;
  account_lte?: InputMaybe<Scalars['String']>;
  account_not?: InputMaybe<Scalars['String']>;
  account_not_contains?: InputMaybe<Scalars['String']>;
  account_not_contains_nocase?: InputMaybe<Scalars['String']>;
  account_not_ends_with?: InputMaybe<Scalars['String']>;
  account_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  account_not_in?: InputMaybe<Array<Scalars['String']>>;
  account_not_starts_with?: InputMaybe<Scalars['String']>;
  account_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  account_starts_with?: InputMaybe<Scalars['String']>;
  account_starts_with_nocase?: InputMaybe<Scalars['String']>;
  assetType?: InputMaybe<AssetType>;
  assetType_in?: InputMaybe<Array<AssetType>>;
  assetType_not?: InputMaybe<AssetType>;
  assetType_not_in?: InputMaybe<Array<AssetType>>;
  blockHash?: InputMaybe<Scalars['Bytes']>;
  blockHash_contains?: InputMaybe<Scalars['Bytes']>;
  blockHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
  blockHash_not?: InputMaybe<Scalars['Bytes']>;
  blockHash_not_contains?: InputMaybe<Scalars['Bytes']>;
  blockHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  blockNumber?: InputMaybe<Scalars['Int']>;
  blockNumber_gt?: InputMaybe<Scalars['Int']>;
  blockNumber_gte?: InputMaybe<Scalars['Int']>;
  blockNumber_in?: InputMaybe<Array<Scalars['Int']>>;
  blockNumber_lt?: InputMaybe<Scalars['Int']>;
  blockNumber_lte?: InputMaybe<Scalars['Int']>;
  blockNumber_not?: InputMaybe<Scalars['Int']>;
  blockNumber_not_in?: InputMaybe<Array<Scalars['Int']>>;
  currency?: InputMaybe<Scalars['String']>;
  currency_?: InputMaybe<Currency_Filter>;
  currency_contains?: InputMaybe<Scalars['String']>;
  currency_contains_nocase?: InputMaybe<Scalars['String']>;
  currency_ends_with?: InputMaybe<Scalars['String']>;
  currency_ends_with_nocase?: InputMaybe<Scalars['String']>;
  currency_gt?: InputMaybe<Scalars['String']>;
  currency_gte?: InputMaybe<Scalars['String']>;
  currency_in?: InputMaybe<Array<Scalars['String']>>;
  currency_lt?: InputMaybe<Scalars['String']>;
  currency_lte?: InputMaybe<Scalars['String']>;
  currency_not?: InputMaybe<Scalars['String']>;
  currency_not_contains?: InputMaybe<Scalars['String']>;
  currency_not_contains_nocase?: InputMaybe<Scalars['String']>;
  currency_not_ends_with?: InputMaybe<Scalars['String']>;
  currency_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  currency_not_in?: InputMaybe<Array<Scalars['String']>>;
  currency_not_starts_with?: InputMaybe<Scalars['String']>;
  currency_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  currency_starts_with?: InputMaybe<Scalars['String']>;
  currency_starts_with_nocase?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  maturity?: InputMaybe<Scalars['BigInt']>;
  maturity_gt?: InputMaybe<Scalars['BigInt']>;
  maturity_gte?: InputMaybe<Scalars['BigInt']>;
  maturity_in?: InputMaybe<Array<Scalars['BigInt']>>;
  maturity_lt?: InputMaybe<Scalars['BigInt']>;
  maturity_lte?: InputMaybe<Scalars['BigInt']>;
  maturity_not?: InputMaybe<Scalars['BigInt']>;
  maturity_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  notionalAfter?: InputMaybe<Scalars['BigInt']>;
  notionalAfter_gt?: InputMaybe<Scalars['BigInt']>;
  notionalAfter_gte?: InputMaybe<Scalars['BigInt']>;
  notionalAfter_in?: InputMaybe<Array<Scalars['BigInt']>>;
  notionalAfter_lt?: InputMaybe<Scalars['BigInt']>;
  notionalAfter_lte?: InputMaybe<Scalars['BigInt']>;
  notionalAfter_not?: InputMaybe<Scalars['BigInt']>;
  notionalAfter_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  notionalBefore?: InputMaybe<Scalars['BigInt']>;
  notionalBefore_gt?: InputMaybe<Scalars['BigInt']>;
  notionalBefore_gte?: InputMaybe<Scalars['BigInt']>;
  notionalBefore_in?: InputMaybe<Array<Scalars['BigInt']>>;
  notionalBefore_lt?: InputMaybe<Scalars['BigInt']>;
  notionalBefore_lte?: InputMaybe<Scalars['BigInt']>;
  notionalBefore_not?: InputMaybe<Scalars['BigInt']>;
  notionalBefore_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  settlementDate?: InputMaybe<Scalars['BigInt']>;
  settlementDate_gt?: InputMaybe<Scalars['BigInt']>;
  settlementDate_gte?: InputMaybe<Scalars['BigInt']>;
  settlementDate_in?: InputMaybe<Array<Scalars['BigInt']>>;
  settlementDate_lt?: InputMaybe<Scalars['BigInt']>;
  settlementDate_lte?: InputMaybe<Scalars['BigInt']>;
  settlementDate_not?: InputMaybe<Scalars['BigInt']>;
  settlementDate_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  timestamp?: InputMaybe<Scalars['Int']>;
  timestamp_gt?: InputMaybe<Scalars['Int']>;
  timestamp_gte?: InputMaybe<Scalars['Int']>;
  timestamp_in?: InputMaybe<Array<Scalars['Int']>>;
  timestamp_lt?: InputMaybe<Scalars['Int']>;
  timestamp_lte?: InputMaybe<Scalars['Int']>;
  timestamp_not?: InputMaybe<Scalars['Int']>;
  timestamp_not_in?: InputMaybe<Array<Scalars['Int']>>;
  transactionHash?: InputMaybe<Scalars['Bytes']>;
  transactionHash_contains?: InputMaybe<Scalars['Bytes']>;
  transactionHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
  transactionHash_not?: InputMaybe<Scalars['Bytes']>;
  transactionHash_not_contains?: InputMaybe<Scalars['Bytes']>;
  transactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  transactionOrigin?: InputMaybe<Scalars['Bytes']>;
  transactionOrigin_contains?: InputMaybe<Scalars['Bytes']>;
  transactionOrigin_in?: InputMaybe<Array<Scalars['Bytes']>>;
  transactionOrigin_not?: InputMaybe<Scalars['Bytes']>;
  transactionOrigin_not_contains?: InputMaybe<Scalars['Bytes']>;
  transactionOrigin_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
};

export enum AssetChange_OrderBy {
  Account = 'account',
  AssetType = 'assetType',
  BlockHash = 'blockHash',
  BlockNumber = 'blockNumber',
  Currency = 'currency',
  Id = 'id',
  Maturity = 'maturity',
  NotionalAfter = 'notionalAfter',
  NotionalBefore = 'notionalBefore',
  SettlementDate = 'settlementDate',
  Timestamp = 'timestamp',
  TransactionHash = 'transactionHash',
  TransactionOrigin = 'transactionOrigin'
}

export type AssetExchangeRate = {
  __typename?: 'AssetExchangeRate';
  /** Asset currency in the exchange rate */
  assetCurrency: Currency;
  /** Currency id that this asset rate refers to */
  id: Scalars['ID'];
  lastUpdateBlockHash: Scalars['Bytes'];
  lastUpdateBlockNumber: Scalars['Int'];
  lastUpdateTimestamp: Scalars['Int'];
  lastUpdateTransactionHash: Scalars['Bytes'];
  /** Asset rate adapter interface to the asset token */
  rateAdapterAddress: Scalars['Bytes'];
  /** Asset rates that fCash assets will settle at for given maturities */
  settlementRates?: Maybe<Array<SettlementRate>>;
  /** Decimal places of the underlying token to the asset token */
  underlyingDecimalPlaces: Scalars['Int'];
};


export type AssetExchangeRateSettlementRatesArgs = {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<SettlementRate_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<SettlementRate_Filter>;
};

export type AssetExchangeRateHistoricalData = {
  __typename?: 'AssetExchangeRateHistoricalData';
  currency: Currency;
  id: Scalars['ID'];
  timestamp: Scalars['Int'];
  value: Scalars['BigInt'];
};

export type AssetExchangeRateHistoricalData_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  currency?: InputMaybe<Scalars['String']>;
  currency_?: InputMaybe<Currency_Filter>;
  currency_contains?: InputMaybe<Scalars['String']>;
  currency_contains_nocase?: InputMaybe<Scalars['String']>;
  currency_ends_with?: InputMaybe<Scalars['String']>;
  currency_ends_with_nocase?: InputMaybe<Scalars['String']>;
  currency_gt?: InputMaybe<Scalars['String']>;
  currency_gte?: InputMaybe<Scalars['String']>;
  currency_in?: InputMaybe<Array<Scalars['String']>>;
  currency_lt?: InputMaybe<Scalars['String']>;
  currency_lte?: InputMaybe<Scalars['String']>;
  currency_not?: InputMaybe<Scalars['String']>;
  currency_not_contains?: InputMaybe<Scalars['String']>;
  currency_not_contains_nocase?: InputMaybe<Scalars['String']>;
  currency_not_ends_with?: InputMaybe<Scalars['String']>;
  currency_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  currency_not_in?: InputMaybe<Array<Scalars['String']>>;
  currency_not_starts_with?: InputMaybe<Scalars['String']>;
  currency_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  currency_starts_with?: InputMaybe<Scalars['String']>;
  currency_starts_with_nocase?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  timestamp?: InputMaybe<Scalars['Int']>;
  timestamp_gt?: InputMaybe<Scalars['Int']>;
  timestamp_gte?: InputMaybe<Scalars['Int']>;
  timestamp_in?: InputMaybe<Array<Scalars['Int']>>;
  timestamp_lt?: InputMaybe<Scalars['Int']>;
  timestamp_lte?: InputMaybe<Scalars['Int']>;
  timestamp_not?: InputMaybe<Scalars['Int']>;
  timestamp_not_in?: InputMaybe<Array<Scalars['Int']>>;
  value?: InputMaybe<Scalars['BigInt']>;
  value_gt?: InputMaybe<Scalars['BigInt']>;
  value_gte?: InputMaybe<Scalars['BigInt']>;
  value_in?: InputMaybe<Array<Scalars['BigInt']>>;
  value_lt?: InputMaybe<Scalars['BigInt']>;
  value_lte?: InputMaybe<Scalars['BigInt']>;
  value_not?: InputMaybe<Scalars['BigInt']>;
  value_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
};

export enum AssetExchangeRateHistoricalData_OrderBy {
  Currency = 'currency',
  Id = 'id',
  Timestamp = 'timestamp',
  Value = 'value'
}

export type AssetExchangeRate_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  assetCurrency?: InputMaybe<Scalars['String']>;
  assetCurrency_?: InputMaybe<Currency_Filter>;
  assetCurrency_contains?: InputMaybe<Scalars['String']>;
  assetCurrency_contains_nocase?: InputMaybe<Scalars['String']>;
  assetCurrency_ends_with?: InputMaybe<Scalars['String']>;
  assetCurrency_ends_with_nocase?: InputMaybe<Scalars['String']>;
  assetCurrency_gt?: InputMaybe<Scalars['String']>;
  assetCurrency_gte?: InputMaybe<Scalars['String']>;
  assetCurrency_in?: InputMaybe<Array<Scalars['String']>>;
  assetCurrency_lt?: InputMaybe<Scalars['String']>;
  assetCurrency_lte?: InputMaybe<Scalars['String']>;
  assetCurrency_not?: InputMaybe<Scalars['String']>;
  assetCurrency_not_contains?: InputMaybe<Scalars['String']>;
  assetCurrency_not_contains_nocase?: InputMaybe<Scalars['String']>;
  assetCurrency_not_ends_with?: InputMaybe<Scalars['String']>;
  assetCurrency_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  assetCurrency_not_in?: InputMaybe<Array<Scalars['String']>>;
  assetCurrency_not_starts_with?: InputMaybe<Scalars['String']>;
  assetCurrency_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  assetCurrency_starts_with?: InputMaybe<Scalars['String']>;
  assetCurrency_starts_with_nocase?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  lastUpdateBlockHash?: InputMaybe<Scalars['Bytes']>;
  lastUpdateBlockHash_contains?: InputMaybe<Scalars['Bytes']>;
  lastUpdateBlockHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
  lastUpdateBlockHash_not?: InputMaybe<Scalars['Bytes']>;
  lastUpdateBlockHash_not_contains?: InputMaybe<Scalars['Bytes']>;
  lastUpdateBlockHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  lastUpdateBlockNumber?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_gt?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_gte?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_in?: InputMaybe<Array<Scalars['Int']>>;
  lastUpdateBlockNumber_lt?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_lte?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_not?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_not_in?: InputMaybe<Array<Scalars['Int']>>;
  lastUpdateTimestamp?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_gt?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_gte?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_in?: InputMaybe<Array<Scalars['Int']>>;
  lastUpdateTimestamp_lt?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_lte?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_not?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_not_in?: InputMaybe<Array<Scalars['Int']>>;
  lastUpdateTransactionHash?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_contains?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
  lastUpdateTransactionHash_not?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_not_contains?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  rateAdapterAddress?: InputMaybe<Scalars['Bytes']>;
  rateAdapterAddress_contains?: InputMaybe<Scalars['Bytes']>;
  rateAdapterAddress_in?: InputMaybe<Array<Scalars['Bytes']>>;
  rateAdapterAddress_not?: InputMaybe<Scalars['Bytes']>;
  rateAdapterAddress_not_contains?: InputMaybe<Scalars['Bytes']>;
  rateAdapterAddress_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  settlementRates_?: InputMaybe<SettlementRate_Filter>;
  underlyingDecimalPlaces?: InputMaybe<Scalars['Int']>;
  underlyingDecimalPlaces_gt?: InputMaybe<Scalars['Int']>;
  underlyingDecimalPlaces_gte?: InputMaybe<Scalars['Int']>;
  underlyingDecimalPlaces_in?: InputMaybe<Array<Scalars['Int']>>;
  underlyingDecimalPlaces_lt?: InputMaybe<Scalars['Int']>;
  underlyingDecimalPlaces_lte?: InputMaybe<Scalars['Int']>;
  underlyingDecimalPlaces_not?: InputMaybe<Scalars['Int']>;
  underlyingDecimalPlaces_not_in?: InputMaybe<Array<Scalars['Int']>>;
};

export enum AssetExchangeRate_OrderBy {
  AssetCurrency = 'assetCurrency',
  Id = 'id',
  LastUpdateBlockHash = 'lastUpdateBlockHash',
  LastUpdateBlockNumber = 'lastUpdateBlockNumber',
  LastUpdateTimestamp = 'lastUpdateTimestamp',
  LastUpdateTransactionHash = 'lastUpdateTransactionHash',
  RateAdapterAddress = 'rateAdapterAddress',
  SettlementRates = 'settlementRates',
  UnderlyingDecimalPlaces = 'underlyingDecimalPlaces'
}

export type AssetTransfer = {
  __typename?: 'AssetTransfer';
  blockHash: Scalars['Bytes'];
  blockNumber: Scalars['Int'];
  fromAssetChange: AssetChange;
  /** from:to:assetId:Transaction hash */
  id: Scalars['ID'];
  timestamp: Scalars['Int'];
  toAssetChange: AssetChange;
  transactionHash: Scalars['Bytes'];
  transactionOrigin: Scalars['Bytes'];
};

export type AssetTransfer_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  blockHash?: InputMaybe<Scalars['Bytes']>;
  blockHash_contains?: InputMaybe<Scalars['Bytes']>;
  blockHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
  blockHash_not?: InputMaybe<Scalars['Bytes']>;
  blockHash_not_contains?: InputMaybe<Scalars['Bytes']>;
  blockHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  blockNumber?: InputMaybe<Scalars['Int']>;
  blockNumber_gt?: InputMaybe<Scalars['Int']>;
  blockNumber_gte?: InputMaybe<Scalars['Int']>;
  blockNumber_in?: InputMaybe<Array<Scalars['Int']>>;
  blockNumber_lt?: InputMaybe<Scalars['Int']>;
  blockNumber_lte?: InputMaybe<Scalars['Int']>;
  blockNumber_not?: InputMaybe<Scalars['Int']>;
  blockNumber_not_in?: InputMaybe<Array<Scalars['Int']>>;
  fromAssetChange?: InputMaybe<Scalars['String']>;
  fromAssetChange_?: InputMaybe<AssetChange_Filter>;
  fromAssetChange_contains?: InputMaybe<Scalars['String']>;
  fromAssetChange_contains_nocase?: InputMaybe<Scalars['String']>;
  fromAssetChange_ends_with?: InputMaybe<Scalars['String']>;
  fromAssetChange_ends_with_nocase?: InputMaybe<Scalars['String']>;
  fromAssetChange_gt?: InputMaybe<Scalars['String']>;
  fromAssetChange_gte?: InputMaybe<Scalars['String']>;
  fromAssetChange_in?: InputMaybe<Array<Scalars['String']>>;
  fromAssetChange_lt?: InputMaybe<Scalars['String']>;
  fromAssetChange_lte?: InputMaybe<Scalars['String']>;
  fromAssetChange_not?: InputMaybe<Scalars['String']>;
  fromAssetChange_not_contains?: InputMaybe<Scalars['String']>;
  fromAssetChange_not_contains_nocase?: InputMaybe<Scalars['String']>;
  fromAssetChange_not_ends_with?: InputMaybe<Scalars['String']>;
  fromAssetChange_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  fromAssetChange_not_in?: InputMaybe<Array<Scalars['String']>>;
  fromAssetChange_not_starts_with?: InputMaybe<Scalars['String']>;
  fromAssetChange_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  fromAssetChange_starts_with?: InputMaybe<Scalars['String']>;
  fromAssetChange_starts_with_nocase?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  timestamp?: InputMaybe<Scalars['Int']>;
  timestamp_gt?: InputMaybe<Scalars['Int']>;
  timestamp_gte?: InputMaybe<Scalars['Int']>;
  timestamp_in?: InputMaybe<Array<Scalars['Int']>>;
  timestamp_lt?: InputMaybe<Scalars['Int']>;
  timestamp_lte?: InputMaybe<Scalars['Int']>;
  timestamp_not?: InputMaybe<Scalars['Int']>;
  timestamp_not_in?: InputMaybe<Array<Scalars['Int']>>;
  toAssetChange?: InputMaybe<Scalars['String']>;
  toAssetChange_?: InputMaybe<AssetChange_Filter>;
  toAssetChange_contains?: InputMaybe<Scalars['String']>;
  toAssetChange_contains_nocase?: InputMaybe<Scalars['String']>;
  toAssetChange_ends_with?: InputMaybe<Scalars['String']>;
  toAssetChange_ends_with_nocase?: InputMaybe<Scalars['String']>;
  toAssetChange_gt?: InputMaybe<Scalars['String']>;
  toAssetChange_gte?: InputMaybe<Scalars['String']>;
  toAssetChange_in?: InputMaybe<Array<Scalars['String']>>;
  toAssetChange_lt?: InputMaybe<Scalars['String']>;
  toAssetChange_lte?: InputMaybe<Scalars['String']>;
  toAssetChange_not?: InputMaybe<Scalars['String']>;
  toAssetChange_not_contains?: InputMaybe<Scalars['String']>;
  toAssetChange_not_contains_nocase?: InputMaybe<Scalars['String']>;
  toAssetChange_not_ends_with?: InputMaybe<Scalars['String']>;
  toAssetChange_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  toAssetChange_not_in?: InputMaybe<Array<Scalars['String']>>;
  toAssetChange_not_starts_with?: InputMaybe<Scalars['String']>;
  toAssetChange_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  toAssetChange_starts_with?: InputMaybe<Scalars['String']>;
  toAssetChange_starts_with_nocase?: InputMaybe<Scalars['String']>;
  transactionHash?: InputMaybe<Scalars['Bytes']>;
  transactionHash_contains?: InputMaybe<Scalars['Bytes']>;
  transactionHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
  transactionHash_not?: InputMaybe<Scalars['Bytes']>;
  transactionHash_not_contains?: InputMaybe<Scalars['Bytes']>;
  transactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  transactionOrigin?: InputMaybe<Scalars['Bytes']>;
  transactionOrigin_contains?: InputMaybe<Scalars['Bytes']>;
  transactionOrigin_in?: InputMaybe<Array<Scalars['Bytes']>>;
  transactionOrigin_not?: InputMaybe<Scalars['Bytes']>;
  transactionOrigin_not_contains?: InputMaybe<Scalars['Bytes']>;
  transactionOrigin_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
};

export enum AssetTransfer_OrderBy {
  BlockHash = 'blockHash',
  BlockNumber = 'blockNumber',
  FromAssetChange = 'fromAssetChange',
  Id = 'id',
  Timestamp = 'timestamp',
  ToAssetChange = 'toAssetChange',
  TransactionHash = 'transactionHash',
  TransactionOrigin = 'transactionOrigin'
}

export enum AssetType {
  LiquidityToken_1Year = 'LiquidityToken_1Year',
  LiquidityToken_2Year = 'LiquidityToken_2Year',
  LiquidityToken_3Month = 'LiquidityToken_3Month',
  LiquidityToken_5Year = 'LiquidityToken_5Year',
  LiquidityToken_6Month = 'LiquidityToken_6Month',
  LiquidityToken_10Year = 'LiquidityToken_10Year',
  LiquidityToken_20Year = 'LiquidityToken_20Year',
  FCash = 'fCash'
}

export type Asset_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  assetType?: InputMaybe<AssetType>;
  assetType_in?: InputMaybe<Array<AssetType>>;
  assetType_not?: InputMaybe<AssetType>;
  assetType_not_in?: InputMaybe<Array<AssetType>>;
  currency?: InputMaybe<Scalars['String']>;
  currency_?: InputMaybe<Currency_Filter>;
  currency_contains?: InputMaybe<Scalars['String']>;
  currency_contains_nocase?: InputMaybe<Scalars['String']>;
  currency_ends_with?: InputMaybe<Scalars['String']>;
  currency_ends_with_nocase?: InputMaybe<Scalars['String']>;
  currency_gt?: InputMaybe<Scalars['String']>;
  currency_gte?: InputMaybe<Scalars['String']>;
  currency_in?: InputMaybe<Array<Scalars['String']>>;
  currency_lt?: InputMaybe<Scalars['String']>;
  currency_lte?: InputMaybe<Scalars['String']>;
  currency_not?: InputMaybe<Scalars['String']>;
  currency_not_contains?: InputMaybe<Scalars['String']>;
  currency_not_contains_nocase?: InputMaybe<Scalars['String']>;
  currency_not_ends_with?: InputMaybe<Scalars['String']>;
  currency_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  currency_not_in?: InputMaybe<Array<Scalars['String']>>;
  currency_not_starts_with?: InputMaybe<Scalars['String']>;
  currency_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  currency_starts_with?: InputMaybe<Scalars['String']>;
  currency_starts_with_nocase?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  lastUpdateBlockHash?: InputMaybe<Scalars['Bytes']>;
  lastUpdateBlockHash_contains?: InputMaybe<Scalars['Bytes']>;
  lastUpdateBlockHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
  lastUpdateBlockHash_not?: InputMaybe<Scalars['Bytes']>;
  lastUpdateBlockHash_not_contains?: InputMaybe<Scalars['Bytes']>;
  lastUpdateBlockHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  lastUpdateBlockNumber?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_gt?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_gte?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_in?: InputMaybe<Array<Scalars['Int']>>;
  lastUpdateBlockNumber_lt?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_lte?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_not?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_not_in?: InputMaybe<Array<Scalars['Int']>>;
  lastUpdateTimestamp?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_gt?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_gte?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_in?: InputMaybe<Array<Scalars['Int']>>;
  lastUpdateTimestamp_lt?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_lte?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_not?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_not_in?: InputMaybe<Array<Scalars['Int']>>;
  lastUpdateTransactionHash?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_contains?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
  lastUpdateTransactionHash_not?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_not_contains?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  maturity?: InputMaybe<Scalars['BigInt']>;
  maturity_gt?: InputMaybe<Scalars['BigInt']>;
  maturity_gte?: InputMaybe<Scalars['BigInt']>;
  maturity_in?: InputMaybe<Array<Scalars['BigInt']>>;
  maturity_lt?: InputMaybe<Scalars['BigInt']>;
  maturity_lte?: InputMaybe<Scalars['BigInt']>;
  maturity_not?: InputMaybe<Scalars['BigInt']>;
  maturity_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  notional?: InputMaybe<Scalars['BigInt']>;
  notional_gt?: InputMaybe<Scalars['BigInt']>;
  notional_gte?: InputMaybe<Scalars['BigInt']>;
  notional_in?: InputMaybe<Array<Scalars['BigInt']>>;
  notional_lt?: InputMaybe<Scalars['BigInt']>;
  notional_lte?: InputMaybe<Scalars['BigInt']>;
  notional_not?: InputMaybe<Scalars['BigInt']>;
  notional_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  settlementDate?: InputMaybe<Scalars['BigInt']>;
  settlementDate_gt?: InputMaybe<Scalars['BigInt']>;
  settlementDate_gte?: InputMaybe<Scalars['BigInt']>;
  settlementDate_in?: InputMaybe<Array<Scalars['BigInt']>>;
  settlementDate_lt?: InputMaybe<Scalars['BigInt']>;
  settlementDate_lte?: InputMaybe<Scalars['BigInt']>;
  settlementDate_not?: InputMaybe<Scalars['BigInt']>;
  settlementDate_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
};

export enum Asset_OrderBy {
  AssetType = 'assetType',
  Currency = 'currency',
  Id = 'id',
  LastUpdateBlockHash = 'lastUpdateBlockHash',
  LastUpdateBlockNumber = 'lastUpdateBlockNumber',
  LastUpdateTimestamp = 'lastUpdateTimestamp',
  LastUpdateTransactionHash = 'lastUpdateTransactionHash',
  Maturity = 'maturity',
  Notional = 'notional',
  SettlementDate = 'settlementDate'
}

export type AuthorizedCallbackContract = {
  __typename?: 'AuthorizedCallbackContract';
  /** Address of the callback contract */
  id: Scalars['ID'];
  lastUpdateBlockHash: Scalars['Bytes'];
  lastUpdateBlockNumber: Scalars['Int'];
  lastUpdateTimestamp: Scalars['Int'];
  lastUpdateTransactionHash: Scalars['Bytes'];
  name: Scalars['String'];
};

export type AuthorizedCallbackContract_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  id?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  lastUpdateBlockHash?: InputMaybe<Scalars['Bytes']>;
  lastUpdateBlockHash_contains?: InputMaybe<Scalars['Bytes']>;
  lastUpdateBlockHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
  lastUpdateBlockHash_not?: InputMaybe<Scalars['Bytes']>;
  lastUpdateBlockHash_not_contains?: InputMaybe<Scalars['Bytes']>;
  lastUpdateBlockHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  lastUpdateBlockNumber?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_gt?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_gte?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_in?: InputMaybe<Array<Scalars['Int']>>;
  lastUpdateBlockNumber_lt?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_lte?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_not?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_not_in?: InputMaybe<Array<Scalars['Int']>>;
  lastUpdateTimestamp?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_gt?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_gte?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_in?: InputMaybe<Array<Scalars['Int']>>;
  lastUpdateTimestamp_lt?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_lte?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_not?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_not_in?: InputMaybe<Array<Scalars['Int']>>;
  lastUpdateTransactionHash?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_contains?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
  lastUpdateTransactionHash_not?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_not_contains?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  name?: InputMaybe<Scalars['String']>;
  name_contains?: InputMaybe<Scalars['String']>;
  name_contains_nocase?: InputMaybe<Scalars['String']>;
  name_ends_with?: InputMaybe<Scalars['String']>;
  name_ends_with_nocase?: InputMaybe<Scalars['String']>;
  name_gt?: InputMaybe<Scalars['String']>;
  name_gte?: InputMaybe<Scalars['String']>;
  name_in?: InputMaybe<Array<Scalars['String']>>;
  name_lt?: InputMaybe<Scalars['String']>;
  name_lte?: InputMaybe<Scalars['String']>;
  name_not?: InputMaybe<Scalars['String']>;
  name_not_contains?: InputMaybe<Scalars['String']>;
  name_not_contains_nocase?: InputMaybe<Scalars['String']>;
  name_not_ends_with?: InputMaybe<Scalars['String']>;
  name_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  name_not_in?: InputMaybe<Array<Scalars['String']>>;
  name_not_starts_with?: InputMaybe<Scalars['String']>;
  name_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  name_starts_with?: InputMaybe<Scalars['String']>;
  name_starts_with_nocase?: InputMaybe<Scalars['String']>;
};

export enum AuthorizedCallbackContract_OrderBy {
  Id = 'id',
  LastUpdateBlockHash = 'lastUpdateBlockHash',
  LastUpdateBlockNumber = 'lastUpdateBlockNumber',
  LastUpdateTimestamp = 'lastUpdateTimestamp',
  LastUpdateTransactionHash = 'lastUpdateTransactionHash',
  Name = 'name'
}

export type Balance = {
  __typename?: 'Balance';
  /** Accumulator for incentive calculation */
  accountIncentiveDebt?: Maybe<Scalars['BigInt']>;
  /** Cash balance denominated in asset cash terms */
  assetCashBalance: Scalars['BigInt'];
  /** Reference to currency that this balance represents */
  currency: Currency;
  /** True if the account has migrated to the new incentive scheme */
  didMigrateIncentives?: Maybe<Scalars['Boolean']>;
  /** Account Address:Currency ID combination */
  id: Scalars['ID'];
  /** Last stored integral total supply amount, used to calculate incentives in the original method */
  lastClaimIntegralSupply?: Maybe<Scalars['BigInt']>;
  /** Last time token incentives were claimed on this balance */
  lastClaimTime: Scalars['Int'];
  lastUpdateBlockHash: Scalars['Bytes'];
  lastUpdateBlockNumber: Scalars['Int'];
  lastUpdateTimestamp: Scalars['Int'];
  lastUpdateTransactionHash: Scalars['Bytes'];
  /** nToken balance of this currency */
  nTokenBalance: Scalars['BigInt'];
};

export type BalanceChange = {
  __typename?: 'BalanceChange';
  account: Account;
  accountIncentiveDebtAfter?: Maybe<Scalars['BigInt']>;
  accountIncentiveDebtBefore?: Maybe<Scalars['BigInt']>;
  assetCashBalanceAfter: Scalars['BigInt'];
  assetCashBalanceBefore: Scalars['BigInt'];
  assetCashValueUnderlyingAfter: Scalars['BigInt'];
  assetCashValueUnderlyingBefore: Scalars['BigInt'];
  blockHash: Scalars['Bytes'];
  blockNumber: Scalars['Int'];
  currency: Currency;
  /** Currency ID:Account:Transaction hash:logIndex */
  id: Scalars['ID'];
  lastClaimIntegralSupplyAfter?: Maybe<Scalars['BigInt']>;
  lastClaimIntegralSupplyBefore?: Maybe<Scalars['BigInt']>;
  lastClaimTimeAfter: Scalars['Int'];
  lastClaimTimeBefore: Scalars['Int'];
  nTokenBalanceAfter: Scalars['BigInt'];
  nTokenBalanceBefore: Scalars['BigInt'];
  nTokenValueAssetAfter: Scalars['BigInt'];
  nTokenValueAssetBefore: Scalars['BigInt'];
  nTokenValueUnderlyingAfter: Scalars['BigInt'];
  nTokenValueUnderlyingBefore: Scalars['BigInt'];
  timestamp: Scalars['Int'];
  transactionHash: Scalars['Bytes'];
  transactionOrigin: Scalars['Bytes'];
};

export type BalanceChange_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  account?: InputMaybe<Scalars['String']>;
  accountIncentiveDebtAfter?: InputMaybe<Scalars['BigInt']>;
  accountIncentiveDebtAfter_gt?: InputMaybe<Scalars['BigInt']>;
  accountIncentiveDebtAfter_gte?: InputMaybe<Scalars['BigInt']>;
  accountIncentiveDebtAfter_in?: InputMaybe<Array<Scalars['BigInt']>>;
  accountIncentiveDebtAfter_lt?: InputMaybe<Scalars['BigInt']>;
  accountIncentiveDebtAfter_lte?: InputMaybe<Scalars['BigInt']>;
  accountIncentiveDebtAfter_not?: InputMaybe<Scalars['BigInt']>;
  accountIncentiveDebtAfter_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  accountIncentiveDebtBefore?: InputMaybe<Scalars['BigInt']>;
  accountIncentiveDebtBefore_gt?: InputMaybe<Scalars['BigInt']>;
  accountIncentiveDebtBefore_gte?: InputMaybe<Scalars['BigInt']>;
  accountIncentiveDebtBefore_in?: InputMaybe<Array<Scalars['BigInt']>>;
  accountIncentiveDebtBefore_lt?: InputMaybe<Scalars['BigInt']>;
  accountIncentiveDebtBefore_lte?: InputMaybe<Scalars['BigInt']>;
  accountIncentiveDebtBefore_not?: InputMaybe<Scalars['BigInt']>;
  accountIncentiveDebtBefore_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  account_?: InputMaybe<Account_Filter>;
  account_contains?: InputMaybe<Scalars['String']>;
  account_contains_nocase?: InputMaybe<Scalars['String']>;
  account_ends_with?: InputMaybe<Scalars['String']>;
  account_ends_with_nocase?: InputMaybe<Scalars['String']>;
  account_gt?: InputMaybe<Scalars['String']>;
  account_gte?: InputMaybe<Scalars['String']>;
  account_in?: InputMaybe<Array<Scalars['String']>>;
  account_lt?: InputMaybe<Scalars['String']>;
  account_lte?: InputMaybe<Scalars['String']>;
  account_not?: InputMaybe<Scalars['String']>;
  account_not_contains?: InputMaybe<Scalars['String']>;
  account_not_contains_nocase?: InputMaybe<Scalars['String']>;
  account_not_ends_with?: InputMaybe<Scalars['String']>;
  account_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  account_not_in?: InputMaybe<Array<Scalars['String']>>;
  account_not_starts_with?: InputMaybe<Scalars['String']>;
  account_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  account_starts_with?: InputMaybe<Scalars['String']>;
  account_starts_with_nocase?: InputMaybe<Scalars['String']>;
  assetCashBalanceAfter?: InputMaybe<Scalars['BigInt']>;
  assetCashBalanceAfter_gt?: InputMaybe<Scalars['BigInt']>;
  assetCashBalanceAfter_gte?: InputMaybe<Scalars['BigInt']>;
  assetCashBalanceAfter_in?: InputMaybe<Array<Scalars['BigInt']>>;
  assetCashBalanceAfter_lt?: InputMaybe<Scalars['BigInt']>;
  assetCashBalanceAfter_lte?: InputMaybe<Scalars['BigInt']>;
  assetCashBalanceAfter_not?: InputMaybe<Scalars['BigInt']>;
  assetCashBalanceAfter_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  assetCashBalanceBefore?: InputMaybe<Scalars['BigInt']>;
  assetCashBalanceBefore_gt?: InputMaybe<Scalars['BigInt']>;
  assetCashBalanceBefore_gte?: InputMaybe<Scalars['BigInt']>;
  assetCashBalanceBefore_in?: InputMaybe<Array<Scalars['BigInt']>>;
  assetCashBalanceBefore_lt?: InputMaybe<Scalars['BigInt']>;
  assetCashBalanceBefore_lte?: InputMaybe<Scalars['BigInt']>;
  assetCashBalanceBefore_not?: InputMaybe<Scalars['BigInt']>;
  assetCashBalanceBefore_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  assetCashValueUnderlyingAfter?: InputMaybe<Scalars['BigInt']>;
  assetCashValueUnderlyingAfter_gt?: InputMaybe<Scalars['BigInt']>;
  assetCashValueUnderlyingAfter_gte?: InputMaybe<Scalars['BigInt']>;
  assetCashValueUnderlyingAfter_in?: InputMaybe<Array<Scalars['BigInt']>>;
  assetCashValueUnderlyingAfter_lt?: InputMaybe<Scalars['BigInt']>;
  assetCashValueUnderlyingAfter_lte?: InputMaybe<Scalars['BigInt']>;
  assetCashValueUnderlyingAfter_not?: InputMaybe<Scalars['BigInt']>;
  assetCashValueUnderlyingAfter_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  assetCashValueUnderlyingBefore?: InputMaybe<Scalars['BigInt']>;
  assetCashValueUnderlyingBefore_gt?: InputMaybe<Scalars['BigInt']>;
  assetCashValueUnderlyingBefore_gte?: InputMaybe<Scalars['BigInt']>;
  assetCashValueUnderlyingBefore_in?: InputMaybe<Array<Scalars['BigInt']>>;
  assetCashValueUnderlyingBefore_lt?: InputMaybe<Scalars['BigInt']>;
  assetCashValueUnderlyingBefore_lte?: InputMaybe<Scalars['BigInt']>;
  assetCashValueUnderlyingBefore_not?: InputMaybe<Scalars['BigInt']>;
  assetCashValueUnderlyingBefore_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  blockHash?: InputMaybe<Scalars['Bytes']>;
  blockHash_contains?: InputMaybe<Scalars['Bytes']>;
  blockHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
  blockHash_not?: InputMaybe<Scalars['Bytes']>;
  blockHash_not_contains?: InputMaybe<Scalars['Bytes']>;
  blockHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  blockNumber?: InputMaybe<Scalars['Int']>;
  blockNumber_gt?: InputMaybe<Scalars['Int']>;
  blockNumber_gte?: InputMaybe<Scalars['Int']>;
  blockNumber_in?: InputMaybe<Array<Scalars['Int']>>;
  blockNumber_lt?: InputMaybe<Scalars['Int']>;
  blockNumber_lte?: InputMaybe<Scalars['Int']>;
  blockNumber_not?: InputMaybe<Scalars['Int']>;
  blockNumber_not_in?: InputMaybe<Array<Scalars['Int']>>;
  currency?: InputMaybe<Scalars['String']>;
  currency_?: InputMaybe<Currency_Filter>;
  currency_contains?: InputMaybe<Scalars['String']>;
  currency_contains_nocase?: InputMaybe<Scalars['String']>;
  currency_ends_with?: InputMaybe<Scalars['String']>;
  currency_ends_with_nocase?: InputMaybe<Scalars['String']>;
  currency_gt?: InputMaybe<Scalars['String']>;
  currency_gte?: InputMaybe<Scalars['String']>;
  currency_in?: InputMaybe<Array<Scalars['String']>>;
  currency_lt?: InputMaybe<Scalars['String']>;
  currency_lte?: InputMaybe<Scalars['String']>;
  currency_not?: InputMaybe<Scalars['String']>;
  currency_not_contains?: InputMaybe<Scalars['String']>;
  currency_not_contains_nocase?: InputMaybe<Scalars['String']>;
  currency_not_ends_with?: InputMaybe<Scalars['String']>;
  currency_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  currency_not_in?: InputMaybe<Array<Scalars['String']>>;
  currency_not_starts_with?: InputMaybe<Scalars['String']>;
  currency_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  currency_starts_with?: InputMaybe<Scalars['String']>;
  currency_starts_with_nocase?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  lastClaimIntegralSupplyAfter?: InputMaybe<Scalars['BigInt']>;
  lastClaimIntegralSupplyAfter_gt?: InputMaybe<Scalars['BigInt']>;
  lastClaimIntegralSupplyAfter_gte?: InputMaybe<Scalars['BigInt']>;
  lastClaimIntegralSupplyAfter_in?: InputMaybe<Array<Scalars['BigInt']>>;
  lastClaimIntegralSupplyAfter_lt?: InputMaybe<Scalars['BigInt']>;
  lastClaimIntegralSupplyAfter_lte?: InputMaybe<Scalars['BigInt']>;
  lastClaimIntegralSupplyAfter_not?: InputMaybe<Scalars['BigInt']>;
  lastClaimIntegralSupplyAfter_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  lastClaimIntegralSupplyBefore?: InputMaybe<Scalars['BigInt']>;
  lastClaimIntegralSupplyBefore_gt?: InputMaybe<Scalars['BigInt']>;
  lastClaimIntegralSupplyBefore_gte?: InputMaybe<Scalars['BigInt']>;
  lastClaimIntegralSupplyBefore_in?: InputMaybe<Array<Scalars['BigInt']>>;
  lastClaimIntegralSupplyBefore_lt?: InputMaybe<Scalars['BigInt']>;
  lastClaimIntegralSupplyBefore_lte?: InputMaybe<Scalars['BigInt']>;
  lastClaimIntegralSupplyBefore_not?: InputMaybe<Scalars['BigInt']>;
  lastClaimIntegralSupplyBefore_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  lastClaimTimeAfter?: InputMaybe<Scalars['Int']>;
  lastClaimTimeAfter_gt?: InputMaybe<Scalars['Int']>;
  lastClaimTimeAfter_gte?: InputMaybe<Scalars['Int']>;
  lastClaimTimeAfter_in?: InputMaybe<Array<Scalars['Int']>>;
  lastClaimTimeAfter_lt?: InputMaybe<Scalars['Int']>;
  lastClaimTimeAfter_lte?: InputMaybe<Scalars['Int']>;
  lastClaimTimeAfter_not?: InputMaybe<Scalars['Int']>;
  lastClaimTimeAfter_not_in?: InputMaybe<Array<Scalars['Int']>>;
  lastClaimTimeBefore?: InputMaybe<Scalars['Int']>;
  lastClaimTimeBefore_gt?: InputMaybe<Scalars['Int']>;
  lastClaimTimeBefore_gte?: InputMaybe<Scalars['Int']>;
  lastClaimTimeBefore_in?: InputMaybe<Array<Scalars['Int']>>;
  lastClaimTimeBefore_lt?: InputMaybe<Scalars['Int']>;
  lastClaimTimeBefore_lte?: InputMaybe<Scalars['Int']>;
  lastClaimTimeBefore_not?: InputMaybe<Scalars['Int']>;
  lastClaimTimeBefore_not_in?: InputMaybe<Array<Scalars['Int']>>;
  nTokenBalanceAfter?: InputMaybe<Scalars['BigInt']>;
  nTokenBalanceAfter_gt?: InputMaybe<Scalars['BigInt']>;
  nTokenBalanceAfter_gte?: InputMaybe<Scalars['BigInt']>;
  nTokenBalanceAfter_in?: InputMaybe<Array<Scalars['BigInt']>>;
  nTokenBalanceAfter_lt?: InputMaybe<Scalars['BigInt']>;
  nTokenBalanceAfter_lte?: InputMaybe<Scalars['BigInt']>;
  nTokenBalanceAfter_not?: InputMaybe<Scalars['BigInt']>;
  nTokenBalanceAfter_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  nTokenBalanceBefore?: InputMaybe<Scalars['BigInt']>;
  nTokenBalanceBefore_gt?: InputMaybe<Scalars['BigInt']>;
  nTokenBalanceBefore_gte?: InputMaybe<Scalars['BigInt']>;
  nTokenBalanceBefore_in?: InputMaybe<Array<Scalars['BigInt']>>;
  nTokenBalanceBefore_lt?: InputMaybe<Scalars['BigInt']>;
  nTokenBalanceBefore_lte?: InputMaybe<Scalars['BigInt']>;
  nTokenBalanceBefore_not?: InputMaybe<Scalars['BigInt']>;
  nTokenBalanceBefore_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  nTokenValueAssetAfter?: InputMaybe<Scalars['BigInt']>;
  nTokenValueAssetAfter_gt?: InputMaybe<Scalars['BigInt']>;
  nTokenValueAssetAfter_gte?: InputMaybe<Scalars['BigInt']>;
  nTokenValueAssetAfter_in?: InputMaybe<Array<Scalars['BigInt']>>;
  nTokenValueAssetAfter_lt?: InputMaybe<Scalars['BigInt']>;
  nTokenValueAssetAfter_lte?: InputMaybe<Scalars['BigInt']>;
  nTokenValueAssetAfter_not?: InputMaybe<Scalars['BigInt']>;
  nTokenValueAssetAfter_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  nTokenValueAssetBefore?: InputMaybe<Scalars['BigInt']>;
  nTokenValueAssetBefore_gt?: InputMaybe<Scalars['BigInt']>;
  nTokenValueAssetBefore_gte?: InputMaybe<Scalars['BigInt']>;
  nTokenValueAssetBefore_in?: InputMaybe<Array<Scalars['BigInt']>>;
  nTokenValueAssetBefore_lt?: InputMaybe<Scalars['BigInt']>;
  nTokenValueAssetBefore_lte?: InputMaybe<Scalars['BigInt']>;
  nTokenValueAssetBefore_not?: InputMaybe<Scalars['BigInt']>;
  nTokenValueAssetBefore_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  nTokenValueUnderlyingAfter?: InputMaybe<Scalars['BigInt']>;
  nTokenValueUnderlyingAfter_gt?: InputMaybe<Scalars['BigInt']>;
  nTokenValueUnderlyingAfter_gte?: InputMaybe<Scalars['BigInt']>;
  nTokenValueUnderlyingAfter_in?: InputMaybe<Array<Scalars['BigInt']>>;
  nTokenValueUnderlyingAfter_lt?: InputMaybe<Scalars['BigInt']>;
  nTokenValueUnderlyingAfter_lte?: InputMaybe<Scalars['BigInt']>;
  nTokenValueUnderlyingAfter_not?: InputMaybe<Scalars['BigInt']>;
  nTokenValueUnderlyingAfter_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  nTokenValueUnderlyingBefore?: InputMaybe<Scalars['BigInt']>;
  nTokenValueUnderlyingBefore_gt?: InputMaybe<Scalars['BigInt']>;
  nTokenValueUnderlyingBefore_gte?: InputMaybe<Scalars['BigInt']>;
  nTokenValueUnderlyingBefore_in?: InputMaybe<Array<Scalars['BigInt']>>;
  nTokenValueUnderlyingBefore_lt?: InputMaybe<Scalars['BigInt']>;
  nTokenValueUnderlyingBefore_lte?: InputMaybe<Scalars['BigInt']>;
  nTokenValueUnderlyingBefore_not?: InputMaybe<Scalars['BigInt']>;
  nTokenValueUnderlyingBefore_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  timestamp?: InputMaybe<Scalars['Int']>;
  timestamp_gt?: InputMaybe<Scalars['Int']>;
  timestamp_gte?: InputMaybe<Scalars['Int']>;
  timestamp_in?: InputMaybe<Array<Scalars['Int']>>;
  timestamp_lt?: InputMaybe<Scalars['Int']>;
  timestamp_lte?: InputMaybe<Scalars['Int']>;
  timestamp_not?: InputMaybe<Scalars['Int']>;
  timestamp_not_in?: InputMaybe<Array<Scalars['Int']>>;
  transactionHash?: InputMaybe<Scalars['Bytes']>;
  transactionHash_contains?: InputMaybe<Scalars['Bytes']>;
  transactionHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
  transactionHash_not?: InputMaybe<Scalars['Bytes']>;
  transactionHash_not_contains?: InputMaybe<Scalars['Bytes']>;
  transactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  transactionOrigin?: InputMaybe<Scalars['Bytes']>;
  transactionOrigin_contains?: InputMaybe<Scalars['Bytes']>;
  transactionOrigin_in?: InputMaybe<Array<Scalars['Bytes']>>;
  transactionOrigin_not?: InputMaybe<Scalars['Bytes']>;
  transactionOrigin_not_contains?: InputMaybe<Scalars['Bytes']>;
  transactionOrigin_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
};

export enum BalanceChange_OrderBy {
  Account = 'account',
  AccountIncentiveDebtAfter = 'accountIncentiveDebtAfter',
  AccountIncentiveDebtBefore = 'accountIncentiveDebtBefore',
  AssetCashBalanceAfter = 'assetCashBalanceAfter',
  AssetCashBalanceBefore = 'assetCashBalanceBefore',
  AssetCashValueUnderlyingAfter = 'assetCashValueUnderlyingAfter',
  AssetCashValueUnderlyingBefore = 'assetCashValueUnderlyingBefore',
  BlockHash = 'blockHash',
  BlockNumber = 'blockNumber',
  Currency = 'currency',
  Id = 'id',
  LastClaimIntegralSupplyAfter = 'lastClaimIntegralSupplyAfter',
  LastClaimIntegralSupplyBefore = 'lastClaimIntegralSupplyBefore',
  LastClaimTimeAfter = 'lastClaimTimeAfter',
  LastClaimTimeBefore = 'lastClaimTimeBefore',
  NTokenBalanceAfter = 'nTokenBalanceAfter',
  NTokenBalanceBefore = 'nTokenBalanceBefore',
  NTokenValueAssetAfter = 'nTokenValueAssetAfter',
  NTokenValueAssetBefore = 'nTokenValueAssetBefore',
  NTokenValueUnderlyingAfter = 'nTokenValueUnderlyingAfter',
  NTokenValueUnderlyingBefore = 'nTokenValueUnderlyingBefore',
  Timestamp = 'timestamp',
  TransactionHash = 'transactionHash',
  TransactionOrigin = 'transactionOrigin'
}

export type Balance_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  accountIncentiveDebt?: InputMaybe<Scalars['BigInt']>;
  accountIncentiveDebt_gt?: InputMaybe<Scalars['BigInt']>;
  accountIncentiveDebt_gte?: InputMaybe<Scalars['BigInt']>;
  accountIncentiveDebt_in?: InputMaybe<Array<Scalars['BigInt']>>;
  accountIncentiveDebt_lt?: InputMaybe<Scalars['BigInt']>;
  accountIncentiveDebt_lte?: InputMaybe<Scalars['BigInt']>;
  accountIncentiveDebt_not?: InputMaybe<Scalars['BigInt']>;
  accountIncentiveDebt_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  assetCashBalance?: InputMaybe<Scalars['BigInt']>;
  assetCashBalance_gt?: InputMaybe<Scalars['BigInt']>;
  assetCashBalance_gte?: InputMaybe<Scalars['BigInt']>;
  assetCashBalance_in?: InputMaybe<Array<Scalars['BigInt']>>;
  assetCashBalance_lt?: InputMaybe<Scalars['BigInt']>;
  assetCashBalance_lte?: InputMaybe<Scalars['BigInt']>;
  assetCashBalance_not?: InputMaybe<Scalars['BigInt']>;
  assetCashBalance_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  currency?: InputMaybe<Scalars['String']>;
  currency_?: InputMaybe<Currency_Filter>;
  currency_contains?: InputMaybe<Scalars['String']>;
  currency_contains_nocase?: InputMaybe<Scalars['String']>;
  currency_ends_with?: InputMaybe<Scalars['String']>;
  currency_ends_with_nocase?: InputMaybe<Scalars['String']>;
  currency_gt?: InputMaybe<Scalars['String']>;
  currency_gte?: InputMaybe<Scalars['String']>;
  currency_in?: InputMaybe<Array<Scalars['String']>>;
  currency_lt?: InputMaybe<Scalars['String']>;
  currency_lte?: InputMaybe<Scalars['String']>;
  currency_not?: InputMaybe<Scalars['String']>;
  currency_not_contains?: InputMaybe<Scalars['String']>;
  currency_not_contains_nocase?: InputMaybe<Scalars['String']>;
  currency_not_ends_with?: InputMaybe<Scalars['String']>;
  currency_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  currency_not_in?: InputMaybe<Array<Scalars['String']>>;
  currency_not_starts_with?: InputMaybe<Scalars['String']>;
  currency_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  currency_starts_with?: InputMaybe<Scalars['String']>;
  currency_starts_with_nocase?: InputMaybe<Scalars['String']>;
  didMigrateIncentives?: InputMaybe<Scalars['Boolean']>;
  didMigrateIncentives_in?: InputMaybe<Array<Scalars['Boolean']>>;
  didMigrateIncentives_not?: InputMaybe<Scalars['Boolean']>;
  didMigrateIncentives_not_in?: InputMaybe<Array<Scalars['Boolean']>>;
  id?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  lastClaimIntegralSupply?: InputMaybe<Scalars['BigInt']>;
  lastClaimIntegralSupply_gt?: InputMaybe<Scalars['BigInt']>;
  lastClaimIntegralSupply_gte?: InputMaybe<Scalars['BigInt']>;
  lastClaimIntegralSupply_in?: InputMaybe<Array<Scalars['BigInt']>>;
  lastClaimIntegralSupply_lt?: InputMaybe<Scalars['BigInt']>;
  lastClaimIntegralSupply_lte?: InputMaybe<Scalars['BigInt']>;
  lastClaimIntegralSupply_not?: InputMaybe<Scalars['BigInt']>;
  lastClaimIntegralSupply_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  lastClaimTime?: InputMaybe<Scalars['Int']>;
  lastClaimTime_gt?: InputMaybe<Scalars['Int']>;
  lastClaimTime_gte?: InputMaybe<Scalars['Int']>;
  lastClaimTime_in?: InputMaybe<Array<Scalars['Int']>>;
  lastClaimTime_lt?: InputMaybe<Scalars['Int']>;
  lastClaimTime_lte?: InputMaybe<Scalars['Int']>;
  lastClaimTime_not?: InputMaybe<Scalars['Int']>;
  lastClaimTime_not_in?: InputMaybe<Array<Scalars['Int']>>;
  lastUpdateBlockHash?: InputMaybe<Scalars['Bytes']>;
  lastUpdateBlockHash_contains?: InputMaybe<Scalars['Bytes']>;
  lastUpdateBlockHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
  lastUpdateBlockHash_not?: InputMaybe<Scalars['Bytes']>;
  lastUpdateBlockHash_not_contains?: InputMaybe<Scalars['Bytes']>;
  lastUpdateBlockHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  lastUpdateBlockNumber?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_gt?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_gte?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_in?: InputMaybe<Array<Scalars['Int']>>;
  lastUpdateBlockNumber_lt?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_lte?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_not?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_not_in?: InputMaybe<Array<Scalars['Int']>>;
  lastUpdateTimestamp?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_gt?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_gte?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_in?: InputMaybe<Array<Scalars['Int']>>;
  lastUpdateTimestamp_lt?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_lte?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_not?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_not_in?: InputMaybe<Array<Scalars['Int']>>;
  lastUpdateTransactionHash?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_contains?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
  lastUpdateTransactionHash_not?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_not_contains?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  nTokenBalance?: InputMaybe<Scalars['BigInt']>;
  nTokenBalance_gt?: InputMaybe<Scalars['BigInt']>;
  nTokenBalance_gte?: InputMaybe<Scalars['BigInt']>;
  nTokenBalance_in?: InputMaybe<Array<Scalars['BigInt']>>;
  nTokenBalance_lt?: InputMaybe<Scalars['BigInt']>;
  nTokenBalance_lte?: InputMaybe<Scalars['BigInt']>;
  nTokenBalance_not?: InputMaybe<Scalars['BigInt']>;
  nTokenBalance_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
};

export enum Balance_OrderBy {
  AccountIncentiveDebt = 'accountIncentiveDebt',
  AssetCashBalance = 'assetCashBalance',
  Currency = 'currency',
  DidMigrateIncentives = 'didMigrateIncentives',
  Id = 'id',
  LastClaimIntegralSupply = 'lastClaimIntegralSupply',
  LastClaimTime = 'lastClaimTime',
  LastUpdateBlockHash = 'lastUpdateBlockHash',
  LastUpdateBlockNumber = 'lastUpdateBlockNumber',
  LastUpdateTimestamp = 'lastUpdateTimestamp',
  LastUpdateTransactionHash = 'lastUpdateTransactionHash',
  NTokenBalance = 'nTokenBalance'
}

export type BlockChangedFilter = {
  number_gte: Scalars['Int'];
};

export type Block_Height = {
  hash?: InputMaybe<Scalars['Bytes']>;
  number?: InputMaybe<Scalars['Int']>;
  number_gte?: InputMaybe<Scalars['Int']>;
};

export type CompBalance = {
  __typename?: 'COMPBalance';
  id: Scalars['ID'];
  timestamp: Scalars['Int'];
  usdValue: Scalars['BigInt'];
  value: Scalars['BigInt'];
};

export type CompBalance_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  id?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  timestamp?: InputMaybe<Scalars['Int']>;
  timestamp_gt?: InputMaybe<Scalars['Int']>;
  timestamp_gte?: InputMaybe<Scalars['Int']>;
  timestamp_in?: InputMaybe<Array<Scalars['Int']>>;
  timestamp_lt?: InputMaybe<Scalars['Int']>;
  timestamp_lte?: InputMaybe<Scalars['Int']>;
  timestamp_not?: InputMaybe<Scalars['Int']>;
  timestamp_not_in?: InputMaybe<Array<Scalars['Int']>>;
  usdValue?: InputMaybe<Scalars['BigInt']>;
  usdValue_gt?: InputMaybe<Scalars['BigInt']>;
  usdValue_gte?: InputMaybe<Scalars['BigInt']>;
  usdValue_in?: InputMaybe<Array<Scalars['BigInt']>>;
  usdValue_lt?: InputMaybe<Scalars['BigInt']>;
  usdValue_lte?: InputMaybe<Scalars['BigInt']>;
  usdValue_not?: InputMaybe<Scalars['BigInt']>;
  usdValue_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  value?: InputMaybe<Scalars['BigInt']>;
  value_gt?: InputMaybe<Scalars['BigInt']>;
  value_gte?: InputMaybe<Scalars['BigInt']>;
  value_in?: InputMaybe<Array<Scalars['BigInt']>>;
  value_lt?: InputMaybe<Scalars['BigInt']>;
  value_lte?: InputMaybe<Scalars['BigInt']>;
  value_not?: InputMaybe<Scalars['BigInt']>;
  value_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
};

export enum CompBalance_OrderBy {
  Id = 'id',
  Timestamp = 'timestamp',
  UsdValue = 'usdValue',
  Value = 'value'
}

export type CashGroup = {
  __typename?: 'CashGroup';
  /** Currency of this cash group */
  currency: Currency;
  /** Debt buffer specified in basis points */
  debtBufferBasisPoints: Scalars['Int'];
  /** fCash haircut specified in basis points */
  fCashHaircutBasisPoints: Scalars['Int'];
  /** Currency id that this cash group refers to */
  id: Scalars['ID'];
  lastUpdateBlockHash: Scalars['Bytes'];
  lastUpdateBlockNumber: Scalars['Int'];
  lastUpdateTimestamp: Scalars['Int'];
  lastUpdateTransactionHash: Scalars['Bytes'];
  /** Discount on negative fCash given to the liquidator in basis points */
  liquidationDebtBufferBasisPoints: Scalars['Int'];
  /** Discount on fCash given to the liquidator in basis points */
  liquidationfCashHaircutBasisPoints: Scalars['Int'];
  /** Liquidity token haircut applied to cash claims, specified as a percentage between 0 and 100 */
  liquidityTokenHaircutsPercent: Array<Scalars['Int']>;
  /** Index of the AMMs on chain that will be made available. */
  maxMarketIndex: Scalars['Int'];
  /** Maximum length of a market maturity in seconds */
  maxMarketMaturityLengthSeconds: Scalars['Int'];
  nToken: NToken;
  /** Time window in minutes that the rate oracle will be averaged over */
  rateOracleTimeWindowSeconds: Scalars['Int'];
  /** Rate scalar used to determine the slippage of the market */
  rateScalars: Array<Scalars['Int']>;
  /** Current size of reserves accumulated for this cash group */
  reserveBalance: Scalars['BigInt'];
  /** The minimum threshold of the reserve before they are harvested for buybacks */
  reserveBuffer?: Maybe<Scalars['BigInt']>;
  /** Share of the fees given to the protocol, denominated in percentage */
  reserveFeeSharePercent: Scalars['Int'];
  /** Penalty for settling a negative cash debt in basis points */
  settlementPenaltyRateBasisPoints: Scalars['Int'];
  /** Total fees per trade, specified in basis points */
  totalFeeBasisPoints: Scalars['Int'];
};

export type CashGroup_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  currency?: InputMaybe<Scalars['String']>;
  currency_?: InputMaybe<Currency_Filter>;
  currency_contains?: InputMaybe<Scalars['String']>;
  currency_contains_nocase?: InputMaybe<Scalars['String']>;
  currency_ends_with?: InputMaybe<Scalars['String']>;
  currency_ends_with_nocase?: InputMaybe<Scalars['String']>;
  currency_gt?: InputMaybe<Scalars['String']>;
  currency_gte?: InputMaybe<Scalars['String']>;
  currency_in?: InputMaybe<Array<Scalars['String']>>;
  currency_lt?: InputMaybe<Scalars['String']>;
  currency_lte?: InputMaybe<Scalars['String']>;
  currency_not?: InputMaybe<Scalars['String']>;
  currency_not_contains?: InputMaybe<Scalars['String']>;
  currency_not_contains_nocase?: InputMaybe<Scalars['String']>;
  currency_not_ends_with?: InputMaybe<Scalars['String']>;
  currency_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  currency_not_in?: InputMaybe<Array<Scalars['String']>>;
  currency_not_starts_with?: InputMaybe<Scalars['String']>;
  currency_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  currency_starts_with?: InputMaybe<Scalars['String']>;
  currency_starts_with_nocase?: InputMaybe<Scalars['String']>;
  debtBufferBasisPoints?: InputMaybe<Scalars['Int']>;
  debtBufferBasisPoints_gt?: InputMaybe<Scalars['Int']>;
  debtBufferBasisPoints_gte?: InputMaybe<Scalars['Int']>;
  debtBufferBasisPoints_in?: InputMaybe<Array<Scalars['Int']>>;
  debtBufferBasisPoints_lt?: InputMaybe<Scalars['Int']>;
  debtBufferBasisPoints_lte?: InputMaybe<Scalars['Int']>;
  debtBufferBasisPoints_not?: InputMaybe<Scalars['Int']>;
  debtBufferBasisPoints_not_in?: InputMaybe<Array<Scalars['Int']>>;
  fCashHaircutBasisPoints?: InputMaybe<Scalars['Int']>;
  fCashHaircutBasisPoints_gt?: InputMaybe<Scalars['Int']>;
  fCashHaircutBasisPoints_gte?: InputMaybe<Scalars['Int']>;
  fCashHaircutBasisPoints_in?: InputMaybe<Array<Scalars['Int']>>;
  fCashHaircutBasisPoints_lt?: InputMaybe<Scalars['Int']>;
  fCashHaircutBasisPoints_lte?: InputMaybe<Scalars['Int']>;
  fCashHaircutBasisPoints_not?: InputMaybe<Scalars['Int']>;
  fCashHaircutBasisPoints_not_in?: InputMaybe<Array<Scalars['Int']>>;
  id?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  lastUpdateBlockHash?: InputMaybe<Scalars['Bytes']>;
  lastUpdateBlockHash_contains?: InputMaybe<Scalars['Bytes']>;
  lastUpdateBlockHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
  lastUpdateBlockHash_not?: InputMaybe<Scalars['Bytes']>;
  lastUpdateBlockHash_not_contains?: InputMaybe<Scalars['Bytes']>;
  lastUpdateBlockHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  lastUpdateBlockNumber?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_gt?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_gte?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_in?: InputMaybe<Array<Scalars['Int']>>;
  lastUpdateBlockNumber_lt?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_lte?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_not?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_not_in?: InputMaybe<Array<Scalars['Int']>>;
  lastUpdateTimestamp?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_gt?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_gte?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_in?: InputMaybe<Array<Scalars['Int']>>;
  lastUpdateTimestamp_lt?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_lte?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_not?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_not_in?: InputMaybe<Array<Scalars['Int']>>;
  lastUpdateTransactionHash?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_contains?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
  lastUpdateTransactionHash_not?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_not_contains?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  liquidationDebtBufferBasisPoints?: InputMaybe<Scalars['Int']>;
  liquidationDebtBufferBasisPoints_gt?: InputMaybe<Scalars['Int']>;
  liquidationDebtBufferBasisPoints_gte?: InputMaybe<Scalars['Int']>;
  liquidationDebtBufferBasisPoints_in?: InputMaybe<Array<Scalars['Int']>>;
  liquidationDebtBufferBasisPoints_lt?: InputMaybe<Scalars['Int']>;
  liquidationDebtBufferBasisPoints_lte?: InputMaybe<Scalars['Int']>;
  liquidationDebtBufferBasisPoints_not?: InputMaybe<Scalars['Int']>;
  liquidationDebtBufferBasisPoints_not_in?: InputMaybe<Array<Scalars['Int']>>;
  liquidationfCashHaircutBasisPoints?: InputMaybe<Scalars['Int']>;
  liquidationfCashHaircutBasisPoints_gt?: InputMaybe<Scalars['Int']>;
  liquidationfCashHaircutBasisPoints_gte?: InputMaybe<Scalars['Int']>;
  liquidationfCashHaircutBasisPoints_in?: InputMaybe<Array<Scalars['Int']>>;
  liquidationfCashHaircutBasisPoints_lt?: InputMaybe<Scalars['Int']>;
  liquidationfCashHaircutBasisPoints_lte?: InputMaybe<Scalars['Int']>;
  liquidationfCashHaircutBasisPoints_not?: InputMaybe<Scalars['Int']>;
  liquidationfCashHaircutBasisPoints_not_in?: InputMaybe<Array<Scalars['Int']>>;
  liquidityTokenHaircutsPercent?: InputMaybe<Array<Scalars['Int']>>;
  liquidityTokenHaircutsPercent_contains?: InputMaybe<Array<Scalars['Int']>>;
  liquidityTokenHaircutsPercent_contains_nocase?: InputMaybe<Array<Scalars['Int']>>;
  liquidityTokenHaircutsPercent_not?: InputMaybe<Array<Scalars['Int']>>;
  liquidityTokenHaircutsPercent_not_contains?: InputMaybe<Array<Scalars['Int']>>;
  liquidityTokenHaircutsPercent_not_contains_nocase?: InputMaybe<Array<Scalars['Int']>>;
  maxMarketIndex?: InputMaybe<Scalars['Int']>;
  maxMarketIndex_gt?: InputMaybe<Scalars['Int']>;
  maxMarketIndex_gte?: InputMaybe<Scalars['Int']>;
  maxMarketIndex_in?: InputMaybe<Array<Scalars['Int']>>;
  maxMarketIndex_lt?: InputMaybe<Scalars['Int']>;
  maxMarketIndex_lte?: InputMaybe<Scalars['Int']>;
  maxMarketIndex_not?: InputMaybe<Scalars['Int']>;
  maxMarketIndex_not_in?: InputMaybe<Array<Scalars['Int']>>;
  maxMarketMaturityLengthSeconds?: InputMaybe<Scalars['Int']>;
  maxMarketMaturityLengthSeconds_gt?: InputMaybe<Scalars['Int']>;
  maxMarketMaturityLengthSeconds_gte?: InputMaybe<Scalars['Int']>;
  maxMarketMaturityLengthSeconds_in?: InputMaybe<Array<Scalars['Int']>>;
  maxMarketMaturityLengthSeconds_lt?: InputMaybe<Scalars['Int']>;
  maxMarketMaturityLengthSeconds_lte?: InputMaybe<Scalars['Int']>;
  maxMarketMaturityLengthSeconds_not?: InputMaybe<Scalars['Int']>;
  maxMarketMaturityLengthSeconds_not_in?: InputMaybe<Array<Scalars['Int']>>;
  nToken_?: InputMaybe<NToken_Filter>;
  rateOracleTimeWindowSeconds?: InputMaybe<Scalars['Int']>;
  rateOracleTimeWindowSeconds_gt?: InputMaybe<Scalars['Int']>;
  rateOracleTimeWindowSeconds_gte?: InputMaybe<Scalars['Int']>;
  rateOracleTimeWindowSeconds_in?: InputMaybe<Array<Scalars['Int']>>;
  rateOracleTimeWindowSeconds_lt?: InputMaybe<Scalars['Int']>;
  rateOracleTimeWindowSeconds_lte?: InputMaybe<Scalars['Int']>;
  rateOracleTimeWindowSeconds_not?: InputMaybe<Scalars['Int']>;
  rateOracleTimeWindowSeconds_not_in?: InputMaybe<Array<Scalars['Int']>>;
  rateScalars?: InputMaybe<Array<Scalars['Int']>>;
  rateScalars_contains?: InputMaybe<Array<Scalars['Int']>>;
  rateScalars_contains_nocase?: InputMaybe<Array<Scalars['Int']>>;
  rateScalars_not?: InputMaybe<Array<Scalars['Int']>>;
  rateScalars_not_contains?: InputMaybe<Array<Scalars['Int']>>;
  rateScalars_not_contains_nocase?: InputMaybe<Array<Scalars['Int']>>;
  reserveBalance?: InputMaybe<Scalars['BigInt']>;
  reserveBalance_gt?: InputMaybe<Scalars['BigInt']>;
  reserveBalance_gte?: InputMaybe<Scalars['BigInt']>;
  reserveBalance_in?: InputMaybe<Array<Scalars['BigInt']>>;
  reserveBalance_lt?: InputMaybe<Scalars['BigInt']>;
  reserveBalance_lte?: InputMaybe<Scalars['BigInt']>;
  reserveBalance_not?: InputMaybe<Scalars['BigInt']>;
  reserveBalance_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  reserveBuffer?: InputMaybe<Scalars['BigInt']>;
  reserveBuffer_gt?: InputMaybe<Scalars['BigInt']>;
  reserveBuffer_gte?: InputMaybe<Scalars['BigInt']>;
  reserveBuffer_in?: InputMaybe<Array<Scalars['BigInt']>>;
  reserveBuffer_lt?: InputMaybe<Scalars['BigInt']>;
  reserveBuffer_lte?: InputMaybe<Scalars['BigInt']>;
  reserveBuffer_not?: InputMaybe<Scalars['BigInt']>;
  reserveBuffer_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  reserveFeeSharePercent?: InputMaybe<Scalars['Int']>;
  reserveFeeSharePercent_gt?: InputMaybe<Scalars['Int']>;
  reserveFeeSharePercent_gte?: InputMaybe<Scalars['Int']>;
  reserveFeeSharePercent_in?: InputMaybe<Array<Scalars['Int']>>;
  reserveFeeSharePercent_lt?: InputMaybe<Scalars['Int']>;
  reserveFeeSharePercent_lte?: InputMaybe<Scalars['Int']>;
  reserveFeeSharePercent_not?: InputMaybe<Scalars['Int']>;
  reserveFeeSharePercent_not_in?: InputMaybe<Array<Scalars['Int']>>;
  settlementPenaltyRateBasisPoints?: InputMaybe<Scalars['Int']>;
  settlementPenaltyRateBasisPoints_gt?: InputMaybe<Scalars['Int']>;
  settlementPenaltyRateBasisPoints_gte?: InputMaybe<Scalars['Int']>;
  settlementPenaltyRateBasisPoints_in?: InputMaybe<Array<Scalars['Int']>>;
  settlementPenaltyRateBasisPoints_lt?: InputMaybe<Scalars['Int']>;
  settlementPenaltyRateBasisPoints_lte?: InputMaybe<Scalars['Int']>;
  settlementPenaltyRateBasisPoints_not?: InputMaybe<Scalars['Int']>;
  settlementPenaltyRateBasisPoints_not_in?: InputMaybe<Array<Scalars['Int']>>;
  totalFeeBasisPoints?: InputMaybe<Scalars['Int']>;
  totalFeeBasisPoints_gt?: InputMaybe<Scalars['Int']>;
  totalFeeBasisPoints_gte?: InputMaybe<Scalars['Int']>;
  totalFeeBasisPoints_in?: InputMaybe<Array<Scalars['Int']>>;
  totalFeeBasisPoints_lt?: InputMaybe<Scalars['Int']>;
  totalFeeBasisPoints_lte?: InputMaybe<Scalars['Int']>;
  totalFeeBasisPoints_not?: InputMaybe<Scalars['Int']>;
  totalFeeBasisPoints_not_in?: InputMaybe<Array<Scalars['Int']>>;
};

export enum CashGroup_OrderBy {
  Currency = 'currency',
  DebtBufferBasisPoints = 'debtBufferBasisPoints',
  FCashHaircutBasisPoints = 'fCashHaircutBasisPoints',
  Id = 'id',
  LastUpdateBlockHash = 'lastUpdateBlockHash',
  LastUpdateBlockNumber = 'lastUpdateBlockNumber',
  LastUpdateTimestamp = 'lastUpdateTimestamp',
  LastUpdateTransactionHash = 'lastUpdateTransactionHash',
  LiquidationDebtBufferBasisPoints = 'liquidationDebtBufferBasisPoints',
  LiquidationfCashHaircutBasisPoints = 'liquidationfCashHaircutBasisPoints',
  LiquidityTokenHaircutsPercent = 'liquidityTokenHaircutsPercent',
  MaxMarketIndex = 'maxMarketIndex',
  MaxMarketMaturityLengthSeconds = 'maxMarketMaturityLengthSeconds',
  NToken = 'nToken',
  RateOracleTimeWindowSeconds = 'rateOracleTimeWindowSeconds',
  RateScalars = 'rateScalars',
  ReserveBalance = 'reserveBalance',
  ReserveBuffer = 'reserveBuffer',
  ReserveFeeSharePercent = 'reserveFeeSharePercent',
  SettlementPenaltyRateBasisPoints = 'settlementPenaltyRateBasisPoints',
  TotalFeeBasisPoints = 'totalFeeBasisPoints'
}

export type Currency = {
  __typename?: 'Currency';
  /** Exchange rate from this currency to the underlying asset */
  assetExchangeRate?: Maybe<AssetExchangeRate>;
  assetExchangeRateHistoricalData?: Maybe<Array<AssetExchangeRateHistoricalData>>;
  /** Cash group for a currency, if exists */
  cashGroup?: Maybe<CashGroup>;
  /** Decimals of the asset token */
  decimals: Scalars['BigInt'];
  /** Exchange rate from this currency to Eth, used in free collateral calculations */
  ethExchangeRate: EthExchangeRate;
  /** Hourly data for this currency */
  ethExchangeRateHistoricalData?: Maybe<Array<EthExchangeRateHistoricalData>>;
  /** If asset token has a transfer fee */
  hasTransferFee: Scalars['Boolean'];
  /** Auto incrementing unique numeric id */
  id: Scalars['ID'];
  /** Incentive Migration for a currency, if exists */
  incentiveMigration?: Maybe<IncentiveMigration>;
  lastUpdateBlockHash: Scalars['Bytes'];
  lastUpdateBlockNumber: Scalars['Int'];
  lastUpdateTimestamp: Scalars['Int'];
  lastUpdateTransactionHash: Scalars['Bytes'];
  /** Strategy vaults that use this currency as a primary borrow */
  leveragedVaults?: Maybe<Array<LeveragedVault>>;
  /** Maximum total contract balance for collateral, zero if no limit */
  maxCollateralBalance?: Maybe<Scalars['BigInt']>;
  /** nToken for a currency, if exists */
  nToken?: Maybe<NToken>;
  nTokenPresentValueHistoricalData?: Maybe<Array<NTokenPresentValueHistoricalData>>;
  /** Name of the asset currency */
  name: Scalars['String'];
  /** Symbol of the asset currency */
  symbol: Scalars['String'];
  /** Address of asset token */
  tokenAddress: Scalars['Bytes'];
  /** Category of token that this refers to */
  tokenType: TokenType;
  /** Decimals of the underlying token */
  underlyingDecimals?: Maybe<Scalars['BigInt']>;
  /** If underlying token has a transfer fee */
  underlyingHasTransferFee?: Maybe<Scalars['Boolean']>;
  /** Name of the underlying currency */
  underlyingName?: Maybe<Scalars['String']>;
  /** Symbol of the underlying currency */
  underlyingSymbol?: Maybe<Scalars['String']>;
  /** Address of underlying token */
  underlyingTokenAddress?: Maybe<Scalars['Bytes']>;
};


export type CurrencyAssetExchangeRateHistoricalDataArgs = {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<AssetExchangeRateHistoricalData_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<AssetExchangeRateHistoricalData_Filter>;
};


export type CurrencyEthExchangeRateHistoricalDataArgs = {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<EthExchangeRateHistoricalData_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<EthExchangeRateHistoricalData_Filter>;
};


export type CurrencyLeveragedVaultsArgs = {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<LeveragedVault_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<LeveragedVault_Filter>;
};


export type CurrencyNTokenPresentValueHistoricalDataArgs = {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<NTokenPresentValueHistoricalData_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<NTokenPresentValueHistoricalData_Filter>;
};

export type CurrencyTvl = {
  __typename?: 'CurrencyTvl';
  currency: Currency;
  id: Scalars['ID'];
  underlyingValue: Scalars['BigInt'];
  usdValue: Scalars['BigInt'];
};

export type CurrencyTvl_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  currency?: InputMaybe<Scalars['String']>;
  currency_?: InputMaybe<Currency_Filter>;
  currency_contains?: InputMaybe<Scalars['String']>;
  currency_contains_nocase?: InputMaybe<Scalars['String']>;
  currency_ends_with?: InputMaybe<Scalars['String']>;
  currency_ends_with_nocase?: InputMaybe<Scalars['String']>;
  currency_gt?: InputMaybe<Scalars['String']>;
  currency_gte?: InputMaybe<Scalars['String']>;
  currency_in?: InputMaybe<Array<Scalars['String']>>;
  currency_lt?: InputMaybe<Scalars['String']>;
  currency_lte?: InputMaybe<Scalars['String']>;
  currency_not?: InputMaybe<Scalars['String']>;
  currency_not_contains?: InputMaybe<Scalars['String']>;
  currency_not_contains_nocase?: InputMaybe<Scalars['String']>;
  currency_not_ends_with?: InputMaybe<Scalars['String']>;
  currency_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  currency_not_in?: InputMaybe<Array<Scalars['String']>>;
  currency_not_starts_with?: InputMaybe<Scalars['String']>;
  currency_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  currency_starts_with?: InputMaybe<Scalars['String']>;
  currency_starts_with_nocase?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  underlyingValue?: InputMaybe<Scalars['BigInt']>;
  underlyingValue_gt?: InputMaybe<Scalars['BigInt']>;
  underlyingValue_gte?: InputMaybe<Scalars['BigInt']>;
  underlyingValue_in?: InputMaybe<Array<Scalars['BigInt']>>;
  underlyingValue_lt?: InputMaybe<Scalars['BigInt']>;
  underlyingValue_lte?: InputMaybe<Scalars['BigInt']>;
  underlyingValue_not?: InputMaybe<Scalars['BigInt']>;
  underlyingValue_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  usdValue?: InputMaybe<Scalars['BigInt']>;
  usdValue_gt?: InputMaybe<Scalars['BigInt']>;
  usdValue_gte?: InputMaybe<Scalars['BigInt']>;
  usdValue_in?: InputMaybe<Array<Scalars['BigInt']>>;
  usdValue_lt?: InputMaybe<Scalars['BigInt']>;
  usdValue_lte?: InputMaybe<Scalars['BigInt']>;
  usdValue_not?: InputMaybe<Scalars['BigInt']>;
  usdValue_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
};

export enum CurrencyTvl_OrderBy {
  Currency = 'currency',
  Id = 'id',
  UnderlyingValue = 'underlyingValue',
  UsdValue = 'usdValue'
}

export type Currency_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  assetExchangeRateHistoricalData_?: InputMaybe<AssetExchangeRateHistoricalData_Filter>;
  assetExchangeRate_?: InputMaybe<AssetExchangeRate_Filter>;
  cashGroup_?: InputMaybe<CashGroup_Filter>;
  decimals?: InputMaybe<Scalars['BigInt']>;
  decimals_gt?: InputMaybe<Scalars['BigInt']>;
  decimals_gte?: InputMaybe<Scalars['BigInt']>;
  decimals_in?: InputMaybe<Array<Scalars['BigInt']>>;
  decimals_lt?: InputMaybe<Scalars['BigInt']>;
  decimals_lte?: InputMaybe<Scalars['BigInt']>;
  decimals_not?: InputMaybe<Scalars['BigInt']>;
  decimals_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  ethExchangeRateHistoricalData_?: InputMaybe<EthExchangeRateHistoricalData_Filter>;
  ethExchangeRate_?: InputMaybe<EthExchangeRate_Filter>;
  hasTransferFee?: InputMaybe<Scalars['Boolean']>;
  hasTransferFee_in?: InputMaybe<Array<Scalars['Boolean']>>;
  hasTransferFee_not?: InputMaybe<Scalars['Boolean']>;
  hasTransferFee_not_in?: InputMaybe<Array<Scalars['Boolean']>>;
  id?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  incentiveMigration_?: InputMaybe<IncentiveMigration_Filter>;
  lastUpdateBlockHash?: InputMaybe<Scalars['Bytes']>;
  lastUpdateBlockHash_contains?: InputMaybe<Scalars['Bytes']>;
  lastUpdateBlockHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
  lastUpdateBlockHash_not?: InputMaybe<Scalars['Bytes']>;
  lastUpdateBlockHash_not_contains?: InputMaybe<Scalars['Bytes']>;
  lastUpdateBlockHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  lastUpdateBlockNumber?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_gt?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_gte?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_in?: InputMaybe<Array<Scalars['Int']>>;
  lastUpdateBlockNumber_lt?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_lte?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_not?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_not_in?: InputMaybe<Array<Scalars['Int']>>;
  lastUpdateTimestamp?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_gt?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_gte?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_in?: InputMaybe<Array<Scalars['Int']>>;
  lastUpdateTimestamp_lt?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_lte?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_not?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_not_in?: InputMaybe<Array<Scalars['Int']>>;
  lastUpdateTransactionHash?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_contains?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
  lastUpdateTransactionHash_not?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_not_contains?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  leveragedVaults_?: InputMaybe<LeveragedVault_Filter>;
  maxCollateralBalance?: InputMaybe<Scalars['BigInt']>;
  maxCollateralBalance_gt?: InputMaybe<Scalars['BigInt']>;
  maxCollateralBalance_gte?: InputMaybe<Scalars['BigInt']>;
  maxCollateralBalance_in?: InputMaybe<Array<Scalars['BigInt']>>;
  maxCollateralBalance_lt?: InputMaybe<Scalars['BigInt']>;
  maxCollateralBalance_lte?: InputMaybe<Scalars['BigInt']>;
  maxCollateralBalance_not?: InputMaybe<Scalars['BigInt']>;
  maxCollateralBalance_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  nTokenPresentValueHistoricalData_?: InputMaybe<NTokenPresentValueHistoricalData_Filter>;
  nToken_?: InputMaybe<NToken_Filter>;
  name?: InputMaybe<Scalars['String']>;
  name_contains?: InputMaybe<Scalars['String']>;
  name_contains_nocase?: InputMaybe<Scalars['String']>;
  name_ends_with?: InputMaybe<Scalars['String']>;
  name_ends_with_nocase?: InputMaybe<Scalars['String']>;
  name_gt?: InputMaybe<Scalars['String']>;
  name_gte?: InputMaybe<Scalars['String']>;
  name_in?: InputMaybe<Array<Scalars['String']>>;
  name_lt?: InputMaybe<Scalars['String']>;
  name_lte?: InputMaybe<Scalars['String']>;
  name_not?: InputMaybe<Scalars['String']>;
  name_not_contains?: InputMaybe<Scalars['String']>;
  name_not_contains_nocase?: InputMaybe<Scalars['String']>;
  name_not_ends_with?: InputMaybe<Scalars['String']>;
  name_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  name_not_in?: InputMaybe<Array<Scalars['String']>>;
  name_not_starts_with?: InputMaybe<Scalars['String']>;
  name_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  name_starts_with?: InputMaybe<Scalars['String']>;
  name_starts_with_nocase?: InputMaybe<Scalars['String']>;
  symbol?: InputMaybe<Scalars['String']>;
  symbol_contains?: InputMaybe<Scalars['String']>;
  symbol_contains_nocase?: InputMaybe<Scalars['String']>;
  symbol_ends_with?: InputMaybe<Scalars['String']>;
  symbol_ends_with_nocase?: InputMaybe<Scalars['String']>;
  symbol_gt?: InputMaybe<Scalars['String']>;
  symbol_gte?: InputMaybe<Scalars['String']>;
  symbol_in?: InputMaybe<Array<Scalars['String']>>;
  symbol_lt?: InputMaybe<Scalars['String']>;
  symbol_lte?: InputMaybe<Scalars['String']>;
  symbol_not?: InputMaybe<Scalars['String']>;
  symbol_not_contains?: InputMaybe<Scalars['String']>;
  symbol_not_contains_nocase?: InputMaybe<Scalars['String']>;
  symbol_not_ends_with?: InputMaybe<Scalars['String']>;
  symbol_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  symbol_not_in?: InputMaybe<Array<Scalars['String']>>;
  symbol_not_starts_with?: InputMaybe<Scalars['String']>;
  symbol_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  symbol_starts_with?: InputMaybe<Scalars['String']>;
  symbol_starts_with_nocase?: InputMaybe<Scalars['String']>;
  tokenAddress?: InputMaybe<Scalars['Bytes']>;
  tokenAddress_contains?: InputMaybe<Scalars['Bytes']>;
  tokenAddress_in?: InputMaybe<Array<Scalars['Bytes']>>;
  tokenAddress_not?: InputMaybe<Scalars['Bytes']>;
  tokenAddress_not_contains?: InputMaybe<Scalars['Bytes']>;
  tokenAddress_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  tokenType?: InputMaybe<TokenType>;
  tokenType_in?: InputMaybe<Array<TokenType>>;
  tokenType_not?: InputMaybe<TokenType>;
  tokenType_not_in?: InputMaybe<Array<TokenType>>;
  underlyingDecimals?: InputMaybe<Scalars['BigInt']>;
  underlyingDecimals_gt?: InputMaybe<Scalars['BigInt']>;
  underlyingDecimals_gte?: InputMaybe<Scalars['BigInt']>;
  underlyingDecimals_in?: InputMaybe<Array<Scalars['BigInt']>>;
  underlyingDecimals_lt?: InputMaybe<Scalars['BigInt']>;
  underlyingDecimals_lte?: InputMaybe<Scalars['BigInt']>;
  underlyingDecimals_not?: InputMaybe<Scalars['BigInt']>;
  underlyingDecimals_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  underlyingHasTransferFee?: InputMaybe<Scalars['Boolean']>;
  underlyingHasTransferFee_in?: InputMaybe<Array<Scalars['Boolean']>>;
  underlyingHasTransferFee_not?: InputMaybe<Scalars['Boolean']>;
  underlyingHasTransferFee_not_in?: InputMaybe<Array<Scalars['Boolean']>>;
  underlyingName?: InputMaybe<Scalars['String']>;
  underlyingName_contains?: InputMaybe<Scalars['String']>;
  underlyingName_contains_nocase?: InputMaybe<Scalars['String']>;
  underlyingName_ends_with?: InputMaybe<Scalars['String']>;
  underlyingName_ends_with_nocase?: InputMaybe<Scalars['String']>;
  underlyingName_gt?: InputMaybe<Scalars['String']>;
  underlyingName_gte?: InputMaybe<Scalars['String']>;
  underlyingName_in?: InputMaybe<Array<Scalars['String']>>;
  underlyingName_lt?: InputMaybe<Scalars['String']>;
  underlyingName_lte?: InputMaybe<Scalars['String']>;
  underlyingName_not?: InputMaybe<Scalars['String']>;
  underlyingName_not_contains?: InputMaybe<Scalars['String']>;
  underlyingName_not_contains_nocase?: InputMaybe<Scalars['String']>;
  underlyingName_not_ends_with?: InputMaybe<Scalars['String']>;
  underlyingName_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  underlyingName_not_in?: InputMaybe<Array<Scalars['String']>>;
  underlyingName_not_starts_with?: InputMaybe<Scalars['String']>;
  underlyingName_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  underlyingName_starts_with?: InputMaybe<Scalars['String']>;
  underlyingName_starts_with_nocase?: InputMaybe<Scalars['String']>;
  underlyingSymbol?: InputMaybe<Scalars['String']>;
  underlyingSymbol_contains?: InputMaybe<Scalars['String']>;
  underlyingSymbol_contains_nocase?: InputMaybe<Scalars['String']>;
  underlyingSymbol_ends_with?: InputMaybe<Scalars['String']>;
  underlyingSymbol_ends_with_nocase?: InputMaybe<Scalars['String']>;
  underlyingSymbol_gt?: InputMaybe<Scalars['String']>;
  underlyingSymbol_gte?: InputMaybe<Scalars['String']>;
  underlyingSymbol_in?: InputMaybe<Array<Scalars['String']>>;
  underlyingSymbol_lt?: InputMaybe<Scalars['String']>;
  underlyingSymbol_lte?: InputMaybe<Scalars['String']>;
  underlyingSymbol_not?: InputMaybe<Scalars['String']>;
  underlyingSymbol_not_contains?: InputMaybe<Scalars['String']>;
  underlyingSymbol_not_contains_nocase?: InputMaybe<Scalars['String']>;
  underlyingSymbol_not_ends_with?: InputMaybe<Scalars['String']>;
  underlyingSymbol_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  underlyingSymbol_not_in?: InputMaybe<Array<Scalars['String']>>;
  underlyingSymbol_not_starts_with?: InputMaybe<Scalars['String']>;
  underlyingSymbol_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  underlyingSymbol_starts_with?: InputMaybe<Scalars['String']>;
  underlyingSymbol_starts_with_nocase?: InputMaybe<Scalars['String']>;
  underlyingTokenAddress?: InputMaybe<Scalars['Bytes']>;
  underlyingTokenAddress_contains?: InputMaybe<Scalars['Bytes']>;
  underlyingTokenAddress_in?: InputMaybe<Array<Scalars['Bytes']>>;
  underlyingTokenAddress_not?: InputMaybe<Scalars['Bytes']>;
  underlyingTokenAddress_not_contains?: InputMaybe<Scalars['Bytes']>;
  underlyingTokenAddress_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
};

export enum Currency_OrderBy {
  AssetExchangeRate = 'assetExchangeRate',
  AssetExchangeRateHistoricalData = 'assetExchangeRateHistoricalData',
  CashGroup = 'cashGroup',
  Decimals = 'decimals',
  EthExchangeRate = 'ethExchangeRate',
  EthExchangeRateHistoricalData = 'ethExchangeRateHistoricalData',
  HasTransferFee = 'hasTransferFee',
  Id = 'id',
  IncentiveMigration = 'incentiveMigration',
  LastUpdateBlockHash = 'lastUpdateBlockHash',
  LastUpdateBlockNumber = 'lastUpdateBlockNumber',
  LastUpdateTimestamp = 'lastUpdateTimestamp',
  LastUpdateTransactionHash = 'lastUpdateTransactionHash',
  LeveragedVaults = 'leveragedVaults',
  MaxCollateralBalance = 'maxCollateralBalance',
  NToken = 'nToken',
  NTokenPresentValueHistoricalData = 'nTokenPresentValueHistoricalData',
  Name = 'name',
  Symbol = 'symbol',
  TokenAddress = 'tokenAddress',
  TokenType = 'tokenType',
  UnderlyingDecimals = 'underlyingDecimals',
  UnderlyingHasTransferFee = 'underlyingHasTransferFee',
  UnderlyingName = 'underlyingName',
  UnderlyingSymbol = 'underlyingSymbol',
  UnderlyingTokenAddress = 'underlyingTokenAddress'
}

export type DailyLendBorrowVolume = {
  __typename?: 'DailyLendBorrowVolume';
  currency: Currency;
  date: Scalars['Int'];
  id: Scalars['ID'];
  market: Market;
  marketIndex: Scalars['Int'];
  totalVolumeNetAssetCash: Scalars['BigInt'];
  totalVolumeNetfCash: Scalars['BigInt'];
  totalVolumeUnderlyingCash: Scalars['BigInt'];
  tradeType: TradeType;
  trades: Array<Trade>;
  txCount: Scalars['BigInt'];
};


export type DailyLendBorrowVolumeTradesArgs = {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Trade_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<Trade_Filter>;
};

export type DailyLendBorrowVolume_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  currency?: InputMaybe<Scalars['String']>;
  currency_?: InputMaybe<Currency_Filter>;
  currency_contains?: InputMaybe<Scalars['String']>;
  currency_contains_nocase?: InputMaybe<Scalars['String']>;
  currency_ends_with?: InputMaybe<Scalars['String']>;
  currency_ends_with_nocase?: InputMaybe<Scalars['String']>;
  currency_gt?: InputMaybe<Scalars['String']>;
  currency_gte?: InputMaybe<Scalars['String']>;
  currency_in?: InputMaybe<Array<Scalars['String']>>;
  currency_lt?: InputMaybe<Scalars['String']>;
  currency_lte?: InputMaybe<Scalars['String']>;
  currency_not?: InputMaybe<Scalars['String']>;
  currency_not_contains?: InputMaybe<Scalars['String']>;
  currency_not_contains_nocase?: InputMaybe<Scalars['String']>;
  currency_not_ends_with?: InputMaybe<Scalars['String']>;
  currency_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  currency_not_in?: InputMaybe<Array<Scalars['String']>>;
  currency_not_starts_with?: InputMaybe<Scalars['String']>;
  currency_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  currency_starts_with?: InputMaybe<Scalars['String']>;
  currency_starts_with_nocase?: InputMaybe<Scalars['String']>;
  date?: InputMaybe<Scalars['Int']>;
  date_gt?: InputMaybe<Scalars['Int']>;
  date_gte?: InputMaybe<Scalars['Int']>;
  date_in?: InputMaybe<Array<Scalars['Int']>>;
  date_lt?: InputMaybe<Scalars['Int']>;
  date_lte?: InputMaybe<Scalars['Int']>;
  date_not?: InputMaybe<Scalars['Int']>;
  date_not_in?: InputMaybe<Array<Scalars['Int']>>;
  id?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  market?: InputMaybe<Scalars['String']>;
  marketIndex?: InputMaybe<Scalars['Int']>;
  marketIndex_gt?: InputMaybe<Scalars['Int']>;
  marketIndex_gte?: InputMaybe<Scalars['Int']>;
  marketIndex_in?: InputMaybe<Array<Scalars['Int']>>;
  marketIndex_lt?: InputMaybe<Scalars['Int']>;
  marketIndex_lte?: InputMaybe<Scalars['Int']>;
  marketIndex_not?: InputMaybe<Scalars['Int']>;
  marketIndex_not_in?: InputMaybe<Array<Scalars['Int']>>;
  market_?: InputMaybe<Market_Filter>;
  market_contains?: InputMaybe<Scalars['String']>;
  market_contains_nocase?: InputMaybe<Scalars['String']>;
  market_ends_with?: InputMaybe<Scalars['String']>;
  market_ends_with_nocase?: InputMaybe<Scalars['String']>;
  market_gt?: InputMaybe<Scalars['String']>;
  market_gte?: InputMaybe<Scalars['String']>;
  market_in?: InputMaybe<Array<Scalars['String']>>;
  market_lt?: InputMaybe<Scalars['String']>;
  market_lte?: InputMaybe<Scalars['String']>;
  market_not?: InputMaybe<Scalars['String']>;
  market_not_contains?: InputMaybe<Scalars['String']>;
  market_not_contains_nocase?: InputMaybe<Scalars['String']>;
  market_not_ends_with?: InputMaybe<Scalars['String']>;
  market_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  market_not_in?: InputMaybe<Array<Scalars['String']>>;
  market_not_starts_with?: InputMaybe<Scalars['String']>;
  market_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  market_starts_with?: InputMaybe<Scalars['String']>;
  market_starts_with_nocase?: InputMaybe<Scalars['String']>;
  totalVolumeNetAssetCash?: InputMaybe<Scalars['BigInt']>;
  totalVolumeNetAssetCash_gt?: InputMaybe<Scalars['BigInt']>;
  totalVolumeNetAssetCash_gte?: InputMaybe<Scalars['BigInt']>;
  totalVolumeNetAssetCash_in?: InputMaybe<Array<Scalars['BigInt']>>;
  totalVolumeNetAssetCash_lt?: InputMaybe<Scalars['BigInt']>;
  totalVolumeNetAssetCash_lte?: InputMaybe<Scalars['BigInt']>;
  totalVolumeNetAssetCash_not?: InputMaybe<Scalars['BigInt']>;
  totalVolumeNetAssetCash_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  totalVolumeNetfCash?: InputMaybe<Scalars['BigInt']>;
  totalVolumeNetfCash_gt?: InputMaybe<Scalars['BigInt']>;
  totalVolumeNetfCash_gte?: InputMaybe<Scalars['BigInt']>;
  totalVolumeNetfCash_in?: InputMaybe<Array<Scalars['BigInt']>>;
  totalVolumeNetfCash_lt?: InputMaybe<Scalars['BigInt']>;
  totalVolumeNetfCash_lte?: InputMaybe<Scalars['BigInt']>;
  totalVolumeNetfCash_not?: InputMaybe<Scalars['BigInt']>;
  totalVolumeNetfCash_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  totalVolumeUnderlyingCash?: InputMaybe<Scalars['BigInt']>;
  totalVolumeUnderlyingCash_gt?: InputMaybe<Scalars['BigInt']>;
  totalVolumeUnderlyingCash_gte?: InputMaybe<Scalars['BigInt']>;
  totalVolumeUnderlyingCash_in?: InputMaybe<Array<Scalars['BigInt']>>;
  totalVolumeUnderlyingCash_lt?: InputMaybe<Scalars['BigInt']>;
  totalVolumeUnderlyingCash_lte?: InputMaybe<Scalars['BigInt']>;
  totalVolumeUnderlyingCash_not?: InputMaybe<Scalars['BigInt']>;
  totalVolumeUnderlyingCash_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  tradeType?: InputMaybe<TradeType>;
  tradeType_in?: InputMaybe<Array<TradeType>>;
  tradeType_not?: InputMaybe<TradeType>;
  tradeType_not_in?: InputMaybe<Array<TradeType>>;
  trades?: InputMaybe<Array<Scalars['String']>>;
  trades_?: InputMaybe<Trade_Filter>;
  trades_contains?: InputMaybe<Array<Scalars['String']>>;
  trades_contains_nocase?: InputMaybe<Array<Scalars['String']>>;
  trades_not?: InputMaybe<Array<Scalars['String']>>;
  trades_not_contains?: InputMaybe<Array<Scalars['String']>>;
  trades_not_contains_nocase?: InputMaybe<Array<Scalars['String']>>;
  txCount?: InputMaybe<Scalars['BigInt']>;
  txCount_gt?: InputMaybe<Scalars['BigInt']>;
  txCount_gte?: InputMaybe<Scalars['BigInt']>;
  txCount_in?: InputMaybe<Array<Scalars['BigInt']>>;
  txCount_lt?: InputMaybe<Scalars['BigInt']>;
  txCount_lte?: InputMaybe<Scalars['BigInt']>;
  txCount_not?: InputMaybe<Scalars['BigInt']>;
  txCount_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
};

export enum DailyLendBorrowVolume_OrderBy {
  Currency = 'currency',
  Date = 'date',
  Id = 'id',
  Market = 'market',
  MarketIndex = 'marketIndex',
  TotalVolumeNetAssetCash = 'totalVolumeNetAssetCash',
  TotalVolumeNetfCash = 'totalVolumeNetfCash',
  TotalVolumeUnderlyingCash = 'totalVolumeUnderlyingCash',
  TradeType = 'tradeType',
  Trades = 'trades',
  TxCount = 'txCount'
}

export type Delegate = {
  __typename?: 'Delegate';
  NOTEVotingPower: Scalars['BigInt'];
  account: Account;
  delegatedNote?: Maybe<Array<NoteBalance>>;
  delegatedStakedNote?: Maybe<Array<StakedNoteBalance>>;
  /** Ethereum address */
  id: Scalars['ID'];
  lastUpdateBlockHash: Scalars['Bytes'];
  lastUpdateBlockNumber: Scalars['Int'];
  lastUpdateTimestamp: Scalars['Int'];
  lastUpdateTransactionHash: Scalars['Bytes'];
  proposals?: Maybe<Array<Proposal>>;
  sNOTEVotingPower: Scalars['BigInt'];
  totalVotingPower: Scalars['BigInt'];
  votes?: Maybe<Array<Vote>>;
  votingPowerChange?: Maybe<Array<VotingPowerChange>>;
};


export type DelegateDelegatedNoteArgs = {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<NoteBalance_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<NoteBalance_Filter>;
};


export type DelegateDelegatedStakedNoteArgs = {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<StakedNoteBalance_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<StakedNoteBalance_Filter>;
};


export type DelegateProposalsArgs = {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Proposal_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<Proposal_Filter>;
};


export type DelegateVotesArgs = {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Vote_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<Vote_Filter>;
};


export type DelegateVotingPowerChangeArgs = {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<VotingPowerChange_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<VotingPowerChange_Filter>;
};

export type Delegate_Filter = {
  NOTEVotingPower?: InputMaybe<Scalars['BigInt']>;
  NOTEVotingPower_gt?: InputMaybe<Scalars['BigInt']>;
  NOTEVotingPower_gte?: InputMaybe<Scalars['BigInt']>;
  NOTEVotingPower_in?: InputMaybe<Array<Scalars['BigInt']>>;
  NOTEVotingPower_lt?: InputMaybe<Scalars['BigInt']>;
  NOTEVotingPower_lte?: InputMaybe<Scalars['BigInt']>;
  NOTEVotingPower_not?: InputMaybe<Scalars['BigInt']>;
  NOTEVotingPower_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  account?: InputMaybe<Scalars['String']>;
  account_?: InputMaybe<Account_Filter>;
  account_contains?: InputMaybe<Scalars['String']>;
  account_contains_nocase?: InputMaybe<Scalars['String']>;
  account_ends_with?: InputMaybe<Scalars['String']>;
  account_ends_with_nocase?: InputMaybe<Scalars['String']>;
  account_gt?: InputMaybe<Scalars['String']>;
  account_gte?: InputMaybe<Scalars['String']>;
  account_in?: InputMaybe<Array<Scalars['String']>>;
  account_lt?: InputMaybe<Scalars['String']>;
  account_lte?: InputMaybe<Scalars['String']>;
  account_not?: InputMaybe<Scalars['String']>;
  account_not_contains?: InputMaybe<Scalars['String']>;
  account_not_contains_nocase?: InputMaybe<Scalars['String']>;
  account_not_ends_with?: InputMaybe<Scalars['String']>;
  account_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  account_not_in?: InputMaybe<Array<Scalars['String']>>;
  account_not_starts_with?: InputMaybe<Scalars['String']>;
  account_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  account_starts_with?: InputMaybe<Scalars['String']>;
  account_starts_with_nocase?: InputMaybe<Scalars['String']>;
  delegatedNote_?: InputMaybe<NoteBalance_Filter>;
  delegatedStakedNote_?: InputMaybe<StakedNoteBalance_Filter>;
  id?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  lastUpdateBlockHash?: InputMaybe<Scalars['Bytes']>;
  lastUpdateBlockHash_contains?: InputMaybe<Scalars['Bytes']>;
  lastUpdateBlockHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
  lastUpdateBlockHash_not?: InputMaybe<Scalars['Bytes']>;
  lastUpdateBlockHash_not_contains?: InputMaybe<Scalars['Bytes']>;
  lastUpdateBlockHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  lastUpdateBlockNumber?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_gt?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_gte?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_in?: InputMaybe<Array<Scalars['Int']>>;
  lastUpdateBlockNumber_lt?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_lte?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_not?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_not_in?: InputMaybe<Array<Scalars['Int']>>;
  lastUpdateTimestamp?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_gt?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_gte?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_in?: InputMaybe<Array<Scalars['Int']>>;
  lastUpdateTimestamp_lt?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_lte?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_not?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_not_in?: InputMaybe<Array<Scalars['Int']>>;
  lastUpdateTransactionHash?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_contains?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
  lastUpdateTransactionHash_not?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_not_contains?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  proposals_?: InputMaybe<Proposal_Filter>;
  sNOTEVotingPower?: InputMaybe<Scalars['BigInt']>;
  sNOTEVotingPower_gt?: InputMaybe<Scalars['BigInt']>;
  sNOTEVotingPower_gte?: InputMaybe<Scalars['BigInt']>;
  sNOTEVotingPower_in?: InputMaybe<Array<Scalars['BigInt']>>;
  sNOTEVotingPower_lt?: InputMaybe<Scalars['BigInt']>;
  sNOTEVotingPower_lte?: InputMaybe<Scalars['BigInt']>;
  sNOTEVotingPower_not?: InputMaybe<Scalars['BigInt']>;
  sNOTEVotingPower_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  totalVotingPower?: InputMaybe<Scalars['BigInt']>;
  totalVotingPower_gt?: InputMaybe<Scalars['BigInt']>;
  totalVotingPower_gte?: InputMaybe<Scalars['BigInt']>;
  totalVotingPower_in?: InputMaybe<Array<Scalars['BigInt']>>;
  totalVotingPower_lt?: InputMaybe<Scalars['BigInt']>;
  totalVotingPower_lte?: InputMaybe<Scalars['BigInt']>;
  totalVotingPower_not?: InputMaybe<Scalars['BigInt']>;
  totalVotingPower_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  votes_?: InputMaybe<Vote_Filter>;
  votingPowerChange_?: InputMaybe<VotingPowerChange_Filter>;
};

export enum Delegate_OrderBy {
  NoteVotingPower = 'NOTEVotingPower',
  Account = 'account',
  DelegatedNote = 'delegatedNote',
  DelegatedStakedNote = 'delegatedStakedNote',
  Id = 'id',
  LastUpdateBlockHash = 'lastUpdateBlockHash',
  LastUpdateBlockNumber = 'lastUpdateBlockNumber',
  LastUpdateTimestamp = 'lastUpdateTimestamp',
  LastUpdateTransactionHash = 'lastUpdateTransactionHash',
  Proposals = 'proposals',
  SNoteVotingPower = 'sNOTEVotingPower',
  TotalVotingPower = 'totalVotingPower',
  Votes = 'votes',
  VotingPowerChange = 'votingPowerChange'
}

export type EthExchangeRate = {
  __typename?: 'EthExchangeRate';
  /** Base currency in the exchange rate */
  baseCurrency: Currency;
  /** Percentage buffer used when calculating free collateral for debt balances */
  buffer: Scalars['Int'];
  /** Percentage haircut used when calculating free collateral for collateral balances */
  haircut: Scalars['Int'];
  /** Currency id that this exchange rate refers to */
  id: Scalars['ID'];
  lastUpdateBlockHash: Scalars['Bytes'];
  lastUpdateBlockNumber: Scalars['Int'];
  lastUpdateTimestamp: Scalars['Int'];
  lastUpdateTransactionHash: Scalars['Bytes'];
  /** Exchange rate discount given when liquidating this currency */
  liquidationDiscount: Scalars['Int'];
  /** Does the exchange rate need to invert */
  mustInvert: Scalars['Boolean'];
  /** Decimal places of the exchange rate */
  rateDecimalPlaces: Scalars['Int'];
  /** Rate oracle that is used to reference the exchange rate */
  rateOracle: Scalars['Bytes'];
};

export type EthExchangeRateHistoricalData = {
  __typename?: 'EthExchangeRateHistoricalData';
  currency: Currency;
  id: Scalars['ID'];
  timestamp: Scalars['Int'];
  value: Scalars['BigInt'];
};

export type EthExchangeRateHistoricalData_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  currency?: InputMaybe<Scalars['String']>;
  currency_?: InputMaybe<Currency_Filter>;
  currency_contains?: InputMaybe<Scalars['String']>;
  currency_contains_nocase?: InputMaybe<Scalars['String']>;
  currency_ends_with?: InputMaybe<Scalars['String']>;
  currency_ends_with_nocase?: InputMaybe<Scalars['String']>;
  currency_gt?: InputMaybe<Scalars['String']>;
  currency_gte?: InputMaybe<Scalars['String']>;
  currency_in?: InputMaybe<Array<Scalars['String']>>;
  currency_lt?: InputMaybe<Scalars['String']>;
  currency_lte?: InputMaybe<Scalars['String']>;
  currency_not?: InputMaybe<Scalars['String']>;
  currency_not_contains?: InputMaybe<Scalars['String']>;
  currency_not_contains_nocase?: InputMaybe<Scalars['String']>;
  currency_not_ends_with?: InputMaybe<Scalars['String']>;
  currency_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  currency_not_in?: InputMaybe<Array<Scalars['String']>>;
  currency_not_starts_with?: InputMaybe<Scalars['String']>;
  currency_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  currency_starts_with?: InputMaybe<Scalars['String']>;
  currency_starts_with_nocase?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  timestamp?: InputMaybe<Scalars['Int']>;
  timestamp_gt?: InputMaybe<Scalars['Int']>;
  timestamp_gte?: InputMaybe<Scalars['Int']>;
  timestamp_in?: InputMaybe<Array<Scalars['Int']>>;
  timestamp_lt?: InputMaybe<Scalars['Int']>;
  timestamp_lte?: InputMaybe<Scalars['Int']>;
  timestamp_not?: InputMaybe<Scalars['Int']>;
  timestamp_not_in?: InputMaybe<Array<Scalars['Int']>>;
  value?: InputMaybe<Scalars['BigInt']>;
  value_gt?: InputMaybe<Scalars['BigInt']>;
  value_gte?: InputMaybe<Scalars['BigInt']>;
  value_in?: InputMaybe<Array<Scalars['BigInt']>>;
  value_lt?: InputMaybe<Scalars['BigInt']>;
  value_lte?: InputMaybe<Scalars['BigInt']>;
  value_not?: InputMaybe<Scalars['BigInt']>;
  value_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
};

export enum EthExchangeRateHistoricalData_OrderBy {
  Currency = 'currency',
  Id = 'id',
  Timestamp = 'timestamp',
  Value = 'value'
}

export type EthExchangeRate_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  baseCurrency?: InputMaybe<Scalars['String']>;
  baseCurrency_?: InputMaybe<Currency_Filter>;
  baseCurrency_contains?: InputMaybe<Scalars['String']>;
  baseCurrency_contains_nocase?: InputMaybe<Scalars['String']>;
  baseCurrency_ends_with?: InputMaybe<Scalars['String']>;
  baseCurrency_ends_with_nocase?: InputMaybe<Scalars['String']>;
  baseCurrency_gt?: InputMaybe<Scalars['String']>;
  baseCurrency_gte?: InputMaybe<Scalars['String']>;
  baseCurrency_in?: InputMaybe<Array<Scalars['String']>>;
  baseCurrency_lt?: InputMaybe<Scalars['String']>;
  baseCurrency_lte?: InputMaybe<Scalars['String']>;
  baseCurrency_not?: InputMaybe<Scalars['String']>;
  baseCurrency_not_contains?: InputMaybe<Scalars['String']>;
  baseCurrency_not_contains_nocase?: InputMaybe<Scalars['String']>;
  baseCurrency_not_ends_with?: InputMaybe<Scalars['String']>;
  baseCurrency_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  baseCurrency_not_in?: InputMaybe<Array<Scalars['String']>>;
  baseCurrency_not_starts_with?: InputMaybe<Scalars['String']>;
  baseCurrency_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  baseCurrency_starts_with?: InputMaybe<Scalars['String']>;
  baseCurrency_starts_with_nocase?: InputMaybe<Scalars['String']>;
  buffer?: InputMaybe<Scalars['Int']>;
  buffer_gt?: InputMaybe<Scalars['Int']>;
  buffer_gte?: InputMaybe<Scalars['Int']>;
  buffer_in?: InputMaybe<Array<Scalars['Int']>>;
  buffer_lt?: InputMaybe<Scalars['Int']>;
  buffer_lte?: InputMaybe<Scalars['Int']>;
  buffer_not?: InputMaybe<Scalars['Int']>;
  buffer_not_in?: InputMaybe<Array<Scalars['Int']>>;
  haircut?: InputMaybe<Scalars['Int']>;
  haircut_gt?: InputMaybe<Scalars['Int']>;
  haircut_gte?: InputMaybe<Scalars['Int']>;
  haircut_in?: InputMaybe<Array<Scalars['Int']>>;
  haircut_lt?: InputMaybe<Scalars['Int']>;
  haircut_lte?: InputMaybe<Scalars['Int']>;
  haircut_not?: InputMaybe<Scalars['Int']>;
  haircut_not_in?: InputMaybe<Array<Scalars['Int']>>;
  id?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  lastUpdateBlockHash?: InputMaybe<Scalars['Bytes']>;
  lastUpdateBlockHash_contains?: InputMaybe<Scalars['Bytes']>;
  lastUpdateBlockHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
  lastUpdateBlockHash_not?: InputMaybe<Scalars['Bytes']>;
  lastUpdateBlockHash_not_contains?: InputMaybe<Scalars['Bytes']>;
  lastUpdateBlockHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  lastUpdateBlockNumber?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_gt?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_gte?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_in?: InputMaybe<Array<Scalars['Int']>>;
  lastUpdateBlockNumber_lt?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_lte?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_not?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_not_in?: InputMaybe<Array<Scalars['Int']>>;
  lastUpdateTimestamp?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_gt?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_gte?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_in?: InputMaybe<Array<Scalars['Int']>>;
  lastUpdateTimestamp_lt?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_lte?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_not?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_not_in?: InputMaybe<Array<Scalars['Int']>>;
  lastUpdateTransactionHash?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_contains?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
  lastUpdateTransactionHash_not?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_not_contains?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  liquidationDiscount?: InputMaybe<Scalars['Int']>;
  liquidationDiscount_gt?: InputMaybe<Scalars['Int']>;
  liquidationDiscount_gte?: InputMaybe<Scalars['Int']>;
  liquidationDiscount_in?: InputMaybe<Array<Scalars['Int']>>;
  liquidationDiscount_lt?: InputMaybe<Scalars['Int']>;
  liquidationDiscount_lte?: InputMaybe<Scalars['Int']>;
  liquidationDiscount_not?: InputMaybe<Scalars['Int']>;
  liquidationDiscount_not_in?: InputMaybe<Array<Scalars['Int']>>;
  mustInvert?: InputMaybe<Scalars['Boolean']>;
  mustInvert_in?: InputMaybe<Array<Scalars['Boolean']>>;
  mustInvert_not?: InputMaybe<Scalars['Boolean']>;
  mustInvert_not_in?: InputMaybe<Array<Scalars['Boolean']>>;
  rateDecimalPlaces?: InputMaybe<Scalars['Int']>;
  rateDecimalPlaces_gt?: InputMaybe<Scalars['Int']>;
  rateDecimalPlaces_gte?: InputMaybe<Scalars['Int']>;
  rateDecimalPlaces_in?: InputMaybe<Array<Scalars['Int']>>;
  rateDecimalPlaces_lt?: InputMaybe<Scalars['Int']>;
  rateDecimalPlaces_lte?: InputMaybe<Scalars['Int']>;
  rateDecimalPlaces_not?: InputMaybe<Scalars['Int']>;
  rateDecimalPlaces_not_in?: InputMaybe<Array<Scalars['Int']>>;
  rateOracle?: InputMaybe<Scalars['Bytes']>;
  rateOracle_contains?: InputMaybe<Scalars['Bytes']>;
  rateOracle_in?: InputMaybe<Array<Scalars['Bytes']>>;
  rateOracle_not?: InputMaybe<Scalars['Bytes']>;
  rateOracle_not_contains?: InputMaybe<Scalars['Bytes']>;
  rateOracle_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
};

export enum EthExchangeRate_OrderBy {
  BaseCurrency = 'baseCurrency',
  Buffer = 'buffer',
  Haircut = 'haircut',
  Id = 'id',
  LastUpdateBlockHash = 'lastUpdateBlockHash',
  LastUpdateBlockNumber = 'lastUpdateBlockNumber',
  LastUpdateTimestamp = 'lastUpdateTimestamp',
  LastUpdateTransactionHash = 'lastUpdateTransactionHash',
  LiquidationDiscount = 'liquidationDiscount',
  MustInvert = 'mustInvert',
  RateDecimalPlaces = 'rateDecimalPlaces',
  RateOracle = 'rateOracle'
}

export type GlobalTransferOperator = {
  __typename?: 'GlobalTransferOperator';
  /** Address of the global transfer operator */
  id: Scalars['ID'];
  lastUpdateBlockHash: Scalars['Bytes'];
  lastUpdateBlockNumber: Scalars['Int'];
  lastUpdateTimestamp: Scalars['Int'];
  lastUpdateTransactionHash: Scalars['Bytes'];
};

export type GlobalTransferOperator_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  id?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  lastUpdateBlockHash?: InputMaybe<Scalars['Bytes']>;
  lastUpdateBlockHash_contains?: InputMaybe<Scalars['Bytes']>;
  lastUpdateBlockHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
  lastUpdateBlockHash_not?: InputMaybe<Scalars['Bytes']>;
  lastUpdateBlockHash_not_contains?: InputMaybe<Scalars['Bytes']>;
  lastUpdateBlockHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  lastUpdateBlockNumber?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_gt?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_gte?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_in?: InputMaybe<Array<Scalars['Int']>>;
  lastUpdateBlockNumber_lt?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_lte?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_not?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_not_in?: InputMaybe<Array<Scalars['Int']>>;
  lastUpdateTimestamp?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_gt?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_gte?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_in?: InputMaybe<Array<Scalars['Int']>>;
  lastUpdateTimestamp_lt?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_lte?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_not?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_not_in?: InputMaybe<Array<Scalars['Int']>>;
  lastUpdateTransactionHash?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_contains?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
  lastUpdateTransactionHash_not?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_not_contains?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
};

export enum GlobalTransferOperator_OrderBy {
  Id = 'id',
  LastUpdateBlockHash = 'lastUpdateBlockHash',
  LastUpdateBlockNumber = 'lastUpdateBlockNumber',
  LastUpdateTimestamp = 'lastUpdateTimestamp',
  LastUpdateTransactionHash = 'lastUpdateTransactionHash'
}

export type IncentiveMigration = {
  __typename?: 'IncentiveMigration';
  currency: Currency;
  /** Snapshot of the integral total supply at migration */
  finalIntegralTotalSupply: Scalars['BigInt'];
  /** Currency ID of the migrated entity */
  id: Scalars['ID'];
  /** Snapshot of the incentive emission rate at migration */
  migrationEmissionRate: Scalars['BigInt'];
  /** Time when the currency was migrated */
  migrationTime: Scalars['BigInt'];
};

export type IncentiveMigration_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  currency?: InputMaybe<Scalars['String']>;
  currency_?: InputMaybe<Currency_Filter>;
  currency_contains?: InputMaybe<Scalars['String']>;
  currency_contains_nocase?: InputMaybe<Scalars['String']>;
  currency_ends_with?: InputMaybe<Scalars['String']>;
  currency_ends_with_nocase?: InputMaybe<Scalars['String']>;
  currency_gt?: InputMaybe<Scalars['String']>;
  currency_gte?: InputMaybe<Scalars['String']>;
  currency_in?: InputMaybe<Array<Scalars['String']>>;
  currency_lt?: InputMaybe<Scalars['String']>;
  currency_lte?: InputMaybe<Scalars['String']>;
  currency_not?: InputMaybe<Scalars['String']>;
  currency_not_contains?: InputMaybe<Scalars['String']>;
  currency_not_contains_nocase?: InputMaybe<Scalars['String']>;
  currency_not_ends_with?: InputMaybe<Scalars['String']>;
  currency_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  currency_not_in?: InputMaybe<Array<Scalars['String']>>;
  currency_not_starts_with?: InputMaybe<Scalars['String']>;
  currency_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  currency_starts_with?: InputMaybe<Scalars['String']>;
  currency_starts_with_nocase?: InputMaybe<Scalars['String']>;
  finalIntegralTotalSupply?: InputMaybe<Scalars['BigInt']>;
  finalIntegralTotalSupply_gt?: InputMaybe<Scalars['BigInt']>;
  finalIntegralTotalSupply_gte?: InputMaybe<Scalars['BigInt']>;
  finalIntegralTotalSupply_in?: InputMaybe<Array<Scalars['BigInt']>>;
  finalIntegralTotalSupply_lt?: InputMaybe<Scalars['BigInt']>;
  finalIntegralTotalSupply_lte?: InputMaybe<Scalars['BigInt']>;
  finalIntegralTotalSupply_not?: InputMaybe<Scalars['BigInt']>;
  finalIntegralTotalSupply_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  id?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  migrationEmissionRate?: InputMaybe<Scalars['BigInt']>;
  migrationEmissionRate_gt?: InputMaybe<Scalars['BigInt']>;
  migrationEmissionRate_gte?: InputMaybe<Scalars['BigInt']>;
  migrationEmissionRate_in?: InputMaybe<Array<Scalars['BigInt']>>;
  migrationEmissionRate_lt?: InputMaybe<Scalars['BigInt']>;
  migrationEmissionRate_lte?: InputMaybe<Scalars['BigInt']>;
  migrationEmissionRate_not?: InputMaybe<Scalars['BigInt']>;
  migrationEmissionRate_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  migrationTime?: InputMaybe<Scalars['BigInt']>;
  migrationTime_gt?: InputMaybe<Scalars['BigInt']>;
  migrationTime_gte?: InputMaybe<Scalars['BigInt']>;
  migrationTime_in?: InputMaybe<Array<Scalars['BigInt']>>;
  migrationTime_lt?: InputMaybe<Scalars['BigInt']>;
  migrationTime_lte?: InputMaybe<Scalars['BigInt']>;
  migrationTime_not?: InputMaybe<Scalars['BigInt']>;
  migrationTime_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
};

export enum IncentiveMigration_OrderBy {
  Currency = 'currency',
  FinalIntegralTotalSupply = 'finalIntegralTotalSupply',
  Id = 'id',
  MigrationEmissionRate = 'migrationEmissionRate',
  MigrationTime = 'migrationTime'
}

export type LeveragedVault = {
  __typename?: 'LeveragedVault';
  /** Allows positions to be rolled forward */
  allowRollPosition: Scalars['Boolean'];
  /** Vault is allowed to re-enter Notional */
  allowsReentrancy: Scalars['Boolean'];
  /** Deleveraging is disabled on this vault */
  deleverageDisabled?: Maybe<Scalars['Boolean']>;
  /** Can the vault be entered */
  enabled: Scalars['Boolean'];
  /** Fee assessed on primary borrow paid to the nToken and protocol */
  feeRateBasisPoints: Scalars['Int'];
  /** ID is the address of the vault */
  id: Scalars['ID'];
  lastUpdateBlockHash: Scalars['Bytes'];
  lastUpdateBlockNumber: Scalars['Int'];
  lastUpdateTimestamp: Scalars['Int'];
  lastUpdateTransactionHash: Scalars['Bytes'];
  /** Discount rate given to liquidators */
  liquidationRatePercent: Scalars['Int'];
  /** All maturities of this strategy vault */
  maturities?: Maybe<Array<LeveragedVaultMaturity>>;
  /** Maximum market index for borrowing terms */
  maxBorrowMarketIndex: Scalars['Int'];
  /** Maximum collateral ratio that liquidation can reach */
  maxDeleverageCollateralRatioBasisPoints: Scalars['Int'];
  /** Max required collateral ratio for vault accounts */
  maxRequiredAccountCollateralRatioBasisPoints?: Maybe<Scalars['Int']>;
  /** Minimum amount of primary currency that must be borrowed */
  minAccountBorrowSize: Scalars['BigInt'];
  /** Minimum collateral ratio before liquidation */
  minCollateralRatioBasisPoints: Scalars['Int'];
  /** Name of the strategy vault */
  name: Scalars['String'];
  /** Only the vault can liquidate */
  onlyVaultDeleverage: Scalars['Boolean'];
  /** Only the vault can enter */
  onlyVaultEntry: Scalars['Boolean'];
  /** Only the vault can exit */
  onlyVaultExit: Scalars['Boolean'];
  /** Only the vault can roll */
  onlyVaultRoll: Scalars['Boolean'];
  /** Only the vault can settle */
  onlyVaultSettle: Scalars['Boolean'];
  /** Primary currency the vault borrows in */
  primaryBorrowCurrency: Currency;
  /** Share of fee paid to protocol reserve */
  reserveFeeSharePercent: Scalars['Int'];
  /** Secondary borrow currencies (if any) */
  secondaryBorrowCurrencies?: Maybe<Array<Currency>>;
  /** Strategy identifier for the vault */
  strategy: Scalars['Bytes'];
  /** Address of the strategy vault */
  vaultAddress: Scalars['Bytes'];
  vaultCapacity: LeveragedVaultCapacity;
};


export type LeveragedVaultMaturitiesArgs = {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<LeveragedVaultMaturity_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<LeveragedVaultMaturity_Filter>;
};


export type LeveragedVaultSecondaryBorrowCurrenciesArgs = {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Currency_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<Currency_Filter>;
};

export type LeveragedVaultAccount = {
  __typename?: 'LeveragedVaultAccount';
  account: Account;
  /** ID is the address of the vault:address of account */
  id: Scalars['ID'];
  lastUpdateBlockHash: Scalars['Bytes'];
  lastUpdateBlockNumber: Scalars['Int'];
  lastUpdateTimestamp: Scalars['Int'];
  lastUpdateTransactionHash: Scalars['Bytes'];
  leveragedVault: LeveragedVault;
  leveragedVaultMaturity: LeveragedVaultMaturity;
  /** Maturity that the account is currently in */
  maturity: Scalars['Int'];
  /** Amount of fCash borrowed */
  primaryBorrowfCash: Scalars['BigInt'];
  /** Debt shares of the secondary borrow currencies */
  secondaryBorrowDebtShares?: Maybe<Array<Scalars['BigInt']>>;
  trades?: Maybe<Array<LeveragedVaultTrade>>;
  /** Vault shares held in this maturity by the account */
  vaultShares: Scalars['BigInt'];
};


export type LeveragedVaultAccountTradesArgs = {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<LeveragedVaultTrade_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<LeveragedVaultTrade_Filter>;
};

export type LeveragedVaultAccount_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  account?: InputMaybe<Scalars['String']>;
  account_?: InputMaybe<Account_Filter>;
  account_contains?: InputMaybe<Scalars['String']>;
  account_contains_nocase?: InputMaybe<Scalars['String']>;
  account_ends_with?: InputMaybe<Scalars['String']>;
  account_ends_with_nocase?: InputMaybe<Scalars['String']>;
  account_gt?: InputMaybe<Scalars['String']>;
  account_gte?: InputMaybe<Scalars['String']>;
  account_in?: InputMaybe<Array<Scalars['String']>>;
  account_lt?: InputMaybe<Scalars['String']>;
  account_lte?: InputMaybe<Scalars['String']>;
  account_not?: InputMaybe<Scalars['String']>;
  account_not_contains?: InputMaybe<Scalars['String']>;
  account_not_contains_nocase?: InputMaybe<Scalars['String']>;
  account_not_ends_with?: InputMaybe<Scalars['String']>;
  account_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  account_not_in?: InputMaybe<Array<Scalars['String']>>;
  account_not_starts_with?: InputMaybe<Scalars['String']>;
  account_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  account_starts_with?: InputMaybe<Scalars['String']>;
  account_starts_with_nocase?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  lastUpdateBlockHash?: InputMaybe<Scalars['Bytes']>;
  lastUpdateBlockHash_contains?: InputMaybe<Scalars['Bytes']>;
  lastUpdateBlockHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
  lastUpdateBlockHash_not?: InputMaybe<Scalars['Bytes']>;
  lastUpdateBlockHash_not_contains?: InputMaybe<Scalars['Bytes']>;
  lastUpdateBlockHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  lastUpdateBlockNumber?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_gt?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_gte?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_in?: InputMaybe<Array<Scalars['Int']>>;
  lastUpdateBlockNumber_lt?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_lte?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_not?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_not_in?: InputMaybe<Array<Scalars['Int']>>;
  lastUpdateTimestamp?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_gt?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_gte?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_in?: InputMaybe<Array<Scalars['Int']>>;
  lastUpdateTimestamp_lt?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_lte?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_not?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_not_in?: InputMaybe<Array<Scalars['Int']>>;
  lastUpdateTransactionHash?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_contains?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
  lastUpdateTransactionHash_not?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_not_contains?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  leveragedVault?: InputMaybe<Scalars['String']>;
  leveragedVaultMaturity?: InputMaybe<Scalars['String']>;
  leveragedVaultMaturity_?: InputMaybe<LeveragedVaultMaturity_Filter>;
  leveragedVaultMaturity_contains?: InputMaybe<Scalars['String']>;
  leveragedVaultMaturity_contains_nocase?: InputMaybe<Scalars['String']>;
  leveragedVaultMaturity_ends_with?: InputMaybe<Scalars['String']>;
  leveragedVaultMaturity_ends_with_nocase?: InputMaybe<Scalars['String']>;
  leveragedVaultMaturity_gt?: InputMaybe<Scalars['String']>;
  leveragedVaultMaturity_gte?: InputMaybe<Scalars['String']>;
  leveragedVaultMaturity_in?: InputMaybe<Array<Scalars['String']>>;
  leveragedVaultMaturity_lt?: InputMaybe<Scalars['String']>;
  leveragedVaultMaturity_lte?: InputMaybe<Scalars['String']>;
  leveragedVaultMaturity_not?: InputMaybe<Scalars['String']>;
  leveragedVaultMaturity_not_contains?: InputMaybe<Scalars['String']>;
  leveragedVaultMaturity_not_contains_nocase?: InputMaybe<Scalars['String']>;
  leveragedVaultMaturity_not_ends_with?: InputMaybe<Scalars['String']>;
  leveragedVaultMaturity_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  leveragedVaultMaturity_not_in?: InputMaybe<Array<Scalars['String']>>;
  leveragedVaultMaturity_not_starts_with?: InputMaybe<Scalars['String']>;
  leveragedVaultMaturity_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  leveragedVaultMaturity_starts_with?: InputMaybe<Scalars['String']>;
  leveragedVaultMaturity_starts_with_nocase?: InputMaybe<Scalars['String']>;
  leveragedVault_?: InputMaybe<LeveragedVault_Filter>;
  leveragedVault_contains?: InputMaybe<Scalars['String']>;
  leveragedVault_contains_nocase?: InputMaybe<Scalars['String']>;
  leveragedVault_ends_with?: InputMaybe<Scalars['String']>;
  leveragedVault_ends_with_nocase?: InputMaybe<Scalars['String']>;
  leveragedVault_gt?: InputMaybe<Scalars['String']>;
  leveragedVault_gte?: InputMaybe<Scalars['String']>;
  leveragedVault_in?: InputMaybe<Array<Scalars['String']>>;
  leveragedVault_lt?: InputMaybe<Scalars['String']>;
  leveragedVault_lte?: InputMaybe<Scalars['String']>;
  leveragedVault_not?: InputMaybe<Scalars['String']>;
  leveragedVault_not_contains?: InputMaybe<Scalars['String']>;
  leveragedVault_not_contains_nocase?: InputMaybe<Scalars['String']>;
  leveragedVault_not_ends_with?: InputMaybe<Scalars['String']>;
  leveragedVault_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  leveragedVault_not_in?: InputMaybe<Array<Scalars['String']>>;
  leveragedVault_not_starts_with?: InputMaybe<Scalars['String']>;
  leveragedVault_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  leveragedVault_starts_with?: InputMaybe<Scalars['String']>;
  leveragedVault_starts_with_nocase?: InputMaybe<Scalars['String']>;
  maturity?: InputMaybe<Scalars['Int']>;
  maturity_gt?: InputMaybe<Scalars['Int']>;
  maturity_gte?: InputMaybe<Scalars['Int']>;
  maturity_in?: InputMaybe<Array<Scalars['Int']>>;
  maturity_lt?: InputMaybe<Scalars['Int']>;
  maturity_lte?: InputMaybe<Scalars['Int']>;
  maturity_not?: InputMaybe<Scalars['Int']>;
  maturity_not_in?: InputMaybe<Array<Scalars['Int']>>;
  primaryBorrowfCash?: InputMaybe<Scalars['BigInt']>;
  primaryBorrowfCash_gt?: InputMaybe<Scalars['BigInt']>;
  primaryBorrowfCash_gte?: InputMaybe<Scalars['BigInt']>;
  primaryBorrowfCash_in?: InputMaybe<Array<Scalars['BigInt']>>;
  primaryBorrowfCash_lt?: InputMaybe<Scalars['BigInt']>;
  primaryBorrowfCash_lte?: InputMaybe<Scalars['BigInt']>;
  primaryBorrowfCash_not?: InputMaybe<Scalars['BigInt']>;
  primaryBorrowfCash_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  secondaryBorrowDebtShares?: InputMaybe<Array<Scalars['BigInt']>>;
  secondaryBorrowDebtShares_contains?: InputMaybe<Array<Scalars['BigInt']>>;
  secondaryBorrowDebtShares_contains_nocase?: InputMaybe<Array<Scalars['BigInt']>>;
  secondaryBorrowDebtShares_not?: InputMaybe<Array<Scalars['BigInt']>>;
  secondaryBorrowDebtShares_not_contains?: InputMaybe<Array<Scalars['BigInt']>>;
  secondaryBorrowDebtShares_not_contains_nocase?: InputMaybe<Array<Scalars['BigInt']>>;
  trades_?: InputMaybe<LeveragedVaultTrade_Filter>;
  vaultShares?: InputMaybe<Scalars['BigInt']>;
  vaultShares_gt?: InputMaybe<Scalars['BigInt']>;
  vaultShares_gte?: InputMaybe<Scalars['BigInt']>;
  vaultShares_in?: InputMaybe<Array<Scalars['BigInt']>>;
  vaultShares_lt?: InputMaybe<Scalars['BigInt']>;
  vaultShares_lte?: InputMaybe<Scalars['BigInt']>;
  vaultShares_not?: InputMaybe<Scalars['BigInt']>;
  vaultShares_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
};

export enum LeveragedVaultAccount_OrderBy {
  Account = 'account',
  Id = 'id',
  LastUpdateBlockHash = 'lastUpdateBlockHash',
  LastUpdateBlockNumber = 'lastUpdateBlockNumber',
  LastUpdateTimestamp = 'lastUpdateTimestamp',
  LastUpdateTransactionHash = 'lastUpdateTransactionHash',
  LeveragedVault = 'leveragedVault',
  LeveragedVaultMaturity = 'leveragedVaultMaturity',
  Maturity = 'maturity',
  PrimaryBorrowfCash = 'primaryBorrowfCash',
  SecondaryBorrowDebtShares = 'secondaryBorrowDebtShares',
  Trades = 'trades',
  VaultShares = 'vaultShares'
}

export type LeveragedVaultCapacity = {
  __typename?: 'LeveragedVaultCapacity';
  /** ID is the address of the vault */
  id: Scalars['ID'];
  lastUpdateBlockHash: Scalars['Bytes'];
  lastUpdateBlockNumber: Scalars['Int'];
  lastUpdateTimestamp: Scalars['Int'];
  lastUpdateTransactionHash: Scalars['Bytes'];
  leveragedVault: LeveragedVault;
  maxPrimaryBorrowCapacity: Scalars['BigInt'];
  maxSecondaryBorrowCapacity?: Maybe<Array<Scalars['BigInt']>>;
  totalUsedPrimaryBorrowCapacity: Scalars['BigInt'];
  totalUsedSecondaryBorrowCapacity?: Maybe<Array<Scalars['BigInt']>>;
};

export type LeveragedVaultCapacity_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  id?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  lastUpdateBlockHash?: InputMaybe<Scalars['Bytes']>;
  lastUpdateBlockHash_contains?: InputMaybe<Scalars['Bytes']>;
  lastUpdateBlockHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
  lastUpdateBlockHash_not?: InputMaybe<Scalars['Bytes']>;
  lastUpdateBlockHash_not_contains?: InputMaybe<Scalars['Bytes']>;
  lastUpdateBlockHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  lastUpdateBlockNumber?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_gt?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_gte?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_in?: InputMaybe<Array<Scalars['Int']>>;
  lastUpdateBlockNumber_lt?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_lte?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_not?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_not_in?: InputMaybe<Array<Scalars['Int']>>;
  lastUpdateTimestamp?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_gt?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_gte?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_in?: InputMaybe<Array<Scalars['Int']>>;
  lastUpdateTimestamp_lt?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_lte?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_not?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_not_in?: InputMaybe<Array<Scalars['Int']>>;
  lastUpdateTransactionHash?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_contains?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
  lastUpdateTransactionHash_not?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_not_contains?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  leveragedVault?: InputMaybe<Scalars['String']>;
  leveragedVault_?: InputMaybe<LeveragedVault_Filter>;
  leveragedVault_contains?: InputMaybe<Scalars['String']>;
  leveragedVault_contains_nocase?: InputMaybe<Scalars['String']>;
  leveragedVault_ends_with?: InputMaybe<Scalars['String']>;
  leveragedVault_ends_with_nocase?: InputMaybe<Scalars['String']>;
  leveragedVault_gt?: InputMaybe<Scalars['String']>;
  leveragedVault_gte?: InputMaybe<Scalars['String']>;
  leveragedVault_in?: InputMaybe<Array<Scalars['String']>>;
  leveragedVault_lt?: InputMaybe<Scalars['String']>;
  leveragedVault_lte?: InputMaybe<Scalars['String']>;
  leveragedVault_not?: InputMaybe<Scalars['String']>;
  leveragedVault_not_contains?: InputMaybe<Scalars['String']>;
  leveragedVault_not_contains_nocase?: InputMaybe<Scalars['String']>;
  leveragedVault_not_ends_with?: InputMaybe<Scalars['String']>;
  leveragedVault_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  leveragedVault_not_in?: InputMaybe<Array<Scalars['String']>>;
  leveragedVault_not_starts_with?: InputMaybe<Scalars['String']>;
  leveragedVault_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  leveragedVault_starts_with?: InputMaybe<Scalars['String']>;
  leveragedVault_starts_with_nocase?: InputMaybe<Scalars['String']>;
  maxPrimaryBorrowCapacity?: InputMaybe<Scalars['BigInt']>;
  maxPrimaryBorrowCapacity_gt?: InputMaybe<Scalars['BigInt']>;
  maxPrimaryBorrowCapacity_gte?: InputMaybe<Scalars['BigInt']>;
  maxPrimaryBorrowCapacity_in?: InputMaybe<Array<Scalars['BigInt']>>;
  maxPrimaryBorrowCapacity_lt?: InputMaybe<Scalars['BigInt']>;
  maxPrimaryBorrowCapacity_lte?: InputMaybe<Scalars['BigInt']>;
  maxPrimaryBorrowCapacity_not?: InputMaybe<Scalars['BigInt']>;
  maxPrimaryBorrowCapacity_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  maxSecondaryBorrowCapacity?: InputMaybe<Array<Scalars['BigInt']>>;
  maxSecondaryBorrowCapacity_contains?: InputMaybe<Array<Scalars['BigInt']>>;
  maxSecondaryBorrowCapacity_contains_nocase?: InputMaybe<Array<Scalars['BigInt']>>;
  maxSecondaryBorrowCapacity_not?: InputMaybe<Array<Scalars['BigInt']>>;
  maxSecondaryBorrowCapacity_not_contains?: InputMaybe<Array<Scalars['BigInt']>>;
  maxSecondaryBorrowCapacity_not_contains_nocase?: InputMaybe<Array<Scalars['BigInt']>>;
  totalUsedPrimaryBorrowCapacity?: InputMaybe<Scalars['BigInt']>;
  totalUsedPrimaryBorrowCapacity_gt?: InputMaybe<Scalars['BigInt']>;
  totalUsedPrimaryBorrowCapacity_gte?: InputMaybe<Scalars['BigInt']>;
  totalUsedPrimaryBorrowCapacity_in?: InputMaybe<Array<Scalars['BigInt']>>;
  totalUsedPrimaryBorrowCapacity_lt?: InputMaybe<Scalars['BigInt']>;
  totalUsedPrimaryBorrowCapacity_lte?: InputMaybe<Scalars['BigInt']>;
  totalUsedPrimaryBorrowCapacity_not?: InputMaybe<Scalars['BigInt']>;
  totalUsedPrimaryBorrowCapacity_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  totalUsedSecondaryBorrowCapacity?: InputMaybe<Array<Scalars['BigInt']>>;
  totalUsedSecondaryBorrowCapacity_contains?: InputMaybe<Array<Scalars['BigInt']>>;
  totalUsedSecondaryBorrowCapacity_contains_nocase?: InputMaybe<Array<Scalars['BigInt']>>;
  totalUsedSecondaryBorrowCapacity_not?: InputMaybe<Array<Scalars['BigInt']>>;
  totalUsedSecondaryBorrowCapacity_not_contains?: InputMaybe<Array<Scalars['BigInt']>>;
  totalUsedSecondaryBorrowCapacity_not_contains_nocase?: InputMaybe<Array<Scalars['BigInt']>>;
};

export enum LeveragedVaultCapacity_OrderBy {
  Id = 'id',
  LastUpdateBlockHash = 'lastUpdateBlockHash',
  LastUpdateBlockNumber = 'lastUpdateBlockNumber',
  LastUpdateTimestamp = 'lastUpdateTimestamp',
  LastUpdateTransactionHash = 'lastUpdateTransactionHash',
  LeveragedVault = 'leveragedVault',
  MaxPrimaryBorrowCapacity = 'maxPrimaryBorrowCapacity',
  MaxSecondaryBorrowCapacity = 'maxSecondaryBorrowCapacity',
  TotalUsedPrimaryBorrowCapacity = 'totalUsedPrimaryBorrowCapacity',
  TotalUsedSecondaryBorrowCapacity = 'totalUsedSecondaryBorrowCapacity'
}

export type LeveragedVaultDirectory = {
  __typename?: 'LeveragedVaultDirectory';
  /** ID is always set to 0 */
  id: Scalars['ID'];
  listedLeveragedVaults: Array<LeveragedVault>;
};


export type LeveragedVaultDirectoryListedLeveragedVaultsArgs = {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<LeveragedVault_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<LeveragedVault_Filter>;
};

export type LeveragedVaultDirectory_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  id?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  listedLeveragedVaults?: InputMaybe<Array<Scalars['String']>>;
  listedLeveragedVaults_?: InputMaybe<LeveragedVault_Filter>;
  listedLeveragedVaults_contains?: InputMaybe<Array<Scalars['String']>>;
  listedLeveragedVaults_contains_nocase?: InputMaybe<Array<Scalars['String']>>;
  listedLeveragedVaults_not?: InputMaybe<Array<Scalars['String']>>;
  listedLeveragedVaults_not_contains?: InputMaybe<Array<Scalars['String']>>;
  listedLeveragedVaults_not_contains_nocase?: InputMaybe<Array<Scalars['String']>>;
};

export enum LeveragedVaultDirectory_OrderBy {
  Id = 'id',
  ListedLeveragedVaults = 'listedLeveragedVaults'
}

export type LeveragedVaultHistoricalValue = {
  __typename?: 'LeveragedVaultHistoricalValue';
  /** Asset rate for the primary borrow currency at this timestamp */
  assetExchangeRate: AssetExchangeRateHistoricalData;
  /** Exchange rate for the primary borrow currency at this timestamp */
  ethExchangeRate: EthExchangeRateHistoricalData;
  /** leveragedVault:maturity:timestamp */
  id: Scalars['ID'];
  leveragedVaultMaturity: LeveragedVaultMaturity;
  timestamp: Scalars['Int'];
  /** Value of a single strategy token at the given timestamp */
  underlyingValueOfStrategyToken: Scalars['BigInt'];
};

export type LeveragedVaultHistoricalValue_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  assetExchangeRate?: InputMaybe<Scalars['String']>;
  assetExchangeRate_?: InputMaybe<AssetExchangeRateHistoricalData_Filter>;
  assetExchangeRate_contains?: InputMaybe<Scalars['String']>;
  assetExchangeRate_contains_nocase?: InputMaybe<Scalars['String']>;
  assetExchangeRate_ends_with?: InputMaybe<Scalars['String']>;
  assetExchangeRate_ends_with_nocase?: InputMaybe<Scalars['String']>;
  assetExchangeRate_gt?: InputMaybe<Scalars['String']>;
  assetExchangeRate_gte?: InputMaybe<Scalars['String']>;
  assetExchangeRate_in?: InputMaybe<Array<Scalars['String']>>;
  assetExchangeRate_lt?: InputMaybe<Scalars['String']>;
  assetExchangeRate_lte?: InputMaybe<Scalars['String']>;
  assetExchangeRate_not?: InputMaybe<Scalars['String']>;
  assetExchangeRate_not_contains?: InputMaybe<Scalars['String']>;
  assetExchangeRate_not_contains_nocase?: InputMaybe<Scalars['String']>;
  assetExchangeRate_not_ends_with?: InputMaybe<Scalars['String']>;
  assetExchangeRate_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  assetExchangeRate_not_in?: InputMaybe<Array<Scalars['String']>>;
  assetExchangeRate_not_starts_with?: InputMaybe<Scalars['String']>;
  assetExchangeRate_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  assetExchangeRate_starts_with?: InputMaybe<Scalars['String']>;
  assetExchangeRate_starts_with_nocase?: InputMaybe<Scalars['String']>;
  ethExchangeRate?: InputMaybe<Scalars['String']>;
  ethExchangeRate_?: InputMaybe<EthExchangeRateHistoricalData_Filter>;
  ethExchangeRate_contains?: InputMaybe<Scalars['String']>;
  ethExchangeRate_contains_nocase?: InputMaybe<Scalars['String']>;
  ethExchangeRate_ends_with?: InputMaybe<Scalars['String']>;
  ethExchangeRate_ends_with_nocase?: InputMaybe<Scalars['String']>;
  ethExchangeRate_gt?: InputMaybe<Scalars['String']>;
  ethExchangeRate_gte?: InputMaybe<Scalars['String']>;
  ethExchangeRate_in?: InputMaybe<Array<Scalars['String']>>;
  ethExchangeRate_lt?: InputMaybe<Scalars['String']>;
  ethExchangeRate_lte?: InputMaybe<Scalars['String']>;
  ethExchangeRate_not?: InputMaybe<Scalars['String']>;
  ethExchangeRate_not_contains?: InputMaybe<Scalars['String']>;
  ethExchangeRate_not_contains_nocase?: InputMaybe<Scalars['String']>;
  ethExchangeRate_not_ends_with?: InputMaybe<Scalars['String']>;
  ethExchangeRate_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  ethExchangeRate_not_in?: InputMaybe<Array<Scalars['String']>>;
  ethExchangeRate_not_starts_with?: InputMaybe<Scalars['String']>;
  ethExchangeRate_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  ethExchangeRate_starts_with?: InputMaybe<Scalars['String']>;
  ethExchangeRate_starts_with_nocase?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  leveragedVaultMaturity?: InputMaybe<Scalars['String']>;
  leveragedVaultMaturity_?: InputMaybe<LeveragedVaultMaturity_Filter>;
  leveragedVaultMaturity_contains?: InputMaybe<Scalars['String']>;
  leveragedVaultMaturity_contains_nocase?: InputMaybe<Scalars['String']>;
  leveragedVaultMaturity_ends_with?: InputMaybe<Scalars['String']>;
  leveragedVaultMaturity_ends_with_nocase?: InputMaybe<Scalars['String']>;
  leveragedVaultMaturity_gt?: InputMaybe<Scalars['String']>;
  leveragedVaultMaturity_gte?: InputMaybe<Scalars['String']>;
  leveragedVaultMaturity_in?: InputMaybe<Array<Scalars['String']>>;
  leveragedVaultMaturity_lt?: InputMaybe<Scalars['String']>;
  leveragedVaultMaturity_lte?: InputMaybe<Scalars['String']>;
  leveragedVaultMaturity_not?: InputMaybe<Scalars['String']>;
  leveragedVaultMaturity_not_contains?: InputMaybe<Scalars['String']>;
  leveragedVaultMaturity_not_contains_nocase?: InputMaybe<Scalars['String']>;
  leveragedVaultMaturity_not_ends_with?: InputMaybe<Scalars['String']>;
  leveragedVaultMaturity_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  leveragedVaultMaturity_not_in?: InputMaybe<Array<Scalars['String']>>;
  leveragedVaultMaturity_not_starts_with?: InputMaybe<Scalars['String']>;
  leveragedVaultMaturity_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  leveragedVaultMaturity_starts_with?: InputMaybe<Scalars['String']>;
  leveragedVaultMaturity_starts_with_nocase?: InputMaybe<Scalars['String']>;
  timestamp?: InputMaybe<Scalars['Int']>;
  timestamp_gt?: InputMaybe<Scalars['Int']>;
  timestamp_gte?: InputMaybe<Scalars['Int']>;
  timestamp_in?: InputMaybe<Array<Scalars['Int']>>;
  timestamp_lt?: InputMaybe<Scalars['Int']>;
  timestamp_lte?: InputMaybe<Scalars['Int']>;
  timestamp_not?: InputMaybe<Scalars['Int']>;
  timestamp_not_in?: InputMaybe<Array<Scalars['Int']>>;
  underlyingValueOfStrategyToken?: InputMaybe<Scalars['BigInt']>;
  underlyingValueOfStrategyToken_gt?: InputMaybe<Scalars['BigInt']>;
  underlyingValueOfStrategyToken_gte?: InputMaybe<Scalars['BigInt']>;
  underlyingValueOfStrategyToken_in?: InputMaybe<Array<Scalars['BigInt']>>;
  underlyingValueOfStrategyToken_lt?: InputMaybe<Scalars['BigInt']>;
  underlyingValueOfStrategyToken_lte?: InputMaybe<Scalars['BigInt']>;
  underlyingValueOfStrategyToken_not?: InputMaybe<Scalars['BigInt']>;
  underlyingValueOfStrategyToken_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
};

export enum LeveragedVaultHistoricalValue_OrderBy {
  AssetExchangeRate = 'assetExchangeRate',
  EthExchangeRate = 'ethExchangeRate',
  Id = 'id',
  LeveragedVaultMaturity = 'leveragedVaultMaturity',
  Timestamp = 'timestamp',
  UnderlyingValueOfStrategyToken = 'underlyingValueOfStrategyToken'
}

export type LeveragedVaultMaturity = {
  __typename?: 'LeveragedVaultMaturity';
  /** All strategy vault accounts in this maturity */
  accounts?: Maybe<Array<LeveragedVaultAccount>>;
  events?: Maybe<Array<LeveragedVaultMaturityEvent>>;
  historicalValue?: Maybe<Array<LeveragedVaultHistoricalValue>>;
  /** ID is the address of the vault:maturity */
  id: Scalars['ID'];
  /** Any insolvency to this vault maturity (if any) */
  insolvency?: Maybe<Scalars['BigInt']>;
  /** True if vault is settled */
  isSettled: Scalars['Boolean'];
  lastUpdateBlockHash: Scalars['Bytes'];
  lastUpdateBlockNumber: Scalars['Int'];
  lastUpdateTimestamp: Scalars['Int'];
  lastUpdateTransactionHash: Scalars['Bytes'];
  leveragedVault: LeveragedVault;
  /** Maturity of the given vault */
  maturity: Scalars['Int'];
  /** Asset cash remaining for accounts to withdraw post settlement */
  remainingSettledAssetCash?: Maybe<Scalars['BigInt']>;
  /** Strategy tokens remaining for accounts to withdraw post settlement */
  remainingSettledStrategyTokens?: Maybe<Scalars['BigInt']>;
  /** Holds the settlement rate of the primary borrow currency */
  settlementRate?: Maybe<SettlementRate>;
  /** Exchange rates between secondary currency and primary currency */
  settlementSecondaryBorrowExchangeRate?: Maybe<Array<Scalars['BigInt']>>;
  /** Snapshot of the secondary borrows in fCash prior to settlement (denominated in primary currency) */
  settlementSecondaryBorrowfCashSnapshot?: Maybe<Array<Scalars['BigInt']>>;
  /** If vault has settled, holds the value of the strategy token */
  settlementStrategyTokenValue?: Maybe<Scalars['BigInt']>;
  /** Timestamp when the vault was settled */
  settlementTimestamp?: Maybe<Scalars['Int']>;
  /** Any shortfall to this vault maturity (if any) */
  shortfall?: Maybe<Scalars['BigInt']>;
  /** Total asset cash held in the vault */
  totalAssetCash: Scalars['BigInt'];
  /** Total fees accrued to the nToken in this maturity */
  totalNTokenFeesAccrued: Scalars['BigInt'];
  /** Total fCash borrowed in the primary currency */
  totalPrimaryfCashBorrowed: Scalars['BigInt'];
  /** Total fees accrued to the reserve in this maturity */
  totalReserveFeesAccrued: Scalars['BigInt'];
  /** Total secondary debt shares for secondary borrow currencies */
  totalSecondaryDebtShares?: Maybe<Array<Scalars['BigInt']>>;
  /** Total secondary fCash borrowed for secondary borrow currencies */
  totalSecondaryfCashBorrowed?: Maybe<Array<Scalars['BigInt']>>;
  /** Total strategy tokens in the vault */
  totalStrategyTokens: Scalars['BigInt'];
  /** Total vault shares in the vault */
  totalVaultShares: Scalars['BigInt'];
};


export type LeveragedVaultMaturityAccountsArgs = {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<LeveragedVaultAccount_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<LeveragedVaultAccount_Filter>;
};


export type LeveragedVaultMaturityEventsArgs = {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<LeveragedVaultMaturityEvent_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<LeveragedVaultMaturityEvent_Filter>;
};


export type LeveragedVaultMaturityHistoricalValueArgs = {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<LeveragedVaultHistoricalValue_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<LeveragedVaultHistoricalValue_Filter>;
};

export type LeveragedVaultMaturityEvent = {
  __typename?: 'LeveragedVaultMaturityEvent';
  blockHash: Scalars['Bytes'];
  blockNumber: Scalars['Int'];
  /** leveragedVault:account or vault address:transaction hash:log index */
  id: Scalars['ID'];
  leveragedVaultMaturity: LeveragedVaultMaturity;
  /** Net change to asset cash */
  netAssetCashChange: Scalars['BigInt'];
  /** Net change to strategy tokens */
  netStrategyTokenChange: Scalars['BigInt'];
  timestamp: Scalars['Int'];
  transactionHash: Scalars['Bytes'];
  transactionOrigin: Scalars['Bytes'];
};

export type LeveragedVaultMaturityEvent_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  blockHash?: InputMaybe<Scalars['Bytes']>;
  blockHash_contains?: InputMaybe<Scalars['Bytes']>;
  blockHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
  blockHash_not?: InputMaybe<Scalars['Bytes']>;
  blockHash_not_contains?: InputMaybe<Scalars['Bytes']>;
  blockHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  blockNumber?: InputMaybe<Scalars['Int']>;
  blockNumber_gt?: InputMaybe<Scalars['Int']>;
  blockNumber_gte?: InputMaybe<Scalars['Int']>;
  blockNumber_in?: InputMaybe<Array<Scalars['Int']>>;
  blockNumber_lt?: InputMaybe<Scalars['Int']>;
  blockNumber_lte?: InputMaybe<Scalars['Int']>;
  blockNumber_not?: InputMaybe<Scalars['Int']>;
  blockNumber_not_in?: InputMaybe<Array<Scalars['Int']>>;
  id?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  leveragedVaultMaturity?: InputMaybe<Scalars['String']>;
  leveragedVaultMaturity_?: InputMaybe<LeveragedVaultMaturity_Filter>;
  leveragedVaultMaturity_contains?: InputMaybe<Scalars['String']>;
  leveragedVaultMaturity_contains_nocase?: InputMaybe<Scalars['String']>;
  leveragedVaultMaturity_ends_with?: InputMaybe<Scalars['String']>;
  leveragedVaultMaturity_ends_with_nocase?: InputMaybe<Scalars['String']>;
  leveragedVaultMaturity_gt?: InputMaybe<Scalars['String']>;
  leveragedVaultMaturity_gte?: InputMaybe<Scalars['String']>;
  leveragedVaultMaturity_in?: InputMaybe<Array<Scalars['String']>>;
  leveragedVaultMaturity_lt?: InputMaybe<Scalars['String']>;
  leveragedVaultMaturity_lte?: InputMaybe<Scalars['String']>;
  leveragedVaultMaturity_not?: InputMaybe<Scalars['String']>;
  leveragedVaultMaturity_not_contains?: InputMaybe<Scalars['String']>;
  leveragedVaultMaturity_not_contains_nocase?: InputMaybe<Scalars['String']>;
  leveragedVaultMaturity_not_ends_with?: InputMaybe<Scalars['String']>;
  leveragedVaultMaturity_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  leveragedVaultMaturity_not_in?: InputMaybe<Array<Scalars['String']>>;
  leveragedVaultMaturity_not_starts_with?: InputMaybe<Scalars['String']>;
  leveragedVaultMaturity_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  leveragedVaultMaturity_starts_with?: InputMaybe<Scalars['String']>;
  leveragedVaultMaturity_starts_with_nocase?: InputMaybe<Scalars['String']>;
  netAssetCashChange?: InputMaybe<Scalars['BigInt']>;
  netAssetCashChange_gt?: InputMaybe<Scalars['BigInt']>;
  netAssetCashChange_gte?: InputMaybe<Scalars['BigInt']>;
  netAssetCashChange_in?: InputMaybe<Array<Scalars['BigInt']>>;
  netAssetCashChange_lt?: InputMaybe<Scalars['BigInt']>;
  netAssetCashChange_lte?: InputMaybe<Scalars['BigInt']>;
  netAssetCashChange_not?: InputMaybe<Scalars['BigInt']>;
  netAssetCashChange_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  netStrategyTokenChange?: InputMaybe<Scalars['BigInt']>;
  netStrategyTokenChange_gt?: InputMaybe<Scalars['BigInt']>;
  netStrategyTokenChange_gte?: InputMaybe<Scalars['BigInt']>;
  netStrategyTokenChange_in?: InputMaybe<Array<Scalars['BigInt']>>;
  netStrategyTokenChange_lt?: InputMaybe<Scalars['BigInt']>;
  netStrategyTokenChange_lte?: InputMaybe<Scalars['BigInt']>;
  netStrategyTokenChange_not?: InputMaybe<Scalars['BigInt']>;
  netStrategyTokenChange_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  timestamp?: InputMaybe<Scalars['Int']>;
  timestamp_gt?: InputMaybe<Scalars['Int']>;
  timestamp_gte?: InputMaybe<Scalars['Int']>;
  timestamp_in?: InputMaybe<Array<Scalars['Int']>>;
  timestamp_lt?: InputMaybe<Scalars['Int']>;
  timestamp_lte?: InputMaybe<Scalars['Int']>;
  timestamp_not?: InputMaybe<Scalars['Int']>;
  timestamp_not_in?: InputMaybe<Array<Scalars['Int']>>;
  transactionHash?: InputMaybe<Scalars['Bytes']>;
  transactionHash_contains?: InputMaybe<Scalars['Bytes']>;
  transactionHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
  transactionHash_not?: InputMaybe<Scalars['Bytes']>;
  transactionHash_not_contains?: InputMaybe<Scalars['Bytes']>;
  transactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  transactionOrigin?: InputMaybe<Scalars['Bytes']>;
  transactionOrigin_contains?: InputMaybe<Scalars['Bytes']>;
  transactionOrigin_in?: InputMaybe<Array<Scalars['Bytes']>>;
  transactionOrigin_not?: InputMaybe<Scalars['Bytes']>;
  transactionOrigin_not_contains?: InputMaybe<Scalars['Bytes']>;
  transactionOrigin_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
};

export enum LeveragedVaultMaturityEvent_OrderBy {
  BlockHash = 'blockHash',
  BlockNumber = 'blockNumber',
  Id = 'id',
  LeveragedVaultMaturity = 'leveragedVaultMaturity',
  NetAssetCashChange = 'netAssetCashChange',
  NetStrategyTokenChange = 'netStrategyTokenChange',
  Timestamp = 'timestamp',
  TransactionHash = 'transactionHash',
  TransactionOrigin = 'transactionOrigin'
}

export type LeveragedVaultMaturity_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  accounts_?: InputMaybe<LeveragedVaultAccount_Filter>;
  events_?: InputMaybe<LeveragedVaultMaturityEvent_Filter>;
  historicalValue_?: InputMaybe<LeveragedVaultHistoricalValue_Filter>;
  id?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  insolvency?: InputMaybe<Scalars['BigInt']>;
  insolvency_gt?: InputMaybe<Scalars['BigInt']>;
  insolvency_gte?: InputMaybe<Scalars['BigInt']>;
  insolvency_in?: InputMaybe<Array<Scalars['BigInt']>>;
  insolvency_lt?: InputMaybe<Scalars['BigInt']>;
  insolvency_lte?: InputMaybe<Scalars['BigInt']>;
  insolvency_not?: InputMaybe<Scalars['BigInt']>;
  insolvency_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  isSettled?: InputMaybe<Scalars['Boolean']>;
  isSettled_in?: InputMaybe<Array<Scalars['Boolean']>>;
  isSettled_not?: InputMaybe<Scalars['Boolean']>;
  isSettled_not_in?: InputMaybe<Array<Scalars['Boolean']>>;
  lastUpdateBlockHash?: InputMaybe<Scalars['Bytes']>;
  lastUpdateBlockHash_contains?: InputMaybe<Scalars['Bytes']>;
  lastUpdateBlockHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
  lastUpdateBlockHash_not?: InputMaybe<Scalars['Bytes']>;
  lastUpdateBlockHash_not_contains?: InputMaybe<Scalars['Bytes']>;
  lastUpdateBlockHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  lastUpdateBlockNumber?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_gt?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_gte?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_in?: InputMaybe<Array<Scalars['Int']>>;
  lastUpdateBlockNumber_lt?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_lte?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_not?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_not_in?: InputMaybe<Array<Scalars['Int']>>;
  lastUpdateTimestamp?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_gt?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_gte?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_in?: InputMaybe<Array<Scalars['Int']>>;
  lastUpdateTimestamp_lt?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_lte?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_not?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_not_in?: InputMaybe<Array<Scalars['Int']>>;
  lastUpdateTransactionHash?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_contains?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
  lastUpdateTransactionHash_not?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_not_contains?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  leveragedVault?: InputMaybe<Scalars['String']>;
  leveragedVault_?: InputMaybe<LeveragedVault_Filter>;
  leveragedVault_contains?: InputMaybe<Scalars['String']>;
  leveragedVault_contains_nocase?: InputMaybe<Scalars['String']>;
  leveragedVault_ends_with?: InputMaybe<Scalars['String']>;
  leveragedVault_ends_with_nocase?: InputMaybe<Scalars['String']>;
  leveragedVault_gt?: InputMaybe<Scalars['String']>;
  leveragedVault_gte?: InputMaybe<Scalars['String']>;
  leveragedVault_in?: InputMaybe<Array<Scalars['String']>>;
  leveragedVault_lt?: InputMaybe<Scalars['String']>;
  leveragedVault_lte?: InputMaybe<Scalars['String']>;
  leveragedVault_not?: InputMaybe<Scalars['String']>;
  leveragedVault_not_contains?: InputMaybe<Scalars['String']>;
  leveragedVault_not_contains_nocase?: InputMaybe<Scalars['String']>;
  leveragedVault_not_ends_with?: InputMaybe<Scalars['String']>;
  leveragedVault_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  leveragedVault_not_in?: InputMaybe<Array<Scalars['String']>>;
  leveragedVault_not_starts_with?: InputMaybe<Scalars['String']>;
  leveragedVault_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  leveragedVault_starts_with?: InputMaybe<Scalars['String']>;
  leveragedVault_starts_with_nocase?: InputMaybe<Scalars['String']>;
  maturity?: InputMaybe<Scalars['Int']>;
  maturity_gt?: InputMaybe<Scalars['Int']>;
  maturity_gte?: InputMaybe<Scalars['Int']>;
  maturity_in?: InputMaybe<Array<Scalars['Int']>>;
  maturity_lt?: InputMaybe<Scalars['Int']>;
  maturity_lte?: InputMaybe<Scalars['Int']>;
  maturity_not?: InputMaybe<Scalars['Int']>;
  maturity_not_in?: InputMaybe<Array<Scalars['Int']>>;
  remainingSettledAssetCash?: InputMaybe<Scalars['BigInt']>;
  remainingSettledAssetCash_gt?: InputMaybe<Scalars['BigInt']>;
  remainingSettledAssetCash_gte?: InputMaybe<Scalars['BigInt']>;
  remainingSettledAssetCash_in?: InputMaybe<Array<Scalars['BigInt']>>;
  remainingSettledAssetCash_lt?: InputMaybe<Scalars['BigInt']>;
  remainingSettledAssetCash_lte?: InputMaybe<Scalars['BigInt']>;
  remainingSettledAssetCash_not?: InputMaybe<Scalars['BigInt']>;
  remainingSettledAssetCash_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  remainingSettledStrategyTokens?: InputMaybe<Scalars['BigInt']>;
  remainingSettledStrategyTokens_gt?: InputMaybe<Scalars['BigInt']>;
  remainingSettledStrategyTokens_gte?: InputMaybe<Scalars['BigInt']>;
  remainingSettledStrategyTokens_in?: InputMaybe<Array<Scalars['BigInt']>>;
  remainingSettledStrategyTokens_lt?: InputMaybe<Scalars['BigInt']>;
  remainingSettledStrategyTokens_lte?: InputMaybe<Scalars['BigInt']>;
  remainingSettledStrategyTokens_not?: InputMaybe<Scalars['BigInt']>;
  remainingSettledStrategyTokens_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  settlementRate?: InputMaybe<Scalars['String']>;
  settlementRate_?: InputMaybe<SettlementRate_Filter>;
  settlementRate_contains?: InputMaybe<Scalars['String']>;
  settlementRate_contains_nocase?: InputMaybe<Scalars['String']>;
  settlementRate_ends_with?: InputMaybe<Scalars['String']>;
  settlementRate_ends_with_nocase?: InputMaybe<Scalars['String']>;
  settlementRate_gt?: InputMaybe<Scalars['String']>;
  settlementRate_gte?: InputMaybe<Scalars['String']>;
  settlementRate_in?: InputMaybe<Array<Scalars['String']>>;
  settlementRate_lt?: InputMaybe<Scalars['String']>;
  settlementRate_lte?: InputMaybe<Scalars['String']>;
  settlementRate_not?: InputMaybe<Scalars['String']>;
  settlementRate_not_contains?: InputMaybe<Scalars['String']>;
  settlementRate_not_contains_nocase?: InputMaybe<Scalars['String']>;
  settlementRate_not_ends_with?: InputMaybe<Scalars['String']>;
  settlementRate_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  settlementRate_not_in?: InputMaybe<Array<Scalars['String']>>;
  settlementRate_not_starts_with?: InputMaybe<Scalars['String']>;
  settlementRate_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  settlementRate_starts_with?: InputMaybe<Scalars['String']>;
  settlementRate_starts_with_nocase?: InputMaybe<Scalars['String']>;
  settlementSecondaryBorrowExchangeRate?: InputMaybe<Array<Scalars['BigInt']>>;
  settlementSecondaryBorrowExchangeRate_contains?: InputMaybe<Array<Scalars['BigInt']>>;
  settlementSecondaryBorrowExchangeRate_contains_nocase?: InputMaybe<Array<Scalars['BigInt']>>;
  settlementSecondaryBorrowExchangeRate_not?: InputMaybe<Array<Scalars['BigInt']>>;
  settlementSecondaryBorrowExchangeRate_not_contains?: InputMaybe<Array<Scalars['BigInt']>>;
  settlementSecondaryBorrowExchangeRate_not_contains_nocase?: InputMaybe<Array<Scalars['BigInt']>>;
  settlementSecondaryBorrowfCashSnapshot?: InputMaybe<Array<Scalars['BigInt']>>;
  settlementSecondaryBorrowfCashSnapshot_contains?: InputMaybe<Array<Scalars['BigInt']>>;
  settlementSecondaryBorrowfCashSnapshot_contains_nocase?: InputMaybe<Array<Scalars['BigInt']>>;
  settlementSecondaryBorrowfCashSnapshot_not?: InputMaybe<Array<Scalars['BigInt']>>;
  settlementSecondaryBorrowfCashSnapshot_not_contains?: InputMaybe<Array<Scalars['BigInt']>>;
  settlementSecondaryBorrowfCashSnapshot_not_contains_nocase?: InputMaybe<Array<Scalars['BigInt']>>;
  settlementStrategyTokenValue?: InputMaybe<Scalars['BigInt']>;
  settlementStrategyTokenValue_gt?: InputMaybe<Scalars['BigInt']>;
  settlementStrategyTokenValue_gte?: InputMaybe<Scalars['BigInt']>;
  settlementStrategyTokenValue_in?: InputMaybe<Array<Scalars['BigInt']>>;
  settlementStrategyTokenValue_lt?: InputMaybe<Scalars['BigInt']>;
  settlementStrategyTokenValue_lte?: InputMaybe<Scalars['BigInt']>;
  settlementStrategyTokenValue_not?: InputMaybe<Scalars['BigInt']>;
  settlementStrategyTokenValue_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  settlementTimestamp?: InputMaybe<Scalars['Int']>;
  settlementTimestamp_gt?: InputMaybe<Scalars['Int']>;
  settlementTimestamp_gte?: InputMaybe<Scalars['Int']>;
  settlementTimestamp_in?: InputMaybe<Array<Scalars['Int']>>;
  settlementTimestamp_lt?: InputMaybe<Scalars['Int']>;
  settlementTimestamp_lte?: InputMaybe<Scalars['Int']>;
  settlementTimestamp_not?: InputMaybe<Scalars['Int']>;
  settlementTimestamp_not_in?: InputMaybe<Array<Scalars['Int']>>;
  shortfall?: InputMaybe<Scalars['BigInt']>;
  shortfall_gt?: InputMaybe<Scalars['BigInt']>;
  shortfall_gte?: InputMaybe<Scalars['BigInt']>;
  shortfall_in?: InputMaybe<Array<Scalars['BigInt']>>;
  shortfall_lt?: InputMaybe<Scalars['BigInt']>;
  shortfall_lte?: InputMaybe<Scalars['BigInt']>;
  shortfall_not?: InputMaybe<Scalars['BigInt']>;
  shortfall_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  totalAssetCash?: InputMaybe<Scalars['BigInt']>;
  totalAssetCash_gt?: InputMaybe<Scalars['BigInt']>;
  totalAssetCash_gte?: InputMaybe<Scalars['BigInt']>;
  totalAssetCash_in?: InputMaybe<Array<Scalars['BigInt']>>;
  totalAssetCash_lt?: InputMaybe<Scalars['BigInt']>;
  totalAssetCash_lte?: InputMaybe<Scalars['BigInt']>;
  totalAssetCash_not?: InputMaybe<Scalars['BigInt']>;
  totalAssetCash_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  totalNTokenFeesAccrued?: InputMaybe<Scalars['BigInt']>;
  totalNTokenFeesAccrued_gt?: InputMaybe<Scalars['BigInt']>;
  totalNTokenFeesAccrued_gte?: InputMaybe<Scalars['BigInt']>;
  totalNTokenFeesAccrued_in?: InputMaybe<Array<Scalars['BigInt']>>;
  totalNTokenFeesAccrued_lt?: InputMaybe<Scalars['BigInt']>;
  totalNTokenFeesAccrued_lte?: InputMaybe<Scalars['BigInt']>;
  totalNTokenFeesAccrued_not?: InputMaybe<Scalars['BigInt']>;
  totalNTokenFeesAccrued_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  totalPrimaryfCashBorrowed?: InputMaybe<Scalars['BigInt']>;
  totalPrimaryfCashBorrowed_gt?: InputMaybe<Scalars['BigInt']>;
  totalPrimaryfCashBorrowed_gte?: InputMaybe<Scalars['BigInt']>;
  totalPrimaryfCashBorrowed_in?: InputMaybe<Array<Scalars['BigInt']>>;
  totalPrimaryfCashBorrowed_lt?: InputMaybe<Scalars['BigInt']>;
  totalPrimaryfCashBorrowed_lte?: InputMaybe<Scalars['BigInt']>;
  totalPrimaryfCashBorrowed_not?: InputMaybe<Scalars['BigInt']>;
  totalPrimaryfCashBorrowed_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  totalReserveFeesAccrued?: InputMaybe<Scalars['BigInt']>;
  totalReserveFeesAccrued_gt?: InputMaybe<Scalars['BigInt']>;
  totalReserveFeesAccrued_gte?: InputMaybe<Scalars['BigInt']>;
  totalReserveFeesAccrued_in?: InputMaybe<Array<Scalars['BigInt']>>;
  totalReserveFeesAccrued_lt?: InputMaybe<Scalars['BigInt']>;
  totalReserveFeesAccrued_lte?: InputMaybe<Scalars['BigInt']>;
  totalReserveFeesAccrued_not?: InputMaybe<Scalars['BigInt']>;
  totalReserveFeesAccrued_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  totalSecondaryDebtShares?: InputMaybe<Array<Scalars['BigInt']>>;
  totalSecondaryDebtShares_contains?: InputMaybe<Array<Scalars['BigInt']>>;
  totalSecondaryDebtShares_contains_nocase?: InputMaybe<Array<Scalars['BigInt']>>;
  totalSecondaryDebtShares_not?: InputMaybe<Array<Scalars['BigInt']>>;
  totalSecondaryDebtShares_not_contains?: InputMaybe<Array<Scalars['BigInt']>>;
  totalSecondaryDebtShares_not_contains_nocase?: InputMaybe<Array<Scalars['BigInt']>>;
  totalSecondaryfCashBorrowed?: InputMaybe<Array<Scalars['BigInt']>>;
  totalSecondaryfCashBorrowed_contains?: InputMaybe<Array<Scalars['BigInt']>>;
  totalSecondaryfCashBorrowed_contains_nocase?: InputMaybe<Array<Scalars['BigInt']>>;
  totalSecondaryfCashBorrowed_not?: InputMaybe<Array<Scalars['BigInt']>>;
  totalSecondaryfCashBorrowed_not_contains?: InputMaybe<Array<Scalars['BigInt']>>;
  totalSecondaryfCashBorrowed_not_contains_nocase?: InputMaybe<Array<Scalars['BigInt']>>;
  totalStrategyTokens?: InputMaybe<Scalars['BigInt']>;
  totalStrategyTokens_gt?: InputMaybe<Scalars['BigInt']>;
  totalStrategyTokens_gte?: InputMaybe<Scalars['BigInt']>;
  totalStrategyTokens_in?: InputMaybe<Array<Scalars['BigInt']>>;
  totalStrategyTokens_lt?: InputMaybe<Scalars['BigInt']>;
  totalStrategyTokens_lte?: InputMaybe<Scalars['BigInt']>;
  totalStrategyTokens_not?: InputMaybe<Scalars['BigInt']>;
  totalStrategyTokens_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  totalVaultShares?: InputMaybe<Scalars['BigInt']>;
  totalVaultShares_gt?: InputMaybe<Scalars['BigInt']>;
  totalVaultShares_gte?: InputMaybe<Scalars['BigInt']>;
  totalVaultShares_in?: InputMaybe<Array<Scalars['BigInt']>>;
  totalVaultShares_lt?: InputMaybe<Scalars['BigInt']>;
  totalVaultShares_lte?: InputMaybe<Scalars['BigInt']>;
  totalVaultShares_not?: InputMaybe<Scalars['BigInt']>;
  totalVaultShares_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
};

export enum LeveragedVaultMaturity_OrderBy {
  Accounts = 'accounts',
  Events = 'events',
  HistoricalValue = 'historicalValue',
  Id = 'id',
  Insolvency = 'insolvency',
  IsSettled = 'isSettled',
  LastUpdateBlockHash = 'lastUpdateBlockHash',
  LastUpdateBlockNumber = 'lastUpdateBlockNumber',
  LastUpdateTimestamp = 'lastUpdateTimestamp',
  LastUpdateTransactionHash = 'lastUpdateTransactionHash',
  LeveragedVault = 'leveragedVault',
  Maturity = 'maturity',
  RemainingSettledAssetCash = 'remainingSettledAssetCash',
  RemainingSettledStrategyTokens = 'remainingSettledStrategyTokens',
  SettlementRate = 'settlementRate',
  SettlementSecondaryBorrowExchangeRate = 'settlementSecondaryBorrowExchangeRate',
  SettlementSecondaryBorrowfCashSnapshot = 'settlementSecondaryBorrowfCashSnapshot',
  SettlementStrategyTokenValue = 'settlementStrategyTokenValue',
  SettlementTimestamp = 'settlementTimestamp',
  Shortfall = 'shortfall',
  TotalAssetCash = 'totalAssetCash',
  TotalNTokenFeesAccrued = 'totalNTokenFeesAccrued',
  TotalPrimaryfCashBorrowed = 'totalPrimaryfCashBorrowed',
  TotalReserveFeesAccrued = 'totalReserveFeesAccrued',
  TotalSecondaryDebtShares = 'totalSecondaryDebtShares',
  TotalSecondaryfCashBorrowed = 'totalSecondaryfCashBorrowed',
  TotalStrategyTokens = 'totalStrategyTokens',
  TotalVaultShares = 'totalVaultShares'
}

export type LeveragedVaultTrade = {
  __typename?: 'LeveragedVaultTrade';
  account: Account;
  blockHash: Scalars['Bytes'];
  blockNumber: Scalars['Int'];
  /** leveragedVault:account or vault address:transaction hash:log index */
  id: Scalars['ID'];
  leveragedVault: LeveragedVault;
  leveragedVaultAccount: LeveragedVaultAccount;
  leveragedVaultMaturityAfter?: Maybe<LeveragedVaultMaturity>;
  leveragedVaultMaturityBefore?: Maybe<LeveragedVaultMaturity>;
  /** Net amount of cash that was borrowed or repaid, positive on enter, negative on exit */
  netBorrowedUnderlying?: Maybe<Scalars['BigInt']>;
  /** Net amount of cash that was deposited or withdrawn, positive on enter, negative on exit */
  netDepositUnderlying?: Maybe<Scalars['BigInt']>;
  netPrimaryBorrowfCashChange?: Maybe<Scalars['BigInt']>;
  netSecondaryDebtSharesChange?: Maybe<Array<Scalars['BigInt']>>;
  /** Total change in cash between Notional and the vault, positive on entering, negative on exit */
  netUnderlyingCash?: Maybe<Scalars['BigInt']>;
  netVaultSharesChange?: Maybe<Scalars['BigInt']>;
  primaryBorrowfCashAfter: Scalars['BigInt'];
  /** Net change to fCash borrowed in the primary currencies */
  primaryBorrowfCashBefore: Scalars['BigInt'];
  secondaryDebtSharesAfter?: Maybe<Array<Scalars['BigInt']>>;
  /** Net change to fCash borrowed in the secondary currencies */
  secondaryDebtSharesBefore?: Maybe<Array<Scalars['BigInt']>>;
  timestamp: Scalars['Int'];
  transactionHash: Scalars['Bytes'];
  transactionOrigin: Scalars['Bytes'];
  vaultSharesAfter: Scalars['BigInt'];
  /** Net change to vault shares */
  vaultSharesBefore: Scalars['BigInt'];
  vaultTradeType: VaultTradeType;
};

export type LeveragedVaultTrade_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  account?: InputMaybe<Scalars['String']>;
  account_?: InputMaybe<Account_Filter>;
  account_contains?: InputMaybe<Scalars['String']>;
  account_contains_nocase?: InputMaybe<Scalars['String']>;
  account_ends_with?: InputMaybe<Scalars['String']>;
  account_ends_with_nocase?: InputMaybe<Scalars['String']>;
  account_gt?: InputMaybe<Scalars['String']>;
  account_gte?: InputMaybe<Scalars['String']>;
  account_in?: InputMaybe<Array<Scalars['String']>>;
  account_lt?: InputMaybe<Scalars['String']>;
  account_lte?: InputMaybe<Scalars['String']>;
  account_not?: InputMaybe<Scalars['String']>;
  account_not_contains?: InputMaybe<Scalars['String']>;
  account_not_contains_nocase?: InputMaybe<Scalars['String']>;
  account_not_ends_with?: InputMaybe<Scalars['String']>;
  account_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  account_not_in?: InputMaybe<Array<Scalars['String']>>;
  account_not_starts_with?: InputMaybe<Scalars['String']>;
  account_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  account_starts_with?: InputMaybe<Scalars['String']>;
  account_starts_with_nocase?: InputMaybe<Scalars['String']>;
  blockHash?: InputMaybe<Scalars['Bytes']>;
  blockHash_contains?: InputMaybe<Scalars['Bytes']>;
  blockHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
  blockHash_not?: InputMaybe<Scalars['Bytes']>;
  blockHash_not_contains?: InputMaybe<Scalars['Bytes']>;
  blockHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  blockNumber?: InputMaybe<Scalars['Int']>;
  blockNumber_gt?: InputMaybe<Scalars['Int']>;
  blockNumber_gte?: InputMaybe<Scalars['Int']>;
  blockNumber_in?: InputMaybe<Array<Scalars['Int']>>;
  blockNumber_lt?: InputMaybe<Scalars['Int']>;
  blockNumber_lte?: InputMaybe<Scalars['Int']>;
  blockNumber_not?: InputMaybe<Scalars['Int']>;
  blockNumber_not_in?: InputMaybe<Array<Scalars['Int']>>;
  id?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  leveragedVault?: InputMaybe<Scalars['String']>;
  leveragedVaultAccount?: InputMaybe<Scalars['String']>;
  leveragedVaultAccount_?: InputMaybe<LeveragedVaultAccount_Filter>;
  leveragedVaultAccount_contains?: InputMaybe<Scalars['String']>;
  leveragedVaultAccount_contains_nocase?: InputMaybe<Scalars['String']>;
  leveragedVaultAccount_ends_with?: InputMaybe<Scalars['String']>;
  leveragedVaultAccount_ends_with_nocase?: InputMaybe<Scalars['String']>;
  leveragedVaultAccount_gt?: InputMaybe<Scalars['String']>;
  leveragedVaultAccount_gte?: InputMaybe<Scalars['String']>;
  leveragedVaultAccount_in?: InputMaybe<Array<Scalars['String']>>;
  leveragedVaultAccount_lt?: InputMaybe<Scalars['String']>;
  leveragedVaultAccount_lte?: InputMaybe<Scalars['String']>;
  leveragedVaultAccount_not?: InputMaybe<Scalars['String']>;
  leveragedVaultAccount_not_contains?: InputMaybe<Scalars['String']>;
  leveragedVaultAccount_not_contains_nocase?: InputMaybe<Scalars['String']>;
  leveragedVaultAccount_not_ends_with?: InputMaybe<Scalars['String']>;
  leveragedVaultAccount_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  leveragedVaultAccount_not_in?: InputMaybe<Array<Scalars['String']>>;
  leveragedVaultAccount_not_starts_with?: InputMaybe<Scalars['String']>;
  leveragedVaultAccount_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  leveragedVaultAccount_starts_with?: InputMaybe<Scalars['String']>;
  leveragedVaultAccount_starts_with_nocase?: InputMaybe<Scalars['String']>;
  leveragedVaultMaturityAfter?: InputMaybe<Scalars['String']>;
  leveragedVaultMaturityAfter_?: InputMaybe<LeveragedVaultMaturity_Filter>;
  leveragedVaultMaturityAfter_contains?: InputMaybe<Scalars['String']>;
  leveragedVaultMaturityAfter_contains_nocase?: InputMaybe<Scalars['String']>;
  leveragedVaultMaturityAfter_ends_with?: InputMaybe<Scalars['String']>;
  leveragedVaultMaturityAfter_ends_with_nocase?: InputMaybe<Scalars['String']>;
  leveragedVaultMaturityAfter_gt?: InputMaybe<Scalars['String']>;
  leveragedVaultMaturityAfter_gte?: InputMaybe<Scalars['String']>;
  leveragedVaultMaturityAfter_in?: InputMaybe<Array<Scalars['String']>>;
  leveragedVaultMaturityAfter_lt?: InputMaybe<Scalars['String']>;
  leveragedVaultMaturityAfter_lte?: InputMaybe<Scalars['String']>;
  leveragedVaultMaturityAfter_not?: InputMaybe<Scalars['String']>;
  leveragedVaultMaturityAfter_not_contains?: InputMaybe<Scalars['String']>;
  leveragedVaultMaturityAfter_not_contains_nocase?: InputMaybe<Scalars['String']>;
  leveragedVaultMaturityAfter_not_ends_with?: InputMaybe<Scalars['String']>;
  leveragedVaultMaturityAfter_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  leveragedVaultMaturityAfter_not_in?: InputMaybe<Array<Scalars['String']>>;
  leveragedVaultMaturityAfter_not_starts_with?: InputMaybe<Scalars['String']>;
  leveragedVaultMaturityAfter_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  leveragedVaultMaturityAfter_starts_with?: InputMaybe<Scalars['String']>;
  leveragedVaultMaturityAfter_starts_with_nocase?: InputMaybe<Scalars['String']>;
  leveragedVaultMaturityBefore?: InputMaybe<Scalars['String']>;
  leveragedVaultMaturityBefore_?: InputMaybe<LeveragedVaultMaturity_Filter>;
  leveragedVaultMaturityBefore_contains?: InputMaybe<Scalars['String']>;
  leveragedVaultMaturityBefore_contains_nocase?: InputMaybe<Scalars['String']>;
  leveragedVaultMaturityBefore_ends_with?: InputMaybe<Scalars['String']>;
  leveragedVaultMaturityBefore_ends_with_nocase?: InputMaybe<Scalars['String']>;
  leveragedVaultMaturityBefore_gt?: InputMaybe<Scalars['String']>;
  leveragedVaultMaturityBefore_gte?: InputMaybe<Scalars['String']>;
  leveragedVaultMaturityBefore_in?: InputMaybe<Array<Scalars['String']>>;
  leveragedVaultMaturityBefore_lt?: InputMaybe<Scalars['String']>;
  leveragedVaultMaturityBefore_lte?: InputMaybe<Scalars['String']>;
  leveragedVaultMaturityBefore_not?: InputMaybe<Scalars['String']>;
  leveragedVaultMaturityBefore_not_contains?: InputMaybe<Scalars['String']>;
  leveragedVaultMaturityBefore_not_contains_nocase?: InputMaybe<Scalars['String']>;
  leveragedVaultMaturityBefore_not_ends_with?: InputMaybe<Scalars['String']>;
  leveragedVaultMaturityBefore_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  leveragedVaultMaturityBefore_not_in?: InputMaybe<Array<Scalars['String']>>;
  leveragedVaultMaturityBefore_not_starts_with?: InputMaybe<Scalars['String']>;
  leveragedVaultMaturityBefore_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  leveragedVaultMaturityBefore_starts_with?: InputMaybe<Scalars['String']>;
  leveragedVaultMaturityBefore_starts_with_nocase?: InputMaybe<Scalars['String']>;
  leveragedVault_?: InputMaybe<LeveragedVault_Filter>;
  leveragedVault_contains?: InputMaybe<Scalars['String']>;
  leveragedVault_contains_nocase?: InputMaybe<Scalars['String']>;
  leveragedVault_ends_with?: InputMaybe<Scalars['String']>;
  leveragedVault_ends_with_nocase?: InputMaybe<Scalars['String']>;
  leveragedVault_gt?: InputMaybe<Scalars['String']>;
  leveragedVault_gte?: InputMaybe<Scalars['String']>;
  leveragedVault_in?: InputMaybe<Array<Scalars['String']>>;
  leveragedVault_lt?: InputMaybe<Scalars['String']>;
  leveragedVault_lte?: InputMaybe<Scalars['String']>;
  leveragedVault_not?: InputMaybe<Scalars['String']>;
  leveragedVault_not_contains?: InputMaybe<Scalars['String']>;
  leveragedVault_not_contains_nocase?: InputMaybe<Scalars['String']>;
  leveragedVault_not_ends_with?: InputMaybe<Scalars['String']>;
  leveragedVault_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  leveragedVault_not_in?: InputMaybe<Array<Scalars['String']>>;
  leveragedVault_not_starts_with?: InputMaybe<Scalars['String']>;
  leveragedVault_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  leveragedVault_starts_with?: InputMaybe<Scalars['String']>;
  leveragedVault_starts_with_nocase?: InputMaybe<Scalars['String']>;
  netBorrowedUnderlying?: InputMaybe<Scalars['BigInt']>;
  netBorrowedUnderlying_gt?: InputMaybe<Scalars['BigInt']>;
  netBorrowedUnderlying_gte?: InputMaybe<Scalars['BigInt']>;
  netBorrowedUnderlying_in?: InputMaybe<Array<Scalars['BigInt']>>;
  netBorrowedUnderlying_lt?: InputMaybe<Scalars['BigInt']>;
  netBorrowedUnderlying_lte?: InputMaybe<Scalars['BigInt']>;
  netBorrowedUnderlying_not?: InputMaybe<Scalars['BigInt']>;
  netBorrowedUnderlying_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  netDepositUnderlying?: InputMaybe<Scalars['BigInt']>;
  netDepositUnderlying_gt?: InputMaybe<Scalars['BigInt']>;
  netDepositUnderlying_gte?: InputMaybe<Scalars['BigInt']>;
  netDepositUnderlying_in?: InputMaybe<Array<Scalars['BigInt']>>;
  netDepositUnderlying_lt?: InputMaybe<Scalars['BigInt']>;
  netDepositUnderlying_lte?: InputMaybe<Scalars['BigInt']>;
  netDepositUnderlying_not?: InputMaybe<Scalars['BigInt']>;
  netDepositUnderlying_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  netPrimaryBorrowfCashChange?: InputMaybe<Scalars['BigInt']>;
  netPrimaryBorrowfCashChange_gt?: InputMaybe<Scalars['BigInt']>;
  netPrimaryBorrowfCashChange_gte?: InputMaybe<Scalars['BigInt']>;
  netPrimaryBorrowfCashChange_in?: InputMaybe<Array<Scalars['BigInt']>>;
  netPrimaryBorrowfCashChange_lt?: InputMaybe<Scalars['BigInt']>;
  netPrimaryBorrowfCashChange_lte?: InputMaybe<Scalars['BigInt']>;
  netPrimaryBorrowfCashChange_not?: InputMaybe<Scalars['BigInt']>;
  netPrimaryBorrowfCashChange_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  netSecondaryDebtSharesChange?: InputMaybe<Array<Scalars['BigInt']>>;
  netSecondaryDebtSharesChange_contains?: InputMaybe<Array<Scalars['BigInt']>>;
  netSecondaryDebtSharesChange_contains_nocase?: InputMaybe<Array<Scalars['BigInt']>>;
  netSecondaryDebtSharesChange_not?: InputMaybe<Array<Scalars['BigInt']>>;
  netSecondaryDebtSharesChange_not_contains?: InputMaybe<Array<Scalars['BigInt']>>;
  netSecondaryDebtSharesChange_not_contains_nocase?: InputMaybe<Array<Scalars['BigInt']>>;
  netUnderlyingCash?: InputMaybe<Scalars['BigInt']>;
  netUnderlyingCash_gt?: InputMaybe<Scalars['BigInt']>;
  netUnderlyingCash_gte?: InputMaybe<Scalars['BigInt']>;
  netUnderlyingCash_in?: InputMaybe<Array<Scalars['BigInt']>>;
  netUnderlyingCash_lt?: InputMaybe<Scalars['BigInt']>;
  netUnderlyingCash_lte?: InputMaybe<Scalars['BigInt']>;
  netUnderlyingCash_not?: InputMaybe<Scalars['BigInt']>;
  netUnderlyingCash_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  netVaultSharesChange?: InputMaybe<Scalars['BigInt']>;
  netVaultSharesChange_gt?: InputMaybe<Scalars['BigInt']>;
  netVaultSharesChange_gte?: InputMaybe<Scalars['BigInt']>;
  netVaultSharesChange_in?: InputMaybe<Array<Scalars['BigInt']>>;
  netVaultSharesChange_lt?: InputMaybe<Scalars['BigInt']>;
  netVaultSharesChange_lte?: InputMaybe<Scalars['BigInt']>;
  netVaultSharesChange_not?: InputMaybe<Scalars['BigInt']>;
  netVaultSharesChange_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  primaryBorrowfCashAfter?: InputMaybe<Scalars['BigInt']>;
  primaryBorrowfCashAfter_gt?: InputMaybe<Scalars['BigInt']>;
  primaryBorrowfCashAfter_gte?: InputMaybe<Scalars['BigInt']>;
  primaryBorrowfCashAfter_in?: InputMaybe<Array<Scalars['BigInt']>>;
  primaryBorrowfCashAfter_lt?: InputMaybe<Scalars['BigInt']>;
  primaryBorrowfCashAfter_lte?: InputMaybe<Scalars['BigInt']>;
  primaryBorrowfCashAfter_not?: InputMaybe<Scalars['BigInt']>;
  primaryBorrowfCashAfter_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  primaryBorrowfCashBefore?: InputMaybe<Scalars['BigInt']>;
  primaryBorrowfCashBefore_gt?: InputMaybe<Scalars['BigInt']>;
  primaryBorrowfCashBefore_gte?: InputMaybe<Scalars['BigInt']>;
  primaryBorrowfCashBefore_in?: InputMaybe<Array<Scalars['BigInt']>>;
  primaryBorrowfCashBefore_lt?: InputMaybe<Scalars['BigInt']>;
  primaryBorrowfCashBefore_lte?: InputMaybe<Scalars['BigInt']>;
  primaryBorrowfCashBefore_not?: InputMaybe<Scalars['BigInt']>;
  primaryBorrowfCashBefore_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  secondaryDebtSharesAfter?: InputMaybe<Array<Scalars['BigInt']>>;
  secondaryDebtSharesAfter_contains?: InputMaybe<Array<Scalars['BigInt']>>;
  secondaryDebtSharesAfter_contains_nocase?: InputMaybe<Array<Scalars['BigInt']>>;
  secondaryDebtSharesAfter_not?: InputMaybe<Array<Scalars['BigInt']>>;
  secondaryDebtSharesAfter_not_contains?: InputMaybe<Array<Scalars['BigInt']>>;
  secondaryDebtSharesAfter_not_contains_nocase?: InputMaybe<Array<Scalars['BigInt']>>;
  secondaryDebtSharesBefore?: InputMaybe<Array<Scalars['BigInt']>>;
  secondaryDebtSharesBefore_contains?: InputMaybe<Array<Scalars['BigInt']>>;
  secondaryDebtSharesBefore_contains_nocase?: InputMaybe<Array<Scalars['BigInt']>>;
  secondaryDebtSharesBefore_not?: InputMaybe<Array<Scalars['BigInt']>>;
  secondaryDebtSharesBefore_not_contains?: InputMaybe<Array<Scalars['BigInt']>>;
  secondaryDebtSharesBefore_not_contains_nocase?: InputMaybe<Array<Scalars['BigInt']>>;
  timestamp?: InputMaybe<Scalars['Int']>;
  timestamp_gt?: InputMaybe<Scalars['Int']>;
  timestamp_gte?: InputMaybe<Scalars['Int']>;
  timestamp_in?: InputMaybe<Array<Scalars['Int']>>;
  timestamp_lt?: InputMaybe<Scalars['Int']>;
  timestamp_lte?: InputMaybe<Scalars['Int']>;
  timestamp_not?: InputMaybe<Scalars['Int']>;
  timestamp_not_in?: InputMaybe<Array<Scalars['Int']>>;
  transactionHash?: InputMaybe<Scalars['Bytes']>;
  transactionHash_contains?: InputMaybe<Scalars['Bytes']>;
  transactionHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
  transactionHash_not?: InputMaybe<Scalars['Bytes']>;
  transactionHash_not_contains?: InputMaybe<Scalars['Bytes']>;
  transactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  transactionOrigin?: InputMaybe<Scalars['Bytes']>;
  transactionOrigin_contains?: InputMaybe<Scalars['Bytes']>;
  transactionOrigin_in?: InputMaybe<Array<Scalars['Bytes']>>;
  transactionOrigin_not?: InputMaybe<Scalars['Bytes']>;
  transactionOrigin_not_contains?: InputMaybe<Scalars['Bytes']>;
  transactionOrigin_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  vaultSharesAfter?: InputMaybe<Scalars['BigInt']>;
  vaultSharesAfter_gt?: InputMaybe<Scalars['BigInt']>;
  vaultSharesAfter_gte?: InputMaybe<Scalars['BigInt']>;
  vaultSharesAfter_in?: InputMaybe<Array<Scalars['BigInt']>>;
  vaultSharesAfter_lt?: InputMaybe<Scalars['BigInt']>;
  vaultSharesAfter_lte?: InputMaybe<Scalars['BigInt']>;
  vaultSharesAfter_not?: InputMaybe<Scalars['BigInt']>;
  vaultSharesAfter_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  vaultSharesBefore?: InputMaybe<Scalars['BigInt']>;
  vaultSharesBefore_gt?: InputMaybe<Scalars['BigInt']>;
  vaultSharesBefore_gte?: InputMaybe<Scalars['BigInt']>;
  vaultSharesBefore_in?: InputMaybe<Array<Scalars['BigInt']>>;
  vaultSharesBefore_lt?: InputMaybe<Scalars['BigInt']>;
  vaultSharesBefore_lte?: InputMaybe<Scalars['BigInt']>;
  vaultSharesBefore_not?: InputMaybe<Scalars['BigInt']>;
  vaultSharesBefore_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  vaultTradeType?: InputMaybe<VaultTradeType>;
  vaultTradeType_in?: InputMaybe<Array<VaultTradeType>>;
  vaultTradeType_not?: InputMaybe<VaultTradeType>;
  vaultTradeType_not_in?: InputMaybe<Array<VaultTradeType>>;
};

export enum LeveragedVaultTrade_OrderBy {
  Account = 'account',
  BlockHash = 'blockHash',
  BlockNumber = 'blockNumber',
  Id = 'id',
  LeveragedVault = 'leveragedVault',
  LeveragedVaultAccount = 'leveragedVaultAccount',
  LeveragedVaultMaturityAfter = 'leveragedVaultMaturityAfter',
  LeveragedVaultMaturityBefore = 'leveragedVaultMaturityBefore',
  NetBorrowedUnderlying = 'netBorrowedUnderlying',
  NetDepositUnderlying = 'netDepositUnderlying',
  NetPrimaryBorrowfCashChange = 'netPrimaryBorrowfCashChange',
  NetSecondaryDebtSharesChange = 'netSecondaryDebtSharesChange',
  NetUnderlyingCash = 'netUnderlyingCash',
  NetVaultSharesChange = 'netVaultSharesChange',
  PrimaryBorrowfCashAfter = 'primaryBorrowfCashAfter',
  PrimaryBorrowfCashBefore = 'primaryBorrowfCashBefore',
  SecondaryDebtSharesAfter = 'secondaryDebtSharesAfter',
  SecondaryDebtSharesBefore = 'secondaryDebtSharesBefore',
  Timestamp = 'timestamp',
  TransactionHash = 'transactionHash',
  TransactionOrigin = 'transactionOrigin',
  VaultSharesAfter = 'vaultSharesAfter',
  VaultSharesBefore = 'vaultSharesBefore',
  VaultTradeType = 'vaultTradeType'
}

export type LeveragedVault_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  allowRollPosition?: InputMaybe<Scalars['Boolean']>;
  allowRollPosition_in?: InputMaybe<Array<Scalars['Boolean']>>;
  allowRollPosition_not?: InputMaybe<Scalars['Boolean']>;
  allowRollPosition_not_in?: InputMaybe<Array<Scalars['Boolean']>>;
  allowsReentrancy?: InputMaybe<Scalars['Boolean']>;
  allowsReentrancy_in?: InputMaybe<Array<Scalars['Boolean']>>;
  allowsReentrancy_not?: InputMaybe<Scalars['Boolean']>;
  allowsReentrancy_not_in?: InputMaybe<Array<Scalars['Boolean']>>;
  deleverageDisabled?: InputMaybe<Scalars['Boolean']>;
  deleverageDisabled_in?: InputMaybe<Array<Scalars['Boolean']>>;
  deleverageDisabled_not?: InputMaybe<Scalars['Boolean']>;
  deleverageDisabled_not_in?: InputMaybe<Array<Scalars['Boolean']>>;
  enabled?: InputMaybe<Scalars['Boolean']>;
  enabled_in?: InputMaybe<Array<Scalars['Boolean']>>;
  enabled_not?: InputMaybe<Scalars['Boolean']>;
  enabled_not_in?: InputMaybe<Array<Scalars['Boolean']>>;
  feeRateBasisPoints?: InputMaybe<Scalars['Int']>;
  feeRateBasisPoints_gt?: InputMaybe<Scalars['Int']>;
  feeRateBasisPoints_gte?: InputMaybe<Scalars['Int']>;
  feeRateBasisPoints_in?: InputMaybe<Array<Scalars['Int']>>;
  feeRateBasisPoints_lt?: InputMaybe<Scalars['Int']>;
  feeRateBasisPoints_lte?: InputMaybe<Scalars['Int']>;
  feeRateBasisPoints_not?: InputMaybe<Scalars['Int']>;
  feeRateBasisPoints_not_in?: InputMaybe<Array<Scalars['Int']>>;
  id?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  lastUpdateBlockHash?: InputMaybe<Scalars['Bytes']>;
  lastUpdateBlockHash_contains?: InputMaybe<Scalars['Bytes']>;
  lastUpdateBlockHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
  lastUpdateBlockHash_not?: InputMaybe<Scalars['Bytes']>;
  lastUpdateBlockHash_not_contains?: InputMaybe<Scalars['Bytes']>;
  lastUpdateBlockHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  lastUpdateBlockNumber?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_gt?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_gte?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_in?: InputMaybe<Array<Scalars['Int']>>;
  lastUpdateBlockNumber_lt?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_lte?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_not?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_not_in?: InputMaybe<Array<Scalars['Int']>>;
  lastUpdateTimestamp?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_gt?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_gte?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_in?: InputMaybe<Array<Scalars['Int']>>;
  lastUpdateTimestamp_lt?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_lte?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_not?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_not_in?: InputMaybe<Array<Scalars['Int']>>;
  lastUpdateTransactionHash?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_contains?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
  lastUpdateTransactionHash_not?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_not_contains?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  liquidationRatePercent?: InputMaybe<Scalars['Int']>;
  liquidationRatePercent_gt?: InputMaybe<Scalars['Int']>;
  liquidationRatePercent_gte?: InputMaybe<Scalars['Int']>;
  liquidationRatePercent_in?: InputMaybe<Array<Scalars['Int']>>;
  liquidationRatePercent_lt?: InputMaybe<Scalars['Int']>;
  liquidationRatePercent_lte?: InputMaybe<Scalars['Int']>;
  liquidationRatePercent_not?: InputMaybe<Scalars['Int']>;
  liquidationRatePercent_not_in?: InputMaybe<Array<Scalars['Int']>>;
  maturities_?: InputMaybe<LeveragedVaultMaturity_Filter>;
  maxBorrowMarketIndex?: InputMaybe<Scalars['Int']>;
  maxBorrowMarketIndex_gt?: InputMaybe<Scalars['Int']>;
  maxBorrowMarketIndex_gte?: InputMaybe<Scalars['Int']>;
  maxBorrowMarketIndex_in?: InputMaybe<Array<Scalars['Int']>>;
  maxBorrowMarketIndex_lt?: InputMaybe<Scalars['Int']>;
  maxBorrowMarketIndex_lte?: InputMaybe<Scalars['Int']>;
  maxBorrowMarketIndex_not?: InputMaybe<Scalars['Int']>;
  maxBorrowMarketIndex_not_in?: InputMaybe<Array<Scalars['Int']>>;
  maxDeleverageCollateralRatioBasisPoints?: InputMaybe<Scalars['Int']>;
  maxDeleverageCollateralRatioBasisPoints_gt?: InputMaybe<Scalars['Int']>;
  maxDeleverageCollateralRatioBasisPoints_gte?: InputMaybe<Scalars['Int']>;
  maxDeleverageCollateralRatioBasisPoints_in?: InputMaybe<Array<Scalars['Int']>>;
  maxDeleverageCollateralRatioBasisPoints_lt?: InputMaybe<Scalars['Int']>;
  maxDeleverageCollateralRatioBasisPoints_lte?: InputMaybe<Scalars['Int']>;
  maxDeleverageCollateralRatioBasisPoints_not?: InputMaybe<Scalars['Int']>;
  maxDeleverageCollateralRatioBasisPoints_not_in?: InputMaybe<Array<Scalars['Int']>>;
  maxRequiredAccountCollateralRatioBasisPoints?: InputMaybe<Scalars['Int']>;
  maxRequiredAccountCollateralRatioBasisPoints_gt?: InputMaybe<Scalars['Int']>;
  maxRequiredAccountCollateralRatioBasisPoints_gte?: InputMaybe<Scalars['Int']>;
  maxRequiredAccountCollateralRatioBasisPoints_in?: InputMaybe<Array<Scalars['Int']>>;
  maxRequiredAccountCollateralRatioBasisPoints_lt?: InputMaybe<Scalars['Int']>;
  maxRequiredAccountCollateralRatioBasisPoints_lte?: InputMaybe<Scalars['Int']>;
  maxRequiredAccountCollateralRatioBasisPoints_not?: InputMaybe<Scalars['Int']>;
  maxRequiredAccountCollateralRatioBasisPoints_not_in?: InputMaybe<Array<Scalars['Int']>>;
  minAccountBorrowSize?: InputMaybe<Scalars['BigInt']>;
  minAccountBorrowSize_gt?: InputMaybe<Scalars['BigInt']>;
  minAccountBorrowSize_gte?: InputMaybe<Scalars['BigInt']>;
  minAccountBorrowSize_in?: InputMaybe<Array<Scalars['BigInt']>>;
  minAccountBorrowSize_lt?: InputMaybe<Scalars['BigInt']>;
  minAccountBorrowSize_lte?: InputMaybe<Scalars['BigInt']>;
  minAccountBorrowSize_not?: InputMaybe<Scalars['BigInt']>;
  minAccountBorrowSize_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  minCollateralRatioBasisPoints?: InputMaybe<Scalars['Int']>;
  minCollateralRatioBasisPoints_gt?: InputMaybe<Scalars['Int']>;
  minCollateralRatioBasisPoints_gte?: InputMaybe<Scalars['Int']>;
  minCollateralRatioBasisPoints_in?: InputMaybe<Array<Scalars['Int']>>;
  minCollateralRatioBasisPoints_lt?: InputMaybe<Scalars['Int']>;
  minCollateralRatioBasisPoints_lte?: InputMaybe<Scalars['Int']>;
  minCollateralRatioBasisPoints_not?: InputMaybe<Scalars['Int']>;
  minCollateralRatioBasisPoints_not_in?: InputMaybe<Array<Scalars['Int']>>;
  name?: InputMaybe<Scalars['String']>;
  name_contains?: InputMaybe<Scalars['String']>;
  name_contains_nocase?: InputMaybe<Scalars['String']>;
  name_ends_with?: InputMaybe<Scalars['String']>;
  name_ends_with_nocase?: InputMaybe<Scalars['String']>;
  name_gt?: InputMaybe<Scalars['String']>;
  name_gte?: InputMaybe<Scalars['String']>;
  name_in?: InputMaybe<Array<Scalars['String']>>;
  name_lt?: InputMaybe<Scalars['String']>;
  name_lte?: InputMaybe<Scalars['String']>;
  name_not?: InputMaybe<Scalars['String']>;
  name_not_contains?: InputMaybe<Scalars['String']>;
  name_not_contains_nocase?: InputMaybe<Scalars['String']>;
  name_not_ends_with?: InputMaybe<Scalars['String']>;
  name_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  name_not_in?: InputMaybe<Array<Scalars['String']>>;
  name_not_starts_with?: InputMaybe<Scalars['String']>;
  name_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  name_starts_with?: InputMaybe<Scalars['String']>;
  name_starts_with_nocase?: InputMaybe<Scalars['String']>;
  onlyVaultDeleverage?: InputMaybe<Scalars['Boolean']>;
  onlyVaultDeleverage_in?: InputMaybe<Array<Scalars['Boolean']>>;
  onlyVaultDeleverage_not?: InputMaybe<Scalars['Boolean']>;
  onlyVaultDeleverage_not_in?: InputMaybe<Array<Scalars['Boolean']>>;
  onlyVaultEntry?: InputMaybe<Scalars['Boolean']>;
  onlyVaultEntry_in?: InputMaybe<Array<Scalars['Boolean']>>;
  onlyVaultEntry_not?: InputMaybe<Scalars['Boolean']>;
  onlyVaultEntry_not_in?: InputMaybe<Array<Scalars['Boolean']>>;
  onlyVaultExit?: InputMaybe<Scalars['Boolean']>;
  onlyVaultExit_in?: InputMaybe<Array<Scalars['Boolean']>>;
  onlyVaultExit_not?: InputMaybe<Scalars['Boolean']>;
  onlyVaultExit_not_in?: InputMaybe<Array<Scalars['Boolean']>>;
  onlyVaultRoll?: InputMaybe<Scalars['Boolean']>;
  onlyVaultRoll_in?: InputMaybe<Array<Scalars['Boolean']>>;
  onlyVaultRoll_not?: InputMaybe<Scalars['Boolean']>;
  onlyVaultRoll_not_in?: InputMaybe<Array<Scalars['Boolean']>>;
  onlyVaultSettle?: InputMaybe<Scalars['Boolean']>;
  onlyVaultSettle_in?: InputMaybe<Array<Scalars['Boolean']>>;
  onlyVaultSettle_not?: InputMaybe<Scalars['Boolean']>;
  onlyVaultSettle_not_in?: InputMaybe<Array<Scalars['Boolean']>>;
  primaryBorrowCurrency?: InputMaybe<Scalars['String']>;
  primaryBorrowCurrency_?: InputMaybe<Currency_Filter>;
  primaryBorrowCurrency_contains?: InputMaybe<Scalars['String']>;
  primaryBorrowCurrency_contains_nocase?: InputMaybe<Scalars['String']>;
  primaryBorrowCurrency_ends_with?: InputMaybe<Scalars['String']>;
  primaryBorrowCurrency_ends_with_nocase?: InputMaybe<Scalars['String']>;
  primaryBorrowCurrency_gt?: InputMaybe<Scalars['String']>;
  primaryBorrowCurrency_gte?: InputMaybe<Scalars['String']>;
  primaryBorrowCurrency_in?: InputMaybe<Array<Scalars['String']>>;
  primaryBorrowCurrency_lt?: InputMaybe<Scalars['String']>;
  primaryBorrowCurrency_lte?: InputMaybe<Scalars['String']>;
  primaryBorrowCurrency_not?: InputMaybe<Scalars['String']>;
  primaryBorrowCurrency_not_contains?: InputMaybe<Scalars['String']>;
  primaryBorrowCurrency_not_contains_nocase?: InputMaybe<Scalars['String']>;
  primaryBorrowCurrency_not_ends_with?: InputMaybe<Scalars['String']>;
  primaryBorrowCurrency_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  primaryBorrowCurrency_not_in?: InputMaybe<Array<Scalars['String']>>;
  primaryBorrowCurrency_not_starts_with?: InputMaybe<Scalars['String']>;
  primaryBorrowCurrency_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  primaryBorrowCurrency_starts_with?: InputMaybe<Scalars['String']>;
  primaryBorrowCurrency_starts_with_nocase?: InputMaybe<Scalars['String']>;
  reserveFeeSharePercent?: InputMaybe<Scalars['Int']>;
  reserveFeeSharePercent_gt?: InputMaybe<Scalars['Int']>;
  reserveFeeSharePercent_gte?: InputMaybe<Scalars['Int']>;
  reserveFeeSharePercent_in?: InputMaybe<Array<Scalars['Int']>>;
  reserveFeeSharePercent_lt?: InputMaybe<Scalars['Int']>;
  reserveFeeSharePercent_lte?: InputMaybe<Scalars['Int']>;
  reserveFeeSharePercent_not?: InputMaybe<Scalars['Int']>;
  reserveFeeSharePercent_not_in?: InputMaybe<Array<Scalars['Int']>>;
  secondaryBorrowCurrencies?: InputMaybe<Array<Scalars['String']>>;
  secondaryBorrowCurrencies_?: InputMaybe<Currency_Filter>;
  secondaryBorrowCurrencies_contains?: InputMaybe<Array<Scalars['String']>>;
  secondaryBorrowCurrencies_contains_nocase?: InputMaybe<Array<Scalars['String']>>;
  secondaryBorrowCurrencies_not?: InputMaybe<Array<Scalars['String']>>;
  secondaryBorrowCurrencies_not_contains?: InputMaybe<Array<Scalars['String']>>;
  secondaryBorrowCurrencies_not_contains_nocase?: InputMaybe<Array<Scalars['String']>>;
  strategy?: InputMaybe<Scalars['Bytes']>;
  strategy_contains?: InputMaybe<Scalars['Bytes']>;
  strategy_in?: InputMaybe<Array<Scalars['Bytes']>>;
  strategy_not?: InputMaybe<Scalars['Bytes']>;
  strategy_not_contains?: InputMaybe<Scalars['Bytes']>;
  strategy_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  vaultAddress?: InputMaybe<Scalars['Bytes']>;
  vaultAddress_contains?: InputMaybe<Scalars['Bytes']>;
  vaultAddress_in?: InputMaybe<Array<Scalars['Bytes']>>;
  vaultAddress_not?: InputMaybe<Scalars['Bytes']>;
  vaultAddress_not_contains?: InputMaybe<Scalars['Bytes']>;
  vaultAddress_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  vaultCapacity_?: InputMaybe<LeveragedVaultCapacity_Filter>;
};

export enum LeveragedVault_OrderBy {
  AllowRollPosition = 'allowRollPosition',
  AllowsReentrancy = 'allowsReentrancy',
  DeleverageDisabled = 'deleverageDisabled',
  Enabled = 'enabled',
  FeeRateBasisPoints = 'feeRateBasisPoints',
  Id = 'id',
  LastUpdateBlockHash = 'lastUpdateBlockHash',
  LastUpdateBlockNumber = 'lastUpdateBlockNumber',
  LastUpdateTimestamp = 'lastUpdateTimestamp',
  LastUpdateTransactionHash = 'lastUpdateTransactionHash',
  LiquidationRatePercent = 'liquidationRatePercent',
  Maturities = 'maturities',
  MaxBorrowMarketIndex = 'maxBorrowMarketIndex',
  MaxDeleverageCollateralRatioBasisPoints = 'maxDeleverageCollateralRatioBasisPoints',
  MaxRequiredAccountCollateralRatioBasisPoints = 'maxRequiredAccountCollateralRatioBasisPoints',
  MinAccountBorrowSize = 'minAccountBorrowSize',
  MinCollateralRatioBasisPoints = 'minCollateralRatioBasisPoints',
  Name = 'name',
  OnlyVaultDeleverage = 'onlyVaultDeleverage',
  OnlyVaultEntry = 'onlyVaultEntry',
  OnlyVaultExit = 'onlyVaultExit',
  OnlyVaultRoll = 'onlyVaultRoll',
  OnlyVaultSettle = 'onlyVaultSettle',
  PrimaryBorrowCurrency = 'primaryBorrowCurrency',
  ReserveFeeSharePercent = 'reserveFeeSharePercent',
  SecondaryBorrowCurrencies = 'secondaryBorrowCurrencies',
  Strategy = 'strategy',
  VaultAddress = 'vaultAddress',
  VaultCapacity = 'vaultCapacity'
}

export type Liquidation = {
  __typename?: 'Liquidation';
  account: Account;
  blockHash: Scalars['Bytes'];
  blockNumber: Scalars['Int'];
  collateralOrFcashCurrency?: Maybe<Currency>;
  fCashMaturities?: Maybe<Array<Scalars['BigInt']>>;
  fCashNotionalTransfer?: Maybe<Array<Scalars['BigInt']>>;
  id: Scalars['ID'];
  liquidator: Account;
  localCurrency: Currency;
  netCollateralTransfer?: Maybe<Scalars['BigInt']>;
  netLocalFromLiquidator: Scalars['BigInt'];
  netNTokenTransfer?: Maybe<Scalars['BigInt']>;
  timestamp: Scalars['Int'];
  transactionHash: Scalars['Bytes'];
  transactionOrigin: Scalars['Bytes'];
  type: LiquidationType;
};

export enum LiquidationType {
  CollateralCurrency = 'CollateralCurrency',
  CrossCurrencyFcash = 'CrossCurrencyFcash',
  LocalCurrency = 'LocalCurrency',
  LocalFcash = 'LocalFcash'
}

export type Liquidation_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  account?: InputMaybe<Scalars['String']>;
  account_?: InputMaybe<Account_Filter>;
  account_contains?: InputMaybe<Scalars['String']>;
  account_contains_nocase?: InputMaybe<Scalars['String']>;
  account_ends_with?: InputMaybe<Scalars['String']>;
  account_ends_with_nocase?: InputMaybe<Scalars['String']>;
  account_gt?: InputMaybe<Scalars['String']>;
  account_gte?: InputMaybe<Scalars['String']>;
  account_in?: InputMaybe<Array<Scalars['String']>>;
  account_lt?: InputMaybe<Scalars['String']>;
  account_lte?: InputMaybe<Scalars['String']>;
  account_not?: InputMaybe<Scalars['String']>;
  account_not_contains?: InputMaybe<Scalars['String']>;
  account_not_contains_nocase?: InputMaybe<Scalars['String']>;
  account_not_ends_with?: InputMaybe<Scalars['String']>;
  account_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  account_not_in?: InputMaybe<Array<Scalars['String']>>;
  account_not_starts_with?: InputMaybe<Scalars['String']>;
  account_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  account_starts_with?: InputMaybe<Scalars['String']>;
  account_starts_with_nocase?: InputMaybe<Scalars['String']>;
  blockHash?: InputMaybe<Scalars['Bytes']>;
  blockHash_contains?: InputMaybe<Scalars['Bytes']>;
  blockHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
  blockHash_not?: InputMaybe<Scalars['Bytes']>;
  blockHash_not_contains?: InputMaybe<Scalars['Bytes']>;
  blockHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  blockNumber?: InputMaybe<Scalars['Int']>;
  blockNumber_gt?: InputMaybe<Scalars['Int']>;
  blockNumber_gte?: InputMaybe<Scalars['Int']>;
  blockNumber_in?: InputMaybe<Array<Scalars['Int']>>;
  blockNumber_lt?: InputMaybe<Scalars['Int']>;
  blockNumber_lte?: InputMaybe<Scalars['Int']>;
  blockNumber_not?: InputMaybe<Scalars['Int']>;
  blockNumber_not_in?: InputMaybe<Array<Scalars['Int']>>;
  collateralOrFcashCurrency?: InputMaybe<Scalars['String']>;
  collateralOrFcashCurrency_?: InputMaybe<Currency_Filter>;
  collateralOrFcashCurrency_contains?: InputMaybe<Scalars['String']>;
  collateralOrFcashCurrency_contains_nocase?: InputMaybe<Scalars['String']>;
  collateralOrFcashCurrency_ends_with?: InputMaybe<Scalars['String']>;
  collateralOrFcashCurrency_ends_with_nocase?: InputMaybe<Scalars['String']>;
  collateralOrFcashCurrency_gt?: InputMaybe<Scalars['String']>;
  collateralOrFcashCurrency_gte?: InputMaybe<Scalars['String']>;
  collateralOrFcashCurrency_in?: InputMaybe<Array<Scalars['String']>>;
  collateralOrFcashCurrency_lt?: InputMaybe<Scalars['String']>;
  collateralOrFcashCurrency_lte?: InputMaybe<Scalars['String']>;
  collateralOrFcashCurrency_not?: InputMaybe<Scalars['String']>;
  collateralOrFcashCurrency_not_contains?: InputMaybe<Scalars['String']>;
  collateralOrFcashCurrency_not_contains_nocase?: InputMaybe<Scalars['String']>;
  collateralOrFcashCurrency_not_ends_with?: InputMaybe<Scalars['String']>;
  collateralOrFcashCurrency_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  collateralOrFcashCurrency_not_in?: InputMaybe<Array<Scalars['String']>>;
  collateralOrFcashCurrency_not_starts_with?: InputMaybe<Scalars['String']>;
  collateralOrFcashCurrency_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  collateralOrFcashCurrency_starts_with?: InputMaybe<Scalars['String']>;
  collateralOrFcashCurrency_starts_with_nocase?: InputMaybe<Scalars['String']>;
  fCashMaturities?: InputMaybe<Array<Scalars['BigInt']>>;
  fCashMaturities_contains?: InputMaybe<Array<Scalars['BigInt']>>;
  fCashMaturities_contains_nocase?: InputMaybe<Array<Scalars['BigInt']>>;
  fCashMaturities_not?: InputMaybe<Array<Scalars['BigInt']>>;
  fCashMaturities_not_contains?: InputMaybe<Array<Scalars['BigInt']>>;
  fCashMaturities_not_contains_nocase?: InputMaybe<Array<Scalars['BigInt']>>;
  fCashNotionalTransfer?: InputMaybe<Array<Scalars['BigInt']>>;
  fCashNotionalTransfer_contains?: InputMaybe<Array<Scalars['BigInt']>>;
  fCashNotionalTransfer_contains_nocase?: InputMaybe<Array<Scalars['BigInt']>>;
  fCashNotionalTransfer_not?: InputMaybe<Array<Scalars['BigInt']>>;
  fCashNotionalTransfer_not_contains?: InputMaybe<Array<Scalars['BigInt']>>;
  fCashNotionalTransfer_not_contains_nocase?: InputMaybe<Array<Scalars['BigInt']>>;
  id?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  liquidator?: InputMaybe<Scalars['String']>;
  liquidator_?: InputMaybe<Account_Filter>;
  liquidator_contains?: InputMaybe<Scalars['String']>;
  liquidator_contains_nocase?: InputMaybe<Scalars['String']>;
  liquidator_ends_with?: InputMaybe<Scalars['String']>;
  liquidator_ends_with_nocase?: InputMaybe<Scalars['String']>;
  liquidator_gt?: InputMaybe<Scalars['String']>;
  liquidator_gte?: InputMaybe<Scalars['String']>;
  liquidator_in?: InputMaybe<Array<Scalars['String']>>;
  liquidator_lt?: InputMaybe<Scalars['String']>;
  liquidator_lte?: InputMaybe<Scalars['String']>;
  liquidator_not?: InputMaybe<Scalars['String']>;
  liquidator_not_contains?: InputMaybe<Scalars['String']>;
  liquidator_not_contains_nocase?: InputMaybe<Scalars['String']>;
  liquidator_not_ends_with?: InputMaybe<Scalars['String']>;
  liquidator_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  liquidator_not_in?: InputMaybe<Array<Scalars['String']>>;
  liquidator_not_starts_with?: InputMaybe<Scalars['String']>;
  liquidator_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  liquidator_starts_with?: InputMaybe<Scalars['String']>;
  liquidator_starts_with_nocase?: InputMaybe<Scalars['String']>;
  localCurrency?: InputMaybe<Scalars['String']>;
  localCurrency_?: InputMaybe<Currency_Filter>;
  localCurrency_contains?: InputMaybe<Scalars['String']>;
  localCurrency_contains_nocase?: InputMaybe<Scalars['String']>;
  localCurrency_ends_with?: InputMaybe<Scalars['String']>;
  localCurrency_ends_with_nocase?: InputMaybe<Scalars['String']>;
  localCurrency_gt?: InputMaybe<Scalars['String']>;
  localCurrency_gte?: InputMaybe<Scalars['String']>;
  localCurrency_in?: InputMaybe<Array<Scalars['String']>>;
  localCurrency_lt?: InputMaybe<Scalars['String']>;
  localCurrency_lte?: InputMaybe<Scalars['String']>;
  localCurrency_not?: InputMaybe<Scalars['String']>;
  localCurrency_not_contains?: InputMaybe<Scalars['String']>;
  localCurrency_not_contains_nocase?: InputMaybe<Scalars['String']>;
  localCurrency_not_ends_with?: InputMaybe<Scalars['String']>;
  localCurrency_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  localCurrency_not_in?: InputMaybe<Array<Scalars['String']>>;
  localCurrency_not_starts_with?: InputMaybe<Scalars['String']>;
  localCurrency_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  localCurrency_starts_with?: InputMaybe<Scalars['String']>;
  localCurrency_starts_with_nocase?: InputMaybe<Scalars['String']>;
  netCollateralTransfer?: InputMaybe<Scalars['BigInt']>;
  netCollateralTransfer_gt?: InputMaybe<Scalars['BigInt']>;
  netCollateralTransfer_gte?: InputMaybe<Scalars['BigInt']>;
  netCollateralTransfer_in?: InputMaybe<Array<Scalars['BigInt']>>;
  netCollateralTransfer_lt?: InputMaybe<Scalars['BigInt']>;
  netCollateralTransfer_lte?: InputMaybe<Scalars['BigInt']>;
  netCollateralTransfer_not?: InputMaybe<Scalars['BigInt']>;
  netCollateralTransfer_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  netLocalFromLiquidator?: InputMaybe<Scalars['BigInt']>;
  netLocalFromLiquidator_gt?: InputMaybe<Scalars['BigInt']>;
  netLocalFromLiquidator_gte?: InputMaybe<Scalars['BigInt']>;
  netLocalFromLiquidator_in?: InputMaybe<Array<Scalars['BigInt']>>;
  netLocalFromLiquidator_lt?: InputMaybe<Scalars['BigInt']>;
  netLocalFromLiquidator_lte?: InputMaybe<Scalars['BigInt']>;
  netLocalFromLiquidator_not?: InputMaybe<Scalars['BigInt']>;
  netLocalFromLiquidator_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  netNTokenTransfer?: InputMaybe<Scalars['BigInt']>;
  netNTokenTransfer_gt?: InputMaybe<Scalars['BigInt']>;
  netNTokenTransfer_gte?: InputMaybe<Scalars['BigInt']>;
  netNTokenTransfer_in?: InputMaybe<Array<Scalars['BigInt']>>;
  netNTokenTransfer_lt?: InputMaybe<Scalars['BigInt']>;
  netNTokenTransfer_lte?: InputMaybe<Scalars['BigInt']>;
  netNTokenTransfer_not?: InputMaybe<Scalars['BigInt']>;
  netNTokenTransfer_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  timestamp?: InputMaybe<Scalars['Int']>;
  timestamp_gt?: InputMaybe<Scalars['Int']>;
  timestamp_gte?: InputMaybe<Scalars['Int']>;
  timestamp_in?: InputMaybe<Array<Scalars['Int']>>;
  timestamp_lt?: InputMaybe<Scalars['Int']>;
  timestamp_lte?: InputMaybe<Scalars['Int']>;
  timestamp_not?: InputMaybe<Scalars['Int']>;
  timestamp_not_in?: InputMaybe<Array<Scalars['Int']>>;
  transactionHash?: InputMaybe<Scalars['Bytes']>;
  transactionHash_contains?: InputMaybe<Scalars['Bytes']>;
  transactionHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
  transactionHash_not?: InputMaybe<Scalars['Bytes']>;
  transactionHash_not_contains?: InputMaybe<Scalars['Bytes']>;
  transactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  transactionOrigin?: InputMaybe<Scalars['Bytes']>;
  transactionOrigin_contains?: InputMaybe<Scalars['Bytes']>;
  transactionOrigin_in?: InputMaybe<Array<Scalars['Bytes']>>;
  transactionOrigin_not?: InputMaybe<Scalars['Bytes']>;
  transactionOrigin_not_contains?: InputMaybe<Scalars['Bytes']>;
  transactionOrigin_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  type?: InputMaybe<LiquidationType>;
  type_in?: InputMaybe<Array<LiquidationType>>;
  type_not?: InputMaybe<LiquidationType>;
  type_not_in?: InputMaybe<Array<LiquidationType>>;
};

export enum Liquidation_OrderBy {
  Account = 'account',
  BlockHash = 'blockHash',
  BlockNumber = 'blockNumber',
  CollateralOrFcashCurrency = 'collateralOrFcashCurrency',
  FCashMaturities = 'fCashMaturities',
  FCashNotionalTransfer = 'fCashNotionalTransfer',
  Id = 'id',
  Liquidator = 'liquidator',
  LocalCurrency = 'localCurrency',
  NetCollateralTransfer = 'netCollateralTransfer',
  NetLocalFromLiquidator = 'netLocalFromLiquidator',
  NetNTokenTransfer = 'netNTokenTransfer',
  Timestamp = 'timestamp',
  TransactionHash = 'transactionHash',
  TransactionOrigin = 'transactionOrigin',
  Type = 'type'
}

export type Market = {
  __typename?: 'Market';
  /** Currency of this market */
  currency: Currency;
  historicalData?: Maybe<Array<MarketHistoricalData>>;
  /** Currency Id:Settlement Date:Maturity combination */
  id: Scalars['ID'];
  /** Last annualized interest rate the market traded at */
  lastImpliedRate: Scalars['Int'];
  lastUpdateBlockHash: Scalars['Bytes'];
  lastUpdateBlockNumber: Scalars['Int'];
  lastUpdateTimestamp: Scalars['Int'];
  lastUpdateTransactionHash: Scalars['Bytes'];
  /** Market index */
  marketIndex: Scalars['Int'];
  /** Length of market maturity in seconds */
  marketMaturityLengthSeconds: Scalars['Int'];
  /** Date that fCash from this market will mature */
  maturity: Scalars['Int'];
  /** Oracle rate for the market, must be averaged in using previousTradeTime */
  oracleRate: Scalars['Int'];
  /** Last time when a trade occurred on the market */
  previousTradeTime: Scalars['Int'];
  /** Date that this market will settle */
  settlementDate: Scalars['Int'];
  /** Total asset cash available in the market */
  totalAssetCash: Scalars['BigInt'];
  /** Total liquidity tokens available in the market */
  totalLiquidity: Scalars['BigInt'];
  /** Total fCash available in the market */
  totalfCash: Scalars['BigInt'];
};


export type MarketHistoricalDataArgs = {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<MarketHistoricalData_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<MarketHistoricalData_Filter>;
};

export type MarketHistoricalData = {
  __typename?: 'MarketHistoricalData';
  /** MarketID:Hourly ID for this particular market */
  id: Scalars['ID'];
  /** Last annualized interest rate the market traded at */
  lastImpliedRate: Scalars['Int'];
  market: Market;
  /** Oracle rate for the market, must be averaged in using previousTradeTime */
  oracleRate: Scalars['Int'];
  /** Last time when a trade occurred on the market */
  previousTradeTime: Scalars['Int'];
  /** Total asset cash available in the market */
  totalAssetCash: Scalars['BigInt'];
  /** Total liquidity tokens available in the market */
  totalLiquidity: Scalars['BigInt'];
  /** Total fCash available in the market */
  totalfCash: Scalars['BigInt'];
};

export type MarketHistoricalData_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  id?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  lastImpliedRate?: InputMaybe<Scalars['Int']>;
  lastImpliedRate_gt?: InputMaybe<Scalars['Int']>;
  lastImpliedRate_gte?: InputMaybe<Scalars['Int']>;
  lastImpliedRate_in?: InputMaybe<Array<Scalars['Int']>>;
  lastImpliedRate_lt?: InputMaybe<Scalars['Int']>;
  lastImpliedRate_lte?: InputMaybe<Scalars['Int']>;
  lastImpliedRate_not?: InputMaybe<Scalars['Int']>;
  lastImpliedRate_not_in?: InputMaybe<Array<Scalars['Int']>>;
  market?: InputMaybe<Scalars['String']>;
  market_?: InputMaybe<Market_Filter>;
  market_contains?: InputMaybe<Scalars['String']>;
  market_contains_nocase?: InputMaybe<Scalars['String']>;
  market_ends_with?: InputMaybe<Scalars['String']>;
  market_ends_with_nocase?: InputMaybe<Scalars['String']>;
  market_gt?: InputMaybe<Scalars['String']>;
  market_gte?: InputMaybe<Scalars['String']>;
  market_in?: InputMaybe<Array<Scalars['String']>>;
  market_lt?: InputMaybe<Scalars['String']>;
  market_lte?: InputMaybe<Scalars['String']>;
  market_not?: InputMaybe<Scalars['String']>;
  market_not_contains?: InputMaybe<Scalars['String']>;
  market_not_contains_nocase?: InputMaybe<Scalars['String']>;
  market_not_ends_with?: InputMaybe<Scalars['String']>;
  market_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  market_not_in?: InputMaybe<Array<Scalars['String']>>;
  market_not_starts_with?: InputMaybe<Scalars['String']>;
  market_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  market_starts_with?: InputMaybe<Scalars['String']>;
  market_starts_with_nocase?: InputMaybe<Scalars['String']>;
  oracleRate?: InputMaybe<Scalars['Int']>;
  oracleRate_gt?: InputMaybe<Scalars['Int']>;
  oracleRate_gte?: InputMaybe<Scalars['Int']>;
  oracleRate_in?: InputMaybe<Array<Scalars['Int']>>;
  oracleRate_lt?: InputMaybe<Scalars['Int']>;
  oracleRate_lte?: InputMaybe<Scalars['Int']>;
  oracleRate_not?: InputMaybe<Scalars['Int']>;
  oracleRate_not_in?: InputMaybe<Array<Scalars['Int']>>;
  previousTradeTime?: InputMaybe<Scalars['Int']>;
  previousTradeTime_gt?: InputMaybe<Scalars['Int']>;
  previousTradeTime_gte?: InputMaybe<Scalars['Int']>;
  previousTradeTime_in?: InputMaybe<Array<Scalars['Int']>>;
  previousTradeTime_lt?: InputMaybe<Scalars['Int']>;
  previousTradeTime_lte?: InputMaybe<Scalars['Int']>;
  previousTradeTime_not?: InputMaybe<Scalars['Int']>;
  previousTradeTime_not_in?: InputMaybe<Array<Scalars['Int']>>;
  totalAssetCash?: InputMaybe<Scalars['BigInt']>;
  totalAssetCash_gt?: InputMaybe<Scalars['BigInt']>;
  totalAssetCash_gte?: InputMaybe<Scalars['BigInt']>;
  totalAssetCash_in?: InputMaybe<Array<Scalars['BigInt']>>;
  totalAssetCash_lt?: InputMaybe<Scalars['BigInt']>;
  totalAssetCash_lte?: InputMaybe<Scalars['BigInt']>;
  totalAssetCash_not?: InputMaybe<Scalars['BigInt']>;
  totalAssetCash_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  totalLiquidity?: InputMaybe<Scalars['BigInt']>;
  totalLiquidity_gt?: InputMaybe<Scalars['BigInt']>;
  totalLiquidity_gte?: InputMaybe<Scalars['BigInt']>;
  totalLiquidity_in?: InputMaybe<Array<Scalars['BigInt']>>;
  totalLiquidity_lt?: InputMaybe<Scalars['BigInt']>;
  totalLiquidity_lte?: InputMaybe<Scalars['BigInt']>;
  totalLiquidity_not?: InputMaybe<Scalars['BigInt']>;
  totalLiquidity_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  totalfCash?: InputMaybe<Scalars['BigInt']>;
  totalfCash_gt?: InputMaybe<Scalars['BigInt']>;
  totalfCash_gte?: InputMaybe<Scalars['BigInt']>;
  totalfCash_in?: InputMaybe<Array<Scalars['BigInt']>>;
  totalfCash_lt?: InputMaybe<Scalars['BigInt']>;
  totalfCash_lte?: InputMaybe<Scalars['BigInt']>;
  totalfCash_not?: InputMaybe<Scalars['BigInt']>;
  totalfCash_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
};

export enum MarketHistoricalData_OrderBy {
  Id = 'id',
  LastImpliedRate = 'lastImpliedRate',
  Market = 'market',
  OracleRate = 'oracleRate',
  PreviousTradeTime = 'previousTradeTime',
  TotalAssetCash = 'totalAssetCash',
  TotalLiquidity = 'totalLiquidity',
  TotalfCash = 'totalfCash'
}

export type MarketInitialization = {
  __typename?: 'MarketInitialization';
  blockHash: Scalars['Bytes'];
  blockNumber: Scalars['Int'];
  /** Currency of markets */
  currency: Currency;
  /** Currency ID:time reference timestamp */
  id: Scalars['ID'];
  /** Markets that were initialized during this event */
  markets: Array<Market>;
  timestamp: Scalars['Int'];
  transactionHash: Scalars['Bytes'];
  transactionOrigin: Scalars['Bytes'];
};


export type MarketInitializationMarketsArgs = {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Market_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<Market_Filter>;
};

export type MarketInitialization_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  blockHash?: InputMaybe<Scalars['Bytes']>;
  blockHash_contains?: InputMaybe<Scalars['Bytes']>;
  blockHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
  blockHash_not?: InputMaybe<Scalars['Bytes']>;
  blockHash_not_contains?: InputMaybe<Scalars['Bytes']>;
  blockHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  blockNumber?: InputMaybe<Scalars['Int']>;
  blockNumber_gt?: InputMaybe<Scalars['Int']>;
  blockNumber_gte?: InputMaybe<Scalars['Int']>;
  blockNumber_in?: InputMaybe<Array<Scalars['Int']>>;
  blockNumber_lt?: InputMaybe<Scalars['Int']>;
  blockNumber_lte?: InputMaybe<Scalars['Int']>;
  blockNumber_not?: InputMaybe<Scalars['Int']>;
  blockNumber_not_in?: InputMaybe<Array<Scalars['Int']>>;
  currency?: InputMaybe<Scalars['String']>;
  currency_?: InputMaybe<Currency_Filter>;
  currency_contains?: InputMaybe<Scalars['String']>;
  currency_contains_nocase?: InputMaybe<Scalars['String']>;
  currency_ends_with?: InputMaybe<Scalars['String']>;
  currency_ends_with_nocase?: InputMaybe<Scalars['String']>;
  currency_gt?: InputMaybe<Scalars['String']>;
  currency_gte?: InputMaybe<Scalars['String']>;
  currency_in?: InputMaybe<Array<Scalars['String']>>;
  currency_lt?: InputMaybe<Scalars['String']>;
  currency_lte?: InputMaybe<Scalars['String']>;
  currency_not?: InputMaybe<Scalars['String']>;
  currency_not_contains?: InputMaybe<Scalars['String']>;
  currency_not_contains_nocase?: InputMaybe<Scalars['String']>;
  currency_not_ends_with?: InputMaybe<Scalars['String']>;
  currency_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  currency_not_in?: InputMaybe<Array<Scalars['String']>>;
  currency_not_starts_with?: InputMaybe<Scalars['String']>;
  currency_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  currency_starts_with?: InputMaybe<Scalars['String']>;
  currency_starts_with_nocase?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  markets?: InputMaybe<Array<Scalars['String']>>;
  markets_?: InputMaybe<Market_Filter>;
  markets_contains?: InputMaybe<Array<Scalars['String']>>;
  markets_contains_nocase?: InputMaybe<Array<Scalars['String']>>;
  markets_not?: InputMaybe<Array<Scalars['String']>>;
  markets_not_contains?: InputMaybe<Array<Scalars['String']>>;
  markets_not_contains_nocase?: InputMaybe<Array<Scalars['String']>>;
  timestamp?: InputMaybe<Scalars['Int']>;
  timestamp_gt?: InputMaybe<Scalars['Int']>;
  timestamp_gte?: InputMaybe<Scalars['Int']>;
  timestamp_in?: InputMaybe<Array<Scalars['Int']>>;
  timestamp_lt?: InputMaybe<Scalars['Int']>;
  timestamp_lte?: InputMaybe<Scalars['Int']>;
  timestamp_not?: InputMaybe<Scalars['Int']>;
  timestamp_not_in?: InputMaybe<Array<Scalars['Int']>>;
  transactionHash?: InputMaybe<Scalars['Bytes']>;
  transactionHash_contains?: InputMaybe<Scalars['Bytes']>;
  transactionHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
  transactionHash_not?: InputMaybe<Scalars['Bytes']>;
  transactionHash_not_contains?: InputMaybe<Scalars['Bytes']>;
  transactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  transactionOrigin?: InputMaybe<Scalars['Bytes']>;
  transactionOrigin_contains?: InputMaybe<Scalars['Bytes']>;
  transactionOrigin_in?: InputMaybe<Array<Scalars['Bytes']>>;
  transactionOrigin_not?: InputMaybe<Scalars['Bytes']>;
  transactionOrigin_not_contains?: InputMaybe<Scalars['Bytes']>;
  transactionOrigin_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
};

export enum MarketInitialization_OrderBy {
  BlockHash = 'blockHash',
  BlockNumber = 'blockNumber',
  Currency = 'currency',
  Id = 'id',
  Markets = 'markets',
  Timestamp = 'timestamp',
  TransactionHash = 'transactionHash',
  TransactionOrigin = 'transactionOrigin'
}

export type Market_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  currency?: InputMaybe<Scalars['String']>;
  currency_?: InputMaybe<Currency_Filter>;
  currency_contains?: InputMaybe<Scalars['String']>;
  currency_contains_nocase?: InputMaybe<Scalars['String']>;
  currency_ends_with?: InputMaybe<Scalars['String']>;
  currency_ends_with_nocase?: InputMaybe<Scalars['String']>;
  currency_gt?: InputMaybe<Scalars['String']>;
  currency_gte?: InputMaybe<Scalars['String']>;
  currency_in?: InputMaybe<Array<Scalars['String']>>;
  currency_lt?: InputMaybe<Scalars['String']>;
  currency_lte?: InputMaybe<Scalars['String']>;
  currency_not?: InputMaybe<Scalars['String']>;
  currency_not_contains?: InputMaybe<Scalars['String']>;
  currency_not_contains_nocase?: InputMaybe<Scalars['String']>;
  currency_not_ends_with?: InputMaybe<Scalars['String']>;
  currency_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  currency_not_in?: InputMaybe<Array<Scalars['String']>>;
  currency_not_starts_with?: InputMaybe<Scalars['String']>;
  currency_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  currency_starts_with?: InputMaybe<Scalars['String']>;
  currency_starts_with_nocase?: InputMaybe<Scalars['String']>;
  historicalData_?: InputMaybe<MarketHistoricalData_Filter>;
  id?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  lastImpliedRate?: InputMaybe<Scalars['Int']>;
  lastImpliedRate_gt?: InputMaybe<Scalars['Int']>;
  lastImpliedRate_gte?: InputMaybe<Scalars['Int']>;
  lastImpliedRate_in?: InputMaybe<Array<Scalars['Int']>>;
  lastImpliedRate_lt?: InputMaybe<Scalars['Int']>;
  lastImpliedRate_lte?: InputMaybe<Scalars['Int']>;
  lastImpliedRate_not?: InputMaybe<Scalars['Int']>;
  lastImpliedRate_not_in?: InputMaybe<Array<Scalars['Int']>>;
  lastUpdateBlockHash?: InputMaybe<Scalars['Bytes']>;
  lastUpdateBlockHash_contains?: InputMaybe<Scalars['Bytes']>;
  lastUpdateBlockHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
  lastUpdateBlockHash_not?: InputMaybe<Scalars['Bytes']>;
  lastUpdateBlockHash_not_contains?: InputMaybe<Scalars['Bytes']>;
  lastUpdateBlockHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  lastUpdateBlockNumber?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_gt?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_gte?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_in?: InputMaybe<Array<Scalars['Int']>>;
  lastUpdateBlockNumber_lt?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_lte?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_not?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_not_in?: InputMaybe<Array<Scalars['Int']>>;
  lastUpdateTimestamp?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_gt?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_gte?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_in?: InputMaybe<Array<Scalars['Int']>>;
  lastUpdateTimestamp_lt?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_lte?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_not?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_not_in?: InputMaybe<Array<Scalars['Int']>>;
  lastUpdateTransactionHash?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_contains?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
  lastUpdateTransactionHash_not?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_not_contains?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  marketIndex?: InputMaybe<Scalars['Int']>;
  marketIndex_gt?: InputMaybe<Scalars['Int']>;
  marketIndex_gte?: InputMaybe<Scalars['Int']>;
  marketIndex_in?: InputMaybe<Array<Scalars['Int']>>;
  marketIndex_lt?: InputMaybe<Scalars['Int']>;
  marketIndex_lte?: InputMaybe<Scalars['Int']>;
  marketIndex_not?: InputMaybe<Scalars['Int']>;
  marketIndex_not_in?: InputMaybe<Array<Scalars['Int']>>;
  marketMaturityLengthSeconds?: InputMaybe<Scalars['Int']>;
  marketMaturityLengthSeconds_gt?: InputMaybe<Scalars['Int']>;
  marketMaturityLengthSeconds_gte?: InputMaybe<Scalars['Int']>;
  marketMaturityLengthSeconds_in?: InputMaybe<Array<Scalars['Int']>>;
  marketMaturityLengthSeconds_lt?: InputMaybe<Scalars['Int']>;
  marketMaturityLengthSeconds_lte?: InputMaybe<Scalars['Int']>;
  marketMaturityLengthSeconds_not?: InputMaybe<Scalars['Int']>;
  marketMaturityLengthSeconds_not_in?: InputMaybe<Array<Scalars['Int']>>;
  maturity?: InputMaybe<Scalars['Int']>;
  maturity_gt?: InputMaybe<Scalars['Int']>;
  maturity_gte?: InputMaybe<Scalars['Int']>;
  maturity_in?: InputMaybe<Array<Scalars['Int']>>;
  maturity_lt?: InputMaybe<Scalars['Int']>;
  maturity_lte?: InputMaybe<Scalars['Int']>;
  maturity_not?: InputMaybe<Scalars['Int']>;
  maturity_not_in?: InputMaybe<Array<Scalars['Int']>>;
  oracleRate?: InputMaybe<Scalars['Int']>;
  oracleRate_gt?: InputMaybe<Scalars['Int']>;
  oracleRate_gte?: InputMaybe<Scalars['Int']>;
  oracleRate_in?: InputMaybe<Array<Scalars['Int']>>;
  oracleRate_lt?: InputMaybe<Scalars['Int']>;
  oracleRate_lte?: InputMaybe<Scalars['Int']>;
  oracleRate_not?: InputMaybe<Scalars['Int']>;
  oracleRate_not_in?: InputMaybe<Array<Scalars['Int']>>;
  previousTradeTime?: InputMaybe<Scalars['Int']>;
  previousTradeTime_gt?: InputMaybe<Scalars['Int']>;
  previousTradeTime_gte?: InputMaybe<Scalars['Int']>;
  previousTradeTime_in?: InputMaybe<Array<Scalars['Int']>>;
  previousTradeTime_lt?: InputMaybe<Scalars['Int']>;
  previousTradeTime_lte?: InputMaybe<Scalars['Int']>;
  previousTradeTime_not?: InputMaybe<Scalars['Int']>;
  previousTradeTime_not_in?: InputMaybe<Array<Scalars['Int']>>;
  settlementDate?: InputMaybe<Scalars['Int']>;
  settlementDate_gt?: InputMaybe<Scalars['Int']>;
  settlementDate_gte?: InputMaybe<Scalars['Int']>;
  settlementDate_in?: InputMaybe<Array<Scalars['Int']>>;
  settlementDate_lt?: InputMaybe<Scalars['Int']>;
  settlementDate_lte?: InputMaybe<Scalars['Int']>;
  settlementDate_not?: InputMaybe<Scalars['Int']>;
  settlementDate_not_in?: InputMaybe<Array<Scalars['Int']>>;
  totalAssetCash?: InputMaybe<Scalars['BigInt']>;
  totalAssetCash_gt?: InputMaybe<Scalars['BigInt']>;
  totalAssetCash_gte?: InputMaybe<Scalars['BigInt']>;
  totalAssetCash_in?: InputMaybe<Array<Scalars['BigInt']>>;
  totalAssetCash_lt?: InputMaybe<Scalars['BigInt']>;
  totalAssetCash_lte?: InputMaybe<Scalars['BigInt']>;
  totalAssetCash_not?: InputMaybe<Scalars['BigInt']>;
  totalAssetCash_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  totalLiquidity?: InputMaybe<Scalars['BigInt']>;
  totalLiquidity_gt?: InputMaybe<Scalars['BigInt']>;
  totalLiquidity_gte?: InputMaybe<Scalars['BigInt']>;
  totalLiquidity_in?: InputMaybe<Array<Scalars['BigInt']>>;
  totalLiquidity_lt?: InputMaybe<Scalars['BigInt']>;
  totalLiquidity_lte?: InputMaybe<Scalars['BigInt']>;
  totalLiquidity_not?: InputMaybe<Scalars['BigInt']>;
  totalLiquidity_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  totalfCash?: InputMaybe<Scalars['BigInt']>;
  totalfCash_gt?: InputMaybe<Scalars['BigInt']>;
  totalfCash_gte?: InputMaybe<Scalars['BigInt']>;
  totalfCash_in?: InputMaybe<Array<Scalars['BigInt']>>;
  totalfCash_lt?: InputMaybe<Scalars['BigInt']>;
  totalfCash_lte?: InputMaybe<Scalars['BigInt']>;
  totalfCash_not?: InputMaybe<Scalars['BigInt']>;
  totalfCash_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
};

export enum Market_OrderBy {
  Currency = 'currency',
  HistoricalData = 'historicalData',
  Id = 'id',
  LastImpliedRate = 'lastImpliedRate',
  LastUpdateBlockHash = 'lastUpdateBlockHash',
  LastUpdateBlockNumber = 'lastUpdateBlockNumber',
  LastUpdateTimestamp = 'lastUpdateTimestamp',
  LastUpdateTransactionHash = 'lastUpdateTransactionHash',
  MarketIndex = 'marketIndex',
  MarketMaturityLengthSeconds = 'marketMaturityLengthSeconds',
  Maturity = 'maturity',
  OracleRate = 'oracleRate',
  PreviousTradeTime = 'previousTradeTime',
  SettlementDate = 'settlementDate',
  TotalAssetCash = 'totalAssetCash',
  TotalLiquidity = 'totalLiquidity',
  TotalfCash = 'totalfCash'
}

export type NTokenPresentValueHistoricalData = {
  __typename?: 'NTokenPresentValueHistoricalData';
  currency: Currency;
  id: Scalars['ID'];
  pvAsset: Scalars['BigInt'];
  pvUnderlying: Scalars['BigInt'];
  timestamp: Scalars['Int'];
};

export type NTokenPresentValueHistoricalData_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  currency?: InputMaybe<Scalars['String']>;
  currency_?: InputMaybe<Currency_Filter>;
  currency_contains?: InputMaybe<Scalars['String']>;
  currency_contains_nocase?: InputMaybe<Scalars['String']>;
  currency_ends_with?: InputMaybe<Scalars['String']>;
  currency_ends_with_nocase?: InputMaybe<Scalars['String']>;
  currency_gt?: InputMaybe<Scalars['String']>;
  currency_gte?: InputMaybe<Scalars['String']>;
  currency_in?: InputMaybe<Array<Scalars['String']>>;
  currency_lt?: InputMaybe<Scalars['String']>;
  currency_lte?: InputMaybe<Scalars['String']>;
  currency_not?: InputMaybe<Scalars['String']>;
  currency_not_contains?: InputMaybe<Scalars['String']>;
  currency_not_contains_nocase?: InputMaybe<Scalars['String']>;
  currency_not_ends_with?: InputMaybe<Scalars['String']>;
  currency_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  currency_not_in?: InputMaybe<Array<Scalars['String']>>;
  currency_not_starts_with?: InputMaybe<Scalars['String']>;
  currency_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  currency_starts_with?: InputMaybe<Scalars['String']>;
  currency_starts_with_nocase?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  pvAsset?: InputMaybe<Scalars['BigInt']>;
  pvAsset_gt?: InputMaybe<Scalars['BigInt']>;
  pvAsset_gte?: InputMaybe<Scalars['BigInt']>;
  pvAsset_in?: InputMaybe<Array<Scalars['BigInt']>>;
  pvAsset_lt?: InputMaybe<Scalars['BigInt']>;
  pvAsset_lte?: InputMaybe<Scalars['BigInt']>;
  pvAsset_not?: InputMaybe<Scalars['BigInt']>;
  pvAsset_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  pvUnderlying?: InputMaybe<Scalars['BigInt']>;
  pvUnderlying_gt?: InputMaybe<Scalars['BigInt']>;
  pvUnderlying_gte?: InputMaybe<Scalars['BigInt']>;
  pvUnderlying_in?: InputMaybe<Array<Scalars['BigInt']>>;
  pvUnderlying_lt?: InputMaybe<Scalars['BigInt']>;
  pvUnderlying_lte?: InputMaybe<Scalars['BigInt']>;
  pvUnderlying_not?: InputMaybe<Scalars['BigInt']>;
  pvUnderlying_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  timestamp?: InputMaybe<Scalars['Int']>;
  timestamp_gt?: InputMaybe<Scalars['Int']>;
  timestamp_gte?: InputMaybe<Scalars['Int']>;
  timestamp_in?: InputMaybe<Array<Scalars['Int']>>;
  timestamp_lt?: InputMaybe<Scalars['Int']>;
  timestamp_lte?: InputMaybe<Scalars['Int']>;
  timestamp_not?: InputMaybe<Scalars['Int']>;
  timestamp_not_in?: InputMaybe<Array<Scalars['Int']>>;
};

export enum NTokenPresentValueHistoricalData_OrderBy {
  Currency = 'currency',
  Id = 'id',
  PvAsset = 'pvAsset',
  PvUnderlying = 'pvUnderlying',
  Timestamp = 'timestamp'
}

export type NoteBalance = {
  __typename?: 'NoteBalance';
  /** Provides a link to a NOTE holder's Notional accounts (if they exist) */
  account: Account;
  delegate?: Maybe<Delegate>;
  /** Account address */
  id: Scalars['ID'];
  lastUpdateBlockHash: Scalars['Bytes'];
  lastUpdateBlockNumber: Scalars['Int'];
  lastUpdateTimestamp: Scalars['Int'];
  lastUpdateTransactionHash: Scalars['Bytes'];
  noteBalance: Scalars['BigInt'];
  noteBalanceChanges: Array<NoteBalanceChange>;
};


export type NoteBalanceNoteBalanceChangesArgs = {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<NoteBalanceChange_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<NoteBalanceChange_Filter>;
};

export type NoteBalanceChange = {
  __typename?: 'NoteBalanceChange';
  account: Account;
  blockHash: Scalars['Bytes'];
  blockNumber: Scalars['Int'];
  /** Account address:TransactionHash:LogIndex */
  id: Scalars['ID'];
  noteBalance: NoteBalance;
  noteBalanceAfter: Scalars['BigInt'];
  noteBalanceBefore: Scalars['BigInt'];
  receiver: Scalars['Bytes'];
  sender: Scalars['Bytes'];
  timestamp: Scalars['Int'];
  transactionHash: Scalars['Bytes'];
};

export type NoteBalanceChange_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  account?: InputMaybe<Scalars['String']>;
  account_?: InputMaybe<Account_Filter>;
  account_contains?: InputMaybe<Scalars['String']>;
  account_contains_nocase?: InputMaybe<Scalars['String']>;
  account_ends_with?: InputMaybe<Scalars['String']>;
  account_ends_with_nocase?: InputMaybe<Scalars['String']>;
  account_gt?: InputMaybe<Scalars['String']>;
  account_gte?: InputMaybe<Scalars['String']>;
  account_in?: InputMaybe<Array<Scalars['String']>>;
  account_lt?: InputMaybe<Scalars['String']>;
  account_lte?: InputMaybe<Scalars['String']>;
  account_not?: InputMaybe<Scalars['String']>;
  account_not_contains?: InputMaybe<Scalars['String']>;
  account_not_contains_nocase?: InputMaybe<Scalars['String']>;
  account_not_ends_with?: InputMaybe<Scalars['String']>;
  account_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  account_not_in?: InputMaybe<Array<Scalars['String']>>;
  account_not_starts_with?: InputMaybe<Scalars['String']>;
  account_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  account_starts_with?: InputMaybe<Scalars['String']>;
  account_starts_with_nocase?: InputMaybe<Scalars['String']>;
  blockHash?: InputMaybe<Scalars['Bytes']>;
  blockHash_contains?: InputMaybe<Scalars['Bytes']>;
  blockHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
  blockHash_not?: InputMaybe<Scalars['Bytes']>;
  blockHash_not_contains?: InputMaybe<Scalars['Bytes']>;
  blockHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  blockNumber?: InputMaybe<Scalars['Int']>;
  blockNumber_gt?: InputMaybe<Scalars['Int']>;
  blockNumber_gte?: InputMaybe<Scalars['Int']>;
  blockNumber_in?: InputMaybe<Array<Scalars['Int']>>;
  blockNumber_lt?: InputMaybe<Scalars['Int']>;
  blockNumber_lte?: InputMaybe<Scalars['Int']>;
  blockNumber_not?: InputMaybe<Scalars['Int']>;
  blockNumber_not_in?: InputMaybe<Array<Scalars['Int']>>;
  id?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  noteBalance?: InputMaybe<Scalars['String']>;
  noteBalanceAfter?: InputMaybe<Scalars['BigInt']>;
  noteBalanceAfter_gt?: InputMaybe<Scalars['BigInt']>;
  noteBalanceAfter_gte?: InputMaybe<Scalars['BigInt']>;
  noteBalanceAfter_in?: InputMaybe<Array<Scalars['BigInt']>>;
  noteBalanceAfter_lt?: InputMaybe<Scalars['BigInt']>;
  noteBalanceAfter_lte?: InputMaybe<Scalars['BigInt']>;
  noteBalanceAfter_not?: InputMaybe<Scalars['BigInt']>;
  noteBalanceAfter_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  noteBalanceBefore?: InputMaybe<Scalars['BigInt']>;
  noteBalanceBefore_gt?: InputMaybe<Scalars['BigInt']>;
  noteBalanceBefore_gte?: InputMaybe<Scalars['BigInt']>;
  noteBalanceBefore_in?: InputMaybe<Array<Scalars['BigInt']>>;
  noteBalanceBefore_lt?: InputMaybe<Scalars['BigInt']>;
  noteBalanceBefore_lte?: InputMaybe<Scalars['BigInt']>;
  noteBalanceBefore_not?: InputMaybe<Scalars['BigInt']>;
  noteBalanceBefore_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  noteBalance_?: InputMaybe<NoteBalance_Filter>;
  noteBalance_contains?: InputMaybe<Scalars['String']>;
  noteBalance_contains_nocase?: InputMaybe<Scalars['String']>;
  noteBalance_ends_with?: InputMaybe<Scalars['String']>;
  noteBalance_ends_with_nocase?: InputMaybe<Scalars['String']>;
  noteBalance_gt?: InputMaybe<Scalars['String']>;
  noteBalance_gte?: InputMaybe<Scalars['String']>;
  noteBalance_in?: InputMaybe<Array<Scalars['String']>>;
  noteBalance_lt?: InputMaybe<Scalars['String']>;
  noteBalance_lte?: InputMaybe<Scalars['String']>;
  noteBalance_not?: InputMaybe<Scalars['String']>;
  noteBalance_not_contains?: InputMaybe<Scalars['String']>;
  noteBalance_not_contains_nocase?: InputMaybe<Scalars['String']>;
  noteBalance_not_ends_with?: InputMaybe<Scalars['String']>;
  noteBalance_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  noteBalance_not_in?: InputMaybe<Array<Scalars['String']>>;
  noteBalance_not_starts_with?: InputMaybe<Scalars['String']>;
  noteBalance_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  noteBalance_starts_with?: InputMaybe<Scalars['String']>;
  noteBalance_starts_with_nocase?: InputMaybe<Scalars['String']>;
  receiver?: InputMaybe<Scalars['Bytes']>;
  receiver_contains?: InputMaybe<Scalars['Bytes']>;
  receiver_in?: InputMaybe<Array<Scalars['Bytes']>>;
  receiver_not?: InputMaybe<Scalars['Bytes']>;
  receiver_not_contains?: InputMaybe<Scalars['Bytes']>;
  receiver_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  sender?: InputMaybe<Scalars['Bytes']>;
  sender_contains?: InputMaybe<Scalars['Bytes']>;
  sender_in?: InputMaybe<Array<Scalars['Bytes']>>;
  sender_not?: InputMaybe<Scalars['Bytes']>;
  sender_not_contains?: InputMaybe<Scalars['Bytes']>;
  sender_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  timestamp?: InputMaybe<Scalars['Int']>;
  timestamp_gt?: InputMaybe<Scalars['Int']>;
  timestamp_gte?: InputMaybe<Scalars['Int']>;
  timestamp_in?: InputMaybe<Array<Scalars['Int']>>;
  timestamp_lt?: InputMaybe<Scalars['Int']>;
  timestamp_lte?: InputMaybe<Scalars['Int']>;
  timestamp_not?: InputMaybe<Scalars['Int']>;
  timestamp_not_in?: InputMaybe<Array<Scalars['Int']>>;
  transactionHash?: InputMaybe<Scalars['Bytes']>;
  transactionHash_contains?: InputMaybe<Scalars['Bytes']>;
  transactionHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
  transactionHash_not?: InputMaybe<Scalars['Bytes']>;
  transactionHash_not_contains?: InputMaybe<Scalars['Bytes']>;
  transactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
};

export enum NoteBalanceChange_OrderBy {
  Account = 'account',
  BlockHash = 'blockHash',
  BlockNumber = 'blockNumber',
  Id = 'id',
  NoteBalance = 'noteBalance',
  NoteBalanceAfter = 'noteBalanceAfter',
  NoteBalanceBefore = 'noteBalanceBefore',
  Receiver = 'receiver',
  Sender = 'sender',
  Timestamp = 'timestamp',
  TransactionHash = 'transactionHash'
}

export type NoteBalance_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  account?: InputMaybe<Scalars['String']>;
  account_?: InputMaybe<Account_Filter>;
  account_contains?: InputMaybe<Scalars['String']>;
  account_contains_nocase?: InputMaybe<Scalars['String']>;
  account_ends_with?: InputMaybe<Scalars['String']>;
  account_ends_with_nocase?: InputMaybe<Scalars['String']>;
  account_gt?: InputMaybe<Scalars['String']>;
  account_gte?: InputMaybe<Scalars['String']>;
  account_in?: InputMaybe<Array<Scalars['String']>>;
  account_lt?: InputMaybe<Scalars['String']>;
  account_lte?: InputMaybe<Scalars['String']>;
  account_not?: InputMaybe<Scalars['String']>;
  account_not_contains?: InputMaybe<Scalars['String']>;
  account_not_contains_nocase?: InputMaybe<Scalars['String']>;
  account_not_ends_with?: InputMaybe<Scalars['String']>;
  account_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  account_not_in?: InputMaybe<Array<Scalars['String']>>;
  account_not_starts_with?: InputMaybe<Scalars['String']>;
  account_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  account_starts_with?: InputMaybe<Scalars['String']>;
  account_starts_with_nocase?: InputMaybe<Scalars['String']>;
  delegate?: InputMaybe<Scalars['String']>;
  delegate_?: InputMaybe<Delegate_Filter>;
  delegate_contains?: InputMaybe<Scalars['String']>;
  delegate_contains_nocase?: InputMaybe<Scalars['String']>;
  delegate_ends_with?: InputMaybe<Scalars['String']>;
  delegate_ends_with_nocase?: InputMaybe<Scalars['String']>;
  delegate_gt?: InputMaybe<Scalars['String']>;
  delegate_gte?: InputMaybe<Scalars['String']>;
  delegate_in?: InputMaybe<Array<Scalars['String']>>;
  delegate_lt?: InputMaybe<Scalars['String']>;
  delegate_lte?: InputMaybe<Scalars['String']>;
  delegate_not?: InputMaybe<Scalars['String']>;
  delegate_not_contains?: InputMaybe<Scalars['String']>;
  delegate_not_contains_nocase?: InputMaybe<Scalars['String']>;
  delegate_not_ends_with?: InputMaybe<Scalars['String']>;
  delegate_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  delegate_not_in?: InputMaybe<Array<Scalars['String']>>;
  delegate_not_starts_with?: InputMaybe<Scalars['String']>;
  delegate_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  delegate_starts_with?: InputMaybe<Scalars['String']>;
  delegate_starts_with_nocase?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  lastUpdateBlockHash?: InputMaybe<Scalars['Bytes']>;
  lastUpdateBlockHash_contains?: InputMaybe<Scalars['Bytes']>;
  lastUpdateBlockHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
  lastUpdateBlockHash_not?: InputMaybe<Scalars['Bytes']>;
  lastUpdateBlockHash_not_contains?: InputMaybe<Scalars['Bytes']>;
  lastUpdateBlockHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  lastUpdateBlockNumber?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_gt?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_gte?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_in?: InputMaybe<Array<Scalars['Int']>>;
  lastUpdateBlockNumber_lt?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_lte?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_not?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_not_in?: InputMaybe<Array<Scalars['Int']>>;
  lastUpdateTimestamp?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_gt?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_gte?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_in?: InputMaybe<Array<Scalars['Int']>>;
  lastUpdateTimestamp_lt?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_lte?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_not?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_not_in?: InputMaybe<Array<Scalars['Int']>>;
  lastUpdateTransactionHash?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_contains?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
  lastUpdateTransactionHash_not?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_not_contains?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  noteBalance?: InputMaybe<Scalars['BigInt']>;
  noteBalanceChanges_?: InputMaybe<NoteBalanceChange_Filter>;
  noteBalance_gt?: InputMaybe<Scalars['BigInt']>;
  noteBalance_gte?: InputMaybe<Scalars['BigInt']>;
  noteBalance_in?: InputMaybe<Array<Scalars['BigInt']>>;
  noteBalance_lt?: InputMaybe<Scalars['BigInt']>;
  noteBalance_lte?: InputMaybe<Scalars['BigInt']>;
  noteBalance_not?: InputMaybe<Scalars['BigInt']>;
  noteBalance_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
};

export enum NoteBalance_OrderBy {
  Account = 'account',
  Delegate = 'delegate',
  Id = 'id',
  LastUpdateBlockHash = 'lastUpdateBlockHash',
  LastUpdateBlockNumber = 'lastUpdateBlockNumber',
  LastUpdateTimestamp = 'lastUpdateTimestamp',
  LastUpdateTransactionHash = 'lastUpdateTransactionHash',
  NoteBalance = 'noteBalance',
  NoteBalanceChanges = 'noteBalanceChanges'
}

/** Defines the order direction, either ascending or descending */
export enum OrderDirection {
  Asc = 'asc',
  Desc = 'desc'
}

export type Proposal = {
  __typename?: 'Proposal';
  calldatas: Array<Scalars['Bytes']>;
  createdAt: Scalars['Int'];
  endBlock: Scalars['Int'];
  history?: Maybe<Array<ProposalState>>;
  /** Proposal's unique identifier */
  id: Scalars['ID'];
  isCancelled?: Maybe<Scalars['Boolean']>;
  isExecuted?: Maybe<Scalars['Boolean']>;
  isQueued?: Maybe<Scalars['Boolean']>;
  lastUpdateBlockHash: Scalars['Bytes'];
  lastUpdateBlockNumber: Scalars['Int'];
  lastUpdateTimestamp: Scalars['Int'];
  lastUpdateTransactionHash: Scalars['Bytes'];
  proposer: Delegate;
  startBlock: Scalars['Int'];
  targets: Array<Scalars['Bytes']>;
  values: Array<Scalars['BigInt']>;
  votes: Array<Vote>;
};


export type ProposalHistoryArgs = {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<ProposalState_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<ProposalState_Filter>;
};


export type ProposalVotesArgs = {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Vote_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<Vote_Filter>;
};

export type ProposalState = {
  __typename?: 'ProposalState';
  id: Scalars['ID'];
  lastUpdateTimestamp: Scalars['Int'];
  state: ProposalStateEnum;
  transactionHash: Scalars['Bytes'];
};

export enum ProposalStateEnum {
  Cancelled = 'CANCELLED',
  Executed = 'EXECUTED',
  Pending = 'PENDING',
  Queued = 'QUEUED'
}

export type ProposalState_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  id?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  lastUpdateTimestamp?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_gt?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_gte?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_in?: InputMaybe<Array<Scalars['Int']>>;
  lastUpdateTimestamp_lt?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_lte?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_not?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_not_in?: InputMaybe<Array<Scalars['Int']>>;
  state?: InputMaybe<ProposalStateEnum>;
  state_in?: InputMaybe<Array<ProposalStateEnum>>;
  state_not?: InputMaybe<ProposalStateEnum>;
  state_not_in?: InputMaybe<Array<ProposalStateEnum>>;
  transactionHash?: InputMaybe<Scalars['Bytes']>;
  transactionHash_contains?: InputMaybe<Scalars['Bytes']>;
  transactionHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
  transactionHash_not?: InputMaybe<Scalars['Bytes']>;
  transactionHash_not_contains?: InputMaybe<Scalars['Bytes']>;
  transactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
};

export enum ProposalState_OrderBy {
  Id = 'id',
  LastUpdateTimestamp = 'lastUpdateTimestamp',
  State = 'state',
  TransactionHash = 'transactionHash'
}

export type Proposal_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  calldatas?: InputMaybe<Array<Scalars['Bytes']>>;
  calldatas_contains?: InputMaybe<Array<Scalars['Bytes']>>;
  calldatas_contains_nocase?: InputMaybe<Array<Scalars['Bytes']>>;
  calldatas_not?: InputMaybe<Array<Scalars['Bytes']>>;
  calldatas_not_contains?: InputMaybe<Array<Scalars['Bytes']>>;
  calldatas_not_contains_nocase?: InputMaybe<Array<Scalars['Bytes']>>;
  createdAt?: InputMaybe<Scalars['Int']>;
  createdAt_gt?: InputMaybe<Scalars['Int']>;
  createdAt_gte?: InputMaybe<Scalars['Int']>;
  createdAt_in?: InputMaybe<Array<Scalars['Int']>>;
  createdAt_lt?: InputMaybe<Scalars['Int']>;
  createdAt_lte?: InputMaybe<Scalars['Int']>;
  createdAt_not?: InputMaybe<Scalars['Int']>;
  createdAt_not_in?: InputMaybe<Array<Scalars['Int']>>;
  endBlock?: InputMaybe<Scalars['Int']>;
  endBlock_gt?: InputMaybe<Scalars['Int']>;
  endBlock_gte?: InputMaybe<Scalars['Int']>;
  endBlock_in?: InputMaybe<Array<Scalars['Int']>>;
  endBlock_lt?: InputMaybe<Scalars['Int']>;
  endBlock_lte?: InputMaybe<Scalars['Int']>;
  endBlock_not?: InputMaybe<Scalars['Int']>;
  endBlock_not_in?: InputMaybe<Array<Scalars['Int']>>;
  history?: InputMaybe<Array<Scalars['String']>>;
  history_?: InputMaybe<ProposalState_Filter>;
  history_contains?: InputMaybe<Array<Scalars['String']>>;
  history_contains_nocase?: InputMaybe<Array<Scalars['String']>>;
  history_not?: InputMaybe<Array<Scalars['String']>>;
  history_not_contains?: InputMaybe<Array<Scalars['String']>>;
  history_not_contains_nocase?: InputMaybe<Array<Scalars['String']>>;
  id?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  isCancelled?: InputMaybe<Scalars['Boolean']>;
  isCancelled_in?: InputMaybe<Array<Scalars['Boolean']>>;
  isCancelled_not?: InputMaybe<Scalars['Boolean']>;
  isCancelled_not_in?: InputMaybe<Array<Scalars['Boolean']>>;
  isExecuted?: InputMaybe<Scalars['Boolean']>;
  isExecuted_in?: InputMaybe<Array<Scalars['Boolean']>>;
  isExecuted_not?: InputMaybe<Scalars['Boolean']>;
  isExecuted_not_in?: InputMaybe<Array<Scalars['Boolean']>>;
  isQueued?: InputMaybe<Scalars['Boolean']>;
  isQueued_in?: InputMaybe<Array<Scalars['Boolean']>>;
  isQueued_not?: InputMaybe<Scalars['Boolean']>;
  isQueued_not_in?: InputMaybe<Array<Scalars['Boolean']>>;
  lastUpdateBlockHash?: InputMaybe<Scalars['Bytes']>;
  lastUpdateBlockHash_contains?: InputMaybe<Scalars['Bytes']>;
  lastUpdateBlockHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
  lastUpdateBlockHash_not?: InputMaybe<Scalars['Bytes']>;
  lastUpdateBlockHash_not_contains?: InputMaybe<Scalars['Bytes']>;
  lastUpdateBlockHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  lastUpdateBlockNumber?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_gt?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_gte?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_in?: InputMaybe<Array<Scalars['Int']>>;
  lastUpdateBlockNumber_lt?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_lte?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_not?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_not_in?: InputMaybe<Array<Scalars['Int']>>;
  lastUpdateTimestamp?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_gt?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_gte?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_in?: InputMaybe<Array<Scalars['Int']>>;
  lastUpdateTimestamp_lt?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_lte?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_not?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_not_in?: InputMaybe<Array<Scalars['Int']>>;
  lastUpdateTransactionHash?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_contains?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
  lastUpdateTransactionHash_not?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_not_contains?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  proposer?: InputMaybe<Scalars['String']>;
  proposer_?: InputMaybe<Delegate_Filter>;
  proposer_contains?: InputMaybe<Scalars['String']>;
  proposer_contains_nocase?: InputMaybe<Scalars['String']>;
  proposer_ends_with?: InputMaybe<Scalars['String']>;
  proposer_ends_with_nocase?: InputMaybe<Scalars['String']>;
  proposer_gt?: InputMaybe<Scalars['String']>;
  proposer_gte?: InputMaybe<Scalars['String']>;
  proposer_in?: InputMaybe<Array<Scalars['String']>>;
  proposer_lt?: InputMaybe<Scalars['String']>;
  proposer_lte?: InputMaybe<Scalars['String']>;
  proposer_not?: InputMaybe<Scalars['String']>;
  proposer_not_contains?: InputMaybe<Scalars['String']>;
  proposer_not_contains_nocase?: InputMaybe<Scalars['String']>;
  proposer_not_ends_with?: InputMaybe<Scalars['String']>;
  proposer_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  proposer_not_in?: InputMaybe<Array<Scalars['String']>>;
  proposer_not_starts_with?: InputMaybe<Scalars['String']>;
  proposer_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  proposer_starts_with?: InputMaybe<Scalars['String']>;
  proposer_starts_with_nocase?: InputMaybe<Scalars['String']>;
  startBlock?: InputMaybe<Scalars['Int']>;
  startBlock_gt?: InputMaybe<Scalars['Int']>;
  startBlock_gte?: InputMaybe<Scalars['Int']>;
  startBlock_in?: InputMaybe<Array<Scalars['Int']>>;
  startBlock_lt?: InputMaybe<Scalars['Int']>;
  startBlock_lte?: InputMaybe<Scalars['Int']>;
  startBlock_not?: InputMaybe<Scalars['Int']>;
  startBlock_not_in?: InputMaybe<Array<Scalars['Int']>>;
  targets?: InputMaybe<Array<Scalars['Bytes']>>;
  targets_contains?: InputMaybe<Array<Scalars['Bytes']>>;
  targets_contains_nocase?: InputMaybe<Array<Scalars['Bytes']>>;
  targets_not?: InputMaybe<Array<Scalars['Bytes']>>;
  targets_not_contains?: InputMaybe<Array<Scalars['Bytes']>>;
  targets_not_contains_nocase?: InputMaybe<Array<Scalars['Bytes']>>;
  values?: InputMaybe<Array<Scalars['BigInt']>>;
  values_contains?: InputMaybe<Array<Scalars['BigInt']>>;
  values_contains_nocase?: InputMaybe<Array<Scalars['BigInt']>>;
  values_not?: InputMaybe<Array<Scalars['BigInt']>>;
  values_not_contains?: InputMaybe<Array<Scalars['BigInt']>>;
  values_not_contains_nocase?: InputMaybe<Array<Scalars['BigInt']>>;
  votes?: InputMaybe<Array<Scalars['String']>>;
  votes_?: InputMaybe<Vote_Filter>;
  votes_contains?: InputMaybe<Array<Scalars['String']>>;
  votes_contains_nocase?: InputMaybe<Array<Scalars['String']>>;
  votes_not?: InputMaybe<Array<Scalars['String']>>;
  votes_not_contains?: InputMaybe<Array<Scalars['String']>>;
  votes_not_contains_nocase?: InputMaybe<Array<Scalars['String']>>;
};

export enum Proposal_OrderBy {
  Calldatas = 'calldatas',
  CreatedAt = 'createdAt',
  EndBlock = 'endBlock',
  History = 'history',
  Id = 'id',
  IsCancelled = 'isCancelled',
  IsExecuted = 'isExecuted',
  IsQueued = 'isQueued',
  LastUpdateBlockHash = 'lastUpdateBlockHash',
  LastUpdateBlockNumber = 'lastUpdateBlockNumber',
  LastUpdateTimestamp = 'lastUpdateTimestamp',
  LastUpdateTransactionHash = 'lastUpdateTransactionHash',
  Proposer = 'proposer',
  StartBlock = 'startBlock',
  Targets = 'targets',
  Values = 'values',
  Votes = 'votes'
}

export type Query = {
  __typename?: 'Query';
  /** Access to subgraph metadata */
  _meta?: Maybe<_Meta_>;
  account?: Maybe<Account>;
  accounts: Array<Account>;
  asset?: Maybe<Asset>;
  assetChange?: Maybe<AssetChange>;
  assetChanges: Array<AssetChange>;
  assetExchangeRate?: Maybe<AssetExchangeRate>;
  assetExchangeRateHistoricalData?: Maybe<AssetExchangeRateHistoricalData>;
  assetExchangeRateHistoricalDatas: Array<AssetExchangeRateHistoricalData>;
  assetExchangeRates: Array<AssetExchangeRate>;
  assetTransfer?: Maybe<AssetTransfer>;
  assetTransfers: Array<AssetTransfer>;
  assets: Array<Asset>;
  authorizedCallbackContract?: Maybe<AuthorizedCallbackContract>;
  authorizedCallbackContracts: Array<AuthorizedCallbackContract>;
  balance?: Maybe<Balance>;
  balanceChange?: Maybe<BalanceChange>;
  balanceChanges: Array<BalanceChange>;
  balances: Array<Balance>;
  cashGroup?: Maybe<CashGroup>;
  cashGroups: Array<CashGroup>;
  compbalance?: Maybe<CompBalance>;
  compbalances: Array<CompBalance>;
  currencies: Array<Currency>;
  currency?: Maybe<Currency>;
  currencyTvl?: Maybe<CurrencyTvl>;
  currencyTvls: Array<CurrencyTvl>;
  dailyLendBorrowVolume?: Maybe<DailyLendBorrowVolume>;
  dailyLendBorrowVolumes: Array<DailyLendBorrowVolume>;
  delegate?: Maybe<Delegate>;
  delegates: Array<Delegate>;
  ethExchangeRate?: Maybe<EthExchangeRate>;
  ethExchangeRateHistoricalData?: Maybe<EthExchangeRateHistoricalData>;
  ethExchangeRateHistoricalDatas: Array<EthExchangeRateHistoricalData>;
  ethExchangeRates: Array<EthExchangeRate>;
  globalTransferOperator?: Maybe<GlobalTransferOperator>;
  globalTransferOperators: Array<GlobalTransferOperator>;
  incentiveMigration?: Maybe<IncentiveMigration>;
  incentiveMigrations: Array<IncentiveMigration>;
  leveragedVault?: Maybe<LeveragedVault>;
  leveragedVaultAccount?: Maybe<LeveragedVaultAccount>;
  leveragedVaultAccounts: Array<LeveragedVaultAccount>;
  leveragedVaultCapacities: Array<LeveragedVaultCapacity>;
  leveragedVaultCapacity?: Maybe<LeveragedVaultCapacity>;
  leveragedVaultDirectories: Array<LeveragedVaultDirectory>;
  leveragedVaultDirectory?: Maybe<LeveragedVaultDirectory>;
  leveragedVaultHistoricalValue?: Maybe<LeveragedVaultHistoricalValue>;
  leveragedVaultHistoricalValues: Array<LeveragedVaultHistoricalValue>;
  leveragedVaultMaturities: Array<LeveragedVaultMaturity>;
  leveragedVaultMaturity?: Maybe<LeveragedVaultMaturity>;
  leveragedVaultMaturityEvent?: Maybe<LeveragedVaultMaturityEvent>;
  leveragedVaultMaturityEvents: Array<LeveragedVaultMaturityEvent>;
  leveragedVaultTrade?: Maybe<LeveragedVaultTrade>;
  leveragedVaultTrades: Array<LeveragedVaultTrade>;
  leveragedVaults: Array<LeveragedVault>;
  liquidation?: Maybe<Liquidation>;
  liquidations: Array<Liquidation>;
  market?: Maybe<Market>;
  marketHistoricalData?: Maybe<MarketHistoricalData>;
  marketHistoricalDatas: Array<MarketHistoricalData>;
  marketInitialization?: Maybe<MarketInitialization>;
  marketInitializations: Array<MarketInitialization>;
  markets: Array<Market>;
  nToken?: Maybe<NToken>;
  nTokenChange?: Maybe<NTokenChange>;
  nTokenChanges: Array<NTokenChange>;
  nTokens: Array<NToken>;
  noteBalance?: Maybe<NoteBalance>;
  noteBalanceChange?: Maybe<NoteBalanceChange>;
  noteBalanceChanges: Array<NoteBalanceChange>;
  noteBalances: Array<NoteBalance>;
  ntokenPresentValueHistoricalData?: Maybe<NTokenPresentValueHistoricalData>;
  ntokenPresentValueHistoricalDatas: Array<NTokenPresentValueHistoricalData>;
  proposal?: Maybe<Proposal>;
  proposalState?: Maybe<ProposalState>;
  proposalStates: Array<ProposalState>;
  proposals: Array<Proposal>;
  secondaryIncentiveRewarder?: Maybe<SecondaryIncentiveRewarder>;
  secondaryIncentiveRewarders: Array<SecondaryIncentiveRewarder>;
  settlementRate?: Maybe<SettlementRate>;
  settlementRates: Array<SettlementRate>;
  stakedNoteBalance?: Maybe<StakedNoteBalance>;
  stakedNoteBalances: Array<StakedNoteBalance>;
  stakedNoteChange?: Maybe<StakedNoteChange>;
  stakedNoteChanges: Array<StakedNoteChange>;
  stakedNoteCoolDown?: Maybe<StakedNoteCoolDown>;
  stakedNoteCoolDowns: Array<StakedNoteCoolDown>;
  stakedNoteInvestment?: Maybe<StakedNoteInvestment>;
  stakedNoteInvestments: Array<StakedNoteInvestment>;
  stakedNotePool?: Maybe<StakedNotePool>;
  stakedNotePools: Array<StakedNotePool>;
  stakedNoteTvl?: Maybe<StakedNoteTvl>;
  stakedNoteTvls: Array<StakedNoteTvl>;
  trade?: Maybe<Trade>;
  trades: Array<Trade>;
  treasuries: Array<Treasury>;
  treasury?: Maybe<Treasury>;
  treasuryManager?: Maybe<TreasuryManager>;
  treasuryManagerTradingLimit?: Maybe<TreasuryManagerTradingLimit>;
  treasuryManagerTradingLimits: Array<TreasuryManagerTradingLimit>;
  treasuryManagers: Array<TreasuryManager>;
  treasuryTokenTrade?: Maybe<TreasuryTokenTrade>;
  treasuryTokenTrades: Array<TreasuryTokenTrade>;
  tvlHistoricalData?: Maybe<TvlHistoricalData>;
  tvlHistoricalDatas: Array<TvlHistoricalData>;
  vote?: Maybe<Vote>;
  votes: Array<Vote>;
  votingPowerChange?: Maybe<VotingPowerChange>;
  votingPowerChanges: Array<VotingPowerChange>;
};


export type Query_MetaArgs = {
  block?: InputMaybe<Block_Height>;
};


export type QueryAccountArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryAccountsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Account_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Account_Filter>;
};


export type QueryAssetArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryAssetChangeArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryAssetChangesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<AssetChange_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<AssetChange_Filter>;
};


export type QueryAssetExchangeRateArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryAssetExchangeRateHistoricalDataArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryAssetExchangeRateHistoricalDatasArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<AssetExchangeRateHistoricalData_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<AssetExchangeRateHistoricalData_Filter>;
};


export type QueryAssetExchangeRatesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<AssetExchangeRate_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<AssetExchangeRate_Filter>;
};


export type QueryAssetTransferArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryAssetTransfersArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<AssetTransfer_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<AssetTransfer_Filter>;
};


export type QueryAssetsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Asset_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Asset_Filter>;
};


export type QueryAuthorizedCallbackContractArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryAuthorizedCallbackContractsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<AuthorizedCallbackContract_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<AuthorizedCallbackContract_Filter>;
};


export type QueryBalanceArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryBalanceChangeArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryBalanceChangesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<BalanceChange_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<BalanceChange_Filter>;
};


export type QueryBalancesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Balance_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Balance_Filter>;
};


export type QueryCashGroupArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryCashGroupsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<CashGroup_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<CashGroup_Filter>;
};


export type QueryCompbalanceArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryCompbalancesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<CompBalance_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<CompBalance_Filter>;
};


export type QueryCurrenciesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Currency_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Currency_Filter>;
};


export type QueryCurrencyArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryCurrencyTvlArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryCurrencyTvlsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<CurrencyTvl_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<CurrencyTvl_Filter>;
};


export type QueryDailyLendBorrowVolumeArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryDailyLendBorrowVolumesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<DailyLendBorrowVolume_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<DailyLendBorrowVolume_Filter>;
};


export type QueryDelegateArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryDelegatesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Delegate_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Delegate_Filter>;
};


export type QueryEthExchangeRateArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryEthExchangeRateHistoricalDataArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryEthExchangeRateHistoricalDatasArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<EthExchangeRateHistoricalData_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<EthExchangeRateHistoricalData_Filter>;
};


export type QueryEthExchangeRatesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<EthExchangeRate_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<EthExchangeRate_Filter>;
};


export type QueryGlobalTransferOperatorArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryGlobalTransferOperatorsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<GlobalTransferOperator_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<GlobalTransferOperator_Filter>;
};


export type QueryIncentiveMigrationArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryIncentiveMigrationsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<IncentiveMigration_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<IncentiveMigration_Filter>;
};


export type QueryLeveragedVaultArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryLeveragedVaultAccountArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryLeveragedVaultAccountsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<LeveragedVaultAccount_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<LeveragedVaultAccount_Filter>;
};


export type QueryLeveragedVaultCapacitiesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<LeveragedVaultCapacity_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<LeveragedVaultCapacity_Filter>;
};


export type QueryLeveragedVaultCapacityArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryLeveragedVaultDirectoriesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<LeveragedVaultDirectory_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<LeveragedVaultDirectory_Filter>;
};


export type QueryLeveragedVaultDirectoryArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryLeveragedVaultHistoricalValueArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryLeveragedVaultHistoricalValuesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<LeveragedVaultHistoricalValue_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<LeveragedVaultHistoricalValue_Filter>;
};


export type QueryLeveragedVaultMaturitiesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<LeveragedVaultMaturity_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<LeveragedVaultMaturity_Filter>;
};


export type QueryLeveragedVaultMaturityArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryLeveragedVaultMaturityEventArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryLeveragedVaultMaturityEventsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<LeveragedVaultMaturityEvent_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<LeveragedVaultMaturityEvent_Filter>;
};


export type QueryLeveragedVaultTradeArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryLeveragedVaultTradesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<LeveragedVaultTrade_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<LeveragedVaultTrade_Filter>;
};


export type QueryLeveragedVaultsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<LeveragedVault_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<LeveragedVault_Filter>;
};


export type QueryLiquidationArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryLiquidationsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Liquidation_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Liquidation_Filter>;
};


export type QueryMarketArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryMarketHistoricalDataArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryMarketHistoricalDatasArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<MarketHistoricalData_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<MarketHistoricalData_Filter>;
};


export type QueryMarketInitializationArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryMarketInitializationsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<MarketInitialization_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<MarketInitialization_Filter>;
};


export type QueryMarketsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Market_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Market_Filter>;
};


export type QueryNTokenArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryNTokenChangeArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryNTokenChangesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<NTokenChange_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<NTokenChange_Filter>;
};


export type QueryNTokensArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<NToken_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<NToken_Filter>;
};


export type QueryNoteBalanceArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryNoteBalanceChangeArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryNoteBalanceChangesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<NoteBalanceChange_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<NoteBalanceChange_Filter>;
};


export type QueryNoteBalancesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<NoteBalance_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<NoteBalance_Filter>;
};


export type QueryNtokenPresentValueHistoricalDataArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryNtokenPresentValueHistoricalDatasArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<NTokenPresentValueHistoricalData_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<NTokenPresentValueHistoricalData_Filter>;
};


export type QueryProposalArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryProposalStateArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryProposalStatesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<ProposalState_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<ProposalState_Filter>;
};


export type QueryProposalsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Proposal_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Proposal_Filter>;
};


export type QuerySecondaryIncentiveRewarderArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QuerySecondaryIncentiveRewardersArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<SecondaryIncentiveRewarder_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<SecondaryIncentiveRewarder_Filter>;
};


export type QuerySettlementRateArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QuerySettlementRatesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<SettlementRate_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<SettlementRate_Filter>;
};


export type QueryStakedNoteBalanceArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryStakedNoteBalancesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<StakedNoteBalance_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<StakedNoteBalance_Filter>;
};


export type QueryStakedNoteChangeArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryStakedNoteChangesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<StakedNoteChange_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<StakedNoteChange_Filter>;
};


export type QueryStakedNoteCoolDownArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryStakedNoteCoolDownsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<StakedNoteCoolDown_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<StakedNoteCoolDown_Filter>;
};


export type QueryStakedNoteInvestmentArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryStakedNoteInvestmentsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<StakedNoteInvestment_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<StakedNoteInvestment_Filter>;
};


export type QueryStakedNotePoolArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryStakedNotePoolsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<StakedNotePool_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<StakedNotePool_Filter>;
};


export type QueryStakedNoteTvlArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryStakedNoteTvlsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<StakedNoteTvl_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<StakedNoteTvl_Filter>;
};


export type QueryTradeArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryTradesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Trade_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Trade_Filter>;
};


export type QueryTreasuriesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Treasury_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Treasury_Filter>;
};


export type QueryTreasuryArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryTreasuryManagerArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryTreasuryManagerTradingLimitArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryTreasuryManagerTradingLimitsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<TreasuryManagerTradingLimit_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<TreasuryManagerTradingLimit_Filter>;
};


export type QueryTreasuryManagersArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<TreasuryManager_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<TreasuryManager_Filter>;
};


export type QueryTreasuryTokenTradeArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryTreasuryTokenTradesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<TreasuryTokenTrade_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<TreasuryTokenTrade_Filter>;
};


export type QueryTvlHistoricalDataArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryTvlHistoricalDatasArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<TvlHistoricalData_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<TvlHistoricalData_Filter>;
};


export type QueryVoteArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryVotesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Vote_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Vote_Filter>;
};


export type QueryVotingPowerChangeArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryVotingPowerChangesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<VotingPowerChange_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<VotingPowerChange_Filter>;
};

export type SecondaryIncentiveRewarder = {
  __typename?: 'SecondaryIncentiveRewarder';
  currency: Currency;
  /** Address of the rewarder contract */
  id: Scalars['ID'];
  lastUpdateBlockHash: Scalars['Bytes'];
  lastUpdateBlockNumber: Scalars['Int'];
  lastUpdateTimestamp: Scalars['Int'];
  lastUpdateTransactionHash: Scalars['Bytes'];
  nToken: NToken;
};

export type SecondaryIncentiveRewarder_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  currency?: InputMaybe<Scalars['String']>;
  currency_?: InputMaybe<Currency_Filter>;
  currency_contains?: InputMaybe<Scalars['String']>;
  currency_contains_nocase?: InputMaybe<Scalars['String']>;
  currency_ends_with?: InputMaybe<Scalars['String']>;
  currency_ends_with_nocase?: InputMaybe<Scalars['String']>;
  currency_gt?: InputMaybe<Scalars['String']>;
  currency_gte?: InputMaybe<Scalars['String']>;
  currency_in?: InputMaybe<Array<Scalars['String']>>;
  currency_lt?: InputMaybe<Scalars['String']>;
  currency_lte?: InputMaybe<Scalars['String']>;
  currency_not?: InputMaybe<Scalars['String']>;
  currency_not_contains?: InputMaybe<Scalars['String']>;
  currency_not_contains_nocase?: InputMaybe<Scalars['String']>;
  currency_not_ends_with?: InputMaybe<Scalars['String']>;
  currency_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  currency_not_in?: InputMaybe<Array<Scalars['String']>>;
  currency_not_starts_with?: InputMaybe<Scalars['String']>;
  currency_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  currency_starts_with?: InputMaybe<Scalars['String']>;
  currency_starts_with_nocase?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  lastUpdateBlockHash?: InputMaybe<Scalars['Bytes']>;
  lastUpdateBlockHash_contains?: InputMaybe<Scalars['Bytes']>;
  lastUpdateBlockHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
  lastUpdateBlockHash_not?: InputMaybe<Scalars['Bytes']>;
  lastUpdateBlockHash_not_contains?: InputMaybe<Scalars['Bytes']>;
  lastUpdateBlockHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  lastUpdateBlockNumber?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_gt?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_gte?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_in?: InputMaybe<Array<Scalars['Int']>>;
  lastUpdateBlockNumber_lt?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_lte?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_not?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_not_in?: InputMaybe<Array<Scalars['Int']>>;
  lastUpdateTimestamp?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_gt?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_gte?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_in?: InputMaybe<Array<Scalars['Int']>>;
  lastUpdateTimestamp_lt?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_lte?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_not?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_not_in?: InputMaybe<Array<Scalars['Int']>>;
  lastUpdateTransactionHash?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_contains?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
  lastUpdateTransactionHash_not?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_not_contains?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  nToken?: InputMaybe<Scalars['String']>;
  nToken_?: InputMaybe<NToken_Filter>;
  nToken_contains?: InputMaybe<Scalars['String']>;
  nToken_contains_nocase?: InputMaybe<Scalars['String']>;
  nToken_ends_with?: InputMaybe<Scalars['String']>;
  nToken_ends_with_nocase?: InputMaybe<Scalars['String']>;
  nToken_gt?: InputMaybe<Scalars['String']>;
  nToken_gte?: InputMaybe<Scalars['String']>;
  nToken_in?: InputMaybe<Array<Scalars['String']>>;
  nToken_lt?: InputMaybe<Scalars['String']>;
  nToken_lte?: InputMaybe<Scalars['String']>;
  nToken_not?: InputMaybe<Scalars['String']>;
  nToken_not_contains?: InputMaybe<Scalars['String']>;
  nToken_not_contains_nocase?: InputMaybe<Scalars['String']>;
  nToken_not_ends_with?: InputMaybe<Scalars['String']>;
  nToken_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  nToken_not_in?: InputMaybe<Array<Scalars['String']>>;
  nToken_not_starts_with?: InputMaybe<Scalars['String']>;
  nToken_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  nToken_starts_with?: InputMaybe<Scalars['String']>;
  nToken_starts_with_nocase?: InputMaybe<Scalars['String']>;
};

export enum SecondaryIncentiveRewarder_OrderBy {
  Currency = 'currency',
  Id = 'id',
  LastUpdateBlockHash = 'lastUpdateBlockHash',
  LastUpdateBlockNumber = 'lastUpdateBlockNumber',
  LastUpdateTimestamp = 'lastUpdateTimestamp',
  LastUpdateTransactionHash = 'lastUpdateTransactionHash',
  NToken = 'nToken'
}

export type SettlementRate = {
  __typename?: 'SettlementRate';
  /** Asset exchange rate referenced by this settlement rate */
  assetExchangeRate: AssetExchangeRate;
  /** Currency of this settlement rate */
  currency: Currency;
  /** Currency id and maturity that this settlement rate refers to */
  id: Scalars['ID'];
  lastUpdateBlockHash: Scalars['Bytes'];
  lastUpdateBlockNumber: Scalars['Int'];
  lastUpdateTimestamp: Scalars['Int'];
  lastUpdateTransactionHash: Scalars['Bytes'];
  /** Maturity that this settlement rate refers to */
  maturity: Scalars['Int'];
  /** Settlement rate value */
  rate: Scalars['BigInt'];
};

export type SettlementRate_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  assetExchangeRate?: InputMaybe<Scalars['String']>;
  assetExchangeRate_?: InputMaybe<AssetExchangeRate_Filter>;
  assetExchangeRate_contains?: InputMaybe<Scalars['String']>;
  assetExchangeRate_contains_nocase?: InputMaybe<Scalars['String']>;
  assetExchangeRate_ends_with?: InputMaybe<Scalars['String']>;
  assetExchangeRate_ends_with_nocase?: InputMaybe<Scalars['String']>;
  assetExchangeRate_gt?: InputMaybe<Scalars['String']>;
  assetExchangeRate_gte?: InputMaybe<Scalars['String']>;
  assetExchangeRate_in?: InputMaybe<Array<Scalars['String']>>;
  assetExchangeRate_lt?: InputMaybe<Scalars['String']>;
  assetExchangeRate_lte?: InputMaybe<Scalars['String']>;
  assetExchangeRate_not?: InputMaybe<Scalars['String']>;
  assetExchangeRate_not_contains?: InputMaybe<Scalars['String']>;
  assetExchangeRate_not_contains_nocase?: InputMaybe<Scalars['String']>;
  assetExchangeRate_not_ends_with?: InputMaybe<Scalars['String']>;
  assetExchangeRate_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  assetExchangeRate_not_in?: InputMaybe<Array<Scalars['String']>>;
  assetExchangeRate_not_starts_with?: InputMaybe<Scalars['String']>;
  assetExchangeRate_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  assetExchangeRate_starts_with?: InputMaybe<Scalars['String']>;
  assetExchangeRate_starts_with_nocase?: InputMaybe<Scalars['String']>;
  currency?: InputMaybe<Scalars['String']>;
  currency_?: InputMaybe<Currency_Filter>;
  currency_contains?: InputMaybe<Scalars['String']>;
  currency_contains_nocase?: InputMaybe<Scalars['String']>;
  currency_ends_with?: InputMaybe<Scalars['String']>;
  currency_ends_with_nocase?: InputMaybe<Scalars['String']>;
  currency_gt?: InputMaybe<Scalars['String']>;
  currency_gte?: InputMaybe<Scalars['String']>;
  currency_in?: InputMaybe<Array<Scalars['String']>>;
  currency_lt?: InputMaybe<Scalars['String']>;
  currency_lte?: InputMaybe<Scalars['String']>;
  currency_not?: InputMaybe<Scalars['String']>;
  currency_not_contains?: InputMaybe<Scalars['String']>;
  currency_not_contains_nocase?: InputMaybe<Scalars['String']>;
  currency_not_ends_with?: InputMaybe<Scalars['String']>;
  currency_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  currency_not_in?: InputMaybe<Array<Scalars['String']>>;
  currency_not_starts_with?: InputMaybe<Scalars['String']>;
  currency_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  currency_starts_with?: InputMaybe<Scalars['String']>;
  currency_starts_with_nocase?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  lastUpdateBlockHash?: InputMaybe<Scalars['Bytes']>;
  lastUpdateBlockHash_contains?: InputMaybe<Scalars['Bytes']>;
  lastUpdateBlockHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
  lastUpdateBlockHash_not?: InputMaybe<Scalars['Bytes']>;
  lastUpdateBlockHash_not_contains?: InputMaybe<Scalars['Bytes']>;
  lastUpdateBlockHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  lastUpdateBlockNumber?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_gt?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_gte?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_in?: InputMaybe<Array<Scalars['Int']>>;
  lastUpdateBlockNumber_lt?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_lte?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_not?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_not_in?: InputMaybe<Array<Scalars['Int']>>;
  lastUpdateTimestamp?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_gt?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_gte?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_in?: InputMaybe<Array<Scalars['Int']>>;
  lastUpdateTimestamp_lt?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_lte?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_not?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_not_in?: InputMaybe<Array<Scalars['Int']>>;
  lastUpdateTransactionHash?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_contains?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
  lastUpdateTransactionHash_not?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_not_contains?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  maturity?: InputMaybe<Scalars['Int']>;
  maturity_gt?: InputMaybe<Scalars['Int']>;
  maturity_gte?: InputMaybe<Scalars['Int']>;
  maturity_in?: InputMaybe<Array<Scalars['Int']>>;
  maturity_lt?: InputMaybe<Scalars['Int']>;
  maturity_lte?: InputMaybe<Scalars['Int']>;
  maturity_not?: InputMaybe<Scalars['Int']>;
  maturity_not_in?: InputMaybe<Array<Scalars['Int']>>;
  rate?: InputMaybe<Scalars['BigInt']>;
  rate_gt?: InputMaybe<Scalars['BigInt']>;
  rate_gte?: InputMaybe<Scalars['BigInt']>;
  rate_in?: InputMaybe<Array<Scalars['BigInt']>>;
  rate_lt?: InputMaybe<Scalars['BigInt']>;
  rate_lte?: InputMaybe<Scalars['BigInt']>;
  rate_not?: InputMaybe<Scalars['BigInt']>;
  rate_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
};

export enum SettlementRate_OrderBy {
  AssetExchangeRate = 'assetExchangeRate',
  Currency = 'currency',
  Id = 'id',
  LastUpdateBlockHash = 'lastUpdateBlockHash',
  LastUpdateBlockNumber = 'lastUpdateBlockNumber',
  LastUpdateTimestamp = 'lastUpdateTimestamp',
  LastUpdateTransactionHash = 'lastUpdateTransactionHash',
  Maturity = 'maturity',
  Rate = 'rate'
}

export type StakedNoteBalance = {
  __typename?: 'StakedNoteBalance';
  /** Provides a link to a staker's Notional accounts (if they exist) */
  account: Account;
  coolDowns?: Maybe<Array<StakedNoteCoolDown>>;
  currentCoolDown?: Maybe<StakedNoteCoolDown>;
  delegate?: Maybe<Delegate>;
  /** Total amount of ETH/WETH used to join the pool */
  ethAmountJoined: Scalars['BigInt'];
  /** Total amount of ethRedeemed from the pool */
  ethAmountRedeemed: Scalars['BigInt'];
  /** Account address */
  id: Scalars['ID'];
  lastUpdateBlockHash: Scalars['Bytes'];
  lastUpdateBlockNumber: Scalars['Int'];
  lastUpdateTimestamp: Scalars['Int'];
  lastUpdateTransactionHash: Scalars['Bytes'];
  /** Total amount of NOTE used to join the pool */
  noteAmountJoined: Scalars['BigInt'];
  /** Total amount of noteRedeemed from the pool */
  noteAmountRedeemed: Scalars['BigInt'];
  /** Current sNOTE balance of the account */
  sNOTEBalance: Scalars['BigInt'];
  stakedNoteChanges: Array<StakedNoteChange>;
};


export type StakedNoteBalanceCoolDownsArgs = {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<StakedNoteCoolDown_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<StakedNoteCoolDown_Filter>;
};


export type StakedNoteBalanceStakedNoteChangesArgs = {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<StakedNoteChange_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<StakedNoteChange_Filter>;
};

export type StakedNoteBalance_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  account?: InputMaybe<Scalars['String']>;
  account_?: InputMaybe<Account_Filter>;
  account_contains?: InputMaybe<Scalars['String']>;
  account_contains_nocase?: InputMaybe<Scalars['String']>;
  account_ends_with?: InputMaybe<Scalars['String']>;
  account_ends_with_nocase?: InputMaybe<Scalars['String']>;
  account_gt?: InputMaybe<Scalars['String']>;
  account_gte?: InputMaybe<Scalars['String']>;
  account_in?: InputMaybe<Array<Scalars['String']>>;
  account_lt?: InputMaybe<Scalars['String']>;
  account_lte?: InputMaybe<Scalars['String']>;
  account_not?: InputMaybe<Scalars['String']>;
  account_not_contains?: InputMaybe<Scalars['String']>;
  account_not_contains_nocase?: InputMaybe<Scalars['String']>;
  account_not_ends_with?: InputMaybe<Scalars['String']>;
  account_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  account_not_in?: InputMaybe<Array<Scalars['String']>>;
  account_not_starts_with?: InputMaybe<Scalars['String']>;
  account_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  account_starts_with?: InputMaybe<Scalars['String']>;
  account_starts_with_nocase?: InputMaybe<Scalars['String']>;
  coolDowns_?: InputMaybe<StakedNoteCoolDown_Filter>;
  currentCoolDown?: InputMaybe<Scalars['String']>;
  currentCoolDown_?: InputMaybe<StakedNoteCoolDown_Filter>;
  currentCoolDown_contains?: InputMaybe<Scalars['String']>;
  currentCoolDown_contains_nocase?: InputMaybe<Scalars['String']>;
  currentCoolDown_ends_with?: InputMaybe<Scalars['String']>;
  currentCoolDown_ends_with_nocase?: InputMaybe<Scalars['String']>;
  currentCoolDown_gt?: InputMaybe<Scalars['String']>;
  currentCoolDown_gte?: InputMaybe<Scalars['String']>;
  currentCoolDown_in?: InputMaybe<Array<Scalars['String']>>;
  currentCoolDown_lt?: InputMaybe<Scalars['String']>;
  currentCoolDown_lte?: InputMaybe<Scalars['String']>;
  currentCoolDown_not?: InputMaybe<Scalars['String']>;
  currentCoolDown_not_contains?: InputMaybe<Scalars['String']>;
  currentCoolDown_not_contains_nocase?: InputMaybe<Scalars['String']>;
  currentCoolDown_not_ends_with?: InputMaybe<Scalars['String']>;
  currentCoolDown_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  currentCoolDown_not_in?: InputMaybe<Array<Scalars['String']>>;
  currentCoolDown_not_starts_with?: InputMaybe<Scalars['String']>;
  currentCoolDown_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  currentCoolDown_starts_with?: InputMaybe<Scalars['String']>;
  currentCoolDown_starts_with_nocase?: InputMaybe<Scalars['String']>;
  delegate?: InputMaybe<Scalars['String']>;
  delegate_?: InputMaybe<Delegate_Filter>;
  delegate_contains?: InputMaybe<Scalars['String']>;
  delegate_contains_nocase?: InputMaybe<Scalars['String']>;
  delegate_ends_with?: InputMaybe<Scalars['String']>;
  delegate_ends_with_nocase?: InputMaybe<Scalars['String']>;
  delegate_gt?: InputMaybe<Scalars['String']>;
  delegate_gte?: InputMaybe<Scalars['String']>;
  delegate_in?: InputMaybe<Array<Scalars['String']>>;
  delegate_lt?: InputMaybe<Scalars['String']>;
  delegate_lte?: InputMaybe<Scalars['String']>;
  delegate_not?: InputMaybe<Scalars['String']>;
  delegate_not_contains?: InputMaybe<Scalars['String']>;
  delegate_not_contains_nocase?: InputMaybe<Scalars['String']>;
  delegate_not_ends_with?: InputMaybe<Scalars['String']>;
  delegate_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  delegate_not_in?: InputMaybe<Array<Scalars['String']>>;
  delegate_not_starts_with?: InputMaybe<Scalars['String']>;
  delegate_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  delegate_starts_with?: InputMaybe<Scalars['String']>;
  delegate_starts_with_nocase?: InputMaybe<Scalars['String']>;
  ethAmountJoined?: InputMaybe<Scalars['BigInt']>;
  ethAmountJoined_gt?: InputMaybe<Scalars['BigInt']>;
  ethAmountJoined_gte?: InputMaybe<Scalars['BigInt']>;
  ethAmountJoined_in?: InputMaybe<Array<Scalars['BigInt']>>;
  ethAmountJoined_lt?: InputMaybe<Scalars['BigInt']>;
  ethAmountJoined_lte?: InputMaybe<Scalars['BigInt']>;
  ethAmountJoined_not?: InputMaybe<Scalars['BigInt']>;
  ethAmountJoined_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  ethAmountRedeemed?: InputMaybe<Scalars['BigInt']>;
  ethAmountRedeemed_gt?: InputMaybe<Scalars['BigInt']>;
  ethAmountRedeemed_gte?: InputMaybe<Scalars['BigInt']>;
  ethAmountRedeemed_in?: InputMaybe<Array<Scalars['BigInt']>>;
  ethAmountRedeemed_lt?: InputMaybe<Scalars['BigInt']>;
  ethAmountRedeemed_lte?: InputMaybe<Scalars['BigInt']>;
  ethAmountRedeemed_not?: InputMaybe<Scalars['BigInt']>;
  ethAmountRedeemed_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  id?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  lastUpdateBlockHash?: InputMaybe<Scalars['Bytes']>;
  lastUpdateBlockHash_contains?: InputMaybe<Scalars['Bytes']>;
  lastUpdateBlockHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
  lastUpdateBlockHash_not?: InputMaybe<Scalars['Bytes']>;
  lastUpdateBlockHash_not_contains?: InputMaybe<Scalars['Bytes']>;
  lastUpdateBlockHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  lastUpdateBlockNumber?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_gt?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_gte?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_in?: InputMaybe<Array<Scalars['Int']>>;
  lastUpdateBlockNumber_lt?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_lte?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_not?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_not_in?: InputMaybe<Array<Scalars['Int']>>;
  lastUpdateTimestamp?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_gt?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_gte?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_in?: InputMaybe<Array<Scalars['Int']>>;
  lastUpdateTimestamp_lt?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_lte?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_not?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_not_in?: InputMaybe<Array<Scalars['Int']>>;
  lastUpdateTransactionHash?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_contains?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
  lastUpdateTransactionHash_not?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_not_contains?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  noteAmountJoined?: InputMaybe<Scalars['BigInt']>;
  noteAmountJoined_gt?: InputMaybe<Scalars['BigInt']>;
  noteAmountJoined_gte?: InputMaybe<Scalars['BigInt']>;
  noteAmountJoined_in?: InputMaybe<Array<Scalars['BigInt']>>;
  noteAmountJoined_lt?: InputMaybe<Scalars['BigInt']>;
  noteAmountJoined_lte?: InputMaybe<Scalars['BigInt']>;
  noteAmountJoined_not?: InputMaybe<Scalars['BigInt']>;
  noteAmountJoined_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  noteAmountRedeemed?: InputMaybe<Scalars['BigInt']>;
  noteAmountRedeemed_gt?: InputMaybe<Scalars['BigInt']>;
  noteAmountRedeemed_gte?: InputMaybe<Scalars['BigInt']>;
  noteAmountRedeemed_in?: InputMaybe<Array<Scalars['BigInt']>>;
  noteAmountRedeemed_lt?: InputMaybe<Scalars['BigInt']>;
  noteAmountRedeemed_lte?: InputMaybe<Scalars['BigInt']>;
  noteAmountRedeemed_not?: InputMaybe<Scalars['BigInt']>;
  noteAmountRedeemed_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  sNOTEBalance?: InputMaybe<Scalars['BigInt']>;
  sNOTEBalance_gt?: InputMaybe<Scalars['BigInt']>;
  sNOTEBalance_gte?: InputMaybe<Scalars['BigInt']>;
  sNOTEBalance_in?: InputMaybe<Array<Scalars['BigInt']>>;
  sNOTEBalance_lt?: InputMaybe<Scalars['BigInt']>;
  sNOTEBalance_lte?: InputMaybe<Scalars['BigInt']>;
  sNOTEBalance_not?: InputMaybe<Scalars['BigInt']>;
  sNOTEBalance_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  stakedNoteChanges_?: InputMaybe<StakedNoteChange_Filter>;
};

export enum StakedNoteBalance_OrderBy {
  Account = 'account',
  CoolDowns = 'coolDowns',
  CurrentCoolDown = 'currentCoolDown',
  Delegate = 'delegate',
  EthAmountJoined = 'ethAmountJoined',
  EthAmountRedeemed = 'ethAmountRedeemed',
  Id = 'id',
  LastUpdateBlockHash = 'lastUpdateBlockHash',
  LastUpdateBlockNumber = 'lastUpdateBlockNumber',
  LastUpdateTimestamp = 'lastUpdateTimestamp',
  LastUpdateTransactionHash = 'lastUpdateTransactionHash',
  NoteAmountJoined = 'noteAmountJoined',
  NoteAmountRedeemed = 'noteAmountRedeemed',
  SNoteBalance = 'sNOTEBalance',
  StakedNoteChanges = 'stakedNoteChanges'
}

export type StakedNoteChange = {
  __typename?: 'StakedNoteChange';
  account: Account;
  blockHash: Scalars['Bytes'];
  blockNumber: Scalars['Int'];
  bptAmountChange: Scalars['BigInt'];
  ethAmountChange: Scalars['BigInt'];
  id: Scalars['ID'];
  noteAmountChange: Scalars['BigInt'];
  receiver?: Maybe<Scalars['Bytes']>;
  sNOTEAmountAfter: Scalars['BigInt'];
  sNOTEAmountBefore: Scalars['BigInt'];
  sNOTEChangeType: SNoteChangeType;
  sender?: Maybe<Scalars['Bytes']>;
  stakedNoteBalance: StakedNoteBalance;
  timestamp: Scalars['Int'];
  transactionHash: Scalars['Bytes'];
};

export type StakedNoteChange_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  account?: InputMaybe<Scalars['String']>;
  account_?: InputMaybe<Account_Filter>;
  account_contains?: InputMaybe<Scalars['String']>;
  account_contains_nocase?: InputMaybe<Scalars['String']>;
  account_ends_with?: InputMaybe<Scalars['String']>;
  account_ends_with_nocase?: InputMaybe<Scalars['String']>;
  account_gt?: InputMaybe<Scalars['String']>;
  account_gte?: InputMaybe<Scalars['String']>;
  account_in?: InputMaybe<Array<Scalars['String']>>;
  account_lt?: InputMaybe<Scalars['String']>;
  account_lte?: InputMaybe<Scalars['String']>;
  account_not?: InputMaybe<Scalars['String']>;
  account_not_contains?: InputMaybe<Scalars['String']>;
  account_not_contains_nocase?: InputMaybe<Scalars['String']>;
  account_not_ends_with?: InputMaybe<Scalars['String']>;
  account_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  account_not_in?: InputMaybe<Array<Scalars['String']>>;
  account_not_starts_with?: InputMaybe<Scalars['String']>;
  account_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  account_starts_with?: InputMaybe<Scalars['String']>;
  account_starts_with_nocase?: InputMaybe<Scalars['String']>;
  blockHash?: InputMaybe<Scalars['Bytes']>;
  blockHash_contains?: InputMaybe<Scalars['Bytes']>;
  blockHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
  blockHash_not?: InputMaybe<Scalars['Bytes']>;
  blockHash_not_contains?: InputMaybe<Scalars['Bytes']>;
  blockHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  blockNumber?: InputMaybe<Scalars['Int']>;
  blockNumber_gt?: InputMaybe<Scalars['Int']>;
  blockNumber_gte?: InputMaybe<Scalars['Int']>;
  blockNumber_in?: InputMaybe<Array<Scalars['Int']>>;
  blockNumber_lt?: InputMaybe<Scalars['Int']>;
  blockNumber_lte?: InputMaybe<Scalars['Int']>;
  blockNumber_not?: InputMaybe<Scalars['Int']>;
  blockNumber_not_in?: InputMaybe<Array<Scalars['Int']>>;
  bptAmountChange?: InputMaybe<Scalars['BigInt']>;
  bptAmountChange_gt?: InputMaybe<Scalars['BigInt']>;
  bptAmountChange_gte?: InputMaybe<Scalars['BigInt']>;
  bptAmountChange_in?: InputMaybe<Array<Scalars['BigInt']>>;
  bptAmountChange_lt?: InputMaybe<Scalars['BigInt']>;
  bptAmountChange_lte?: InputMaybe<Scalars['BigInt']>;
  bptAmountChange_not?: InputMaybe<Scalars['BigInt']>;
  bptAmountChange_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  ethAmountChange?: InputMaybe<Scalars['BigInt']>;
  ethAmountChange_gt?: InputMaybe<Scalars['BigInt']>;
  ethAmountChange_gte?: InputMaybe<Scalars['BigInt']>;
  ethAmountChange_in?: InputMaybe<Array<Scalars['BigInt']>>;
  ethAmountChange_lt?: InputMaybe<Scalars['BigInt']>;
  ethAmountChange_lte?: InputMaybe<Scalars['BigInt']>;
  ethAmountChange_not?: InputMaybe<Scalars['BigInt']>;
  ethAmountChange_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  id?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  noteAmountChange?: InputMaybe<Scalars['BigInt']>;
  noteAmountChange_gt?: InputMaybe<Scalars['BigInt']>;
  noteAmountChange_gte?: InputMaybe<Scalars['BigInt']>;
  noteAmountChange_in?: InputMaybe<Array<Scalars['BigInt']>>;
  noteAmountChange_lt?: InputMaybe<Scalars['BigInt']>;
  noteAmountChange_lte?: InputMaybe<Scalars['BigInt']>;
  noteAmountChange_not?: InputMaybe<Scalars['BigInt']>;
  noteAmountChange_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  receiver?: InputMaybe<Scalars['Bytes']>;
  receiver_contains?: InputMaybe<Scalars['Bytes']>;
  receiver_in?: InputMaybe<Array<Scalars['Bytes']>>;
  receiver_not?: InputMaybe<Scalars['Bytes']>;
  receiver_not_contains?: InputMaybe<Scalars['Bytes']>;
  receiver_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  sNOTEAmountAfter?: InputMaybe<Scalars['BigInt']>;
  sNOTEAmountAfter_gt?: InputMaybe<Scalars['BigInt']>;
  sNOTEAmountAfter_gte?: InputMaybe<Scalars['BigInt']>;
  sNOTEAmountAfter_in?: InputMaybe<Array<Scalars['BigInt']>>;
  sNOTEAmountAfter_lt?: InputMaybe<Scalars['BigInt']>;
  sNOTEAmountAfter_lte?: InputMaybe<Scalars['BigInt']>;
  sNOTEAmountAfter_not?: InputMaybe<Scalars['BigInt']>;
  sNOTEAmountAfter_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  sNOTEAmountBefore?: InputMaybe<Scalars['BigInt']>;
  sNOTEAmountBefore_gt?: InputMaybe<Scalars['BigInt']>;
  sNOTEAmountBefore_gte?: InputMaybe<Scalars['BigInt']>;
  sNOTEAmountBefore_in?: InputMaybe<Array<Scalars['BigInt']>>;
  sNOTEAmountBefore_lt?: InputMaybe<Scalars['BigInt']>;
  sNOTEAmountBefore_lte?: InputMaybe<Scalars['BigInt']>;
  sNOTEAmountBefore_not?: InputMaybe<Scalars['BigInt']>;
  sNOTEAmountBefore_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  sNOTEChangeType?: InputMaybe<SNoteChangeType>;
  sNOTEChangeType_in?: InputMaybe<Array<SNoteChangeType>>;
  sNOTEChangeType_not?: InputMaybe<SNoteChangeType>;
  sNOTEChangeType_not_in?: InputMaybe<Array<SNoteChangeType>>;
  sender?: InputMaybe<Scalars['Bytes']>;
  sender_contains?: InputMaybe<Scalars['Bytes']>;
  sender_in?: InputMaybe<Array<Scalars['Bytes']>>;
  sender_not?: InputMaybe<Scalars['Bytes']>;
  sender_not_contains?: InputMaybe<Scalars['Bytes']>;
  sender_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  stakedNoteBalance?: InputMaybe<Scalars['String']>;
  stakedNoteBalance_?: InputMaybe<StakedNoteBalance_Filter>;
  stakedNoteBalance_contains?: InputMaybe<Scalars['String']>;
  stakedNoteBalance_contains_nocase?: InputMaybe<Scalars['String']>;
  stakedNoteBalance_ends_with?: InputMaybe<Scalars['String']>;
  stakedNoteBalance_ends_with_nocase?: InputMaybe<Scalars['String']>;
  stakedNoteBalance_gt?: InputMaybe<Scalars['String']>;
  stakedNoteBalance_gte?: InputMaybe<Scalars['String']>;
  stakedNoteBalance_in?: InputMaybe<Array<Scalars['String']>>;
  stakedNoteBalance_lt?: InputMaybe<Scalars['String']>;
  stakedNoteBalance_lte?: InputMaybe<Scalars['String']>;
  stakedNoteBalance_not?: InputMaybe<Scalars['String']>;
  stakedNoteBalance_not_contains?: InputMaybe<Scalars['String']>;
  stakedNoteBalance_not_contains_nocase?: InputMaybe<Scalars['String']>;
  stakedNoteBalance_not_ends_with?: InputMaybe<Scalars['String']>;
  stakedNoteBalance_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  stakedNoteBalance_not_in?: InputMaybe<Array<Scalars['String']>>;
  stakedNoteBalance_not_starts_with?: InputMaybe<Scalars['String']>;
  stakedNoteBalance_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  stakedNoteBalance_starts_with?: InputMaybe<Scalars['String']>;
  stakedNoteBalance_starts_with_nocase?: InputMaybe<Scalars['String']>;
  timestamp?: InputMaybe<Scalars['Int']>;
  timestamp_gt?: InputMaybe<Scalars['Int']>;
  timestamp_gte?: InputMaybe<Scalars['Int']>;
  timestamp_in?: InputMaybe<Array<Scalars['Int']>>;
  timestamp_lt?: InputMaybe<Scalars['Int']>;
  timestamp_lte?: InputMaybe<Scalars['Int']>;
  timestamp_not?: InputMaybe<Scalars['Int']>;
  timestamp_not_in?: InputMaybe<Array<Scalars['Int']>>;
  transactionHash?: InputMaybe<Scalars['Bytes']>;
  transactionHash_contains?: InputMaybe<Scalars['Bytes']>;
  transactionHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
  transactionHash_not?: InputMaybe<Scalars['Bytes']>;
  transactionHash_not_contains?: InputMaybe<Scalars['Bytes']>;
  transactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
};

export enum StakedNoteChange_OrderBy {
  Account = 'account',
  BlockHash = 'blockHash',
  BlockNumber = 'blockNumber',
  BptAmountChange = 'bptAmountChange',
  EthAmountChange = 'ethAmountChange',
  Id = 'id',
  NoteAmountChange = 'noteAmountChange',
  Receiver = 'receiver',
  SNoteAmountAfter = 'sNOTEAmountAfter',
  SNoteAmountBefore = 'sNOTEAmountBefore',
  SNoteChangeType = 'sNOTEChangeType',
  Sender = 'sender',
  StakedNoteBalance = 'stakedNoteBalance',
  Timestamp = 'timestamp',
  TransactionHash = 'transactionHash'
}

export type StakedNoteCoolDown = {
  __typename?: 'StakedNoteCoolDown';
  endedBlockHash?: Maybe<Scalars['Bytes']>;
  endedBlockNumber?: Maybe<Scalars['Int']>;
  endedTimestamp?: Maybe<Scalars['Int']>;
  endedTransactionHash?: Maybe<Scalars['Bytes']>;
  id: Scalars['ID'];
  redeemWindowBegin: Scalars['Int'];
  redeemWindowEnd: Scalars['Int'];
  stakedNoteBalance: StakedNoteBalance;
  startedBlockHash: Scalars['Bytes'];
  startedBlockNumber: Scalars['Int'];
  startedTimestamp: Scalars['Int'];
  startedTransactionHash: Scalars['Bytes'];
  userEndedCoolDown?: Maybe<Scalars['Boolean']>;
};

export type StakedNoteCoolDown_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  endedBlockHash?: InputMaybe<Scalars['Bytes']>;
  endedBlockHash_contains?: InputMaybe<Scalars['Bytes']>;
  endedBlockHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
  endedBlockHash_not?: InputMaybe<Scalars['Bytes']>;
  endedBlockHash_not_contains?: InputMaybe<Scalars['Bytes']>;
  endedBlockHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  endedBlockNumber?: InputMaybe<Scalars['Int']>;
  endedBlockNumber_gt?: InputMaybe<Scalars['Int']>;
  endedBlockNumber_gte?: InputMaybe<Scalars['Int']>;
  endedBlockNumber_in?: InputMaybe<Array<Scalars['Int']>>;
  endedBlockNumber_lt?: InputMaybe<Scalars['Int']>;
  endedBlockNumber_lte?: InputMaybe<Scalars['Int']>;
  endedBlockNumber_not?: InputMaybe<Scalars['Int']>;
  endedBlockNumber_not_in?: InputMaybe<Array<Scalars['Int']>>;
  endedTimestamp?: InputMaybe<Scalars['Int']>;
  endedTimestamp_gt?: InputMaybe<Scalars['Int']>;
  endedTimestamp_gte?: InputMaybe<Scalars['Int']>;
  endedTimestamp_in?: InputMaybe<Array<Scalars['Int']>>;
  endedTimestamp_lt?: InputMaybe<Scalars['Int']>;
  endedTimestamp_lte?: InputMaybe<Scalars['Int']>;
  endedTimestamp_not?: InputMaybe<Scalars['Int']>;
  endedTimestamp_not_in?: InputMaybe<Array<Scalars['Int']>>;
  endedTransactionHash?: InputMaybe<Scalars['Bytes']>;
  endedTransactionHash_contains?: InputMaybe<Scalars['Bytes']>;
  endedTransactionHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
  endedTransactionHash_not?: InputMaybe<Scalars['Bytes']>;
  endedTransactionHash_not_contains?: InputMaybe<Scalars['Bytes']>;
  endedTransactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  id?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  redeemWindowBegin?: InputMaybe<Scalars['Int']>;
  redeemWindowBegin_gt?: InputMaybe<Scalars['Int']>;
  redeemWindowBegin_gte?: InputMaybe<Scalars['Int']>;
  redeemWindowBegin_in?: InputMaybe<Array<Scalars['Int']>>;
  redeemWindowBegin_lt?: InputMaybe<Scalars['Int']>;
  redeemWindowBegin_lte?: InputMaybe<Scalars['Int']>;
  redeemWindowBegin_not?: InputMaybe<Scalars['Int']>;
  redeemWindowBegin_not_in?: InputMaybe<Array<Scalars['Int']>>;
  redeemWindowEnd?: InputMaybe<Scalars['Int']>;
  redeemWindowEnd_gt?: InputMaybe<Scalars['Int']>;
  redeemWindowEnd_gte?: InputMaybe<Scalars['Int']>;
  redeemWindowEnd_in?: InputMaybe<Array<Scalars['Int']>>;
  redeemWindowEnd_lt?: InputMaybe<Scalars['Int']>;
  redeemWindowEnd_lte?: InputMaybe<Scalars['Int']>;
  redeemWindowEnd_not?: InputMaybe<Scalars['Int']>;
  redeemWindowEnd_not_in?: InputMaybe<Array<Scalars['Int']>>;
  stakedNoteBalance?: InputMaybe<Scalars['String']>;
  stakedNoteBalance_?: InputMaybe<StakedNoteBalance_Filter>;
  stakedNoteBalance_contains?: InputMaybe<Scalars['String']>;
  stakedNoteBalance_contains_nocase?: InputMaybe<Scalars['String']>;
  stakedNoteBalance_ends_with?: InputMaybe<Scalars['String']>;
  stakedNoteBalance_ends_with_nocase?: InputMaybe<Scalars['String']>;
  stakedNoteBalance_gt?: InputMaybe<Scalars['String']>;
  stakedNoteBalance_gte?: InputMaybe<Scalars['String']>;
  stakedNoteBalance_in?: InputMaybe<Array<Scalars['String']>>;
  stakedNoteBalance_lt?: InputMaybe<Scalars['String']>;
  stakedNoteBalance_lte?: InputMaybe<Scalars['String']>;
  stakedNoteBalance_not?: InputMaybe<Scalars['String']>;
  stakedNoteBalance_not_contains?: InputMaybe<Scalars['String']>;
  stakedNoteBalance_not_contains_nocase?: InputMaybe<Scalars['String']>;
  stakedNoteBalance_not_ends_with?: InputMaybe<Scalars['String']>;
  stakedNoteBalance_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  stakedNoteBalance_not_in?: InputMaybe<Array<Scalars['String']>>;
  stakedNoteBalance_not_starts_with?: InputMaybe<Scalars['String']>;
  stakedNoteBalance_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  stakedNoteBalance_starts_with?: InputMaybe<Scalars['String']>;
  stakedNoteBalance_starts_with_nocase?: InputMaybe<Scalars['String']>;
  startedBlockHash?: InputMaybe<Scalars['Bytes']>;
  startedBlockHash_contains?: InputMaybe<Scalars['Bytes']>;
  startedBlockHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
  startedBlockHash_not?: InputMaybe<Scalars['Bytes']>;
  startedBlockHash_not_contains?: InputMaybe<Scalars['Bytes']>;
  startedBlockHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  startedBlockNumber?: InputMaybe<Scalars['Int']>;
  startedBlockNumber_gt?: InputMaybe<Scalars['Int']>;
  startedBlockNumber_gte?: InputMaybe<Scalars['Int']>;
  startedBlockNumber_in?: InputMaybe<Array<Scalars['Int']>>;
  startedBlockNumber_lt?: InputMaybe<Scalars['Int']>;
  startedBlockNumber_lte?: InputMaybe<Scalars['Int']>;
  startedBlockNumber_not?: InputMaybe<Scalars['Int']>;
  startedBlockNumber_not_in?: InputMaybe<Array<Scalars['Int']>>;
  startedTimestamp?: InputMaybe<Scalars['Int']>;
  startedTimestamp_gt?: InputMaybe<Scalars['Int']>;
  startedTimestamp_gte?: InputMaybe<Scalars['Int']>;
  startedTimestamp_in?: InputMaybe<Array<Scalars['Int']>>;
  startedTimestamp_lt?: InputMaybe<Scalars['Int']>;
  startedTimestamp_lte?: InputMaybe<Scalars['Int']>;
  startedTimestamp_not?: InputMaybe<Scalars['Int']>;
  startedTimestamp_not_in?: InputMaybe<Array<Scalars['Int']>>;
  startedTransactionHash?: InputMaybe<Scalars['Bytes']>;
  startedTransactionHash_contains?: InputMaybe<Scalars['Bytes']>;
  startedTransactionHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
  startedTransactionHash_not?: InputMaybe<Scalars['Bytes']>;
  startedTransactionHash_not_contains?: InputMaybe<Scalars['Bytes']>;
  startedTransactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  userEndedCoolDown?: InputMaybe<Scalars['Boolean']>;
  userEndedCoolDown_in?: InputMaybe<Array<Scalars['Boolean']>>;
  userEndedCoolDown_not?: InputMaybe<Scalars['Boolean']>;
  userEndedCoolDown_not_in?: InputMaybe<Array<Scalars['Boolean']>>;
};

export enum StakedNoteCoolDown_OrderBy {
  EndedBlockHash = 'endedBlockHash',
  EndedBlockNumber = 'endedBlockNumber',
  EndedTimestamp = 'endedTimestamp',
  EndedTransactionHash = 'endedTransactionHash',
  Id = 'id',
  RedeemWindowBegin = 'redeemWindowBegin',
  RedeemWindowEnd = 'redeemWindowEnd',
  StakedNoteBalance = 'stakedNoteBalance',
  StartedBlockHash = 'startedBlockHash',
  StartedBlockNumber = 'startedBlockNumber',
  StartedTimestamp = 'startedTimestamp',
  StartedTransactionHash = 'startedTransactionHash',
  UserEndedCoolDown = 'userEndedCoolDown'
}

export type StakedNoteInvestment = {
  __typename?: 'StakedNoteInvestment';
  blockHash: Scalars['Bytes'];
  blockNumber: Scalars['Int'];
  bptPerSNOTEAfter: Scalars['BigInt'];
  bptPerSNOTEBefore: Scalars['BigInt'];
  id: Scalars['ID'];
  /** The treasury manager who executed the investment */
  manager: TreasuryManager;
  timestamp: Scalars['Int'];
  totalETHInvested: Scalars['BigInt'];
  totalNOTEInvested: Scalars['BigInt'];
  totalSNOTESupply: Scalars['BigInt'];
  transactionHash: Scalars['Bytes'];
};

export type StakedNoteInvestment_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  blockHash?: InputMaybe<Scalars['Bytes']>;
  blockHash_contains?: InputMaybe<Scalars['Bytes']>;
  blockHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
  blockHash_not?: InputMaybe<Scalars['Bytes']>;
  blockHash_not_contains?: InputMaybe<Scalars['Bytes']>;
  blockHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  blockNumber?: InputMaybe<Scalars['Int']>;
  blockNumber_gt?: InputMaybe<Scalars['Int']>;
  blockNumber_gte?: InputMaybe<Scalars['Int']>;
  blockNumber_in?: InputMaybe<Array<Scalars['Int']>>;
  blockNumber_lt?: InputMaybe<Scalars['Int']>;
  blockNumber_lte?: InputMaybe<Scalars['Int']>;
  blockNumber_not?: InputMaybe<Scalars['Int']>;
  blockNumber_not_in?: InputMaybe<Array<Scalars['Int']>>;
  bptPerSNOTEAfter?: InputMaybe<Scalars['BigInt']>;
  bptPerSNOTEAfter_gt?: InputMaybe<Scalars['BigInt']>;
  bptPerSNOTEAfter_gte?: InputMaybe<Scalars['BigInt']>;
  bptPerSNOTEAfter_in?: InputMaybe<Array<Scalars['BigInt']>>;
  bptPerSNOTEAfter_lt?: InputMaybe<Scalars['BigInt']>;
  bptPerSNOTEAfter_lte?: InputMaybe<Scalars['BigInt']>;
  bptPerSNOTEAfter_not?: InputMaybe<Scalars['BigInt']>;
  bptPerSNOTEAfter_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  bptPerSNOTEBefore?: InputMaybe<Scalars['BigInt']>;
  bptPerSNOTEBefore_gt?: InputMaybe<Scalars['BigInt']>;
  bptPerSNOTEBefore_gte?: InputMaybe<Scalars['BigInt']>;
  bptPerSNOTEBefore_in?: InputMaybe<Array<Scalars['BigInt']>>;
  bptPerSNOTEBefore_lt?: InputMaybe<Scalars['BigInt']>;
  bptPerSNOTEBefore_lte?: InputMaybe<Scalars['BigInt']>;
  bptPerSNOTEBefore_not?: InputMaybe<Scalars['BigInt']>;
  bptPerSNOTEBefore_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  id?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  manager?: InputMaybe<Scalars['String']>;
  manager_?: InputMaybe<TreasuryManager_Filter>;
  manager_contains?: InputMaybe<Scalars['String']>;
  manager_contains_nocase?: InputMaybe<Scalars['String']>;
  manager_ends_with?: InputMaybe<Scalars['String']>;
  manager_ends_with_nocase?: InputMaybe<Scalars['String']>;
  manager_gt?: InputMaybe<Scalars['String']>;
  manager_gte?: InputMaybe<Scalars['String']>;
  manager_in?: InputMaybe<Array<Scalars['String']>>;
  manager_lt?: InputMaybe<Scalars['String']>;
  manager_lte?: InputMaybe<Scalars['String']>;
  manager_not?: InputMaybe<Scalars['String']>;
  manager_not_contains?: InputMaybe<Scalars['String']>;
  manager_not_contains_nocase?: InputMaybe<Scalars['String']>;
  manager_not_ends_with?: InputMaybe<Scalars['String']>;
  manager_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  manager_not_in?: InputMaybe<Array<Scalars['String']>>;
  manager_not_starts_with?: InputMaybe<Scalars['String']>;
  manager_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  manager_starts_with?: InputMaybe<Scalars['String']>;
  manager_starts_with_nocase?: InputMaybe<Scalars['String']>;
  timestamp?: InputMaybe<Scalars['Int']>;
  timestamp_gt?: InputMaybe<Scalars['Int']>;
  timestamp_gte?: InputMaybe<Scalars['Int']>;
  timestamp_in?: InputMaybe<Array<Scalars['Int']>>;
  timestamp_lt?: InputMaybe<Scalars['Int']>;
  timestamp_lte?: InputMaybe<Scalars['Int']>;
  timestamp_not?: InputMaybe<Scalars['Int']>;
  timestamp_not_in?: InputMaybe<Array<Scalars['Int']>>;
  totalETHInvested?: InputMaybe<Scalars['BigInt']>;
  totalETHInvested_gt?: InputMaybe<Scalars['BigInt']>;
  totalETHInvested_gte?: InputMaybe<Scalars['BigInt']>;
  totalETHInvested_in?: InputMaybe<Array<Scalars['BigInt']>>;
  totalETHInvested_lt?: InputMaybe<Scalars['BigInt']>;
  totalETHInvested_lte?: InputMaybe<Scalars['BigInt']>;
  totalETHInvested_not?: InputMaybe<Scalars['BigInt']>;
  totalETHInvested_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  totalNOTEInvested?: InputMaybe<Scalars['BigInt']>;
  totalNOTEInvested_gt?: InputMaybe<Scalars['BigInt']>;
  totalNOTEInvested_gte?: InputMaybe<Scalars['BigInt']>;
  totalNOTEInvested_in?: InputMaybe<Array<Scalars['BigInt']>>;
  totalNOTEInvested_lt?: InputMaybe<Scalars['BigInt']>;
  totalNOTEInvested_lte?: InputMaybe<Scalars['BigInt']>;
  totalNOTEInvested_not?: InputMaybe<Scalars['BigInt']>;
  totalNOTEInvested_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  totalSNOTESupply?: InputMaybe<Scalars['BigInt']>;
  totalSNOTESupply_gt?: InputMaybe<Scalars['BigInt']>;
  totalSNOTESupply_gte?: InputMaybe<Scalars['BigInt']>;
  totalSNOTESupply_in?: InputMaybe<Array<Scalars['BigInt']>>;
  totalSNOTESupply_lt?: InputMaybe<Scalars['BigInt']>;
  totalSNOTESupply_lte?: InputMaybe<Scalars['BigInt']>;
  totalSNOTESupply_not?: InputMaybe<Scalars['BigInt']>;
  totalSNOTESupply_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  transactionHash?: InputMaybe<Scalars['Bytes']>;
  transactionHash_contains?: InputMaybe<Scalars['Bytes']>;
  transactionHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
  transactionHash_not?: InputMaybe<Scalars['Bytes']>;
  transactionHash_not_contains?: InputMaybe<Scalars['Bytes']>;
  transactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
};

export enum StakedNoteInvestment_OrderBy {
  BlockHash = 'blockHash',
  BlockNumber = 'blockNumber',
  BptPerSnoteAfter = 'bptPerSNOTEAfter',
  BptPerSnoteBefore = 'bptPerSNOTEBefore',
  Id = 'id',
  Manager = 'manager',
  Timestamp = 'timestamp',
  TotalEthInvested = 'totalETHInvested',
  TotalNoteInvested = 'totalNOTEInvested',
  TotalSnoteSupply = 'totalSNOTESupply',
  TransactionHash = 'transactionHash'
}

export type StakedNotePool = {
  __typename?: 'StakedNotePool';
  bptPerSNOTE: Scalars['BigInt'];
  /** Staked NOTE address */
  id: Scalars['ID'];
  lastUpdateBlockHash: Scalars['Bytes'];
  lastUpdateBlockNumber: Scalars['Int'];
  lastUpdateTimestamp: Scalars['Int'];
  lastUpdateTransactionHash: Scalars['Bytes'];
  totalBPTTokens: Scalars['BigInt'];
  totalSupply: Scalars['BigInt'];
};

export type StakedNotePool_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  bptPerSNOTE?: InputMaybe<Scalars['BigInt']>;
  bptPerSNOTE_gt?: InputMaybe<Scalars['BigInt']>;
  bptPerSNOTE_gte?: InputMaybe<Scalars['BigInt']>;
  bptPerSNOTE_in?: InputMaybe<Array<Scalars['BigInt']>>;
  bptPerSNOTE_lt?: InputMaybe<Scalars['BigInt']>;
  bptPerSNOTE_lte?: InputMaybe<Scalars['BigInt']>;
  bptPerSNOTE_not?: InputMaybe<Scalars['BigInt']>;
  bptPerSNOTE_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  id?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  lastUpdateBlockHash?: InputMaybe<Scalars['Bytes']>;
  lastUpdateBlockHash_contains?: InputMaybe<Scalars['Bytes']>;
  lastUpdateBlockHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
  lastUpdateBlockHash_not?: InputMaybe<Scalars['Bytes']>;
  lastUpdateBlockHash_not_contains?: InputMaybe<Scalars['Bytes']>;
  lastUpdateBlockHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  lastUpdateBlockNumber?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_gt?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_gte?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_in?: InputMaybe<Array<Scalars['Int']>>;
  lastUpdateBlockNumber_lt?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_lte?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_not?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_not_in?: InputMaybe<Array<Scalars['Int']>>;
  lastUpdateTimestamp?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_gt?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_gte?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_in?: InputMaybe<Array<Scalars['Int']>>;
  lastUpdateTimestamp_lt?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_lte?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_not?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_not_in?: InputMaybe<Array<Scalars['Int']>>;
  lastUpdateTransactionHash?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_contains?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
  lastUpdateTransactionHash_not?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_not_contains?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  totalBPTTokens?: InputMaybe<Scalars['BigInt']>;
  totalBPTTokens_gt?: InputMaybe<Scalars['BigInt']>;
  totalBPTTokens_gte?: InputMaybe<Scalars['BigInt']>;
  totalBPTTokens_in?: InputMaybe<Array<Scalars['BigInt']>>;
  totalBPTTokens_lt?: InputMaybe<Scalars['BigInt']>;
  totalBPTTokens_lte?: InputMaybe<Scalars['BigInt']>;
  totalBPTTokens_not?: InputMaybe<Scalars['BigInt']>;
  totalBPTTokens_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  totalSupply?: InputMaybe<Scalars['BigInt']>;
  totalSupply_gt?: InputMaybe<Scalars['BigInt']>;
  totalSupply_gte?: InputMaybe<Scalars['BigInt']>;
  totalSupply_in?: InputMaybe<Array<Scalars['BigInt']>>;
  totalSupply_lt?: InputMaybe<Scalars['BigInt']>;
  totalSupply_lte?: InputMaybe<Scalars['BigInt']>;
  totalSupply_not?: InputMaybe<Scalars['BigInt']>;
  totalSupply_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
};

export enum StakedNotePool_OrderBy {
  BptPerSnote = 'bptPerSNOTE',
  Id = 'id',
  LastUpdateBlockHash = 'lastUpdateBlockHash',
  LastUpdateBlockNumber = 'lastUpdateBlockNumber',
  LastUpdateTimestamp = 'lastUpdateTimestamp',
  LastUpdateTransactionHash = 'lastUpdateTransactionHash',
  TotalBptTokens = 'totalBPTTokens',
  TotalSupply = 'totalSupply'
}

export type StakedNoteTvl = {
  __typename?: 'StakedNoteTvl';
  id: Scalars['ID'];
  /** Total BPT balance in the pool */
  poolBPTBalance: Scalars['BigInt'];
  /** Total ETH in the pool */
  poolETHBalance: Scalars['BigInt'];
  /** Total NOTE in the pool */
  poolNOTEBalance: Scalars['BigInt'];
  /** Total sNOTE in the pool */
  sNOTETotalSupply: Scalars['BigInt'];
  /** NOTE/ETH spot price of the pool */
  spotPrice: Scalars['BigInt'];
  timestamp: Scalars['Int'];
  totalPoolValueInETH: Scalars['BigInt'];
  /** Total pool value in each relevant denomination using historical spot prices */
  totalPoolValueInNOTE: Scalars['BigInt'];
};

export type StakedNoteTvl_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  id?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  poolBPTBalance?: InputMaybe<Scalars['BigInt']>;
  poolBPTBalance_gt?: InputMaybe<Scalars['BigInt']>;
  poolBPTBalance_gte?: InputMaybe<Scalars['BigInt']>;
  poolBPTBalance_in?: InputMaybe<Array<Scalars['BigInt']>>;
  poolBPTBalance_lt?: InputMaybe<Scalars['BigInt']>;
  poolBPTBalance_lte?: InputMaybe<Scalars['BigInt']>;
  poolBPTBalance_not?: InputMaybe<Scalars['BigInt']>;
  poolBPTBalance_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  poolETHBalance?: InputMaybe<Scalars['BigInt']>;
  poolETHBalance_gt?: InputMaybe<Scalars['BigInt']>;
  poolETHBalance_gte?: InputMaybe<Scalars['BigInt']>;
  poolETHBalance_in?: InputMaybe<Array<Scalars['BigInt']>>;
  poolETHBalance_lt?: InputMaybe<Scalars['BigInt']>;
  poolETHBalance_lte?: InputMaybe<Scalars['BigInt']>;
  poolETHBalance_not?: InputMaybe<Scalars['BigInt']>;
  poolETHBalance_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  poolNOTEBalance?: InputMaybe<Scalars['BigInt']>;
  poolNOTEBalance_gt?: InputMaybe<Scalars['BigInt']>;
  poolNOTEBalance_gte?: InputMaybe<Scalars['BigInt']>;
  poolNOTEBalance_in?: InputMaybe<Array<Scalars['BigInt']>>;
  poolNOTEBalance_lt?: InputMaybe<Scalars['BigInt']>;
  poolNOTEBalance_lte?: InputMaybe<Scalars['BigInt']>;
  poolNOTEBalance_not?: InputMaybe<Scalars['BigInt']>;
  poolNOTEBalance_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  sNOTETotalSupply?: InputMaybe<Scalars['BigInt']>;
  sNOTETotalSupply_gt?: InputMaybe<Scalars['BigInt']>;
  sNOTETotalSupply_gte?: InputMaybe<Scalars['BigInt']>;
  sNOTETotalSupply_in?: InputMaybe<Array<Scalars['BigInt']>>;
  sNOTETotalSupply_lt?: InputMaybe<Scalars['BigInt']>;
  sNOTETotalSupply_lte?: InputMaybe<Scalars['BigInt']>;
  sNOTETotalSupply_not?: InputMaybe<Scalars['BigInt']>;
  sNOTETotalSupply_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  spotPrice?: InputMaybe<Scalars['BigInt']>;
  spotPrice_gt?: InputMaybe<Scalars['BigInt']>;
  spotPrice_gte?: InputMaybe<Scalars['BigInt']>;
  spotPrice_in?: InputMaybe<Array<Scalars['BigInt']>>;
  spotPrice_lt?: InputMaybe<Scalars['BigInt']>;
  spotPrice_lte?: InputMaybe<Scalars['BigInt']>;
  spotPrice_not?: InputMaybe<Scalars['BigInt']>;
  spotPrice_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  timestamp?: InputMaybe<Scalars['Int']>;
  timestamp_gt?: InputMaybe<Scalars['Int']>;
  timestamp_gte?: InputMaybe<Scalars['Int']>;
  timestamp_in?: InputMaybe<Array<Scalars['Int']>>;
  timestamp_lt?: InputMaybe<Scalars['Int']>;
  timestamp_lte?: InputMaybe<Scalars['Int']>;
  timestamp_not?: InputMaybe<Scalars['Int']>;
  timestamp_not_in?: InputMaybe<Array<Scalars['Int']>>;
  totalPoolValueInETH?: InputMaybe<Scalars['BigInt']>;
  totalPoolValueInETH_gt?: InputMaybe<Scalars['BigInt']>;
  totalPoolValueInETH_gte?: InputMaybe<Scalars['BigInt']>;
  totalPoolValueInETH_in?: InputMaybe<Array<Scalars['BigInt']>>;
  totalPoolValueInETH_lt?: InputMaybe<Scalars['BigInt']>;
  totalPoolValueInETH_lte?: InputMaybe<Scalars['BigInt']>;
  totalPoolValueInETH_not?: InputMaybe<Scalars['BigInt']>;
  totalPoolValueInETH_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  totalPoolValueInNOTE?: InputMaybe<Scalars['BigInt']>;
  totalPoolValueInNOTE_gt?: InputMaybe<Scalars['BigInt']>;
  totalPoolValueInNOTE_gte?: InputMaybe<Scalars['BigInt']>;
  totalPoolValueInNOTE_in?: InputMaybe<Array<Scalars['BigInt']>>;
  totalPoolValueInNOTE_lt?: InputMaybe<Scalars['BigInt']>;
  totalPoolValueInNOTE_lte?: InputMaybe<Scalars['BigInt']>;
  totalPoolValueInNOTE_not?: InputMaybe<Scalars['BigInt']>;
  totalPoolValueInNOTE_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
};

export enum StakedNoteTvl_OrderBy {
  Id = 'id',
  PoolBptBalance = 'poolBPTBalance',
  PoolEthBalance = 'poolETHBalance',
  PoolNoteBalance = 'poolNOTEBalance',
  SNoteTotalSupply = 'sNOTETotalSupply',
  SpotPrice = 'spotPrice',
  Timestamp = 'timestamp',
  TotalPoolValueInEth = 'totalPoolValueInETH',
  TotalPoolValueInNote = 'totalPoolValueInNOTE'
}

export type Subscription = {
  __typename?: 'Subscription';
  /** Access to subgraph metadata */
  _meta?: Maybe<_Meta_>;
  account?: Maybe<Account>;
  accounts: Array<Account>;
  asset?: Maybe<Asset>;
  assetChange?: Maybe<AssetChange>;
  assetChanges: Array<AssetChange>;
  assetExchangeRate?: Maybe<AssetExchangeRate>;
  assetExchangeRateHistoricalData?: Maybe<AssetExchangeRateHistoricalData>;
  assetExchangeRateHistoricalDatas: Array<AssetExchangeRateHistoricalData>;
  assetExchangeRates: Array<AssetExchangeRate>;
  assetTransfer?: Maybe<AssetTransfer>;
  assetTransfers: Array<AssetTransfer>;
  assets: Array<Asset>;
  authorizedCallbackContract?: Maybe<AuthorizedCallbackContract>;
  authorizedCallbackContracts: Array<AuthorizedCallbackContract>;
  balance?: Maybe<Balance>;
  balanceChange?: Maybe<BalanceChange>;
  balanceChanges: Array<BalanceChange>;
  balances: Array<Balance>;
  cashGroup?: Maybe<CashGroup>;
  cashGroups: Array<CashGroup>;
  compbalance?: Maybe<CompBalance>;
  compbalances: Array<CompBalance>;
  currencies: Array<Currency>;
  currency?: Maybe<Currency>;
  currencyTvl?: Maybe<CurrencyTvl>;
  currencyTvls: Array<CurrencyTvl>;
  dailyLendBorrowVolume?: Maybe<DailyLendBorrowVolume>;
  dailyLendBorrowVolumes: Array<DailyLendBorrowVolume>;
  delegate?: Maybe<Delegate>;
  delegates: Array<Delegate>;
  ethExchangeRate?: Maybe<EthExchangeRate>;
  ethExchangeRateHistoricalData?: Maybe<EthExchangeRateHistoricalData>;
  ethExchangeRateHistoricalDatas: Array<EthExchangeRateHistoricalData>;
  ethExchangeRates: Array<EthExchangeRate>;
  globalTransferOperator?: Maybe<GlobalTransferOperator>;
  globalTransferOperators: Array<GlobalTransferOperator>;
  incentiveMigration?: Maybe<IncentiveMigration>;
  incentiveMigrations: Array<IncentiveMigration>;
  leveragedVault?: Maybe<LeveragedVault>;
  leveragedVaultAccount?: Maybe<LeveragedVaultAccount>;
  leveragedVaultAccounts: Array<LeveragedVaultAccount>;
  leveragedVaultCapacities: Array<LeveragedVaultCapacity>;
  leveragedVaultCapacity?: Maybe<LeveragedVaultCapacity>;
  leveragedVaultDirectories: Array<LeveragedVaultDirectory>;
  leveragedVaultDirectory?: Maybe<LeveragedVaultDirectory>;
  leveragedVaultHistoricalValue?: Maybe<LeveragedVaultHistoricalValue>;
  leveragedVaultHistoricalValues: Array<LeveragedVaultHistoricalValue>;
  leveragedVaultMaturities: Array<LeveragedVaultMaturity>;
  leveragedVaultMaturity?: Maybe<LeveragedVaultMaturity>;
  leveragedVaultMaturityEvent?: Maybe<LeveragedVaultMaturityEvent>;
  leveragedVaultMaturityEvents: Array<LeveragedVaultMaturityEvent>;
  leveragedVaultTrade?: Maybe<LeveragedVaultTrade>;
  leveragedVaultTrades: Array<LeveragedVaultTrade>;
  leveragedVaults: Array<LeveragedVault>;
  liquidation?: Maybe<Liquidation>;
  liquidations: Array<Liquidation>;
  market?: Maybe<Market>;
  marketHistoricalData?: Maybe<MarketHistoricalData>;
  marketHistoricalDatas: Array<MarketHistoricalData>;
  marketInitialization?: Maybe<MarketInitialization>;
  marketInitializations: Array<MarketInitialization>;
  markets: Array<Market>;
  nToken?: Maybe<NToken>;
  nTokenChange?: Maybe<NTokenChange>;
  nTokenChanges: Array<NTokenChange>;
  nTokens: Array<NToken>;
  noteBalance?: Maybe<NoteBalance>;
  noteBalanceChange?: Maybe<NoteBalanceChange>;
  noteBalanceChanges: Array<NoteBalanceChange>;
  noteBalances: Array<NoteBalance>;
  ntokenPresentValueHistoricalData?: Maybe<NTokenPresentValueHistoricalData>;
  ntokenPresentValueHistoricalDatas: Array<NTokenPresentValueHistoricalData>;
  proposal?: Maybe<Proposal>;
  proposalState?: Maybe<ProposalState>;
  proposalStates: Array<ProposalState>;
  proposals: Array<Proposal>;
  secondaryIncentiveRewarder?: Maybe<SecondaryIncentiveRewarder>;
  secondaryIncentiveRewarders: Array<SecondaryIncentiveRewarder>;
  settlementRate?: Maybe<SettlementRate>;
  settlementRates: Array<SettlementRate>;
  stakedNoteBalance?: Maybe<StakedNoteBalance>;
  stakedNoteBalances: Array<StakedNoteBalance>;
  stakedNoteChange?: Maybe<StakedNoteChange>;
  stakedNoteChanges: Array<StakedNoteChange>;
  stakedNoteCoolDown?: Maybe<StakedNoteCoolDown>;
  stakedNoteCoolDowns: Array<StakedNoteCoolDown>;
  stakedNoteInvestment?: Maybe<StakedNoteInvestment>;
  stakedNoteInvestments: Array<StakedNoteInvestment>;
  stakedNotePool?: Maybe<StakedNotePool>;
  stakedNotePools: Array<StakedNotePool>;
  stakedNoteTvl?: Maybe<StakedNoteTvl>;
  stakedNoteTvls: Array<StakedNoteTvl>;
  trade?: Maybe<Trade>;
  trades: Array<Trade>;
  treasuries: Array<Treasury>;
  treasury?: Maybe<Treasury>;
  treasuryManager?: Maybe<TreasuryManager>;
  treasuryManagerTradingLimit?: Maybe<TreasuryManagerTradingLimit>;
  treasuryManagerTradingLimits: Array<TreasuryManagerTradingLimit>;
  treasuryManagers: Array<TreasuryManager>;
  treasuryTokenTrade?: Maybe<TreasuryTokenTrade>;
  treasuryTokenTrades: Array<TreasuryTokenTrade>;
  tvlHistoricalData?: Maybe<TvlHistoricalData>;
  tvlHistoricalDatas: Array<TvlHistoricalData>;
  vote?: Maybe<Vote>;
  votes: Array<Vote>;
  votingPowerChange?: Maybe<VotingPowerChange>;
  votingPowerChanges: Array<VotingPowerChange>;
};


export type Subscription_MetaArgs = {
  block?: InputMaybe<Block_Height>;
};


export type SubscriptionAccountArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionAccountsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Account_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Account_Filter>;
};


export type SubscriptionAssetArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionAssetChangeArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionAssetChangesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<AssetChange_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<AssetChange_Filter>;
};


export type SubscriptionAssetExchangeRateArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionAssetExchangeRateHistoricalDataArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionAssetExchangeRateHistoricalDatasArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<AssetExchangeRateHistoricalData_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<AssetExchangeRateHistoricalData_Filter>;
};


export type SubscriptionAssetExchangeRatesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<AssetExchangeRate_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<AssetExchangeRate_Filter>;
};


export type SubscriptionAssetTransferArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionAssetTransfersArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<AssetTransfer_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<AssetTransfer_Filter>;
};


export type SubscriptionAssetsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Asset_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Asset_Filter>;
};


export type SubscriptionAuthorizedCallbackContractArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionAuthorizedCallbackContractsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<AuthorizedCallbackContract_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<AuthorizedCallbackContract_Filter>;
};


export type SubscriptionBalanceArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionBalanceChangeArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionBalanceChangesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<BalanceChange_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<BalanceChange_Filter>;
};


export type SubscriptionBalancesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Balance_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Balance_Filter>;
};


export type SubscriptionCashGroupArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionCashGroupsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<CashGroup_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<CashGroup_Filter>;
};


export type SubscriptionCompbalanceArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionCompbalancesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<CompBalance_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<CompBalance_Filter>;
};


export type SubscriptionCurrenciesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Currency_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Currency_Filter>;
};


export type SubscriptionCurrencyArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionCurrencyTvlArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionCurrencyTvlsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<CurrencyTvl_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<CurrencyTvl_Filter>;
};


export type SubscriptionDailyLendBorrowVolumeArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionDailyLendBorrowVolumesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<DailyLendBorrowVolume_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<DailyLendBorrowVolume_Filter>;
};


export type SubscriptionDelegateArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionDelegatesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Delegate_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Delegate_Filter>;
};


export type SubscriptionEthExchangeRateArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionEthExchangeRateHistoricalDataArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionEthExchangeRateHistoricalDatasArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<EthExchangeRateHistoricalData_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<EthExchangeRateHistoricalData_Filter>;
};


export type SubscriptionEthExchangeRatesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<EthExchangeRate_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<EthExchangeRate_Filter>;
};


export type SubscriptionGlobalTransferOperatorArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionGlobalTransferOperatorsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<GlobalTransferOperator_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<GlobalTransferOperator_Filter>;
};


export type SubscriptionIncentiveMigrationArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionIncentiveMigrationsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<IncentiveMigration_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<IncentiveMigration_Filter>;
};


export type SubscriptionLeveragedVaultArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionLeveragedVaultAccountArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionLeveragedVaultAccountsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<LeveragedVaultAccount_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<LeveragedVaultAccount_Filter>;
};


export type SubscriptionLeveragedVaultCapacitiesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<LeveragedVaultCapacity_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<LeveragedVaultCapacity_Filter>;
};


export type SubscriptionLeveragedVaultCapacityArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionLeveragedVaultDirectoriesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<LeveragedVaultDirectory_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<LeveragedVaultDirectory_Filter>;
};


export type SubscriptionLeveragedVaultDirectoryArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionLeveragedVaultHistoricalValueArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionLeveragedVaultHistoricalValuesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<LeveragedVaultHistoricalValue_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<LeveragedVaultHistoricalValue_Filter>;
};


export type SubscriptionLeveragedVaultMaturitiesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<LeveragedVaultMaturity_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<LeveragedVaultMaturity_Filter>;
};


export type SubscriptionLeveragedVaultMaturityArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionLeveragedVaultMaturityEventArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionLeveragedVaultMaturityEventsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<LeveragedVaultMaturityEvent_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<LeveragedVaultMaturityEvent_Filter>;
};


export type SubscriptionLeveragedVaultTradeArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionLeveragedVaultTradesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<LeveragedVaultTrade_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<LeveragedVaultTrade_Filter>;
};


export type SubscriptionLeveragedVaultsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<LeveragedVault_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<LeveragedVault_Filter>;
};


export type SubscriptionLiquidationArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionLiquidationsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Liquidation_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Liquidation_Filter>;
};


export type SubscriptionMarketArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionMarketHistoricalDataArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionMarketHistoricalDatasArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<MarketHistoricalData_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<MarketHistoricalData_Filter>;
};


export type SubscriptionMarketInitializationArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionMarketInitializationsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<MarketInitialization_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<MarketInitialization_Filter>;
};


export type SubscriptionMarketsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Market_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Market_Filter>;
};


export type SubscriptionNTokenArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionNTokenChangeArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionNTokenChangesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<NTokenChange_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<NTokenChange_Filter>;
};


export type SubscriptionNTokensArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<NToken_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<NToken_Filter>;
};


export type SubscriptionNoteBalanceArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionNoteBalanceChangeArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionNoteBalanceChangesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<NoteBalanceChange_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<NoteBalanceChange_Filter>;
};


export type SubscriptionNoteBalancesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<NoteBalance_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<NoteBalance_Filter>;
};


export type SubscriptionNtokenPresentValueHistoricalDataArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionNtokenPresentValueHistoricalDatasArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<NTokenPresentValueHistoricalData_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<NTokenPresentValueHistoricalData_Filter>;
};


export type SubscriptionProposalArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionProposalStateArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionProposalStatesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<ProposalState_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<ProposalState_Filter>;
};


export type SubscriptionProposalsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Proposal_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Proposal_Filter>;
};


export type SubscriptionSecondaryIncentiveRewarderArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionSecondaryIncentiveRewardersArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<SecondaryIncentiveRewarder_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<SecondaryIncentiveRewarder_Filter>;
};


export type SubscriptionSettlementRateArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionSettlementRatesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<SettlementRate_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<SettlementRate_Filter>;
};


export type SubscriptionStakedNoteBalanceArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionStakedNoteBalancesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<StakedNoteBalance_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<StakedNoteBalance_Filter>;
};


export type SubscriptionStakedNoteChangeArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionStakedNoteChangesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<StakedNoteChange_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<StakedNoteChange_Filter>;
};


export type SubscriptionStakedNoteCoolDownArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionStakedNoteCoolDownsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<StakedNoteCoolDown_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<StakedNoteCoolDown_Filter>;
};


export type SubscriptionStakedNoteInvestmentArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionStakedNoteInvestmentsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<StakedNoteInvestment_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<StakedNoteInvestment_Filter>;
};


export type SubscriptionStakedNotePoolArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionStakedNotePoolsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<StakedNotePool_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<StakedNotePool_Filter>;
};


export type SubscriptionStakedNoteTvlArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionStakedNoteTvlsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<StakedNoteTvl_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<StakedNoteTvl_Filter>;
};


export type SubscriptionTradeArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionTradesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Trade_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Trade_Filter>;
};


export type SubscriptionTreasuriesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Treasury_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Treasury_Filter>;
};


export type SubscriptionTreasuryArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionTreasuryManagerArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionTreasuryManagerTradingLimitArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionTreasuryManagerTradingLimitsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<TreasuryManagerTradingLimit_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<TreasuryManagerTradingLimit_Filter>;
};


export type SubscriptionTreasuryManagersArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<TreasuryManager_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<TreasuryManager_Filter>;
};


export type SubscriptionTreasuryTokenTradeArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionTreasuryTokenTradesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<TreasuryTokenTrade_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<TreasuryTokenTrade_Filter>;
};


export type SubscriptionTvlHistoricalDataArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionTvlHistoricalDatasArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<TvlHistoricalData_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<TvlHistoricalData_Filter>;
};


export type SubscriptionVoteArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionVotesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<Vote_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Vote_Filter>;
};


export type SubscriptionVotingPowerChangeArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type SubscriptionVotingPowerChangesArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<VotingPowerChange_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<VotingPowerChange_Filter>;
};

export enum TokenType {
  /** The one and only Ether */
  Ether = 'Ether',
  /** A token that cannot be minted as a cToken, but can be used as collateral or traded */
  NonMintable = 'NonMintable',
  /** Token that is the base for a cToken or other mintable token */
  UnderlyingToken = 'UnderlyingToken',
  /** Ether specific Compound interest bearing token */
  CEth = 'cETH',
  /** Compound interest bearing token */
  CToken = 'cToken'
}

export type Trade = {
  __typename?: 'Trade';
  account: Account;
  blockHash: Scalars['Bytes'];
  blockNumber: Scalars['Int'];
  currency: Currency;
  /** Currency ID:Account:Transaction hash:logIndex:batchIndex */
  id: Scalars['ID'];
  market?: Maybe<Market>;
  maturity: Scalars['BigInt'];
  netAssetCash: Scalars['BigInt'];
  netLiquidityTokens?: Maybe<Scalars['BigInt']>;
  netUnderlyingCash: Scalars['BigInt'];
  netfCash: Scalars['BigInt'];
  timestamp: Scalars['Int'];
  tradeType: TradeType;
  transactionHash: Scalars['Bytes'];
  transactionOrigin: Scalars['Bytes'];
  transferOperator?: Maybe<Scalars['Bytes']>;
};

export enum TradeType {
  AddLiquidity = 'AddLiquidity',
  Borrow = 'Borrow',
  Lend = 'Lend',
  PurchaseNTokenResidual = 'PurchaseNTokenResidual',
  RemoveLiquidity = 'RemoveLiquidity',
  SettleCashDebt = 'SettleCashDebt',
  Transfer = 'Transfer'
}

export type Trade_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  account?: InputMaybe<Scalars['String']>;
  account_?: InputMaybe<Account_Filter>;
  account_contains?: InputMaybe<Scalars['String']>;
  account_contains_nocase?: InputMaybe<Scalars['String']>;
  account_ends_with?: InputMaybe<Scalars['String']>;
  account_ends_with_nocase?: InputMaybe<Scalars['String']>;
  account_gt?: InputMaybe<Scalars['String']>;
  account_gte?: InputMaybe<Scalars['String']>;
  account_in?: InputMaybe<Array<Scalars['String']>>;
  account_lt?: InputMaybe<Scalars['String']>;
  account_lte?: InputMaybe<Scalars['String']>;
  account_not?: InputMaybe<Scalars['String']>;
  account_not_contains?: InputMaybe<Scalars['String']>;
  account_not_contains_nocase?: InputMaybe<Scalars['String']>;
  account_not_ends_with?: InputMaybe<Scalars['String']>;
  account_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  account_not_in?: InputMaybe<Array<Scalars['String']>>;
  account_not_starts_with?: InputMaybe<Scalars['String']>;
  account_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  account_starts_with?: InputMaybe<Scalars['String']>;
  account_starts_with_nocase?: InputMaybe<Scalars['String']>;
  blockHash?: InputMaybe<Scalars['Bytes']>;
  blockHash_contains?: InputMaybe<Scalars['Bytes']>;
  blockHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
  blockHash_not?: InputMaybe<Scalars['Bytes']>;
  blockHash_not_contains?: InputMaybe<Scalars['Bytes']>;
  blockHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  blockNumber?: InputMaybe<Scalars['Int']>;
  blockNumber_gt?: InputMaybe<Scalars['Int']>;
  blockNumber_gte?: InputMaybe<Scalars['Int']>;
  blockNumber_in?: InputMaybe<Array<Scalars['Int']>>;
  blockNumber_lt?: InputMaybe<Scalars['Int']>;
  blockNumber_lte?: InputMaybe<Scalars['Int']>;
  blockNumber_not?: InputMaybe<Scalars['Int']>;
  blockNumber_not_in?: InputMaybe<Array<Scalars['Int']>>;
  currency?: InputMaybe<Scalars['String']>;
  currency_?: InputMaybe<Currency_Filter>;
  currency_contains?: InputMaybe<Scalars['String']>;
  currency_contains_nocase?: InputMaybe<Scalars['String']>;
  currency_ends_with?: InputMaybe<Scalars['String']>;
  currency_ends_with_nocase?: InputMaybe<Scalars['String']>;
  currency_gt?: InputMaybe<Scalars['String']>;
  currency_gte?: InputMaybe<Scalars['String']>;
  currency_in?: InputMaybe<Array<Scalars['String']>>;
  currency_lt?: InputMaybe<Scalars['String']>;
  currency_lte?: InputMaybe<Scalars['String']>;
  currency_not?: InputMaybe<Scalars['String']>;
  currency_not_contains?: InputMaybe<Scalars['String']>;
  currency_not_contains_nocase?: InputMaybe<Scalars['String']>;
  currency_not_ends_with?: InputMaybe<Scalars['String']>;
  currency_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  currency_not_in?: InputMaybe<Array<Scalars['String']>>;
  currency_not_starts_with?: InputMaybe<Scalars['String']>;
  currency_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  currency_starts_with?: InputMaybe<Scalars['String']>;
  currency_starts_with_nocase?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  market?: InputMaybe<Scalars['String']>;
  market_?: InputMaybe<Market_Filter>;
  market_contains?: InputMaybe<Scalars['String']>;
  market_contains_nocase?: InputMaybe<Scalars['String']>;
  market_ends_with?: InputMaybe<Scalars['String']>;
  market_ends_with_nocase?: InputMaybe<Scalars['String']>;
  market_gt?: InputMaybe<Scalars['String']>;
  market_gte?: InputMaybe<Scalars['String']>;
  market_in?: InputMaybe<Array<Scalars['String']>>;
  market_lt?: InputMaybe<Scalars['String']>;
  market_lte?: InputMaybe<Scalars['String']>;
  market_not?: InputMaybe<Scalars['String']>;
  market_not_contains?: InputMaybe<Scalars['String']>;
  market_not_contains_nocase?: InputMaybe<Scalars['String']>;
  market_not_ends_with?: InputMaybe<Scalars['String']>;
  market_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  market_not_in?: InputMaybe<Array<Scalars['String']>>;
  market_not_starts_with?: InputMaybe<Scalars['String']>;
  market_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  market_starts_with?: InputMaybe<Scalars['String']>;
  market_starts_with_nocase?: InputMaybe<Scalars['String']>;
  maturity?: InputMaybe<Scalars['BigInt']>;
  maturity_gt?: InputMaybe<Scalars['BigInt']>;
  maturity_gte?: InputMaybe<Scalars['BigInt']>;
  maturity_in?: InputMaybe<Array<Scalars['BigInt']>>;
  maturity_lt?: InputMaybe<Scalars['BigInt']>;
  maturity_lte?: InputMaybe<Scalars['BigInt']>;
  maturity_not?: InputMaybe<Scalars['BigInt']>;
  maturity_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  netAssetCash?: InputMaybe<Scalars['BigInt']>;
  netAssetCash_gt?: InputMaybe<Scalars['BigInt']>;
  netAssetCash_gte?: InputMaybe<Scalars['BigInt']>;
  netAssetCash_in?: InputMaybe<Array<Scalars['BigInt']>>;
  netAssetCash_lt?: InputMaybe<Scalars['BigInt']>;
  netAssetCash_lte?: InputMaybe<Scalars['BigInt']>;
  netAssetCash_not?: InputMaybe<Scalars['BigInt']>;
  netAssetCash_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  netLiquidityTokens?: InputMaybe<Scalars['BigInt']>;
  netLiquidityTokens_gt?: InputMaybe<Scalars['BigInt']>;
  netLiquidityTokens_gte?: InputMaybe<Scalars['BigInt']>;
  netLiquidityTokens_in?: InputMaybe<Array<Scalars['BigInt']>>;
  netLiquidityTokens_lt?: InputMaybe<Scalars['BigInt']>;
  netLiquidityTokens_lte?: InputMaybe<Scalars['BigInt']>;
  netLiquidityTokens_not?: InputMaybe<Scalars['BigInt']>;
  netLiquidityTokens_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  netUnderlyingCash?: InputMaybe<Scalars['BigInt']>;
  netUnderlyingCash_gt?: InputMaybe<Scalars['BigInt']>;
  netUnderlyingCash_gte?: InputMaybe<Scalars['BigInt']>;
  netUnderlyingCash_in?: InputMaybe<Array<Scalars['BigInt']>>;
  netUnderlyingCash_lt?: InputMaybe<Scalars['BigInt']>;
  netUnderlyingCash_lte?: InputMaybe<Scalars['BigInt']>;
  netUnderlyingCash_not?: InputMaybe<Scalars['BigInt']>;
  netUnderlyingCash_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  netfCash?: InputMaybe<Scalars['BigInt']>;
  netfCash_gt?: InputMaybe<Scalars['BigInt']>;
  netfCash_gte?: InputMaybe<Scalars['BigInt']>;
  netfCash_in?: InputMaybe<Array<Scalars['BigInt']>>;
  netfCash_lt?: InputMaybe<Scalars['BigInt']>;
  netfCash_lte?: InputMaybe<Scalars['BigInt']>;
  netfCash_not?: InputMaybe<Scalars['BigInt']>;
  netfCash_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  timestamp?: InputMaybe<Scalars['Int']>;
  timestamp_gt?: InputMaybe<Scalars['Int']>;
  timestamp_gte?: InputMaybe<Scalars['Int']>;
  timestamp_in?: InputMaybe<Array<Scalars['Int']>>;
  timestamp_lt?: InputMaybe<Scalars['Int']>;
  timestamp_lte?: InputMaybe<Scalars['Int']>;
  timestamp_not?: InputMaybe<Scalars['Int']>;
  timestamp_not_in?: InputMaybe<Array<Scalars['Int']>>;
  tradeType?: InputMaybe<TradeType>;
  tradeType_in?: InputMaybe<Array<TradeType>>;
  tradeType_not?: InputMaybe<TradeType>;
  tradeType_not_in?: InputMaybe<Array<TradeType>>;
  transactionHash?: InputMaybe<Scalars['Bytes']>;
  transactionHash_contains?: InputMaybe<Scalars['Bytes']>;
  transactionHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
  transactionHash_not?: InputMaybe<Scalars['Bytes']>;
  transactionHash_not_contains?: InputMaybe<Scalars['Bytes']>;
  transactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  transactionOrigin?: InputMaybe<Scalars['Bytes']>;
  transactionOrigin_contains?: InputMaybe<Scalars['Bytes']>;
  transactionOrigin_in?: InputMaybe<Array<Scalars['Bytes']>>;
  transactionOrigin_not?: InputMaybe<Scalars['Bytes']>;
  transactionOrigin_not_contains?: InputMaybe<Scalars['Bytes']>;
  transactionOrigin_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  transferOperator?: InputMaybe<Scalars['Bytes']>;
  transferOperator_contains?: InputMaybe<Scalars['Bytes']>;
  transferOperator_in?: InputMaybe<Array<Scalars['Bytes']>>;
  transferOperator_not?: InputMaybe<Scalars['Bytes']>;
  transferOperator_not_contains?: InputMaybe<Scalars['Bytes']>;
  transferOperator_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
};

export enum Trade_OrderBy {
  Account = 'account',
  BlockHash = 'blockHash',
  BlockNumber = 'blockNumber',
  Currency = 'currency',
  Id = 'id',
  Market = 'market',
  Maturity = 'maturity',
  NetAssetCash = 'netAssetCash',
  NetLiquidityTokens = 'netLiquidityTokens',
  NetUnderlyingCash = 'netUnderlyingCash',
  NetfCash = 'netfCash',
  Timestamp = 'timestamp',
  TradeType = 'tradeType',
  TransactionHash = 'transactionHash',
  TransactionOrigin = 'transactionOrigin',
  TransferOperator = 'transferOperator'
}

export type Treasury = {
  __typename?: 'Treasury';
  NOTEPurchaseLimit?: Maybe<Scalars['BigInt']>;
  activeManager?: Maybe<TreasuryManager>;
  contractAddress: Scalars['Bytes'];
  /** ID hardcoded to zero */
  id: Scalars['ID'];
  investmentCoolDownInSeconds?: Maybe<Scalars['BigInt']>;
  lastUpdateBlockHash: Scalars['Bytes'];
  lastUpdateBlockNumber: Scalars['Int'];
  lastUpdateTimestamp: Scalars['Int'];
  lastUpdateTransactionHash: Scalars['Bytes'];
  /** A list of all treasury managers */
  managers?: Maybe<Array<TreasuryManager>>;
  tradingLimits?: Maybe<Array<TreasuryManagerTradingLimit>>;
};


export type TreasuryManagersArgs = {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<TreasuryManager_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<TreasuryManager_Filter>;
};


export type TreasuryTradingLimitsArgs = {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<TreasuryManagerTradingLimit_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<TreasuryManagerTradingLimit_Filter>;
};

export type TreasuryManager = {
  __typename?: 'TreasuryManager';
  endedBlockHash: Scalars['Bytes'];
  endedBlockNumber: Scalars['Int'];
  endedTimestamp: Scalars['Int'];
  endedTransactionHash: Scalars['Bytes'];
  /** ID is the manager's ethereum address */
  id: Scalars['ID'];
  /** Set to true for the manager who is currently active */
  isActiveManager: Scalars['Boolean'];
  sNOTEInvestments?: Maybe<Array<StakedNoteInvestment>>;
  startedBlockHash: Scalars['Bytes'];
  startedBlockNumber: Scalars['Int'];
  startedTimestamp: Scalars['Int'];
  startedTransactionHash: Scalars['Bytes'];
  tokenTrades?: Maybe<Array<TreasuryTokenTrade>>;
  treasury: Treasury;
};


export type TreasuryManagerSNoteInvestmentsArgs = {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<StakedNoteInvestment_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<StakedNoteInvestment_Filter>;
};


export type TreasuryManagerTokenTradesArgs = {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<TreasuryTokenTrade_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<TreasuryTokenTrade_Filter>;
};

export type TreasuryManagerTradingLimit = {
  __typename?: 'TreasuryManagerTradingLimit';
  /** ID is the token address */
  id: Scalars['ID'];
  lastUpdateBlockHash: Scalars['Bytes'];
  lastUpdateBlockNumber: Scalars['Int'];
  lastUpdateTimestamp: Scalars['Int'];
  lastUpdateTransactionHash: Scalars['Bytes'];
  name: Scalars['String'];
  oracle?: Maybe<Scalars['Bytes']>;
  slippageLimit?: Maybe<Scalars['BigInt']>;
  symbol: Scalars['String'];
  tokenAddress: Scalars['Bytes'];
  treasury: Treasury;
};

export type TreasuryManagerTradingLimit_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  id?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  lastUpdateBlockHash?: InputMaybe<Scalars['Bytes']>;
  lastUpdateBlockHash_contains?: InputMaybe<Scalars['Bytes']>;
  lastUpdateBlockHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
  lastUpdateBlockHash_not?: InputMaybe<Scalars['Bytes']>;
  lastUpdateBlockHash_not_contains?: InputMaybe<Scalars['Bytes']>;
  lastUpdateBlockHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  lastUpdateBlockNumber?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_gt?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_gte?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_in?: InputMaybe<Array<Scalars['Int']>>;
  lastUpdateBlockNumber_lt?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_lte?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_not?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_not_in?: InputMaybe<Array<Scalars['Int']>>;
  lastUpdateTimestamp?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_gt?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_gte?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_in?: InputMaybe<Array<Scalars['Int']>>;
  lastUpdateTimestamp_lt?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_lte?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_not?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_not_in?: InputMaybe<Array<Scalars['Int']>>;
  lastUpdateTransactionHash?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_contains?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
  lastUpdateTransactionHash_not?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_not_contains?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  name?: InputMaybe<Scalars['String']>;
  name_contains?: InputMaybe<Scalars['String']>;
  name_contains_nocase?: InputMaybe<Scalars['String']>;
  name_ends_with?: InputMaybe<Scalars['String']>;
  name_ends_with_nocase?: InputMaybe<Scalars['String']>;
  name_gt?: InputMaybe<Scalars['String']>;
  name_gte?: InputMaybe<Scalars['String']>;
  name_in?: InputMaybe<Array<Scalars['String']>>;
  name_lt?: InputMaybe<Scalars['String']>;
  name_lte?: InputMaybe<Scalars['String']>;
  name_not?: InputMaybe<Scalars['String']>;
  name_not_contains?: InputMaybe<Scalars['String']>;
  name_not_contains_nocase?: InputMaybe<Scalars['String']>;
  name_not_ends_with?: InputMaybe<Scalars['String']>;
  name_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  name_not_in?: InputMaybe<Array<Scalars['String']>>;
  name_not_starts_with?: InputMaybe<Scalars['String']>;
  name_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  name_starts_with?: InputMaybe<Scalars['String']>;
  name_starts_with_nocase?: InputMaybe<Scalars['String']>;
  oracle?: InputMaybe<Scalars['Bytes']>;
  oracle_contains?: InputMaybe<Scalars['Bytes']>;
  oracle_in?: InputMaybe<Array<Scalars['Bytes']>>;
  oracle_not?: InputMaybe<Scalars['Bytes']>;
  oracle_not_contains?: InputMaybe<Scalars['Bytes']>;
  oracle_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  slippageLimit?: InputMaybe<Scalars['BigInt']>;
  slippageLimit_gt?: InputMaybe<Scalars['BigInt']>;
  slippageLimit_gte?: InputMaybe<Scalars['BigInt']>;
  slippageLimit_in?: InputMaybe<Array<Scalars['BigInt']>>;
  slippageLimit_lt?: InputMaybe<Scalars['BigInt']>;
  slippageLimit_lte?: InputMaybe<Scalars['BigInt']>;
  slippageLimit_not?: InputMaybe<Scalars['BigInt']>;
  slippageLimit_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  symbol?: InputMaybe<Scalars['String']>;
  symbol_contains?: InputMaybe<Scalars['String']>;
  symbol_contains_nocase?: InputMaybe<Scalars['String']>;
  symbol_ends_with?: InputMaybe<Scalars['String']>;
  symbol_ends_with_nocase?: InputMaybe<Scalars['String']>;
  symbol_gt?: InputMaybe<Scalars['String']>;
  symbol_gte?: InputMaybe<Scalars['String']>;
  symbol_in?: InputMaybe<Array<Scalars['String']>>;
  symbol_lt?: InputMaybe<Scalars['String']>;
  symbol_lte?: InputMaybe<Scalars['String']>;
  symbol_not?: InputMaybe<Scalars['String']>;
  symbol_not_contains?: InputMaybe<Scalars['String']>;
  symbol_not_contains_nocase?: InputMaybe<Scalars['String']>;
  symbol_not_ends_with?: InputMaybe<Scalars['String']>;
  symbol_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  symbol_not_in?: InputMaybe<Array<Scalars['String']>>;
  symbol_not_starts_with?: InputMaybe<Scalars['String']>;
  symbol_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  symbol_starts_with?: InputMaybe<Scalars['String']>;
  symbol_starts_with_nocase?: InputMaybe<Scalars['String']>;
  tokenAddress?: InputMaybe<Scalars['Bytes']>;
  tokenAddress_contains?: InputMaybe<Scalars['Bytes']>;
  tokenAddress_in?: InputMaybe<Array<Scalars['Bytes']>>;
  tokenAddress_not?: InputMaybe<Scalars['Bytes']>;
  tokenAddress_not_contains?: InputMaybe<Scalars['Bytes']>;
  tokenAddress_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  treasury?: InputMaybe<Scalars['String']>;
  treasury_?: InputMaybe<Treasury_Filter>;
  treasury_contains?: InputMaybe<Scalars['String']>;
  treasury_contains_nocase?: InputMaybe<Scalars['String']>;
  treasury_ends_with?: InputMaybe<Scalars['String']>;
  treasury_ends_with_nocase?: InputMaybe<Scalars['String']>;
  treasury_gt?: InputMaybe<Scalars['String']>;
  treasury_gte?: InputMaybe<Scalars['String']>;
  treasury_in?: InputMaybe<Array<Scalars['String']>>;
  treasury_lt?: InputMaybe<Scalars['String']>;
  treasury_lte?: InputMaybe<Scalars['String']>;
  treasury_not?: InputMaybe<Scalars['String']>;
  treasury_not_contains?: InputMaybe<Scalars['String']>;
  treasury_not_contains_nocase?: InputMaybe<Scalars['String']>;
  treasury_not_ends_with?: InputMaybe<Scalars['String']>;
  treasury_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  treasury_not_in?: InputMaybe<Array<Scalars['String']>>;
  treasury_not_starts_with?: InputMaybe<Scalars['String']>;
  treasury_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  treasury_starts_with?: InputMaybe<Scalars['String']>;
  treasury_starts_with_nocase?: InputMaybe<Scalars['String']>;
};

export enum TreasuryManagerTradingLimit_OrderBy {
  Id = 'id',
  LastUpdateBlockHash = 'lastUpdateBlockHash',
  LastUpdateBlockNumber = 'lastUpdateBlockNumber',
  LastUpdateTimestamp = 'lastUpdateTimestamp',
  LastUpdateTransactionHash = 'lastUpdateTransactionHash',
  Name = 'name',
  Oracle = 'oracle',
  SlippageLimit = 'slippageLimit',
  Symbol = 'symbol',
  TokenAddress = 'tokenAddress',
  Treasury = 'treasury'
}

export type TreasuryManager_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  endedBlockHash?: InputMaybe<Scalars['Bytes']>;
  endedBlockHash_contains?: InputMaybe<Scalars['Bytes']>;
  endedBlockHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
  endedBlockHash_not?: InputMaybe<Scalars['Bytes']>;
  endedBlockHash_not_contains?: InputMaybe<Scalars['Bytes']>;
  endedBlockHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  endedBlockNumber?: InputMaybe<Scalars['Int']>;
  endedBlockNumber_gt?: InputMaybe<Scalars['Int']>;
  endedBlockNumber_gte?: InputMaybe<Scalars['Int']>;
  endedBlockNumber_in?: InputMaybe<Array<Scalars['Int']>>;
  endedBlockNumber_lt?: InputMaybe<Scalars['Int']>;
  endedBlockNumber_lte?: InputMaybe<Scalars['Int']>;
  endedBlockNumber_not?: InputMaybe<Scalars['Int']>;
  endedBlockNumber_not_in?: InputMaybe<Array<Scalars['Int']>>;
  endedTimestamp?: InputMaybe<Scalars['Int']>;
  endedTimestamp_gt?: InputMaybe<Scalars['Int']>;
  endedTimestamp_gte?: InputMaybe<Scalars['Int']>;
  endedTimestamp_in?: InputMaybe<Array<Scalars['Int']>>;
  endedTimestamp_lt?: InputMaybe<Scalars['Int']>;
  endedTimestamp_lte?: InputMaybe<Scalars['Int']>;
  endedTimestamp_not?: InputMaybe<Scalars['Int']>;
  endedTimestamp_not_in?: InputMaybe<Array<Scalars['Int']>>;
  endedTransactionHash?: InputMaybe<Scalars['Bytes']>;
  endedTransactionHash_contains?: InputMaybe<Scalars['Bytes']>;
  endedTransactionHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
  endedTransactionHash_not?: InputMaybe<Scalars['Bytes']>;
  endedTransactionHash_not_contains?: InputMaybe<Scalars['Bytes']>;
  endedTransactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  id?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  isActiveManager?: InputMaybe<Scalars['Boolean']>;
  isActiveManager_in?: InputMaybe<Array<Scalars['Boolean']>>;
  isActiveManager_not?: InputMaybe<Scalars['Boolean']>;
  isActiveManager_not_in?: InputMaybe<Array<Scalars['Boolean']>>;
  sNOTEInvestments_?: InputMaybe<StakedNoteInvestment_Filter>;
  startedBlockHash?: InputMaybe<Scalars['Bytes']>;
  startedBlockHash_contains?: InputMaybe<Scalars['Bytes']>;
  startedBlockHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
  startedBlockHash_not?: InputMaybe<Scalars['Bytes']>;
  startedBlockHash_not_contains?: InputMaybe<Scalars['Bytes']>;
  startedBlockHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  startedBlockNumber?: InputMaybe<Scalars['Int']>;
  startedBlockNumber_gt?: InputMaybe<Scalars['Int']>;
  startedBlockNumber_gte?: InputMaybe<Scalars['Int']>;
  startedBlockNumber_in?: InputMaybe<Array<Scalars['Int']>>;
  startedBlockNumber_lt?: InputMaybe<Scalars['Int']>;
  startedBlockNumber_lte?: InputMaybe<Scalars['Int']>;
  startedBlockNumber_not?: InputMaybe<Scalars['Int']>;
  startedBlockNumber_not_in?: InputMaybe<Array<Scalars['Int']>>;
  startedTimestamp?: InputMaybe<Scalars['Int']>;
  startedTimestamp_gt?: InputMaybe<Scalars['Int']>;
  startedTimestamp_gte?: InputMaybe<Scalars['Int']>;
  startedTimestamp_in?: InputMaybe<Array<Scalars['Int']>>;
  startedTimestamp_lt?: InputMaybe<Scalars['Int']>;
  startedTimestamp_lte?: InputMaybe<Scalars['Int']>;
  startedTimestamp_not?: InputMaybe<Scalars['Int']>;
  startedTimestamp_not_in?: InputMaybe<Array<Scalars['Int']>>;
  startedTransactionHash?: InputMaybe<Scalars['Bytes']>;
  startedTransactionHash_contains?: InputMaybe<Scalars['Bytes']>;
  startedTransactionHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
  startedTransactionHash_not?: InputMaybe<Scalars['Bytes']>;
  startedTransactionHash_not_contains?: InputMaybe<Scalars['Bytes']>;
  startedTransactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  tokenTrades_?: InputMaybe<TreasuryTokenTrade_Filter>;
  treasury?: InputMaybe<Scalars['String']>;
  treasury_?: InputMaybe<Treasury_Filter>;
  treasury_contains?: InputMaybe<Scalars['String']>;
  treasury_contains_nocase?: InputMaybe<Scalars['String']>;
  treasury_ends_with?: InputMaybe<Scalars['String']>;
  treasury_ends_with_nocase?: InputMaybe<Scalars['String']>;
  treasury_gt?: InputMaybe<Scalars['String']>;
  treasury_gte?: InputMaybe<Scalars['String']>;
  treasury_in?: InputMaybe<Array<Scalars['String']>>;
  treasury_lt?: InputMaybe<Scalars['String']>;
  treasury_lte?: InputMaybe<Scalars['String']>;
  treasury_not?: InputMaybe<Scalars['String']>;
  treasury_not_contains?: InputMaybe<Scalars['String']>;
  treasury_not_contains_nocase?: InputMaybe<Scalars['String']>;
  treasury_not_ends_with?: InputMaybe<Scalars['String']>;
  treasury_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  treasury_not_in?: InputMaybe<Array<Scalars['String']>>;
  treasury_not_starts_with?: InputMaybe<Scalars['String']>;
  treasury_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  treasury_starts_with?: InputMaybe<Scalars['String']>;
  treasury_starts_with_nocase?: InputMaybe<Scalars['String']>;
};

export enum TreasuryManager_OrderBy {
  EndedBlockHash = 'endedBlockHash',
  EndedBlockNumber = 'endedBlockNumber',
  EndedTimestamp = 'endedTimestamp',
  EndedTransactionHash = 'endedTransactionHash',
  Id = 'id',
  IsActiveManager = 'isActiveManager',
  SNoteInvestments = 'sNOTEInvestments',
  StartedBlockHash = 'startedBlockHash',
  StartedBlockNumber = 'startedBlockNumber',
  StartedTimestamp = 'startedTimestamp',
  StartedTransactionHash = 'startedTransactionHash',
  TokenTrades = 'tokenTrades',
  Treasury = 'treasury'
}

export type TreasuryTokenTrade = {
  __typename?: 'TreasuryTokenTrade';
  blockHash: Scalars['Bytes'];
  blockNumber: Scalars['Int'];
  /** ID is the 0x order hash */
  id: Scalars['ID'];
  /** Token that the treasury sold */
  makerAsset: TreasuryManagerTradingLimit;
  makerAssetFilledAmount: Scalars['BigInt'];
  manager: TreasuryManager;
  oracleDecimals?: Maybe<Scalars['Int']>;
  oraclePrice?: Maybe<Scalars['BigInt']>;
  /** Taker that filled the order */
  takerAddress: Scalars['Bytes'];
  /** Token that the taker sent back to the treasury */
  takerAsset: Scalars['Bytes'];
  takerAssetDecimals?: Maybe<Scalars['Int']>;
  takerAssetFilledAmount: Scalars['BigInt'];
  takerAssetName?: Maybe<Scalars['String']>;
  takerAssetSymbol?: Maybe<Scalars['String']>;
  timestamp: Scalars['Int'];
  transactionHash: Scalars['Bytes'];
};

export type TreasuryTokenTrade_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  blockHash?: InputMaybe<Scalars['Bytes']>;
  blockHash_contains?: InputMaybe<Scalars['Bytes']>;
  blockHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
  blockHash_not?: InputMaybe<Scalars['Bytes']>;
  blockHash_not_contains?: InputMaybe<Scalars['Bytes']>;
  blockHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  blockNumber?: InputMaybe<Scalars['Int']>;
  blockNumber_gt?: InputMaybe<Scalars['Int']>;
  blockNumber_gte?: InputMaybe<Scalars['Int']>;
  blockNumber_in?: InputMaybe<Array<Scalars['Int']>>;
  blockNumber_lt?: InputMaybe<Scalars['Int']>;
  blockNumber_lte?: InputMaybe<Scalars['Int']>;
  blockNumber_not?: InputMaybe<Scalars['Int']>;
  blockNumber_not_in?: InputMaybe<Array<Scalars['Int']>>;
  id?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  makerAsset?: InputMaybe<Scalars['String']>;
  makerAssetFilledAmount?: InputMaybe<Scalars['BigInt']>;
  makerAssetFilledAmount_gt?: InputMaybe<Scalars['BigInt']>;
  makerAssetFilledAmount_gte?: InputMaybe<Scalars['BigInt']>;
  makerAssetFilledAmount_in?: InputMaybe<Array<Scalars['BigInt']>>;
  makerAssetFilledAmount_lt?: InputMaybe<Scalars['BigInt']>;
  makerAssetFilledAmount_lte?: InputMaybe<Scalars['BigInt']>;
  makerAssetFilledAmount_not?: InputMaybe<Scalars['BigInt']>;
  makerAssetFilledAmount_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  makerAsset_?: InputMaybe<TreasuryManagerTradingLimit_Filter>;
  makerAsset_contains?: InputMaybe<Scalars['String']>;
  makerAsset_contains_nocase?: InputMaybe<Scalars['String']>;
  makerAsset_ends_with?: InputMaybe<Scalars['String']>;
  makerAsset_ends_with_nocase?: InputMaybe<Scalars['String']>;
  makerAsset_gt?: InputMaybe<Scalars['String']>;
  makerAsset_gte?: InputMaybe<Scalars['String']>;
  makerAsset_in?: InputMaybe<Array<Scalars['String']>>;
  makerAsset_lt?: InputMaybe<Scalars['String']>;
  makerAsset_lte?: InputMaybe<Scalars['String']>;
  makerAsset_not?: InputMaybe<Scalars['String']>;
  makerAsset_not_contains?: InputMaybe<Scalars['String']>;
  makerAsset_not_contains_nocase?: InputMaybe<Scalars['String']>;
  makerAsset_not_ends_with?: InputMaybe<Scalars['String']>;
  makerAsset_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  makerAsset_not_in?: InputMaybe<Array<Scalars['String']>>;
  makerAsset_not_starts_with?: InputMaybe<Scalars['String']>;
  makerAsset_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  makerAsset_starts_with?: InputMaybe<Scalars['String']>;
  makerAsset_starts_with_nocase?: InputMaybe<Scalars['String']>;
  manager?: InputMaybe<Scalars['String']>;
  manager_?: InputMaybe<TreasuryManager_Filter>;
  manager_contains?: InputMaybe<Scalars['String']>;
  manager_contains_nocase?: InputMaybe<Scalars['String']>;
  manager_ends_with?: InputMaybe<Scalars['String']>;
  manager_ends_with_nocase?: InputMaybe<Scalars['String']>;
  manager_gt?: InputMaybe<Scalars['String']>;
  manager_gte?: InputMaybe<Scalars['String']>;
  manager_in?: InputMaybe<Array<Scalars['String']>>;
  manager_lt?: InputMaybe<Scalars['String']>;
  manager_lte?: InputMaybe<Scalars['String']>;
  manager_not?: InputMaybe<Scalars['String']>;
  manager_not_contains?: InputMaybe<Scalars['String']>;
  manager_not_contains_nocase?: InputMaybe<Scalars['String']>;
  manager_not_ends_with?: InputMaybe<Scalars['String']>;
  manager_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  manager_not_in?: InputMaybe<Array<Scalars['String']>>;
  manager_not_starts_with?: InputMaybe<Scalars['String']>;
  manager_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  manager_starts_with?: InputMaybe<Scalars['String']>;
  manager_starts_with_nocase?: InputMaybe<Scalars['String']>;
  oracleDecimals?: InputMaybe<Scalars['Int']>;
  oracleDecimals_gt?: InputMaybe<Scalars['Int']>;
  oracleDecimals_gte?: InputMaybe<Scalars['Int']>;
  oracleDecimals_in?: InputMaybe<Array<Scalars['Int']>>;
  oracleDecimals_lt?: InputMaybe<Scalars['Int']>;
  oracleDecimals_lte?: InputMaybe<Scalars['Int']>;
  oracleDecimals_not?: InputMaybe<Scalars['Int']>;
  oracleDecimals_not_in?: InputMaybe<Array<Scalars['Int']>>;
  oraclePrice?: InputMaybe<Scalars['BigInt']>;
  oraclePrice_gt?: InputMaybe<Scalars['BigInt']>;
  oraclePrice_gte?: InputMaybe<Scalars['BigInt']>;
  oraclePrice_in?: InputMaybe<Array<Scalars['BigInt']>>;
  oraclePrice_lt?: InputMaybe<Scalars['BigInt']>;
  oraclePrice_lte?: InputMaybe<Scalars['BigInt']>;
  oraclePrice_not?: InputMaybe<Scalars['BigInt']>;
  oraclePrice_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  takerAddress?: InputMaybe<Scalars['Bytes']>;
  takerAddress_contains?: InputMaybe<Scalars['Bytes']>;
  takerAddress_in?: InputMaybe<Array<Scalars['Bytes']>>;
  takerAddress_not?: InputMaybe<Scalars['Bytes']>;
  takerAddress_not_contains?: InputMaybe<Scalars['Bytes']>;
  takerAddress_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  takerAsset?: InputMaybe<Scalars['Bytes']>;
  takerAssetDecimals?: InputMaybe<Scalars['Int']>;
  takerAssetDecimals_gt?: InputMaybe<Scalars['Int']>;
  takerAssetDecimals_gte?: InputMaybe<Scalars['Int']>;
  takerAssetDecimals_in?: InputMaybe<Array<Scalars['Int']>>;
  takerAssetDecimals_lt?: InputMaybe<Scalars['Int']>;
  takerAssetDecimals_lte?: InputMaybe<Scalars['Int']>;
  takerAssetDecimals_not?: InputMaybe<Scalars['Int']>;
  takerAssetDecimals_not_in?: InputMaybe<Array<Scalars['Int']>>;
  takerAssetFilledAmount?: InputMaybe<Scalars['BigInt']>;
  takerAssetFilledAmount_gt?: InputMaybe<Scalars['BigInt']>;
  takerAssetFilledAmount_gte?: InputMaybe<Scalars['BigInt']>;
  takerAssetFilledAmount_in?: InputMaybe<Array<Scalars['BigInt']>>;
  takerAssetFilledAmount_lt?: InputMaybe<Scalars['BigInt']>;
  takerAssetFilledAmount_lte?: InputMaybe<Scalars['BigInt']>;
  takerAssetFilledAmount_not?: InputMaybe<Scalars['BigInt']>;
  takerAssetFilledAmount_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  takerAssetName?: InputMaybe<Scalars['String']>;
  takerAssetName_contains?: InputMaybe<Scalars['String']>;
  takerAssetName_contains_nocase?: InputMaybe<Scalars['String']>;
  takerAssetName_ends_with?: InputMaybe<Scalars['String']>;
  takerAssetName_ends_with_nocase?: InputMaybe<Scalars['String']>;
  takerAssetName_gt?: InputMaybe<Scalars['String']>;
  takerAssetName_gte?: InputMaybe<Scalars['String']>;
  takerAssetName_in?: InputMaybe<Array<Scalars['String']>>;
  takerAssetName_lt?: InputMaybe<Scalars['String']>;
  takerAssetName_lte?: InputMaybe<Scalars['String']>;
  takerAssetName_not?: InputMaybe<Scalars['String']>;
  takerAssetName_not_contains?: InputMaybe<Scalars['String']>;
  takerAssetName_not_contains_nocase?: InputMaybe<Scalars['String']>;
  takerAssetName_not_ends_with?: InputMaybe<Scalars['String']>;
  takerAssetName_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  takerAssetName_not_in?: InputMaybe<Array<Scalars['String']>>;
  takerAssetName_not_starts_with?: InputMaybe<Scalars['String']>;
  takerAssetName_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  takerAssetName_starts_with?: InputMaybe<Scalars['String']>;
  takerAssetName_starts_with_nocase?: InputMaybe<Scalars['String']>;
  takerAssetSymbol?: InputMaybe<Scalars['String']>;
  takerAssetSymbol_contains?: InputMaybe<Scalars['String']>;
  takerAssetSymbol_contains_nocase?: InputMaybe<Scalars['String']>;
  takerAssetSymbol_ends_with?: InputMaybe<Scalars['String']>;
  takerAssetSymbol_ends_with_nocase?: InputMaybe<Scalars['String']>;
  takerAssetSymbol_gt?: InputMaybe<Scalars['String']>;
  takerAssetSymbol_gte?: InputMaybe<Scalars['String']>;
  takerAssetSymbol_in?: InputMaybe<Array<Scalars['String']>>;
  takerAssetSymbol_lt?: InputMaybe<Scalars['String']>;
  takerAssetSymbol_lte?: InputMaybe<Scalars['String']>;
  takerAssetSymbol_not?: InputMaybe<Scalars['String']>;
  takerAssetSymbol_not_contains?: InputMaybe<Scalars['String']>;
  takerAssetSymbol_not_contains_nocase?: InputMaybe<Scalars['String']>;
  takerAssetSymbol_not_ends_with?: InputMaybe<Scalars['String']>;
  takerAssetSymbol_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  takerAssetSymbol_not_in?: InputMaybe<Array<Scalars['String']>>;
  takerAssetSymbol_not_starts_with?: InputMaybe<Scalars['String']>;
  takerAssetSymbol_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  takerAssetSymbol_starts_with?: InputMaybe<Scalars['String']>;
  takerAssetSymbol_starts_with_nocase?: InputMaybe<Scalars['String']>;
  takerAsset_contains?: InputMaybe<Scalars['Bytes']>;
  takerAsset_in?: InputMaybe<Array<Scalars['Bytes']>>;
  takerAsset_not?: InputMaybe<Scalars['Bytes']>;
  takerAsset_not_contains?: InputMaybe<Scalars['Bytes']>;
  takerAsset_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  timestamp?: InputMaybe<Scalars['Int']>;
  timestamp_gt?: InputMaybe<Scalars['Int']>;
  timestamp_gte?: InputMaybe<Scalars['Int']>;
  timestamp_in?: InputMaybe<Array<Scalars['Int']>>;
  timestamp_lt?: InputMaybe<Scalars['Int']>;
  timestamp_lte?: InputMaybe<Scalars['Int']>;
  timestamp_not?: InputMaybe<Scalars['Int']>;
  timestamp_not_in?: InputMaybe<Array<Scalars['Int']>>;
  transactionHash?: InputMaybe<Scalars['Bytes']>;
  transactionHash_contains?: InputMaybe<Scalars['Bytes']>;
  transactionHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
  transactionHash_not?: InputMaybe<Scalars['Bytes']>;
  transactionHash_not_contains?: InputMaybe<Scalars['Bytes']>;
  transactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
};

export enum TreasuryTokenTrade_OrderBy {
  BlockHash = 'blockHash',
  BlockNumber = 'blockNumber',
  Id = 'id',
  MakerAsset = 'makerAsset',
  MakerAssetFilledAmount = 'makerAssetFilledAmount',
  Manager = 'manager',
  OracleDecimals = 'oracleDecimals',
  OraclePrice = 'oraclePrice',
  TakerAddress = 'takerAddress',
  TakerAsset = 'takerAsset',
  TakerAssetDecimals = 'takerAssetDecimals',
  TakerAssetFilledAmount = 'takerAssetFilledAmount',
  TakerAssetName = 'takerAssetName',
  TakerAssetSymbol = 'takerAssetSymbol',
  Timestamp = 'timestamp',
  TransactionHash = 'transactionHash'
}

export type Treasury_Filter = {
  NOTEPurchaseLimit?: InputMaybe<Scalars['BigInt']>;
  NOTEPurchaseLimit_gt?: InputMaybe<Scalars['BigInt']>;
  NOTEPurchaseLimit_gte?: InputMaybe<Scalars['BigInt']>;
  NOTEPurchaseLimit_in?: InputMaybe<Array<Scalars['BigInt']>>;
  NOTEPurchaseLimit_lt?: InputMaybe<Scalars['BigInt']>;
  NOTEPurchaseLimit_lte?: InputMaybe<Scalars['BigInt']>;
  NOTEPurchaseLimit_not?: InputMaybe<Scalars['BigInt']>;
  NOTEPurchaseLimit_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  activeManager?: InputMaybe<Scalars['String']>;
  activeManager_?: InputMaybe<TreasuryManager_Filter>;
  activeManager_contains?: InputMaybe<Scalars['String']>;
  activeManager_contains_nocase?: InputMaybe<Scalars['String']>;
  activeManager_ends_with?: InputMaybe<Scalars['String']>;
  activeManager_ends_with_nocase?: InputMaybe<Scalars['String']>;
  activeManager_gt?: InputMaybe<Scalars['String']>;
  activeManager_gte?: InputMaybe<Scalars['String']>;
  activeManager_in?: InputMaybe<Array<Scalars['String']>>;
  activeManager_lt?: InputMaybe<Scalars['String']>;
  activeManager_lte?: InputMaybe<Scalars['String']>;
  activeManager_not?: InputMaybe<Scalars['String']>;
  activeManager_not_contains?: InputMaybe<Scalars['String']>;
  activeManager_not_contains_nocase?: InputMaybe<Scalars['String']>;
  activeManager_not_ends_with?: InputMaybe<Scalars['String']>;
  activeManager_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  activeManager_not_in?: InputMaybe<Array<Scalars['String']>>;
  activeManager_not_starts_with?: InputMaybe<Scalars['String']>;
  activeManager_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  activeManager_starts_with?: InputMaybe<Scalars['String']>;
  activeManager_starts_with_nocase?: InputMaybe<Scalars['String']>;
  contractAddress?: InputMaybe<Scalars['Bytes']>;
  contractAddress_contains?: InputMaybe<Scalars['Bytes']>;
  contractAddress_in?: InputMaybe<Array<Scalars['Bytes']>>;
  contractAddress_not?: InputMaybe<Scalars['Bytes']>;
  contractAddress_not_contains?: InputMaybe<Scalars['Bytes']>;
  contractAddress_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  id?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  investmentCoolDownInSeconds?: InputMaybe<Scalars['BigInt']>;
  investmentCoolDownInSeconds_gt?: InputMaybe<Scalars['BigInt']>;
  investmentCoolDownInSeconds_gte?: InputMaybe<Scalars['BigInt']>;
  investmentCoolDownInSeconds_in?: InputMaybe<Array<Scalars['BigInt']>>;
  investmentCoolDownInSeconds_lt?: InputMaybe<Scalars['BigInt']>;
  investmentCoolDownInSeconds_lte?: InputMaybe<Scalars['BigInt']>;
  investmentCoolDownInSeconds_not?: InputMaybe<Scalars['BigInt']>;
  investmentCoolDownInSeconds_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  lastUpdateBlockHash?: InputMaybe<Scalars['Bytes']>;
  lastUpdateBlockHash_contains?: InputMaybe<Scalars['Bytes']>;
  lastUpdateBlockHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
  lastUpdateBlockHash_not?: InputMaybe<Scalars['Bytes']>;
  lastUpdateBlockHash_not_contains?: InputMaybe<Scalars['Bytes']>;
  lastUpdateBlockHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  lastUpdateBlockNumber?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_gt?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_gte?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_in?: InputMaybe<Array<Scalars['Int']>>;
  lastUpdateBlockNumber_lt?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_lte?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_not?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_not_in?: InputMaybe<Array<Scalars['Int']>>;
  lastUpdateTimestamp?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_gt?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_gte?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_in?: InputMaybe<Array<Scalars['Int']>>;
  lastUpdateTimestamp_lt?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_lte?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_not?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_not_in?: InputMaybe<Array<Scalars['Int']>>;
  lastUpdateTransactionHash?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_contains?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
  lastUpdateTransactionHash_not?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_not_contains?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  managers_?: InputMaybe<TreasuryManager_Filter>;
  tradingLimits_?: InputMaybe<TreasuryManagerTradingLimit_Filter>;
};

export enum Treasury_OrderBy {
  NotePurchaseLimit = 'NOTEPurchaseLimit',
  ActiveManager = 'activeManager',
  ContractAddress = 'contractAddress',
  Id = 'id',
  InvestmentCoolDownInSeconds = 'investmentCoolDownInSeconds',
  LastUpdateBlockHash = 'lastUpdateBlockHash',
  LastUpdateBlockNumber = 'lastUpdateBlockNumber',
  LastUpdateTimestamp = 'lastUpdateTimestamp',
  LastUpdateTransactionHash = 'lastUpdateTransactionHash',
  Managers = 'managers',
  TradingLimits = 'tradingLimits'
}

export type TvlHistoricalData = {
  __typename?: 'TvlHistoricalData';
  compBalance?: Maybe<CompBalance>;
  id: Scalars['ID'];
  perCurrencyTvl?: Maybe<Array<CurrencyTvl>>;
  sNOTETvl?: Maybe<StakedNoteTvl>;
  timestamp: Scalars['Int'];
  usdTotal?: Maybe<Scalars['BigInt']>;
};


export type TvlHistoricalDataPerCurrencyTvlArgs = {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<CurrencyTvl_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<CurrencyTvl_Filter>;
};

export type TvlHistoricalData_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  compBalance?: InputMaybe<Scalars['String']>;
  compBalance_?: InputMaybe<CompBalance_Filter>;
  compBalance_contains?: InputMaybe<Scalars['String']>;
  compBalance_contains_nocase?: InputMaybe<Scalars['String']>;
  compBalance_ends_with?: InputMaybe<Scalars['String']>;
  compBalance_ends_with_nocase?: InputMaybe<Scalars['String']>;
  compBalance_gt?: InputMaybe<Scalars['String']>;
  compBalance_gte?: InputMaybe<Scalars['String']>;
  compBalance_in?: InputMaybe<Array<Scalars['String']>>;
  compBalance_lt?: InputMaybe<Scalars['String']>;
  compBalance_lte?: InputMaybe<Scalars['String']>;
  compBalance_not?: InputMaybe<Scalars['String']>;
  compBalance_not_contains?: InputMaybe<Scalars['String']>;
  compBalance_not_contains_nocase?: InputMaybe<Scalars['String']>;
  compBalance_not_ends_with?: InputMaybe<Scalars['String']>;
  compBalance_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  compBalance_not_in?: InputMaybe<Array<Scalars['String']>>;
  compBalance_not_starts_with?: InputMaybe<Scalars['String']>;
  compBalance_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  compBalance_starts_with?: InputMaybe<Scalars['String']>;
  compBalance_starts_with_nocase?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  perCurrencyTvl?: InputMaybe<Array<Scalars['String']>>;
  perCurrencyTvl_?: InputMaybe<CurrencyTvl_Filter>;
  perCurrencyTvl_contains?: InputMaybe<Array<Scalars['String']>>;
  perCurrencyTvl_contains_nocase?: InputMaybe<Array<Scalars['String']>>;
  perCurrencyTvl_not?: InputMaybe<Array<Scalars['String']>>;
  perCurrencyTvl_not_contains?: InputMaybe<Array<Scalars['String']>>;
  perCurrencyTvl_not_contains_nocase?: InputMaybe<Array<Scalars['String']>>;
  sNOTETvl?: InputMaybe<Scalars['String']>;
  sNOTETvl_?: InputMaybe<StakedNoteTvl_Filter>;
  sNOTETvl_contains?: InputMaybe<Scalars['String']>;
  sNOTETvl_contains_nocase?: InputMaybe<Scalars['String']>;
  sNOTETvl_ends_with?: InputMaybe<Scalars['String']>;
  sNOTETvl_ends_with_nocase?: InputMaybe<Scalars['String']>;
  sNOTETvl_gt?: InputMaybe<Scalars['String']>;
  sNOTETvl_gte?: InputMaybe<Scalars['String']>;
  sNOTETvl_in?: InputMaybe<Array<Scalars['String']>>;
  sNOTETvl_lt?: InputMaybe<Scalars['String']>;
  sNOTETvl_lte?: InputMaybe<Scalars['String']>;
  sNOTETvl_not?: InputMaybe<Scalars['String']>;
  sNOTETvl_not_contains?: InputMaybe<Scalars['String']>;
  sNOTETvl_not_contains_nocase?: InputMaybe<Scalars['String']>;
  sNOTETvl_not_ends_with?: InputMaybe<Scalars['String']>;
  sNOTETvl_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  sNOTETvl_not_in?: InputMaybe<Array<Scalars['String']>>;
  sNOTETvl_not_starts_with?: InputMaybe<Scalars['String']>;
  sNOTETvl_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  sNOTETvl_starts_with?: InputMaybe<Scalars['String']>;
  sNOTETvl_starts_with_nocase?: InputMaybe<Scalars['String']>;
  timestamp?: InputMaybe<Scalars['Int']>;
  timestamp_gt?: InputMaybe<Scalars['Int']>;
  timestamp_gte?: InputMaybe<Scalars['Int']>;
  timestamp_in?: InputMaybe<Array<Scalars['Int']>>;
  timestamp_lt?: InputMaybe<Scalars['Int']>;
  timestamp_lte?: InputMaybe<Scalars['Int']>;
  timestamp_not?: InputMaybe<Scalars['Int']>;
  timestamp_not_in?: InputMaybe<Array<Scalars['Int']>>;
  usdTotal?: InputMaybe<Scalars['BigInt']>;
  usdTotal_gt?: InputMaybe<Scalars['BigInt']>;
  usdTotal_gte?: InputMaybe<Scalars['BigInt']>;
  usdTotal_in?: InputMaybe<Array<Scalars['BigInt']>>;
  usdTotal_lt?: InputMaybe<Scalars['BigInt']>;
  usdTotal_lte?: InputMaybe<Scalars['BigInt']>;
  usdTotal_not?: InputMaybe<Scalars['BigInt']>;
  usdTotal_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
};

export enum TvlHistoricalData_OrderBy {
  CompBalance = 'compBalance',
  Id = 'id',
  PerCurrencyTvl = 'perCurrencyTvl',
  SNoteTvl = 'sNOTETvl',
  Timestamp = 'timestamp',
  UsdTotal = 'usdTotal'
}

export enum VaultTradeType {
  DeleverageAccount = 'DeleverageAccount',
  EnterPosition = 'EnterPosition',
  ExitPostMaturity = 'ExitPostMaturity',
  ExitPreMaturity = 'ExitPreMaturity',
  RollPosition = 'RollPosition',
  TransferFromDeleverage = 'TransferFromDeleverage',
  VaultMintStrategyToken = 'VaultMintStrategyToken',
  VaultRedeemStrategyToken = 'VaultRedeemStrategyToken'
}

export type Vote = {
  __typename?: 'Vote';
  delegate: Delegate;
  /** Address and proposal combined as the unique identifier */
  id: Scalars['ID'];
  lastUpdateBlockHash: Scalars['Bytes'];
  lastUpdateBlockNumber: Scalars['Int'];
  lastUpdateTimestamp: Scalars['Int'];
  lastUpdateTransactionHash: Scalars['Bytes'];
  proposal: Proposal;
  votingPower: Scalars['BigInt'];
  yesToProposal: Scalars['Boolean'];
};

export type Vote_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  delegate?: InputMaybe<Scalars['String']>;
  delegate_?: InputMaybe<Delegate_Filter>;
  delegate_contains?: InputMaybe<Scalars['String']>;
  delegate_contains_nocase?: InputMaybe<Scalars['String']>;
  delegate_ends_with?: InputMaybe<Scalars['String']>;
  delegate_ends_with_nocase?: InputMaybe<Scalars['String']>;
  delegate_gt?: InputMaybe<Scalars['String']>;
  delegate_gte?: InputMaybe<Scalars['String']>;
  delegate_in?: InputMaybe<Array<Scalars['String']>>;
  delegate_lt?: InputMaybe<Scalars['String']>;
  delegate_lte?: InputMaybe<Scalars['String']>;
  delegate_not?: InputMaybe<Scalars['String']>;
  delegate_not_contains?: InputMaybe<Scalars['String']>;
  delegate_not_contains_nocase?: InputMaybe<Scalars['String']>;
  delegate_not_ends_with?: InputMaybe<Scalars['String']>;
  delegate_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  delegate_not_in?: InputMaybe<Array<Scalars['String']>>;
  delegate_not_starts_with?: InputMaybe<Scalars['String']>;
  delegate_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  delegate_starts_with?: InputMaybe<Scalars['String']>;
  delegate_starts_with_nocase?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  lastUpdateBlockHash?: InputMaybe<Scalars['Bytes']>;
  lastUpdateBlockHash_contains?: InputMaybe<Scalars['Bytes']>;
  lastUpdateBlockHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
  lastUpdateBlockHash_not?: InputMaybe<Scalars['Bytes']>;
  lastUpdateBlockHash_not_contains?: InputMaybe<Scalars['Bytes']>;
  lastUpdateBlockHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  lastUpdateBlockNumber?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_gt?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_gte?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_in?: InputMaybe<Array<Scalars['Int']>>;
  lastUpdateBlockNumber_lt?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_lte?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_not?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_not_in?: InputMaybe<Array<Scalars['Int']>>;
  lastUpdateTimestamp?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_gt?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_gte?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_in?: InputMaybe<Array<Scalars['Int']>>;
  lastUpdateTimestamp_lt?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_lte?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_not?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_not_in?: InputMaybe<Array<Scalars['Int']>>;
  lastUpdateTransactionHash?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_contains?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
  lastUpdateTransactionHash_not?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_not_contains?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  proposal?: InputMaybe<Scalars['String']>;
  proposal_?: InputMaybe<Proposal_Filter>;
  proposal_contains?: InputMaybe<Scalars['String']>;
  proposal_contains_nocase?: InputMaybe<Scalars['String']>;
  proposal_ends_with?: InputMaybe<Scalars['String']>;
  proposal_ends_with_nocase?: InputMaybe<Scalars['String']>;
  proposal_gt?: InputMaybe<Scalars['String']>;
  proposal_gte?: InputMaybe<Scalars['String']>;
  proposal_in?: InputMaybe<Array<Scalars['String']>>;
  proposal_lt?: InputMaybe<Scalars['String']>;
  proposal_lte?: InputMaybe<Scalars['String']>;
  proposal_not?: InputMaybe<Scalars['String']>;
  proposal_not_contains?: InputMaybe<Scalars['String']>;
  proposal_not_contains_nocase?: InputMaybe<Scalars['String']>;
  proposal_not_ends_with?: InputMaybe<Scalars['String']>;
  proposal_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  proposal_not_in?: InputMaybe<Array<Scalars['String']>>;
  proposal_not_starts_with?: InputMaybe<Scalars['String']>;
  proposal_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  proposal_starts_with?: InputMaybe<Scalars['String']>;
  proposal_starts_with_nocase?: InputMaybe<Scalars['String']>;
  votingPower?: InputMaybe<Scalars['BigInt']>;
  votingPower_gt?: InputMaybe<Scalars['BigInt']>;
  votingPower_gte?: InputMaybe<Scalars['BigInt']>;
  votingPower_in?: InputMaybe<Array<Scalars['BigInt']>>;
  votingPower_lt?: InputMaybe<Scalars['BigInt']>;
  votingPower_lte?: InputMaybe<Scalars['BigInt']>;
  votingPower_not?: InputMaybe<Scalars['BigInt']>;
  votingPower_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  yesToProposal?: InputMaybe<Scalars['Boolean']>;
  yesToProposal_in?: InputMaybe<Array<Scalars['Boolean']>>;
  yesToProposal_not?: InputMaybe<Scalars['Boolean']>;
  yesToProposal_not_in?: InputMaybe<Array<Scalars['Boolean']>>;
};

export enum Vote_OrderBy {
  Delegate = 'delegate',
  Id = 'id',
  LastUpdateBlockHash = 'lastUpdateBlockHash',
  LastUpdateBlockNumber = 'lastUpdateBlockNumber',
  LastUpdateTimestamp = 'lastUpdateTimestamp',
  LastUpdateTransactionHash = 'lastUpdateTransactionHash',
  Proposal = 'proposal',
  VotingPower = 'votingPower',
  YesToProposal = 'yesToProposal'
}

export type VotingPowerChange = {
  __typename?: 'VotingPowerChange';
  blockHash: Scalars['Bytes'];
  blockNumber: Scalars['Int'];
  delegate: Delegate;
  /** TokenAddress:TxnHash:LogIndex */
  id: Scalars['ID'];
  source: VotingPowerSource;
  timestamp: Scalars['Int'];
  transactionHash: Scalars['Bytes'];
  votingPowerAfter: Scalars['BigInt'];
  votingPowerBefore: Scalars['BigInt'];
};

export type VotingPowerChange_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  blockHash?: InputMaybe<Scalars['Bytes']>;
  blockHash_contains?: InputMaybe<Scalars['Bytes']>;
  blockHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
  blockHash_not?: InputMaybe<Scalars['Bytes']>;
  blockHash_not_contains?: InputMaybe<Scalars['Bytes']>;
  blockHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  blockNumber?: InputMaybe<Scalars['Int']>;
  blockNumber_gt?: InputMaybe<Scalars['Int']>;
  blockNumber_gte?: InputMaybe<Scalars['Int']>;
  blockNumber_in?: InputMaybe<Array<Scalars['Int']>>;
  blockNumber_lt?: InputMaybe<Scalars['Int']>;
  blockNumber_lte?: InputMaybe<Scalars['Int']>;
  blockNumber_not?: InputMaybe<Scalars['Int']>;
  blockNumber_not_in?: InputMaybe<Array<Scalars['Int']>>;
  delegate?: InputMaybe<Scalars['String']>;
  delegate_?: InputMaybe<Delegate_Filter>;
  delegate_contains?: InputMaybe<Scalars['String']>;
  delegate_contains_nocase?: InputMaybe<Scalars['String']>;
  delegate_ends_with?: InputMaybe<Scalars['String']>;
  delegate_ends_with_nocase?: InputMaybe<Scalars['String']>;
  delegate_gt?: InputMaybe<Scalars['String']>;
  delegate_gte?: InputMaybe<Scalars['String']>;
  delegate_in?: InputMaybe<Array<Scalars['String']>>;
  delegate_lt?: InputMaybe<Scalars['String']>;
  delegate_lte?: InputMaybe<Scalars['String']>;
  delegate_not?: InputMaybe<Scalars['String']>;
  delegate_not_contains?: InputMaybe<Scalars['String']>;
  delegate_not_contains_nocase?: InputMaybe<Scalars['String']>;
  delegate_not_ends_with?: InputMaybe<Scalars['String']>;
  delegate_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  delegate_not_in?: InputMaybe<Array<Scalars['String']>>;
  delegate_not_starts_with?: InputMaybe<Scalars['String']>;
  delegate_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  delegate_starts_with?: InputMaybe<Scalars['String']>;
  delegate_starts_with_nocase?: InputMaybe<Scalars['String']>;
  id?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  source?: InputMaybe<VotingPowerSource>;
  source_in?: InputMaybe<Array<VotingPowerSource>>;
  source_not?: InputMaybe<VotingPowerSource>;
  source_not_in?: InputMaybe<Array<VotingPowerSource>>;
  timestamp?: InputMaybe<Scalars['Int']>;
  timestamp_gt?: InputMaybe<Scalars['Int']>;
  timestamp_gte?: InputMaybe<Scalars['Int']>;
  timestamp_in?: InputMaybe<Array<Scalars['Int']>>;
  timestamp_lt?: InputMaybe<Scalars['Int']>;
  timestamp_lte?: InputMaybe<Scalars['Int']>;
  timestamp_not?: InputMaybe<Scalars['Int']>;
  timestamp_not_in?: InputMaybe<Array<Scalars['Int']>>;
  transactionHash?: InputMaybe<Scalars['Bytes']>;
  transactionHash_contains?: InputMaybe<Scalars['Bytes']>;
  transactionHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
  transactionHash_not?: InputMaybe<Scalars['Bytes']>;
  transactionHash_not_contains?: InputMaybe<Scalars['Bytes']>;
  transactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  votingPowerAfter?: InputMaybe<Scalars['BigInt']>;
  votingPowerAfter_gt?: InputMaybe<Scalars['BigInt']>;
  votingPowerAfter_gte?: InputMaybe<Scalars['BigInt']>;
  votingPowerAfter_in?: InputMaybe<Array<Scalars['BigInt']>>;
  votingPowerAfter_lt?: InputMaybe<Scalars['BigInt']>;
  votingPowerAfter_lte?: InputMaybe<Scalars['BigInt']>;
  votingPowerAfter_not?: InputMaybe<Scalars['BigInt']>;
  votingPowerAfter_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  votingPowerBefore?: InputMaybe<Scalars['BigInt']>;
  votingPowerBefore_gt?: InputMaybe<Scalars['BigInt']>;
  votingPowerBefore_gte?: InputMaybe<Scalars['BigInt']>;
  votingPowerBefore_in?: InputMaybe<Array<Scalars['BigInt']>>;
  votingPowerBefore_lt?: InputMaybe<Scalars['BigInt']>;
  votingPowerBefore_lte?: InputMaybe<Scalars['BigInt']>;
  votingPowerBefore_not?: InputMaybe<Scalars['BigInt']>;
  votingPowerBefore_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
};

export enum VotingPowerChange_OrderBy {
  BlockHash = 'blockHash',
  BlockNumber = 'blockNumber',
  Delegate = 'delegate',
  Id = 'id',
  Source = 'source',
  Timestamp = 'timestamp',
  TransactionHash = 'transactionHash',
  VotingPowerAfter = 'votingPowerAfter',
  VotingPowerBefore = 'votingPowerBefore'
}

export enum VotingPowerSource {
  Note = 'NOTE',
  SNote = 'sNOTE'
}

export type _Block_ = {
  __typename?: '_Block_';
  /** The hash of the block */
  hash?: Maybe<Scalars['Bytes']>;
  /** The block number */
  number: Scalars['Int'];
  /** Integer representation of the timestamp stored in blocks for the chain */
  timestamp?: Maybe<Scalars['Int']>;
};

/** The type for the top-level _meta field */
export type _Meta_ = {
  __typename?: '_Meta_';
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

export enum _SubgraphErrorPolicy_ {
  /** Data will be returned even if the subgraph has indexing errors */
  Allow = 'allow',
  /** If the subgraph has indexing errors, data will be omitted. The default. */
  Deny = 'deny'
}

export type NToken = {
  __typename?: 'nToken';
  /** Link to the nToken account object */
  account?: Maybe<Account>;
  accumulatedNOTEPerNToken?: Maybe<Scalars['BigInt']>;
  /** Annualized anchor rates used during market initialization */
  annualizedAnchorRates?: Maybe<Array<Scalars['Int']>>;
  /** Cash group that governs this nToken */
  cashGroup: CashGroup;
  /** Basis points of cash withholding for negative fCash */
  cashWithholdingBufferBasisPoints?: Maybe<Scalars['Int']>;
  /** Currency of this nToken */
  currency: Currency;
  decimals: Scalars['BigInt'];
  /** Proportion of deposits that go into each corresponding market */
  depositShares?: Maybe<Array<Scalars['Int']>>;
  /** Currency id of the nToken */
  id: Scalars['ID'];
  /** Annual incentive emission rate */
  incentiveEmissionRate?: Maybe<Scalars['BigInt']>;
  integralTotalSupply: Scalars['BigInt'];
  lastSupplyChangeTime: Scalars['BigInt'];
  lastUpdateBlockHash: Scalars['Bytes'];
  lastUpdateBlockNumber: Scalars['Int'];
  lastUpdateTimestamp: Scalars['Int'];
  lastUpdateTransactionHash: Scalars['Bytes'];
  /** Maximum market proportion that the nToken will provide liquidity at */
  leverageThresholds?: Maybe<Array<Scalars['Int']>>;
  /** Discount on nToken PV given to liquidators */
  liquidationHaircutPercentage?: Maybe<Scalars['Int']>;
  name: Scalars['String'];
  /** Market proportions used during market initialization */
  proportions?: Maybe<Array<Scalars['Int']>>;
  /** Percentage of the nToken PV that is used during free collateral */
  pvHaircutPercentage?: Maybe<Scalars['Int']>;
  /** Residual purchase incentive in basis points */
  residualPurchaseIncentiveBasisPoints?: Maybe<Scalars['Int']>;
  /** Seconds until residuals become available to purchase after market initialization */
  residualPurchaseTimeBufferSeconds?: Maybe<Scalars['Int']>;
  symbol: Scalars['String'];
  /** Address of the nToken */
  tokenAddress: Scalars['Bytes'];
  totalSupply: Scalars['BigInt'];
};

export type NTokenChange = {
  __typename?: 'nTokenChange';
  /** Account that mints or redeems nTokens, set to null on initialize markets */
  account?: Maybe<Account>;
  accumulatedNOTEPerNTokenAfter?: Maybe<Scalars['BigInt']>;
  /** Represents the accumulated NOTE incentives on the nToken */
  accumulatedNOTEPerNTokenBefore?: Maybe<Scalars['BigInt']>;
  assetChanges?: Maybe<Array<AssetChange>>;
  balanceChange?: Maybe<BalanceChange>;
  blockHash: Scalars['Bytes'];
  blockNumber: Scalars['Int'];
  /** nTokenAddress:Transaction hash */
  id: Scalars['ID'];
  integralTotalSupplyAfter?: Maybe<Scalars['BigInt']>;
  /** Deprecated integral total supply before and after */
  integralTotalSupplyBefore?: Maybe<Scalars['BigInt']>;
  lastSupplyChangeTimeAfter: Scalars['BigInt'];
  /** Last supply change time before and after, equivalent to last accumulated time */
  lastSupplyChangeTimeBefore: Scalars['BigInt'];
  nToken: NToken;
  timestamp: Scalars['Int'];
  totalSupplyAfter: Scalars['BigInt'];
  totalSupplyBefore: Scalars['BigInt'];
  transactionHash: Scalars['Bytes'];
  transactionOrigin: Scalars['Bytes'];
};


export type NTokenChangeAssetChangesArgs = {
  first?: InputMaybe<Scalars['Int']>;
  orderBy?: InputMaybe<AssetChange_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']>;
  where?: InputMaybe<AssetChange_Filter>;
};

export type NTokenChange_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  account?: InputMaybe<Scalars['String']>;
  account_?: InputMaybe<Account_Filter>;
  account_contains?: InputMaybe<Scalars['String']>;
  account_contains_nocase?: InputMaybe<Scalars['String']>;
  account_ends_with?: InputMaybe<Scalars['String']>;
  account_ends_with_nocase?: InputMaybe<Scalars['String']>;
  account_gt?: InputMaybe<Scalars['String']>;
  account_gte?: InputMaybe<Scalars['String']>;
  account_in?: InputMaybe<Array<Scalars['String']>>;
  account_lt?: InputMaybe<Scalars['String']>;
  account_lte?: InputMaybe<Scalars['String']>;
  account_not?: InputMaybe<Scalars['String']>;
  account_not_contains?: InputMaybe<Scalars['String']>;
  account_not_contains_nocase?: InputMaybe<Scalars['String']>;
  account_not_ends_with?: InputMaybe<Scalars['String']>;
  account_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  account_not_in?: InputMaybe<Array<Scalars['String']>>;
  account_not_starts_with?: InputMaybe<Scalars['String']>;
  account_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  account_starts_with?: InputMaybe<Scalars['String']>;
  account_starts_with_nocase?: InputMaybe<Scalars['String']>;
  accumulatedNOTEPerNTokenAfter?: InputMaybe<Scalars['BigInt']>;
  accumulatedNOTEPerNTokenAfter_gt?: InputMaybe<Scalars['BigInt']>;
  accumulatedNOTEPerNTokenAfter_gte?: InputMaybe<Scalars['BigInt']>;
  accumulatedNOTEPerNTokenAfter_in?: InputMaybe<Array<Scalars['BigInt']>>;
  accumulatedNOTEPerNTokenAfter_lt?: InputMaybe<Scalars['BigInt']>;
  accumulatedNOTEPerNTokenAfter_lte?: InputMaybe<Scalars['BigInt']>;
  accumulatedNOTEPerNTokenAfter_not?: InputMaybe<Scalars['BigInt']>;
  accumulatedNOTEPerNTokenAfter_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  accumulatedNOTEPerNTokenBefore?: InputMaybe<Scalars['BigInt']>;
  accumulatedNOTEPerNTokenBefore_gt?: InputMaybe<Scalars['BigInt']>;
  accumulatedNOTEPerNTokenBefore_gte?: InputMaybe<Scalars['BigInt']>;
  accumulatedNOTEPerNTokenBefore_in?: InputMaybe<Array<Scalars['BigInt']>>;
  accumulatedNOTEPerNTokenBefore_lt?: InputMaybe<Scalars['BigInt']>;
  accumulatedNOTEPerNTokenBefore_lte?: InputMaybe<Scalars['BigInt']>;
  accumulatedNOTEPerNTokenBefore_not?: InputMaybe<Scalars['BigInt']>;
  accumulatedNOTEPerNTokenBefore_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  assetChanges?: InputMaybe<Array<Scalars['String']>>;
  assetChanges_?: InputMaybe<AssetChange_Filter>;
  assetChanges_contains?: InputMaybe<Array<Scalars['String']>>;
  assetChanges_contains_nocase?: InputMaybe<Array<Scalars['String']>>;
  assetChanges_not?: InputMaybe<Array<Scalars['String']>>;
  assetChanges_not_contains?: InputMaybe<Array<Scalars['String']>>;
  assetChanges_not_contains_nocase?: InputMaybe<Array<Scalars['String']>>;
  balanceChange?: InputMaybe<Scalars['String']>;
  balanceChange_?: InputMaybe<BalanceChange_Filter>;
  balanceChange_contains?: InputMaybe<Scalars['String']>;
  balanceChange_contains_nocase?: InputMaybe<Scalars['String']>;
  balanceChange_ends_with?: InputMaybe<Scalars['String']>;
  balanceChange_ends_with_nocase?: InputMaybe<Scalars['String']>;
  balanceChange_gt?: InputMaybe<Scalars['String']>;
  balanceChange_gte?: InputMaybe<Scalars['String']>;
  balanceChange_in?: InputMaybe<Array<Scalars['String']>>;
  balanceChange_lt?: InputMaybe<Scalars['String']>;
  balanceChange_lte?: InputMaybe<Scalars['String']>;
  balanceChange_not?: InputMaybe<Scalars['String']>;
  balanceChange_not_contains?: InputMaybe<Scalars['String']>;
  balanceChange_not_contains_nocase?: InputMaybe<Scalars['String']>;
  balanceChange_not_ends_with?: InputMaybe<Scalars['String']>;
  balanceChange_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  balanceChange_not_in?: InputMaybe<Array<Scalars['String']>>;
  balanceChange_not_starts_with?: InputMaybe<Scalars['String']>;
  balanceChange_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  balanceChange_starts_with?: InputMaybe<Scalars['String']>;
  balanceChange_starts_with_nocase?: InputMaybe<Scalars['String']>;
  blockHash?: InputMaybe<Scalars['Bytes']>;
  blockHash_contains?: InputMaybe<Scalars['Bytes']>;
  blockHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
  blockHash_not?: InputMaybe<Scalars['Bytes']>;
  blockHash_not_contains?: InputMaybe<Scalars['Bytes']>;
  blockHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  blockNumber?: InputMaybe<Scalars['Int']>;
  blockNumber_gt?: InputMaybe<Scalars['Int']>;
  blockNumber_gte?: InputMaybe<Scalars['Int']>;
  blockNumber_in?: InputMaybe<Array<Scalars['Int']>>;
  blockNumber_lt?: InputMaybe<Scalars['Int']>;
  blockNumber_lte?: InputMaybe<Scalars['Int']>;
  blockNumber_not?: InputMaybe<Scalars['Int']>;
  blockNumber_not_in?: InputMaybe<Array<Scalars['Int']>>;
  id?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  integralTotalSupplyAfter?: InputMaybe<Scalars['BigInt']>;
  integralTotalSupplyAfter_gt?: InputMaybe<Scalars['BigInt']>;
  integralTotalSupplyAfter_gte?: InputMaybe<Scalars['BigInt']>;
  integralTotalSupplyAfter_in?: InputMaybe<Array<Scalars['BigInt']>>;
  integralTotalSupplyAfter_lt?: InputMaybe<Scalars['BigInt']>;
  integralTotalSupplyAfter_lte?: InputMaybe<Scalars['BigInt']>;
  integralTotalSupplyAfter_not?: InputMaybe<Scalars['BigInt']>;
  integralTotalSupplyAfter_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  integralTotalSupplyBefore?: InputMaybe<Scalars['BigInt']>;
  integralTotalSupplyBefore_gt?: InputMaybe<Scalars['BigInt']>;
  integralTotalSupplyBefore_gte?: InputMaybe<Scalars['BigInt']>;
  integralTotalSupplyBefore_in?: InputMaybe<Array<Scalars['BigInt']>>;
  integralTotalSupplyBefore_lt?: InputMaybe<Scalars['BigInt']>;
  integralTotalSupplyBefore_lte?: InputMaybe<Scalars['BigInt']>;
  integralTotalSupplyBefore_not?: InputMaybe<Scalars['BigInt']>;
  integralTotalSupplyBefore_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  lastSupplyChangeTimeAfter?: InputMaybe<Scalars['BigInt']>;
  lastSupplyChangeTimeAfter_gt?: InputMaybe<Scalars['BigInt']>;
  lastSupplyChangeTimeAfter_gte?: InputMaybe<Scalars['BigInt']>;
  lastSupplyChangeTimeAfter_in?: InputMaybe<Array<Scalars['BigInt']>>;
  lastSupplyChangeTimeAfter_lt?: InputMaybe<Scalars['BigInt']>;
  lastSupplyChangeTimeAfter_lte?: InputMaybe<Scalars['BigInt']>;
  lastSupplyChangeTimeAfter_not?: InputMaybe<Scalars['BigInt']>;
  lastSupplyChangeTimeAfter_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  lastSupplyChangeTimeBefore?: InputMaybe<Scalars['BigInt']>;
  lastSupplyChangeTimeBefore_gt?: InputMaybe<Scalars['BigInt']>;
  lastSupplyChangeTimeBefore_gte?: InputMaybe<Scalars['BigInt']>;
  lastSupplyChangeTimeBefore_in?: InputMaybe<Array<Scalars['BigInt']>>;
  lastSupplyChangeTimeBefore_lt?: InputMaybe<Scalars['BigInt']>;
  lastSupplyChangeTimeBefore_lte?: InputMaybe<Scalars['BigInt']>;
  lastSupplyChangeTimeBefore_not?: InputMaybe<Scalars['BigInt']>;
  lastSupplyChangeTimeBefore_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  nToken?: InputMaybe<Scalars['String']>;
  nToken_?: InputMaybe<NToken_Filter>;
  nToken_contains?: InputMaybe<Scalars['String']>;
  nToken_contains_nocase?: InputMaybe<Scalars['String']>;
  nToken_ends_with?: InputMaybe<Scalars['String']>;
  nToken_ends_with_nocase?: InputMaybe<Scalars['String']>;
  nToken_gt?: InputMaybe<Scalars['String']>;
  nToken_gte?: InputMaybe<Scalars['String']>;
  nToken_in?: InputMaybe<Array<Scalars['String']>>;
  nToken_lt?: InputMaybe<Scalars['String']>;
  nToken_lte?: InputMaybe<Scalars['String']>;
  nToken_not?: InputMaybe<Scalars['String']>;
  nToken_not_contains?: InputMaybe<Scalars['String']>;
  nToken_not_contains_nocase?: InputMaybe<Scalars['String']>;
  nToken_not_ends_with?: InputMaybe<Scalars['String']>;
  nToken_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  nToken_not_in?: InputMaybe<Array<Scalars['String']>>;
  nToken_not_starts_with?: InputMaybe<Scalars['String']>;
  nToken_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  nToken_starts_with?: InputMaybe<Scalars['String']>;
  nToken_starts_with_nocase?: InputMaybe<Scalars['String']>;
  timestamp?: InputMaybe<Scalars['Int']>;
  timestamp_gt?: InputMaybe<Scalars['Int']>;
  timestamp_gte?: InputMaybe<Scalars['Int']>;
  timestamp_in?: InputMaybe<Array<Scalars['Int']>>;
  timestamp_lt?: InputMaybe<Scalars['Int']>;
  timestamp_lte?: InputMaybe<Scalars['Int']>;
  timestamp_not?: InputMaybe<Scalars['Int']>;
  timestamp_not_in?: InputMaybe<Array<Scalars['Int']>>;
  totalSupplyAfter?: InputMaybe<Scalars['BigInt']>;
  totalSupplyAfter_gt?: InputMaybe<Scalars['BigInt']>;
  totalSupplyAfter_gte?: InputMaybe<Scalars['BigInt']>;
  totalSupplyAfter_in?: InputMaybe<Array<Scalars['BigInt']>>;
  totalSupplyAfter_lt?: InputMaybe<Scalars['BigInt']>;
  totalSupplyAfter_lte?: InputMaybe<Scalars['BigInt']>;
  totalSupplyAfter_not?: InputMaybe<Scalars['BigInt']>;
  totalSupplyAfter_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  totalSupplyBefore?: InputMaybe<Scalars['BigInt']>;
  totalSupplyBefore_gt?: InputMaybe<Scalars['BigInt']>;
  totalSupplyBefore_gte?: InputMaybe<Scalars['BigInt']>;
  totalSupplyBefore_in?: InputMaybe<Array<Scalars['BigInt']>>;
  totalSupplyBefore_lt?: InputMaybe<Scalars['BigInt']>;
  totalSupplyBefore_lte?: InputMaybe<Scalars['BigInt']>;
  totalSupplyBefore_not?: InputMaybe<Scalars['BigInt']>;
  totalSupplyBefore_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  transactionHash?: InputMaybe<Scalars['Bytes']>;
  transactionHash_contains?: InputMaybe<Scalars['Bytes']>;
  transactionHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
  transactionHash_not?: InputMaybe<Scalars['Bytes']>;
  transactionHash_not_contains?: InputMaybe<Scalars['Bytes']>;
  transactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  transactionOrigin?: InputMaybe<Scalars['Bytes']>;
  transactionOrigin_contains?: InputMaybe<Scalars['Bytes']>;
  transactionOrigin_in?: InputMaybe<Array<Scalars['Bytes']>>;
  transactionOrigin_not?: InputMaybe<Scalars['Bytes']>;
  transactionOrigin_not_contains?: InputMaybe<Scalars['Bytes']>;
  transactionOrigin_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
};

export enum NTokenChange_OrderBy {
  Account = 'account',
  AccumulatedNotePerNTokenAfter = 'accumulatedNOTEPerNTokenAfter',
  AccumulatedNotePerNTokenBefore = 'accumulatedNOTEPerNTokenBefore',
  AssetChanges = 'assetChanges',
  BalanceChange = 'balanceChange',
  BlockHash = 'blockHash',
  BlockNumber = 'blockNumber',
  Id = 'id',
  IntegralTotalSupplyAfter = 'integralTotalSupplyAfter',
  IntegralTotalSupplyBefore = 'integralTotalSupplyBefore',
  LastSupplyChangeTimeAfter = 'lastSupplyChangeTimeAfter',
  LastSupplyChangeTimeBefore = 'lastSupplyChangeTimeBefore',
  NToken = 'nToken',
  Timestamp = 'timestamp',
  TotalSupplyAfter = 'totalSupplyAfter',
  TotalSupplyBefore = 'totalSupplyBefore',
  TransactionHash = 'transactionHash',
  TransactionOrigin = 'transactionOrigin'
}

export type NToken_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  account_?: InputMaybe<Account_Filter>;
  accumulatedNOTEPerNToken?: InputMaybe<Scalars['BigInt']>;
  accumulatedNOTEPerNToken_gt?: InputMaybe<Scalars['BigInt']>;
  accumulatedNOTEPerNToken_gte?: InputMaybe<Scalars['BigInt']>;
  accumulatedNOTEPerNToken_in?: InputMaybe<Array<Scalars['BigInt']>>;
  accumulatedNOTEPerNToken_lt?: InputMaybe<Scalars['BigInt']>;
  accumulatedNOTEPerNToken_lte?: InputMaybe<Scalars['BigInt']>;
  accumulatedNOTEPerNToken_not?: InputMaybe<Scalars['BigInt']>;
  accumulatedNOTEPerNToken_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  annualizedAnchorRates?: InputMaybe<Array<Scalars['Int']>>;
  annualizedAnchorRates_contains?: InputMaybe<Array<Scalars['Int']>>;
  annualizedAnchorRates_contains_nocase?: InputMaybe<Array<Scalars['Int']>>;
  annualizedAnchorRates_not?: InputMaybe<Array<Scalars['Int']>>;
  annualizedAnchorRates_not_contains?: InputMaybe<Array<Scalars['Int']>>;
  annualizedAnchorRates_not_contains_nocase?: InputMaybe<Array<Scalars['Int']>>;
  cashGroup?: InputMaybe<Scalars['String']>;
  cashGroup_?: InputMaybe<CashGroup_Filter>;
  cashGroup_contains?: InputMaybe<Scalars['String']>;
  cashGroup_contains_nocase?: InputMaybe<Scalars['String']>;
  cashGroup_ends_with?: InputMaybe<Scalars['String']>;
  cashGroup_ends_with_nocase?: InputMaybe<Scalars['String']>;
  cashGroup_gt?: InputMaybe<Scalars['String']>;
  cashGroup_gte?: InputMaybe<Scalars['String']>;
  cashGroup_in?: InputMaybe<Array<Scalars['String']>>;
  cashGroup_lt?: InputMaybe<Scalars['String']>;
  cashGroup_lte?: InputMaybe<Scalars['String']>;
  cashGroup_not?: InputMaybe<Scalars['String']>;
  cashGroup_not_contains?: InputMaybe<Scalars['String']>;
  cashGroup_not_contains_nocase?: InputMaybe<Scalars['String']>;
  cashGroup_not_ends_with?: InputMaybe<Scalars['String']>;
  cashGroup_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  cashGroup_not_in?: InputMaybe<Array<Scalars['String']>>;
  cashGroup_not_starts_with?: InputMaybe<Scalars['String']>;
  cashGroup_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  cashGroup_starts_with?: InputMaybe<Scalars['String']>;
  cashGroup_starts_with_nocase?: InputMaybe<Scalars['String']>;
  cashWithholdingBufferBasisPoints?: InputMaybe<Scalars['Int']>;
  cashWithholdingBufferBasisPoints_gt?: InputMaybe<Scalars['Int']>;
  cashWithholdingBufferBasisPoints_gte?: InputMaybe<Scalars['Int']>;
  cashWithholdingBufferBasisPoints_in?: InputMaybe<Array<Scalars['Int']>>;
  cashWithholdingBufferBasisPoints_lt?: InputMaybe<Scalars['Int']>;
  cashWithholdingBufferBasisPoints_lte?: InputMaybe<Scalars['Int']>;
  cashWithholdingBufferBasisPoints_not?: InputMaybe<Scalars['Int']>;
  cashWithholdingBufferBasisPoints_not_in?: InputMaybe<Array<Scalars['Int']>>;
  currency?: InputMaybe<Scalars['String']>;
  currency_?: InputMaybe<Currency_Filter>;
  currency_contains?: InputMaybe<Scalars['String']>;
  currency_contains_nocase?: InputMaybe<Scalars['String']>;
  currency_ends_with?: InputMaybe<Scalars['String']>;
  currency_ends_with_nocase?: InputMaybe<Scalars['String']>;
  currency_gt?: InputMaybe<Scalars['String']>;
  currency_gte?: InputMaybe<Scalars['String']>;
  currency_in?: InputMaybe<Array<Scalars['String']>>;
  currency_lt?: InputMaybe<Scalars['String']>;
  currency_lte?: InputMaybe<Scalars['String']>;
  currency_not?: InputMaybe<Scalars['String']>;
  currency_not_contains?: InputMaybe<Scalars['String']>;
  currency_not_contains_nocase?: InputMaybe<Scalars['String']>;
  currency_not_ends_with?: InputMaybe<Scalars['String']>;
  currency_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  currency_not_in?: InputMaybe<Array<Scalars['String']>>;
  currency_not_starts_with?: InputMaybe<Scalars['String']>;
  currency_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  currency_starts_with?: InputMaybe<Scalars['String']>;
  currency_starts_with_nocase?: InputMaybe<Scalars['String']>;
  decimals?: InputMaybe<Scalars['BigInt']>;
  decimals_gt?: InputMaybe<Scalars['BigInt']>;
  decimals_gte?: InputMaybe<Scalars['BigInt']>;
  decimals_in?: InputMaybe<Array<Scalars['BigInt']>>;
  decimals_lt?: InputMaybe<Scalars['BigInt']>;
  decimals_lte?: InputMaybe<Scalars['BigInt']>;
  decimals_not?: InputMaybe<Scalars['BigInt']>;
  decimals_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  depositShares?: InputMaybe<Array<Scalars['Int']>>;
  depositShares_contains?: InputMaybe<Array<Scalars['Int']>>;
  depositShares_contains_nocase?: InputMaybe<Array<Scalars['Int']>>;
  depositShares_not?: InputMaybe<Array<Scalars['Int']>>;
  depositShares_not_contains?: InputMaybe<Array<Scalars['Int']>>;
  depositShares_not_contains_nocase?: InputMaybe<Array<Scalars['Int']>>;
  id?: InputMaybe<Scalars['ID']>;
  id_gt?: InputMaybe<Scalars['ID']>;
  id_gte?: InputMaybe<Scalars['ID']>;
  id_in?: InputMaybe<Array<Scalars['ID']>>;
  id_lt?: InputMaybe<Scalars['ID']>;
  id_lte?: InputMaybe<Scalars['ID']>;
  id_not?: InputMaybe<Scalars['ID']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']>>;
  incentiveEmissionRate?: InputMaybe<Scalars['BigInt']>;
  incentiveEmissionRate_gt?: InputMaybe<Scalars['BigInt']>;
  incentiveEmissionRate_gte?: InputMaybe<Scalars['BigInt']>;
  incentiveEmissionRate_in?: InputMaybe<Array<Scalars['BigInt']>>;
  incentiveEmissionRate_lt?: InputMaybe<Scalars['BigInt']>;
  incentiveEmissionRate_lte?: InputMaybe<Scalars['BigInt']>;
  incentiveEmissionRate_not?: InputMaybe<Scalars['BigInt']>;
  incentiveEmissionRate_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  integralTotalSupply?: InputMaybe<Scalars['BigInt']>;
  integralTotalSupply_gt?: InputMaybe<Scalars['BigInt']>;
  integralTotalSupply_gte?: InputMaybe<Scalars['BigInt']>;
  integralTotalSupply_in?: InputMaybe<Array<Scalars['BigInt']>>;
  integralTotalSupply_lt?: InputMaybe<Scalars['BigInt']>;
  integralTotalSupply_lte?: InputMaybe<Scalars['BigInt']>;
  integralTotalSupply_not?: InputMaybe<Scalars['BigInt']>;
  integralTotalSupply_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  lastSupplyChangeTime?: InputMaybe<Scalars['BigInt']>;
  lastSupplyChangeTime_gt?: InputMaybe<Scalars['BigInt']>;
  lastSupplyChangeTime_gte?: InputMaybe<Scalars['BigInt']>;
  lastSupplyChangeTime_in?: InputMaybe<Array<Scalars['BigInt']>>;
  lastSupplyChangeTime_lt?: InputMaybe<Scalars['BigInt']>;
  lastSupplyChangeTime_lte?: InputMaybe<Scalars['BigInt']>;
  lastSupplyChangeTime_not?: InputMaybe<Scalars['BigInt']>;
  lastSupplyChangeTime_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
  lastUpdateBlockHash?: InputMaybe<Scalars['Bytes']>;
  lastUpdateBlockHash_contains?: InputMaybe<Scalars['Bytes']>;
  lastUpdateBlockHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
  lastUpdateBlockHash_not?: InputMaybe<Scalars['Bytes']>;
  lastUpdateBlockHash_not_contains?: InputMaybe<Scalars['Bytes']>;
  lastUpdateBlockHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  lastUpdateBlockNumber?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_gt?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_gte?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_in?: InputMaybe<Array<Scalars['Int']>>;
  lastUpdateBlockNumber_lt?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_lte?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_not?: InputMaybe<Scalars['Int']>;
  lastUpdateBlockNumber_not_in?: InputMaybe<Array<Scalars['Int']>>;
  lastUpdateTimestamp?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_gt?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_gte?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_in?: InputMaybe<Array<Scalars['Int']>>;
  lastUpdateTimestamp_lt?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_lte?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_not?: InputMaybe<Scalars['Int']>;
  lastUpdateTimestamp_not_in?: InputMaybe<Array<Scalars['Int']>>;
  lastUpdateTransactionHash?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_contains?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_in?: InputMaybe<Array<Scalars['Bytes']>>;
  lastUpdateTransactionHash_not?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_not_contains?: InputMaybe<Scalars['Bytes']>;
  lastUpdateTransactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  leverageThresholds?: InputMaybe<Array<Scalars['Int']>>;
  leverageThresholds_contains?: InputMaybe<Array<Scalars['Int']>>;
  leverageThresholds_contains_nocase?: InputMaybe<Array<Scalars['Int']>>;
  leverageThresholds_not?: InputMaybe<Array<Scalars['Int']>>;
  leverageThresholds_not_contains?: InputMaybe<Array<Scalars['Int']>>;
  leverageThresholds_not_contains_nocase?: InputMaybe<Array<Scalars['Int']>>;
  liquidationHaircutPercentage?: InputMaybe<Scalars['Int']>;
  liquidationHaircutPercentage_gt?: InputMaybe<Scalars['Int']>;
  liquidationHaircutPercentage_gte?: InputMaybe<Scalars['Int']>;
  liquidationHaircutPercentage_in?: InputMaybe<Array<Scalars['Int']>>;
  liquidationHaircutPercentage_lt?: InputMaybe<Scalars['Int']>;
  liquidationHaircutPercentage_lte?: InputMaybe<Scalars['Int']>;
  liquidationHaircutPercentage_not?: InputMaybe<Scalars['Int']>;
  liquidationHaircutPercentage_not_in?: InputMaybe<Array<Scalars['Int']>>;
  name?: InputMaybe<Scalars['String']>;
  name_contains?: InputMaybe<Scalars['String']>;
  name_contains_nocase?: InputMaybe<Scalars['String']>;
  name_ends_with?: InputMaybe<Scalars['String']>;
  name_ends_with_nocase?: InputMaybe<Scalars['String']>;
  name_gt?: InputMaybe<Scalars['String']>;
  name_gte?: InputMaybe<Scalars['String']>;
  name_in?: InputMaybe<Array<Scalars['String']>>;
  name_lt?: InputMaybe<Scalars['String']>;
  name_lte?: InputMaybe<Scalars['String']>;
  name_not?: InputMaybe<Scalars['String']>;
  name_not_contains?: InputMaybe<Scalars['String']>;
  name_not_contains_nocase?: InputMaybe<Scalars['String']>;
  name_not_ends_with?: InputMaybe<Scalars['String']>;
  name_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  name_not_in?: InputMaybe<Array<Scalars['String']>>;
  name_not_starts_with?: InputMaybe<Scalars['String']>;
  name_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  name_starts_with?: InputMaybe<Scalars['String']>;
  name_starts_with_nocase?: InputMaybe<Scalars['String']>;
  proportions?: InputMaybe<Array<Scalars['Int']>>;
  proportions_contains?: InputMaybe<Array<Scalars['Int']>>;
  proportions_contains_nocase?: InputMaybe<Array<Scalars['Int']>>;
  proportions_not?: InputMaybe<Array<Scalars['Int']>>;
  proportions_not_contains?: InputMaybe<Array<Scalars['Int']>>;
  proportions_not_contains_nocase?: InputMaybe<Array<Scalars['Int']>>;
  pvHaircutPercentage?: InputMaybe<Scalars['Int']>;
  pvHaircutPercentage_gt?: InputMaybe<Scalars['Int']>;
  pvHaircutPercentage_gte?: InputMaybe<Scalars['Int']>;
  pvHaircutPercentage_in?: InputMaybe<Array<Scalars['Int']>>;
  pvHaircutPercentage_lt?: InputMaybe<Scalars['Int']>;
  pvHaircutPercentage_lte?: InputMaybe<Scalars['Int']>;
  pvHaircutPercentage_not?: InputMaybe<Scalars['Int']>;
  pvHaircutPercentage_not_in?: InputMaybe<Array<Scalars['Int']>>;
  residualPurchaseIncentiveBasisPoints?: InputMaybe<Scalars['Int']>;
  residualPurchaseIncentiveBasisPoints_gt?: InputMaybe<Scalars['Int']>;
  residualPurchaseIncentiveBasisPoints_gte?: InputMaybe<Scalars['Int']>;
  residualPurchaseIncentiveBasisPoints_in?: InputMaybe<Array<Scalars['Int']>>;
  residualPurchaseIncentiveBasisPoints_lt?: InputMaybe<Scalars['Int']>;
  residualPurchaseIncentiveBasisPoints_lte?: InputMaybe<Scalars['Int']>;
  residualPurchaseIncentiveBasisPoints_not?: InputMaybe<Scalars['Int']>;
  residualPurchaseIncentiveBasisPoints_not_in?: InputMaybe<Array<Scalars['Int']>>;
  residualPurchaseTimeBufferSeconds?: InputMaybe<Scalars['Int']>;
  residualPurchaseTimeBufferSeconds_gt?: InputMaybe<Scalars['Int']>;
  residualPurchaseTimeBufferSeconds_gte?: InputMaybe<Scalars['Int']>;
  residualPurchaseTimeBufferSeconds_in?: InputMaybe<Array<Scalars['Int']>>;
  residualPurchaseTimeBufferSeconds_lt?: InputMaybe<Scalars['Int']>;
  residualPurchaseTimeBufferSeconds_lte?: InputMaybe<Scalars['Int']>;
  residualPurchaseTimeBufferSeconds_not?: InputMaybe<Scalars['Int']>;
  residualPurchaseTimeBufferSeconds_not_in?: InputMaybe<Array<Scalars['Int']>>;
  symbol?: InputMaybe<Scalars['String']>;
  symbol_contains?: InputMaybe<Scalars['String']>;
  symbol_contains_nocase?: InputMaybe<Scalars['String']>;
  symbol_ends_with?: InputMaybe<Scalars['String']>;
  symbol_ends_with_nocase?: InputMaybe<Scalars['String']>;
  symbol_gt?: InputMaybe<Scalars['String']>;
  symbol_gte?: InputMaybe<Scalars['String']>;
  symbol_in?: InputMaybe<Array<Scalars['String']>>;
  symbol_lt?: InputMaybe<Scalars['String']>;
  symbol_lte?: InputMaybe<Scalars['String']>;
  symbol_not?: InputMaybe<Scalars['String']>;
  symbol_not_contains?: InputMaybe<Scalars['String']>;
  symbol_not_contains_nocase?: InputMaybe<Scalars['String']>;
  symbol_not_ends_with?: InputMaybe<Scalars['String']>;
  symbol_not_ends_with_nocase?: InputMaybe<Scalars['String']>;
  symbol_not_in?: InputMaybe<Array<Scalars['String']>>;
  symbol_not_starts_with?: InputMaybe<Scalars['String']>;
  symbol_not_starts_with_nocase?: InputMaybe<Scalars['String']>;
  symbol_starts_with?: InputMaybe<Scalars['String']>;
  symbol_starts_with_nocase?: InputMaybe<Scalars['String']>;
  tokenAddress?: InputMaybe<Scalars['Bytes']>;
  tokenAddress_contains?: InputMaybe<Scalars['Bytes']>;
  tokenAddress_in?: InputMaybe<Array<Scalars['Bytes']>>;
  tokenAddress_not?: InputMaybe<Scalars['Bytes']>;
  tokenAddress_not_contains?: InputMaybe<Scalars['Bytes']>;
  tokenAddress_not_in?: InputMaybe<Array<Scalars['Bytes']>>;
  totalSupply?: InputMaybe<Scalars['BigInt']>;
  totalSupply_gt?: InputMaybe<Scalars['BigInt']>;
  totalSupply_gte?: InputMaybe<Scalars['BigInt']>;
  totalSupply_in?: InputMaybe<Array<Scalars['BigInt']>>;
  totalSupply_lt?: InputMaybe<Scalars['BigInt']>;
  totalSupply_lte?: InputMaybe<Scalars['BigInt']>;
  totalSupply_not?: InputMaybe<Scalars['BigInt']>;
  totalSupply_not_in?: InputMaybe<Array<Scalars['BigInt']>>;
};

export enum NToken_OrderBy {
  Account = 'account',
  AccumulatedNotePerNToken = 'accumulatedNOTEPerNToken',
  AnnualizedAnchorRates = 'annualizedAnchorRates',
  CashGroup = 'cashGroup',
  CashWithholdingBufferBasisPoints = 'cashWithholdingBufferBasisPoints',
  Currency = 'currency',
  Decimals = 'decimals',
  DepositShares = 'depositShares',
  Id = 'id',
  IncentiveEmissionRate = 'incentiveEmissionRate',
  IntegralTotalSupply = 'integralTotalSupply',
  LastSupplyChangeTime = 'lastSupplyChangeTime',
  LastUpdateBlockHash = 'lastUpdateBlockHash',
  LastUpdateBlockNumber = 'lastUpdateBlockNumber',
  LastUpdateTimestamp = 'lastUpdateTimestamp',
  LastUpdateTransactionHash = 'lastUpdateTransactionHash',
  LeverageThresholds = 'leverageThresholds',
  LiquidationHaircutPercentage = 'liquidationHaircutPercentage',
  Name = 'name',
  Proportions = 'proportions',
  PvHaircutPercentage = 'pvHaircutPercentage',
  ResidualPurchaseIncentiveBasisPoints = 'residualPurchaseIncentiveBasisPoints',
  ResidualPurchaseTimeBufferSeconds = 'residualPurchaseTimeBufferSeconds',
  Symbol = 'symbol',
  TokenAddress = 'tokenAddress',
  TotalSupply = 'totalSupply'
}

export enum SNoteChangeType {
  Stake = 'Stake',
  Transfer = 'Transfer',
  Unstake = 'Unstake'
}

export type CurrenciesQueryVariables = Exact<{ [key: string]: never; }>;


export type CurrenciesQuery = { __typename?: 'Query', currencies: Array<{ __typename?: 'Currency', id: string, tokenAddress: any, tokenType: TokenType, decimals: any, name: string, symbol: string }> };


export const CurrenciesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Currencies"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"currencies"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"tokenAddress"}},{"kind":"Field","name":{"kind":"Name","value":"tokenType"}},{"kind":"Field","name":{"kind":"Name","value":"decimals"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"symbol"}}]}}]}}]} as unknown as DocumentNode<CurrenciesQuery, CurrenciesQueryVariables>;