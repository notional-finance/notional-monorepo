import unknown from '../../assets/icons/currencies/currency-unknown.svg';
import wbtc from '../../assets/icons/currencies/currency-wbtc.svg';
import arb from '../../assets/icons/currencies/arbitrum.svg';
import eth from '../../assets/icons/currencies/currency-eth.svg';
import peth from '../../assets/icons/currencies/pETH.svg';
import reth from '../../assets/icons/currencies/rETH.svg';
import reth_alt from '../../assets/icons/currencies/reth-alt.svg';
import nreth from '../../assets/icons/currencies/nRETH.svg';
import freth from '../../assets/icons/currencies/fRETH.svg';
import preth from '../../assets/icons/currencies/pRETH.svg';
import usdc from '../../assets/icons/currencies/currency-usdc.svg';
import dai from '../../assets/icons/currencies/currency-dai.svg';
import cwbtc from '../../assets/icons/currencies/currency-cwbtc.svg';
import ceth from '../../assets/icons/currencies/currency-ceth.svg';
import cusdc from '../../assets/icons/currencies/currency-cusdc.svg';
import pusdc from '../../assets/icons/currencies/pUSDC.svg';
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
import pwbtc from '../../assets/icons/currencies/pWBTC.svg';
import weth from '../../assets/icons/currencies/WETH.svg';
import comp from '../../assets/icons/currencies/COMP.svg';
import wstETH from '../../assets/icons/currencies/wstETH.svg';
import wsteth_alt from '../../assets/icons/currencies/wsteth-alt.svg';
import fDAI from '../../assets/icons/currencies/fDAI.svg';
import pDAI from '../../assets/icons/currencies/pDAI.svg';
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
import trading_fees from '../../assets/icons/currencies/trading-fees.svg';
import ffrax from '../../assets/icons/currencies/fFRAX.svg';
import nfrax from '../../assets/icons/currencies/nFRAX.svg';
import pfrax from '../../assets/icons/currencies/pFRAX.svg';
import frax from '../../assets/icons/currencies/FRAX.svg';
import frax_alt from '../../assets/icons/currencies/frax-alt.svg';
import usdt from '../../assets/icons/currencies/USDT.svg';
import usdt_alt from '../../assets/icons/currencies/usdt-alt.svg';
import fusdt from '../../assets/icons/currencies/fUSDT.svg';
import nusdt from '../../assets/icons/currencies/nUSDT.svg';
import pusdt from '../../assets/icons/currencies/pUSDT.svg';

export interface TokenImg {
  name: string;
  img: string;
  alt: string;
  accentBorderImg?: string;
  widths?: Record<string, string>;
}
export interface TokenImageMap {
  [key: string]: TokenImg;
}
export const TokenImageList: TokenImageMap = {
  wbtc: {
    name: 'wbtc',
    img: wbtc,
    accentBorderImg: wbtc_alt,
    alt: 'Wrapped Bitcoin icon',
  },
  pwbtc: {
    name: 'pwbtc',
    img: pwbtc,
    alt: 'pwbtc icon',
  },
  eth: {
    name: 'eth',
    img: eth,
    accentBorderImg: eth_alt,
    alt: 'Ethereum icon',
  },
  peth: {
    name: 'peth',
    img: peth,
    alt: 'prime Ethereum icon',
  },
  reth: {
    name: 'reth',
    img: reth,
    accentBorderImg: reth_alt,
    alt: 'reth icon',
  },
  preth: {
    name: 'preth',
    img: preth,
    alt: 'preth icon',
  },
  nreth: {
    name: 'nreth',
    img: nreth,
    alt: 'nreth icon',
  },
  freth: {
    name: 'freth',
    img: freth,
    alt: 'freth icon',
  },
  usdc: {
    name: 'usdc',
    img: usdc,
    accentBorderImg: usdc_alt,
    alt: 'USD Coin icon',
  },
  pusdc: {
    name: 'pusdc',
    img: pusdc,
    alt: 'pusdc icon',
  },
  usdt: {
    name: 'usdt',
    img: usdt,
    accentBorderImg: usdt_alt,
    alt: 'usdt icon',
  },
  fusdt: {
    name: 'fusdt',
    img: fusdt,
    alt: 'fusdt icon',
  },
  nusdt: {
    name: 'nusdt',
    img: nusdt,
    alt: 'nusdt icon',
  },
  pusdt: {
    name: 'pusdt',
    img: pusdt,
    alt: 'pusdt icon',
  },
  dai: {
    name: 'dai',
    img: dai,
    accentBorderImg: dai_alt,
    alt: 'DAI Stablecoin icon',
  },
  pdai: {
    name: 'pdai',
    img: pDAI,
    alt: 'prime DAI icon',
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
    accentBorderImg: wsteth_alt,
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
  arb: {
    name: 'arb',
    img: arb,
    alt: 'arb',
  },
  trading_fees: {
    name: 'trading_fees',
    img: trading_fees,
    alt: 'trading_fees',
  },
  ffrax: {
    name: 'ffrax',
    img: ffrax,
    alt: 'ffrax icon',
  },
  nfrax: {
    name: 'nfrax',
    img: nfrax,
    alt: 'nfrax icon',
  },
  pfrax: {
    name: 'pfrax',
    img: pfrax,
    alt: 'primt frax icon',
  },
  frax: {
    name: 'frax',
    img: frax,
    accentBorderImg: frax_alt,
    alt: 'frax',
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
  useAccentBorderImg?: boolean;
}

export function TokenIcon({
  symbol,
  size,
  style,
  useAccentBorderImg,
}: TokenIconProps) {
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
      src={useAccentBorderImg ? tokenIcon.accentBorderImg : image}
      alt={tokenIcon.alt}
      style={{ ...style }}
    />
  );
}

export default TokenIcon;
