import { FiatKeys, Registry } from '@notional-finance/core-entities';
import { Network, THEME_VARIANTS, getFromLocalStorage, setInLocalStorage } from '@notional-finance/util';
import { useState } from 'react';

export const useUserSettings = () => {
  const userSettings = getFromLocalStorage('userSettings');
  const defaultBaseCurrency = userSettings?.baseCurrency || 'USD';
  const defaultThemeVariant = userSettings?.themeVariant ? userSettings?.themeVariant : THEME_VARIANTS.LIGHT;
  const [baseCurrency, setBaseCurrency] = useState<FiatKeys>(defaultBaseCurrency);
  const [themeVariant, setThemeVariant] = useState<THEME_VARIANTS>(defaultThemeVariant);

  const updateBaseCurrency = (currency: FiatKeys) => {
    setBaseCurrency(currency);
    setInLocalStorage('userSettings', { ...userSettings, baseCurrency: currency });
    window.location.reload();
  }

  const updateThemeVariant = (variant: THEME_VARIANTS) => {
    setThemeVariant(variant);
    setInLocalStorage('userSettings', { ...userSettings, themeVariant: variant });
    window.location.reload();
  }

  const fiatToken = Registry.getTokenRegistry().getTokenBySymbol(Network.all, baseCurrency);

  return { baseCurrency, themeVariant, fiatToken, updateBaseCurrency, updateThemeVariant };
}

