import {
  AccountDefinition,
  getNetworkModel,
  NetworkClientModel,
} from '@notional-finance/core-entities';
import { types, Instance } from 'mobx-state-tree';
import {
  getFromLocalStorage,
  Network,
  THEME_VARIANTS,
  TransactionStatus,
} from '@notional-finance/util';
import { AppStoreModel } from './app-store';
import { WalletModel } from './wallet-store';
import { TradeModel } from './TradeModel';
import { AllTradeTypes } from '../base-trade/base-trade-store';
import { AccountPortfolioModel } from './PortfolioModel';
import { checkMobileView } from '@notional-finance/helpers';

export type RootStoreType = Instance<typeof RootStore>;
export type NetworkClientModelType = Instance<typeof NetworkClientModel>;
export type AppStoreModelType = Instance<typeof AppStoreModel>;
export type WalletStoreType = Instance<typeof WalletModel>;
export interface RootStoreInterface {
  network: Network;
  getNetworkClient: (network: Network) => NetworkClientModelType;
  getAccountDefinition: (network: Network) => AccountDefinition | null;
  getNetworkAccount: (
    network: Network
  ) => Instance<typeof AccountPortfolioModel> | undefined;
  appStore: AppStoreModelType;
}

const userSettings = getFromLocalStorage('userSettings');

const RootStore = types
  .model('RootStore', {
    appStore: AppStoreModel,
    walletStore: WalletModel,
    route: types.string,
    tradeModel: types.maybe(TradeModel),
  })
  .actions((self) => ({
    setTradeModel(props: {
      selectedNetwork: Network;
      tradeType: AllTradeTypes;
      selectedDepositToken?: string;
      selectedToken?: string;
      vaultAddress?: string;
    }) {
      self.tradeModel = TradeModel.create(props);
    },
    clearTradeModel() {
      self.tradeModel = undefined;
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
    getNetworkAccount(network: Network) {
      return self.walletStore.networkAccounts.get(network);
    },
  }));

export const createRootStore = (): RootStoreType => {
  const rootStore = RootStore.create({
    walletStore: {
      isSanctionedAddress: false,
      isBetaUser: false,
      isAccountPending: false,
      transactionStatus: TransactionStatus.NONE,
      transactionHash: '',
      sentTransactions: [],
      pendingPnL: {},
      userWallet: {
        selectedChain: undefined,
        selectedAddress: '',
        isReadOnlyAddress: false,
        label: '',
      },
    },
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
      mobileNavOpen: false,
      isMobileView: checkMobileView(),
    },
  });

  return rootStore;
};
