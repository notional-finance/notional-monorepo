import { trackEvent } from '@notional-finance/helpers';
import { logError, TRACKING_EVENTS, Network } from '@notional-finance/util';
import { PopulatedTransaction } from 'ethers';
import { useCallback, useEffect, useState } from 'react';
import { useNotionalContext } from './use-notional';
import { useLocation } from 'react-router';
import { Registry, TokenDefinition } from '@notional-finance/core-entities';
import { useWalletConnectedNetwork } from './use-wallet';

export enum TransactionStatus {
  NONE = 'none',
  BUILT = 'built',
  ERROR_BUILDING = 'error-building',
  WAIT_USER_CONFIRM = 'wait-user-confirm',
  SUBMITTED = 'submitted',
  CONFIRMED = 'confirmed',
  REVERT = 'revert',
  APPROVAL_PENDING = 'approval-pending',
}

function useSubmitTransaction() {
  const {
    globalState: { wallet, sentTransactions },
    updateNotional,
  } = useNotionalContext();
  const selectedNetwork = useWalletConnectedNetwork();
  const signer = wallet?.signer;
  const { pathname } = useLocation();

  const submitTransaction = useCallback(
    async (
      transactionLabel: string,
      populatedTransaction: PopulatedTransaction,
      tokens?: TokenDefinition[]
    ) => {
      if (!signer || !selectedNetwork) throw Error('Signer undefined');
      const tx = await signer.sendTransaction(populatedTransaction);
      const { hash } = tx;
      trackEvent(TRACKING_EVENTS.SUBMIT_TXN, {
        url: pathname,
        txnHash: hash,
        transactionLabel,
        selectedNetwork,
      });

      updateNotional({
        sentTransactions: [
          ...sentTransactions,
          { network: selectedNetwork, response: tx, tokens, hash },
        ],
      });

      return hash;
    },
    [updateNotional, signer, sentTransactions, pathname, selectedNetwork]
  );

  return {
    isReadOnlyAddress: wallet?.isReadOnlyAddress,
    submitTransaction,
  };
}

function usePendingTransaction(hash?: string) {
  const {
    globalState: { completedTransactions },
  } = useNotionalContext();

  // Returns the completed transaction receipt
  const transactionReceipt = hash ? completedTransactions[hash] : undefined;

  return { transactionReceipt, reverted: transactionReceipt?.status === 0 };
}

export function usePendingPnLCalculation(network: Network | undefined) {
  const {
    globalState: { pendingPnL },
  } = useNotionalContext();

  return network ? pendingPnL[network] : [];
}

export function useTransactionStatus(
  network: Network | undefined,
  onTxnConfirmed?: () => void
) {
  const walletNetwork = useWalletConnectedNetwork();
  const [transactionStatus, setTransactionStatus] = useState<TransactionStatus>(
    TransactionStatus.NONE
  );
  const [transactionHash, setTransactionHash] = useState<string | undefined>();
  const { transactionReceipt, reverted } =
    usePendingTransaction(transactionHash);
  const { isReadOnlyAddress, submitTransaction } = useSubmitTransaction();
  const { pathname } = useLocation();
  const isWalletConnectedToNetwork =
    !!network && !!walletNetwork && network === walletNetwork;

  useEffect(() => {
    if (reverted) setTransactionHash(TransactionStatus.REVERT);
    else if (transactionReceipt) {
      setTransactionStatus(TransactionStatus.CONFIRMED);
      if (network) Registry.getAccountRegistry().refreshActiveAccount(network);
      if (onTxnConfirmed) onTxnConfirmed();
    }
  }, [transactionReceipt, reverted, network, onTxnConfirmed]);

  const onSubmit = useCallback(
    (
      transactionLabel: string,
      populatedTransaction?: PopulatedTransaction,
      expectedTokenChanges?: TokenDefinition[]
    ) => {
      if (!isWalletConnectedToNetwork) {
        console.error('Wallet does not match expected network');
        return;
      }

      if (populatedTransaction) {
        setTransactionStatus(TransactionStatus.WAIT_USER_CONFIRM);
        submitTransaction(
          transactionLabel,
          populatedTransaction,
          expectedTokenChanges
        )
          .then((hash) => {
            setTransactionStatus(TransactionStatus.SUBMITTED);
            setTransactionHash(hash);
          })
          .catch((e) => {
            logError(e, 'use-transaction', 'onSubmit');
            // If we see an error here it is most likely due to user rejection
            trackEvent(TRACKING_EVENTS.REJECT_TXN, {
              url: pathname,
              transactionLabel,
              selectedNetwork: network,
            });
            setTransactionStatus(TransactionStatus.NONE);
          });
      }
    },
    [submitTransaction, pathname, network, isWalletConnectedToNetwork]
  );

  return {
    isWalletConnectedToNetwork,
    isReadOnlyAddress,
    transactionStatus,
    transactionHash,
    onSubmit,
  };
}
