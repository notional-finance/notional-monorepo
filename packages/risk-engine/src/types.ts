import { TokenBalance, TokenDefinition } from '@notional-finance/core-entities';

/** Denomination can be either a specific currency id or symbol */
export type SymbolOrID = string | number;

export interface RiskFactors {
  // Absolute values
  netWorth: () => TokenBalance;
  freeCollateral: () => TokenBalance;
  // Ratios
  loanToValue: () => number;
  collateralRatio: () => number | null;
  healthFactor: () => number | null;
  leverageRatio: () => number | null;
  // Thresholds
  liquidationPrice: (
    debt: TokenDefinition,
    collateral: TokenDefinition
  ) => TokenBalance | null;
  collateralLiquidationThreshold: (
    collateral: TokenDefinition
  ) => TokenBalance | null;
}

export interface RiskFactorLimit<F extends keyof RiskFactors> {
  riskFactor: F;
  limit: NonNullable<ReturnType<RiskFactors[F]>>;
  args?: Parameters<RiskFactors[F]>;
}
