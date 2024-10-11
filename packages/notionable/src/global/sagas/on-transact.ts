import {
  Observable,
  distinctUntilChanged,
  filter,
  merge,
  race,
  switchMap,
  throttleTime,
} from 'rxjs';
import { GlobalState } from '../global-state';
import {
  SupportedNetworks,
  getEtherscanTransactionLink,
} from '@notional-finance/util';

export function onTransact(global$: Observable<GlobalState>) {
  return merge(onSentTransaction$(global$), onPendingTransaction$(global$));
}

/**
 * On a new sentTransaction =>
 *    wait for the transaction to confirm
 *    put it in the completed transaction list
 *    resync the account on the given network
 *    update the pending pnl calculation list
 */
function onSentTransaction$(global$: Observable<GlobalState>) {
  return global$.pipe(
    distinctUntilChanged((p, c) => {
      return p.sentTransactions.length === c.sentTransactions.length;
    }),
    filter((c) => c.sentTransactions.length > 0),
    switchMap(({ sentTransactions, completedTransactions, pendingPnL }) => {
      const listeners = sentTransactions.map(
        async ({ response, network, tokens }) => {
          const r = await response.wait();

          const newSentTransactions = sentTransactions.filter(
            (s) => s.hash !== r.transactionHash
          );
          const newCompletedTransactions = Object.assign(
            completedTransactions,
            {
              [r.transactionHash]: r,
            }
          );

          // Only set new pending tokens if tokens is defined, otherwise it is a token
          // approval or other non-token changing transaction
          const newPendingPnL = Object.assign(pendingPnL);
          if (tokens) {
            newPendingPnL[network].push({
              link: getEtherscanTransactionLink(r.transactionHash, network),
              hash: r.transactionHash,
              blockNumber: r.blockNumber,
              tokens,
            });
          }

          // Trigger an account refresh on a new transaction completion
          // triggerRefresh(network);

          return {
            sentTransactions: newSentTransactions,
            completedTransactions: newCompletedTransactions,
            pendingPnL: newPendingPnL,
          };
        }
      );

      // Returns on the first listener to emit, switchMap should see a new emit
      // coming in from the global state and switch to a new set of listeners
      return race(listeners);
    })
  );
}

/*
 * On pending pnl calculation list =>
 *    re-query the account history every 10 seconds
 *    clear the pending pnl calculation list when txn is found
 */
function onPendingTransaction$(global$: Observable<GlobalState>) {
  return global$.pipe(
    filter(
      ({ pendingPnL }) =>
        !!SupportedNetworks.find((n) => pendingPnL[n].length > 0)
    ),
    // TODO: try throttle time again here...
    throttleTime(10_000),
    // The audit time timer will start when the filter emits for the first time
    // and then throttle the values that are passed into the map function below.
    // throttleTime does not work because new observables are created on every
    // state emission
    // audit(({ pendingPnL }) => {
    //   if (
    //     Object.keys(awaitingBalanceChanges).filter(
    //       (t) => !pendingTxns.includes(t)
    //     ).length > 0
    //   ) {
    //     return interval(100);
    //   } else {
    //     // Without any new balance changes then only poll every 30 seconds until the pending
    //     // txns are cleared.
    //     return interval(30_000);
    //   }
    // }),
    switchMap(async ({ pendingPnL }) => {
      for (const n of SupportedNetworks) {
        if (pendingPnL[n].length === 0) continue;
        // const account = refreshBalanceHistory(n);
        // const latestProcessedTxnBlock = Math.max(
        //   ...(account?.accountHistory?.map(
        //     ({ blockNumber }) => blockNumber
        //   ) || [0])
        // );
        const latestProcessedTxnBlock = 0;

        // Filter out any pending txn later than the last processed block
        pendingPnL[n] = pendingPnL[n].filter(
          ({ blockNumber }) => latestProcessedTxnBlock < blockNumber
        );
      }

      return { pendingPnL };
    })
  );
}
