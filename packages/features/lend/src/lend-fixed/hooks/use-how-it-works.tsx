import usdcGraphic from '@notional-finance/assets/images/usdc-lend-fixed.svg';
import ethGraphic from '@notional-finance/assets/images/eth-lend-fixed.svg';
import daiGraphic from '@notional-finance/assets/images/dai-lend-fixed.svg';
import wbtcGraphic from '@notional-finance/assets/images/wbtc-lend-fixed.svg';
import usdcDarkGraphic from '@notional-finance/assets/images/usdc-lend-fixed-dark.svg';
import ethDarkGraphic from '@notional-finance/assets/images/eth-lend-fixed-dark.svg';
import daiDarkGraphic from '@notional-finance/assets/images/dai-lend-fixed-dark.svg';
import wbtcDarkGraphic from '@notional-finance/assets/images/wbtc-lend-fixed-dark.svg';
import { useUserSettingsState } from '@notional-finance/user-settings-manager';
import { THEME_VARIANTS } from '@notional-finance/shared-config';

// TODO: Get Dark mode versions of these images from Isaac
export const useHowItWorks = (tokenSymbol: string) => {
  const { themeVariant } = useUserSettingsState();
  const symbol = tokenSymbol.toLowerCase() as 'usdc' | 'eth' | 'wbtc' | 'dai';
  const images = {
    usdc: themeVariant === THEME_VARIANTS.LIGHT ? usdcGraphic : usdcDarkGraphic,
    eth: themeVariant === THEME_VARIANTS.LIGHT ? ethGraphic : ethDarkGraphic,
    wbtc: themeVariant === THEME_VARIANTS.LIGHT ? wbtcGraphic : wbtcDarkGraphic,
    dai: themeVariant === THEME_VARIANTS.LIGHT ? daiGraphic : daiDarkGraphic,
  };

  return images[symbol] || undefined;
};
