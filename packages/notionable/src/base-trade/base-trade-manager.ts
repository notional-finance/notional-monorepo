import { TokenDefinition } from '@notional-finance/core-entities';
import { map, merge, Observable } from 'rxjs';
import { GlobalState } from '../global/global-state';
import { BaseTradeState, initialBaseTradeState } from './base-trade-store';
import {
  resetOnNetworkChange,
  selectedAccount,
  selectedPool,
  selectedNetwork,
  selectedTokens,
  initState,
  emitPoolData,
  emitAccountRisk,
  parseBalance,
} from './logic';

export const loadTradeManager = (
  state$: Observable<BaseTradeState>,
  global$: Observable<GlobalState>,
  canSubmit: (s: BaseTradeState) => boolean,
  collateralFilter?: (t: TokenDefinition) => boolean,
  debtFilter?: (t: TokenDefinition) => boolean
): Observable<Partial<BaseTradeState>> => {
  // Shared Variables
  const network$ = selectedNetwork(global$);
  const account$ = selectedAccount(global$);
  const debtPool$ = selectedPool('Debt', state$);
  const collateralPool$ = selectedPool('Collateral', state$);

  // Emitted State Changes
  const onNetworkChange$ = resetOnNetworkChange(global$, initialBaseTradeState);
  const onInitState$ = initState(
    state$,
    network$,
    collateralFilter,
    debtFilter
  );
  const onDebtToken$ = selectedTokens('Debt', state$, network$);
  const onCollateralToken$ = selectedTokens('Collateral', state$, network$);
  const onDebtPoolData$ = emitPoolData('Debt', debtPool$);
  const onCollateralPoolData$ = emitPoolData('Collateral', collateralPool$);
  const onPriorRisk$ = emitAccountRisk(account$);
  const onDepositInput$ = parseBalance('Deposit', state$);
  const onCollateralInput$ = parseBalance('Collateral', state$);
  const onDebtInput$ = parseBalance('Debt', state$);
  const onCanSubmit$ = state$.pipe(map((s) => ({ canSubmit: canSubmit(s) })));
  const onTransaction$ = emitTransactionCall(state$, onCanSubmit$);
  const onCurrentRisk$ = emitAccountRisk(state$, network$, onTransaction$);

  return merge(
    onNetworkChange$,
    onInitState$,
    onDebtToken$,
    onCollateralToken$,
    onDebtPoolData$,
    onCollateralPoolData$,
    onCanSubmit$,
    onPriorRisk$,
    onDepositInput$,
    onCollateralInput$,
    onDebtInput$,
    onCurrentRisk$
  );
};
