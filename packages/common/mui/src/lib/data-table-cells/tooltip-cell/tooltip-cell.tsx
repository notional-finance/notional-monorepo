import { TableCell } from '../../typography/typography';
import { InfoTooltip } from '../../info-tooltip/info-tooltip';
import { useTheme, Box } from '@mui/material';
import { FormattedMessage, MessageDescriptor } from 'react-intl';

export const ToolTipCell = ({ cell, row }): JSX.Element => {
  const theme = useTheme();
  const value = cell.getValue();

  const content = value?.text?.content
    ? (value.text.content as MessageDescriptor)
    : undefined;
  const toolTipContent = value?.text?.toolTipContent
    ? (value.text.toolTipContent as MessageDescriptor)
    : undefined;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
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
        {content ? <FormattedMessage {...content} /> : value}
      </TableCell>
      {toolTipContent && (
        <InfoTooltip
          iconColor={value.iconColor || theme.palette.typography.accent}
          iconSize={theme.spacing(2)}
          sx={{
            marginLeft: theme.spacing(1),
            fill: value.iconColor ? value.iconColor : '',
          }}
          toolTipText={toolTipContent}
        />
      )}
    </Box>
  );
};

export default ToolTipCell;
