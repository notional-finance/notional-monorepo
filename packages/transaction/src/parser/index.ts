import { TokenBalance, TokenDefinition } from '@notional-finance/core-entities';
import {
  Transfer as _TransferType,
  TransferBundle,
} from '../.graphclient/index';
import { parseTransactionLogs } from './transfers';

export { parseTransactionLogs } from './transfers';
export { parseTransactionType } from './transaction';

export type ParsedLogs = ReturnType<typeof parseTransactionLogs>;

export interface Transfer
  extends Omit<
    _TransferType,
    | 'id'
    | 'blockNumber'
    | 'transactionHash'
    | 'operator'
    | 'valueInUnderlying'
    | 'from'
    | 'to'
    | 'underlying'
    | 'token'
  > {
  from: string;
  to: string;
  value: TokenBalance;
  token: TokenDefinition;
  underlying?: string;
}

export interface Bundle
  extends Omit<
    TransferBundle,
    'id' | 'blockNumber' | 'timestamp' | 'transactionHash' | 'transfers'
  > {
  transfers: Transfer[];
}

export interface Marker {
  logIndex: number;
  name: string;
}

export interface Transaction {
  name: string;
  startLogIndex: number;
  endLogIndex: number;
  marker?: Marker;
  bundles: Bundle[];
  transfers: Transfer[];
}

// Token Type
export const Underlying = 'Underlying';
export const nToken = 'nToken';
export const PrimeCash = 'PrimeCash';
export const PrimeDebt = 'PrimeDebt';
export const fCash = 'fCash';
export const VaultShare = 'VaultShare';
export const VaultDebt = 'VaultDebt';
export const VaultCash = 'VaultCash';
export const NOTE = 'NOTE';

// System Account
export const None = 'None';
export const ZeroAddress = 'ZeroAddress';
export const FeeReserve = 'FeeReserve';
export const SettlementReserve = 'SettlementReserve';
// export const nToken = 'nToken'; NOTE: duplicated above
export const Vault = 'Vault';
export const Notional = 'Notional';

// Transfer Type
export const Mint = 'Mint';
export const Burn = 'Burn';
export const _Transfer = 'Transfer';
