import { Box, styled, useTheme } from '@mui/material';
import SliderBasic from '../slider-basic/slider-basic';
import { LabelValue } from '../typography/typography';
import { FormattedMessage } from 'react-intl';

interface SliderRiskProps {
  healthFactor: number | null;
}

const SliderContainer = styled(Box)(
  ({ theme }) => `
  background: ${theme.palette.background.default};
  border: ${theme.shape.borderStandard};
  border-radius: ${theme.shape.borderRadius()};
  padding: ${theme.spacing(0.75, 1, 0.25, 1)};
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
`
);

export const SliderRisk = ({ healthFactor }: SliderRiskProps) => {
  const theme = useTheme();
  return (
    <SliderContainer>
      <SliderBasic
        min={1}
        // NOTE: set this a half step above the max value we actually set so that
        // the button does not overflow into the container padding
        max={5.05}
        value={healthFactor === null || healthFactor > 5 ? 5 : healthFactor}
        step={0.1}
        disabled={true}
        sx={{ marginBottom: '0px' }}
        railGradients={[
          {
            color: [255, 61, 113], // Red
            value: 6,
          },
          {
            color: [249, 223, 61], // Yellow
            value: 38,
          },
          {
            color: [52, 223, 58], // Green
            value: 100,
          },
        ]}
      />
      <LabelValue sx={{ marginLeft: theme.spacing(3), textWrap: 'nowrap' }}>
        {healthFactor ? (
          healthFactor > 5 ? (
            '5+'
          ) : (
            healthFactor.toFixed(2)
          )
        ) : (
          <FormattedMessage defaultMessage={'No Risk'} />
        )}
      </LabelValue>
    </SliderContainer>
  );
};
