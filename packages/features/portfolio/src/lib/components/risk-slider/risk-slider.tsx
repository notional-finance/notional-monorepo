import { Box, styled, useTheme } from '@mui/material';
import { defineMessage, FormattedMessage } from 'react-intl';
import { useRiskLabel, useRiskRatios } from '@notional-finance/notionable-hooks';
import { InfoTooltip, SliderRisk, H4, Label, LabelValue, Paragraph } from '@notional-finance/mui';
import { formatNumberAsPercent } from '@notional-finance/utils';
import { NotionalTheme } from '@notional-finance/styles';

interface RiskSliderProps {
  displaySuggestedActions?: boolean;
  showBorder?: boolean;
}
interface MainContainerProps {
  theme: NotionalTheme;
  showBorder?: boolean;
}

export const RiskSlider = ({
  displaySuggestedActions = false,
  showBorder = false,
}: RiskSliderProps) => {
  const theme = useTheme();
  const { collateralRatio, loanToValue, maxLoanToValue } = useRiskRatios();
  const { riskLevel, hasRisk } = useRiskLabel();

  return (
    <Box sx={{ display: 'flex' }}>
      <MainContainer showBorder={showBorder} theme={theme}>
        <H4>
          <FormattedMessage defaultMessage={'Portfolio Liquidation Risk'} />
        </H4>
        {loanToValue && maxLoanToValue && (
          <SliderRisk
            loanToValue={loanToValue}
            maxLoanToValue={maxLoanToValue}
            riskLevel={riskLevel}
          />
        )}

        {hasRisk && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: theme.spacing(3),
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {collateralRatio && (
                <>
                  <Label sx={{ marginRight: theme.spacing(1) }}>
                    <FormattedMessage defaultMessage={'Collateralization Ratio:'} />
                  </Label>
                  <InfoTooltip
                    toolTipText={defineMessage({
                      defaultMessage:
                        'Your collateralization ratio represents how much collateral is deposited divided by how much debt your account has. A higher value represents less liquidation risk.',
                      description: 'tooltip text',
                    })}
                  />
                  <LabelValue sx={{ marginLeft: theme.spacing(3) }}>
                    {formatNumberAsPercent(collateralRatio)}
                  </LabelValue>
                </>
              )}
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {loanToValue && (
                <>
                  <Label sx={{ marginRight: theme.spacing(1) }}>
                    <FormattedMessage defaultMessage={'Loan to Value:'} />
                  </Label>
                  <InfoTooltip
                    toolTipText={defineMessage({
                      defaultMessage:
                        'Your loan to value ratio represents how much debt by how much collateral your account has. A lower value represents less liquidation risk.',
                      description: 'tooltip text',
                    })}
                  />
                  <LabelValue sx={{ marginLeft: theme.spacing(3) }}>
                    {formatNumberAsPercent(loanToValue)}
                  </LabelValue>
                </>
              )}
            </Box>
          </Box>
        )}
      </MainContainer>
      {displaySuggestedActions && <SuggestedActions />}
    </Box>
  );
};

export const SuggestedActions = () => {
  return (
    <SuggestedContainer>
      <H4>
        <FormattedMessage defaultMessage={'Suggested Actions'} />
      </H4>
      <Paragraph
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}
      >
        <FormattedMessage defaultMessage={'Coming soon!'} />
      </Paragraph>
    </SuggestedContainer>
  );
};

const MainContainer = styled(Box, {
  shouldForwardProp: (prop: string) => prop !== 'showBorder',
})(
  ({ theme, showBorder }: MainContainerProps) => `
  border-radius: ${theme.shape.borderRadius()};
  border: ${showBorder ? theme.shape.borderStandard : 'none'};
  background: ${theme.palette.background.paper};
  padding: 32px;
  padding-bottom: 0px;
  flex: 2;
`
);

const SuggestedContainer = styled(Box)(
  ({ theme }) => `
  border-radius: ${theme.shape.borderRadius()};
  border: ${theme.shape.borderStandard};
  background: ${theme.palette.common.white};
  padding: 32px;
  margin-left: 24px;
  flex: 1;
  display: block;
`
);

export default RiskSlider;
