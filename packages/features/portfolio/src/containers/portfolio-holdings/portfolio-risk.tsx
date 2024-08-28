import { Box, styled, useTheme } from '@mui/material';
import { formatNumberAsPercent, trackEvent } from '@notional-finance/helpers';
import { useLocation } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import {
  InfoTooltip,
  H4,
  H5,
  LabelValue,
  PageLoading,
  SliderRisk,
  SimpleDropdown,
} from '@notional-finance/mui';
import { TRACKING_EVENTS } from '@notional-finance/util';
import {
  useAccountDefinition,
  useAccountReady,
  useCurrentLiquidationPrices,
  usePortfolioRiskProfile,
  useSelectedNetwork,
  useAppStore,
} from '@notional-finance/notionable-hooks';
import { FormattedMessage, MessageDescriptor, defineMessage } from 'react-intl';
import { useReduceRiskDropdown } from '../../hooks';

const LabelAndValue = ({
  label,
  value,
}: {
  label: MessageDescriptor;
  value: string;
}) => {
  const theme = useTheme();
  return (
    <Box sx={{ marginLeft: theme.spacing(2) }}>
      <H5 msg={label} />
      <LabelValue>{value}</LabelValue>
    </Box>
  );
};

const PortfolioRisk = () => {
  const theme = useTheme();
  const { pathname } = useLocation();
  const network = useSelectedNetwork();
  const isAccountReady = useAccountReady(network);
  const profile = usePortfolioRiskProfile(network);
  const account = useAccountDefinition(network);
  const { baseCurrency } = useAppStore();
  const loanToValue = profile?.loanToValue();
  const healthFactor = profile ? profile.healthFactor() : null;
  const { exchangeRateRisk, assetPriceRisk } = useCurrentLiquidationPrices(
    network,
    baseCurrency
  );
  const { options, title } = useReduceRiskDropdown();
  const hasDebts = !!account?.balances.find(
    (t) => t.isNegative() && !t.isVaultToken
  );

  const hasLiquidationPrices =
    exchangeRateRisk.length > 0 || assetPriceRisk.length > 0;

  if (!isAccountReady) return <PageLoading />;

  return (
    <Container>
      <RiskHeaderBox
        sx={{
          borderBottomLeftRadius: hasLiquidationPrices
            ? '0px'
            : theme.shape.borderRadius(),
          borderBottomRightRadius: hasLiquidationPrices
            ? '0px'
            : theme.shape.borderRadius(),
        }}
      >
        <H4 gutter={'default'} sx={{ display: 'flex', alignItems: 'center' }}>
          <FormattedMessage defaultMessage={'Portfolio Health Factor'} />
          <InfoTooltip
            onMouseEnter={() =>
              trackEvent(TRACKING_EVENTS.TOOL_TIP, {
                path: pathname,
                type: TRACKING_EVENTS.HOVER_TOOL_TIP,
                title: 'Portfolio Health Factor',
              })
            }
            iconColor={theme.palette.typography.accent}
            iconSize={theme.spacing(2)}
            sx={{ marginLeft: theme.spacing(1) }}
            toolTipText={defineMessage({
              defaultMessage:
                'Your health factor measures the riskiness of your account. If your health factor drops below 1, you can be liquidated.',
            })}
          />
        </H4>
        <RiskContainer>
          <RiskData>
            <Box
              sx={{
                width: { sm: '100%', md: theme.spacing(54) },
              }}
            >
              <SliderRisk healthFactor={healthFactor} />
            </Box>
            <Box
              sx={{
                display: 'flex',
                width: { sm: '100%', md: '50%' },
                justifyContent: 'space-evenly',
                marginLeft: { sm: 0, md: theme.spacing(5) },
              }}
            >
              <LabelAndValue
                label={defineMessage({ defaultMessage: 'Total Collateral' })}
                value={
                  profile
                    ?.totalAssets()
                    .toFiat(baseCurrency)
                    .toDisplayStringWithSymbol(2, true) || '-'
                }
              />
              <LabelAndValue
                label={defineMessage({ defaultMessage: 'Total Debt' })}
                value={
                  profile
                    ?.totalDebt()
                    .abs()
                    .toFiat(baseCurrency)
                    .toDisplayStringWithSymbol(2, true) || '-'
                }
              />
              <LabelAndValue
                label={defineMessage({ defaultMessage: 'Loan to Value' })}
                value={
                  loanToValue ? formatNumberAsPercent(loanToValue, 2) : '-'
                }
              />
            </Box>
          </RiskData>
          {isAccountReady && hasDebts && (
            <SimpleDropdown options={options} title={title} />
          )}
        </RiskContainer>
      </RiskHeaderBox>
    </Container>
  );
};

export default observer(PortfolioRisk);

const RiskContainer = styled(Box)(
  ({ theme }) => `
  display: flex;
  justify-content: space-between;
  align-items: center;  
  ${theme.breakpoints.down('sm')} {
    flex-flow: column;
    gap: ${theme.spacing(2)};
  };`
);

const Container = styled(Box)(
  ({ theme }) => `
  border: ${theme.shape.borderStandard};
  border-radius: ${theme.shape.borderRadius()};
  margin-bottom: ${theme.spacing(3)};
`
);

const RiskHeaderBox = styled(Box)(
  ({ theme }) => `
  border-radius: ${theme.shape.borderRadius()};
  padding: ${theme.spacing(3)};
  background: ${theme.palette.background.paper};
`
);

const RiskData = styled(Box)(
  ({ theme }) => `
  display: flex;
  ${theme.breakpoints.down('sm')} {
    justify-content: space-between;
    flex-flow: column;
    height: ${theme.spacing(13)};
  };`
);
