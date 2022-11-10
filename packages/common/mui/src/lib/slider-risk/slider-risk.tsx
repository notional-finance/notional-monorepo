import { Box, styled } from '@mui/material';
import { collateralDefaults } from '@notional-finance/utils';
import { FormattedMessage, MessageDescriptor } from 'react-intl';
import SliderBasic from '../slider-basic/slider-basic';
import { H2, H4 } from '../typography/typography';

interface SliderRiskProps {
  riskLevel: MessageDescriptor;
  loanToValue: number | null;
  maxLoanToValue: number | null;
  updatedLoanToValue?: number | null;
  showInteriorTitle?: boolean;
}

const SliderContainer = styled(Box)(
  ({ theme }) => `
  background: ${theme.palette.background.default};
  border: ${theme.shape.borderStandard};
  border-radius: ${theme.shape.borderRadius()};
  padding: ${theme.spacing(3)};
  padding-bottom: ${theme.spacing(1)};
  margin: ${theme.spacing(3)} 0px;
`
);

export const SliderRisk = ({
  loanToValue,
  maxLoanToValue,
  riskLevel,
  updatedLoanToValue,
  showInteriorTitle = false,
}: SliderRiskProps) => {
  const marks = updatedLoanToValue ? [{ value: updatedLoanToValue, label: 'Updated' }] : undefined;

  return (
    <SliderContainer sx={{ marginBottom: loanToValue === 0 ? '0px' : '' }}>
      {showInteriorTitle && (
        <H4>
          <FormattedMessage defaultMessage="Portfolio Liquidation Risk" />
        </H4>
      )}
      <H2 msg={riskLevel} />
      <SliderBasic
        min={collateralDefaults.minLTV}
        // NOTE: this is difficult to handle because during local currency conditions
        // the max LTV returned is less than the actual LTV, while the account can
        // still go over the max and have positive free collateral
        max={maxLoanToValue || 100}
        value={loanToValue || 0}
        step={0.01}
        marks={marks}
        disabled={false}
        railGradients={[
          {
            color: [51, 255, 58], // Green
            value: 0,
          },
          {
            color: [249, 231, 59], // Yellow
            value: maxLoanToValue ? maxLoanToValue * 0.7 : 50,
          },
          {
            color: [255, 61, 113], // Red
            value: 100,
          },
        ]}
      />
    </SliderContainer>
  );
};
