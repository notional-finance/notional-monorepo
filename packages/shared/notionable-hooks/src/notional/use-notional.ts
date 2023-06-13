import { TypedBigNumber } from '@notional-finance/sdk';
import {
  useObservable,
  useObservableState,
  useSubscription,
} from 'observable-hooks';
import {
  initializeNotional,
  initialNotionalState,
  notionalState$,
  chains,
} from '@notional-finance/notionable';
import { useCallback, useContext } from 'react';
import { NotionalContext } from './NotionalContext';
import { switchMap, startWith, map } from 'rxjs';
import { PopulatedTransaction } from 'ethers';
import { trackEvent } from '@notional-finance/helpers';
import { filterEmpty } from '@notional-finance/util';
import { TransactionReceipt } from '@ethersproject/providers';

export function useNotional() {
  const { notional, loaded, connectedChain, pendingChainId } =
    useObservableState(notionalState$, initialNotionalState);

  function getConnectedChain() {
    return chains.find((chain) => parseInt(chain.id) === connectedChain);
  }

  return {
    notional,
    system: notional?.system ?? null,
    connectedChain,
    loaded,
    pendingChainId,
    initializeNotional,
    getConnectedChain,
  };
}

export function useLastUpdateBlockNumber() {
  const { system } = useNotional();
  return system?.lastUpdateBlockNumber;
}

export function useCurrentETHPrice() {
  const { system } = useNotional();
  return system
    ? `$${TypedBigNumber.fromBalance(1e8, 'ETH', true)
        .toCUR('USD')
        .toDisplayString(2)}`
    : undefined;
}

export function useNotionalContext() {
  const { state, state$, updateState } = useContext(NotionalContext);

  // Ensures that listeners receive the initial global state
  const globalState$ = useObservable(
    (o$) => o$.pipe(switchMap(([g]) => g.pipe(startWith(state)))),
    [state$]
  );

  return { globalState: state, updateNotional: updateState, globalState$ };
}

export function useSelectedNetwork() {
  const {
    globalState: { selectedNetwork, isNetworkReady },
  } = useNotionalContext();

  return isNetworkReady ? selectedNetwork : undefined;
}

export function useSubmitTransaction() {
  const {
    globalState: { wallet, sentTransactions },
    updateNotional,
  } = useNotionalContext();
  const signer = wallet?.signer;

  const submitTransaction = useCallback(
    async (populatedTransaction: PopulatedTransaction, path: string) => {
      if (!signer) throw Error('Signer undefined');
      const tx = await signer.sendTransaction(populatedTransaction);
      trackEvent('CONFIRM_TXN', { url: path });

      const { hash } = tx;
      updateNotional({
        sentTransactions: Object.assign(sentTransactions, {
          [hash]: tx,
        }),
      });

      return hash;
    },
    [updateNotional, signer, sentTransactions]
  );

  return {
    isReadOnlyAddress: wallet?.isReadOnlyAddress,
    submitTransaction,
  };
}

export function usePendingTransaction(hash?: string) {
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
