import { SliderRisk } from '@notional-finance/mui';
import { useRiskLabel, useRiskRatios } from '@notional-finance/notionable-hooks';
import { AccountData } from '@notional-finance/sdk';

interface RiskSliderProps {
  updatedAccountData?: AccountData;
}

export const RiskSlider = ({ updatedAccountData }: RiskSliderProps) => {
  const { loanToValue: currentLoanToValue } = useRiskRatios();
  // If updated account data is null, then this will show current
  const { loanToValue: updatedLoanToValue, maxLoanToValue } = useRiskRatios(updatedAccountData);
  const { riskLevel } = useRiskLabel(updatedAccountData);

  return (
    <SliderRisk
      riskLevel={riskLevel}
      loanToValue={currentLoanToValue}
      maxLoanToValue={maxLoanToValue}
      updatedLoanToValue={updatedAccountData ? updatedLoanToValue : undefined}
      showInteriorTitle
    />
  );
};
