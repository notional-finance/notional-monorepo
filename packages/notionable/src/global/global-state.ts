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
import { Signer, ethers } from 'ethers';

const userSettings = getFromLocalStorage('userSettings');

export enum BETA_ACCESS {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  REJECTED = 'rejected',
}

export const ACCESS_NFTS = {
  DEGEN_SCORE: {
    address: '0x0521FA0bf785AE9759C7cB3CBE7512EbF20Fbdaa',
    network: Network.Mainnet,
  },
  BETA_CONTEST: {
    address: '0x7c2d3a5fa3b41f4e6e2086bb19372016a7533f3e',
    network: Network.ArbitrumOne,
  },
};

export const GATED_VAULTS = [
  '0x3df035433cface65b6d68b77cc916085d020c8b8',
  '0x8ae7a8789a81a43566d0ee70264252c0db826940',
];

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
    provider?: ethers.providers.Provider;
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
  holdingsGroups?: {
    asset: TokenBalance;
    debt: TokenBalance;
    presentValue: TokenBalance;
    leverageRatio: number;
  }[];
  accruedIncentives?: {
    currencyId: number;
    incentives: TokenBalance[];
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
  awaitingBalanceChanges: Record<string, TokenDefinition[] | undefined>;
  completedTransactions: Record<string, TransactionReceipt>;
  pendingTokens: TokenDefinition[];
  pendingTxns: string[];
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
  pendingTokens: [],
  pendingTxns: [],
  themeVariant: userSettings?.themeVariant
    ? userSettings?.themeVariant
    : THEME_VARIANTS.LIGHT,
  baseCurrency: userSettings?.baseCurrency ? userSettings?.baseCurrency : 'USD',
  isSanctionedAddress: false,
};
