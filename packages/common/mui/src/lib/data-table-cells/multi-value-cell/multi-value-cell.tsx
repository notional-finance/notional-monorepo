import { Box, useTheme } from '@mui/material';
import {
  TableCell,
  SmallTableCell,
  LargeTableCell,
} from '../../typography/typography';

export const MultiValueCell = ({ cell }): JSX.Element => {
  const theme = useTheme();
  const { column, value, row } = cell;
  const FirstValue = column?.expandableTable ? LargeTableCell : TableCell;
  const SecondValue = column?.expandableTable ? TableCell : SmallTableCell;

  return (
    <Box>
      {value?.data
        ? value.data.map((displayValue, index) => (
            <Box key={`${column.id}-${row.id}-${index}`}>
              {index === 0 && (
                <FirstValue
                  error={value.isNegative}
                  sx={{ marginBottom: '0px' }}
                >
                  {displayValue}
                </FirstValue>
              )}
              {index === 1 && (
                <SecondValue sx={{ color: theme.palette.typography.light }}>
                  {displayValue}
                </SecondValue>
              )}
            </Box>
          ))
        : value}
    </Box>
  );
};

export default MultiValueCell;
