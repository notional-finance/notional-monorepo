import { useAllMarkets } from '@notional-finance/notionable-hooks';
import { LEND_BORROW, THEME_VARIANTS } from '@notional-finance/shared-config';
import { CardContainer } from '@notional-finance/shared-web';
import { CurrencyFixed } from '@notional-finance/mui';
import { ThemeProvider } from '@mui/material';
import { useNotionalTheme } from '@notional-finance/styles';
import { defineMessage, FormattedMessage } from 'react-intl';
import { useUserSettingsState } from '@notional-finance/user-settings-manager';

export function LendCardView() {
  const { themeVariant } = useUserSettingsState();
  const themeLanding = useNotionalTheme(themeVariant, 'landing');
  const { cardData } = useAllMarkets();

  const heading = defineMessage({
    defaultMessage: 'Fixed Rate Lending',
    description: 'page heading',
  });

  const subtitle = defineMessage({
    defaultMessage: `Fix your rate and earn guaranteed returns with peace of mind.`,
    description: 'page subtitle',
  });

  const docsText = defineMessage({
    defaultMessage: 'Read fixed lend docs',
    description: 'docs link',
  });

  return (
    <ThemeProvider theme={themeLanding}>
      <CardContainer
        heading={heading}
        subtitle={subtitle}
        linkText={docsText}
        docsLink="https://docs.notional.finance/notional-v2/what-you-can-do/fixed-rate-lending"
      >
        {cardData.map(({ symbol, maxRate, allRates }, index) => {
          const route = `/${LEND_BORROW.LEND}/${symbol}`;
          return (
            <CurrencyFixed
              key={index}
              symbol={symbol}
              rate={maxRate}
              allRates={allRates}
              route={route}
              apyTagline={<FormattedMessage defaultMessage={'AS HIGH AS'} />}
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
