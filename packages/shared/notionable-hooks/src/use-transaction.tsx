import { TransactionReceipt } from '@ethersproject/providers';
import { trackEvent } from '@notional-finance/helpers';
import { filterEmpty } from '@notional-finance/util';
import { PopulatedTransaction } from 'ethers';
import {
  useObservable,
  useSubscription,
  useObservableState,
} from 'observable-hooks';
import { useCallback, useEffect, useState } from 'react';
import { map, switchMap } from 'rxjs';
import { useNotionalContext } from './use-notional';
import { useLocation } from 'react-router';

export enum TransactionStatus {
  NONE = 'none',
  BUILT = 'built',
  ERROR_BUILDING = 'error-building',
  USER_REJECT = 'user-reject',
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  REVERT = 'revert',
}

function useSubmitTransaction() {
  const {
    globalState: { wallet, sentTransactions },
    updateNotional,
  } = useNotionalContext();
  const signer = wallet?.signer;
  const { pathname } = useLocation();

  const submitTransaction = useCallback(
    async (populatedTransaction: PopulatedTransaction) => {
      if (!signer) throw Error('Signer undefined');
      const tx = await signer.sendTransaction(populatedTransaction);
      trackEvent('CONFIRM_TXN', { url: pathname });

      const { hash } = tx;
      updateNotional({
        sentTransactions: Object.assign(sentTransactions, {
          [hash]: tx,
        }),
      });

      return hash;
    },
    [updateNotional, signer, sentTransactions, pathname]
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

  const updateTxn = (r: TransactionReceipt) => {
    // Removes the completed transaction hash
    const { [r.transactionHash]: _, ...newSentTransactions } = sentTransactions;
    // Updates the global state with the new transaction hash
    updateNotional({
      sentTransactions: newSentTransactions,
      completedTransactions: Object.assign(completedTransactions, {
        [r.transactionHash]: r,
      }),
    });
  };

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
  const complete$ = useObservable(
    (i$) =>
      i$.pipe(
        map(([c, h]) => (h ? c[h] : undefined)),
        filterEmpty()
      ),
    [completedTransactions, hash]
  );
  const transactionReceipt = useObservableState(complete$);

  return { transactionReceipt, reverted: transactionReceipt?.status === 0 };
}

export function useTransactionStatus() {
  const [transactionStatus, setTransactionStatus] = useState<TransactionStatus>(
    TransactionStatus.NONE
  );
  const [transactionHash, setTransactionHash] = useState<string | undefined>();
  const { transactionReceipt, reverted } =
    usePendingTransaction(transactionHash);
  const { isReadOnlyAddress, submitTransaction } = useSubmitTransaction();

  useEffect(() => {
    if (reverted) setTransactionHash(TransactionStatus.REVERT);
    else if (transactionReceipt)
      setTransactionStatus(TransactionStatus.CONFIRMED);
  }, [transactionReceipt, reverted]);

  const onSubmit = useCallback(
    (populatedTransaction?: PopulatedTransaction) => {
      if (populatedTransaction) {
        submitTransaction(populatedTransaction)
          .then((hash) => {
            setTransactionStatus(TransactionStatus.PENDING);
            setTransactionHash(hash);
          })
          .catch(() => {
            // If we see an error here it is most likely due to user rejection
            setTransactionStatus(TransactionStatus.USER_REJECT);
          });
      }
    },
    [submitTransaction]
  );

  return {
    isReadOnlyAddress,
    transactionStatus,
    transactionHash,
    onSubmit,
  };
}
