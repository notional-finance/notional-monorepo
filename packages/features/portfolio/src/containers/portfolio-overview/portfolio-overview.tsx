import { EmptyPortfolio } from '../../components';
import { useAccountReady } from '@notional-finance/notionable-hooks';
import { DataTable } from '@notional-finance/mui';
import { FormattedMessage } from 'react-intl';
import {
  useRiskOverviewTable,
  useTotalHoldingsTable,
  useVaultHoldingsTable,
} from './hooks';
import { Box, useTheme } from '@mui/material';

export const PortfolioOverview = () => {
  const theme = useTheme();
  const accountConnected = useAccountReady();
  const { totalHoldingsColumns, totalHoldingsData } = useTotalHoldingsTable();
  const { vaultHoldingsColumns, vaultHoldingsData } = useVaultHoldingsTable();
  const { riskOverviewData, riskOverviewColumns } = useRiskOverviewTable();

  return accountConnected ? (
    <Box sx={{ '#data-table-container': { marginBottom: theme.spacing(4) } }}>
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
          columns={vaultHoldingsColumns}
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
    <EmptyPortfolio />
  );
};

export default PortfolioOverview;
