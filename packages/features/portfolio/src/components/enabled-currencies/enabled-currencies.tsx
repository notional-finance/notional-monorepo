import { Box, styled, Typography } from '@mui/material';
import { Grid } from '@mui/material';
import { useWallet, useCurrency, useWalletBalance } from '@notional-finance/notionable-hooks';
import { CurrencyIcon } from '../currency-icon/currency-icon';
import { FormattedMessage } from 'react-intl';

export const EnabledCurrencies = () => {
  const { walletConnected } = useWallet();
  const { enabledTokens, supportedTokens } = useWalletBalance();
  const { systemTokenSymbols } = useCurrency();

  return (
    <StyledGrid container>
      <CurrencyGroup>
        <FormattedMessage defaultMessage={'Enabled Currencies'} />
      </CurrencyGroup>
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
        <Box sx={{ padding: '20px' }}>
          <FormattedMessage defaultMessage={'Select from the list below to enable collateral'} />
        </Box>
      )}
      <CurrencyGroup>
        <FormattedMessage defaultMessage={'Supported Currencies'} />
      </CurrencyGroup>
      {walletConnected
        ? supportedTokens.map((c) => {
            const enabled = (
              c?.allowance?.isPositive() || c.symbol === 'ETH' ? true : false
            ) as boolean;
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
              <CurrencyIcon key={symbol} symbol={symbol} disableOption={false} allCurrencies />
            );
          })}
    </StyledGrid>
  );
};

const CurrencyGroup = styled(Typography)(
  () => `
  width: 100%;
  font-weight: 600;
  font-size: 16px;
  line-height: 22px;
  padding: 20px;
`
);

const StyledGrid = styled(Grid)(
  ({ theme }) => `
  margin-top: 24px;
  padding: ${theme.spacing(3)};
  padding-bottom: 80px;
  background: ${theme.palette.common.white};
  border: 1px solid ${theme.palette.borders.paper};
  border-radius: 6px;
`
);

export default EnabledCurrencies;
