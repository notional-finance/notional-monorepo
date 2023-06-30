import { IconCell, MultiValueCell, SliderCell } from '@notional-finance/mui';
import { FormattedMessage } from 'react-intl';

export const useBorrowCapacityTable = () => {
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

  return { tableData: [], tableColumns };
};
