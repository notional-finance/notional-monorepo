import { NetworkClientModel } from '@notional-finance/core-entities';
import { types, Instance } from 'mobx-state-tree';
import { PortfolioStoreModel } from './portfolio-store';
import {
  getFromLocalStorage,
  Network,
  THEME_VARIANTS,
} from '@notional-finance/util';
import { createContext } from 'react';
import { AppStoreModel } from './app-store';

export type RootStoreType = Instance<typeof RootStore>;
export type NetworkClientModelType = Instance<typeof NetworkClientModel>;
export type AppStoreModelType = Instance<typeof AppStoreModel>;
export type PortfolioStoreModelType = Instance<typeof PortfolioStoreModel>;

const userSettings = getFromLocalStorage('userSettings');

const RootStore = types
  .model('RootStore', {
    mainnetStore: NetworkClientModel,
    arbitrumStore: NetworkClientModel,
    allNetworksStore: NetworkClientModel,
    portfolioStore: PortfolioStoreModel,
    appStore: AppStoreModel,
  })
  .views((self) => {
    const getNetworkClient = (network: Network) => {
      switch (network) {
        case Network.mainnet:
          return self.mainnetStore;
        case Network.arbitrum:
          return self.arbitrumStore;
        case Network.all:
          return self.allNetworksStore;
        default:
          throw new Error('Network not supported');
      }
    };
    return { getNetworkClient };
  });
export const createRootStore = (): RootStoreType => {
  const rootStore = RootStore.create({
    mainnetStore: {
      network: Network.mainnet,
    },
    arbitrumStore: {
      network: Network.arbitrum,
    },
    allNetworksStore: {
      network: Network.all,
    },
    portfolioStore: {
      pointsStore: {
        arbPoints: [],
        totalPoints: 0,
      },
    },
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
      wallet: {
        isSanctionedAddress: false,
        isAccountPending: false,
        userWallet: {
          selectedChain: undefined,
          selectedAddress: '',
          isReadOnlyAddress: false,
          label: '',
        },
      },
    },
  });

  return rootStore;
};

export const RootStoreContext = createContext<RootStoreType | null>(null);
