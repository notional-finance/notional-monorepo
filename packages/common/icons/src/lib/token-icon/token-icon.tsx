import unknown from '../../assets/icons/currencies/currency-unknown.svg';
import wbtc from '../../assets/icons/currencies/currency-wbtc.svg';
import arb from '../../assets/icons/currencies/arbitrum.svg';
import arbNetwork from '../../assets/icons/currencies/arb-network-selector.svg';
import arb_alt from '../../assets/icons/currencies/arb-alt.svg';
import eth from '../../assets/icons/currencies/currency-eth.svg';
import ethNetwork from '../../assets/icons/currencies/ethStroke.svg';
import reth from '../../assets/icons/currencies/rETH.svg';
import reth_alt from '../../assets/icons/currencies/reth-alt.svg';
import usdc from '../../assets/icons/currencies/currency-usdc.svg';
import dai from '../../assets/icons/currencies/currency-dai.svg';
import note from '../../assets/icons/currencies/NOTE.svg';
import snote from '../../assets/icons/currencies/sNOTE.svg';
import weth from '../../assets/icons/currencies/WETH.svg';
import comp from '../../assets/icons/currencies/COMP.svg';
import wstETH from '../../assets/icons/currencies/wstETH.svg';
import wsteth_alt from '../../assets/icons/currencies/wsteth-alt.svg';
import wstETH_ETH from '../../assets/icons/currencies/wstETH-ETH.svg';
import ETH_DAI_USDC_WBTC from '../../assets/icons/currencies/eth-dai-usdc-wbtc.svg';
import ETH_DAI_USDC from '../../assets/icons/currencies/eth-dai-usdc.svg';
import eth_alt from '../../assets/icons/currencies/eth-alt.svg';
import usdc_alt from '../../assets/icons/currencies/usdc-alt.svg';
import wbtc_alt from '../../assets/icons/currencies/wBTC-alt.svg';
import dai_alt from '../../assets/icons/currencies/dai-alt.svg';
import trading_fees from '../../assets/icons/currencies/trading-fees.svg';
import frax from '../../assets/icons/currencies/FRAX.svg';
import frax_alt from '../../assets/icons/currencies/frax-alt.svg';
import usdt from '../../assets/icons/currencies/USDT.svg';
import usdt_alt from '../../assets/icons/currencies/usdt-alt.svg';
import gmx from '../../assets/icons/currencies/GMX.svg';
import gmx_alt from '../../assets/icons/currencies/gmx-alt.svg';
import rdnt from '../../assets/icons/currencies/RDNT.svg';
import rdnt_alt from '../../assets/icons/currencies/rdnt-alt.svg';
import cbETH from '../../assets/icons/currencies/cbETH.svg';
import cbeth_alt from '../../assets/icons/currencies/cbeth-alt.svg';
import ldo from '../../assets/icons/currencies/ldo.svg';
import ldo_alt from '../../assets/icons/currencies/ldo-alt.svg';
import link from '../../assets/icons/currencies/link.svg';
import link_alt from '../../assets/icons/currencies/link-alt.svg';
import uni from '../../assets/icons/currencies/uni.svg';
import uni_alt from '../../assets/icons/currencies/uni-alt.svg';
import GHO from '../../assets/icons/currencies/GHO.svg';
import GHO_alt from '../../assets/icons/currencies/GHO-alt.svg';
import cryptotesters from '../../assets/icons/community-icons/cryptotesters.svg';
import L2DAO from '../../assets/icons/community-icons/L2DAO.svg';
import Llamas from '../../assets/icons/community-icons/Llama.svg';
import tBTC from '../../assets/icons/currencies/tBTC.svg';
import BAL from '../../assets/icons/currencies/BAL.svg';
import CRV from '../../assets/icons/currencies/CRV.svg';
import CVX from '../../assets/icons/currencies/CVX.svg';
import AURA from '../../assets/icons/currencies/AURA.svg';
import MORPHO from '../../assets/icons/currencies/morpho.svg';
import { VaultIcon } from '../vault-icon/vault-icon';
import { Network, getNetworkSymbol } from '@notional-finance/util';
import { Box } from '@mui/material';

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
  eth: {
    name: 'eth',
    img: eth,
    accentBorderImg: eth_alt,
    alt: 'Ethereum icon',
  },
  ethnetwork: {
    name: 'ethnetwork',
    img: ethNetwork,
    alt: 'Ethereum network icon',
  },
  reth: {
    name: 'reth',
    img: reth,
    accentBorderImg: reth_alt,
    alt: 'reth icon',
  },
  usdc: {
    name: 'usdc',
    img: usdc,
    accentBorderImg: usdc_alt,
    alt: 'USD Coin icon',
  },
  usdt: {
    name: 'usdt',
    img: usdt,
    accentBorderImg: usdt_alt,
    alt: 'usdt icon',
  },
  dai: {
    name: 'dai',
    img: dai,
    accentBorderImg: dai_alt,
    alt: 'DAI Stablecoin icon',
  },
  note: {
    name: 'note',
    img: note,
    alt: 'NOTE token icon',
  },
  snote: {
    name: 'snote',
    img: snote,
    alt: 'Staked NOTE token icon',
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
    accentBorderImg: arb_alt,
    alt: 'arb',
  },
  arbnetwork: {
    name: 'arbnetwork',
    img: arbNetwork,
    alt: 'arb network icon',
  },
  trading_fees: {
    name: 'trading_fees',
    img: trading_fees,
    alt: 'trading_fees',
  },
  frax: {
    name: 'frax',
    img: frax,
    accentBorderImg: frax_alt,
    alt: 'frax',
  },
  gmx: {
    name: 'gmx',
    img: gmx,
    accentBorderImg: gmx_alt,
    alt: 'gmx',
  },
  rdnt: {
    name: 'rdnt',
    img: rdnt,
    accentBorderImg: rdnt_alt,
    alt: 'rdnt',
  },
  cbeth: {
    name: 'cbETH',
    img: cbETH,
    accentBorderImg: cbeth_alt,
    alt: 'cbETH',
  },
  gho: {
    name: 'GHO',
    img: GHO,
    accentBorderImg: GHO_alt,
    alt: 'GHO',
  },
  uni: {
    name: 'uni',
    img: uni,
    accentBorderImg: uni_alt,
    alt: 'uni',
  },
  link: {
    name: 'link',
    img: link,
    accentBorderImg: link_alt,
    alt: 'link',
  },
  ldo: {
    name: 'ldo',
    img: ldo,
    accentBorderImg: ldo_alt,
    alt: 'ldo',
  },
  cryptotesters: {
    name: 'cryptotesters',
    img: cryptotesters,
    alt: 'cryptotesters',
  },
  layer2dao: {
    name: 'L2DAO',
    img: L2DAO,
    alt: 'L2DAO',
  },
  llamas: {
    name: 'Llamas',
    img: Llamas,
    alt: 'Llamas',
  },
  tbtc: {
    name: 'tbtc',
    img: tBTC,
    alt: 'tbtc',
  },
  bal: {
    name: 'bal',
    img: BAL,
    alt: 'bal',
  },
  crv: {
    name: 'crv',
    img: CRV,
    alt: 'crv',
  },
  cvx: {
    name: 'cvx',
    img: CVX,
    alt: 'cvx',
  },
  aura: {
    name: 'aura',
    img: AURA,
    alt: 'aura',
  },
  unknown: {
    name: 'unknown',
    img: unknown,
    alt: 'unknown token icon',
  },
  morpho: {
    name: 'morpho',
    img: MORPHO,
    alt: 'morpho',
  },
};

