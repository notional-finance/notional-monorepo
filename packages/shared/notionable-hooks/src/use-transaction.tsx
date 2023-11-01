import { TransactionReceipt } from '@ethersproject/providers';
import { trackEvent } from '@notional-finance/helpers';
import { filterEmpty, logError, TRACKING_EVENTS } from '@notional-finance/util';
import { PopulatedTransaction } from 'ethers';
import { useObservable, useSubscription } from 'observable-hooks';
import { useCallback, useEffect, useState } from 'react';
import { map, switchMap } from 'rxjs';
import { useNotionalContext, useSelectedNetwork } from './use-notional';
import { useLocation } from 'react-router';
import { Registry, TokenDefinition } from '@notional-finance/core-entities';

export enum TransactionStatus {
  NONE = 'none',
  BUILT = 'built',
  ERROR_BUILDING = 'error-building',
  WAIT_USER_CONFIRM = 'wait-user-confirm',
  SUBMITTED = 'submitted',
  CONFIRMED = 'confirmed',
  REVERT = 'revert',
}

function useSubmitTransaction() {
  const {
    globalState: {
      wallet,
      sentTransactions,
      awaitingBalanceChanges,
      selectedNetwork,
    },
    updateNotional,
  } = useNotionalContext();
  const signer = wallet?.signer;
  const { pathname } = useLocation();

  const submitTransaction = useCallback(
    async (
      transactionLabel: string,
      populatedTransaction: PopulatedTransaction,
      tokens?: TokenDefinition[]
    ) => {
      if (!signer) throw Error('Signer undefined');
      const tx = await signer.sendTransaction(populatedTransaction);
      const { hash } = tx;
      trackEvent(TRACKING_EVENTS.SUBMIT_TXN, {
        url: pathname,
        txnHash: hash,
        transactionLabel,
        selectedNetwork,
      });

      updateNotional({
        sentTransactions: Object.assign(sentTransactions, {
          [hash]: tx,
        }),
        awaitingBalanceChanges: Object.assign(awaitingBalanceChanges, {
          [hash]: tokens,
        }),
      });

      return hash;
    },
    [
      updateNotional,
      signer,
      sentTransactions,
      pathname,
      awaitingBalanceChanges,
      selectedNetwork,
    ]
  );

  return {
    isReadOnlyAddress: wallet?.isReadOnlyAddress,
    submitTransaction,
  };
}

function usePendingTransaction(hash?: string) {
  const {
    globalState: { sentTransactions, completedTransactions },
    updateNotional,
  } = useNotionalContext();

  // Creates an observable that waits for the transaction recept
  const wait$ = useObservable(
    (i$) =>
      i$.pipe(
        map(([sent, h]) => (h ? sent[h] : undefined)),
        filterEmpty(),
        switchMap((r) => r.wait())
      ),
    [sentTransactions, hash]
  );

  const updateTxn = useCallback(
    (r: TransactionReceipt) => {
      // Removes the completed transaction hash
      const { [r.transactionHash]: _, ...newSentTransactions } =
        sentTransactions;
      const newCompletedTransactions = Object.assign(completedTransactions, {
        [r.transactionHash]: r,
      });

      // Updates the global state with the new transaction hash
      updateNotional({
        sentTransactions: newSentTransactions,
        completedTransactions: newCompletedTransactions,
      });
    },
    [updateNotional, completedTransactions, sentTransactions]
  );

  // Updates the global state when the receipt completes
  useSubscription(
    wait$,
    (r) => {
      updateTxn(r);
    },
    // Handles an error if there is one
    ({ receipt, replacement }) => {
      if (replacement) {
        // TODO: need to handle replaced transactions
        console.log('REPLACED', replacement);
      } else {
        updateTxn(receipt);
      }
    }
  );

  // Returns the completed transaction receipt
  const transactionReceipt = hash ? completedTransactions[hash] : undefined;

  return { transactionReceipt, reverted: transactionReceipt?.status === 0 };
}

export function usePendingPnLCalculation() {
  const {
    globalState: { pendingTokens, pendingTxns },
  } = useNotionalContext();
  return { pendingTokens, pendingTxns };
}

export function useTransactionStatus() {
  const network = useSelectedNetwork();
  const [transactionStatus, setTransactionStatus] = useState<TransactionStatus>(
    TransactionStatus.NONE
  );
  const [transactionHash, setTransactionHash] = useState<string | undefined>();
  const { transactionReceipt, reverted } =
    usePendingTransaction(transactionHash);
  const { isReadOnlyAddress, submitTransaction } = useSubmitTransaction();
  const { pathname } = useLocation();

  useEffect(() => {
    if (reverted) setTransactionHash(TransactionStatus.REVERT);
    else if (transactionReceipt) {
      setTransactionStatus(TransactionStatus.CONFIRMED);
      if (network) Registry.getAccountRegistry().refreshActiveAccount(network);
    }
  }, [transactionReceipt, reverted, network]);

  const onSubmit = useCallback(
    (
      transactionLabel: string,
      populatedTransaction?: PopulatedTransaction,
      tokens?: TokenDefinition[]
    ) => {
      if (populatedTransaction) {
        setTransactionStatus(TransactionStatus.WAIT_USER_CONFIRM);
        submitTransaction(transactionLabel, populatedTransaction, tokens)
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
    [submitTransaction, pathname, network]
  );

  return {
    isReadOnlyAddress,
    transactionStatus,
    transactionHash,
    onSubmit,
  };
}
