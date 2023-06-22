import usdcGraphic from '@notional-finance/assets/images/provide-liquidity-graphics/usdc.svg';
import ethGraphic from '@notional-finance/assets/images/provide-liquidity-graphics/eth.svg';
import daiGraphic from '@notional-finance/assets/images/provide-liquidity-graphics/dai.svg';
import wbtcGraphic from '@notional-finance/assets/images/provide-liquidity-graphics/wbtc.svg';
import usdcDarkGraphic from '@notional-finance/assets/images/provide-liquidity-graphics/usdc-dark.svg';
import ethDarkGraphic from '@notional-finance/assets/images/provide-liquidity-graphics/eth-dark.svg';
import daiDarkGraphic from '@notional-finance/assets/images/provide-liquidity-graphics/dai-dark.svg';
import wbtcDarkGraphic from '@notional-finance/assets/images/provide-liquidity-graphics/wbtc-dark.svg';
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
