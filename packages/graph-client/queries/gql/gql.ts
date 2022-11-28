/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

const documents = {
    "\n  query Currencies {\n    currencies {\n      id\n      tokenAddress\n      tokenType\n      decimals\n      name\n      symbol\n    }\n  }\n": types.CurrenciesDocument,
};

export function graphql(source: "\n  query Currencies {\n    currencies {\n      id\n      tokenAddress\n      tokenType\n      decimals\n      name\n      symbol\n    }\n  }\n"): (typeof documents)["\n  query Currencies {\n    currencies {\n      id\n      tokenAddress\n      tokenType\n      decimals\n      name\n      symbol\n    }\n  }\n"];

export function graphql(source: string): unknown;
export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;