import { useAllMarkets } from '@notional-finance/notionable-hooks';
import { PRODUCTS } from '@notional-finance/shared-config';
import { CardContainer } from '@notional-finance/shared-web';
import { CurrencyFixed, FeatureLoader } from '@notional-finance/mui';
import { ThemeProvider } from '@mui/material';
import { useNotionalTheme } from '@notional-finance/styles';
import { defineMessage, FormattedMessage } from 'react-intl';
import { useUserSettingsState } from '@notional-finance/user-settings-manager';
import { groupArrayToMap } from '@notional-finance/util';
import {
  formatMaturity,
  formatNumberAsPercent,
} from '@notional-finance/helpers';

export function LendCardView() {
  const { themeVariant } = useUserSettingsState();
  const themeLanding = useNotionalTheme(themeVariant, 'landing');
  const { allYields, getMax } = useAllMarkets();

  const cardData = [
    ...groupArrayToMap(
      allYields.filter((t) => t.tokenType === 'fCash'),
      (t) => t.underlying
    ).entries(),
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
          docsLink="https://docs.notional.finance/notional-v2/what-you-can-do/fixed-rate-lending"
        >
          {cardData.map(([symbol, yields], index) => {
            const route = `/${PRODUCTS.LEND_FIXED}/${symbol}`;

            const maxRate = getMax(yields)?.totalApy || 0;
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
