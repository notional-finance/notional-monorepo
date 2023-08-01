import usdcGraphic from '@notional-finance/assets/images/lend-fixed-graphics/usdc.svg';
import ethGraphic from '@notional-finance/assets/images/lend-fixed-graphics/eth.svg';
import daiGraphic from '@notional-finance/assets/images/lend-fixed-graphics/dai.svg';
import wbtcGraphic from '@notional-finance/assets/images/lend-fixed-graphics/wbtc.svg';
import usdcDarkGraphic from '@notional-finance/assets/images/lend-fixed-graphics/usdc-dark.svg';
import ethDarkGraphic from '@notional-finance/assets/images/lend-fixed-graphics/eth-dark.svg';
import daiDarkGraphic from '@notional-finance/assets/images/lend-fixed-graphics/dai-dark.svg';
import wbtcDarkGraphic from '@notional-finance/assets/images/lend-fixed-graphics/wbtc-dark.svg';
import { useUserSettingsState } from '@notional-finance/user-settings-manager';
import { THEME_VARIANTS } from '@notional-finance/shared-config';

// TODO: GET BORROW VERSIONS OF THESE ICONS FROM DESIGN
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
