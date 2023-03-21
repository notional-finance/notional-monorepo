import { useAllMarkets } from '@notional-finance/notionable-hooks';
import { LEND_BORROW, THEME_VARIANTS } from '@notional-finance/shared-config';
import { CardContainer } from '@notional-finance/shared-web';
import { CardVariant } from '@notional-finance/mui';
import { Box, ThemeProvider, useTheme } from '@mui/material';
import { useNotionalTheme } from '@notional-finance/styles';
import { defineMessages, FormattedMessage } from 'react-intl';

export function LendCardView() {
  // const theme = useTheme();
  const themeLanding = useNotionalTheme(THEME_VARIANTS.LIGHT, 'landing');
  const { rates, unwrappedCurrencies } = useAllMarkets();

  const cards = unwrappedCurrencies.map((s, i) => {
    const rate = rates.length > i ? rates[i] : 0;
    const route = `/${LEND_BORROW.LEND}/${s}`;

    return (
      <CardVariant
        variant={'currency'}
        symbol={s}
        rate={rate}
        route={route}
        buttonText={
          <FormattedMessage
            defaultMessage="Lend {symbol}"
            values={{
              symbol: s,
            }}
          />
        }
      />
    );
  });

  const heading = defineMessages({
    fixed: {
      defaultMessage: 'Lend Crypto at Fixed Rates',
      description: 'page heading',
    },
    variable: {
      defaultMessage: 'Fix Your Variable Rate',
      description: 'page heading',
    },
  });
  const subtitle = defineMessages({
    fixed: {
      defaultMessage:
        'Build a stable portfolio with fixed rate income on your assets. Lock in your yield for up to one year or exit early without penalty at the market rate.',
      description: 'page subtitle',
    },
    variable: {
      defaultMessage:
        'Use your cTokens directly on Notional to swap your variable rate loan to a fixed rate and lock in your returns.',
      description: 'page subtitle',
    },
  });
  return (
    <ThemeProvider theme={themeLanding}>
      <Box>
        <CardContainer
          heading={heading.fixed}
          subtitle={subtitle.fixed}
          cards={cards}
        />
      </Box>
    </ThemeProvider>
  );
}

export default LendCardView;
