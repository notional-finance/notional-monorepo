import { ethers } from 'ethers';

export const ERC20Interface = new ethers.utils.Interface([
  'function decimals() external view returns (uint8)',
  'function name() external view returns (string)',
  'function symbol() external view returns (string)',
  'function balanceOf(address) view external returns (uint256)',
]);

export const CurveGaugeInterface = new ethers.utils.Interface([
  'function claim_rewards() external',
  'function balanceOf(address) view external returns (uint256)',
]);

export const CurvePoolInterface = new ethers.utils.Interface([
  'function get_balances() view external returns (uint256[])',
  'function totalSupply() view external returns (uint256)',
  'function decimals() view external returns (uint8)',
  'function coins(uint256) view external returns (address)',
]);

export const CurvePoolAltInterface = new ethers.utils.Interface([
  'function get_balances() view external returns (uint256[2])',
  'function totalSupply() view external returns (uint256)',
  'function decimals() view external returns (uint8)',
  'function coins(uint256) view external returns (address)',
]);

export const ConvexGaugeArbitrumInterface = new ethers.utils.Interface([
  'function getReward(address) external',
  'function balanceOf(address) view external returns (uint256)',
  'function stakingToken() view external returns (address)',
]);

export const ConvexGaugeMainnetInterface = new ethers.utils.Interface([
  'function extraRewardsLength() external view returns (uint256)',
  'function rewardRate() view external returns (uint256)',
  'function getReward() external',
  'function balanceOf(address) view external returns (uint256)',
  'function stakingToken() view external returns (address)',
]);

export const BalancerVaultInterface = new ethers.utils.Interface([
  'function getPoolTokens(bytes32 poolId) external view  returns (address[] tokens,uint256[] balances,uint256 lastChangeBlock)',
]);

export const BalancerPoolInterface = new ethers.utils.Interface([
  'function totalSupply() view external returns (uint256)',
  'function getActualSupply() view external returns (uint256)',
  'function getBptIndex() view external returns (uint256)',
  'function getPoolId() view external returns (bytes32)',
]);

export const AuraGaugeInterface = new ethers.utils.Interface([
  'function getReward() external',
  'function balanceOf(address) view external returns (uint256)',
  'function convertToAssets(uint256 shares) view external returns (uint256)',
]);

export const SingleSidedLPVault = new ethers.utils.Interface([
  'function emergencyExit(uint256, bytes) external',
  'function grantRole(bytes32, address) external',
  'function name() view external returns (string)',
  'function getStrategyVaultInfo() view external returns ((address,uint8,uint256,uint256 totalVaultShares,uint256,uint256))',
  'function getExchangeRate(uint256 maturity) view external returns (int256)',
]);

export const TradingModuleInterface = new ethers.utils.Interface([
  'function setMaxOracleFreshness(uint32) external',
  'function NOTIONAL() external view returns (address)',
]);

export const NotionalInterface = new ethers.utils.Interface([
  'function owner() external view returns (address)',
]);

export const TransferInterface = new ethers.utils.Interface([
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'from',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'to',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
    ],
    name: 'Transfer',
    type: 'event',
  },
]);

export const BalancerSpotPriceInterface = new ethers.utils.Interface([
  `function getComposableSpotPrices(
        bytes32 poolId,
        address poolAddress,
        uint256 primaryIndex,
        uint256 bptIndex,
        uint8[] memory decimals
    ) external view returns (uint256[] memory balances, uint256[] memory spotPrices)
  `,
]);

export const GaugeInterface = new ethers.utils.Interface([
  'function periodFinish() view external returns (uint256)',
]);