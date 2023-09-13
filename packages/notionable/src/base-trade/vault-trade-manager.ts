import { merge, Observable, of } from 'rxjs';
import { GlobalState } from '../global/global-state';
import { VaultTradeState } from './base-trade-store';
import {
  resetOnNetworkChange,
  initVaultState,
  priorVaultAccountRisk,
  postVaultAccountRisk,
  availableTokens,
  buildTransaction,
  resetOnTradeTypeChange,
  simulateTransaction,
  selectedPool,
  selectedVaultAdapter,
  defaultVaultLeverageRatio,
} from './sagas';
import { selectedAccount, selectedNetwork } from '../global';
import { calculate } from './trade-calculation';

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
    simulateTransaction(state$, account$, network$),
    buildTransaction(state$, account$),
    postVaultAccountRisk(state$, account$),
    calculate(state$, debtPool$, of(undefined), vaultAdapter$, account$),
    defaultVaultLeverageRatio(state$, network$),
    priorVaultAccountRisk(state$, account$),
    availableTokens(state$, network$, account$),
    initVaultState(state$, network$, global$),
    resetOnNetworkChange(global$, state$),
    resetOnTradeTypeChange(state$, true)
  );
}
