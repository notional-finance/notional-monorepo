import { merge, Observable } from 'rxjs';
import { GlobalState } from '../global/global-state';
import {
  initialBaseTradeState,
  TransactionConfig,
  VaultTradeState,
} from './base-trade-store';
import {
  resetOnNetworkChange,
  selectedAccount,
  selectedPool,
  selectedNetwork,
  selectedToken,
  initState,
  priorVaultAccountRisk,
  parseBalance,
  parseRiskFactorLimit,
  calculate,
  postVaultAccountRisk,
  availableTokens,
  buildTransaction,
  selectedVaultPool,
} from './logic';

export function createVaultTradeManager(
  config: TransactionConfig
): (
  state$: Observable<VaultTradeState>,
  global$: Observable<GlobalState>
) => Observable<Partial<VaultTradeState>> {
  return (
    state$: Observable<VaultTradeState>,
    global$: Observable<GlobalState>
  ): Observable<Partial<VaultTradeState>> => {
    // Shared Observables
    const network$ = selectedNetwork(global$);
    const account$ = selectedAccount(global$);
    const debtPool$ = selectedPool('Debt', state$, network$);
    const vaultPool$ = selectedVaultPool(state$, network$);

    // Emitted State Changes
    return merge(
      buildTransaction(state$, account$, config),
      postVaultAccountRisk(state$, account$),
      calculate(state$, debtPool$, vaultPool$, account$, config),
      parseRiskFactorLimit(state$, network$),
      selectedToken('Deposit', state$, network$),
      parseBalance('Deposit', state$),
      selectedToken('Collateral', state$, network$),
      parseBalance('Collateral', state$),
      selectedToken('Debt', state$, network$),
      parseBalance('Debt', state$),
      priorVaultAccountRisk(state$, account$),
      availableTokens(state$, network$, account$, config),
      initState(state$, network$),
      resetOnNetworkChange(global$, initialBaseTradeState)
    );
  };
}
