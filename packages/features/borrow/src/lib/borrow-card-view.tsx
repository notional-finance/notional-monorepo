import { LEND_BORROW, THEME_VARIANTS } from '@notional-finance/shared-config';
import { CardContainer } from '@notional-finance/shared-web';
import { CurrencyFixed } from '@notional-finance/mui';
import { useAllMarkets } from '@notional-finance/notionable-hooks';
import { useNotionalTheme } from '@notional-finance/styles';
import { defineMessage, FormattedMessage } from 'react-intl';
import { ThemeProvider } from '@mui/material';

export const BorrowCardView = () => {
  const themeLanding = useNotionalTheme(THEME_VARIANTS.LIGHT, 'landing');
  const { minRates, currencyMarkets, orderedCurrencyIds, allRates } =
    useAllMarkets();

  return (
    <ThemeProvider theme={themeLanding}>
      <CardContainer
        heading={defineMessage({
          defaultMessage: 'Borrow Crypto at Fixed Rates',
          description: 'page heading',
        })}
        subtitle={defineMessage({
          defaultMessage:
            'Borrow against your crypto with certainty for up to one year. Lock in what you pay until maturity or exit early without penalty at the market rate.',
          description: 'page heading subtitle',
        })}
      >
        {orderedCurrencyIds.map((cid, i) => {
          const { underlyingSymbol, symbol } = currencyMarkets.get(cid)!;
          const s = underlyingSymbol || symbol;
          const rate = minRates.length > i ? minRates[i] : 0;
          // Special handling for borrowing ETH, default to collateralized by USDC
          const route =
            s === 'ETH'
              ? `/${LEND_BORROW.BORROW}/${s}/USDC`
              : `/${LEND_BORROW.BORROW}/${s}/ETH`;

          return (
            <CurrencyFixed
              symbol={s}
              rate={rate}
              allRates={allRates[s]}
              route={route}
              buttonText={
                <FormattedMessage
                  defaultMessage="Borrow {symbol}"
                  values={{
                    symbol: s,
                  }}
                />
              }
            />
          );
        })}
      </CardContainer>
    </ThemeProvider>
  );
};

export default BorrowCardView;
