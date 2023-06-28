import { Registry, TokenBalance } from '@notional-finance/core-entities';
import { useContext } from 'react';
import { VaultActionContext } from '../vault-view/vault-action-provider';
import { useFCashMarket } from '@notional-finance/notionable-hooks';
import { PRIME_CASH_VAULT_MATURITY } from '@notional-finance/util';

export function useVaultCosts() {
  const {
    state: { deposit, debtFee, collateralFee, debtBalance },
  } = useContext(VaultActionContext);
  const fCashMarket = useFCashMarket(deposit?.currencyId);
  const config = Registry.getConfigurationRegistry();

  let transactionCosts: TokenBalance | undefined;
  let cashBorrowed: TokenBalance | undefined;
  let vaultFee: TokenBalance | undefined;

  if (debtBalance && fCashMarket) {
    if (debtBalance.maturity === PRIME_CASH_VAULT_MATURITY) {
      // NOTE: we do not calculate any fees here, they will be charged on a go-forward basis
      cashBorrowed = debtBalance.toUnderlying();
    } else {
      const { tokensOut } = fCashMarket.calculateTokenTrade(
        debtBalance.unwrapVaultToken().neg(),
        0
      );
      ({ cashBorrowed, vaultFee } = config.getVaultBorrowWithFees(
        debtBalance.network,
        debtBalance.vaultAddress,
        debtBalance.maturity,
        tokensOut.toUnderlying()
      ));
    }
  }

  if (deposit) {
    transactionCosts = (debtFee?.toToken(deposit) || TokenBalance.zero(deposit))
      .add(collateralFee?.toToken(deposit) || TokenBalance.zero(deposit))
      .add(vaultFee?.toToken(deposit) || TokenBalance.zero(deposit));
  }

  return { transactionCosts, cashBorrowed };
}
