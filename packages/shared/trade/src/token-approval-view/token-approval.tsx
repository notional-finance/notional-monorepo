import { Box, CircularProgress, useTheme } from '@mui/material';
import { TokenIcon } from '@notional-finance/icons';
import { FormattedMessage } from 'react-intl';
import CheckCircle from '@mui/icons-material/CheckCircle';
import { TransactionStatus } from '@notional-finance/notionable-hooks';
import { Label, LabelValue, Switch } from '@notional-finance/mui';

export interface TokenApprovalProps {
  symbol: string;
  transactionStatus: TransactionStatus;
  approved: boolean;
  sx?: Record<string, string>;
  onChange: () => void;
}

function TokenApproval({
  symbol,
  onChange,
  approved,
  transactionStatus,
  sx = {},
}: TokenApprovalProps) {
  const theme = useTheme();
  const pending =
    transactionStatus !== TransactionStatus.NONE &&
    transactionStatus !== TransactionStatus.REVERT;

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
        {approved ? (
          <>
            <CheckCircle color="primary" sx={{ margin: theme.spacing(0, 1) }} />
            <LabelValue inline sx={{ color: theme.palette.typography.main }}>
              <FormattedMessage defaultMessage="Enabled" />
            </LabelValue>
          </>
        ) : (
          <>
            {pending ? (
              <CircularProgress
                size={24}
                color="primary"
                sx={{ margin: theme.spacing(0, 1) }}
              />
            ) : (
              <Switch
                checked={false}
                onChange={onChange}
                sx={{ margin: theme.spacing(0, 1) }}
              />
            )}
            <LabelValue inline sx={{ color: theme.palette.typography.light }}>
              <FormattedMessage defaultMessage="Disabled" />
            </LabelValue>
          </>
        )}
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
