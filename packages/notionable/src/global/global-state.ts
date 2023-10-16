import {
  TransactionReceipt,
  TransactionResponse,
} from '@ethersproject/providers';
import { Network } from '@notional-finance/util';
import { THEME_VARIANTS } from '@notional-finance/util';
import {
  FiatKeys,
  TokenBalance,
  TokenDefinition,
} from '@notional-finance/core-entities';
import { getFromLocalStorage } from '@notional-finance/helpers';
import { Signer } from 'ethers';

const userSettings = getFromLocalStorage('userSettings');

export enum BETA_ACCESS {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  REJECTED = 'rejected',
}

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
    isReadOnlyAddress?: boolean;
    label?: string;
  };
}

interface NetworkState {
  selectedNetwork?: Network;
  isNetworkPending: boolean;
  isNetworkReady: boolean;
  cacheHostname: string;
  hasSelectedChainError: boolean;
}

interface AccountState {
  isAccountPending: boolean;
  isAccountReady: boolean;
  selectedAccount?: string;
  hasContestNFT?: BETA_ACCESS;
  contestTokenId?: string;
  // Groupings of 1 asset and 1 debt in the same currency
  holdingsGroups: {
    asset: TokenBalance;
    debt: TokenBalance;
    presentValue: TokenBalance;
    leverageRatio: number;
  }[];
}
interface UserSettingsState {
  themeVariant: THEME_VARIANTS;
  baseCurrency: FiatKeys;
}

interface ExportControlsState {
  country?: string;
  isSanctionedAddress: boolean;
}

interface TransactionState {
  sentTransactions: Record<string, TransactionResponse>;
  awaitingBalanceChanges: Record<string, TokenDefinition[]>;
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
    ExportControlsState,
    ErrorState {}

export const initialGlobalState: GlobalState = {
  hasSelectedChainError: false,
  isNetworkReady: false,
  isNetworkPending: false,
  cacheHostname: CACHE_HOSTNAME,
  isAccountPending: false,
  isAccountReady: false,
  holdingsGroups: [],
  sentTransactions: {},
  completedTransactions: {},
  awaitingBalanceChanges: {},
  themeVariant: userSettings?.themeVariant
    ? userSettings?.themeVariant
    : THEME_VARIANTS.LIGHT,
  baseCurrency: userSettings?.baseCurrency ? userSettings?.baseCurrency : 'USD',
  isSanctionedAddress: false,
};
