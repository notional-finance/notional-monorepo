import { useAccount } from '../account/use-account';
import { useNotional } from '../notional/use-notional';

export function useVaultAccount(vaultAddress?: string) {
  const { system } = useNotional();
  const { accountDataCopy } = useAccount();

  if (vaultAddress && system) {
    const vaultAccount = accountDataCopy.getVaultAccount(vaultAddress);

    return { vaultAccount, noActivePosition: vaultAccount.isInactive };
  }

  return { vaultAccount: undefined, noActivePosition: undefined };
}
