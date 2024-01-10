/*
import { Observable, combineLatest, merge } from 'rxjs';
import { GlobalState } from '../global-state';
import { selectedAccount } from '../selectors';
import { Registry } from '@notional-finance/core-entities';

export function onTransact(global$: Observable<GlobalState>) {
  return merge(onPendingPnL$(global$));
}

function onPendingPnL$(global$: Observable<GlobalState>) {
  return combineLatest([global$, selectedAccount(state$)]).pipe(
    filter(
      ([{ awaitingBalanceChanges }]) =>
        Object.keys(awaitingBalanceChanges).length > 0
    ),
    // The audit time timer will start when the filter emits for the first time
    // and then throttle the values that are passed into the map function below.
    // throttleTime does not work because new observables are created on every
    // state emission
    audit(([{ awaitingBalanceChanges, pendingTxns }]) => {
      if (
        Object.keys(awaitingBalanceChanges).filter(
          (t) => !pendingTxns.includes(t)
        ).length > 0
      ) {
        // If there is a new balance change then trigger an refresh almost immediately
        return interval(100);
      } else {
        // Without any new balance changes then only poll every 30 seconds until the pending
        // txns are cleared.
        return interval(30_000);
      }
    }),
    map(
      ([
        { completedTransactions, awaitingBalanceChanges, selectedNetwork },
        account,
      ]) => {
        const latestProcessedTxnBlock = Math.max(
          ...(account?.accountHistory?.map(
            ({ blockNumber }) => blockNumber
          ) || [0])
        );
        const completed = Object.entries(completedTransactions);
        const pendingTokens = completed.flatMap(([hash, tr]) =>
          tr.blockNumber > latestProcessedTxnBlock
            ? awaitingBalanceChanges[hash] || []
            : []
        );
        const pendingTxns = completed
          .map(([hash, tr]) =>
            tr.blockNumber > latestProcessedTxnBlock ? hash : undefined
          )
          .filter((h) => !!h) as string[];

        // This clears any balance changes that are being "awaited" if they are not
        // in the pending txn list
        const _awaitingBalanceChanges = Object.keys(
          awaitingBalanceChanges
        ).reduce((acc, hash) => {
          // If the transaction is still pending a calculation, include it in the awaiting list
          if (pendingTxns.includes(hash))
            return Object.assign(acc, { [hash]: awaitingBalanceChanges[hash] });
          // If the transaction is not found in the completed list, then also keep
          // it in the awaiting list
          if (!completed.find(([h]) => h === hash))
            return Object.assign(acc, { [hash]: awaitingBalanceChanges[hash] });
          return acc;
        }, {});

        if (pendingTxns.length > 0 && selectedNetwork) {
          Registry.getAccountRegistry().triggerRefreshPromise(selectedNetwork);
        }

        return {
          pendingTokens,
          pendingTxns,
          awaitingBalanceChanges: _awaitingBalanceChanges,
        };
      }
    )
  );
}
*/
