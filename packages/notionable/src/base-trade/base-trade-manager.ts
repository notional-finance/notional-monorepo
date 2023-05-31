import { TokenDefinition } from '@notional-finance/core-entities';
import {
  CalculationFn,
  CalculationFnParams,
} from '@notional-finance/transaction';
import { merge, Observable } from 'rxjs';
import { GlobalState } from '../global/global-state';
import { BaseTradeState, initialBaseTradeState } from './base-trade-store';
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

export interface TransactionConfig<F extends CalculationFn> {
  calculationFn: F;
  requiredArgs: CalculationFnParams[];
}

export function loadBaseTradeManager<F extends CalculationFn>(
  state$: Observable<BaseTradeState>,
  global$: Observable<GlobalState>,
  transactionConfig: TransactionConfig<F>,
  tokenFilters?: {
    depositFilter?: (t: TokenDefinition) => boolean;
    collateralFilter?: (t: TokenDefinition) => boolean;
    debtFilter?: (t: TokenDefinition) => boolean;
  }
): Observable<Partial<BaseTradeState>> {
  // Shared Observables
  const network$ = selectedNetwork(global$);
  const account$ = selectedAccount(global$);
  const debtPool$ = selectedPool('Debt', state$, network$);
  const collateralPool$ = selectedPool('Collateral', state$, network$);

  // Emitted State Changes
  return merge(
    resetOnNetworkChange(global$, initialBaseTradeState),
    initState(state$, network$, tokenFilters),
    priorAccountRisk(account$),
    selectedToken('Deposit', state$, network$),
    parseBalance('Deposit', state$),
    selectedToken('Collateral', state$, network$),
    parseBalance('Collateral', state$),
    selectedToken('Debt', state$, network$),
    parseBalance('Debt', state$),
    parseRiskFactorLimit(state$, network$),
    calculate(state$, debtPool$, collateralPool$, account$, transactionConfig),
    postAccountRisk(state$, account$)
    // buildTransactionCall(state$)
  );
}
