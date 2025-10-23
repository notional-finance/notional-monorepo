export const WITHDRAW_REQUEST_MANAGER_ABI = [
  'function WITHDRAW_TOKEN() external view returns (address)',
  'function getWithdrawRequest(address vault, address account) external view returns ((uint256 requestId, uint120 yieldTokenAmount, uint120 sharesAmount), (uint120 totalYieldTokenAmount, uint120 totalWithdraw, bool finalized))',
  'function finalizeRequestManual(address vault, address account) external returns (uint256 tokensWithdrawn)'
];