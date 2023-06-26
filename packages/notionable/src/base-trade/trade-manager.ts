import { of, merge, Observable } from 'rxjs';
import { GlobalState } from '../global/global-state';
import { TradeState, initialBaseTradeState } from './base-trade-store';
import {
  resetOnNetworkChange,
  initState,
  priorAccountRisk,
  parseBalance,
  parseRiskFactorLimit,
  calculate,
  postAccountRisk,
  availableTokens,
  buildTransaction,
} from './logic';
import {
  selectedAccount,
  selectedNetwork,
  selectedPool,
  selectedToken,
} from './selectors';

export function createTradeManager(
  state$: Observable<TradeState>,
  global$: Observable<GlobalState>
): Observable<Partial<TradeState>> {
  // Shared Observables
  const network$ = selectedNetwork(global$);
  const account$ = selectedAccount(global$);
  const debtPool$ = selectedPool('Debt', state$, network$);
  const collateralPool$ = selectedPool('Collateral', state$, network$);

  // Emitted State Changes, these need to be ordered in REVERSE dependency
  // order. The first method to emit should be listed last so that dependent
  // observables can create their subscription prior to the upstream observable
  // emits.
  return merge(
    buildTransaction(state$, account$),
    postAccountRisk(state$, account$),
    calculate(state$, debtPool$, collateralPool$, of(undefined), account$),
    parseRiskFactorLimit(state$, network$),
    selectedToken('Deposit', state$, network$),
    parseBalance('Deposit', state$),
    selectedToken('Collateral', state$, network$),
    parseBalance('Collateral', state$),
    selectedToken('Debt', state$, network$),
    parseBalance('Debt', state$),
    priorAccountRisk(account$),
    availableTokens(state$, network$, account$),
    initState(state$, network$),
    resetOnNetworkChange(global$, initialBaseTradeState)
  );
}
