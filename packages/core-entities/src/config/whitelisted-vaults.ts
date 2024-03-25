import { Network } from '@notional-finance/util';

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
        // // "[USDC]:GHO_USDT_xUSDC":
        // '0xeeb885af7c8075aa3b93e2f95e1c0bd51c758f91',
      ];
    case Network.arbitrum:
      return [
        '0xdb08f663e5d765949054785f2ed1b2aa1e9c22cf',
        '0x3df035433cface65b6d68b77cc916085d020c8b8',
        '0x8ae7a8789a81a43566d0ee70264252c0db826940',
        '0x0e8c1a069f40d0e8fa861239d3e62003cbf3dcb2',
        '0x37dd23ab1885982f789a2d6400b583b8ae09223d',
        '0x431dbfe3050ea39abbff3e0d86109fb5bafa28fd',
      ];
    case Network.optimism:
      return [];
  }
};
