import { Box, styled, useTheme } from '@mui/material';
import SliderBasic from '../slider-basic/slider-basic';
import { LabelValue } from '../typography/typography';
import { FormattedMessage } from 'react-intl';
import { NotionalTheme } from '@notional-finance/styles';

interface SliderRiskProps {
  healthFactor: number | null;
}
interface SliderContainerProps {
  theme: NotionalTheme;
  healthFactor: number | null;
}

export const SliderRisk = ({ healthFactor }: SliderRiskProps) => {
  const theme = useTheme();

  return (
    <SliderContainer healthFactor={healthFactor} theme={theme}>
      <SliderBasic
        min={1}
        // NOTE: set this a half step above the max value we actually set so that
        // the button does not overflow into the container padding
        max={5.0}
        value={healthFactor === null || healthFactor > 5 ? 5 : healthFactor}
        step={0.1}
        disabled={true}
        sx={{ marginBottom: '0px' }}
        showHFColors
      />
      <LabelValue sx={{ marginLeft: theme.spacing(3), textWrap: 'nowrap' }}>
        {healthFactor ? (
          healthFactor > 5 ? (
            '5+ / 5.0'
          ) : (
            `${healthFactor.toFixed(2)} / 5.0`
          )
        ) : (
          <FormattedMessage defaultMessage={'No Risk'} />
        )}
      </LabelValue>
    </SliderContainer>
  );
};

const SliderContainer = styled(Box, {
  shouldForwardProp: (prop: string) => prop !== 'healthFactor',
})(
  ({ theme, healthFactor }: SliderContainerProps) => `
  background: ${theme.palette.background.default};
  border: ${
    healthFactor && healthFactor < 1.25
      ? '1px solid red'
      : theme.shape.borderStandard
  };
  border-radius: ${theme.shape.borderRadius()};
  padding: ${theme.spacing(0.75, 1, 0.25, 1)};
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
`
);
