import { of, merge, Observable } from 'rxjs';
import { TradeState } from './base-trade-store';
import {
  initState,
  priorAccountRisk,
  postAccountRisk,
  availableTokens,
  buildTransaction,
  resetOnTradeTypeChange,
  defaultLeverageRatio,
  simulateTransaction,
  selectedPool,
  selectedToken,
} from './sagas';
import { selectedAccount, selectedNetwork } from '../global';
import { calculate, calculateMaxWithdraw } from './trade-calculation';
import { tradeSummary } from './metadata/account-summary';

export function createTradeManager(
  state$: Observable<TradeState>
): Observable<Partial<TradeState>> {
  // Shared Observables
  const network$ = selectedNetwork(state$);
  const account$ = selectedAccount(network$);
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
    priorAccountRisk(state$, account$),
    availableTokens(state$, network$, account$),
    initState(state$),
    resetOnTradeTypeChange(state$)
  );
}
