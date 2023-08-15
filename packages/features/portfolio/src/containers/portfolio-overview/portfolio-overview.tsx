import { DataTable } from '@notional-finance/mui';
import { FormattedMessage } from 'react-intl';
import {
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
  const noOverviewData =
    totalHoldingsData.length === 0 &&
    vaultHoldingsData.length === 0 &&
    riskOverviewData.length === 0;

  console.log({ riskOverviewData });

  return (
    <Box>
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
