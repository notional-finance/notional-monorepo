import {
  useCurrentTradeContext,
  useVaultPosition,
} from '@notional-finance/notionable-hooks';

export function useVaultExistingFactors() {
  const trade = useCurrentTradeContext();
  const postVaultFactors = trade?.getPostVaultFactors();
  const vaultPosition = useVaultPosition(
    trade?.selectedNetwork,
    trade?.vaultAddress
  );

  const vaultShare = vaultPosition?.vaultShares.token;

  const leverageRatio =
    postVaultFactors?.leverageRatio ||
    vaultPosition?.leverageRatio ||
    undefined;

  return {
    vaultShare,
    priorBorrowRate: vaultPosition?.borrowAPY,
    debt: vaultPosition?.vaultDebt,
    leverageRatio,
  };
}
