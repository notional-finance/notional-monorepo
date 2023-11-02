import { Box, useTheme } from '@mui/material';
import { colors } from '@notional-finance/styles';
import { ProgressIndicator } from '../../progress-indicator/progress-indicator';
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

  const isPending = column.showLoadingSpinner && row.original.isPending;

  return (
    <Box className="multi-value-cell">
      {isPending ? (
        <ProgressIndicator
          circleSize={16}
          sx={{
            display: 'flex',
            justifyContent: column?.textAlign,
          }}
        />
      ) : value?.data ? (
        value.data.map(({ displayValue, isNegative }, index) => (
          <Box key={`${column.id}-${row.id}-${index}`}>
            {index === 0 && (
              <Box>
                <FirstValue
                  error={isNegative}
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
                    color: isNegative
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
      ) : (
        value
      )}
    </Box>
  );
};

export default MultiValueCell;
