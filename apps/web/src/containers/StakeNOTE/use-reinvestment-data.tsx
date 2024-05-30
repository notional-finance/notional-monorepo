import { useTheme } from '@mui/material';
import { NOTERegistryClient, Registry } from '@notional-finance/core-entities';
import { DateTimeCell, TxnHashCell } from '@notional-finance/mui';
import { Network, getEtherscanTransactionLink } from '@notional-finance/util';
import { useEffect, useState } from 'react';

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

  const [result, setResult] = useState<
    Awaited<ReturnType<NOTERegistryClient['getSNOTEReinvestmentData']>>
  >([]);
  useEffect(() => {
    Registry.getNOTERegistry()
      .getSNOTEReinvestmentData()
      .then((s) =>
        setResult(
          s.map((r) =>
            Object.assign(r, {
              txnHash: {
                href: getEtherscanTransactionLink(
                  r.transaction_hash,
                  Network.mainnet
                ),
                hash: r.transaction_hash,
              },
            })
          )
        )
      );
  }, []);

  return {
    reinvestmentTableData: result || [],
    reinvestmentTableColumns: tableColumns,
  };
};
