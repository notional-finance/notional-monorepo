import { Network } from '@notional-finance/util';
import { TradeState, TransactionConfig } from './base-trade-store';
import { Observable, merge, of } from 'rxjs';
import { selectedAccount } from '../global';
import {
  compareNOTEPortfolio,
  initState,
  setDepositToken,
  stakedNOTEPool,
} from './sagas/staked-note';
import { buildTransaction } from './sagas';
import {
  StakeNOTE,
  StakeNOTECoolDown,
  StakeNOTERedeem,
  calculateStake,
  calculateUnstake,
} from '@notional-finance/transaction';
import { calculate } from './trade-calculation';

export function createNOTEManager(
  state$: Observable<TradeState>
): Observable<Partial<TradeState>> {
  const network$ = of(Network.mainnet);
  const account$ = selectedAccount(network$);
  const stakedNOTEPool$ = stakedNOTEPool(network$);

  return merge(
    buildTransaction(state$, account$),
    compareNOTEPortfolio(state$, account$),
    calculate(state$, of(undefined), stakedNOTEPool$, of(undefined), account$),
    setDepositToken(state$),
    initState(state$, account$, stakedNOTEPool$)
  );
}

export const NOTETradeConfiguration = {
  StakeNOTE: {
    calculationFn: calculateStake,
    requiredArgs: [
      'collateralPool',
      'deposit',
      'depositBalance',
      'useOptimalETH',
      'secondaryDepositBalance',
    ],
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
    calculationFn: calculateUnstake,
    requiredArgs: ['collateralPool', 'depositBalance'],
    collateralFilter: () => false,
    debtFilter: () => false,
    transactionBuilder: StakeNOTERedeem,
  },
};

export type NOTETradeType = keyof typeof NOTETradeConfiguration;
