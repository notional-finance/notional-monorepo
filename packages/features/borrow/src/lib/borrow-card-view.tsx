import { LEND_BORROW } from '@notional-finance/shared-config';
import { CardContainer } from '@notional-finance/shared-web';
import { CurrencyFixed, FeatureLoader } from '@notional-finance/mui';
import { useAllMarkets } from '@notional-finance/notionable-hooks';
import { useNotionalTheme } from '@notional-finance/styles';
import { useUserSettingsState } from '@notional-finance/user-settings-manager';
import { defineMessage, FormattedMessage } from 'react-intl';
import { ThemeProvider } from '@mui/material';
import { groupArrayToMap } from '@notional-finance/util';
import {
  formatMaturity,
  formatNumberAsPercent,
} from '@notional-finance/helpers';

export const BorrowCardView = () => {
  const { themeVariant } = useUserSettingsState();
  const themeLanding = useNotionalTheme(themeVariant, 'landing');
  const { allYields, getMin } = useAllMarkets();

  const cardData = [
    ...groupArrayToMap(
      allYields.filter((t) => t.tokenType === 'fCash'),
      (t) => t.underlying
    ).entries(),
  ];

  return (
    <ThemeProvider theme={themeLanding}>
      <FeatureLoader featureLoaded={cardData?.length > 0}>
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
          docsLink="https://docs.notional.finance/notional-v2/what-you-can-do/fixed-rate-borrowing"
        >
          {cardData.map(([symbol, yields], index) => {
            // Special handling for borrowing ETH, default to collateralized by USDC
            const route =
              symbol === 'ETH'
                ? `/${LEND_BORROW.BORROW}/${symbol}/USDC`
                : `/${LEND_BORROW.BORROW}/${symbol}/ETH`;
            const minRate = getMin(yields)?.totalApy || 0;
            const allRates = yields
              .sort((a, b) => (a.maturity || 0) - (b.maturity || 0))
              .map((y) => ({
                maturity: formatMaturity(y.maturity || 0),
                rate: formatNumberAsPercent(y.totalApy),
              }));

            return (
              <CurrencyFixed
                key={index}
                symbol={symbol}
                rate={minRate}
                allRates={allRates}
                route={route}
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

export default BorrowCardView;