export interface TokenIconProps {
  symbol: string;
  size: 'small' | 'medium' | 'large' | 'xl' | 'xxl';
  style?: React.CSSProperties;
  useAccentBorderImg?: boolean;
  network?: Network;
}

export function TokenIcon({
  symbol,
  size,
  style,
  useAccentBorderImg,
  network,
}: TokenIconProps) {
  const tokenKey = symbol?.toLowerCase();
  const tokenIcon: TokenImg = Object.keys(TokenImageList).includes(tokenKey)
    ? TokenImageList[tokenKey]
    : TokenImageList['unknown'];

  const networkIcon = network
    ? TokenImageList[getNetworkSymbol(network)]
    : undefined;

  const tokenSizes = {
    small: '16px',
    medium: '24px',
    large: '32px',
    xl: '40px',
    xxl: '48px',
  };

  // Allow the image to load a custom sized PNG if it matches the width

  const image =
    tokenIcon.widths && tokenSizes[size] in tokenIcon.widths
      ? tokenIcon.widths[tokenSizes[size]]
      : tokenIcon.img;

  if (tokenIcon.name === 'unknown') {
    tokenIcon.alt = `${symbol?.toLowerCase()} ${tokenIcon.alt}`;
  }

  const networkIconSrc = useAccentBorderImg
    ? networkIcon?.accentBorderImg
    : networkIcon?.img;

  return networkIcon ? (
    <Box position="relative">
      {networkIcon && size === 'medium' && (
        <img
          src={networkIconSrc}
          alt={network}
          width={'14px'}
          height={'14px'}
          style={{ position: 'absolute', bottom: '2px', right: '-4px' }}
        />
      )}
      {networkIcon && size === 'large' && (
        <img
          src={networkIconSrc}
          alt={network}
          width={'12px'}
          height={'12px'}
          style={{ position: 'absolute', bottom: '5px', left: '20px' }}
        />
      )}
      {networkIcon && size === 'xl' && (
        <img
          src={networkIconSrc}
          alt={network}
          width={tokenSizes['small']}
          height={tokenSizes['small']}
          style={{ position: 'absolute', bottom: '4px', right: '16px' }}
        />
      )}
      <img
        width={tokenSizes[size]}
        height={tokenSizes[size]}
        src={useAccentBorderImg ? tokenIcon.accentBorderImg : image}
        alt={tokenIcon.alt}
        style={{ ...style }}
      />
    </Box>
  ) : symbol === 'vaultshare' ? (
    <VaultIcon />
  ) : (
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
