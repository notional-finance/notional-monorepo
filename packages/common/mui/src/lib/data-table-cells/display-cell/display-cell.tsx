import { Box, useTheme } from '@mui/material';
import { TableCell, LargeTableCell } from '../../typography/typography';
import { ProgressIndicator } from '../../progress-indicator/progress-indicator';

export const DisplayCell = ({ cell }): JSX.Element => {
  const theme = useTheme();
  const { column, value, row } = cell;
  const FirstValue = column?.expandableTable ? LargeTableCell : TableCell;
  const isPending = column.showLoadingSpinner && row.original.isPending;
  const ToolTip = column?.ToolTip;
  const toolTipData = row.original?.toolTipData;

  return (
    <TableCell
      sx={{
        display: 'flex',
        justifyContent: column.textAlign,
        alignItems: 'center',
      }}
    >
      {isPending ? (
        <ProgressIndicator
          circleSize={16}
          sx={{
            display: 'flex',
            justifyContent: column?.textAlign,
          }}
        />
      ) : value && column.displayFormatter && parseFloat(value) !== 0 ? (
        <Box
          sx={{
            h4: {
              color:
                parseFloat(value) < 0 && !row.original.isDebt
                  ? theme.palette.error.main
                  : '',
            },
          }}
        >
          <FirstValue
            sx={{
              marginBottom: '0px',
              color:
                parseFloat(value) < 0 ||
                (value.toString().includes('-') && !row.original.isDebt)
                  ? theme.palette.error.main
                  : '',
            }}
          >
            {column.showSymbol
              ? column.displayFormatter(
                  parseFloat(value),
                  cell.row.original.symbol
                )
              : column.displayFormatter(parseFloat(value))}
          </FirstValue>
        </Box>
      ) : parseFloat(value) === 0 ? (
        '-'
      ) : (
        <Box
          sx={{
            h4: {
              color:
                (parseFloat(value) < 0 || value.toString().includes('-')) &&
                !row.original.isDebt
                  ? theme.palette.error.main
                  : '',
            },
          }}
        >
          <FirstValue
            sx={{
              marginBottom: '0px',
              color:
                (parseFloat(value) < 0 || value.toString().includes('-')) &&
                !row.original.isDebt
                  ? theme.palette.error.main
                  : !row.original.isDebt && column.showGreenText
                  ? theme.palette.primary.main
                  : theme.palette.typography.main,
            }}
          >
            {value}
          </FirstValue>
        </Box>
      )}
      {toolTipData && ToolTip && !isPending && (
        <ToolTip toolTipData={toolTipData} />
      )}
    </TableCell>
  );
};

export default DisplayCell;
