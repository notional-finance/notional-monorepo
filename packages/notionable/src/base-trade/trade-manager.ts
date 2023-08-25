import { of, merge, Observable } from 'rxjs';
import { GlobalState } from '../global/global-state';
import { TradeState } from './base-trade-store';
import {
  resetOnNetworkChange,
  initState,
  priorAccountRisk,
  postAccountRisk,
  availableTokens,
  buildTransaction,
  resetOnTradeTypeChange,
  defaultLeverageRatio,
  tradeSummary,
  simulateTransaction,
} from './logic';
import {
  selectedAccount,
  selectedNetwork,
  selectedPool,
  selectedToken,
} from './selectors';
import { calculate, calculateMaxWithdraw } from './trade-calculation';

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
    simulateTransaction(state$, account$, network$),
    buildTransaction(state$, account$),
    tradeSummary(state$, account$),
    postAccountRisk(state$, account$),
    calculateMaxWithdraw(
      state$,
      debtPool$,
      collateralPool$,
      of(undefined),
      account$
    ),
    calculate(state$, debtPool$, collateralPool$, of(undefined), account$),
    defaultLeverageRatio(state$, network$),
    // NOTE: this is required to read URL based inputs for deposits
    selectedToken(state$, network$),
    priorAccountRisk(state$, account$, network$),
    availableTokens(state$, network$, account$),
    initState(state$, network$, global$),
    resetOnNetworkChange(global$, state$),
    resetOnTradeTypeChange(state$)
  );
}
