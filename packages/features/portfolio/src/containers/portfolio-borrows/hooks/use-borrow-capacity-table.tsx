import { useBorrowCapacity } from '@notional-finance/notionable-hooks';
import { IconCell, MultiValueCell, SliderCell } from '@notional-finance/mui';
import {
  formatCryptoWithFiat,
  formatNumberAsPercent,
} from '@notional-finance/helpers';
import { FormattedMessage } from 'react-intl';

export const useBorrowCapacityTable = () => {
  const borrowCapacity = useBorrowCapacity();

  const tableColumns: Record<string, any>[] = [
    {
      Header: (
        <FormattedMessage
          defaultMessage="Currency"
          description={'Currency header'}
        />
      ),
      Cell: IconCell,
      accessor: 'currency',
      textAlign: 'left',
    },
    {
      Header: (
        <FormattedMessage
          defaultMessage="Capacity Used"
          description={'Capacity Used header'}
        />
      ),
      Cell: MultiValueCell,
      accessor: 'capacityUsed',
      textAlign: 'left',
    },
    {
      Header: (
        <FormattedMessage
          defaultMessage="Total Capacity"
          description={'Total Capacity header'}
        />
      ),
      Cell: MultiValueCell,
      accessor: 'totalCapacity',
      textAlign: 'left',
    },
    {
      Header: (
        <FormattedMessage
          defaultMessage="Percent Used"
          description={'Percent Used header'}
        />
      ),
      accessor: 'percentUsed',
      textAlign: 'left',
    },
    {
      Header: (
        <FormattedMessage
          defaultMessage="Borrow Capacity"
          description={'Borrow Capacity header'}
        />
      ),
      Cell: SliderCell,
      accessor: 'borrowCapacity',
      textAlign: 'left',
    },
  ];

  const tableData = borrowCapacity?.map((data) => {
    const usedBorrowCapacityPercent =
      (data.usedBorrowCapacity.toFloat() / data.totalBorrowCapacity.toFloat()) *
      100;
    return {
      currency: data.totalBorrowCapacity.symbol,
      capacityUsed: formatCryptoWithFiat(data.usedBorrowCapacity),
      totalCapacity: formatCryptoWithFiat(data.totalBorrowCapacity),
      percentUsed: formatNumberAsPercent(usedBorrowCapacityPercent),
      borrowCapacity: {
        value: usedBorrowCapacityPercent,
        hideThumb: true,
      },
    };
  });

  return { tableData, tableColumns };
};
