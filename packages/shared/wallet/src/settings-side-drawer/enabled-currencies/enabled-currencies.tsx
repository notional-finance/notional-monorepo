import { Box, Typography, styled, useTheme, Grid } from '@mui/material';
import { tokenApprovalState$ } from '@notional-finance/trade';
import { ProgressIndicator } from '@notional-finance/mui';
import {
  useAccountReady,
  useCurrency,
  useWalletAllowances,
} from '@notional-finance/notionable-hooks';
import { useObservableState } from 'observable-hooks';
import { CurrencyIcon } from '../currency-icon/currency-icon';
import { FormattedMessage } from 'react-intl';

export const EnabledCurrenciesButton = () => {
  const theme = useTheme();
  const walletConnected = useAccountReady();
  const { enabledTokens } = useWalletAllowances();

  return (
    <Box
      sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <Box sx={{ paddingRight: theme.spacing(1), display: 'flex' }}>
        {walletConnected && (
          <Box>
            {enabledTokens.length > 0 ? enabledTokens.length : 0}{' '}
            <FormattedMessage defaultMessage={'Enabled'} />
          </Box>
        )}
      </Box>
    </Box>
  );
};

export const EnabledCurrencies = () => {
  const theme = useTheme();
  const tokenApprovalState = useObservableState(tokenApprovalState$);
  const walletConnected = useAccountReady();
  const { enabledTokens, supportedTokens } = useWalletAllowances();
  const { systemTokenSymbols } = useCurrency();
  const tokenApproval = tokenApprovalState
    ? Object.values(tokenApprovalState)
    : [];

  if (tokenApproval.includes('SUCCESS')) {
    window.location.reload();
  }

  return (
    <WalletSelectorContainer>
      <StyledGrid container>
        <Title>
          <FormattedMessage defaultMessage={'Enabled Currencies'} />
        </Title>
        {tokenApproval.includes('PENDING') ? (
          <Box
            sx={{
              height: theme.spacing(20),
              width: '100%',
              marginTop: theme.spacing(10),
            }}
          >
            <ProgressIndicator type="notional" />
          </Box>
        ) : walletConnected ? (
          enabledTokens.map((c) => {
            return (
              <CurrencyIcon
                key={c.symbol}
                symbol={c.symbol}
                disableOption
                allCurrencies={false}
                enabled
              />
            );
          })
        ) : (
          <Box sx={{ padding: theme.spacing(2) }}>
            <FormattedMessage
              defaultMessage={'Select from the list below to enable collateral'}
            />
          </Box>
        )}

        <Box sx={{ height: '40px', width: '100%' }}></Box>
        <Title>
          <FormattedMessage defaultMessage={'Supported Currencies'} />
        </Title>
        {tokenApproval.includes('PENDING') ? (
          <Box
            sx={{
              height: theme.spacing(20),
              width: '100%',
              marginTop: theme.spacing(10),
            }}
          >
            <ProgressIndicator type="notional" />
          </Box>
        ) : walletConnected ? (
          supportedTokens.map((c) => {
            const enabled =
              enabledTokens.find((t) => t.id === c.id) !== undefined;

            return (
              <CurrencyIcon
                key={c.symbol}
                symbol={c.symbol}
                disableOption={false}
                enabled={enabled}
                allCurrencies
              />
            );
          })
        ) : (
          systemTokenSymbols.map((symbol) => {
            return (
              <CurrencyIcon
                key={symbol}
                symbol={symbol}
                disableOption={false}
                allCurrencies
              />
            );
          })
        )}
      </StyledGrid>
    </WalletSelectorContainer>
  );
};

const Title = styled(Typography)(
  ({ theme }) => `
  width: 100%;
  margin-bottom: ${theme.spacing(2.5)};
  font-weight: 700;
  color: ${theme.palette.borders.accentDefault};
  text-transform: uppercase;
  `
);

const StyledGrid = styled(Grid)(
  ({ theme }) => `
  padding-bottom: ${theme.spacing(10)};
  .MuiGrid-root {
    flex-basis: 20%;
  }
  
`
);

const WalletSelectorContainer = styled(Box)(
  ({ theme }) => `
  margin: 0px;
  font-weight: 700;
  color: ${theme.palette.primary.dark};
  `
);

export default EnabledCurrencies;
