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
    yields: { variableBorrow, vaultShares },
  } = useAllMarkets();
  const { priorVaultBalances, priorAccountRisk } = state;

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

  const priorLeverageRatio = priorAccountRisk?.leverageRatio;
  const strategyAPY = vaultShares.find(
    (y) => y.token.id === vaultShare?.tokenId
  )?.totalAPY;
  const totalAPY =
    strategyAPY !== undefined &&
    priorBorrowRate !== undefined &&
    priorLeverageRatio !== undefined &&
    priorLeverageRatio !== null
      ? strategyAPY + (strategyAPY - priorBorrowRate) * priorLeverageRatio
      : undefined;

  return {
    vaultShare: vaultShare?.token,
    assetLiquidationPrice,
    priorBorrowRate,
    priorLeverageRatio,
    totalAPY,
  };
}
