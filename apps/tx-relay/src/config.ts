import { Network, treasuryManagerAddresses } from '@notional-finance/util';

export const rpcUrls = {
  mainnet: 'https://rpc.mevblocker.io',
  arbitrum:
    'https://arb-mainnet.g.alchemy.com/v2/pq08EwFvymYFPbDReObtP-SFw3bCes8Z',
  sepolia:
    'https://virtual.arbitrum.rpc.tenderly.co/7b175ea0-8ed8-4279-8a3e-7e71d5a2c1ec',
};

export const rebalanceHelperAddresses = {
  [Network.arbitrum]: '0x366d5b255D97C5fee2283561Bd89fCe5566b178F',
};

export const Address = {
  TREASURY_MANAGER_MAINNET: treasuryManagerAddresses.mainnet,
  TREASURY_MANAGER_ARBITRUM: treasuryManagerAddresses.arbitrum,
  AaveV3Pool_ARBITRUM: '0x794a61358D6845594F94dc1DB02A252b5b4814aD',
  AaveV3Pool_MAINNET: '0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2',
  AaveFlashLiquidator_MAINNET: '0xb33E0B9E5FF443fdFE48D8A49F45828918BDab8C',
  AaveFlashLiquidator_ARBITRUM: '0x78e41D1389f3Db7C196F13088D1f99A319ffcFBE',
  Multicall3: '0xcA11bde05977b3631167028862bE2a173976CA11',
  initializeAllMarkets_ARBITRUM: '0x9b6C04D1481473B2e52CaEB85822072C35460f27',
  settleAccounts_ARBITRUM: '0x22349F0b9b6294dA5526c9E9383164d97c45ACCD',

  AaveWrappedFlashLender_MAINNET: '0x0c86c636ed5593705b5675d370c831972C787841',
  BalancerWrappedFlashLender_MAINNET:
    '0x9E092cb431e5F1aa70e47e052773711d2Ba4917E',
  UniV3WrappedFlashLender_MAINNET: '0x319300462C37AD2D4f26B584C2b67De51F51f289',
  AaveWrappedFlashLender_ARBITRUM: '0x9D4D2C08b29A2Db1c614483cd8971734BFDCC9F2',
  BalancerWrappedFlashLender_ARBITRUM:
    '0x9E092cb431e5F1aa70e47e052773711d2Ba4917E',
  CamelotWrappedFlashLender_ARBITRUM:
    '0x5E8820B2832aD8451f65Fa2CCe2F3Cef29016D0d',
  UniV3WrappedFlashLender_ARBITRUM:
    '0x319300462C37AD2D4f26B584C2b67De51F51f289',
  initializeAllMarkets_MAINNET: '0x40a77E61c230BB3B847231E3F47E47c6c62257db',
  settleAccounts_MAINNET: '0x04f917B9772920BC7E39Da36b465395A7B8E893C',
};

export enum Sign {
  flash = '0xaf2511c0',
  flashLoan = '0xab9c4b5d',
  flashLiquidate = '0x7bbeeafd',
  claimVaultRewardTokens = '0x36e8053c',
  reinvestVaultReward = '0xe800d559',
  claimAndReinvestVaultReward = '0xd30fec35',
  investWETHAndNOTE = '0x162c2a8e',
  executeTrade = '0x8df6c3ce',
  aggregate3 = '0x82ad56cb',
  harvestAssetsFromNotional = '0x295732fb',
  initializeAllMarkets = '0x9f8fad32',
  settleAccounts = '0xd7f4893e',
  settleVaultsAccounts = '0x8261f4ba',
  checkAndRebalance = '0x3ed55f0c',
}
