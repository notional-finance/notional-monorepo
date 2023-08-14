import { PRODUCTS } from '@notional-finance/shared-config';
import { CardContainer, FeatureLoader } from '@notional-finance/shared-web';
import {
  useThemeVariant,
  useAllMarkets,
} from '@notional-finance/notionable-hooks';
import { useNotionalTheme } from '@notional-finance/styles';
import { defineMessage, FormattedMessage } from 'react-intl';
import { ThemeProvider } from '@mui/material';
import { Currency } from '@notional-finance/mui';

export const BorrowVariableCardView = () => {
  const themeVariant = useThemeVariant();
  const themeLanding = useNotionalTheme(themeVariant, 'landing');
  const {
    yields: { variableBorrow },
  } = useAllMarkets();

  return (
    <ThemeProvider theme={themeLanding}>
      <FeatureLoader
        featureLoaded={
          variableBorrow?.length > 0 && themeVariant ? true : false
        }
      >
        <CardContainer
          heading={defineMessage({
            defaultMessage: 'Variable Rate Borrowing',
            description: 'page heading',
          })}
          subtitle={defineMessage({
            defaultMessage: `Stay flexible. Enter and exit your loan at any time without any costs.`,
            description: 'page heading subtitle',
          })}
          linkText={defineMessage({
            defaultMessage: 'Read variable borrow docs',
            description: 'docs link',
          })}
          docsLink="https://docs.notional.finance/notional-v2/what-you-can-do/fixed-rate-borrowing"
        >
          {variableBorrow.map(({ underlying, totalAPY }, index) => {
            return (
              <Currency
                key={index}
                symbol={underlying.symbol}
                rate={totalAPY}
                route={`/${PRODUCTS.BORROW_VARIABLE}/${underlying.symbol}`}
                returnTitle={<FormattedMessage defaultMessage="VARIABLE APY" />}
                buttonText={
                  <FormattedMessage
                    defaultMessage="Borrow {symbol}"
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
};

export default BorrowVariableCardView;
