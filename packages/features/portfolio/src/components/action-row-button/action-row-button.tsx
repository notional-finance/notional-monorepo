import { Box, SxProps } from '@mui/material';
import { InfoTooltip, Button, Label } from '@notional-finance/mui';
import { FormattedMessage, MessageDescriptor } from 'react-intl';

interface ActionRowButtonProps {
  heading?: MessageDescriptor;
  label: MessageDescriptor;
  tooltip?: MessageDescriptor;
  route?: string;
  variant?: 'contained' | 'outlined' | 'text';
  callBack?: () => void;
  size?: 'small' | 'medium' | 'large';
  sx?: SxProps;
}

export const ActionRowButton = ({
  heading,
  label,
  route,
  tooltip,
  callBack,
  variant = 'contained',
  size = 'large',
  sx,
}: ActionRowButtonProps) => {
  return (
    <Box
      sx={{
        ...sx,
      }}
    >
      {heading || tooltip ? (
        <Label>
          {heading && <FormattedMessage {...heading} />}
          {tooltip && (
            <InfoTooltip toolTipText={tooltip} sx={{ marginLeft: '10px' }} />
          )}
        </Label>
      ) : (
        ''
      )}
      {route && (
        <Button variant={variant} to={route} size={size}>
          <FormattedMessage {...label} />
        </Button>
      )}
      {callBack && (
        <Button variant={variant} onClick={callBack} size={size}>
          <FormattedMessage {...label} />
        </Button>
      )}
    </Box>
  );
};
