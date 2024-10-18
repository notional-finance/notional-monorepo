import { Box, useTheme } from '@mui/material';
import {
  DataTableColumn,
  DisplayCell,
  IconCell,
  MultiValueIconCell,
} from '@notional-finance/mui';
import { colors } from '@notional-finance/styles';
import { formatNumberAsPercent } from '@notional-finance/util';
import { FormattedMessage } from 'react-intl';

export const useMyBreakdownTable = () => {
  const theme = useTheme();

  const AccentCell = ({ cell }) => {
    const { getValue } = cell;
    const value = getValue();
    return <Box sx={{ color: colors.neonTurquoise }}>{value}</Box>;
  };

  const tableColumns: DataTableColumn[] = [
    {
      header: <FormattedMessage defaultMessage="Asset" />,
      cell: MultiValueIconCell,
      accessorKey: 'asset',
      textAlign: 'left',
      expandableTable: true,
      width: theme.spacing(15.875),
    },
    {
      header: (
        <FormattedMessage defaultMessage="Boost" description={'Boost header'} />
      ),
      cell: IconCell,
      showCustomIcon: true,
      accessorKey: 'boost',
      textAlign: 'right',
      width: theme.spacing(15.875),
    },
    {
      header: (
        <FormattedMessage
          defaultMessage="Points Per Day"
          description={'Points Per Day header'}
        />
      ),
      accessorKey: 'pointsPerDay',
      textAlign: 'right',
      width: theme.spacing(15.875),
    },
    {
      header: (
        <FormattedMessage
          defaultMessage="Points APY"
          description={'Points APY header'}
        />
      ),
      displayFormatter: formatNumberAsPercent,
      cell: DisplayCell,
      accessorKey: 'pointsAPY',
      textAlign: 'right',
      enableSorting: true,
      sortingFn: 'basic',
      sortDescFirst: true,
      width: theme.spacing(14.5),
      marginRight: theme.spacing(1.25),
    },
    {
      header: (
        <FormattedMessage
          defaultMessage="Total Points"
          description={'Total Points header'}
        />
      ),
      cell: AccentCell,
      accessorKey: 'totalPoints',
      textAlign: 'right',
      width: theme.spacing(15.875),
    },
  ];

  return { tableColumns, tableData: [] };
};
