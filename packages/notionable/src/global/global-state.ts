import {
  TransactionReceipt,
  TransactionResponse,
} from '@ethersproject/providers';
import { Network } from '@notional-finance/util';
import { THEME_VARIANTS } from '@notional-finance/util';
import {
  AccountDefinition,
  FiatKeys,
  PriceChange,
  TokenDefinition,
  YieldData,
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

export enum PARTNERS {
  DEGEN_SCORE = 'degen-score',
  CRYPTO_TESTERS = 'crypto-testers',
  L2DAO = 'l2dao',
  LLAMAS = 'llamas',
}


export const ACCESS_NFTS = {
  // TODO: Update these addresses to the correct ones
  [PARTNERS.DEGEN_SCORE]: {
    address: '0x0521FA0bf785AE9759C7cB3CBE7512EbF20Fbdaa',
    network: Network.Mainnet,
    name: 'DEGEN SCORE',
    id: PARTNERS.DEGEN_SCORE,
  },
  [PARTNERS.CRYPTO_TESTERS]: {
    address: '0x0521FA0bf785AE9759C7cB3CBE7512EbF20Fbdaa',
    network: Network.Mainnet,
    name: 'Cryptotesters',
    id: PARTNERS.CRYPTO_TESTERS,
  },
  [PARTNERS.L2DAO]: {
    address: '0x0521FA0bf785AE9759C7cB3CBE7512EbF20Fbdaa',
    network: Network.Mainnet,
    name: 'L2DAO',
    id: PARTNERS.L2DAO
  },
  [PARTNERS.LLAMAS]: {
    address: '0x0521FA0bf785AE9759C7cB3CBE7512EbF20Fbdaa',
    network: Network.Mainnet,
    name: 'Llama',
    id: PARTNERS.LLAMAS,
  },
  // BETA_CONTEST: {
  //   address: '0x7c2d3a5fa3b41f4e6e2086bb19372016a7533f3e',
  //   network: Network.ArbitrumOne,
  //   name: 'Notional Beta Contest',
  // },
};

export const GATED_VAULTS: string[] = [];

// Set this as the runtime default
const CACHE_HOSTNAME =
  process.env['NX_DATA_URL'] || 'https://data-dev.notional.finance';

export type NetworkLoadingState = 'Pending' | 'Loaded' | undefined;

export interface NotionalError {
  code: number;
  msg: string;
}

/** Account state is written on a per network basis */
export interface AccountState {
  isAccountReady: boolean;
  portfolioLiquidationPrices?: ReturnType<
    AccountRiskProfile['getAllLiquidationPrices']
  >;
  riskProfile?: AccountRiskProfile;
  accountDefinition?: AccountDefinition;
  portfolioHoldings?: PortfolioHolding[];
  groupedHoldings?: GroupedHolding[];
  vaultHoldings?: VaultHolding[];
  accruedIncentives?: AccruedIncentives[];
  totalIncentives?: TotalIncentives;
}

export interface TransactionState {
  sentTransactions: {
    hash: string;
    network: Network;
    response: TransactionResponse;
    tokens: TokenDefinition[] | undefined;
  }[];
  completedTransactions: Record<string, TransactionReceipt>;
  pendingPnL: Record<
    Network,
    {
      hash: string;
      blockNumber: number;
      tokens: TokenDefinition[];
    }[]
  >;
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
  /** These are checked on wallet connection and associated with the wallet */
  communityMembership?: CommunityName[];
  /** Checks if the address is sanctioned on wallet connection */
  isSanctionedAddress: boolean;

  /**
   * Set to true when addresses are switched and set to false when all networks
   * have loaded the account.
   */
  isAccountPending: boolean;

  /** Every supported network has an account object written to the state */
  networkAccounts?: Record<Network, AccountState>;
}

/** This is associated with the overall application state */
interface ApplicationState {
  /** If waiting for the site to load initially */
  networkState?: Record<Network, NetworkLoadingState>;
  /** URL of the cache hostname */
  cacheHostname: string;
  /** All yields calculated from the yield registry */
  allYields?: Record<Network, YieldData[]>;
  /** All price changes calculated from the yield registry */
  priceChanges?: Record<
    Network,
    { oneDay: PriceChange[]; sevenDay: PriceChange[] }
  >;
  /** All active accounts from the analytics registry */
  activeAccounts?: Record<Network, Record<string, number>>;
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
    TransactionState,
    ErrorState {}

export const initialGlobalState: GlobalState = {
  cacheHostname: CACHE_HOSTNAME,
  themeVariant: userSettings?.themeVariant
    ? userSettings?.themeVariant
    : THEME_VARIANTS.LIGHT,
  baseCurrency: userSettings?.baseCurrency ? userSettings?.baseCurrency : 'USD',
  isSanctionedAddress: false,
  isAccountPending: false,
  sentTransactions: [],
  completedTransactions: {},
  pendingPnL: {
    [Network.All]: [],
    [Network.Mainnet]: [],
    [Network.ArbitrumOne]: [],
    [Network.Goerli]: [],
  },
};
