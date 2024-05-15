import { Network } from '@notional-finance/util';
import { TradeState, TransactionConfig } from './base-trade-store';
import { Observable, merge, of } from 'rxjs';
import { selectedAccount } from '../global';
import {
  calculateStake,
  calculateUnstake,
  compareNOTEPortfolio,
  initState,
  stakedNOTEPool,
} from './sagas/staked-note';
import {
  buildTransaction,
  resetOnAccountChange,
  simulateTransaction,
} from './sagas';
import {
  StakeNOTE,
  StakeNOTECoolDown,
  StakeNOTERedeem,
} from '@notional-finance/transaction';

export function createNOTEManager(
  state$: Observable<TradeState>
): Observable<Partial<TradeState>> {
  const network$ = of(Network.mainnet);
  const account$ = selectedAccount(network$);
  const stakedNOTEPool$ = stakedNOTEPool(network$);

  return merge(
    simulateTransaction(state$, account$, network$),
    buildTransaction(state$, account$),
    compareNOTEPortfolio(state$, account$),
    calculateUnstake(state$, stakedNOTEPool$),
    calculateStake(state$, stakedNOTEPool$),
    initState(state$, account$, stakedNOTEPool$),
    resetOnAccountChange(account$)
  );
}

export const NOTETradeConfiguration = {
  StakeNOTE: {
    calculationFn: () => {
      /* void */
    },
    requiredArgs: [],
    collateralFilter: () => false,
    debtFilter: () => false,
    transactionBuilder: StakeNOTE,
  } as TransactionConfig,
  StakeNOTECoolDown: {
    calculationFn: () => {
      /* void */
    },
    requiredArgs: [],
    collateralFilter: () => false,
    debtFilter: () => false,
    transactionBuilder: StakeNOTECoolDown,
  } as TransactionConfig,
  StakeNOTERedeem: {
    calculationFn: () => {
      /* void */
    },
    requiredArgs: [],
    collateralFilter: () => false,
    debtFilter: () => false,
    transactionBuilder: StakeNOTERedeem,
  },
};

export type NOTETradeType = keyof typeof NOTETradeConfiguration;
