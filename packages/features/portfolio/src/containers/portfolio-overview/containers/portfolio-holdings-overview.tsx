import { Box, styled, useTheme } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import PositionCard from '../components/position-card';
import { H3, H2 } from '@notional-finance/mui';
import { usePortfolioOverviewTable } from '../hooks';

interface IProps {
  holdings: ReturnType<
    typeof usePortfolioOverviewTable
  >['portfolioHoldingsData'];
}

const PortfolioHoldingsOverview = ({ holdings }: IProps) => {
  const theme = useTheme();

  return (
    <Container>
      <Header>
        <FormattedMessage
          defaultMessage="Portfolio Holdings"
          description="portfolio holdings"
        />
      </Header>

      <Box>
        {holdings.map((holding, i) => {
          if (holding.asset.label === 'DEBT POSITIONS') {
            return (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  padding: theme.spacing(2),
                  background: theme.palette.background.default,
                  borderColor: theme.palette.borders.paper,
                  borderTopWidth: 1,
                  borderBottomWidth: 1,
                  borderTopStyle: 'solid',
                  borderBottomStyle: 'solid',
                }}
              >
                <H3
                  sx={{
                    fontSize: theme.typography.pxToRem(12),
                    fontWeight: theme.typography.fontWeightMedium,
                    lineHeight: 1.4,
                    letterSpacing: '1px',
                    color: theme.palette.typography.light,
                    margin: 0,
                    textTransform: 'uppercase',
                  }}
                >
                  <FormattedMessage
                    defaultMessage="Debt Positions"
                    description="debt positions"
                  />
                </H3>
              </Box>
            );
          }
          return (
            <PositionCard
              header={{
                tokenSymbol: holding.asset.symbol,
                tokenName: holding.asset.label,
                description: holding.asset.caption,
              }}
              tokenId={holding.tokenId}
              data={{
                ['Market APY']: {
                  value:
                    typeof holding.marketApy === 'string'
                      ? holding.marketApy
                      : holding.marketApy?.data?.[0]?.displayValue,
                  description: holding.marketApy?.data?.[1]?.displayValue,
                },
                ['Present Value']: {
                  value:
                    typeof holding.presentValue === 'string'
                      ? holding.presentValue
                      : holding.presentValue?.data?.[0]?.displayValue,
                  description: holding.presentValue?.data?.[1]?.displayValue,
                },
                ['Total Earnings']: {
                  value:
                    typeof holding.earnings === 'string'
                      ? holding.earnings
                      : holding.earnings?.data?.[0]?.displayValue,
                  description: holding.earnings?.data?.[1]?.displayValue,
                },
              }}
              key={i}
            />
          );
        })}
      </Box>
    </Container>
  );
};

const Header = styled(H2)(({ theme }) => ({
  fontSize: theme.typography.pxToRem(16),
  fontWeight: theme.typography.fontWeightMedium,
  lineHeight: 1.4,
  color: theme.palette.typography.light,
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(2),
}));

const Container = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  borderTop: `1px solid ${theme.palette.borders.default}`,
  background: theme.palette.background.paper,
  paddingTop: theme.spacing(2),
}));

export default PortfolioHoldingsOverview;
