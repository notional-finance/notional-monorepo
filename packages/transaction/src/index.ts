import { PopulatedTransaction } from 'ethers';
import { PopulateTransactionInputs } from './builders/common';
import {
  calculateCollateral,
  calculateDebt,
  calculateDebtCollateralGivenDepositRiskLimit,
  calculateDeleverage,
  calculateDeposit,
  calculateDepositCollateralGivenDebtRiskLimit,
  calculateDepositDebtGivenCollateralRiskLimit,
  calculateVaultDebtCollateralGivenDepositRiskLimit,
  calculateVaultDeposit,
  calculateVaultRoll,
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
  | typeof calculateDebtCollateralGivenDepositRiskLimit
  | typeof calculateDepositCollateralGivenDebtRiskLimit
  | typeof calculateDepositDebtGivenCollateralRiskLimit
  | typeof calculateVaultDebtCollateralGivenDepositRiskLimit
  | typeof calculateVaultDeposit
  | typeof calculateVaultRoll;

type ParamKeys<F extends CalculationFn> = Parameters<F> extends (infer U)[]
  ? keyof U
  : null;

export type CalculationFnParams =
  | ParamKeys<typeof calculateCollateral>
  | ParamKeys<typeof calculateDebt>
  | ParamKeys<typeof calculateDeposit>
  | ParamKeys<typeof calculateDeleverage>
  | ParamKeys<typeof calculateDebtCollateralGivenDepositRiskLimit>
  | ParamKeys<typeof calculateDepositCollateralGivenDebtRiskLimit>
  | ParamKeys<typeof calculateDepositDebtGivenCollateralRiskLimit>
  | ParamKeys<typeof calculateVaultDebtCollateralGivenDepositRiskLimit>
  | ParamKeys<typeof calculateVaultDeposit>
  | ParamKeys<typeof calculateVaultRoll>;

export type TransactionBuilder = (
  t: PopulateTransactionInputs
) => Promise<PopulatedTransaction>;
