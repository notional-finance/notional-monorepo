import CheckCircle from '@mui/icons-material/CheckCircle';
import { Box, CircularProgress, useTheme } from '@mui/material';
import { Label, LabelValue, Switch } from '@notional-finance/mui';
import { TransactionStatus } from '@notional-finance/notionable-hooks';
import { FormattedMessage } from 'react-intl';
import { useEnablePrimeBorrow } from './use-enable-prime-borrow';

export function EnablePrimeBorrow() {
  const theme = useTheme();
  const { transactionStatus, isPrimeBorrowAllowed, enablePrimeBorrow } =
    useEnablePrimeBorrow();

  const pending =
    transactionStatus !== TransactionStatus.NONE &&
    transactionStatus !== TransactionStatus.REVERT;

  // Only show the box if prime borrow is not allowed
  return !isPrimeBorrowAllowed ||
    transactionStatus !== TransactionStatus.NONE ? (
    <Box
      sx={{
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
        {isPrimeBorrowAllowed ? (
          <>
            <CheckCircle color="primary" sx={{ margin: theme.spacing(0, 1) }} />
            <LabelValue inline sx={{ color: theme.palette.typography.main }}>
              <FormattedMessage defaultMessage="Variable Borrow Enabled" />
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
                onChange={enablePrimeBorrow}
                sx={{ margin: theme.spacing(0, 1) }}
              />
            )}
            <LabelValue inline sx={{ color: theme.palette.typography.light }}>
              <FormattedMessage defaultMessage="Variable Borrow Disabled" />
            </LabelValue>
          </>
        )}
      </Box>
      <Label
        sx={{
          padding: theme.spacing(2, 0),
          color: theme.palette.typography.light,
        }}
      >
        <FormattedMessage
          defaultMessage="Borrowing variable must be enabled for this account on Notional."
          description="enable currency instructions"
        />
      </Label>
    </Box>
  ) : null;
}
