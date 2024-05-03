import { TableCell } from '../../typography/typography';
import { InfoTooltip } from '../../info-tooltip/info-tooltip';
import { useTheme, Box } from '@mui/material';
import { FormattedMessage } from 'react-intl';

export const ToolTipCell = ({ cell, row }): JSX.Element => {
  const theme = useTheme();
  const value = cell.getValue();

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }} id="TESTINGS TOOLTIP">
      <TableCell
        style={{
          lineHeight: 'normal',
          fontWeight:
            row.original.isTotalRow && !row.original.isEarningsRow ? 600 : 500,
          fontSize:
            row.original.isTotalRow && !row.original.isEarningsRow
              ? theme.spacing(1.75)
              : theme.spacing(1.5),
          whiteSpace: 'normal',
          color: row.original.isEarningsRow
            ? theme.palette.typography.light
            : theme.palette.typography.main,
        }}
      >
        {value.content ? <FormattedMessage {...value.content} /> : value}
      </TableCell>
      {value.toolTipContent && (
        <InfoTooltip
          iconColor={theme.palette.typography.accent}
          iconSize={theme.spacing(2)}
          sx={{ marginLeft: theme.spacing(1) }}
          toolTipText={value.toolTipContent}
        />
      )}
    </Box>
  );
};

export default ToolTipCell;
