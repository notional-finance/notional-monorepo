import { MultiDisplayChart, BarChart } from '@notional-finance/mui';
import { observer } from 'mobx-react-lite';
import { useTotalsChart } from './hooks';
import {
  ClaimNoteButton,
  PortfolioPageHeader,
  ClaimableIncentives,
} from '../../components';
import { Box, styled, useTheme } from '@mui/material';
import { PORTFOLIO_CATEGORIES } from '@notional-finance/util';
import { useAppStore } from '@notional-finance/notionable-hooks';

const PortfolioOverview = () => {
  const theme = useTheme();
  const { baseCurrency } = useAppStore();
  const { barChartData, barConfig, totalsData } = useTotalsChart(baseCurrency);

  return (
    <Box>
      <PortfolioPageHeader category={PORTFOLIO_CATEGORIES.OVERVIEW}>
        <ClaimableIncentives />
        <ClaimNoteButton />
      </PortfolioPageHeader>
      <Container>
        {barChartData && barConfig && (
          <MultiDisplayChart
            chartComponents={[
              {
                chartHeaderTotalsData: totalsData,
                id: 'apy-area-chart',
                title: 'APY',
                hideTopGridLine: false,
                Component: (
                  <BarChart
                    barChartData={barChartData}
                    barConfig={barConfig}
                    xAxisTickFormat="date"
                    yAxisTickFormat="currency"
                  />
                ),
              },
            ]}
          />
        )}
      </Container>

      <Box
        sx={{ '#data-table-container': { marginBottom: theme.spacing(4) } }}
      ></Box>
    </Box>
  );
};

export const Container = styled(Box)(
  ({ theme }) => `
  margin-bottom: ${theme.spacing(4)};
  ${theme.breakpoints.down('sm')} {
    margin-top: ${theme.spacing(1)};
  }
`
);

export default observer(PortfolioOverview);
