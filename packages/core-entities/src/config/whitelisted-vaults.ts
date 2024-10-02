import { DexIds, Network } from '@notional-finance/util';
import { SingleSidedLP, VaultAdapter } from '../vaults';
import { defaultAbiCoder } from '@ethersproject/abi';
import { BytesLike } from 'ethers';

export const PointsMultipliers: Record<
  Network,
  Record<string, (v: VaultAdapter) => Record<string, number>>
> = {
  [Network.mainnet]: {
    '0x32d82a1c8618c7be7fe85b2f1c44357a871d52d1': (v) => ({
      EtherFi: 2,
      EigenLayer: (v as SingleSidedLP).getTokenPoolShare(1),
    }),
    '0x914255c0c289aea36e378ebb5e28293b5ed278ca': (v) => ({
      Renzo: 6,
      EigenLayer: (v as SingleSidedLP).getTokenPoolShare(0),
    }),
    '0xd6aa58cf21a0edb33375d6c0434b8bb5b589f021': (_v) => ({
      Ethena: 20,
    }),
    '0xb1113cf888a019693b254da3d90f841072d85172': (_v) => ({
      Ethena: 20,
    }),
    '0xf94507f3dece4cc4c73b6cf228912b85eadc9cfb': (v) => ({
      Kelp: 2,
      EigenLayer: (v as SingleSidedLP).getTokenPoolShare(0),
    }),
  },
  [Network.all]: {},
  [Network.arbitrum]: {
    '0xd7c3dc1c36d19cf4e8cea4ea143a2f4458dd1937': (v) => ({
      Renzo: 6,
      EigenLayer: (v as SingleSidedLP).getTokenPoolShare(0),
    }),
    '0xcac9c01d1207e5d06bb0fd5b854832f35fe97e68': (v) => ({
      Kelp: 2,
      EigenLayer: (v as SingleSidedLP).getTokenPoolShare(0),
    }),
  },
  [Network.optimism]: {},
};

export const PointsLinks: Record<Network, Record<string, string>> = {
  [Network.mainnet]: {
    '0x32d82a1c8618c7be7fe85b2f1c44357a871d52d1': 'https://app.ether.fi/defi',
    '0x914255c0c289aea36e378ebb5e28293b5ed278ca':
      'https://app.renzoprotocol.com/defi',
    '0xd6aa58cf21a0edb33375d6c0434b8bb5b589f021': 'https://app.ethena.fi/join',
    '0xb1113cf888a019693b254da3d90f841072d85172': 'https://app.ethena.fi/join',
    '0xf94507f3dece4cc4c73b6cf228912b85eadc9cfb':
      'https://kelpdao.xyz/dashboard/',
  },
  [Network.all]: {},
  [Network.arbitrum]: {
    '0xd7c3dc1c36d19cf4e8cea4ea143a2f4458dd1937':
      'https://app.renzoprotocol.com/defi',
  },
  [Network.optimism]: {},
};

const PendlePTVaults: Record<Network, string[]> = {
  [Network.arbitrum]: [
    // "[ETH]:rsETH_25SEP2024"
    '0x851a28260227f9a8e6bf39a5fa3b5132fa49c7f3',
    // "[ETH]:rsETH_26DEC2024"
    '0x878c46978ac67e43d9d27e510f98e087e9940b12',
  ],
  [Network.mainnet]: [],
  [Network.optimism]: [],
  [Network.all]: [],
};

