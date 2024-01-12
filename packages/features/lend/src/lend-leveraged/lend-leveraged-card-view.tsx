import {
  useAllMarkets,
  useThemeVariant,
} from '@notional-finance/notionable-hooks';
import { Network, PRODUCTS } from '@notional-finance/util';
import { CardContainer, FeatureLoader } from '@notional-finance/shared-web';
import { Currency } from '@notional-finance/mui';
import { ThemeProvider } from '@mui/material';
import { useNotionalTheme } from '@notional-finance/styles';
import { defineMessage, FormattedMessage } from 'react-intl';
import { groupArrayToMap } from '@notional-finance/util';
import { formatLeverageRatio } from '@notional-finance/helpers';

export function LendLeveragedCardView() {
  const themeVariant = useThemeVariant();
  const themeLanding = useNotionalTheme(themeVariant, 'landing');
  const {
    yields: { leveragedLend },
    getMax,
  } = useAllMarkets(Network.ArbitrumOne);
  const heading = defineMessage({
    defaultMessage: 'Leveraged Lending',
    description: 'page heading',
  });

  const cardData = [
    ...groupArrayToMap(leveragedLend, (t) => t.underlying.symbol).entries(),
  ];

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
      <FeatureLoader
        featureLoaded={leveragedLend?.length > 0 && themeVariant ? true : false}
      >
        <CardContainer
          heading={heading}
          subtitle={subtitle}
          linkText={docsText}
          leveraged={true}
          docsLink="https://docs.notional.finance/notional-v3/product-guides/leveraged-lending"
        >
          {cardData.map(([symbol, yields], index) => {
            const route = `/${PRODUCTS.LEND_LEVERAGED}/${symbol}`;
            const maxYield = getMax(yields);

            return (
              maxYield?.totalAPY &&
              maxYield?.totalAPY > 0 && (
                <Currency
                  key={index}
                  symbol={symbol}
                  rate={maxYield?.totalAPY || 0}
                  route={route}
                  returnTitle={
                    <FormattedMessage
                      defaultMessage="{leverage} Leverage"
                      values={{
                        leverage: formatLeverageRatio(
                          maxYield?.leveraged?.leverageRatio || 0,
                          2
                        ),
                      }}
                    />
                  }
                  leveraged
                  buttonText={
                    <FormattedMessage
                      defaultMessage="Lend {underlying}"
                      values={{
                        underlying: symbol,
                      }}
                    />
                  }
                />
              )
            );
          })}
        </CardContainer>
      </FeatureLoader>
    </ThemeProvider>
  );
}

export default LendLeveragedCardView;
