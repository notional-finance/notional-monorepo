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

  let parsedValue = 0;
  try {
    parsedValue = parseFloat(value);
  } catch {
    parsedValue = 0;
  }

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
      ) : value && column.columnDef.displayFormatter && parsedValue !== 0 ? (
        <Box
          sx={{
            h4: {
              color:
                parsedValue < 0 && !row.original.isDebt
                  ? theme.palette.error.main
                  : '',
            },
          }}
        >
          <FirstValue
            sx={{
              marginBottom: '0px',
              color:
                parsedValue < 0 ||
                (value?.toString().includes('-') && !row.original.isDebt)
                  ? theme.palette.error.main
                  : '',
            }}
          >
            {column.columnDef.showSymbol
              ? column.columnDef.displayFormatter(
                  parsedValue,
                  props.cell.row.original.symbol
                )
              : column.columnDef.displayFormatter(parsedValue)}
          </FirstValue>
        </Box>
      ) : parsedValue === 0 ? (
        '-'
      ) : (
        <Box
          sx={{
            h4: {
              color:
                (parsedValue < 0 || value?.toString().includes('-')) &&
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
                (parsedValue < 0 || value?.toString().includes('-')) &&
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
