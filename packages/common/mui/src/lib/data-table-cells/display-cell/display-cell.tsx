import { Box } from '@mui/material';
import { TableCell } from '../../typography/typography';
import { colors } from '@notional-finance/styles';

export const DisplayCell = ({ cell }): JSX.Element => {
  const { column, value } = cell;

  return (
    <TableCell>
      {value && column.displayFormatter && parseFloat(value) !== 0 ? (
        <Box sx={{ color: parseFloat(value) < 0 ? colors.red : '' }}>
          {column.displayFormatter(parseFloat(value))}
        </Box>
      ) : parseFloat(value) === 0 ? (
        '-'
      ) : (
        <Box sx={{ color: parseFloat(value) < 0 ? colors.red : '' }}>
          {value}
        </Box>
      )}
    </TableCell>
  );
};

export default DisplayCell;
