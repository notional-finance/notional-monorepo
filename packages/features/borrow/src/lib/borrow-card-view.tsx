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
        docsLink="https://docs.notional.finance/notional-v2/notional-v2-basics/borrowing"
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
