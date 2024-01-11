import {
  TransactionReceipt,
  TransactionResponse,
} from '@ethersproject/providers';
import { Network } from '@notional-finance/util';
import { THEME_VARIANTS } from '@notional-finance/util';
import {
  AccountDefinition,
  FiatKeys,
  TokenDefinition,
} from '@notional-finance/core-entities';
import { getFromLocalStorage } from '@notional-finance/helpers';
import { Signer, ethers } from 'ethers';
import {
  GroupedHolding,
  PortfolioHolding,
  VaultHolding,
} from './account/holdings';
import { AccruedIncentives, TotalIncentives } from './account/incentives';
import { AccountRiskProfile } from '@notional-finance/risk-engine';
import { CommunityName } from './account/communities';

const userSettings = getFromLocalStorage('userSettings');

export enum BETA_ACCESS {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  REJECTED = 'rejected',
}

export const GATED_VAULTS: Record<string, CommunityName[]> = {};

// Set this as the runtime default
const CACHE_HOSTNAME =
  process.env['NX_DATA_URL'] || 'https://data-dev.notional.finance';

type NetworkLoadingState = 'Pending' | 'Loaded' | undefined;

export interface NotionalError {
  code: number;
  msg: string;
}

/** Account state is written on a per network basis */
export interface AccountState {
  isAccountReady: boolean;
  riskProfile?: AccountRiskProfile;
  accountDefinition?: AccountDefinition;
  portfolioHoldings?: PortfolioHolding[];
  groupedHoldings?: GroupedHolding[];
  vaultHoldings?: VaultHolding[];
  accruedIncentives?: AccruedIncentives[];
  totalIncentives?: TotalIncentives;
}

export interface TransactionState {
  sentTransactions: Record<string, TransactionResponse>;
  awaitingBalanceChanges: Record<string, TokenDefinition[] | undefined>;
  completedTransactions: Record<string, TransactionReceipt>;
  pendingTokens: TokenDefinition[];
  pendingTxns: string[];
}

/** This is associated with an address */
interface AddressState {
  /** These properties are written from the onboard or wallet manager */
  wallet?: {
    signer?: Signer;
    selectedChain?: Network;
    selectedAddress: string;
    isReadOnlyAddress?: boolean;
    label?: string;
    provider?: ethers.providers.Provider;
  };
  hasTrackedIdentify: boolean;
  /** These are checked on wallet connection and associated with the wallet */
  communityMembership?: CommunityName[];
  /** Checks if the address is sanctioned on wallet connection */
  isSanctionedAddress: boolean;

  /** Every supported network has an account object written to the state */
  networkAccounts?: Record<Network, AccountState>;
  /** Every supported network has a set of transactions associated with it */
  networkTransactions?: Record<Network, TransactionState>;
}

/** This is associated with the overall application state */
interface ApplicationState {
  /** If waiting for the site to load initially */
  networkState?: Record<Network, NetworkLoadingState>;
  /** URL of the cache hostname */
  cacheHostname: string;
}

/** These settings are associated with the user directly */
interface UserSettingsState {
  themeVariant: THEME_VARIANTS;
  baseCurrency: FiatKeys;
  /** Which network is the porfolio currently showing */
  selectedPortfolioNetwork?: Network;
  /** Which country is the user located in */
  country?: string;
}

interface ErrorState {
  error?: NotionalError;
}

export interface GlobalState
  extends Record<string, unknown>,
    ApplicationState,
    AddressState,
    UserSettingsState,
    ErrorState {}

export const initialGlobalState: GlobalState = {
  cacheHostname: CACHE_HOSTNAME,
  themeVariant: userSettings?.themeVariant
    ? userSettings?.themeVariant
    : THEME_VARIANTS.LIGHT,
  baseCurrency: userSettings?.baseCurrency ? userSettings?.baseCurrency : 'USD',
  isSanctionedAddress: false,
  hasTrackedIdentify: false,
};
