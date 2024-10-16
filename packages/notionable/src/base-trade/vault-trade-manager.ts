import { merge, Observable, of } from 'rxjs';
import { VaultTradeState } from './base-trade-store';
import {
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
  vaultCapacity,
  selectedPortfolioToken,
} from './sagas';
import { selectedAccount, selectedNetwork } from '../global';
import { calculate } from './trade-calculation';

export function createVaultTradeManager(
  state$: Observable<VaultTradeState>
): Observable<Partial<VaultTradeState>> {
  // Shared Observables
  const network$ = selectedNetwork(state$);
  const account$ = selectedAccount(network$);
  const debtPool$ = selectedPool('Debt', state$, network$);
  const vaultAdapter$ = selectedVaultAdapter(state$, network$);

  // Emitted State Changes
  return merge(
    simulateTransaction(state$, account$, network$),
    buildTransaction(state$, account$),
    vaultCapacity(state$, account$, network$),
    postVaultAccountRisk(state$, account$),
    defaultVaultLeverageRatio(state$),
    priorVaultAccountRisk(state$, account$),
    calculate(state$, debtPool$, of(undefined), vaultAdapter$, account$),
    availableTokens(state$, network$, account$),
    selectedPortfolioToken(state$),
    initVaultState(state$),
    resetOnTradeTypeChange(state$, true)
  );
}
