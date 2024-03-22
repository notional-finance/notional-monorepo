import { Box, styled, useTheme, Grid } from '@mui/material';
import { LabelValue } from '@notional-finance/mui';
import {
  useAccountReady,
  useWalletAllowances,
  useWalletConnectedNetwork,
} from '@notional-finance/notionable-hooks';
import { CurrencyIcon } from '../currency-icon/currency-icon';
import { FormattedMessage } from 'react-intl';
import { Network } from '@notional-finance/util';

export const EnabledCurrenciesButton = () => {
  const theme = useTheme();
  const network = useWalletConnectedNetwork();
  const walletConnected = useAccountReady(network);
  const { enabledTokens } = useWalletAllowances(network);

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
  // NOTE: this is a temporary hack to show connected networks for read only addresses,
  // in the future this should show all networks by default
  const network = useWalletConnectedNetwork() || Network.arbitrum;
  const walletConnected = useAccountReady(network);
  const { enabledTokens, supportedTokens } = useWalletAllowances(network);
  const systemTokenSymbols = supportedTokens.map((t) => t.symbol);

  return (
    <WalletSelectorContainer>
      <StyledGrid container>
        <Title>
          <FormattedMessage defaultMessage={'Enabled Currencies'} />
        </Title>
        {walletConnected ? (
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
        {walletConnected
          ? supportedTokens.map((c) => {
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
          : systemTokenSymbols.map((symbol) => {
              return (
                <CurrencyIcon
                  key={symbol}
                  symbol={symbol}
                  disableOption={false}
                  allCurrencies
                />
              );
            })}
      </StyledGrid>
    </WalletSelectorContainer>
  );
};

const Title = styled(LabelValue)(
  ({ theme }) => `
  width: 100%;
  margin-bottom: ${theme.spacing(2.5)};
  font-weight: 700;
  color: ${theme.palette.typography.light};
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
