import { useCallback } from 'react';
import { Box, useTheme } from '@mui/material';
import { Network } from '@notional-finance/util';
import { Registry } from '@notional-finance/core-entities';
import { formatTxnTableData } from '@notional-finance/helpers';
import { useAnalyticsTable } from './hooks/use-analytics-table';
import { InfiniteScrollDataTable } from '@notional-finance/mui';
import useNetworkToggle from './hooks/use-network-toggle';

export const AllTransactions = () => {
  const theme = useTheme();
  const networkToggleData = useNetworkToggle();
  const network =
    networkToggleData.toggleKey === 0 ? Network.arbitrum : Network.mainnet;
  const { columns } = useAnalyticsTable();
  const apiCallback = useCallback(
    (fetchCount) =>
      Registry.getAnalyticsRegistry().getNetworkTransactions(
        network,
        fetchCount
      ),
    [network]
  );

  const handleDataFormatting = (data) => {
    return data.finalResults[network].map((allTxnData) =>
      formatTxnTableData(allTxnData, network)
    );
  };
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
      <InfiniteScrollDataTable
        networkToggleData={networkToggleData}
        handleDataFormatting={handleDataFormatting}
        columns={columns}
        network={network}
        apiCallback={apiCallback}
      />
    </Box>
  );
};

export default AllTransactions;
