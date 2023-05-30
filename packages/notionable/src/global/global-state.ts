import { Network } from '@notional-finance/util';

// Set this as the runtime default
const CACHE_HOSTNAME =
  process.env['NX_DATA_URL'] || 'https://data-dev.notional.finance';

interface OnboardState {
  // These properties are only used to store the onboard state
  wallet?: {
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

export interface GlobalState
  extends Record<string, unknown>,
    NetworkState,
    AccountState,
    OnboardState {}

export const initialGlobalState: GlobalState = {
  isNetworkReady: false,
  isNetworkPending: false,
  cacheHostname: CACHE_HOSTNAME,
  isAccountPending: false,
  isAccountReady: false,
};
