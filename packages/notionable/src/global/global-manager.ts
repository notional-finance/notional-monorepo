import { filterEmpty, Network } from '@notional-finance/util';
import {
  Observable,
  merge,
  pairwise,
  filter,
  switchMap,
  map,
  distinctUntilChanged,
  tap,
} from 'rxjs';
import { BETA_ACCESS, GlobalState } from './global-state';
import {
  disconnectAccount,
  onAccountPending,
  onNetworkPending,
  onSelectedNetworkChange,
} from './logic';
import { trackEvent } from '@notional-finance/helpers';

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
    tap(({ selectedAccount, wallet }) => {
      if (selectedAccount) {
        trackEvent('CONNECT_WALLET', {
          selectedAccount,
          wallet: wallet?.label || 'unknown',
        });
      }
    })
  );

  const onNFTUnlock$ = state$.pipe(
    distinctUntilChanged((p, c) => p.hasContestNFT === c.hasContestNFT),
    tap(({ hasContestNFT, selectedAccount, contestTokenId }) => {
      if (selectedAccount && hasContestNFT === BETA_ACCESS.CONFIRMED) {
        trackEvent('NFT_UNLOCK', {
          selectedAccount,
          contestTokenId: contestTokenId || 'unknown',
        });
      }
    })
  );

  return merge(
    onSelectedNetworkChange$,
    onNetworkPending$,
    onWalletConnect$,
    onWalletDisconnect$,
    onAccountPending$,
    onAccountConnect$,
    onNFTUnlock$
  );
};
