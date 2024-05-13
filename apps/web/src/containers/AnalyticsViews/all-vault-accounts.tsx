import { Box, useTheme } from '@mui/material';
import { Network } from '@notional-finance/util';
import { useAllVaultAccounts } from './hooks';
import { DataTable, TABLE_VARIANTS } from '@notional-finance/mui';

interface AllVaultAccountsProps {
  networkToggleData: {
    toggleKey: number;
    setToggleKey: (v: number) => void;
  };
  selectedNetwork: Network;
}

export const AllVaultAccounts = ({
  networkToggleData,
  selectedNetwork,
}: AllVaultAccountsProps) => {
  const theme = useTheme();
  const { tableData, tableColumns, dropdownsData } =
    useAllVaultAccounts(selectedNetwork);

  return (
    <Box
      sx={{
        padding: theme.spacing(5),
        paddingTop: '0px',
        maxWidth: theme.spacing(180),
        margin: 'auto',
        marginTop: `-${theme.spacing(30)}`,
      }}
    >
      <DataTable
        maxHeight={theme.spacing(130)}
        data={tableData}
        columns={tableColumns}
        filterBarData={dropdownsData}
        networkToggleData={networkToggleData}
        tableVariant={TABLE_VARIANTS.SORTABLE}
      />
    </Box>
  );
};

export default AllVaultAccounts;
