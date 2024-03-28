import { Network } from '@notional-finance/util';

/** @dev all vault addresses should be lowercased */
export const whitelistedVaults = (network: Network) => {
  switch (network) {
    case Network.all:
      return [];
    case Network.mainnet:
      return [
        // "[USDC]:pyUSD_xUSDC"
        '0x84e58d8faa4e3b74d55d9fc762230f15d95570b8',
        // "[USDC]:xUSDC_crvUSD"
        '0xba4eb30f7f2e378249cf94e08f581e704326e9c6',
        // "[USDT]:xUSDT_crvUSD":
        '0x86b222d44ac6cc56e75b3df01fdad5dc371ef538',
        // "[USDC]:GHO_USDT_xUSDC":
        '0xeeb885af7c8075aa3b93e2f95e1c0bd51c758f91',
      ];
    case Network.arbitrum:
      return [
        // "[FRAX]:xFRAX_USDC_e"
        '0xdb08f663e5D765949054785F2eD1b2aa1e9C22Cf',
        // "[USDT]:USDC_e_xUSDT"
        '0x431dbfE3050eA39abBfF3E0d86109FB5BafA28fD',
        // "[USDC]:crvUSD_xUSDC"
        '0x5c36a0DeaB3531d29d848E684E8bDf5F81cDB643',
        // "[USDT]:crvUSD_xUSDT"
        '0xae04e4887cBf5f25c05aC1384BcD0b7e885a1F4A',
        // "[rETH]:xrETH_WETH"
        '0x3Df035433cFACE65b6D68b77CC916085d020C8B8',
        // "[USDC]:xUSDC_DAI_USDT_USDC_e"
        '0x8Ae7A8789A81A43566d0ee70264252c0DB826940',
        // "[ETH]:wstETH_xWETH"
        '0x0E8C1A069f40D0E8Fa861239D3e62003cBF3dCB2',
        // "[wstETH]:xwstETH_cbETH_rETH"
        '0x37dD23Ab1885982F789A2D6400B583B8aE09223d',
        // "[ETH]:rETH_xWETH"
        '0xA0d61c08e642103158Fc6a1495E7Ff82bAF25857',
      ];
    case Network.optimism:
      return [];
  }
};
