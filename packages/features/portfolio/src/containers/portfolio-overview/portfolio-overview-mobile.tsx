import {
  DataTable,
  MultiDisplayChart,
  BarChart,
  Card,
  AreaChart,
} from '@notional-finance/mui';
import { FormattedMessage } from 'react-intl';
import { observer } from 'mobx-react-lite';
import {
  useTotalsChart,
  useRiskOverviewTable,
  useTotalHoldingsTable,
  useOverviewVaultHoldingsColumns,
} from './hooks';
import { useVaultHoldingsTable } from '../../hooks';
import { ClaimNoteButton, PortfolioPageHeader } from '../../components';
import { Box, styled, useTheme } from '@mui/material';
import { PORTFOLIO_CATEGORIES } from '@notional-finance/util';
import { useAppStore } from '@notional-finance/notionable-hooks';
import PortfolioHoldingsOverview from './containers/portfolio-holdings-overview';
import LeverageVaultsOverview from './containers/leverage-vaults-overview';

const PortfolioOverviewMobile = () => {
  const theme = useTheme();
  const { baseCurrency } = useAppStore();
  const { totalHoldingsColumns, totalHoldingsData, showTotalHoldingsTable } =
    useTotalHoldingsTable(baseCurrency);
  const { vaultHoldingsData, showVaultHoldingsTable } = useVaultHoldingsTable();
  const { overviewVaultHoldingsColumns } = useOverviewVaultHoldingsColumns();
  const { riskOverviewData, riskOverviewColumns } =
    useRiskOverviewTable(baseCurrency);
  const { barChartData, barConfig, totalsData } = useTotalsChart(baseCurrency);

  console.log('barChartData', barChartData);

  return (
    <Box>
      {/* <PortfolioPageHeader category={PORTFOLIO_CATEGORIES.OVERVIEW}>
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
      </Container> */}
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
                  <AreaChart
                    title="APY"
                    xAxisTickFormat="date"
                    showCartesianGrid
                    yAxisTickFormat="number"
                    areaChartData={barChartData.map(
                      ({ timestamp, totalNetWorth, totalAssets }) => ({
                        timestamp,
                        area: totalNetWorth,
                      })
                    )}
                  />
                ),
              },
            ]}
          />
        )}
      </Container>

      <Box
        sx={{
          '#data-table-container': { marginBottom: theme.spacing(4) },
          display: 'flex',
          flexDirection: 'column',
          gap: theme.spacing(2),
        }}
      >
        {showTotalHoldingsTable && (
          <PortfolioHoldingsOverview holdings={totalHoldingsData} />
        )}

        {showVaultHoldingsTable && (
          <LeverageVaultsOverview data={vaultHoldingsData} />
        )}

        {/* {riskOverviewData.length > 0 && (
          <DataTable
            data={riskOverviewData}
            columns={riskOverviewColumns}
            tableTitle={
              <div>
                <FormattedMessage
                  defaultMessage="Risk Overview"
                  description="table title"
                />
              </div>
            }
          />
        )}

        
        )} */}
      </Box>
    </Box>
  );
};

const Container = styled(Box)(
  ({ theme }) => `
  margin-bottom: ${theme.spacing(4)};
  ${theme.breakpoints.down('sm')} {
    margin-top: ${theme.spacing(1)};
  }
`
);

export default observer(PortfolioOverviewMobile);
