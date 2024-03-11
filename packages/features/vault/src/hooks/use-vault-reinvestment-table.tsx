import {
  Registry,
  TokenBalance,
  TokenDefinition,
} from '@notional-finance/core-entities';
import { Network, getEtherscanTransactionLink } from '@notional-finance/util';
import { DateTimeCell, TxnHashCell } from '@notional-finance/mui';
import { useTheme } from '@mui/material';

export const useVaultReinvestmentTable = (
  network: Network | undefined,
  deposit: TokenDefinition | undefined,
  vaultAddress: string | undefined
) => {
  const theme = useTheme();
  const tableColumns = [
    {
      Header: 'Time',
      accessor: 'time',
      textAlign: 'left',
      Cell: DateTimeCell,
      width: theme.spacing(23.375),
    },
    {
      Header: 'Amount Sold',
      accessor: 'amountSold',
      textAlign: 'right',
      width: theme.spacing(23.375),
    },
    {
      Header: 'Vault Share Price',
      accessor: 'vaultSharePrice',
      textAlign: 'right',
      width: theme.spacing(23.375),
    },
    {
      Header: 'Txn Hash',
      Cell: TxnHashCell,
      accessor: 'txnHash',
      textAlign: 'right',
      width: theme.spacing(23.375),
      showLinkIcon: true,
    },
  ];

  const reinvestmentData = network
    ? Registry.getAnalyticsRegistry().getVaultReinvestments(network)
    : undefined;

  let result = [] as any[];

  if (
    vaultAddress &&
    reinvestmentData &&
    reinvestmentData[vaultAddress] &&
    network &&
    deposit
  ) {
    result = reinvestmentData[vaultAddress].map((data) => {
      const sharePrice = data?.vaultSharePrice
        ? TokenBalance.from(data.vaultSharePrice, deposit)
        : undefined;
      const amountSold = TokenBalance.fromID(
        data.rewardAmountSold,
        data?.rewardTokenSold.id,
        network
      );
      return {
        time: data.timestamp,
        amountSold: amountSold.toDisplayStringWithSymbol(),
        vaultSharePrice: sharePrice?.toFloat().toFixed(3),
        txnHash: {
          href: getEtherscanTransactionLink(data.transactionHash, network),
          hash: data.transactionHash,
        },
      };
    });
  }

  return {
    reinvestmentTableData: result || [],
    reinvestmentTableColumns: tableColumns,
  };
};
