import {
  getNetworkModel,
  TokenBalance,
  TokenDefinition,
} from '@notional-finance/core-entities';
import { Network, getEtherscanTransactionLink } from '@notional-finance/util';
import { DateTimeCell, TxnHashCell } from '@notional-finance/mui';
import { useTheme } from '@mui/material';
import { useObserver } from 'mobx-react-lite';
import { useFetchAnalyticsData } from '@notional-finance/notionable-hooks';

export const useVaultReinvestmentTable = (
  network: Network | undefined,
  deposit: TokenDefinition | undefined,
  vaultAddress: string | undefined
) => {
  const theme = useTheme();
  const tableColumns = [
    {
      header: 'Time',
      accessorKey: 'time',
      textAlign: 'left',
      cell: DateTimeCell,
      width: theme.spacing(23.375),
    },
    {
      header: 'Amount Sold',
      accessorKey: 'amountSold',
      textAlign: 'right',
      width: theme.spacing(23.375),
    },
    {
      header: 'Vault Share Price',
      accessorKey: 'vaultSharePrice',
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

  const reinvestmentData = useObserver(() =>
    vaultAddress && network
      ? getNetworkModel(network).getVaultReinvestment(vaultAddress)
      : undefined
  );
  useFetchAnalyticsData('vaultReinvestment', !!reinvestmentData, network);

  const result =
    network && deposit
      ? reinvestmentData
          ?.map((data) => {
            const sharePrice = data?.vaultSharePrice
              ? TokenBalance.from(data.vaultSharePrice, deposit)
              : undefined;
            const amountSold = new TokenBalance(
              data.rewardAmountSold,
              data?.rewardTokenSold.id,
              network
            );
            return {
              time: data.timestamp,
              amountSold: amountSold.toDisplayStringWithSymbol(),
              vaultSharePrice: sharePrice?.toFloat().toFixed(4),
              txnHash: {
                href: getEtherscanTransactionLink(
                  data.transactionHash,
                  network
                ),
                hash: data.transactionHash,
              },
            };
          })
          .sort((a, b) => b.time - a.time)
          .slice(0, 25)
      : [];

  return {
    reinvestmentTableData: result || [],
    reinvestmentTableColumns: tableColumns,
  };
};
