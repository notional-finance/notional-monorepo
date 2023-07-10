import { PRODUCTS } from '@notional-finance/shared-config';
import { CardContainer } from '@notional-finance/shared-web';
import { Currency, FeatureLoader } from '@notional-finance/mui';
import { useAllMarkets } from '@notional-finance/notionable-hooks';
import { useNotionalTheme } from '@notional-finance/styles';
import { useUserSettingsState } from '@notional-finance/user-settings-manager';
import { defineMessage, FormattedMessage } from 'react-intl';
import { ThemeProvider } from '@mui/material';

export const BorrowVariableCardView = () => {
  const { themeVariant } = useUserSettingsState();
  const themeLanding = useNotionalTheme(themeVariant, 'landing');
  const { allYields } = useAllMarkets();
  // TODO: Figure out were to get this data from
  const cardData = allYields.filter((t) => t.tokenType === 'PrimeCash');

  return (
    <ThemeProvider theme={themeLanding}>
      <FeatureLoader featureLoaded={cardData?.length > 0}>
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
          {cardData.map(({ underlying, totalApy }, index) => {
            // TODO: Is this required for variable?
            // Special handling for borrowing ETH, default to collateralized by USDC
            const route =
              underlying === 'ETH'
                ? `/${PRODUCTS.BORROW_VARIABLE}/${underlying}/USDC`
                : `/${PRODUCTS.BORROW_VARIABLE}/${underlying}/ETH`;

            return (
              <Currency
                key={index}
                symbol={underlying}
                rate={totalApy}
                route={route}
                returnTitle={<FormattedMessage defaultMessage="VARIABLE APY" />}
                buttonText={
                  <FormattedMessage
                    defaultMessage="Borrow {symbol}"
                    values={{
                      symbol: underlying,
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
