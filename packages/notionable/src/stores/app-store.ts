import { flow, Instance, types } from 'mobx-state-tree';
import { FIAT_NAMES, FiatKeys } from '@notional-finance/core-entities';
import { THEME_VARIANTS } from '@notional-finance/util';
import { WalletModel } from './wallet-store';



const ErrorModel = types.model('ErrorModel', {
  code: types.number,
  msg: types.string,
});

export const GlobalErrorModel = types
  .model('GlobalErrorModel', {
    error: types.maybe(ErrorModel),
  })
  .actions((self) => ({
    setGlobalError(error: Instance<typeof ErrorModel>) {
      self.error = error;
    },
    clearError() {
      self.error = undefined;
    },
  }));

export type GlobalErrorType = Instance<typeof GlobalErrorModel>;

const HeroStatsModel = types
  .model('HeroStatsModel', {
    totalAccounts: types.number,
    totalDeposits: types.number,
    totalOpenDebt: types.number,
  })
  .actions((self) => ({
    fetchKpiData: flow(function* () {
      try {
        const response = yield fetch(
          `${
            process.env['NX_REGISTRY_URL'] ||
            'https://registry.notional.finance'
          }/all/kpi`
        );
        const data = yield response.json();
        self.totalAccounts = data.totalAccounts;
        self.totalDeposits = data.totalDeposits;
        self.totalOpenDebt = data.totalOpenDebt;
      } catch (error) {
        console.error('Error fetching KPI data:', error);
      }
    }),
  }));

export const AppStoreModel = types
  .model('AppStoreModel', {
    baseCurrency: types.enumeration('BaseCurrency', Object.values(FIAT_NAMES)),
    themeVariant: types.enumeration(
      'ThemeVariant',
      Object.values(THEME_VARIANTS)
    ),
    heroStats: HeroStatsModel,
    wallet: WalletModel,
    globalError: GlobalErrorModel,
    isAppReady: types.optional(types.boolean, false),
  })
  .actions((self) => ({
    setBaseCurrency(currency: FiatKeys) {
      self.baseCurrency = currency;
    },
    setThemeVariant(variant: THEME_VARIANTS) {
      self.themeVariant = variant;
    },
    setIsAppReady(isReady: boolean) {
      self.isAppReady = isReady;
    },
    afterCreate() {
      self.heroStats.fetchKpiData();
    },
  }));

export type AppStoreType = Instance<typeof AppStoreModel>;
