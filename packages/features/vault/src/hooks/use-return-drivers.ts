import { BorderCell } from '@notional-finance/mui';
import { useIntl } from 'react-intl';
import { messages } from '../messages';

export const useReturnDrivers = () => {
  const intl = useIntl();

  return [
    {
      Header: intl.formatMessage(messages.summary.returnsDriversSource),
      accessor: 'source',
      textAlign: 'left',
      Cell: BorderCell,
      padding: '0px',
    },
    {
      Header: intl.formatMessage(messages.summary.returnsDrivers7dayAverage),
      accessor: 'shortAvg',
      textAlign: 'right',
      Cell: BorderCell,
      padding: '0px',
    },
    {
      Header: intl.formatMessage(messages.summary.returnsDrivers30dayAverage),
      accessor: 'longAvg',
      textAlign: 'right',
      Cell: BorderCell,
      padding: '0px',
    },
  ];
};
