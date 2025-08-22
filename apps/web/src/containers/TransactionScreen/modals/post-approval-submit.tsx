import { Button } from '@notional-finance/mui';
import { TransactionModal } from './transaction-modal';
import { FormattedMessage } from 'react-intl';
import { observer } from 'mobx-react-lite';
import { TransactionStatus } from '@notional-finance/util';

export const PendingApprovalModal = observer(
  ({
    isOpen = false,
    onDismiss,
    onSubmit,
  }: {
    isOpen: boolean;
    isPending: boolean;
    onDismiss: () => void;
    onSubmit: () => void;
  }) => {
    return (
      <TransactionModal
        isOpen={isOpen}
        onDismiss={onDismiss}
        transactionStatus={TransactionStatus.CONFIRMED}
        title={<FormattedMessage defaultMessage="Approvals Successful" />}
        description={
          <FormattedMessage defaultMessage="All approvals are made and transaction is ready to execute. Click below to submit the transaction." />
        }
      >
        <Button sx={{ width: '100%' }} size="large" onClick={onSubmit}>
          <FormattedMessage defaultMessage="Submit Transaction" />
        </Button>
      </TransactionModal>
    );
  }
);
