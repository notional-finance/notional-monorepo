import { Box, useTheme } from '@mui/material';
import { DataTable } from '@notional-finance/mui';
import { defineMessage } from 'react-intl';
import { VaultActionRow, EmptyPortfolio } from '../../components';
import { useRiskOverviewTable } from '../portfolio-overview/hooks/use-risk-overview-table';
import { usePortfolioVaults } from './hooks/use-portfolio-vaults';

export const PortfolioVaults = () => {
  const theme = useTheme();
  const {
    vaultSummaryData,
    vaultSummaryColumns,
    initialState,
    setExpandedRows,
  } = usePortfolioVaults();
  const { vaultRiskData, riskOverviewColumns } = useRiskOverviewTable();

  if (vaultSummaryData.length === 0) {
    return <EmptyPortfolio />;
  }

  return (
    <Box>
      <DataTable
        data={vaultSummaryData}
        columns={vaultSummaryColumns}
        CustomRowComponent={VaultActionRow}
        initialState={initialState}
        setExpandedRows={setExpandedRows}
      />
      {vaultRiskData.length > 0 && (
        <Box sx={{ marginTop: theme.spacing(4) }}>
          <DataTable
            data={vaultRiskData}
            columns={riskOverviewColumns}
            tableTitle={defineMessage({
              defaultMessage: 'Vault Risk Overview',
              description: 'table title',
            })}
          />
        </Box>
      )}
    </Box>
  );
};

export default PortfolioVaults;
