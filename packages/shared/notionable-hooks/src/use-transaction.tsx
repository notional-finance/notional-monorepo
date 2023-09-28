import { TransactionReceipt } from '@ethersproject/providers';
import { trackEvent } from '@notional-finance/helpers';
import { filterEmpty, logError } from '@notional-finance/util';
import { PopulatedTransaction } from 'ethers';
import { useObservable, useSubscription } from 'observable-hooks';
import { useCallback, useEffect, useState } from 'react';
import { map, switchMap } from 'rxjs';
import { useNotionalContext, useSelectedNetwork } from './use-notional';
import { useLocation } from 'react-router';
import { Registry, TokenDefinition } from '@notional-finance/core-entities';
import { useAccountDefinition } from './use-account';

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
    globalState: { wallet, sentTransactions, awaitingBalanceChanges },
    updateNotional,
  } = useNotionalContext();
  const signer = wallet?.signer;
  const { pathname } = useLocation();

  const submitTransaction = useCallback(
    async (
      populatedTransaction: PopulatedTransaction,
      tokens?: TokenDefinition[]
    ) => {
      if (!signer) throw Error('Signer undefined');
      const tx = await signer.sendTransaction(populatedTransaction);
      trackEvent('CONFIRM_TXN', { url: pathname });

      const { hash } = tx;
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
    [updateNotional, signer, sentTransactions, pathname, awaitingBalanceChanges]
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
    globalState: { completedTransactions, awaitingBalanceChanges },
  } = useNotionalContext();
  const { account } = useAccountDefinition();

  const latestProcessedTxnBlock = Math.max(
    ...(account?.accountHistory?.map(({ blockNumber }) => blockNumber) || [0])
  );
  const pendingTokens = Object.entries(completedTransactions).flatMap(
    ([hash, tr]) =>
      tr.blockNumber > latestProcessedTxnBlock
        ? awaitingBalanceChanges[hash]
        : []
  );
  const pendingTxns = Object.entries(completedTransactions)
    .map(([hash, tr]) =>
      tr.blockNumber > latestProcessedTxnBlock ? hash : undefined
    )
    .filter((h) => !!h) as string[];

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
      populatedTransaction?: PopulatedTransaction,
      tokens?: TokenDefinition[]
    ) => {
      if (populatedTransaction) {
        setTransactionStatus(TransactionStatus.WAIT_USER_CONFIRM);
        submitTransaction(populatedTransaction, tokens)
          .then((hash) => {
            setTransactionStatus(TransactionStatus.SUBMITTED);
            setTransactionHash(hash);
          })
          .catch((e) => {
            logError(e, 'use-transaction', 'onSubmit');
            // If we see an error here it is most likely due to user rejection
            trackEvent('REJECT_TXN', { url: pathname });
            setTransactionStatus(TransactionStatus.NONE);
          });
      }
    },
    [submitTransaction, pathname]
  );

  return {
    isReadOnlyAddress,
    transactionStatus,
    transactionHash,
    onSubmit,
  };
}
