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
  const { allYields } = useAllMarkets();
  const cardData = allYields.filter((t) => t.tokenType === 'PrimeCash');

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
      <FeatureLoader
        featureLoaded={cardData?.length > 0 && themeVariant ? true : false}
      >
        <CardContainer
          heading={heading}
          subtitle={subtitle}
          linkText={docsText}
          docsLink="https://docs.notional.finance/notional-v2/what-you-can-do/fixed-rate-lending"
        >
          {cardData.map(({ underlying, totalApy }, index) => {
            const route = `/${PRODUCTS.LEND_VARIABLE}/${underlying}`;
            return (
              <Currency
                key={index}
                symbol={underlying}
                rate={totalApy}
                route={route}
                returnTitle={<FormattedMessage defaultMessage="VARIABLE APY" />}
                buttonText={
                  <FormattedMessage
                    defaultMessage="Lend {symbol}"
                    values={{
                      symbol: underlying,
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
