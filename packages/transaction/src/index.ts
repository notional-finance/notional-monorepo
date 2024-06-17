import { PopulatedTransaction } from 'ethers';
import { PopulateTransactionInputs } from './builders/common';
import {
  calculateCollateral,
  calculateDebt,
  calculateDebtCollateralGivenDepositRiskLimit,
  calculateDeleverage,
  calculateDeleverageWithdraw,
  calculateDeposit,
  calculateDepositCollateralGivenDebtRiskLimit,
  calculateDepositDebtGivenCollateralRiskLimit,
  calculateVaultDebtCollateralGivenDepositRiskLimit,
  calculateVaultDeposit,
  calculateVaultRoll,
  calculateStake,
  calculateUnstake,
} from './calculate';

export * from './builders';
export * from './calculate';
export { simulatePopulatedTxn, applySimulationToAccount } from './simulate';
export type { SimulationCallTrace } from './simulate';
export { parseTransactionLogs, parseTransactionType } from './parser';
export type { Transaction, Bundle, Transfer, ParsedLogs } from './parser';
export type { PopulateTransactionInputs } from './builders/common';

export type CalculationFn =
  | typeof calculateCollateral
  | typeof calculateDebt
  | typeof calculateDeposit
  | typeof calculateDeleverage
  | typeof calculateDeleverageWithdraw
  | typeof calculateDebtCollateralGivenDepositRiskLimit
  | typeof calculateDepositCollateralGivenDebtRiskLimit
  | typeof calculateDepositDebtGivenCollateralRiskLimit
  | typeof calculateVaultDebtCollateralGivenDepositRiskLimit
  | typeof calculateVaultDeposit
  | typeof calculateVaultRoll
  | typeof calculateStake
  | typeof calculateUnstake
  | (() => void);

type ParamKeys<F extends CalculationFn> = Parameters<F> extends (infer U)[]
  ? keyof U
  : null;

export type CalculationFnParams =
  | ParamKeys<typeof calculateCollateral>
  | ParamKeys<typeof calculateDebt>
  | ParamKeys<typeof calculateDeposit>
  | ParamKeys<typeof calculateDeleverage>
  | ParamKeys<typeof calculateDeleverageWithdraw>
  | ParamKeys<typeof calculateDebtCollateralGivenDepositRiskLimit>
  | ParamKeys<typeof calculateDepositCollateralGivenDebtRiskLimit>
  | ParamKeys<typeof calculateDepositDebtGivenCollateralRiskLimit>
  | ParamKeys<typeof calculateVaultDebtCollateralGivenDepositRiskLimit>
  | ParamKeys<typeof calculateVaultDeposit>
  | ParamKeys<typeof calculateVaultRoll>
  | ParamKeys<typeof calculateStake>
  | ParamKeys<typeof calculateUnstake>;

export type TransactionBuilder = (
  t: PopulateTransactionInputs
) => Promise<PopulatedTransaction>;
