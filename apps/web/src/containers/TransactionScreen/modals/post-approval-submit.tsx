import { Button } from '@notional-finance/mui';
import { TransactionModal } from './transaction-modal';
import { FormattedMessage } from 'react-intl';
import { observer } from 'mobx-react-lite';
import { TransactionStatus } from '@notional-finance/util';

export const PostApprovalSubmit = observer(
  ({
    isOpen = false,
    onDismiss,
    onSubmit,
    transactionError,
  }: {
    isOpen: boolean;
    onDismiss: () => void;
    onSubmit: (() => void) | undefined;
    transactionError: string | undefined;
  }) => {
    return (
      <TransactionModal
        isOpen={isOpen}
        onDismiss={onDismiss}
        transactionStatus={
          transactionError
            ? TransactionStatus.ERROR_BUILDING
            : !onSubmit
            ? TransactionStatus.BUILDING
            : TransactionStatus.CONFIRMED
        }
        title={<FormattedMessage defaultMessage="Approvals Successful" />}
        description={
          transactionError ? (
            transactionError
          ) : (
            <FormattedMessage defaultMessage="All approvals are made and transaction is ready to execute. Click below to submit the transaction." />
          )
        }
      >
        {!transactionError && onSubmit && (
          <Button sx={{ width: '100%' }} size="large" onClick={onSubmit}>
            <FormattedMessage defaultMessage="Submit Transaction" />
          </Button>
        )}
      </TransactionModal>
    );
  }
);
