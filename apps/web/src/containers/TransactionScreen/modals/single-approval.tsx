import { TransactionModal } from './transaction-modal';
import { Button } from '@notional-finance/mui';
import { TransactionStatus } from '@notional-finance/util';
import { PendingTransaction } from '@notional-finance/trade';
import {
  useSelectedNetwork,
  useWalletStore,
} from '@notional-finance/notionable-hooks';

export const SingleApprovalModal = ({
  isOpen = false,
  onDismiss,
  title,
  approvalDescription,
  actionButtonText,
  submit,
}: {
  isOpen: boolean;
  onDismiss: () => void;
  title: React.ReactNode;
  approvalDescription: React.ReactNode;
  actionButtonText: React.ReactNode;
  submit: (enable: boolean) => void;
}) => {
  const selectedNetwork = useSelectedNetwork();
  const { transactionStatus, transactionHash } = useWalletStore();
  return (
    <TransactionModal
      isOpen={isOpen}
      onDismiss={onDismiss}
      transactionStatus={transactionStatus || TransactionStatus.NONE}
      title={title}
      description={approvalDescription}
    >
      {transactionHash ? (
        <PendingTransaction
          hash={transactionHash}
          transactionStatus={transactionStatus}
          selectedNetwork={selectedNetwork}
        />
      ) : (
        <Button
          sx={{ width: '100%' }}
          size="large"
          onClick={() => submit(true)}
        >
          {actionButtonText}
        </Button>
      )}
    </TransactionModal>
  );
};
