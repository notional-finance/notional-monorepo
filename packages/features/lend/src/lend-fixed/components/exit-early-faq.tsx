import { useTheme, Box } from '@mui/material';
import { ExternalLink, Body } from '@notional-finance/mui';
import { FormattedMessage } from 'react-intl';

export const ExitEarlyFaq = () => {
  const theme = useTheme();
  return (
    <Box>
      <Body sx={{ marginBottom: theme.spacing(1) }}>
        <FormattedMessage
          defaultMessage={
            'Yes. You can exit your loan early by selling your fCash on Notional’s liquidity pool before maturity. Loans on the 3 month or 6 month liquidity pool will always be liquid, while loans on the 1 year liquidity pool may be temporarily illiquid.'
          }
        />
      </Body>
      <Body>
        <FormattedMessage
          defaultMessage={
            'Your interest rate is guaranteed if you hold to maturity, but if you exit early the amount of money you can withdraw is not guaranteed because the market price of your fCash can change as interest rates change. Find more details about early exits here: <a1>docs</a1>'
          }
          values={{
            a1: (msg: React.ReactNode) => (
              <ExternalLink
                accent
                href="https://docs.notional.finance/notional-v2/trading-fcash/exiting-early"
              >
                {msg}
              </ExternalLink>
            ),
          }}
        />
      </Body>
    </Box>
  );
};

export default ExitEarlyFaq;
