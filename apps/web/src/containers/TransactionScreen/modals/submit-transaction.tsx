import { useEffect } from 'react';
import { TransactionModal } from './transaction-modal';
import { Button } from '@notional-finance/mui';
import { TransactionStatus } from '@notional-finance/util';
import { PendingTransaction } from '@notional-finance/trade';
import {
  useSelectedNetwork,
  useWalletStore,
} from '@notional-finance/notionable-hooks';
import { observer } from 'mobx-react-lite';
import { FormattedMessage } from 'react-intl';

export const SubmitTransaction = observer(
  ({
    isOpen = false,
    onDismiss,
    submit,
    transactionError,
  }: {
    isOpen: boolean;
    onDismiss: () => void;
    submit: () => void;
    transactionError: string | undefined;
  }) => {
    const selectedNetwork = useSelectedNetwork();
    const { transactionStatus, transactionHash } = useWalletStore();

    useEffect(() => {
      // Opening the modal will trigger the submit function right away
      if (!transactionError && isOpen) {
        submit();
      }
    }, [transactionError, isOpen, submit]);

    return (
      <TransactionModal
        isOpen={isOpen}
        onDismiss={onDismiss}
        transactionStatus={transactionStatus || TransactionStatus.NONE}
        description={transactionError || ''}
      >
        {transactionHash && (
          <PendingTransaction
            hash={transactionHash}
            transactionStatus={transactionStatus}
            selectedNetwork={selectedNetwork}
          />
        )}
        {!transactionError && (
          <Button
            sx={{ width: '100%' }}
            size="large"
            to={`/portfolio/${selectedNetwork}`}
          >
            <FormattedMessage defaultMessage="View Portfolio" />
          </Button>
        )}
      </TransactionModal>
    );
  }
);
