import { useTheme } from '@mui/material';
import { getNetworkModel } from '@notional-finance/core-entities';
import { DateTimeCell, TxnHashCell } from '@notional-finance/mui';
import { Network, getEtherscanTransactionLink } from '@notional-finance/util';
import { useEffect } from 'react';

export const useReinvestmentData = () => {
  const theme = useTheme();
  const tableColumns = [
    {
      header: 'Time',
      accessorKey: 'day',
      textAlign: 'left',
      cell: DateTimeCell,
      width: theme.spacing(23.375),
    },
    {
      header: 'ETH Reinvested',
      accessorKey: 'eth_reinvestment',
      textAlign: 'right',
      width: theme.spacing(23.375),
    },
    {
      header: 'Reinvestment APY',
      accessorKey: 'apy',
      textAlign: 'right',
      width: theme.spacing(23.375),
    },
    {
      header: 'Txn Hash',
      cell: TxnHashCell,
      accessorKey: 'txnHash',
      textAlign: 'right',
      width: theme.spacing(23.375),
      showLinkIcon: true,
    },
  ];

  const model = getNetworkModel(Network.mainnet);
  const snoteData = model.getSNOTEReinvestment()?.map((r) => ({
    ...r,
    txnHash: {
      href: getEtherscanTransactionLink(r.transaction_hash, Network.mainnet),
      hash: r.transaction_hash,
    },
  }));
  const isSNOTEDataLoaded = !!snoteData;

  useEffect(() => {
    if (!isSNOTEDataLoaded) model.fetchAnalyticsData('sNOTEReinvestment');
  }, [isSNOTEDataLoaded, model]);

  return {
    reinvestmentTableData: snoteData || [],
    reinvestmentTableColumns: tableColumns,
  };
};
