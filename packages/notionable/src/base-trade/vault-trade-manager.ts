import { EMPTY, merge, Observable } from 'rxjs';
import { GlobalState } from '../global/global-state';
import { initialBaseTradeState, VaultTradeState } from './base-trade-store';
import {
  resetOnNetworkChange,
  initState,
  priorVaultAccountRisk,
  parseBalance,
  parseRiskFactorLimit,
  calculate,
  postVaultAccountRisk,
  availableTokens,
  buildTransaction,
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
    calculate(state$, debtPool$, EMPTY, vaultAdapter$, account$),
    parseRiskFactorLimit(state$, network$),
    selectedToken('Deposit', state$, network$),
    parseBalance('Deposit', state$),
    selectedToken('Collateral', state$, network$),
    parseBalance('Collateral', state$),
    selectedToken('Debt', state$, network$),
    parseBalance('Debt', state$),
    priorVaultAccountRisk(state$, account$),
    availableTokens(state$, network$, account$),
    initState(state$, network$),
    resetOnNetworkChange(global$, initialBaseTradeState)
  );
}
