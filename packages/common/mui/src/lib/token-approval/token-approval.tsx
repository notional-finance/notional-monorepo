import { Box, CircularProgress, useTheme } from '@mui/material';
import { TokenIcon } from '@notional-finance/icons';
import { FormattedMessage } from 'react-intl';
import Switch from '../switch/switch';
import CheckCircle from '@mui/icons-material/CheckCircle';
import { Label, LabelValue } from '../typography/typography';
import { TransactionStatus } from '@notional-finance/notionable-hooks';

export interface TokenApprovalProps {
  symbol: string;
  transactionStatus: TransactionStatus;
  approved: boolean;
  sx?: Record<string, string>;
  onChange: () => void;
}

export function TokenApproval({
  symbol,
  onChange,
  approved,
  transactionStatus,
  sx = {},
}: TokenApprovalProps) {
  const theme = useTheme();
  const pending =
    transactionStatus === TransactionStatus.WAIT_USER_CONFIRM ||
    transactionStatus === TransactionStatus.SUBMITTED;

  return (
    <Box
      sx={{
        ...sx,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: theme.palette.background.default,
        paddingTop: theme.spacing(2),
        paddingLeft: theme.spacing(2),
        paddingRight: theme.spacing(2),
        border: theme.shape.borderStandard,
        borderRadius: theme.shape.borderRadius(),
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <TokenIcon symbol={symbol} size="medium" />
        {!pending && !approved && (
          <Switch
            checked={approved}
            onChange={onChange}
            sx={{
              margin: theme.spacing(0, 1),
            }}
          />
        )}
        {pending && (
          <CircularProgress
            size={24}
            color="primary"
            sx={{
              margin: theme.spacing(0, 2),
            }}
          />
        )}
        {!pending && transactionStatus === TransactionStatus.CONFIRMED && (
          <CheckCircle
            color="primary"
            sx={{
              margin: theme.spacing(0, 2),
            }}
          />
        )}
        <LabelValue
          inline
          sx={{
            color: approved
              ? theme.palette.typography.main
              : theme.palette.typography.light,
          }}
        >
          {approved ? (
            <FormattedMessage defaultMessage="Enabled" />
          ) : (
            <FormattedMessage defaultMessage="Disabled" />
          )}
        </LabelValue>
      </Box>
      <Label
        sx={{
          padding: theme.spacing(2, 0),
          color: approved
            ? theme.palette.typography.main
            : theme.palette.typography.light,
        }}
      >
        <FormattedMessage
          defaultMessage="Enabling a currency is required for Notional to access funds in your wallet."
          description="enable currency instructions"
        />
      </Label>
    </Box>
  );
}

export default TokenApproval;
