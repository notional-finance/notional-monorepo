import { Box, styled, useTheme } from '@mui/material';
import { DashboardCard } from './dashboard-card';
import { Caption, LinkText } from '../../typography/typography';
import { DashboardGridProps } from '../product-dashboard';
import { NotionalTheme } from '@notional-finance/styles';
import { FormattedMessage } from 'react-intl';

interface ContainerProps {
  hasLeveragedPosition?: boolean;
  threeWideGrid?: boolean;
  theme: NotionalTheme;
}

export const DashboardGrid = ({
  gridData,
  setShowNegativeYields,
  showNegativeYields,
  // isLoading,
  threeWideGrid,
}: DashboardGridProps) => {
  const theme = useTheme();

  return (
    <Box>
      {gridData &&
        gridData.map(({ sectionTitle, data, hasLeveragedPosition }, index) => (
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
                    incentiveSymbols,
                    apySubTitle,
                    network,
                  },
                  index
                ) => (
                  <div key={index}>
                    <DashboardCard
                      key={index}
                      title={title}
                      subTitle={subTitle}
                      routeCallback={routeCallback}
                      apy={apy}
                      bottomValue={bottomValue}
                      symbol={symbol}
                      hasPosition={hasPosition}
                      incentiveValue={incentiveValue}
                      incentiveSymbols={incentiveSymbols}
                      apySubTitle={apySubTitle}
                      network={network}
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
        ))}
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
      ${theme.breakpoints.down('sm')} {
        padding-left: ${theme.spacing(2)};
        padding-right: ${theme.spacing(2)};
    }
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
        ${theme.breakpoints.down('xs')} {
          width: ${threeWideGrid ? '100%' : theme.spacing(12)};
        }
      }
      ${theme.breakpoints.down('sm')} {
          grid-template-columns: repeat(1, 1fr);
      }
        `
);

export default DashboardGrid;
