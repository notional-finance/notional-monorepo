import { DurableObjectNamespace } from '@cloudflare/workers-types';
import { BlockTriggerEvent } from 'defender-autotask-utils';
import { BigNumber } from 'ethers';

export interface SentinalRequest {
  events: BlockTriggerEvent[];
}
export interface APIEnv {
  EXCHANGE_RATES_DO: DurableObjectNamespace;
  KPIS_DO: DurableObjectNamespace;
  ACCOUNTS_DO: DurableObjectNamespace;
  EXCHANGE_RATES_NAME: string;
  KPIS_NAME: string;
  ACCOUNTS_NAME: string;
  SENTINEL_ID: string;
}

export interface GetExchangeRatesResponse {
  blockNumber: number;
  network: string;
  results: ExchangeRate[];
}

export interface ExchangeRate {
  quote: string;
  base: string;
  value: BigNumber;
  decimals: number;
  metadata: Record<string, unknown>;
}

export enum EventSignature {
  AccountContextUpdate = 'AccountContextUpdate(address)',
  VaultEnterPosition = 'VaultEnterPosition(address,address,uint256,uint256)',
}

export const corsHeaders = {
  'content-type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Max-Age': '86400',
};

export interface VaultDOStorage {
  [key: string]: string[]; // vault address -> account addresses
}

export interface AccountDOStorage {
  accounts: string[];
  vaults: VaultDOStorage;
}
