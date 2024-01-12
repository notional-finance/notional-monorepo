import {
  useAllMarkets,
  useThemeVariant,
} from '@notional-finance/notionable-hooks';
import { Network, PRODUCTS } from '@notional-finance/util';
import { CardContainer, FeatureLoader } from '@notional-finance/shared-web';
import { CurrencyFixed } from '@notional-finance/mui';
import { ThemeProvider } from '@mui/material';
import { useNotionalTheme } from '@notional-finance/styles';
import { defineMessage, FormattedMessage } from 'react-intl';
import { groupArrayToMap } from '@notional-finance/util';
import { formatNumberAsPercent } from '@notional-finance/helpers';
import { formatMaturity } from '@notional-finance/util';

export function LendCardView() {
  const themeVariant = useThemeVariant();
  const themeLanding = useNotionalTheme(themeVariant, 'landing');
  const {
    yields: { fCashLend },
    getMax,
  } = useAllMarkets(Network.ArbitrumOne);

  const cardData = [
    ...groupArrayToMap(fCashLend, (t) => t.underlying.symbol).entries(),
  ];

  return (
    <ThemeProvider theme={themeLanding}>
      <FeatureLoader
        featureLoaded={cardData?.length > 0 && themeVariant ? true : false}
      >
        <CardContainer
          heading={defineMessage({
            defaultMessage: 'Fixed Rate Lending',
            description: 'page heading',
          })}
          subtitle={defineMessage({
            defaultMessage: `Fix your rate and earn guaranteed returns with peace of mind.`,
            description: 'page subtitle',
          })}
          linkText={defineMessage({
            defaultMessage: 'Read fixed lend docs',
            description: 'docs link',
          })}
          docsLink="https://docs.notional.finance/notional-v3/product-guides/fixed-rate-lending"
        >
          {cardData.map(([symbol, yields], index) => {
            const route = `/${PRODUCTS.LEND_FIXED}/${symbol}`;

            const maxRate = getMax(yields)?.totalAPY || 0;
            const allRates = yields
              .sort((a, b) => (a.token.maturity || 0) - (b.token.maturity || 0))
              .map((y) => ({
                maturity: formatMaturity(y.token.maturity || 0),
                rate: formatNumberAsPercent(y.totalAPY),
              }));

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
      </FeatureLoader>
    </ThemeProvider>
  );
}

export default LendCardView;
