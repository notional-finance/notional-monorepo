import { useAllMarkets } from '@notional-finance/notionable-hooks';
import { PRODUCTS } from '@notional-finance/shared-config';
import { CardContainer } from '@notional-finance/shared-web';
import { Currency, FeatureLoader } from '@notional-finance/mui';
import { ThemeProvider } from '@mui/material';
import { useNotionalTheme } from '@notional-finance/styles';
import { defineMessage, FormattedMessage } from 'react-intl';
import { useUserSettingsState } from '@notional-finance/user-settings-manager';

export function LendVariableCardView() {
  const { themeVariant } = useUserSettingsState();
  const themeLanding = useNotionalTheme(themeVariant, 'landing');
  // TODO: Hook up actual variable data
  const { cardData } = useAllMarkets();

  const heading = defineMessage({
    defaultMessage: 'Variable Rate Lending',
    description: 'page heading',
  });

  const subtitle = defineMessage({
    defaultMessage: `Get easy access to the best yield in DeFi with zero fees.`,
    description: 'page subtitle',
  });

  const docsText = defineMessage({
    defaultMessage: 'Read variable lend docs',
    description: 'docs link',
  });

  return (
    <ThemeProvider theme={themeLanding}>
      <FeatureLoader featureLoaded={cardData?.length > 0}>
        <CardContainer
          heading={heading}
          subtitle={subtitle}
          linkText={docsText}
          docsLink="https://docs.notional.finance/notional-v2/what-you-can-do/fixed-rate-lending"
        >
          {cardData.map(({ symbol, maxRate }, index) => {
            const route = `/${PRODUCTS.LEND_VARIABLE}/${symbol}`;
            return (
              <Currency
                key={index}
                symbol={symbol}
                rate={maxRate}
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
      </FeatureLoader>
    </ThemeProvider>
  );
}

export default LendVariableCardView;
