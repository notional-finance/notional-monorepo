import { AccountData } from '@notional-finance/sdk';
import { useObservableState } from 'observable-hooks';
import {
  accountState$,
  initialAccountState,
  setReadOnlyAddress,
} from '@notional-finance/notionable';
import { truncateAddress } from '@notional-finance/helpers';
import { Registry } from '@notional-finance/core-entities';
import {
  useNotionalContext,
  useSelectedNetwork,
} from '../notional/use-notional';
import { EMPTY } from 'rxjs';
import { useCurrencyData } from '../currency/use-currency';

export function useAccount() {
  const {
    account,
    balanceSummary,
    assetSummary,
    noteSummary,
    accountConnected,
    isReadOnly,
    readOnlyAddress,
    accountSummariesLoaded,
    lastUpdateTime,
  } = useObservableState(accountState$, initialAccountState);

  const truncatedAddress = account?.address
    ? truncateAddress(account?.address)
    : '';

  return {
    account,
    accountDataCopy: AccountData.copyAccountData(account?.accountData),
    address: account?.address,
    truncatedAddress: truncatedAddress,
    accountSummariesLoaded,
    // account connected returns true when the account has been loaded
    accountConnected,
    balanceSummary,
    assetSummary,
    noteSummary,
    isReadOnly,
    readOnlyAddress,
    setReadOnlyAddress,
    lastUpdateTime,
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

export function useAccountWithdrawableTokens() {
  const { balanceSummary } = useAccount();

  return Array.from(balanceSummary.values())
    .filter((b) => b.isWithdrawable)
    .flatMap((b) => {
      return [b.underlyingSymbol, b.symbol];
    })
    .filter((s) => s !== undefined);
}

export function useAccountDefinition() {
  const {
    globalState: { selectedNetwork, selectedAccount },
  } = useNotionalContext();
  const registry = Registry.getAccountRegistry();

  const account$ =
    selectedNetwork && selectedAccount
      ? registry.subscribeAccount(selectedNetwork, selectedAccount)
      : undefined;
  const account = useObservableState(account$ || EMPTY) || undefined;

  return {
    account,
    account$,
  };
}

export function useAccountReady() {
  const {
    globalState: { isAccountReady },
  } = useNotionalContext();
  return isAccountReady;
}

export function useBalance(selectedToken: string) {
  const { account } = useAccountDefinition();
  return account?.balances.find((t) => t.token.symbol === selectedToken);
}

export function usePrimeCashBalance(selectedToken: string | undefined | null) {
  const selectedNetwork = useSelectedNetwork();
  const tokens = Registry.getTokenRegistry();
  const token = selectedToken
    ? tokens.getTokenBySymbol(selectedNetwork, selectedToken)
    : undefined;
  const primeCash = tokens.getPrimeCash(selectedNetwork, token?.currencyId);

  return useBalance(primeCash.symbol);
}
