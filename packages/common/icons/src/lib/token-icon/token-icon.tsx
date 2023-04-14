import unknown from '../../assets/icons/currencies/currency-unknown.svg';
import wbtc from '../../assets/icons/currencies/currency-wbtc.svg';
import eth from '../../assets/icons/currencies/currency-eth.svg';
import usdc from '../../assets/icons/currencies/currency-usdc.svg';
import dai from '../../assets/icons/currencies/currency-dai.svg';
import cwbtc from '../../assets/icons/currencies/currency-cwbtc.svg';
import ceth from '../../assets/icons/currencies/currency-ceth.svg';
import cusdc from '../../assets/icons/currencies/currency-cusdc.svg';
import cdai from '../../assets/icons/currencies/currency-cdai.svg';
import note from '../../assets/icons/currencies/NOTE-20x20.png';
import note32px from '../../assets/icons/currencies/NOTE-32x32.png';
import snote from '../../assets/icons/currencies/sNOTE-20x20.png';
import snote32px from '../../assets/icons/currencies/sNOTE-32x32.png';
import note64px from '../../assets/icons/currencies/NOTE-64x64.png';
import ndai from '../../assets/icons/currencies/nDAI.png';
import neth from '../../assets/icons/currencies/nETH.png';
import nusdc from '../../assets/icons/currencies/nUSDC.png';
import nwbtc from '../../assets/icons/currencies/nWBTC.png';
import weth from '../../assets/icons/currencies/WETH.svg';
import comp from '../../assets/icons/currencies/COMP.svg';
import wstETH from '../../assets/icons/currencies/wstETH.svg';
import fDAI from '../../assets/icons/currencies/fDAI.svg';
import fUSDC from '../../assets/icons/currencies/fUSDC.svg';
import fWBTC from '../../assets/icons/currencies/fWBTC.svg';
import fETH from '../../assets/icons/currencies/fETH.svg';
import wstETH_ETH from '../../assets/icons/currencies/wstETH-ETH.svg';
import ETH_DAI_USDC_WBTC from '../../assets/icons/currencies/eth-dai-usdc-wbtc.svg';
import ETH_DAI_USDC from '../../assets/icons/currencies/eth-dai-usdc.svg';
import eth_alt from '../../assets/icons/currencies/eth-alt.svg';
import usdc_alt from '../../assets/icons/currencies/usdc-alt.svg';
import wbtc_alt from '../../assets/icons/currencies/wBTC-alt.svg';
import dai_alt from '../../assets/icons/currencies/dai-alt.svg';

export interface TokenImg {
  name: string;
  img: string;
  alt: string;
  altImg?: string;
  widths?: Record<string, string>;
}
export interface TokenImageMap {
  [key: string]: TokenImg;
}
export const TokenImageList: TokenImageMap = {
  wbtc: {
    name: 'wbtc',
    img: wbtc,
    altImg: wbtc_alt,
    alt: 'Wrapped Bitcoin icon',
  },
  eth: {
    name: 'eth',
    img: eth,
    altImg: eth_alt,
    alt: 'Ethereum icon',
  },
  usdc: {
    name: 'usdc',
    img: usdc,
    altImg: usdc_alt,
    alt: 'USD Coin icon',
  },
  dai: {
    name: 'dai',
    img: dai,
    altImg: dai_alt,
    alt: 'DAI Stablecoin icon',
  },
  cwbtc: {
    name: 'cwbtc',
    img: cwbtc,
    alt: 'Compound Wrapped Bitcoin icon',
  },
  ceth: {
    name: 'ceth',
    img: ceth,
    alt: 'Compound Ethereum icon',
  },
  cusdc: {
    name: 'cusdc',
    img: cusdc,
    alt: 'Compound USD Coin icon',
  },
  cdai: {
    name: 'cdai',
    img: cdai,
    alt: 'Compound DAI Stablecoin icon',
  },
  note: {
    name: 'note',
    img: note,
    alt: 'NOTE token icon',
    widths: {
      '32': note32px,
      '64': note64px,
    },
  },
  snote: {
    name: 'snote',
    img: snote,
    alt: 'Staked NOTE token icon',
    widths: {
      '32': snote32px,
    },
  },
  ndai: {
    name: 'ndai',
    img: ndai,
    alt: 'Notional nDAI icon',
  },
  neth: {
    name: 'neth',
    img: neth,
    alt: 'Notional nETH icon',
  },
  nusdc: {
    name: 'nusdc',
    img: nusdc,
    alt: 'Notional nUSDC icon',
  },
  nwbtc: {
    name: 'nwbtc',
    img: nwbtc,
    alt: 'Notional nWBTC icon',
  },
  weth: {
    name: 'weth',
    img: weth,
    alt: 'Wrapped Ether icon',
  },
  comp: {
    name: 'comp',
    img: comp,
    alt: 'Compound icon',
  },
  wsteth: {
    name: 'wsteth',
    img: wstETH,
    alt: 'Lido Wrapped Staked ETH 2.0',
  },
  fdai: {
    name: 'fdai',
    img: fDAI,
    alt: 'fCash DAI icon',
  },
  fusdc: {
    name: 'fusdc',
    img: fUSDC,
    alt: 'fCash USDC icon',
  },
  feth: {
    name: 'feth',
    img: fETH,
    alt: 'fCash ETH icon',
  },
  fwbtc: {
    name: 'fwbtc',
    img: fWBTC,
    alt: 'fCash WBTC icon',
  },
  wsteth_eth: {
    name: 'wsteth_eth',
    img: wstETH_ETH,
    alt: 'wstETH ETH',
  },
  eth_dai_usdc_wbtc: {
    name: 'eth-dai-usdc-wbtc',
    img: ETH_DAI_USDC_WBTC,
    alt: ' ETH_DAI_USDC_WBTC',
  },
  eth_dai_usdc: {
    name: 'eth-dai-usdc',
    img: ETH_DAI_USDC,
    alt: ' ETH_DAI_USDC',
  },
  unknown: {
    name: 'unknown',
    img: unknown,
    alt: 'unknown token icon',
  },
};

export interface TokenIconProps {
  symbol: string;
  size: 'small' | 'medium' | 'large' | 'extraLarge';
  style?: React.CSSProperties;
  useAltImg?: boolean;
}

export function TokenIcon({ symbol, size, style, useAltImg }: TokenIconProps) {
  const tokenKey = symbol.toLowerCase();
  const tokenIcon: TokenImg = Object.keys(TokenImageList).includes(tokenKey)
    ? TokenImageList[tokenKey]
    : TokenImageList['unknown'];

  const tokenSizes = {
    small: '16px',
    medium: '24px',
    large: '32px',
    extraLarge: '72px',
  };

  // Allow the image to load a custom sized PNG if it matches the width

  const image =
    tokenIcon.widths && tokenSizes[size] in tokenIcon.widths
      ? tokenIcon.widths[tokenSizes[size]]
      : tokenIcon.img;

  if (tokenIcon.name === 'unknown') {
    tokenIcon.alt = `${symbol.toLowerCase()} ${tokenIcon.alt}`;
  }

  return (
    <img
      width={tokenSizes[size]}
      height={tokenSizes[size]}
      src={useAltImg ? tokenIcon.altImg : image}
      alt={tokenIcon.alt}
      style={{ ...style }}
    />
  );
}

export default TokenIcon;
