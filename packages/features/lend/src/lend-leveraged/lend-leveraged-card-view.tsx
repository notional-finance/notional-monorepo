import { useAllMarkets } from '@notional-finance/notionable-hooks';
import { PRODUCTS } from '@notional-finance/shared-config';
import { CardContainer } from '@notional-finance/shared-web';
import { Currency, FeatureLoader } from '@notional-finance/mui';
import { ThemeProvider } from '@mui/material';
import { useNotionalTheme } from '@notional-finance/styles';
import { defineMessage, FormattedMessage } from 'react-intl';
import { useUserSettingsState } from '@notional-finance/user-settings-manager';

export function LendLeveragedCardView() {
  const { themeVariant } = useUserSettingsState();
  const themeLanding = useNotionalTheme(themeVariant, 'landing');
  const { allYields } = useAllMarkets();
  const cardData = allYields.filter((t) => t.tokenType === 'PrimeCash');
  // TODO: Hook up actual leveraged data
  const heading = defineMessage({
    defaultMessage: 'Leveraged Lending',
    description: 'page heading',
  });

  const subtitle = defineMessage({
    defaultMessage: `Arbitrage Notional's interest rates by borrowing at a low rate and lending at a higher one with leverage for maximum returns.
    `,
    description: 'page subtitle',
  });

  const docsText = defineMessage({
    defaultMessage: 'Read leveraged lending docs',
    description: 'docs link',
  });

  return (
    <ThemeProvider theme={themeLanding}>
      <FeatureLoader featureLoaded={cardData?.length > 0}>
        <CardContainer
          heading={heading}
          subtitle={subtitle}
          linkText={docsText}
          leveraged={true}
          docsLink="https://docs.notional.finance/notional-v2/what-you-can-do/fixed-rate-lending"
        >
          {cardData.map(({ underlying, totalApy }, index) => {
            const route = `/${PRODUCTS.LEND_LEVERAGED}/${underlying}`;
            return (
              <Currency
                key={index}
                symbol={underlying}
                rate={totalApy}
                route={route}
                returnTitle={
                  <FormattedMessage defaultMessage="0.6x Leverage" />
                }
                buttonText={
                  <FormattedMessage
                    defaultMessage="Lend {underlying}"
                    values={{
                      underlying,
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

export default LendLeveragedCardView;
