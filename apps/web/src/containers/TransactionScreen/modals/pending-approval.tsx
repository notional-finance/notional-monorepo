import { CheckmarkIcon } from '@notional-finance/icons';
import { Button, ProgressIndicator } from '@notional-finance/mui';
import { TransactionModal } from './transaction-modal';
import { Box, useTheme } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { observer } from 'mobx-react-lite';

export const PendingApprovalModal = observer(
  ({
    isOpen = false,
    isPending,
    onDismiss,
  }: {
    isOpen: boolean;
    isPending: boolean;
    onDismiss: () => void;
  }) => {
    const theme = useTheme();

    const topIcon = isPending ? (
      <Box>
        <ProgressIndicator type="notional" width="75" />
      </Box>
    ) : (
      <CheckmarkIcon
        sx={{ fontSize: theme.spacing(5) }}
        fill={theme.palette.success.main}
      />
    );
    return (
      <TransactionModal
        isOpen={isOpen}
        onDismiss={onDismiss}
        topIcon={topIcon}
        title={
          isPending ? (
            <FormattedMessage defaultMessage="Approval Pending" />
          ) : (
            <FormattedMessage defaultMessage="Approvals Successful" />
          )
        }
        description={
          isPending ? (
            <FormattedMessage defaultMessage="Enabling a currency is required for Notional to access funds in your wallet. You will only have to do this once." />
          ) : (
            <FormattedMessage defaultMessage="All approvals are made and transaction is ready to execute. Click below to submit the transaction." />
          )
        }
      >
        <Button disabled={isPending} sx={{ width: '100%' }} size="large">
          Submit Transaction
        </Button>
      </TransactionModal>
    );
  }
);
