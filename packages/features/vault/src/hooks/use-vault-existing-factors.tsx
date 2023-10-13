import { useContext } from 'react';
import { VaultActionContext } from '../vault-view/vault-action-provider';
import {
  useAccountDefinition,
  useAllMarkets,
} from '@notional-finance/notionable-hooks';
import { PRIME_CASH_VAULT_MATURITY } from '@notional-finance/util';

export function useVaultExistingFactors() {
  const { state } = useContext(VaultActionContext);
  const { account } = useAccountDefinition();
  const {
    yields: { variableBorrow },
  } = useAllMarkets();
  const { priorVaultBalances, priorAccountRisk, postAccountRisk } = state;

  const vaultShare = priorVaultBalances?.find(
    (t) => t.tokenType === 'VaultShare'
  );
  const vaultDebt = priorVaultBalances?.find(
    (t) => t.tokenType === 'VaultDebt'
  );
  const assetLiquidationPrice =
    priorAccountRisk?.liquidationPrice?.find(
      (t) => t.asset.id === vaultShare?.tokenId
    )?.threshold || undefined;
  const priorBorrowRate =
    vaultDebt?.maturity === PRIME_CASH_VAULT_MATURITY
      ? variableBorrow.find((d) => vaultDebt.currencyId === d.token.currencyId)
          ?.totalAPY
      : // Find the most recent implied fixed rate, requires that this is sorted in reverse chronological
        // order
        account?.accountHistory?.find((a) => a.token.id === vaultDebt?.tokenId)
          ?.impliedFixedRate;

  const leverageRatio =
    postAccountRisk?.leverageRatio ||
    priorAccountRisk?.leverageRatio ||
    undefined;

  return {
    vaultShare: vaultShare?.token,
    assetLiquidationPrice,
    priorBorrowRate,
    leverageRatio,
  };
}
