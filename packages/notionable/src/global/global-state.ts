import {
  TransactionReceipt,
  TransactionResponse,
} from '@ethersproject/providers';
import { Network } from '@notional-finance/util';
import { THEME_VARIANTS } from '@notional-finance/shared-config';
import {
  getFromLocalStorage,
} from '@notional-finance/helpers';
import { Signer } from 'ethers';

const userSettings = getFromLocalStorage('userSettings');

// Set this as the runtime default
const CACHE_HOSTNAME =
  process.env['NX_DATA_URL'] || 'https://data-dev.notional.finance';

export interface NotionalError {
  code: number;
  msg: string;
}

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
interface UserSettingsState {
  themeVariant: THEME_VARIANTS;
}

interface TransactionState {
  sentTransactions: Record<string, TransactionResponse>;
  completedTransactions: Record<string, TransactionReceipt>;
}

interface ErrorState {
  error?: NotionalError;
}

export interface GlobalState
  extends Record<string, unknown>,
    NetworkState,
    AccountState,
    OnboardState,
    TransactionState,
    UserSettingsState,
    ErrorState {}

export const initialGlobalState: GlobalState = {
  isNetworkReady: false,
  isNetworkPending: false,
  cacheHostname: CACHE_HOSTNAME,
  isAccountPending: false,
  isAccountReady: false,
  sentTransactions: {},
  completedTransactions: {},
  themeVariant: userSettings?.themeVariant ? userSettings?.themeVariant : THEME_VARIANTS.LIGHT,
};
