import { useCallback } from 'react';
import { Box, useTheme } from '@mui/material';
import { Network } from '@notional-finance/util';
import { formatTxnTableData } from '@notional-finance/helpers';
import { useAllTransactionsTable } from './hooks';
import { InfiniteScrollDataTable } from '@notional-finance/mui';

interface AllTransactionsProps {
  networkToggleData: {
    toggleKey: number;
    setToggleKey: (v: number) => void;
  };
  selectedNetwork: Network;
}

export const AllTransactions = ({
  networkToggleData,
  selectedNetwork,
}: AllTransactionsProps) => {
  const theme = useTheme();

  const { columns } = useAllTransactionsTable();
  const apiCallback = useCallback((_fetchCount: number) => {
    // TODO: call get all transactions with some fetch count
    return Promise.resolve([]);
  }, []);

  const handleDataFormatting = (data) => {
    return data.finalResults[selectedNetwork].map((allTxnData) =>
      formatTxnTableData(allTxnData, selectedNetwork)
    );
  };

  return (
    <Box
      sx={{
        padding: theme.spacing(5),
        paddingTop: '0px',
        maxWidth: theme.spacing(180),
        margin: 'auto',
        marginTop: `-${theme.spacing(25)}`,
      }}
    >
      <InfiniteScrollDataTable
        networkToggleData={networkToggleData}
        handleDataFormatting={handleDataFormatting}
        columns={columns}
        network={selectedNetwork}
        apiCallback={apiCallback}
      />
    </Box>
  );
};

export default AllTransactions;
