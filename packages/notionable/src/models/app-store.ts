import { flow, Instance, types } from 'mobx-state-tree';
import { FIAT_NAMES, FiatKeys } from '@notional-finance/core-entities';
import { getFromLocalStorage, Network, THEME_VARIANTS } from '@notional-finance/util';
import { WalletModel } from './wallet-store';

const userSettings = getFromLocalStorage('userSettings');

const HeroStatsModel = types
  .model('HeroStatsModel', {
    totalAccounts: types.number,
    totalDeposits: types.number,
    totalOpenDebt: types.number,
  })
  .actions((self) => ({
    fetchKpiData: flow(function* () {
      try {
        const response = yield fetch(`${process.env['NX_DATA_URL']}/kpi`);
        const data = yield response.json();
        self.totalAccounts = data.totalAccounts;
        self.totalDeposits = data.totalDeposits;
        self.totalOpenDebt = data.totalOpenDebt;
      } catch (error) {
        console.error('Error fetching KPI data:', error);
      }
    }),
  }))

export const AppStoreModel = types
  .model('AppStoreModel', {
    baseCurrency: types.enumeration('BaseCurrency', Object.values(FIAT_NAMES)),
    themeVariant: types.enumeration(
      'ThemeVariant',
      Object.values(THEME_VARIANTS)
    ),
    heroStats: HeroStatsModel,
    wallet: WalletModel,
  })
  .actions((self) => ({
    setBaseCurrency(currency: FiatKeys) {
      self.baseCurrency = currency;
    },
    setThemeVariant(variant: THEME_VARIANTS) {
      self.themeVariant = variant;
    },
    afterCreate() {
      self.heroStats.fetchKpiData();
    },
  }))

export type AppStoreType = Instance<typeof AppStoreModel>;

export const appStore = AppStoreModel.create({
  baseCurrency: userSettings?.baseCurrency ? userSettings?.baseCurrency : 'USD',
  themeVariant: userSettings?.themeVariant
    ? userSettings?.themeVariant
    : THEME_VARIANTS.LIGHT,
  heroStats: {
    totalAccounts: 0,
    totalDeposits: 0,
    totalOpenDebt: 0,
  },
  wallet: { 
    isSanctionedAddress: false,
    isAccountPending: false,
    userWallet: {
      selectedChain: Network.mainnet,
      selectedAddress: '',
      isReadOnlyAddress: false,
      label: '',
    }
  }
})
