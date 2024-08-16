import { useObserver } from 'mobx-react-lite';
import { AppStore } from '@notional-finance/notionable';
import { FiatKeys } from '@notional-finance/core-entities';
import { THEME_VARIANTS } from '@notional-finance/util';
import { useAppContext } from './use-notional';

export const useAppState = () => {
  const { updateAppState } = useAppContext();
  return useObserver(() => {
    return {
      setBaseCurrency: (currency: FiatKeys) => {
        updateAppState({baseCurrency: currency});
        AppStore.setBaseCurrency(currency)
      },
      setThemeVariant: (variant: THEME_VARIANTS) =>
        AppStore.setThemeVariant(variant),
      baseCurrency: AppStore.baseCurrency,
      themeVariant: AppStore.themeVariant,
    };
  });
};

export const useHeroStats = () => {
  AppStore.heroStats.fetchKpiData();
  return useObserver(() => {
    return {
      totalAccounts: AppStore.heroStats.totalAccounts,
      totalDeposits: AppStore.heroStats.totalDeposits,
      totalOpenDebt: AppStore.heroStats.totalOpenDebt,
    };
  });
};

export default useAppState;
