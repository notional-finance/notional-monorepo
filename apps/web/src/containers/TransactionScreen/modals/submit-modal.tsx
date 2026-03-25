import { useEffect } from 'react';
import {
  useLendingRouterApproval,
  useTransactionApprovals,
} from '@notional-finance/trade';
import {
  useCurrentTradeContext,
  useVaultMetadata,
} from '@notional-finance/notionable-hooks';
import { useSubmitTxn } from '@notional-finance/notionable-hooks';
import { useWalletStore } from '@notional-finance/notionable-hooks';
import { useState } from 'react';
import { TransactionStatus } from '@notional-finance/util';
import { observer } from 'mobx-react-lite';
import { SingleApprovalModal } from './single-approval';
import { FormattedMessage } from 'react-intl';
import { MultiApprovalModal } from './multi-approval-modal';
import { PostApprovalSubmit } from './post-approval-submit';
import { SubmitTransaction } from './submit-transaction';
import { PopulatedTransaction } from 'ethers';

const useTriggerSubmit = (readyToBuild: boolean) => {
  const trade = useCurrentTradeContext();
  const submitTxn = useSubmitTxn();
  const tradeType = trade?.tradeType;
  const { setTransactionStatus, clearTransaction, userWallet } =
    useWalletStore();
  const [transactionError, setTransactionError] = useState<
    string | undefined
  >();
  const [populatedTransaction, setPopulatedTransaction] = useState<
    PopulatedTransaction | undefined
  >();

  useEffect(() => {
    if (readyToBuild) {
      clearTransaction();
      setTransactionStatus(TransactionStatus.BUILDING);

      trade
        ?.buildTransaction()
        .then(({ populatedTransaction, transactionError }) => {
          if (populatedTransaction) {
            setPopulatedTransaction(populatedTransaction);
            setTransactionStatus(TransactionStatus.BUILT);
          } else {
            setTransactionStatus(TransactionStatus.ERROR_BUILDING);
            setTransactionError(
              transactionError || 'Error building transaction'
            );
          }
        });
    }
  }, [readyToBuild, trade, clearTransaction, setTransactionStatus]);

  const submitTransaction =
    tradeType && populatedTransaction
      ? () => submitTxn(tradeType, populatedTransaction)
      : undefined;
  const clearTransactionStatus = () => {
    setPopulatedTransaction(undefined);
    setTransactionError(undefined);
    clearTransaction();
  };
  const isSignerConnected = userWallet && !userWallet.isReadOnlyAddress;

  return {
    submitTransaction,
    transactionError,
    clearTransactionStatus,
    isSignerConnected,
  };
};

enum ApprovalState {
  MULTI_APPROVAL,
  SINGLE_APPROVAL,
  TRANSACTION,
}

export const SubmitModal = observer(() => {
  const trade = useCurrentTradeContext();
  const lendingRouter = trade?.debt?.address;
  const depositToken = trade?.deposit;
  const v = useVaultMetadata(trade?.vaultAddress);
  const isYieldToken = v?.yieldToken.id === depositToken?.id;

  const { enableToken, tokenApprovalRequired, allowanceIncreaseRequired } =
    useTransactionApprovals(
      isYieldToken ? v?.vaultAddress : lendingRouter,
      trade?.depositBalance
    );
  const { routerApprovalRequired, approveRouter } =
    useLendingRouterApproval(lendingRouter);
  const [initialApprovalState, setInitialApprovalState] =
    useState<ApprovalState | null>(null);
  const isOpen = trade?.confirm ?? false;
  const {
    submitTransaction,
    transactionError,
    clearTransactionStatus,
    isSignerConnected,
  } = useTriggerSubmit(
    !routerApprovalRequired && !tokenApprovalRequired && isOpen
  );
  const onDismiss = () => {
    setInitialApprovalState(null);
    clearTransactionStatus();
    trade?.setConfirm(false);
  };

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
