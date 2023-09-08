import { Box, ThemeProvider, styled } from '@mui/material';
import {
  useFiat,
  useThemeVariant,
  useAllMarkets,
  useSelectedNetwork,
} from '@notional-finance/notionable-hooks';
import { useEffect, useState } from 'react';
import { FormattedMessage, defineMessage } from 'react-intl';
import { PRODUCTS } from '@notional-finance/util';
import { CardContainer, FeatureLoader } from '@notional-finance/shared-web';
import { useNotionalTheme } from '@notional-finance/styles';
import {
  useWindowDimensions,
  Incentive,
  HeadingSubtitle,
} from '@notional-finance/mui';
import { Link } from 'react-router-dom';
import { Registry, TokenBalance } from '@notional-finance/core-entities';

const StyledLink = styled(Link)(
  ({ theme }) => `
  color: ${theme.palette.primary.light};
  text-decoration: underline;
  &:hover {
    text-decoration: underline;
  }
`
);

export const LiquidityVariableCardView = () => {
  const baseCurrency = useFiat();
  const themeVariant = useThemeVariant();
  const themeLanding = useNotionalTheme(themeVariant, 'landing');
  const network = useSelectedNetwork();
  const {
    yields: { liquidity },
  } = useAllMarkets();
  const { height } = useWindowDimensions();
  const [notePriceString, setNotePriceString] = useState('');

  useEffect(() => {
    if (network) {
      const NOTE = Registry.getTokenRegistry().getTokenBySymbol(
        network,
        'NOTE'
      );
      const oneNoteUSD = TokenBalance.unit(NOTE).toFiat(baseCurrency);
      setNotePriceString(`$${oneNoteUSD.toDisplayString()}`);
    }
  }, [network]);

  return (
    <ThemeProvider theme={themeLanding}>
      <FeatureLoader
        featureLoaded={network !== undefined && themeVariant ? true : false}
      >
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
            {liquidity.map(({ underlying, totalAPY, incentives }, i) => {
              const route = `/${PRODUCTS.LIQUIDITY_VARIABLE}/${underlying.symbol}`;
              const noteApy =
                incentives?.find(({ tokenId }) => tokenId !== undefined)
                  ?.incentiveAPY || 0;
              return (
                <Incentive
                  key={`incentive-${i}`}
                  symbol={underlying.symbol}
                  rate={totalAPY}
                  incentiveRate={noteApy}
                  route={route}
                  buttonText={
                    <FormattedMessage
                      defaultMessage="Provide {symbol}"
                      values={{
                        symbol: underlying.symbol,
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

export default LiquidityVariableCardView;
