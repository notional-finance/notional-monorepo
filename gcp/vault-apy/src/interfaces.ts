import { ethers } from 'ethers';

export const ERC20Interface = new ethers.utils.Interface([
  "function decimals() external view returns (uint8)",
  "function name() external view returns (string)",
  "function symbol() external view returns (string)",
]);

export const CurveGaugeInterface = new ethers.utils.Interface([
  "function claim_rewards() external",
  "function balanceOf(address) view external returns (uint256)",
])

export const ConvexGaugeInterface = new ethers.utils.Interface([
  "function getReward(address) external",
  "function balanceOf(address) view external returns (uint256)",
])
export const AuraGaugeInterface = new ethers.utils.Interface([
  "function getReward() external",
  "function balanceOf(address) view external returns (uint256)",
  "function convertToAssets(uint256 shares) view external returns (uint256)",
])

export const SingleSidedLPVault = new ethers.utils.Interface([
  "function emergencyExit(uint256, bytes) external",
  "function grantRole(bytes32, address) external",
  "function name() view external returns (string)",
  "function getStrategyVaultInfo() view external returns ((address,uint8,uint256,uint256 totalVaultShares,uint256,uint256))",
  "function getExchangeRate(uint256 maturity) view external returns (int256)",
]);

export const TradingModuleInterface = new ethers.utils.Interface([
  "function setMaxOracleFreshness(uint32) external",
]);


export const TransferInterface = new ethers.utils.Interface([{
  "anonymous": false,
  "inputs": [
    {
      "indexed": true,
      "internalType": "address",
      "name": "from",
      "type": "address"
    },
    {
      "indexed": true,
      "internalType": "address",
      "name": "to",
      "type": "address"
    },
    {
      "indexed": false,
      "internalType": "uint256",
      "name": "amount",
      "type": "uint256"
    }
  ],
  "name": "Transfer",
  "type": "event"
}]);

