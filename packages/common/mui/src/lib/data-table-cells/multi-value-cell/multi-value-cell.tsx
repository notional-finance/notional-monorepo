import { Box, useTheme } from '@mui/material';
import { ProgressIndicator } from '../../progress-indicator/progress-indicator';
// import { ToolTipCell } from '../tooltip-cell/tooltip-cell';
import {
  TableCell,
  SmallTableCell,
  LargeTableCell,
} from '../../typography/typography';

export const MultiValueCell = ({ cell, row, column }): JSX.Element => {
  const theme = useTheme();
  const { getValue } = cell;
  const value = getValue();
  const FirstValue = column.columnDef?.expandableTable
    ? LargeTableCell
    : TableCell;
  const SecondValue = column.columnDef?.expandableTable
    ? TableCell
    : SmallTableCell;

  const isPending =
    column.columnDef.showLoadingSpinner && row.original.isPending;

  const isTotalRow =
    (row.original.isTotalRow || row.original.currency === 'Total') &&
    !row.original.isEarningsRow
      ? true
      : false;

  return (
    <Box className="multi-value-cell">
      {isPending ? (
        <ProgressIndicator
          circleSize={16}
          sx={{
            display: 'flex',
            justifyContent: column.columnDef?.textAlign,
          }}
        />
      ) : value?.data ? (
        value.data.map(
          ({ displayValue, isNegative, showPositiveAsGreen }, index) => (
            <Box
              key={`${column.columnDef.id}-${row.id}-${index}`}
              sx={{
                display: 'flex',
                justifyContent: column.columnDef?.textAlign,
              }}
            >
              {index === 0 && (
                <Box>
                  <FirstValue
                    error={isNegative && row.original.isDebt === false}
                    sx={{
                      marginBottom: '0px',
                      width: '100%',
                      fontWeight:
                        isTotalRow || row.original.isEarningsRow ? 600 : 500,
                      color:
                        isNegative && !row.original.isDebt
                          ? theme.palette.error.main
                          : showPositiveAsGreen && theme.palette.primary.main,
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
