import { formatBigNumberToDecimals } from '@notional-finance/helpers';
import { IconCell } from '@notional-finance/mui';
import { useObservableState } from 'observable-hooks';
import { compReserveData$, reserveData$ } from './treasury-manager';

export const useTreasuryReservesTable = () => {
  const reserveData = useObservableState(reserveData$);
  const compReserveData = useObservableState(compReserveData$);

  const tableColumns = [
    {
      Header: 'Token',
      accessor: 'symbol',
      Cell: IconCell,
      textAlign: 'left',
    },
    {
      Header: 'Reserve Balance',
      accessor: 'reserveBalance',
      textAlign: 'right',
    },
    {
      Header: 'Reserve Buffer',
      accessor: 'reserveBuffer',
      textAlign: 'right',
    },
    {
      Header: 'Reserve Balance (cToken)',
      accessor: 'reserveBalanceCToken',
      textAlign: 'right',
    },
    {
      Header: 'Reserve Buffer (cToken)',
      accessor: 'reserveBufferCToken',
      textAlign: 'right',
    },
    {
      Header: 'Reserve Value (USD)',
      accessor: 'reserveBalanceUSD',
      textAlign: 'right',
    },
    {
      Header: 'Treasury Balance',
      accessor: 'treasuryBalance',
      textAlign: 'right',
    },
  ];

  const tableData =
    reserveData?.map((r) => {
      return {
        symbol: r.symbol,
        reserveBalance: r.reserveBalance?.toUnderlying().toDisplayString(),
        reserveBalanceCToken: r.reserveBalance?.toDisplayString(),
        reserveBuffer: r.reserveBuffer?.toUnderlying().toDisplayString(),
        reserveBufferCToken: r.reserveBuffer?.toDisplayString(),
        reserveBalanceUSD: r.reserveBalance
          ?.toInternalPrecision()
          .toUSD()
          .toDisplayString(),
        treasuryBalance: r.treasuryBalance?.toDisplayString(),
      };
    }) || [];

  if (compReserveData) {
    // TODO: this is a temporary hack until we properly integrate COMP into the sdk
    tableData.push({
      symbol: compReserveData.symbol,
      reserveBalance: formatBigNumberToDecimals(
        compReserveData.reserveBalance,
        18,
        3
      ),
      reserveBalanceCToken: '',
      reserveBuffer: formatBigNumberToDecimals(
        compReserveData.reserveBuffer,
        18,
        3
      ),
      reserveBufferCToken: '',
      reserveBalanceUSD: formatBigNumberToDecimals(
        compReserveData.reserveValueUSD,
        18,
        3
      ),
      treasuryBalance: formatBigNumberToDecimals(
        compReserveData.treasuryBalance,
        18,
        3
      ),
    });
  }

  return { tableData, tableColumns };
};
