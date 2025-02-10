import { DisplayChartMobile } from '@notional-finance/mui';
import { observer } from 'mobx-react-lite';
import { useTotalsChartMobile } from './hooks';
import {
  usePortfolioNOTETable,
  usePortfolioSNOTETable,
  useVaultHoldingsTable,
} from '../../hooks';
import { Box, styled, useTheme } from '@mui/material';
import { useAppStore } from '@notional-finance/notionable-hooks';
import PortfolioHoldingsOverview from './containers/portfolio-holdings-overview';
import LeverageVaultsOverview from './containers/leverage-vaults-overview';
import LineChart from '@notional-finance/mui/lib/line-chart/line-chart';
import NOTEHoldingsOverview from './containers/note-holdings-overview';
import SNOTEHoldingsOverview from './containers/snote-holdings-overview';
import { usePortfolioHoldings } from '../portfolio-holdings/use-portfolio-holdings';
import { getDateString } from '@notional-finance/util';

const PortfolioOverviewMobile = () => {
  const theme = useTheme();
  const { baseCurrency } = useAppStore();
  const { portfolioHoldingsData } = usePortfolioHoldings(baseCurrency);
  const { vaultHoldingsData, showVaultHoldingsTable } = useVaultHoldingsTable();
  const { noteData } = usePortfolioNOTETable();
  const { data: sNoteData } = usePortfolioSNOTETable();
  const { barChartData, barConfig, totalsData } =
    useTotalsChartMobile(baseCurrency);

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
                      date: getDateString(timestamp, { monthOnly: true }),
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
