import { Box, useTheme } from '@mui/material';
import { getDateString } from '@notional-finance/utils';
import { FormattedTime } from 'react-intl';
import { DataTableColumn } from '../../data-table/data-table';
import { SmallTableCell, TableCell, LargeTableCell } from '../../typography/typography';

export interface DateTimeCellProps {
  cell: {
    value: number;
    column: DataTableColumn;
  };
}
export const DateTimeCell = ({ cell: { value, column } }: DateTimeCellProps): JSX.Element => {
  const theme = useTheme();
  const dateValue = new Date(value * 1000);
  const FirstValue = column?.expandableTable ? LargeTableCell : TableCell;
  const SecondValue = column?.expandableTable ? TableCell : SmallTableCell;

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
      <FirstValue sx={{ width: '100%', marginBottom: '0px' }}>{getDateString(value)}</FirstValue>
      <SecondValue sx={{ width: '100%', color: theme.palette.typography.light }}>
        <FormattedTime value={dateValue} timeZoneName="short" />
      </SecondValue>
    </Box>
  );
};

export default DateTimeCell;
