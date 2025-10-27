export const VAULT_ABI = [
  'function strategy() external view returns (string memory)',
  'function asset() external view returns (address)',
  'function yieldToken() external view returns (address)',
  'function convertSharesToYieldToken(uint256 shares) external view returns (uint256)',
  'function price(address account) external returns (uint256)'
];