import { useTheme } from '@mui/material';
import { AccountData } from '@notional-finance/sdk';
import { collateralDefaults } from '@notional-finance/utils';
import { defineMessages, MessageDescriptor } from 'react-intl';
import { useRiskRatios } from './use-risk-ratios';
import { useRiskThresholds } from './use-risk-thresholds';

const riskLevels = defineMessages({
  noDebt: {
    defaultMessage: 'No Debt',
    description: 'risk label',
  },
  highRisk: {
    defaultMessage: 'High Risk',
    description: 'risk label',
  },
  mediumRisk: {
    defaultMessage: 'Medium Risk',
    description: 'risk label',
  },
  lowRisk: {
    defaultMessage: 'Low Risk',
    description: 'risk label',
  },
});

export function useRiskLabel(_accountDataCopy?: AccountData) {
  const theme = useTheme();
  const { loanToValue, fcToNetValue } = useRiskRatios(_accountDataCopy);
  const { liquidationPrices, hasInterestRateRisk } = useRiskThresholds(_accountDataCopy);

  let riskLevel: MessageDescriptor;
  let hasRisk = false;
  let hasNoRiskLocalCurrency = false;
  let showCheckSimulatorWarning = false;
  let riskLevelColor = theme.palette.common.black;
  if (loanToValue === null) {
    riskLevel = riskLevels.noDebt;
  } else if (liquidationPrices?.length === 0 && !hasInterestRateRisk) {
    if (fcToNetValue !== null && fcToNetValue < collateralDefaults.fcToNetValueRisk) {
      riskLevel = riskLevels.highRisk;
      showCheckSimulatorWarning = true;
      riskLevelColor = theme.palette.error.main;
      hasRisk = true;
    } else {
      riskLevel = riskLevels.lowRisk;
      riskLevelColor = theme.palette.primary.main;
      hasNoRiskLocalCurrency = true;
    }
  } else if (loanToValue < collateralDefaults.labelLow) {
    riskLevel = riskLevels.lowRisk;
    riskLevelColor = theme.palette.primary.main;
    hasRisk = true;
  } else if (loanToValue < collateralDefaults.labelMedium) {
    riskLevel = riskLevels.mediumRisk;
    hasRisk = true;
  } else {
    riskLevel = riskLevels.highRisk;
    riskLevelColor = theme.palette.error.main;
    hasRisk = true;
  }

  return {
    riskLevel,
    hasNoRiskLocalCurrency,
    showCheckSimulatorWarning,
    riskLevelColor,
    hasRisk,
  };
}
