import {
  Registry,
  TokenBalance,
  TokenDefinition,
} from '@notional-finance/core-entities';
import { formatNumberAsPercent } from '@notional-finance/helpers';

export const getTotalIncentiveApy = (num1?: number, num2?: number) => {
  if (num1 && num2) {
    return formatNumberAsPercent(num1 + num2);
  } else if (num1) {
    return formatNumberAsPercent(num1);
  } else if (num2) {
    return formatNumberAsPercent(num2);
  } else {
    return formatNumberAsPercent(0);
  }
};

export const getTotalIncentiveSymbol = (symbol1?: string, symbol2?: string) => {
  if (symbol1 && symbol2) {
    return [symbol1, symbol2];
  } else if (symbol1) {
    return [symbol1];
  } else if (symbol2) {
    return [symbol2];
  } else {
    return [];
  }
};

export const getDebtOrCollateralFactor = (
  token: TokenDefinition,
  underlying: TokenDefinition,
  isBorrow = false
) => {
  const { buffer, haircut } =
    Registry.getConfigurationRegistry().getCurrencyHaircutAndBuffer(token);
  const unit = TokenBalance.unit(underlying).toToken(token);
  if (isBorrow) {
    return (
      Math.abs(unit.neg().toRiskAdjustedUnderlying().toFloat() * buffer) / 100
    ).toFixed(4);
  } else {
    return (
      (unit.toRiskAdjustedUnderlying().toFloat() * haircut) /
      100
    ).toFixed(4);
  }
};
