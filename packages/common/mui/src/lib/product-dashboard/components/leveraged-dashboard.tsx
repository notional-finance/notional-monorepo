import { Box, styled, useTheme } from '@mui/material';
import { LeveragedCard } from './leveraged-card';
import { Caption, LinkText } from '../../typography/typography';
import ProgressIndicator from '../../progress-indicator/progress-indicator';
import { LeveragedDashboardProps } from '../product-dashboard';
import { NotionalTheme } from '@notional-finance/styles';
import { FormattedMessage } from 'react-intl';

interface ContainerProps {
  hasLeveragedPosition?: boolean;
  theme: NotionalTheme;
}

export const LeveragedDashboard = ({
  productData,
  setShowNegativeYields,
  showNegativeYields,
  isLoading,
}: LeveragedDashboardProps) => {
  const theme = useTheme();

  return (
    <Box sx={{ marginTop: isLoading ? theme.spacing(7.5) : '0px' }}>
      {!isLoading && productData !== undefined ? (
        productData.map(
          ({ sectionTitle, data, hasLeveragedPosition }, index) => (
            <Container
              key={index}
              hasLeveragedPosition={hasLeveragedPosition}
              theme={theme}
            >
              <Caption
                sx={{
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  textAlign: 'left',
                  marginBottom: theme.spacing(2),
                  letterSpacing: '1.4px',
                }}
              >
                {sectionTitle}
              </Caption>
              <GridCardContainer>
                {data.map(
                  (
                    {
                      title,
                      apy,
                      tvl,
                      routeCallback,
                      symbol,
                      hasPosition,
                      incentiveValue,
                      incentiveSymbol,
                    },
                    index
                  ) => (
                    <div key={index}>
                      <LeveragedCard
                        key={index}
                        title={title}
                        routeCallback={routeCallback}
                        apy={apy}
                        tvl={tvl}
                        symbol={symbol}
                        hasPosition={hasPosition}
                        incentiveValue={incentiveValue}
                        incentiveSymbol={incentiveSymbol}
                      />
                    </div>
                  )
                )}
              </GridCardContainer>
              {!hasLeveragedPosition && setShowNegativeYields && (
                <LinkText
                  onClick={() => setShowNegativeYields(!showNegativeYields)}
                  sx={{
                    cursor: 'pointer',
                    textAlign: 'left',
                    paddingTop: theme.spacing(4),
                  }}
                >
                  {showNegativeYields ? (
                    <FormattedMessage defaultMessage={'Hide negative yields'} />
                  ) : (
                    <FormattedMessage defaultMessage={'See negative yields'} />
                  )}
                </LinkText>
              )}
            </Container>
          )
        )
      ) : (
        <ProgressIndicator
          type="notional"
          sx={{ height: theme.spacing(57.5) }}
        />
      )}
    </Box>
  );
};

const Container = styled(Box, {
  shouldForwardProp: (prop: string) => prop !== 'hasLeveragedPosition',
})(
  ({ hasLeveragedPosition, theme }: ContainerProps) => `
      padding-bottom: ${theme.spacing(4)};
      padding-top: ${theme.spacing(4)};
      padding-left: ${theme.spacing(3)};
      padding-right: ${theme.spacing(3)};
      ${
        hasLeveragedPosition
          ? `
        background: ${theme.palette.background.default};
        `
          : ``
      }
    `
);

const GridCardContainer = styled(Box)(
  ({ theme }) => `
      display: grid;
      gap: ${theme.spacing(3)};
      grid-template-columns: repeat(2, 1fr);
      ${theme.breakpoints.down('sm')} {
          grid-template-columns: repeat(1, 1fr);
      }
        `
);

export default LeveragedDashboard;
