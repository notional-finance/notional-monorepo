import { Box, ThemeProvider, styled } from '@mui/material';
import {
  Registry,
  TokenBalance,
  YieldData,
} from '@notional-finance/core-entities';
import { formatLeverageRatio } from '@notional-finance/helpers';
import {
  HeadingSubtitle,
  Incentive,
  IncentiveLeveraged,
  useWindowDimensions,
} from '@notional-finance/mui';
import {
  useAllMarkets,
  useFiat,
  useSelectedNetwork,
  useThemeVariant,
} from '@notional-finance/notionable-hooks';
import { CardContainer, FeatureLoader } from '@notional-finance/shared-web';
import { useNotionalTheme } from '@notional-finance/styles';
import { PRODUCTS } from '@notional-finance/util';
import { useEffect, useState } from 'react';
import { FormattedMessage, MessageDescriptor, defineMessage } from 'react-intl';
import { Link } from 'react-router-dom';
import { useLeveragedNTokenPositions } from './liquidity-leveraged/hooks/use-leveraged-ntoken-positions';
import { useMaxYield } from './liquidity-leveraged/hooks/use-max-yield';

const StyledLink = styled(Link)(
  ({ theme }) => `
  color: ${theme.palette.primary.light};
  text-decoration: underline;
  &:hover {
    text-decoration: underline;
  }
`
);

const LiquidityCardView = ({
  cardData,
  messages,
  routePath,
  isLeveraged,
}: {
  cardData: (YieldData & { hasPosition?: boolean; maxAPY?: number })[];
  messages: {
    heading: MessageDescriptor;
    subtitle: MessageDescriptor;
    linkText: MessageDescriptor;
    docsLink: string;
  };
  routePath: string;
  isLeveraged?: boolean;
}) => {
  const baseCurrency = useFiat();
  const themeVariant = useThemeVariant();
  const themeLanding = useNotionalTheme(themeVariant, 'landing');
  const network = useSelectedNetwork();
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
  }, [network, baseCurrency]);

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
            heading={messages.heading}
            subtitle={messages.subtitle}
            linkText={messages.linkText}
            docsLink={messages.docsLink}
            sx={{
              marginBottom: '0px',
            }}
            leveraged={isLeveraged}
          >
            {cardData.map(
              (
                {
                  underlying,
                  totalAPY,
                  noteIncentives,
                  secondaryIncentives,
                  leveraged,
                  maxAPY,
                  hasPosition,
                },
                i
              ) => {
                const route = isLeveraged
                  ? `/${routePath}/${
                      hasPosition
                        ? 'IncreaseLeveragedNToken'
                        : 'CreateLeveragedNToken'
                    }/${underlying.symbol}`
                  : `/${routePath}/${underlying.symbol}`;
                return isLeveraged ? (
                  <IncentiveLeveraged
                    key={`incentive-${i}`}
                    symbol={underlying.symbol}
                    rate={totalAPY}
                    incentiveData={noteIncentives}
                    secondaryIncentiveData={secondaryIncentives}
                    customRate={maxAPY}
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
                ) : (
                  <Incentive
                    key={`incentive-${i}`}
                    symbol={underlying.symbol}
                    rate={totalAPY}
                    incentiveData={noteIncentives}
                    secondaryIncentiveData={secondaryIncentives}
                    titleOne={
                      leveraged && (
                        <FormattedMessage
                          defaultMessage="{leverage} Leverage"
                          values={{
                            leverage: formatLeverageRatio(
                              leveraged?.leverageRatio || 0,
                              2
                            ),
                          }}
                        />
                      )
                    }
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
              }
            )}
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

export const LiquidityVariableCardView = () => {
  const {
    yields: { liquidity },
  } = useAllMarkets();

  return (
    <LiquidityCardView
      cardData={liquidity}
      messages={{
        heading: defineMessage({
          defaultMessage: 'Provide Liquidity',
          description: 'page heading',
        }),
        subtitle: defineMessage({
          defaultMessage: `Set it and forget it. Earn passive interest, fees, and NOTE from depositing into Notional's fixed rate liquidity pools.`,
          description: 'page heading subtitle',
        }),
        linkText: defineMessage({
          defaultMessage: 'Read provide liquidity docs',
          description: 'docs link',
        }),
        docsLink:
          'https://docs.notional.finance/notional-v3/product-guides/providing-liquidity',
      }}
      routePath={PRODUCTS.LIQUIDITY_VARIABLE}
    />
  );
};

export const LiquidityLeveragedCardView = () => {
  const {
    yields: { leveragedLiquidity },
  } = useAllMarkets();
  const { depositTokensWithPositions } = useLeveragedNTokenPositions();
  const allMaxAPYs = useMaxYield();

  // These are the default yields using prime debt
  const cardData = leveragedLiquidity
    .filter((y) => y.leveraged?.debtToken.tokenType === 'PrimeDebt')
    .map((y) => {
      return {
        ...y,
        hasPosition: depositTokensWithPositions.includes(y.underlying.symbol),
        maxAPY: allMaxAPYs.find(
          (m) => m.token.currencyId === y.token.currencyId
        )?.totalAPY,
      };
    });

  return (
    <LiquidityCardView
      cardData={cardData}
      messages={{
        heading: defineMessage({
          defaultMessage: 'Leveraged Liquidity',
          description: 'page heading',
        }),
        subtitle: defineMessage({
          defaultMessage: `Multiply your returns returns by providing liquidity with leverage. Select your borrow rate and leverage and put on the whole position in one transaction.
              `,
          description: 'page heading subtitle',
        }),
        linkText: defineMessage({
          defaultMessage: 'Read leveraged liquidity docs',
          description: 'docs link',
        }),
        docsLink:
          'https://docs.notional.finance/notional-v3/product-guides/leveraged-liquidity',
      }}
      routePath={PRODUCTS.LIQUIDITY_LEVERAGED}
      isLeveraged
    />
  );
};
