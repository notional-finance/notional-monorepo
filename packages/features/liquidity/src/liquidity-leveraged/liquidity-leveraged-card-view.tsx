import { Box, ThemeProvider, styled } from '@mui/material';
import {
  useAllMarkets,
  useGlobalContext,
  useSelectedNetwork,
} from '@notional-finance/notionable-hooks';
import { useEffect, useState } from 'react';
import { FormattedMessage, defineMessage } from 'react-intl';
import { PRODUCTS } from '@notional-finance/shared-config';
import { CardContainer } from '@notional-finance/shared-web';
import { useNotionalTheme } from '@notional-finance/styles';
import {
  useWindowDimensions,
  Incentive,
  HeadingSubtitle,
  FeatureLoader,
} from '@notional-finance/mui';
import { Link } from 'react-router-dom';
import { Registry, TokenBalance } from '@notional-finance/core-entities';
import { formatLeverageRatio } from '@notional-finance/helpers';
import { groupArrayToMap } from '@notional-finance/util';

const StyledLink = styled(Link)(
  ({ theme }) => `
  color: ${theme.palette.primary.light};
  text-decoration: underline;
  &:hover {
    text-decoration: underline;
  }
`
);

export const LiquidityLeveragedCardView = () => {
  const {
    state: { themeVariant },
  } = useGlobalContext();
  const themeLanding = useNotionalTheme(themeVariant, 'landing');
  const network = useSelectedNetwork();
  const {
    yields: { leveragedLiquidity },
    getMax,
  } = useAllMarkets();
  const { height } = useWindowDimensions();
  const [notePriceString, setNotePriceString] = useState('');
  const cardData = [
    ...groupArrayToMap(
      leveragedLiquidity,
      (t) => t.underlying.symbol
    ).entries(),
  ];

  useEffect(() => {
    if (network) {
      const NOTE = Registry.getTokenRegistry().getTokenBySymbol(
        network,
        'NOTE'
      );
      const oneNoteUSD = TokenBalance.unit(NOTE).toFiat('USD');
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
              defaultMessage: 'Leveraged Liquidity',
              description: 'page heading',
            })}
            subtitle={defineMessage({
              defaultMessage: `Multiple your returns by providing liquidity with leverage. Select your borrow rate and leverage and put on the whole position in one transaction.
              `,
              description: 'page heading subtitle',
            })}
            linkText={defineMessage({
              defaultMessage: 'Read leveraged liquidity docs',
              description: 'docs link',
            })}
            docsLink="https://docs.notional.finance/notional-v2/what-you-can-do/providing-liquidity"
            sx={{
              marginBottom: '0px',
            }}
            leveraged={true}
          >
            {cardData.map(([symbol, yields], i) => {
              const route = `/${PRODUCTS.LIQUIDITY_LEVERAGED}/${symbol}`;
              const maxYield = getMax(yields);
              return (
                <Incentive
                  key={`incentive-${i}`}
                  symbol={symbol}
                  rate={maxYield?.totalAPY || 0}
                  incentiveRate={
                    maxYield?.incentives?.find(
                      ({ tokenId }) => tokenId !== undefined
                    )?.incentiveAPY || 0
                  }
                  titleOne={
                    <FormattedMessage
                      defaultMessage="{leverage} Leverage"
                      values={{
                        leverage: formatLeverageRatio(
                          maxYield?.leveraged?.leverageRatio || 0,
                          2
                        ),
                      }}
                    />
                  }
                  route={route}
                  buttonText={
                    <FormattedMessage
                      defaultMessage="Provide {symbol}"
                      values={{ symbol }}
                    />
                  }
                />
              );
            })}
          </CardContainer>
          <HeadingSubtitle
            sx={
              {
                // marginTop: themeLanding.spacing(6),
                // marginBottom: themeLanding.spacing(10),
                // marginLeft: themeLanding.spacing(15),
              }
            }
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

export default LiquidityLeveragedCardView;
