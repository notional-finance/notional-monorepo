import { Box, useTheme } from '@mui/material';
import { TableCell, LargeTableCell } from '../../typography/typography';
import { ProgressIndicator } from '../../progress-indicator/progress-indicator';

export const DisplayCell = (props): JSX.Element => {
  const theme = useTheme();
  const { column, getValue, row } = props.cell;
  const value = getValue();
  const FirstValue = column.columnDef?.expandableTable
    ? LargeTableCell
    : TableCell;
  const isPending =
    column.columnDef.showLoadingSpinner && row.original.isPending;
  const ToolTip = column.columnDef?.ToolTip;
  const toolTipData = row.original?.toolTipData;

  return (
    <TableCell
      sx={{
        display: 'flex',
        justifyContent: column.columnDef.textAlign,
        alignItems: 'center',
      }}
    >
      {isPending ? (
        <ProgressIndicator
          circleSize={16}
          sx={{
            display: 'flex',
            justifyContent: column.columnDef?.textAlign,
          }}
        />
      ) : value &&
        column.columnDef.displayFormatter &&
        parseFloat(value) !== 0 ? (
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
            {column.columnDef.showSymbol
              ? column.columnDef.displayFormatter(
                  parseFloat(value),
                  props.cell.row.original.symbol
                )
              : column.columnDef.displayFormatter(parseFloat(value))}
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
                  : !row.original.isDebt && column.columnDef.showGreenText
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
