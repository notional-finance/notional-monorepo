import { DisplayChartMobile } from '@notional-finance/mui';
import { observer } from 'mobx-react-lite';
import { useTotalsChart } from './hooks';
import { usePortfolioNOTETable, useVaultHoldingsTable } from '../../hooks';
import { Box, styled, useTheme } from '@mui/material';
import { useAppStore } from '@notional-finance/notionable-hooks';
import PortfolioHoldingsOverview from './containers/portfolio-holdings-overview';
import LeverageVaultsOverview from './containers/leverage-vaults-overview';
import LineChart from '@notional-finance/mui/lib/line-chart/line-chart';
import moment from 'moment';
import NOTEHoldingsOverview from './containers/note-holdings-overview';
import { usePortfolioHoldings } from '../portfolio-holdings/use-portfolio-holdings';

const PortfolioOverviewMobile = () => {
  const theme = useTheme();
  const { baseCurrency } = useAppStore();
  const { portfolioHoldingsData } = usePortfolioHoldings(baseCurrency);
  const { vaultHoldingsData, showVaultHoldingsTable } = useVaultHoldingsTable();
  const { noteData } = usePortfolioNOTETable();
  const { barChartData, barConfig, totalsData } = useTotalsChart(baseCurrency);

  return (
    <Box>
      <Container>
        {barChartData && barConfig && (
          <DisplayChartMobile
            chartComponent={{
              chartHeaderTotalsData: totalsData,
              id: 'net-worth-area-chart',
              title: 'Net Worth',
              hideTopGridLine: false,
              Component: (
                <LineChart
                  data={barChartData.map(
                    ({
                      timestamp,
                      totalNetWorth,
                      totalAssets,
                      totalDebts,
                    }) => ({
                      date: moment(timestamp * 1000).format('MMM'),
                      totalNetWorth,
                      totalAssets,
                      totalDebts,
                    })
                  )}
                  lineConfig={barConfig}
                  areaKey="totalNetWorth"
                  XAxisKey="date"
                />
              ),
            }}
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
        {portfolioHoldingsData && (
          <PortfolioHoldingsOverview holdings={portfolioHoldingsData} />
        )}

        {showVaultHoldingsTable && (
          <LeverageVaultsOverview data={vaultHoldingsData} />
        )}

        {noteData.length > 0 && <NOTEHoldingsOverview data={noteData} />}
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
