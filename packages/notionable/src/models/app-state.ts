import { types } from 'mobx-state-tree';
import { FIAT_NAMES, FiatKeys } from '@notional-finance/core-entities';
import { getFromLocalStorage, THEME_VARIANTS } from '@notional-finance/util';

const userSettings = getFromLocalStorage('userSettings');

export const AppState = types
  .model('AppState', {
    baseCurrency: types.enumeration('BaseCurrency', Object.values(FIAT_NAMES)),
    themeVariant: types.enumeration(
      'ThemeVariant',
      Object.values(THEME_VARIANTS)
    ),
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
});
