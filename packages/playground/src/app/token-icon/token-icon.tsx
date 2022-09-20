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

export interface TokenImg {
  name: string;
  img: string;
  alt: string;
  widths?: Record<string, string>;
}
export interface TokenImageMap {
  [key: string]: TokenImg;
}
export const TokenImageList: TokenImageMap = {
  wbtc: {
    name: 'wbtc',
    img: wbtc,
    alt: 'Wrapped Bitcoin icon',
  },
  eth: {
    name: 'eth',
    img: eth,
    alt: 'Ethereum icon',
  },
  usdc: {
    name: 'usdc',
    img: usdc,
    alt: 'USD Coin icon',
  },
  dai: {
    name: 'dai',
    img: dai,
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
  unknown: {
    name: 'unknown',
    img: unknown,
    alt: 'unknown token icon',
  },
};

export interface TokenIconProps {
  symbol: string;
  width?: string | number;
}

export function TokenIcon({ symbol, width = '60' }: TokenIconProps) {
  const tokenKey = symbol.toLowerCase();
  const tokenIcon: TokenImg = Object.keys(TokenImageList).includes(tokenKey)
    ? TokenImageList[tokenKey]
    : TokenImageList['unknown'];

  // Allow the image to load a custom sized PNG if it matches the width
  const image =
    tokenIcon.widths && width.toString() in tokenIcon.widths
      ? tokenIcon.widths[width.toString()]
      : tokenIcon.img;
  if (tokenIcon.name === 'unknown') {
    tokenIcon.alt = `${symbol.toLowerCase()} ${tokenIcon.alt}`;
  }

  return <img width={width} height={width} src={image} alt={tokenIcon.alt} />;
}

export default TokenIcon;
