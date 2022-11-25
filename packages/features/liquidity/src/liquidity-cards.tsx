import { Box, useTheme, styled } from '@mui/material';
import { useCurrency, useNotional } from '@notional-finance/notionable-hooks';
import { useEffect, useState } from 'react';
import { THEME_VARIANTS } from '@notional-finance/shared-config';
import { FormattedMessage, defineMessage } from 'react-intl';
import backgroundImgDark from '@notional-finance/assets/images/provide-liquidity-bg.png';
import { useUserSettingsState } from '@notional-finance/shared-web';
import backgroundImgLight from '@notional-finance/assets/images/provide-liquidity-light-bg.png';
import { NTokenValue } from '@notional-finance/sdk/src/system';
import { INTERNAL_TOKEN_PRECISION } from '@notional-finance/sdk/src/config/constants';
import { CardContainer } from '@notional-finance/shared-web';
import {
  useWindowDimensions,
  CardVariant,
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
  const theme = useTheme();
  const { themeVariant } = useUserSettingsState();
  const { tradableCurrencies } = useCurrency();
  const { notional, loaded } = useNotional();
  const { height } = useWindowDimensions();
  const [notePriceString, setNotePriceString] = useState('');
  const bgImg =
    themeVariant === THEME_VARIANTS.LIGHT
      ? backgroundImgLight
      : backgroundImgDark;

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

  const notePriceMessage = (
    <HeadingSubtitle sx={{ marginTop: theme.spacing(8) }}>
      <FormattedMessage
        defaultMessage="NOTE incentive yields are calculated using the oracle price from the {sNOTEPool}: {notePriceString} USD"
        values={{
          notePriceString,
          sNOTEPool: <StyledLink to="/stake">sNOTE Balancer Pool</StyledLink>,
        }}
      />
    </HeadingSubtitle>
  );

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

  const cards = [...tradableCurrencies.values()].map((c, i) => {
    const symbol = c.underlyingSymbol || c.assetSymbol;
    const rate = rates.length > i ? rates[i] : 0;
    const incentiveRate = incentiveRates.length > i ? incentiveRates[i] : 0;
    const route = `/provide/${symbol}`;

    return (
      <CardVariant
        variant="incentive"
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
  });

  return (
    <Box
      sx={{
        backgroundImage: `url(${bgImg})`,
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
        cards={cards}
      >
        {notePriceMessage}
      </CardContainer>
    </Box>
  );
};

export default ProvideLiquidityCards;
