import { Box, useTheme } from '@mui/material';
import { Network } from '@notional-finance/util';
import { DataTable, TABLE_VARIANTS } from '@notional-finance/mui';
import { useAllAccounts } from './hooks';
import { useAppStore } from '@notional-finance/notionable-hooks';
import { observer } from 'mobx-react-lite';

interface AllAccountsProps {
  networkToggleData: {
    toggleKey: number;
    setToggleKey: (v: number) => void;
  };
  selectedNetwork: Network;
}

const AllAccounts = ({
  networkToggleData,
  selectedNetwork,
}: AllAccountsProps) => {
  const theme = useTheme();
  const { baseCurrency } = useAppStore();
  const { tableData, tableColumns, dropdownsData } = useAllAccounts(
    selectedNetwork,
    baseCurrency
  );

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

export default observer(AllAccounts);
