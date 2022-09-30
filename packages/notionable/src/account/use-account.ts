import { AccountData } from '@notional-finance/sdk';
import { useObservableState } from 'observable-hooks';
import { useCurrencyData } from '../currency/use-currency';
import { accountState$, initialAccountState } from './account-store';
import { setReadOnlyAddress } from './account-manager';

export function useAccount() {
  const {
    account,
    balanceSummary,
    assetSummary,
    noteSummary,
    accountConnected,
    isReadOnly,
    readOnlyAddress,
  } = useObservableState(accountState$, initialAccountState);

  return {
    account,
    accountDataCopy: AccountData.copyAccountData(account?.accountData),
    address: account?.address,
    accountConnected,
    balanceSummary,
    assetSummary,
    noteSummary,
    isReadOnly,
    readOnlyAddress,
    setReadOnlyAddress,
  };
}

export function useAccountCashBalance(
  selectedToken: string | undefined | null
) {
  const { id: currencyId, isUnderlying } = useCurrencyData(selectedToken);
  const { accountDataCopy } = useAccount();
  const _cashAmount = currencyId
    ? accountDataCopy?.cashBalance(currencyId)
    : undefined;
  return isUnderlying ? _cashAmount?.toUnderlying() : _cashAmount;
}
