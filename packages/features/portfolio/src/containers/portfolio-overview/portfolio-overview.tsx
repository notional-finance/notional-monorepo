import { DataTable, MultiDisplayChart, BarChart } from '@notional-finance/mui';
import { FormattedMessage } from 'react-intl';
import { observer } from 'mobx-react-lite';
import {
  useTotalsChart,
  useRiskOverviewTable,
  useTotalHoldingsTable,
  useOverviewVaultHoldingsColumns,
} from './hooks';
import { useVaultHoldingsTable } from '../../hooks';
import { ClaimNoteButton, EmptyPortfolioOverview, PortfolioPageHeader } from '../../components';
import { Box, styled, useTheme } from '@mui/material';
import { PORTFOLIO_CATEGORIES } from '@notional-finance/util';
import { useAppStore } from '@notional-finance/notionable-hooks';

const PortfolioOverview = () => {
  const theme = useTheme();
  const { baseCurrency } = useAppStore();
  const { totalHoldingsColumns, totalHoldingsData } =
    useTotalHoldingsTable(baseCurrency);
  const { vaultHoldingsData } = useVaultHoldingsTable();
  const { overviewVaultHoldingsColumns } = useOverviewVaultHoldingsColumns();
  const { riskOverviewData, riskOverviewColumns } =
    useRiskOverviewTable(baseCurrency);
  const { barChartData, barConfig, totalsData } = useTotalsChart(baseCurrency);
  const noOverviewData =
    totalHoldingsData.length === 0 &&
    vaultHoldingsData.length === 0 &&
    riskOverviewData.length === 0;

  return (
    <Box>
      <PortfolioPageHeader category={PORTFOLIO_CATEGORIES.OVERVIEW}>
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

const Container = styled(Box)(
  ({ theme }) => `
  margin-bottom: ${theme.spacing(4)};
  ${theme.breakpoints.down('sm')} {
    margin-top: ${theme.spacing(1)};
  }
`
);

export default observer(PortfolioOverview);
