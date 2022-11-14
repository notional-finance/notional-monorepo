import { Box, styled, SxProps, useTheme } from '@mui/material';
import { InfoTooltip, Button } from '@notional-finance/mui';
import { FormattedMessage, MessageDescriptor } from 'react-intl';
import { Label } from '../../types';

interface ActionRowButtonProps {
  heading?: MessageDescriptor;
  label: MessageDescriptor;
  tooltip?: MessageDescriptor;
  route: string;
  sx?: SxProps;
}

export const ActionRowButton = ({
  heading,
  label,
  route,
  tooltip,
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
      <ActionButton variant="contained" to={route}>
        <FormattedMessage {...label} />
      </ActionButton>
    </Box>
  );
};

const ActionButton = styled(Button)(
  ({ theme }) => `
  padding: ${theme.spacing(2.5)} ${theme.spacing(8)};
  @media (max-width: ${theme.breakpoints.values.lg}px) {
    padding: ${theme.spacing(2.5)};
  }
`
);
