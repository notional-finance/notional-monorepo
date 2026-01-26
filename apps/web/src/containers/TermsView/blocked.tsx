import { Box, useTheme } from '@mui/material';
import { H1, Paragraph } from '@notional-finance/mui';
import { FormattedMessage } from 'react-intl';
import { useWalletStore } from '@notional-finance/notionable-hooks';

export const BlockedView = () => {
  const theme = useTheme();
  const walletStore = useWalletStore();
  const country = walletStore.country;

  return (
    <Box
      sx={{
        padding: {
          xs: theme.spacing(8, 4),
          md: theme.spacing(8, 12),
          lg: theme.spacing(12, 20),
        },
      }}
    >
      <H1>
        <FormattedMessage defaultMessage="Blocked" />
      </H1>
      <Paragraph>
        {country === 'US' ? (
          <FormattedMessage defaultMessage="Notional Exponent is not available in the United States." />
        ) : (
          <FormattedMessage defaultMessage="Your region is blocked. See the affected export control list here: https://orpa.princeton.edu/export-controls/sanctioned-countries" />
        )}
      </Paragraph>
    </Box>
  );
};
