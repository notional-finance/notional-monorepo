import {
  getNetworkModel,
  NetworkClientModel,
  NotionalTypes,
} from '@notional-finance/core-entities';
import { types, Instance } from 'mobx-state-tree';
import { PortfolioStoreModel } from './portfolio-store';
import {
  getFromLocalStorage,
  Network,
  THEME_VARIANTS,
} from '@notional-finance/util';
import { createContext } from 'react';
import { AppStoreModel } from './app-store';
import { WalletModel } from './wallet-store';

export type RootStoreType = Instance<typeof RootStore>;
export type NetworkClientModelType = Instance<typeof NetworkClientModel>;
export type AppStoreModelType = Instance<typeof AppStoreModel>;
export type PortfolioStoreModelType = Instance<typeof PortfolioStoreModel>;
export interface RootStoreInterface {
  getNetworkClient: (network: Network) => NetworkClientModelType;
  appStore: AppStoreModelType;
}

const userSettings = getFromLocalStorage('userSettings');

const RootStore = types
  .model('RootStore', {
    portfolioStore: PortfolioStoreModel,
    appStore: AppStoreModel,
    walletStore: WalletModel,
    network: NotionalTypes.Network,
    route: types.string,
  })
  .actions((self) => ({
    setNetwork(network: Network) {
      self.network = network;
    },
    setRoute(route: string) {
      self.route = route;
    },
  }))
  .views((self) => ({
    getNetworkClient(network: Network) {
      return getNetworkModel(network);
    },
    get currentNetworkClient() {
      return getNetworkModel(self.network);
    },
  }));

export const createRootStore = (): RootStoreType => {
  const rootStore = RootStore.create({
    walletStore: {
      isSanctionedAddress: false,
      isAccountPending: false,
      userWallet: {
        selectedChain: undefined,
        selectedAddress: '',
        isReadOnlyAddress: false,
        label: '',
      },
    },
    portfolioStore: {
      stateZeroEarnData: {
        defaultSymbol: '',
        data: [],
        tokenList: [],
      },
      stateZeroBorrowData: {
        defaultSymbol: '',
        data: [],
        tokenList: [],
      },
      stateZeroLeveragedData: {
        defaultSymbol: '',
        data: [],
        tokenList: [],
      },
      pointsStore: {
        arbPoints: [],
        totalPoints: 0,
      },
    },
    network: userSettings?.network ? userSettings?.network : Network.mainnet,
    route: '',
    appStore: {
      baseCurrency: userSettings?.baseCurrency
        ? userSettings?.baseCurrency
        : 'USD',
      themeVariant: userSettings?.themeVariant
        ? userSettings?.themeVariant
        : THEME_VARIANTS.LIGHT,
      heroStats: {
        totalAccounts: 0,
        totalDeposits: 0,
        totalOpenDebt: 0,
      },
      globalError: {
        error: undefined,
      },
    },
  });

  return rootStore;
};

export const RootStoreContext = createContext<RootStoreType | null>(null);
