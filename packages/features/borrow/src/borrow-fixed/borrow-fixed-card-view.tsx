import { Network, PRODUCTS } from '@notional-finance/util';
import { CardContainer, FeatureLoader } from '@notional-finance/shared-web';
import { CurrencyFixed } from '@notional-finance/mui';
import {
  useAllMarkets,
  useThemeVariant,
} from '@notional-finance/notionable-hooks';
import { useNotionalTheme } from '@notional-finance/styles';
import { defineMessage, FormattedMessage } from 'react-intl';
import { ThemeProvider } from '@mui/material';
import { groupArrayToMap } from '@notional-finance/util';
import { formatNumberAsPercent } from '@notional-finance/helpers';
import { formatMaturity } from '@notional-finance/util';

export const BorrowFixedCardView = () => {
  const themeVariant = useThemeVariant();
  const themeLanding = useNotionalTheme(themeVariant, 'landing');
  const {
    yields: { fCashBorrow },
    getMin,
  } = useAllMarkets(Network.ArbitrumOne);

  const cardData = [
    ...groupArrayToMap(fCashBorrow, (t) => t.underlying.symbol).entries(),
  ];

  return (
    <ThemeProvider theme={themeLanding}>
      <FeatureLoader
        featureLoaded={cardData?.length > 0 && themeVariant ? true : false}
      >
        <CardContainer
          heading={defineMessage({
            defaultMessage: 'Fixed Rate Borrowing',
            description: 'page heading',
          })}
          subtitle={defineMessage({
            defaultMessage: `Fix your rate and never worry about spiking borrowing costs again.`,
            description: 'page heading subtitle',
          })}
          linkText={defineMessage({
            defaultMessage: 'Read fixed borrow docs',
            description: 'docs link',
          })}
          docsLink="https://docs.notional.finance/notional-v3/product-guides/fixed-rate-borrowing"
        >
          {cardData.map(([symbol, yields], index) => {
            const minRate = getMin(yields)?.totalAPY || 0;
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
                rate={minRate}
                allRates={allRates}
                route={`/${PRODUCTS.BORROW_FIXED}/${symbol}`}
                apyTagline={<FormattedMessage defaultMessage={'AS LOW AS'} />}
                buttonText={
                  <FormattedMessage
                    defaultMessage="Borrow {symbol}"
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
};

export default BorrowFixedCardView;
