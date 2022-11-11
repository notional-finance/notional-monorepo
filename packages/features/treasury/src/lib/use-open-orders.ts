import { formatBigNumberToDecimals } from '@notional-finance/helpers';
import { DateTimeCell, IconCell } from '@notional-finance/mui';
import { BigNumber } from 'ethers';
import { useObservableState } from 'observable-hooks';
import { openLimitOrders$ } from './treasury-manager';

export const useOpenOrderTable = () => {
  const openOrders = useObservableState(openLimitOrders$);
  const tableColumns = [
    {
      Header: 'Order ID',
      accessor: 'orderId',
      textAlign: 'left',
    },
    {
      Header: 'Token',
      accessor: 'symbol',
      Cell: IconCell,
      textAlign: 'left',
    },
    {
      Header: 'Expiration Time',
      Cell: DateTimeCell,
      accessor: 'expirationTime',
      textAlign: 'left',
    },
    {
      Header: 'Maker Amount',
      accessor: 'makerAmount',
      textAlign: 'right',
    },
    {
      Header: 'Taker Amount',
      accessor: 'takerAmount',
      textAlign: 'right',
    },
  ];

  const tableData =
    openOrders?.map((o, i) => {
      return {
        orderId: (i + 1).toString(),
        symbol: 'COMP',
        makerAmount: formatBigNumberToDecimals(
          BigNumber.from(o.makerAssetAmount),
          18,
          3
        ),
        takerAmount: formatBigNumberToDecimals(
          BigNumber.from(o.takerAssetAmount),
          18,
          3
        ),
        expirationTime: BigNumber.from(o.expirationTimeSeconds).toNumber(),
      };
    }) || [];

  return { tableData, tableColumns };
};
