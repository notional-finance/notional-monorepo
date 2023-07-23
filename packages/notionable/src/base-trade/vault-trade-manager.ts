import { merge, Observable, of } from 'rxjs';
import { GlobalState } from '../global/global-state';
import { VaultTradeState } from './base-trade-store';
import {
  resetOnNetworkChange,
  initVaultState,
  priorVaultAccountRisk,
  calculate,
  postVaultAccountRisk,
  availableTokens,
  buildTransaction,
  resetOnTradeTypeChange,
  defaultLeverageRatio,
} from './logic';
import {
  selectedAccount,
  selectedNetwork,
  selectedPool,
  selectedToken,
  selectedVaultAdapter,
} from './selectors';

export function createVaultTradeManager(
  state$: Observable<VaultTradeState>,
  global$: Observable<GlobalState>
): Observable<Partial<VaultTradeState>> {
  // Shared Observables
  const network$ = selectedNetwork(global$);
  const account$ = selectedAccount(global$);
  const debtPool$ = selectedPool('Debt', state$, network$);
  const vaultAdapter$ = selectedVaultAdapter(state$, network$);

  // Emitted State Changes
  return merge(
    buildTransaction(state$, account$),
    postVaultAccountRisk(state$, account$),
    calculate(state$, debtPool$, of(undefined), vaultAdapter$, account$),
    defaultLeverageRatio(state$, network$),
    selectedToken('Collateral', state$, network$),
    selectedToken('Debt', state$, network$),
    selectedToken('Deposit', state$, network$),
    priorVaultAccountRisk(state$, account$),
    availableTokens(state$, network$, account$),
    initVaultState(state$, network$),
    resetOnNetworkChange(global$, state$),
    resetOnTradeTypeChange(state$, true)
  );
}
