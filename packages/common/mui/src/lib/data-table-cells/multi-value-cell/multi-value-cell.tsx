import { Box, useTheme } from '@mui/material';
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
        value.data.map(
          ({ displayValue, isNegative, showPositiveAsGreen }, index) => (
            <Box key={`${column.id}-${row.id}-${index}`}>
              {index === 0 && (
                <Box>
                  <FirstValue
                    error={isNegative && !row.original.isDebt}
                    sx={{
                      marginBottom: '0px',
                      width: '100%',
                      fontWeight: row.original.currency === 'Total' ? 600 : 500,
                      color: showPositiveAsGreen && theme.palette.primary.main,
                    }}
                  >
                    {displayValue}
                  </FirstValue>
                </Box>
              )}
              {index === 1 && (
                <Box>
                  <SecondValue
                    sx={{
                      color:
                        isNegative && !row.original.isDebt
                          ? theme.palette.error.main
                          : theme.palette.typography.light,
                      width: '100%',
                    }}
                  >
                    {displayValue}
                  </SecondValue>
                </Box>
              )}
            </Box>
          )
        )
      ) : (
        value
      )}
    </Box>
  );
};

export default MultiValueCell;
