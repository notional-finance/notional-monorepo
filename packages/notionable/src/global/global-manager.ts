import {
  filterEmpty,
  getProviderFromNetwork,
  Network,
  RATE_PRECISION,
} from '@notional-finance/util';
import {
  Observable,
  merge,
  pairwise,
  filter,
  switchMap,
  map,
  distinctUntilChanged,
  tap,
  from,
  of,
  combineLatest,
  audit,
  interval,
} from 'rxjs';
import { BETA_ACCESS, GlobalState } from './global-state';
import {
  disconnectAccount,
  onAccountPending,
  onNetworkPending,
  onSelectedNetworkChange,
} from './logic';
import { identify, trackEvent } from '@notional-finance/helpers';
import { Contract } from 'ethers';
import { Registry, TokenBalance } from '@notional-finance/core-entities';
import { selectedAccount } from './selectors';

const vpnCheck = 'https://detect.notional.finance/';
const dataURL = process.env['NX_DATA_URL'] || 'https://data.notional.finance';

export const loadGlobalManager = (
  state$: Observable<GlobalState>
): Observable<Partial<GlobalState>> => {
  const onSelectedNetworkChange$ = state$.pipe(
    pairwise(),
    filter(
      ([_, cur]) =>
        cur.selectedNetwork !== undefined && cur.isNetworkPending === false
    ),
    map(([prev, cur]) => {
      return onSelectedNetworkChange(
        cur.cacheHostname,
        cur.selectedNetwork as Network,
        prev.selectedNetwork
      );
    }),
    filterEmpty()
  );

  const onNetworkPending$ = state$.pipe(
    map(({ isNetworkPending, selectedNetwork }) =>
      isNetworkPending ? selectedNetwork : undefined
    ),
    filterEmpty(),
    switchMap((selectedNetwork) => {
      return onNetworkPending(selectedNetwork);
    })
  );

  // Sets a pending selected account
  const onWalletConnect$ = state$.pipe(
    pairwise(),
    filter(([prev, cur]) => {
      const didConnect = prev.wallet === undefined && cur.wallet !== undefined;
      const didChange =
        prev.wallet &&
        cur.wallet &&
        prev.wallet?.selectedAddress !== cur.wallet.selectedAddress;
      return didChange || didConnect;
    }),
    map(([_, cur]) => {
      return {
        isAccountPending: true,
        isAccountReady: false,
        holdingsGroups: undefined,
        // Selected address must always be defined here
        selectedAccount: cur.wallet?.selectedAddress,
      };
    })
  );

  const onWalletDisconnect$ = state$.pipe(
    pairwise(),
    filter(
      ([prev, cur]) => prev.wallet !== undefined && cur.wallet === undefined
    ),
    map(([_, cur]) => {
      if (cur.selectedNetwork) disconnectAccount(cur.selectedNetwork);

      return {
        isAccountPending: false,
        isAccountReady: false,
        holdingsGroups: [],
        selectedAccount: undefined,
      };
    })
  );

  // Sets the account when the data is ready and fetched
  const onAccountPending$ = state$.pipe(
    map(
      ({
        isAccountPending,
        selectedAccount,
        selectedNetwork,
        isNetworkReady,
      }) =>
        isAccountPending && isNetworkReady && selectedAccount && selectedNetwork
          ? { selectedAccount, selectedNetwork }
          : undefined
    ),
    filterEmpty(),
    switchMap(({ selectedAccount, selectedNetwork }) =>
      onAccountPending(selectedAccount, selectedNetwork)
    )
  );

  const onAccountConnect$ = state$.pipe(
    distinctUntilChanged((p, c) => p.selectedAccount === c.selectedAccount),
    tap(({ selectedAccount, wallet, selectedNetwork }) => {
      if (selectedAccount) {
        identify(selectedAccount, selectedNetwork, wallet?.label || 'unknown');
      }
    }),
    filter(({ selectedAccount }) => selectedAccount !== undefined),
    switchMap(({ selectedAccount }) => {
      // Chain Analysis Sanctioned Address Oracle
      const sanctionList = new Contract(
        '0x40c57923924b5c5c5455c48d93317139addac8fb',
        ['function isSanctioned(address) view returns (bool)'],
        getProviderFromNetwork(Network.Mainnet)
      );
      return from(
        (
          sanctionList['isSanctioned'](selectedAccount) as Promise<boolean>
        ).then((isSanctionedAddress) => ({ isSanctionedAddress }))
      );
    })
  );

  const onNFTUnlock$ = state$.pipe(
    distinctUntilChanged((p, c) => p.hasContestNFT === c.hasContestNFT),
    tap(({ hasContestNFT, selectedAccount, contestTokenId }) => {
      if (selectedAccount && hasContestNFT === BETA_ACCESS.CONFIRMED) {
        trackEvent('NFTUnlock', {
          selectedAccount,
          contestTokenId: contestTokenId || 'unknown',
        });
      }
    })
  );

  const onAppLoad$ = state$.pipe(
    filter(({ country }) => country === undefined),
    switchMap(() => {
      return from(
        Promise.all([
          fetch(vpnCheck).catch(() => ({ status: 403 })),
          fetch(`${dataURL}/geoip`).then((r) => r.json()),
        ]).then(([vpn, geoip]) => {
          return { country: vpn.status !== 200 ? 'VPN' : geoip['country'] };
        })
      );
    })
  );

  const calculateHoldingGroups$ = state$.pipe(
    filter((s) => s.isAccountReady),
    distinctUntilChanged((p, c) => p.selectedAccount === c.selectedAccount),
    switchMap((s) => {
      if (s.selectedNetwork && s.selectedAccount) {
        return Registry.getAccountRegistry()
          .subscribeAccount(s.selectedNetwork, s.selectedAccount)
          .pipe(
            filter((a) => a !== null),
            map((account) => {
              const balances =
                account?.balances.filter(
                  (b) =>
                    !b.isZero() &&
                    !b.isVaultToken &&
                    b.token.tokenType !== 'Underlying' &&
                    b.token.tokenType !== 'NOTE'
                ) || [];
              const assets = balances.filter((b) => b.isPositive());
              const debts = balances.filter((b) => b.isNegative());

              const holdingsGroups = assets.reduce((l, asset) => {
                const matchingDebts = debts.filter(
                  (b) => b.currencyId === asset.currencyId
                );
                const matchingAssets = assets.filter(
                  (b) => b.currencyId === asset.currencyId
                );

                // Only creates a grouped holding if there is exactly one matching asset and debt
                if (matchingDebts.length === 1 && matchingAssets.length === 1) {
                  const asset = matchingAssets[0];
                  const debt = matchingDebts[0];
                  const presentValue = asset
                    .toUnderlying()
                    .add(debt.toUnderlying());
                  const leverageRatio =
                    debt
                      .toUnderlying()
                      .neg()
                      .ratioWith(presentValue)
                      .toNumber() / RATE_PRECISION;

                  // NOTE: enforce a minimum leverage ratio on these to ensure that dust balances
                  // don't create leveraged positions
                  if (leverageRatio > 0.05) {
                    l.push({ asset, debt, presentValue, leverageRatio });
                  }
                }

                return l;
              }, [] as { asset: TokenBalance; debt: TokenBalance; presentValue: TokenBalance; leverageRatio: number }[]);

              return { holdingsGroups };
            })
          );
      }

      return of(undefined);
    }),
    filterEmpty()
  );

  const onPendingPnL$ = combineLatest([state$, selectedAccount(state$)]).pipe(
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

  return merge(
    calculateHoldingGroups$,
    onSelectedNetworkChange$,
    onNetworkPending$,
    onWalletConnect$,
    onWalletDisconnect$,
    onAccountPending$,
    onAccountConnect$,
    onNFTUnlock$,
    onAppLoad$,
    onPendingPnL$
  );
};