/** @dev all vault addresses should be lowercased */
export const whitelistedVaults = (network: Network) => {
  switch (network) {
    case Network.all:
      return [];
    case Network.mainnet:
      return [
        // // "[USDC]:pyUSD_xUSDC"
        // '0x84e58d8faa4e3b74d55d9fc762230f15d95570b8',
        // // "[USDC]:xUSDC_crvUSD"
        // '0xba4eb30f7f2e378249cf94e08f581e704326e9c6',
        // // "[USDT]:xUSDT_crvUSD":
        // '0x86b222d44ac6cc56e75b3df01fdad5dc371ef538',
        // "[USDC]:GHO_USDT_xUSDC":
        '0xeeb885af7c8075aa3b93e2f95e1c0bd51c758f91',
        // "[rETH]:xrETH_weETH"
        '0x32d82a1c8618c7be7fe85b2f1c44357a871d52d1',
        // "[ETH]:ezETH_xWETH":
        '0x914255c0c289aea36e378ebb5e28293b5ed278ca',
        // "[USDC]:USDe_xUSDC":
        '0xd6aa58cf21a0edb33375d6c0434b8bb5b589f021',
        // "[GHO]:xGHO_crvUSD":
        '0x30fba4a7ec8591f25b4d37fd79943a4bb6e553e2',
        // "[GHO]:xGHO_USDe":
        '0xb1113cf888a019693b254da3d90f841072d85172',
        // "[ETH]:rsETH_xWETH":
        '0xf94507f3dece4cc4c73b6cf228912b85eadc9cfb',
        // "[WBTC]:xWBTC_tBTC":
        '0xe20048fa0f165a49b780dfa9a8caba845332f848',
        ...PendlePTVaults[Network.mainnet],
      ];
    case Network.arbitrum:
      return [
        // "[FRAX]:xFRAX_USDC_e"
        '0xdb08f663e5d765949054785f2ed1b2aa1e9c22cf',
        // "[USDT]:USDC_e_xUSDT"
        '0x431dbfe3050ea39abbff3e0d86109fb5bafa28fd',
        // "[USDC]:crvUSD_xUSDC"
        '0x5c36a0deab3531d29d848e684e8bdf5f81cdb643',
        // "[USDT]:crvUSD_xUSDT"
        '0xae04e4887cbf5f25c05ac1384bcd0b7e885a1f4a',
        // "[rETH]:xrETH_WETH"
        '0x3df035433cface65b6d68b77cc916085d020c8b8',
        // "[USDC]:xUSDC_DAI_USDT_USDC_e"
        '0x8ae7a8789a81a43566d0ee70264252c0db826940',
        // "[ETH]:wstETH_xWETH"
        '0x0e8c1a069f40d0e8fa861239d3e62003cbf3dcb2',
        // "[wstETH]:xwstETH_cbETH_rETH"
        '0x37dd23ab1885982f789a2d6400b583b8ae09223d',
        // "[ETH]:rETH_xWETH"
        '0xa0d61c08e642103158fc6a1495e7ff82baf25857',
        // "[wstETH]:ezETH_xwstETH":
        '0xd7c3dc1c36d19cf4e8cea4ea143a2f4458dd1937',
        // "[WBTC]:xWBTC_tBTC":
        '0xf95441f348eb2fd3d5d82f9b7b961137a734eedd',
        // "[ETH]:rsETH_xWETH":
        '0xcac9c01d1207e5d06bb0fd5b854832f35fe97e68',
        // "[wstETH]:cbETH_xwstETH_rETH":
        '0x91b79f4081d3522af2760b7698810d501ebc8010',
        // "[wBTC]:xWBTC_tBTC":
        '0x3533f05b2c54ce1c2321cfe3c6f693a3cbbaea10',
        ...PendlePTVaults[Network.arbitrum],
      ];
    case Network.optimism:
      return [];
  }
};

export const VaultDefaultDexParameters: Record<
  Network,
  Record<
    string,
    { dexId: DexIds; exchangeData: BytesLike; poolAddress?: string }
  >
> = {
  [Network.arbitrum]: {
    '0x851a28260227f9a8e6bf39a5fa3b5132fa49c7f3': {
      dexId: DexIds.BALANCER_V2,
      exchangeData: defaultAbiCoder.encode(
        ['bytes32'],
        ['0x90e6cb5249f5e1572afbf8a96d8a1ca6acffd73900000000000000000000055c']
      ),
      poolAddress: '0x90e6cb5249f5e1572afbf8a96d8a1ca6acffd739',
    },
    '0x878c46978ac67e43d9d27e510f98e087e9940b12': {
      dexId: DexIds.BALANCER_V2,
      exchangeData: defaultAbiCoder.encode(
        ['bytes32'],
        ['0x90e6cb5249f5e1572afbf8a96d8a1ca6acffd73900000000000000000000055c']
      ),
      poolAddress: '0x90e6cb5249f5e1572afbf8a96d8a1ca6acffd739',
    },
  },
  [Network.mainnet]: {},
  [Network.optimism]: {},
  [Network.all]: {},
};

const SingleSidedLP_DirectClaim: Record<Network, string[]> = {
  [Network.arbitrum]: [],
  [Network.mainnet]: ['0xe20048fa0f165a49b780dfa9a8caba845332f848'],
  [Network.optimism]: [],
  [Network.all]: [],
};

type VaultType = 'SingleSidedLP' | 'PendlePT' | 'SingleSidedLP_DirectClaim';

export function getVaultType(
  vaultAddress: string,
  network: Network
): VaultType {
  if (PendlePTVaults[network].includes(vaultAddress.toLowerCase())) {
    return 'PendlePT';
  } else if (
    SingleSidedLP_DirectClaim[network].includes(vaultAddress.toLowerCase())
  ) {
    return 'SingleSidedLP_DirectClaim';
  }
  return 'SingleSidedLP';
}
