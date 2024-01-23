import { TableCell } from '../../typography/typography';
import { InfoTooltip } from '../../info-tooltip/info-tooltip';
import { useTheme, Box } from '@mui/material';
import { FormattedMessage } from 'react-intl';

export const ToolTipCell = ({ cell }): JSX.Element => {
  const theme = useTheme();
  const { value } = cell;

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <TableCell
        style={{
          lineHeight: 'normal',
          fontWeight: 500,
          fontSize: '.750rem',
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
