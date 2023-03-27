import { LEND_BORROW, THEME_VARIANTS } from '@notional-finance/shared-config';
import { CardContainer } from '@notional-finance/shared-web';
import { CurrencyFixed } from '@notional-finance/mui';
import { useAllMarkets } from '@notional-finance/notionable-hooks';
import { useNotionalTheme } from '@notional-finance/styles';
import { useUserSettingsState } from '@notional-finance/user-settings-manager';
import { defineMessage, FormattedMessage } from 'react-intl';
import { ThemeProvider } from '@mui/material';

export const BorrowCardView = () => {
  const { themeVariant } = useUserSettingsState();
  const themeLanding = useNotionalTheme(themeVariant, 'landing');
  const { cardData } = useAllMarkets();

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
        {cardData.map(({ symbol, minRate, allRates }, index) => {
          // Special handling for borrowing ETH, default to collateralized by USDC
          const route =
            symbol === 'ETH'
              ? `/${LEND_BORROW.BORROW}/${symbol}/USDC`
              : `/${LEND_BORROW.BORROW}/${symbol}/ETH`;
          return (
            <CurrencyFixed
              key={index}
              symbol={symbol}
              rate={minRate}
              allRates={allRates}
              route={route}
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
    </ThemeProvider>
  );
};

export default BorrowCardView;
