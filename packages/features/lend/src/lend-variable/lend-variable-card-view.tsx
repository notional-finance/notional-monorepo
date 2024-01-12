import {
  useThemeVariant,
  useAllMarkets,
} from '@notional-finance/notionable-hooks';
import { Network, PRODUCTS } from '@notional-finance/util';
import { CardContainer, FeatureLoader } from '@notional-finance/shared-web';
import { Currency } from '@notional-finance/mui';
import { ThemeProvider } from '@mui/material';
import { useNotionalTheme } from '@notional-finance/styles';
import { defineMessage, FormattedMessage } from 'react-intl';

export function LendVariableCardView() {
  const themeVariant = useThemeVariant();
  const themeLanding = useNotionalTheme(themeVariant, 'landing');
  const {
    yields: { variableLend },
  } = useAllMarkets(Network.ArbitrumOne);

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
        featureLoaded={variableLend?.length > 0 && themeVariant ? true : false}
      >
        <CardContainer
          heading={heading}
          subtitle={subtitle}
          linkText={docsText}
          docsLink="https://docs.notional.finance/notional-v3/product-guides/variable-rate-lending"
        >
          {variableLend.map(({ underlying, totalAPY }, index) => {
            const route = `/${PRODUCTS.LEND_VARIABLE}/${underlying.symbol}`;
            return (
              <Currency
                key={index}
                symbol={underlying.symbol}
                rate={totalAPY}
                route={route}
                returnTitle={<FormattedMessage defaultMessage="VARIABLE APY" />}
                buttonText={
                  <FormattedMessage
                    defaultMessage="Lend {symbol}"
                    values={{
                      symbol: underlying.symbol,
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
