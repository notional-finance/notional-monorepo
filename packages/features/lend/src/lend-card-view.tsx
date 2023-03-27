import { useAllMarkets } from '@notional-finance/notionable-hooks';
import { LEND_BORROW, THEME_VARIANTS } from '@notional-finance/shared-config';
import { CardContainer } from '@notional-finance/shared-web';
import { CurrencyFixed } from '@notional-finance/mui';
import { ThemeProvider } from '@mui/material';
import { useNotionalTheme } from '@notional-finance/styles';
import { defineMessages, FormattedMessage } from 'react-intl';
import { useUserSettingsState } from '@notional-finance/user-settings-manager';

export function LendCardView() {
  const { themeVariant } = useUserSettingsState();
  const themeLanding = useNotionalTheme(themeVariant, 'landing');
  const { cardData } = useAllMarkets();

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
      <CardContainer heading={heading.fixed} subtitle={subtitle.fixed}>
        {cardData.map(({ symbol, maxRate, allRates }, index) => {
          const route = `/${LEND_BORROW.LEND}/${symbol}`;
          return (
            <CurrencyFixed
              key={index}
              symbol={symbol}
              rate={maxRate}
              allRates={allRates}
              route={route}
              buttonText={
                <FormattedMessage
                  defaultMessage="Lend {symbol}"
                  values={{
                    symbol,
                  }}
                />
              }
            />
          );
        })}
      </CardContainer>
    </ThemeProvider>
  );
}

export default LendCardView;
