import { Registry } from '@notional-finance/core-entities';
import { Network, getEtherscanTransactionLink } from '@notional-finance/util';
import { TxnHashCell } from '@notional-finance/mui';

export const useVaultReinvestmentTable = (network: Network | undefined) => {
  const tableColumns = [
    {
      Header: 'Time',
      accessor: 'time',
      textAlign: 'left',
      width: '187px',
    },
    {
      Header: 'Amount Sold',
      accessor: 'amountSold',
      textAlign: 'right',
      width: '187px',
    },
    {
      Header: 'Vault Share Price',
      accessor: 'vaultSharePrice',
      textAlign: 'right',
      width: '187px',
    },
    {
      Header: 'Txn Hash',
      Cell: TxnHashCell,
      accessor: 'txnHash',
      textAlign: 'right',
      width: '187px',
      showLinkIcon: true,
    },
  ];

  const data = network
    ? Registry.getAnalyticsRegistry().getHistoricalTrading(network)
    : undefined;

  console.log({ data });
  let fuck = [] as any[];
  if (data) {
    const test = Object.values(data);
    test.map((j) => {
      const thing = j.filter(
        (k) => k.underlyingTokenBalance?.symbol === 'USDC'
      );
      if (thing && thing.length > 0) {
        fuck = [...fuck, ...thing];
      }
      return thing;
    });
  }

  let result = [] as any[];

  if (fuck.length > 0) {
    result = fuck.map((data) => {
      return {
        time: data.timestamp,
        amountSold: 0,
        vaultSharePrice: 0,
        txnHash: {
          href: getEtherscanTransactionLink(data.transactionHash, network),
          hash: data.transactionHash,
        },
      };
    });
  }

  return {
    reinvestmentTableData: result,
    reinvestmentTableColumns: tableColumns,
  };
};
