import {
  TransactionReceipt,
  TransactionResponse,
} from '@ethersproject/providers';
import { Network } from '@notional-finance/util';
import { Signer } from 'ethers';

// Set this as the runtime default
const CACHE_HOSTNAME =
  process.env['NX_DATA_URL'] || 'https://data-dev.notional.finance';

interface OnboardState {
  // These properties are only used to store the onboard state
  wallet?: {
    signer?: Signer;
    selectedChain?: Network;
    selectedAddress: string;
    hasSelectedChainError: boolean;
    isReadOnlyAddress?: boolean;
  };
}

interface NetworkState {
  selectedNetwork?: Network;
  isNetworkPending: boolean;
  isNetworkReady: boolean;
  cacheHostname: string;
}

interface AccountState {
  isAccountPending: boolean;
  isAccountReady: boolean;
  selectedAccount?: string;
}

interface TransactionState {
  sentTransactions: Record<string, TransactionResponse>;
  completedTransactions: Record<string, TransactionReceipt>;
}

export interface GlobalState
  extends Record<string, unknown>,
    NetworkState,
    AccountState,
    OnboardState,
    TransactionState {}

export const initialGlobalState: GlobalState = {
  isNetworkReady: false,
  isNetworkPending: false,
  cacheHostname: CACHE_HOSTNAME,
  isAccountPending: false,
  isAccountReady: false,
  sentTransactions: {},
  completedTransactions: {}, 
};
