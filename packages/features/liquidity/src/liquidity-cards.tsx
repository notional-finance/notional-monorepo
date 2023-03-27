import { Box, ThemeProvider, styled } from '@mui/material';
import { useCurrency, useNotional } from '@notional-finance/notionable-hooks';
import { useEffect, useState } from 'react';
import { THEME_VARIANTS } from '@notional-finance/shared-config';
import { FormattedMessage, defineMessage } from 'react-intl';
import { NTokenValue } from '@notional-finance/sdk/src/system';
import { INTERNAL_TOKEN_PRECISION } from '@notional-finance/sdk/src/config/constants';
import { useUserSettingsState } from '@notional-finance/user-settings-manager';
import { CardContainer } from '@notional-finance/shared-web';
import { useNotionalTheme } from '@notional-finance/styles';
import {
  useWindowDimensions,
  Incentive,
  Currency,
  HeadingSubtitle,
} from '@notional-finance/mui';
import { TypedBigNumber } from '@notional-finance/sdk';
import { Link } from 'react-router-dom';

const StyledLink = styled(Link)(
  ({ theme }) => `
  color: ${theme.palette.info.accent};
`
);

export const ProvideLiquidityCards = () => {
  const { themeVariant } = useUserSettingsState();
  const themeLanding = useNotionalTheme(themeVariant, 'landing');
  const { tradableCurrencies } = useCurrency();
  const { notional, loaded } = useNotional();
  const { height } = useWindowDimensions();
  const [notePriceString, setNotePriceString] = useState('');

  useEffect(() => {
    if (loaded && notional) {
      const oneNoteUSD = TypedBigNumber.fromBalance(
        INTERNAL_TOKEN_PRECISION,
        'NOTE',
        true
      ).toUSD();
      setNotePriceString(`$${oneNoteUSD.toDisplayString()}`);
    }
  }, [loaded, notional]);

  const rates = [...tradableCurrencies.values()].map((c) => {
    try {
      return NTokenValue.getNTokenBlendedYield(c.id);
    } catch {
      return 0;
    }
  });
  const incentiveRates = [...tradableCurrencies.values()].map((c) => {
    try {
      return NTokenValue.getNTokenIncentiveYield(c.id);
    } catch {
      return 0;
    }
  });

  const formattedTradableCurrencies = [...tradableCurrencies.values()];

  return (
    <ThemeProvider theme={themeLanding}>
      <Box
        sx={{
          backgroundSize: 'cover',
          minHeight: height - (73 + 113), // Screen height - (header height + footer height)
          overflowX: 'hidden',
        }}
      >
        <CardContainer
          heading={defineMessage({
            defaultMessage: 'Provide Liquidity & Earn Returns',
            description: 'page heading',
          })}
          subtitle={defineMessage({
            defaultMessage:
              'Mint nTokens from your base asset to provide liquidity and earn interest, fees and NOTE incentives. TIP: Borrow against your nTokens to get cash while earning your LP rewards',
            description: 'page heading subtitle',
          })}
          sx={{
            marginBottom: '0px',
          }}
        >
          {formattedTradableCurrencies.map((c, i) => {
            const symbol = c.underlyingSymbol || c.assetSymbol;
            const rate = rates.length > i ? rates[i] : 0;
            const incentiveRate =
              incentiveRates.length > i ? incentiveRates[i] : 0;
            const route = `/provide/${symbol}`;

            return incentiveRate > 0 ? (
              <Incentive
                key={`incentive-${i}`}
                symbol={symbol}
                rate={rate}
                incentiveRate={incentiveRate}
                route={route}
                buttonText={
                  <FormattedMessage
                    defaultMessage="Provide {symbol}"
                    values={{
                      symbol: symbol,
                    }}
                  />
                }
              />
            ) : (
              <Currency
                key={`currency-${i}`}
                symbol={symbol}
                rate={rate}
                route={route}
                buttonText={
                  <FormattedMessage
                    defaultMessage="Provide {symbol}"
                    values={{
                      symbol: symbol,
                    }}
                  />
                }
              />
            );
          })}
        </CardContainer>
        <HeadingSubtitle
          sx={{
            marginTop: themeLanding.spacing(6),
            marginBottom: themeLanding.spacing(10),
            marginLeft: themeLanding.spacing(15),
          }}
        >
          <FormattedMessage
            defaultMessage="NOTE incentive yields are calculated using the oracle price from the {sNOTEPool}: {notePriceString} USD"
            values={{
              notePriceString,
              sNOTEPool: (
                <StyledLink to="/stake">sNOTE Balancer Pool</StyledLink>
              ),
            }}
          />
        </HeadingSubtitle>
      </Box>
    </ThemeProvider>
  );
};

export default ProvideLiquidityCards;
