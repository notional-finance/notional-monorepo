import {
  TransactionReceipt,
  TransactionResponse,
} from '@ethersproject/providers';
import { Network } from '@notional-finance/util';
import {
  AccountDefinition,
  FiatKeys,
  PriceChange,
  TokenDefinition,
  HistoricalTrading,
} from '@notional-finance/core-entities';
import { getFromLocalStorage } from '@notional-finance/helpers';
import { Signer, ethers } from 'ethers';
import {
  CurrentFactors,
  GroupedHolding,
  PortfolioHolding,
  VaultHolding,
} from './account/holdings';
import { AccruedIncentives, TotalIncentives } from './account/incentives';
import { AccountRiskProfile } from '@notional-finance/risk-engine';
import { Community } from './account/communities';
import { getIndexedYields } from './data/yields';

const userSettings = getFromLocalStorage('userSettings');

export enum COMMUNITY_NAMES {
  DEGEN_SCORE = 'DEGEN_SCORE',
  V3_BETA_CONTEST = 'V3_BETA_CONTEST',
  L2DAO = 'L2DAO',
  CRYPTO_TESTERS = 'CRYPTO_TESTERS',
  LLAMAS = 'LLAMAS',
  CONTEST_PASS = 'CONTEST_PASS',
}

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

export const GATED_VAULTS: string[] = [];

// Set this as the runtime default
const CACHE_HOSTNAME =
  process.env['NX_REGISTRY_URL'] || 'https://registry.notional.finance';

export type NetworkLoadingState = 'Pending' | 'Loaded' | undefined;
export type CalculatedPriceChanges = {
  oneDay: PriceChange[];
  threeDay: PriceChange[];
  sevenDay: PriceChange[];
};

export interface NotionalError {
  code: number;
  msg: string;
}

/** Account state is written on a per network basis */
export interface AccountState {
  isSubgraphDown: boolean;
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
  currentFactors?: CurrentFactors;
  pointsPerDay?: number;
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
      link: string;
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
  communityMembership?: Community[];
  /** Checks if the address is sanctioned on wallet connection */
  isSanctionedAddress: boolean;

  /**
   * Set to true when addresses are switched and set to false when all networks
   * have loaded the account.
   */
  isAccountPending: boolean;

  /** Every supported network has an account object written to the state */
  networkAccounts?: Record<Network, AccountState>;
  totalPoints?: number;
}

/** These settings are associated with the user directly */
interface ErrorState {
  error?: NotionalError;
}

export interface GlobalState
  extends Record<string, unknown>,
    AddressState,
    TransactionState,
    ErrorState {}

export const initialGlobalState: GlobalState = {
  isSanctionedAddress: false,
  isAccountPending: false,
  sentTransactions: [],
  completedTransactions: {},
  pendingPnL: {
    [Network.all]: [],
    [Network.mainnet]: [],
    [Network.arbitrum]: [],
  },
};

export interface ArbPointsType {
  token: string;
  points: number;
  season_one: number;
  season_two: number;
  season_three: number;
  };


/** This is associated with the overall application state */
export interface ApplicationState extends Record<string, unknown> {
  /** If waiting for the site to load initially */
  networkState?: Record<Network, NetworkLoadingState>;
  /** URL of the cache hostname */
  cacheHostname: string;
  /** All yields calculated from the yield registry */
  allYields?: Record<Network, ReturnType<typeof getIndexedYields>>;
  /** All price changes calculated from the yield registry */
  priceChanges?: Record<Network, CalculatedPriceChanges>;
  /** All active accounts from the analytics registry */
  activeAccounts?: Record<Network, Record<string, number>>;
  historicalTrading?: Record<Network, HistoricalTrading>;
  baseCurrency: FiatKeys;
  /** Which country is the user located in */
  country?: string;
}

export const initialApplicationState: ApplicationState = {
  cacheHostname: CACHE_HOSTNAME,
  baseCurrency: userSettings?.baseCurrency ? userSettings?.baseCurrency : 'USD',
};
