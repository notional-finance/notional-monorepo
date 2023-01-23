/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

const documents = {
    "\n  query Accounts {\n    accounts {\n      id\n      lastUpdateTimestamp\n      hasCashDebt\n      hasPortfolioAssetDebt\n    }\n  }\n": types.AccountsDocument,
    "\n  query CurrencyTVLs($currencyId: String) {\n    currencyTvls(\n      where: { currency: $currencyId }\n      first: 1\n      orderBy: id\n      orderDirection: desc\n    ) {\n      id\n      usdValue\n      underlyingValue\n      currency {\n        id\n      }\n    }\n  }\n": types.CurrencyTvLsDocument,
    "\n  query Currencies {\n    currencies {\n      id\n      tokenAddress\n      tokenType\n      decimals\n      name\n      symbol\n      underlyingSymbol\n    }\n  }\n": types.CurrenciesDocument,
    "\n  query DailyLendBorrowVolumes {\n    dailyLendBorrowVolumes {\n      id\n      date\n      tradeType\n      marketIndex\n      currency {\n        id\n        symbol\n        underlyingSymbol\n      }\n      totalVolumeUnderlyingCash\n    }\n  }\n": types.DailyLendBorrowVolumesDocument,
};

export function graphql(source: "\n  query Accounts {\n    accounts {\n      id\n      lastUpdateTimestamp\n      hasCashDebt\n      hasPortfolioAssetDebt\n    }\n  }\n"): (typeof documents)["\n  query Accounts {\n    accounts {\n      id\n      lastUpdateTimestamp\n      hasCashDebt\n      hasPortfolioAssetDebt\n    }\n  }\n"];
export function graphql(source: "\n  query CurrencyTVLs($currencyId: String) {\n    currencyTvls(\n      where: { currency: $currencyId }\n      first: 1\n      orderBy: id\n      orderDirection: desc\n    ) {\n      id\n      usdValue\n      underlyingValue\n      currency {\n        id\n      }\n    }\n  }\n"): (typeof documents)["\n  query CurrencyTVLs($currencyId: String) {\n    currencyTvls(\n      where: { currency: $currencyId }\n      first: 1\n      orderBy: id\n      orderDirection: desc\n    ) {\n      id\n      usdValue\n      underlyingValue\n      currency {\n        id\n      }\n    }\n  }\n"];
export function graphql(source: "\n  query Currencies {\n    currencies {\n      id\n      tokenAddress\n      tokenType\n      decimals\n      name\n      symbol\n      underlyingSymbol\n    }\n  }\n"): (typeof documents)["\n  query Currencies {\n    currencies {\n      id\n      tokenAddress\n      tokenType\n      decimals\n      name\n      symbol\n      underlyingSymbol\n    }\n  }\n"];
export function graphql(source: "\n  query DailyLendBorrowVolumes {\n    dailyLendBorrowVolumes {\n      id\n      date\n      tradeType\n      marketIndex\n      currency {\n        id\n        symbol\n        underlyingSymbol\n      }\n      totalVolumeUnderlyingCash\n    }\n  }\n"): (typeof documents)["\n  query DailyLendBorrowVolumes {\n    dailyLendBorrowVolumes {\n      id\n      date\n      tradeType\n      marketIndex\n      currency {\n        id\n        symbol\n        underlyingSymbol\n      }\n      totalVolumeUnderlyingCash\n    }\n  }\n"];

export function graphql(source: string): unknown;
export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;