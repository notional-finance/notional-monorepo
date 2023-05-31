import {
  calculateCollateral,
  calculateDebt,
  calculateDebtCollateralGivenDepositRiskLimit,
  calculateDeposit,
  calculateDepositCollateralGivenDebtRiskLimit,
  calculateDepositDebtGivenCollateralRiskLimit,
} from './calculate';

export * from './builders/nToken';
export * from './calculate';
export { simulatePopulatedTxn } from './common';

export type CalculationFn =
  | typeof calculateCollateral
  | typeof calculateDebt
  | typeof calculateDeposit
  | typeof calculateDebtCollateralGivenDepositRiskLimit
  | typeof calculateDepositCollateralGivenDebtRiskLimit
  | typeof calculateDepositDebtGivenCollateralRiskLimit;

type ParamKeys<F extends CalculationFn> = Parameters<F> extends (infer U)[]
  ? keyof U
  : null;

export type CalculationFnParams =
  | ParamKeys<typeof calculateCollateral>
  | ParamKeys<typeof calculateDebt>
  | ParamKeys<typeof calculateDeposit>
  | ParamKeys<typeof calculateDebtCollateralGivenDepositRiskLimit>
  | ParamKeys<typeof calculateDepositCollateralGivenDebtRiskLimit>
  | ParamKeys<typeof calculateDepositDebtGivenCollateralRiskLimit>;
