import { NotionalTheme, colors } from '@notional-finance/styles';
import { HEALTH_FACTOR_RISK_LEVELS } from '@notional-finance/util';

export function formatHealthFactorValues(
  healthFactorValue: null | number | undefined,
  theme: NotionalTheme
) {
  const textColor =
    healthFactorValue &&
    healthFactorValue <= HEALTH_FACTOR_RISK_LEVELS.HIGH_RISK
      ? colors.red
      : healthFactorValue &&
        healthFactorValue <= HEALTH_FACTOR_RISK_LEVELS.MEDIUM_RISK
      ? colors.orange
      : healthFactorValue &&
        healthFactorValue <= HEALTH_FACTOR_RISK_LEVELS.LOW_RISK
      ? theme.palette.secondary.light
      : theme.palette.secondary.light;

  const value =
    healthFactorValue && healthFactorValue > 5
      ? '5+ / 5.0'
      : !healthFactorValue
      ? 'No Risk'
      : ` ${healthFactorValue?.toFixed(2)} / 5.0`;
  return { value, textColor };
}
