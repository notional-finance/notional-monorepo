import { useAccountDefinition } from '@notional-finance/notionable-hooks';

export function useVaultAccount(vaultAddress?: string) {
  const { account } = useAccountDefinition();
  const vaultBalances =
    account?.balances.filter((t) => t.vaultAddress === vaultAddress) || [];

  return { vaultBalances, hasVaultPosition: vaultBalances.length > 0 };
}
