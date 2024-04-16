import { Box, useTheme } from '@mui/material';
import { getDateString } from '@notional-finance/util';
import { FormattedTime } from 'react-intl';
import {
  SmallTableCell,
  TableCell,
  LargeTableCell,
} from '../../typography/typography';

export const DateTimeCell = ({ cell }): JSX.Element => {
  const theme = useTheme();
  const { column, getValue } = cell;
  const value = getValue();
  const dateValue = new Date(value * 1000);
  const FirstValue = column.columnDef?.expandableTable
    ? LargeTableCell
    : TableCell;
  const SecondValue = column.columnDef?.expandableTable
    ? TableCell
    : SmallTableCell;

  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        textAlign: column.columnDef?.textAlign || '',
      }}
    >
      <FirstValue sx={{ width: '100%', marginBottom: '0px' }}>
        {getDateString(value)}
      </FirstValue>
      <SecondValue
        sx={{ width: '100%', color: theme.palette.typography.light }}
      >
        <FormattedTime value={dateValue} timeZoneName="short" />
      </SecondValue>
    </Box>
  );
};

export default DateTimeCell;
