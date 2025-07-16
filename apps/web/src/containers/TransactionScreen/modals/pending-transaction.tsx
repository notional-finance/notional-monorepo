import { CheckmarkIcon, InfoIcon } from '@notional-finance/icons';
import { ProgressIndicator } from '@notional-finance/mui';
import { TransactionModal } from './transaction-modal';
import { useTheme, Box } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { observer } from 'mobx-react-lite';
import { PendingTransaction } from '@notional-finance/trade';
import { Network, TransactionStatus } from '@notional-finance/util';

export const PendingTransactionModal = observer(
  ({
    isOpen = false,
    errorMsg,
    onDismiss,
    hash,
    transactionStatus,
    selectedNetwork,
  }: {
    isOpen: boolean;
    errorMsg?: React.ReactNode;
    onDismiss: () => void;
    hash: string;
    transactionStatus: TransactionStatus;
    selectedNetwork: Network;
  }) => {
    const theme = useTheme();
    const isPending =
      transactionStatus === TransactionStatus.WAIT_USER_CONFIRM ||
      transactionStatus === TransactionStatus.SUBMITTED;

    const topIcon = errorMsg ? (
      <InfoIcon
        sx={{ fontSize: theme.spacing(5) }}
        fill={theme.palette.error.main}
      />
    ) : isPending ? (
      <ProgressIndicator type="notional" width="75" />
    ) : (
      <CheckmarkIcon sx={{ fontSize: theme.spacing(5) }} />
    );
    return (
      <TransactionModal
        isOpen={isOpen}
        onDismiss={onDismiss}
        topIcon={topIcon}
        title={
          errorMsg ? (
            <FormattedMessage defaultMessage="Transaction Failed" />
          ) : isPending ? (
            <FormattedMessage defaultMessage="Transaction Pending" />
          ) : (
            <FormattedMessage defaultMessage="Transaction Successful" />
          )
        }
        description={
          errorMsg ? (
            errorMsg
          ) : isPending ? (
            <FormattedMessage defaultMessage="You will be notified when your transaction is complete." />
          ) : (
            <Box></Box>
          )
        }
      >
        <PendingTransaction
          hash={hash}
          transactionStatus={transactionStatus}
          selectedNetwork={selectedNetwork}
        />
      </TransactionModal>
    );
  }
);
