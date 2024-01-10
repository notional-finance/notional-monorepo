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

export const GATED_VAULTS: string[] = [];

// Set this as the runtime default
const CACHE_HOSTNAME =
  process.env['NX_DATA_URL'] || 'https://data-dev.notional.finance';

type NetworkLoadingState = 'Pending' | 'Loaded' | undefined;

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
  /** If waiting for the site to load initially */
  networkState?: Record<Network, NetworkLoadingState>;
  /** URL of the cache hostname */
  cacheHostname: string;
}

interface AccountState {
  isAccountPending: boolean;
  isAccountReady: boolean;
  selectedAccount?: string;
  // TODO: convert these to community NFTs
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
    incentivesIn100Seconds: TokenBalance[];
  }[];
  /** Which network is the porfolio currently showing */
  selectedPortfolioNetwork?: Network;
  /** Which networks does the account have a portfolio on */
  accountNetworks?: Network[];
}

interface UserSettingsState {
  themeVariant: THEME_VARIANTS;
  baseCurrency: FiatKeys;
}

interface ExportControlsState {
  country?: string;
  isSanctionedAddress: boolean;
}

// TODO: this needs to be on a per network basis
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
