import { useTheme, Box } from '@mui/material';
import { ExternalLink, Body } from '@notional-finance/mui';
import { FormattedMessage } from 'react-intl';

interface ExitEarlyFaqProps {
  selectedDepositToken: string | undefined;
}

export const ExitEarlyFaq = ({ selectedDepositToken }: ExitEarlyFaqProps) => {
  const theme = useTheme();
  return (
    <Box>
      {selectedDepositToken && (
        <>
          <Body sx={{ marginBottom: theme.spacing(1) }}>
            <FormattedMessage
              defaultMessage={
                'Yes. You can close out your loan early by buying back the f{selectedDepositToken} you sold on the fixed rate liquidity pool before maturity. Loans on the 3 month or 6 month liquidity pool will always be liquid while loans on the 1 year liquidity pool may be temporarily illiquid.'
              }
              values={{ selectedDepositToken }}
            />
          </Body>
          <Body>
            <FormattedMessage
              defaultMessage={
                'Your interest rate is guaranteed if you hold the debt to maturity, but if you exit early the amount that it will take to pay off your debt is not guaranteed because the market price of your f{selectedDepositToken} can change as interest rates change. Find more <a1>details about early exits here</a1>.'
              }
              values={{
                selectedDepositToken,
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
        </>
      )}
    </Box>
  );
};

export default ExitEarlyFaq;
