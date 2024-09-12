
import { NetworkClientModel } from '@notional-finance/core-entities';
import { types, Instance, } from 'mobx-state-tree';
import { PortfolioStoreModel } from './portfolio-store';
import { getFromLocalStorage, Network, THEME_VARIANTS } from '@notional-finance/util';
import { createContext } from 'react';
import { AppStoreModel } from './app-store';


export type RootStoreModel = Instance<typeof RootStore>
export type NetworkClientModelType = Instance<typeof NetworkClientModel>
export type AppStoreModelType = Instance<typeof AppStoreModel>
export type PortfolioStoreModelType = Instance<typeof PortfolioStoreModel>

const userSettings = getFromLocalStorage('userSettings');

export type RootStoreType = {
  networkStore: NetworkClientModelType
  portfolioStore: PortfolioStoreModelType
  appStore: AppStoreModelType
}

const RootStore = types.model("RootStore", {
  networkStore: NetworkClientModel, 
  portfolioStore: PortfolioStoreModel,
  appStore: AppStoreModel,
})
  export const createRootStore = (): RootStoreModel => {
    const rootStore = RootStore.create({
      networkStore: {
        network: Network.mainnet
      },
      portfolioStore: {
        pointsStore: {
          arbPoints: [],
          totalPoints: 0,
        }
      },
      appStore: {
        baseCurrency: userSettings?.baseCurrency ? userSettings?.baseCurrency : 'USD',
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
      }
    })

      return rootStore
  }

  export const RootStoreContext = createContext<RootStoreModel | null>(null);
