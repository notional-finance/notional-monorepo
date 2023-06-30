import { Box, ThemeProvider, styled } from '@mui/material';
import {
  useAllMarkets,
  useSelectedNetwork,
} from '@notional-finance/notionable-hooks';
import { useEffect, useState } from 'react';
import { FormattedMessage, defineMessage } from 'react-intl';
import { PRODUCTS } from '@notional-finance/shared-config';
import { useUserSettingsState } from '@notional-finance/user-settings-manager';
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
  const { themeVariant } = useUserSettingsState();
  const themeLanding = useNotionalTheme(themeVariant, 'landing');
  const network = useSelectedNetwork();
  const { allYields } = useAllMarkets();
  const { height } = useWindowDimensions();
  const [notePriceString, setNotePriceString] = useState('');
  const cardData = allYields.filter((t) => t.tokenType === 'nToken');

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
      <FeatureLoader featureLoaded={network !== undefined}>
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
          >
            {cardData.map(({ underlying, totalApy, noteApy }, i) => {
              const route = `/${PRODUCTS.LIQUIDITY_LEVERAGED}/${underlying}`;
              return (
                <Incentive
                  key={`incentive-${i}`}
                  symbol={underlying}
                  rate={totalApy}
                  incentiveRate={noteApy}
                  route={route}
                  buttonText={
                    <FormattedMessage
                      defaultMessage="Provide {symbol}"
                      values={{
                        symbol: underlying,
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

export default LiquidityLeveragedCardView;
