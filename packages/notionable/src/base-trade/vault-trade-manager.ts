import { merge, Observable } from 'rxjs';
import { GlobalState } from '../global/global-state';
import {
  initialBaseTradeState,
  TransactionConfig,
  VaultTradeState,
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
  availableTokens,
  buildTransaction,
  selectedVaultPool,
} from './logic';

export function createVaultTradeManager(
  config: TransactionConfig
): (
  state$: Observable<VaultTradeState>,
  global$: Observable<GlobalState>
) => Observable<Partial<VaultTradeState>> {
  return (
    state$: Observable<VaultTradeState>,
    global$: Observable<GlobalState>
  ): Observable<Partial<VaultTradeState>> => {
    // Shared Observables
    const network$ = selectedNetwork(global$);
    const account$ = selectedAccount(global$);
    const debtPool$ = selectedPool('Debt', state$, network$);
    const vaultPool$ = selectedVaultPool(state$, network$);

    // Emitted State Changes
    return merge(
      resetOnNetworkChange(global$, initialBaseTradeState),
      initState(state$, network$),
      availableTokens(state$, network$, account$, config),
      //priorAccountRisk(account$),
      selectedToken('Deposit', state$, network$),
      parseBalance('Deposit', state$),
      selectedToken('Collateral', state$, network$),
      parseBalance('Collateral', state$),
      selectedToken('Debt', state$, network$),
      parseBalance('Debt', state$),
      parseRiskFactorLimit(state$, network$),
      //calculate(state$, debtPool$, vaultPool$, account$, config),
      //postAccountRisk(state$, account$),
      buildTransaction(state$, account$, config)
    );
  };
}
