import { FormattedMessage } from 'react-intl';
import { H1, ScrollToTop, StyledButton } from '@notional-finance/mui';
import { StackIcon } from '@notional-finance/icons';
import { useTheme, Box, styled } from '@mui/material';
import { colors } from '@notional-finance/styles';
import { AllTransactions } from './all-transactions';
import AllAccounts from './all-accounts';
import AllVaultAccounts from './all-vault-accounts';
import { ANALYTICS_VIEWS, Network } from '@notional-finance/util';
import { useParams, useNavigate } from 'react-router-dom';
import { useNetworkToggle } from './hooks';

export interface AnalyticsViewsParams
  extends Record<string, string | undefined> {
  category?: ANALYTICS_VIEWS;
}

export const AnalyticsViews = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const networkToggleData = useNetworkToggle();
  const params = useParams<AnalyticsViewsParams>();
  const selectedNetwork: Network =
    networkToggleData.toggleKey === 0 ? Network.arbitrum : Network.mainnet;

  const buttonData = [
    {
      label: 'All Transactions',
      key: ANALYTICS_VIEWS.ALL_TRANSACTIONS,
    },
    {
      label: 'All Accounts',
      key: ANALYTICS_VIEWS.ALL_ACCOUNTS,
    },
    {
      label: 'All Vault Accounts',
      key: ANALYTICS_VIEWS.ALL_VAULT_ACCOUNTS,
    },
  ];

  return (
    <Box sx={{ marginBottom: theme.spacing(20) }}>
      <ScrollToTop />
      <Background>
        <StyledTopContent>
          <StyledContainer>
            {buttonData.map(({ label, key }, i) => (
              <StyledButton
                key={i}
                onClick={() => navigate(`/analytics/${key}`)}
                variant="outlined"
                active={params.category === key}
                theme={theme}
              >
                {label}
              </StyledButton>
            ))}
          </StyledContainer>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: theme.spacing(2),
            }}
          >
            <StackIcon
              className="color-fill"
              sx={{
                height: theme.spacing(6),
                width: theme.spacing(6),
                fill: colors.white,
                stroke: 'transparent',
              }}
            />
            <Title
              gutter="default"
              sx={{ marginLeft: theme.spacing(3), marginBottom: '0px' }}
            >
              {params.category === ANALYTICS_VIEWS.ALL_TRANSACTIONS && (
                <FormattedMessage defaultMessage={'All Transactions'} />
              )}
              {params.category === ANALYTICS_VIEWS.ALL_ACCOUNTS && (
                <FormattedMessage defaultMessage={'All Accounts'} />
              )}
              {params.category === ANALYTICS_VIEWS.ALL_VAULT_ACCOUNTS && (
                <FormattedMessage defaultMessage={'All Vault Accounts'} />
              )}
            </Title>
          </Box>
        </StyledTopContent>
      </Background>
      {params.category === ANALYTICS_VIEWS.ALL_TRANSACTIONS && (
        <AllTransactions
          networkToggleData={networkToggleData}
          selectedNetwork={selectedNetwork}
        />
      )}
      {params.category === ANALYTICS_VIEWS.ALL_ACCOUNTS && (
        <AllAccounts
          networkToggleData={networkToggleData}
          selectedNetwork={selectedNetwork}
        />
      )}
      {params.category === ANALYTICS_VIEWS.ALL_VAULT_ACCOUNTS && (
        <AllVaultAccounts
          networkToggleData={networkToggleData}
          selectedNetwork={selectedNetwork}
        />
      )}
    </Box>
  );
};

const StyledContainer = styled(Box)(
  ({ theme }) => `
      grid-gap: ${theme.spacing(2)};
      display: flex;
      margin-bottom: ${theme.spacing(6)};
      ${theme.breakpoints.down('sm')} {
        flex-direction: column;
        grid-gap: ${theme.spacing(3)};
      } 
  `
);

const StyledTopContent = styled(Box)(
  ({ theme }) => `
  width: 100%;
  padding: ${theme.spacing(5)};
  max-width: ${theme.spacing(180)};
  display: flex;
  flex-direction: column;
  margin: auto;
  margin-top: ${theme.spacing(18.75)};
  ${theme.breakpoints.down('lg')} {
    margin-left: ${theme.spacing(6)};
    margin-right: ${theme.spacing(6)};
  }
  ${theme.breakpoints.down('sm')} {
    display: none;
  }
`
);

const Background = styled(Box)(
  ({ theme }) => `
  background: linear-gradient(90deg, #053542 28.68%, #06657E 126.35%);
  height: ${theme.spacing(82)};
  display: flex;
  align-items: center;
  min-width: 100%;
  ${theme.breakpoints.down('md')} {
    height: ${theme.spacing(94)};
  }
  ${theme.breakpoints.down('sm')} {
    display: none;
  }
`
);

const Title = styled(H1)(
  ({ theme }) => `
  color: ${colors.white};
  display: flex;
  align-items: center;
  ${theme.breakpoints.down('sm')} {
    font-size: 36px;
  }
`
);

export default AnalyticsViews;
