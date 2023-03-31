import { initialVaultState, vaultState$ } from '@notional-finance/notionable';
import { Market } from '@notional-finance/sdk/system';
import { getNowSeconds } from '@notional-finance/util';
import { useObservableState } from 'observable-hooks';
import { useAccount } from '../account/use-account';
import { useNotional } from '../notional/use-notional';
import { useVault } from './use-vault';

export function useVaultAccount(vaultAddress?: string) {
  const { system } = useNotional();
  const { accountDataCopy } = useAccount();
  const { vaultConfig } = useVault(vaultAddress);
  const { activeVaultMarkets } = useObservableState(
    vaultState$,
    initialVaultState
  );

  if (vaultAddress && system && vaultConfig) {
    const vaultAccount = accountDataCopy.getVaultAccount(vaultAddress);
    const activeMarketKeys = activeVaultMarkets.get(vaultAddress);
    const canRollMaturity =
      (vaultAccount.maturity > getNowSeconds() &&
        vaultConfig.allowRollPosition &&
        activeMarketKeys &&
        activeMarketKeys.find(
          (m) => Market.parseMaturity(m) > vaultAccount.maturity
        )) ||
      false;

    return {
      vaultAccount,
      noActivePosition: vaultAccount.isInactive,
      canRollMaturity,
    };
  }

  return { vaultAccount: undefined, noActivePosition: undefined };
}
