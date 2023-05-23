import { Box, SxProps, useTheme } from '@mui/material';
import { InfoTooltip, Button } from '@notional-finance/mui';
import { FormattedMessage, MessageDescriptor } from 'react-intl';
import { Label } from '../../types';

interface ActionRowButtonProps {
  heading?: MessageDescriptor;
  label: MessageDescriptor;
  tooltip?: MessageDescriptor;
  route?: string;
  callBack?: () => void;
  sx?: SxProps;
}

export const ActionRowButton = ({
  heading,
  label,
  route,
  tooltip,
  callBack,
  sx,
}: ActionRowButtonProps) => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        marginBottom: theme.spacing(2.5),
        marginLeft: theme.spacing(2),
        ...sx,
      }}
    >
      <Label>
        <FormattedMessage {...(heading || label)} />
        {tooltip && (
          <InfoTooltip toolTipText={tooltip} sx={{ marginLeft: '10px' }} />
        )}
      </Label>
      {route && (
        <Button variant="contained" to={route} size="large">
          <FormattedMessage {...label} />
        </Button>
      )}
      {callBack && (
        <Button variant="contained" onClick={callBack} size="large">
          <FormattedMessage {...label} />
        </Button>
      )}
    </Box>
  );
};
