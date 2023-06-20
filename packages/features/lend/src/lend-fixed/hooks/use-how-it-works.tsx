import usdcGraphic from '@notional-finance/assets/images/usdc-lend-fixed.svg';
import ethGraphic from '@notional-finance/assets/images/eth-lend-fixed.svg';
import daiGraphic from '@notional-finance/assets/images/dai-lend-fixed.svg';
import wbtcGraphic from '@notional-finance/assets/images/wbtc-lend-fixed.svg';

// TODO: Get Dark mode versions of these images from Isaac
export const useHowItWorks = (tokenSymbol: string) => {
  const symbol = tokenSymbol.toLowerCase() as 'usdc' | 'eth' | 'wbtc' | 'dai';
  const images = {
    usdc: usdcGraphic,
    eth: ethGraphic,
    wbtc: wbtcGraphic,
    dai: daiGraphic,
  };

  return images[symbol] || undefined;
};
