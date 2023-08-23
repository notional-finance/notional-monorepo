import { Box, useTheme } from '@mui/material';
import { colors } from '@notional-finance/styles';
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
    <Box className="multi-value-cell">
      {value?.data
        ? value.data.map((displayValue, index) => (
            <Box key={`${column.id}-${row.id}-${index}`}>
              {index === 0 && (
                <Box>
                  <FirstValue
                    error={value.isNegative}
                    sx={{ marginBottom: '0px', width: '100%', fontWeight: 600 }}
                  >
                    {displayValue}
                  </FirstValue>
                </Box>
              )}
              {index === 1 && (
                <Box>
                  <SecondValue
                    sx={{
                      color: value.isNegative
                        ? colors.red
                        : theme.palette.typography.light,
                      width: '100%',
                    }}
                  >
                    {displayValue}
                  </SecondValue>
                </Box>
              )}
            </Box>
          ))
        : value}
    </Box>
  );
};

export default MultiValueCell;
