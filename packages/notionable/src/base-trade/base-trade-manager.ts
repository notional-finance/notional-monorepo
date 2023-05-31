import { TokenDefinition } from '@notional-finance/core-entities';
import { map, merge, Observable } from 'rxjs';
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
} from './logic';

export const loadTradeManager = (
  state$: Observable<BaseTradeState>,
  global$: Observable<GlobalState>,
  canSubmit: (s: BaseTradeState) => boolean,
  tokenFilters?: {
    depositFilter?: (t: TokenDefinition) => boolean;
    collateralFilter?: (t: TokenDefinition) => boolean;
    debtFilter?: (t: TokenDefinition) => boolean;
  }
): Observable<Partial<BaseTradeState>> => {
  // Shared Observables
  const network$ = selectedNetwork(global$);
  const account$ = selectedAccount(global$);
  const debtPool$ = selectedPool('Debt', state$, network$);
  const collateralPool$ = selectedPool('Collateral', state$, network$);
  const canSubmit$ = state$.pipe(map((s) => ({ canSubmit: canSubmit(s) })));

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
    parseBalance('Debt', state$)
  );
  // $ = emitTransactionCall(state$, onCanSubmit$);
  // $ = emitAccountRisk(state$, network$, onTransaction$);
};
