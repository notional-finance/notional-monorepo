import { AccountData, VaultAccount } from '@notional-finance/sdk';
import { useAccount } from '../account/use-account';
import { useNotional } from '../notional/use-notional';

export function getVaultAccount(accountDataCopy: AccountData | undefined, vaultAddress: string) {
  return (
    accountDataCopy?.vaultAccounts.find((v) => v.vaultAddress === vaultAddress) ||
    VaultAccount.emptyVaultAccount(vaultAddress)
  );
}

export function useVaultAccount(vaultAddress?: string) {
  const { system } = useNotional();
  const { accountDataCopy } = useAccount();

  if (vaultAddress && system) {
    const vaultAccount = getVaultAccount(accountDataCopy, vaultAddress);

    return { vaultAccount, noActivePosition: vaultAccount.isInactive };
  }

  return { vaultAccount: undefined, noActivePosition: undefined };
}
