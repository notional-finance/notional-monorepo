import { Box, styled, useTheme } from '@mui/material';
import { LeveragedCard } from './leveraged-card';
import { Caption, LinkText } from '../../typography/typography';
import ProgressIndicator from '../../progress-indicator/progress-indicator';
import { LeveragedDashboardProps } from '../product-dashboard';
import { NotionalTheme } from '@notional-finance/styles';
import { FormattedMessage } from 'react-intl';

interface ContainerProps {
  hasLeveragedPosition?: boolean;
  threeWideGrid?: boolean;
  theme: NotionalTheme;
}

export const LeveragedDashboard = ({
  productData,
  setShowNegativeYields,
  showNegativeYields,
  isLoading,
  threeWideGrid,
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
              <GridCardContainer threeWideGrid={threeWideGrid} theme={theme}>
                {data.map(
                  (
                    {
                      title,
                      subTitle,
                      apy,
                      bottomValue,
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
                        subTitle={subTitle}
                        routeCallback={routeCallback}
                        apy={apy}
                        bottomValue={bottomValue}
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

const GridCardContainer = styled(Box, {
  shouldForwardProp: (prop: string) => prop !== 'threeWideGrid',
})(
  ({ threeWideGrid, theme }: ContainerProps) => `
      display: grid;
      gap: ${theme.spacing(3)};
      grid-template-columns: ${
        threeWideGrid ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)'
      };
      #grid-card-sub-title {
        width: ${threeWideGrid ? '100%' : theme.spacing(30.5)};
      }
      ${theme.breakpoints.down('sm')} {
          grid-template-columns: repeat(1, 1fr);
      }
        `
);

export default LeveragedDashboard;
