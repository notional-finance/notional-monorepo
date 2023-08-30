import { Box } from '@mui/material';
import { TableCell, LargeTableCell } from '../../typography/typography';
import { colors } from '@notional-finance/styles';

export const DisplayCell = ({ cell }): JSX.Element => {
  const { column, value } = cell;
  const FirstValue = column?.expandableTable ? LargeTableCell : TableCell;
  return (
    <TableCell>
      {value && column.displayFormatter && parseFloat(value) !== 0 ? (
        <Box sx={{ h4: { color: parseFloat(value) < 0 ? colors.red : '' } }}>
          <FirstValue
            sx={{
              marginBottom: '0px',
              color:
                parseFloat(value) < 0 || value.toString().includes('-')
                  ? colors.red
                  : '',
            }}
          >
            {column.displayFormatter(parseFloat(value))}
          </FirstValue>
        </Box>
      ) : parseFloat(value) === 0 ? (
        '-'
      ) : (
        <Box
          sx={{
            h4: {
              color:
                parseFloat(value) < 0 || value.toString().includes('-')
                  ? colors.red
                  : '',
            },
          }}
        >
          <FirstValue
            sx={{
              marginBottom: '0px',
              color:
                parseFloat(value) < 0 || value.toString().includes('-')
                  ? colors.red
                  : '',
            }}
          >
            {value}
          </FirstValue>
        </Box>
      )}
    </TableCell>
  );
};

export default DisplayCell;
