import { Network } from '@notional-finance/util';

export const whitelistedVaults = (network: Network) => {
  switch (network) {
    case Network.All:
      return [];
    case Network.Mainnet:
      return [];
    case Network.ArbitrumOne:
      return [
        '0xdb08f663e5d765949054785f2ed1b2aa1e9c22cf',
        '0x3df035433cface65b6d68b77cc916085d020c8b8',
        '0x8ae7a8789a81a43566d0ee70264252c0db826940',
        '0x0e8c1a069f40d0e8fa861239d3e62003cbf3dcb2',
        '0x37dd23ab1885982f789a2d6400b583b8ae09223d',
      ];
    case Network.Goerli:
      return [];
  }
};
