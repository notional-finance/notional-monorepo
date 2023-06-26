import { useAccountDefinition } from '../account/use-account';

export function useVaultAccount(vaultAddress?: string) {
  const { account } = useAccountDefinition();
  const vaultBalances =
    account?.balances.filter((t) => t.vaultAddress === vaultAddress) || [];

  return { vaultBalances, hasVaultPosition: vaultBalances.length > 0 };
}
