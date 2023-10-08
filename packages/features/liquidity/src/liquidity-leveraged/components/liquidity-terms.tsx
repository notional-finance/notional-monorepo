import { Box, styled, useTheme } from '@mui/material';
import { LiquidityContext } from '../../liquidity';
import {
  Body,
  InputLabel,
  LabelValue,
  ToggleSwitch,
} from '@notional-finance/mui';
import { FormattedMessage, defineMessage } from 'react-intl';
import { useContext, useEffect } from 'react';
import {
  LeverageSlider,
  VariableFixedMaturityToggle,
} from '@notional-finance/trade';
import {
  formatLeverageRatio,
  formatNumberAsPercent,
} from '@notional-finance/helpers';
import { useMaxYield } from '../hooks/use-max-yield';

export const LiquidityTerms = () => {
  const context = useContext(LiquidityContext);
  const theme = useTheme();
  const { state, updateState } = context;
  const {
    customizeLeverage,
    riskFactorLimit,
    debt,
    availableDebtTokens,
    defaultLeverageRatio,
    deposit,
  } = state;

  const maxYield = useMaxYield(deposit);
  const leverageRatio =
    riskFactorLimit?.riskFactor === 'leverageRatio'
      ? (riskFactorLimit.limit as number)
      : 0;

  useEffect(() => {
    if (
      !customizeLeverage &&
      deposit &&
      defaultLeverageRatio &&
      defaultLeverageRatio !== leverageRatio &&
      (debt === undefined || debt.tokenType !== 'PrimeDebt')
    ) {
      updateState({
        debt: availableDebtTokens?.find((t) => t.tokenType === 'PrimeDebt'),
        riskFactorLimit: {
          riskFactor: 'leverageRatio',
          limit: defaultLeverageRatio,
          args: [deposit.currencyId],
        },
      });
    }
  }, [
    debt,
    customizeLeverage,
    availableDebtTokens,
    updateState,
    deposit,
    defaultLeverageRatio,
    leverageRatio,
  ]);

  const toggleLeverage = () =>
    updateState({ customizeLeverage: !customizeLeverage });

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
        }}
      >
        <InputLabel
          inputLabel={
            customizeLeverage
              ? defineMessage({
                  defaultMessage: '2. Customize your terms',
                })
              : defineMessage({
                  defaultMessage: 'Default Terms are Selected',
                })
          }
        />
        <ToggleSwitch
          isChecked={customizeLeverage}
          onToggle={toggleLeverage}
          label={<FormattedMessage defaultMessage={'Customize'} />}
        />
      </Box>
      <Box>
        {customizeLeverage ? (
          <Box
            sx={{
              borderRadius: theme.shape.borderRadius(),
              border: theme.shape.borderStandard,
              padding: theme.spacing(2),
            }}
          >
            <VariableFixedMaturityToggle context={context} />
            <Box height={theme.spacing(6)} />
            <LeverageSlider
              context={context}
              inputLabel={defineMessage({
                defaultMessage: 'Specify your leverage',
                description: 'input label',
              })}
            />
          </Box>
        ) : (
          <Box
            sx={{
              display: 'flex',
              width: '100%',
              justifyContent: 'space-around',
            }}
          >
            <BoundedBox
              sx={{
                marginRight: theme.spacing(3),
                background: theme.palette.info.light,
                border: `1px solid ${theme.palette.primary.light}`,
              }}
            >
              <Box sx={{ marginRight: theme.spacing(6) }}>
                <Body
                  uppercase
                  gutter="default"
                  msg={defineMessage({ defaultMessage: 'Leverage' })}
                />
                <LabelValue>{formatLeverageRatio(leverageRatio, 2)}</LabelValue>
              </Box>
              <Box sx={{ width: '50%' }}>
                <Body
                  uppercase
                  gutter="default"
                  msg={defineMessage({ defaultMessage: 'Borrow' })}
                />
                <LabelValue>
                  <FormattedMessage defaultMessage={'Variable'} />
                </LabelValue>
              </Box>
            </BoundedBox>
            <BoundedBox
              sx={{
                ':hover': {
                  background: theme.palette.info.light,
                  cursor: 'pointer',
                },
              }}
              aria-controls="button"
              onClick={toggleLeverage}
            >
              <Box>
                <Body
                  gutter="default"
                  msg={defineMessage({ defaultMessage: 'Customize' })}
                />
                <Body>
                  <FormattedMessage
                    defaultMessage={'Up to {max} APY'}
                    values={{
                      max: maxYield ? formatNumberAsPercent(maxYield) : '',
                    }}
                  />
                </Body>
              </Box>
            </BoundedBox>
          </Box>
        )}
      </Box>
    </Box>
  );
};

const BoundedBox = styled(Box)(
  ({ theme }) => `
display: flex;
border-radius: ${theme.shape.borderRadius()};
border: ${theme.shape.borderStandard};
padding: ${theme.spacing(2)};
justify-content: space-evenly;
`
);
