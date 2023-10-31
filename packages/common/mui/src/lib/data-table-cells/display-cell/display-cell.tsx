import { Box } from '@mui/material';
import { TableCell, LargeTableCell } from '../../typography/typography';
import { ProgressIndicator } from '../../progress-indicator/progress-indicator';
import { colors } from '@notional-finance/styles';

export const DisplayCell = ({ cell }): JSX.Element => {
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
      {toolTipData && ToolTip && !isPending && (
        <ToolTip toolTipData={toolTipData} />
      )}
    </TableCell>
  );
};

export default DisplayCell;
