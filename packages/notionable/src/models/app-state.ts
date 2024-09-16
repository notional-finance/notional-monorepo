import { flow, types } from 'mobx-state-tree';
import { FIAT_NAMES, FiatKeys } from '@notional-finance/core-entities';
import { getFromLocalStorage, THEME_VARIANTS } from '@notional-finance/util';

const userSettings = getFromLocalStorage('userSettings');

const HeroStats = types
  .model('HeroStats', {
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

export const AppState = types
  .model('AppState', {
    baseCurrency: types.enumeration('BaseCurrency', Object.values(FIAT_NAMES)),
    themeVariant: types.enumeration(
      'ThemeVariant',
      Object.values(THEME_VARIANTS)
    ),
    heroStats: HeroStats,
  })
  .actions((self) => ({
    setBaseCurrency(currency: FiatKeys) {
      self.baseCurrency = currency;
    },
    setThemeVariant(variant: THEME_VARIANTS) {
      self.themeVariant = variant;
    },
  }));

export const AppStore = AppState.create({
  baseCurrency: userSettings?.baseCurrency ? userSettings?.baseCurrency : 'USD',
  themeVariant: userSettings?.themeVariant
    ? userSettings?.themeVariant
    : THEME_VARIANTS.LIGHT,
  heroStats: {
    totalAccounts: 0,
    totalDeposits: 0,
    totalOpenDebt: 0,
  },
});
