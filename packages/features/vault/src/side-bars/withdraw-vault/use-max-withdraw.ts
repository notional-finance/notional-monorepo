import { useBaseVault, useVaultAccount } from '@notional-finance/notionable-hooks';

export function useMaxWithdraw(vaultAddress: string) {
  const { vaultAccount } = useVaultAccount(vaultAddress);
  const isPostMaturityExit = vaultAccount?.canSettle() || false;
  const baseVault = useBaseVault(vaultAddress);

  if (!isPostMaturityExit && baseVault && vaultAccount) {
    const { newVaultAccount, costToRepay } = baseVault.simulateExitPreMaturityInFull(vaultAccount);

    const maxWithdrawAmount = baseVault
      .getCashValueOfShares(vaultAccount)
      .toUnderlying()
      // Cost to Repay is negative
      .add(costToRepay.toUnderlying());

    return {
      maxWithdrawAmount,
      maxWithdrawAmountString: maxWithdrawAmount.toExactString(),
      maxWithdrawVaultAccount: newVaultAccount,
    };
  }

  return {
    maxWithdrawAmountString: '',
    maxWithdrawVaultAccount: undefined,
  };
}
