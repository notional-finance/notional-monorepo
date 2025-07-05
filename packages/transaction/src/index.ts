import { PopulatedTransaction } from 'ethers';
import { PopulateTransactionInputs } from './builders/common';
import {
  calculateVaultDebtCollateralGivenDepositRiskLimit,
  calculateVaultRoll,
  calculateStake,
  calculateUnstake,
} from './calculate';

export * from './builders';
export * from './calculate';
export {
  simulatePopulatedTxn,
  applySimulationToAccount,
  simulateRewardClaims,
} from './simulate';
export type { SimulationCallTrace } from './simulate';
export type { PopulateTransactionInputs } from './builders/common';

export type CalculationFn =
  | typeof calculateVaultDebtCollateralGivenDepositRiskLimit
  | typeof calculateVaultRoll
  | typeof calculateStake
  | typeof calculateUnstake
  | (() => void);

type ParamKeys<F extends CalculationFn> = Parameters<F> extends (infer U)[]
  ? keyof U
  : null;

export type CalculationFnParams =
  | ParamKeys<typeof calculateVaultDebtCollateralGivenDepositRiskLimit>
  | ParamKeys<typeof calculateVaultRoll>
  | ParamKeys<typeof calculateStake>
  | ParamKeys<typeof calculateUnstake>;

export type TransactionBuilder = (
  t: PopulateTransactionInputs
) => Promise<PopulatedTransaction>;
