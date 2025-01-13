import {
  calculateStake,
  StakeNOTE,
  StakeNOTECoolDown,
  calculateUnstake,
  StakeNOTERedeem,
} from '@notional-finance/transaction';
import { TransactionConfig } from './base-trade-store';

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
