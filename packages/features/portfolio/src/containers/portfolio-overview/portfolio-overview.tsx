import {
  DataTable,
  MultiDisplayChart,
  ChartContainer,
  BarChart,
} from '@notional-finance/mui';
import { FormattedMessage } from 'react-intl';
import {
  useTotalsChart,
  useRiskOverviewTable,
  useTotalHoldingsTable,
  useOverviewVaultHoldingsColumns,
} from './hooks';
import { useVaultHoldingsTable } from '../../hooks';
import { EmptyPortfolioOverview } from '../../components';
import { Box, useTheme } from '@mui/material';

export const PortfolioOverview = () => {
  const theme = useTheme();
  const { totalHoldingsColumns, totalHoldingsData } = useTotalHoldingsTable();
  const { vaultHoldingsData } = useVaultHoldingsTable();
  const { overviewVaultHoldingsColumns } = useOverviewVaultHoldingsColumns();
  const { riskOverviewData, riskOverviewColumns } = useRiskOverviewTable();
  const { barConfig } = useTotalsChart();
  const noOverviewData =
    totalHoldingsData.length === 0 &&
    vaultHoldingsData.length === 0 &&
    riskOverviewData.length === 0;

  const barChartData = [
    {
      totalAssets: 0,
      totalDebts: 0,
      totalNetWorth: 0,
      timestamp: 1694271887,
    },
    {
      totalAssets: 0,
      totalDebts: 0,
      totalNetWorth: 0,
      timestamp: 1694358287,
    },
    {
      totalAssets: 0,
      totalDebts: 0,
      totalNetWorth: 0,
      timestamp: 1694444687,
    },
    {
      totalAssets: 0,
      totalDebts: 0,
      totalNetWorth: 0,
      timestamp: 1694531087,
    },
    {
      totalAssets: 0,
      totalDebts: 0,
      totalNetWorth: 0,
      timestamp: 1694617487,
    },
    {
      totalAssets: 0,
      totalDebts: 0,
      totalNetWorth: 0,
      timestamp: 1694703887,
    },
    {
      totalAssets: 0,
      totalDebts: 0,
      totalNetWorth: 0,
      timestamp: 1694790287,
    },
    {
      totalAssets: 0,
      totalDebts: 0,
      totalNetWorth: 0,
      timestamp: 1694876687,
    },
    {
      totalAssets: 0,
      totalDebts: 0,
      totalNetWorth: 0,
      timestamp: 1694963087,
    },
    {
      totalAssets: 0,
      totalDebts: 0,
      totalNetWorth: 0,
      timestamp: 1695049487,
    },
    {
      totalAssets: 0,
      totalDebts: 0,
      totalNetWorth: 0,
      timestamp: 1695135887,
    },
    {
      totalAssets: 0,
      totalDebts: 0,
      totalNetWorth: 0,
      timestamp: 1695222287,
    },
    {
      totalAssets: 422.317379,
      totalDebts: 400.845588,
      totalNetWorth: 21.471791,
      timestamp: 1695308687,
    },
    {
      totalAssets: 423.834388,
      totalDebts: 402.247154,
      totalNetWorth: 21.587234,
      timestamp: 1695395087,
    },
    {
      totalAssets: 423.228763,
      totalDebts: 401.648516,
      totalNetWorth: 21.580247,
      timestamp: 1695481487,
    },
    {
      totalAssets: 419.113155,
      totalDebts: 397.719122,
      totalNetWorth: 21.394033,
      timestamp: 1695567887,
    },
    {
      totalAssets: 421.993315,
      totalDebts: 400.443859,
      totalNetWorth: 21.549456,
      timestamp: 1695654287,
    },
    {
      totalAssets: 422.713189,
      totalDebts: 401.677925,
      totalNetWorth: 21.035264,
      timestamp: 1695740687,
    },
    {
      totalAssets: 425.467973,
      totalDebts: 404.347438,
      totalNetWorth: 21.120535,
      timestamp: 1695827087,
    },
    {
      totalAssets: 439.263854,
      totalDebts: 417.446347,
      totalNetWorth: 21.817507,
      timestamp: 1695913487,
    },
    {
      totalAssets: 444.564049,
      totalDebts: 421.786567,
      totalNetWorth: 22.777482,
      timestamp: 1695999887,
    },
    {
      totalAssets: 445.301094,
      totalDebts: 422.503227,
      totalNetWorth: 22.797867,
      timestamp: 1696086287,
    },
    {
      totalAssets: 458.646379,
      totalDebts: 435.186825,
      totalNetWorth: 23.459554,
      timestamp: 1696172687,
    },
    {
      totalAssets: 442.514791,
      totalDebts: 416.577759,
      totalNetWorth: 25.937032,
      timestamp: 1696259087,
    },
    {
      totalAssets: 602.481166,
      totalDebts: 408.645389,
      totalNetWorth: 193.835777,
      timestamp: 1696345487,
    },
    {
      totalAssets: 607.871233,
      totalDebts: 412.331329,
      totalNetWorth: 195.539904,
      timestamp: 1696431887,
    },
    {
      totalAssets: 594.553139,
      totalDebts: 403.326825,
      totalNetWorth: 191.226314,
      timestamp: 1696518287,
    },
    {
      totalAssets: 605.634928,
      totalDebts: 410.942399,
      totalNetWorth: 194.692529,
      timestamp: 1696604687,
    },
    {
      totalAssets: 602.725962,
      totalDebts: 408.940282,
      totalNetWorth: 193.78568,
      timestamp: 1696691087,
    },
    {
      totalAssets: 599.124614,
      totalDebts: 406.48295,
      totalNetWorth: 192.641664,
      timestamp: 1696777487,
    },
  ];

  return (
    <Box>
      <Box sx={{ marginBottom: '32px' }}>
        {barChartData && barConfig && (
          <MultiDisplayChart
            chartComponents={[
              {
                chartHeaderTotalsData: barConfig,
                id: 'apy-area-chart',
                title: 'APY',
                Component: (
                  <ChartContainer>
                    <BarChart
                      barChartData={barChartData}
                      barConfig={barConfig}
                      xAxisTickFormat="date"
                      yAxisTickFormat="currency"
                    />
                  </ChartContainer>
                ),
              },
            ]}
          />
        )}
      </Box>

      {!noOverviewData ? (
        <Box
          sx={{ '#data-table-container': { marginBottom: theme.spacing(4) } }}
        >
          {riskOverviewData.length > 0 && (
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
          {totalHoldingsData.length > 0 && (
            <DataTable
              data={totalHoldingsData}
              columns={totalHoldingsColumns}
              tableTitle={
                <div>
                  <FormattedMessage
                    defaultMessage="Portfolio Holdings"
                    description="table title"
                  />
                </div>
              }
            />
          )}
          {vaultHoldingsData.length > 0 && (
            <DataTable
              data={vaultHoldingsData}
              columns={overviewVaultHoldingsColumns}
              tableTitle={
                <div>
                  <FormattedMessage
                    defaultMessage="Leveraged Vaults"
                    description="table title"
                  />
                </div>
              }
            />
          )}
        </Box>
      ) : (
        <EmptyPortfolioOverview walletConnected />
      )}
    </Box>
  );
};

export default PortfolioOverview;
