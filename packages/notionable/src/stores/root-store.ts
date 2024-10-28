import {
  AccountDefinition,
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
import { TradeModel } from './trades/TradeModel';
import { AllTradeTypes } from '../base-trade/base-trade-store';

export type RootStoreType = Instance<typeof RootStore>;
export type NetworkClientModelType = Instance<typeof NetworkClientModel>;
export type AppStoreModelType = Instance<typeof AppStoreModel>;
export type PortfolioStoreModelType = Instance<typeof PortfolioStoreModel>;
export interface RootStoreInterface {
  network: Network;
  getNetworkClient: (network: Network) => NetworkClientModelType;
  getAccountDefinition: (network: Network) => AccountDefinition | null;
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
    tradeModel: types.maybe(TradeModel),
  })
  .actions((self) => ({
    setTradeModel(props: {
      selectedNetwork: Network;
      tradeType: AllTradeTypes;
      selectedDepositToken?: string;
      selectedToken?: string;
    }) {
      self.tradeModel = TradeModel.create(props);
    },
    clearTradeModel() {
      self.tradeModel = undefined;
    },
    setNetwork(network: Network) {
      self.network = network;
    },
    setRoute(route: string) {
      self.route = route;
    },
  }))
  .views((self) => ({
    getAccountDefinition(network: Network) {
      return self.walletStore.getAccountDefinition(network) || null;
    },
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
