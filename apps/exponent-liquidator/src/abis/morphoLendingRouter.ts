export const MORPHO_LENDING_ROUTER_ABI = [
  'function healthFactor(address account, address vault) external view returns (uint256 borrowed, uint256 collateralShares, uint256 maxBorrow)',
  'function balanceOfCollateral(address account, address vault) external view returns (uint256 shares)'
];