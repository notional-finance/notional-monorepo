import { merge, Observable } from 'rxjs';
import { GlobalState } from '../global/global-state';
import {
  BaseTradeState,
  initialBaseTradeState,
  TransactionConfig,
} from './base-trade-store';
import {
  resetOnNetworkChange,
  selectedAccount,
  selectedPool,
  selectedNetwork,
  selectedToken,
  initState,
  priorAccountRisk,
  parseBalance,
  parseRiskFactorLimit,
  calculate,
  postAccountRisk,
} from './logic';

export function loadBaseTradeManager(
  state$: Observable<BaseTradeState>,
  global$: Observable<GlobalState>,
  config: TransactionConfig
): Observable<Partial<BaseTradeState>> {
  // Shared Observables
  const network$ = selectedNetwork(global$);
  const account$ = selectedAccount(global$);
  const debtPool$ = selectedPool('Debt', state$, network$);
  const collateralPool$ = selectedPool('Collateral', state$, network$);

  // Emitted State Changes
  return merge(
    resetOnNetworkChange(global$, initialBaseTradeState),
    initState(state$, network$, config.tokenFilters),
    priorAccountRisk(account$),
    selectedToken('Deposit', state$, network$),
    parseBalance('Deposit', state$),
    selectedToken('Collateral', state$, network$),
    parseBalance('Collateral', state$),
    selectedToken('Debt', state$, network$),
    parseBalance('Debt', state$),
    parseRiskFactorLimit(state$, network$),
    calculate(state$, debtPool$, collateralPool$, account$, config),
    postAccountRisk(state$, account$)
    // buildTransactionCall(state$)
  );
}
