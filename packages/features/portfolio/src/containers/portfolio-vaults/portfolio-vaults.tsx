import { DataTable } from '@notional-finance/mui';
import { EmptyPortfolio, TableActionRow } from '../../components';
import { FormattedMessage } from 'react-intl';
import { useVaultHoldingsTable } from '../../hooks';
import { Box } from '@mui/material';

export const PortfolioVaults = () => {
  const {
    vaultHoldingsColumns,
    vaultHoldingsData,
    setExpandedRows,
    initialState,
  } = useVaultHoldingsTable();

  return (
    <Box>
      {vaultHoldingsData && vaultHoldingsData.length === 0 ? (
        <EmptyPortfolio />
      ) : (
        <DataTable
          data={vaultHoldingsData}
          columns={vaultHoldingsColumns}
          CustomRowComponent={TableActionRow}
          tableTitle={
            <FormattedMessage
              defaultMessage="Leveraged Vaults"
              description="table title"
            />
          }
          initialState={initialState}
          setExpandedRows={setExpandedRows}
        />
      )}
    </Box>
  );
};

export default PortfolioVaults;
