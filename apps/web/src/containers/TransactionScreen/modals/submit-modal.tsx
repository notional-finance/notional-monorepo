import {
  useLendingRouterApproval,
  useTransactionApprovals,
} from '@notional-finance/trade';
import { useCurrentTradeContext } from '@notional-finance/notionable-hooks';
import { useSubmitTxn } from '@notional-finance/notionable-hooks';
import { useWalletStore } from '@notional-finance/notionable-hooks';
import { useState } from 'react';
import { useCallback } from 'react';
import { TransactionStatus } from '@notional-finance/util';
import { observer } from 'mobx-react-lite';
import { SingleApprovalModal } from './single-approval';
import { FormattedMessage } from 'react-intl';
import { MultiApprovalModal } from './multi-approval-modal';
import { PostApprovalSubmit } from './post-approval-submit';
import { SubmitTransaction } from './submit-transaction';

const useTriggerSubmit = () => {
  const trade = useCurrentTradeContext();
  const submitTxn = useSubmitTxn();
  const tradeType = trade?.tradeType;
  const selectedNetwork = trade?.selectedNetwork;
  const { userWallet, setTransactionStatus } = useWalletStore();
  const [error, setTransactionError] = useState<string | undefined>();

  const submitTransaction = useCallback(() => {
    if (tradeType && selectedNetwork && userWallet) {
      trade
        .buildTransaction()
        .then(({ populatedTransaction, transactionError }) => {
          if (populatedTransaction) {
            submitTxn(tradeType, populatedTransaction);
          } else {
            setTransactionStatus(TransactionStatus.ERROR_BUILDING);
            setTransactionError(
              transactionError || 'Error building transaction'
            );
          }
        });
    }
  }, [tradeType, selectedNetwork, userWallet, trade, submitTxn]);

  return { submitTransaction, transactionError: error };
};

enum ApprovalState {
  MULTI_APPROVAL,
  SINGLE_APPROVAL,
  TRANSACTION,
}

export const SubmitModal = observer(() => {
  const trade = useCurrentTradeContext();
  const lendingRouter = trade?.debt?.address;
  const { userWallet, clearTransaction } = useWalletStore();
  const isSignerConnected = userWallet && !userWallet.isReadOnlyAddress;

  const { enableToken, tokenApprovalRequired, allowanceIncreaseRequired } =
    useTransactionApprovals(lendingRouter, trade?.depositBalance);
  const { routerApprovalRequired, approveRouter } =
    useLendingRouterApproval(lendingRouter);
  const [initialApprovalState, setInitialApprovalState] =
    useState<ApprovalState | null>(null);
  const isOpen = trade?.confirm ?? false;
  const onDismiss = () => {
    setInitialApprovalState(null);
    clearTransaction();
    trade?.setConfirm(false);
  };
  const { submitTransaction, transactionError } = useTriggerSubmit();

  // This marks the initial state of the approval process so we go back to the correct
  // screen when the pending approval modal completes.
  if (initialApprovalState === null && isOpen) {
    if (!isSignerConnected) {
      // Skip approvals if the user is not connected
      setInitialApprovalState(ApprovalState.TRANSACTION);
    } else if (tokenApprovalRequired && routerApprovalRequired) {
      setInitialApprovalState(ApprovalState.MULTI_APPROVAL);
    } else if (tokenApprovalRequired || routerApprovalRequired) {
      setInitialApprovalState(ApprovalState.SINGLE_APPROVAL);
    } else {
      setInitialApprovalState(ApprovalState.TRANSACTION);
    }
  }

  if (
    initialApprovalState === ApprovalState.MULTI_APPROVAL &&
    (tokenApprovalRequired || routerApprovalRequired)
  ) {
    return (
      <MultiApprovalModal
        isOpen={isOpen}
        onDismiss={onDismiss}
        tokenSymbol={trade?.deposit?.symbol}
        enableToken={
          tokenApprovalRequired ? () => enableToken(true) : undefined
        }
        approveRouter={
          routerApprovalRequired ? () => approveRouter(true) : undefined
        }
      />
    );
  } else if (initialApprovalState === ApprovalState.SINGLE_APPROVAL) {
    if (tokenApprovalRequired) {
      return (
        <SingleApprovalModal
          isOpen={isOpen}
          onDismiss={onDismiss}
          title={`${trade?.deposit?.symbol} Disabled`}
          approvalDescription={
            allowanceIncreaseRequired ? (
              <FormattedMessage defaultMessage="Notional has insufficient allowance for the specified deposit amount. Increase your allowance so that Notional can access your funds." />
            ) : (
              <FormattedMessage defaultMessage="Enabling a currency is required for Notional to access funds in your wallet." />
            )
          }
          actionButtonText={`Enable ${trade?.deposit?.symbol}`}
          submit={() => enableToken(true)}
        />
      );
    } else if (routerApprovalRequired) {
      return (
        <SingleApprovalModal
          isOpen={isOpen}
          onDismiss={onDismiss}
          title={`Morpho Disabled`}
          approvalDescription={
            <FormattedMessage defaultMessage="Notional requires approval to manage your positions on Morpho. You only need to do this once." />
          }
          actionButtonText={`Enable Morpho`}
          submit={() => approveRouter(true)}
        />
      );
    }
  }

  if (initialApprovalState === ApprovalState.TRANSACTION) {
    return (
      <SubmitTransaction
        isOpen={isOpen}
        onDismiss={onDismiss}
        submit={submitTransaction}
        transactionError={transactionError}
      />
    );
  } else {
    // The initial approval state was set and all the approvals are done, so we can show the
    // post approval submit modal.
    return (
      <PostApprovalSubmit
        isOpen={isOpen}
        onDismiss={onDismiss}
        onSubmit={submitTransaction}
        transactionError={transactionError}
      />
    );
  }
});
