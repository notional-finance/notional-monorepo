import { Instance, types } from 'mobx-state-tree';
import { FIAT_NAMES, FiatKeys } from '@notional-finance/core-entities';
import { THEME_VARIANTS } from '@notional-finance/util';

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

export const AppStoreModel = types
  .model('AppStoreModel', {
    baseCurrency: types.enumeration('BaseCurrency', Object.values(FIAT_NAMES)),
    themeVariant: types.enumeration(
      'ThemeVariant',
      Object.values(THEME_VARIANTS)
    ),
    globalError: GlobalErrorModel,
    isAppReady: types.optional(types.boolean, false),
    isMobileView: types.optional(types.boolean, false),
    mobileNavOpen: types.optional(types.boolean, false),
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
    setIsMobileView(isMobile: boolean) {
      self.isMobileView = isMobile;
    },
    setMobileNavOpen(isOpen: boolean) {
      self.mobileNavOpen = isOpen;
    },
  }));

export type AppStoreType = Instance<typeof AppStoreModel>;
