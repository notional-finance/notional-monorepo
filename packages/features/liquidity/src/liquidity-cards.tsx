import { Box, ThemeProvider, styled } from '@mui/material';
import { useCurrency, useNotional } from '@notional-finance/notionable-hooks';
import { useEffect, useState } from 'react';
import { FormattedMessage, defineMessage } from 'react-intl';
import { NTokenValue } from '@notional-finance/sdk/src/system';
import { INTERNAL_TOKEN_PRECISION } from '@notional-finance/sdk/src/config/constants';
import { useUserSettingsState } from '@notional-finance/user-settings-manager';
import { CardContainer } from '@notional-finance/shared-web';
import { useNotionalTheme } from '@notional-finance/styles';
import {
  useWindowDimensions,
  Incentive,
  HeadingSubtitle,
  FeatureLoader,
} from '@notional-finance/mui';
import { TypedBigNumber } from '@notional-finance/sdk';
import { Link } from 'react-router-dom';

const StyledLink = styled(Link)(
  ({ theme }) => `
  color: ${theme.palette.primary.light};
  text-decoration: underline;
  &:hover {
    text-decoration: underline;
  }
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
      <FeatureLoader featureLoaded={formattedTradableCurrencies?.length > 0}>
        <Box
          sx={{
            backgroundSize: 'cover',
            minHeight: height - (73 + 113), // Screen height - (header height + footer height)
            overflowX: 'hidden',
          }}
        >
          <CardContainer
            heading={defineMessage({
              defaultMessage: 'Provide Liquidity',
              description: 'page heading',
            })}
            subtitle={defineMessage({
              defaultMessage: `Set it and forget it. Earn passive interest, fees, and NOTE from depositing into Notional's liquidity pools.`,
              description: 'page heading subtitle',
            })}
            linkText={defineMessage({
              defaultMessage: 'Read provide liquidity docs',
              description: 'docs link',
            })}
            docsLink="https://docs.notional.finance/notional-v2/what-you-can-do/providing-liquidity"
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
              return (
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
      </FeatureLoader>
    </ThemeProvider>
  );
};

export default ProvideLiquidityCards;
