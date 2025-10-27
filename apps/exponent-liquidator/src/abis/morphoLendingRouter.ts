export const MORPHO_LENDING_ROUTER_ABI = [
  'function healthFactor(address account, address vault) external view returns (uint256 borrowed, uint256 collateralShares, uint256 maxBorrow)',
  'function balanceOfCollateral(address account, address vault) external view returns (uint256 shares)',
  'function marketParams(address vault) external view returns (address loanToken, address collateralToken, address oracle, uint256 irm, uint256 lltv)',
  'function balanceOfBorrowShares(address account, address vault) public view returns (uint256 shares)'
];