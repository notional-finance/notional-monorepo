import { DisplayChartMobile } from '@notional-finance/mui';
import { observer } from 'mobx-react-lite';
import { usePortfolioOverviewTable, useTotalsChart } from './hooks';
import { usePortfolioNOTETable, usePortfolioSNOTETable } from '../../hooks';
import { Box, styled, useTheme } from '@mui/material';
import { useAppStore } from '@notional-finance/notionable-hooks';
import LeverageVaultsOverview from './containers/leverage-vaults-overview';
import LineChart from '@notional-finance/mui/lib/line-chart/line-chart';
import NOTEHoldingsOverview from './containers/note-holdings-overview';
import SNOTEHoldingsOverview from './containers/snote-holdings-overview';
import { SECONDS_IN_DAY, SECONDS_IN_MONTH } from '@notional-finance/util';

const PortfolioOverviewMobile = () => {
  const theme = useTheme();
  const { baseCurrency } = useAppStore();
  const { vaultHoldingsData, showVaultHoldingsTable } =
    usePortfolioOverviewTable(false);
  const { noteData } = usePortfolioNOTETable();
  const { data: sNoteData } = usePortfolioSNOTETable();
  const { barChartData, barConfig, totalsData } = useTotalsChart(
    baseCurrency,
    SECONDS_IN_DAY * 31,
    SECONDS_IN_MONTH * 9
  );

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
                      date: timestamp,
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
        {showVaultHoldingsTable && (
          <LeverageVaultsOverview data={vaultHoldingsData} />
        )}

        {noteData.length > 0 && <NOTEHoldingsOverview data={noteData} />}

        {sNoteData.length > 0 && <SNOTEHoldingsOverview data={sNoteData} />}
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
