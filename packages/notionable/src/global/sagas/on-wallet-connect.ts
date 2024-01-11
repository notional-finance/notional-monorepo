import {
  Observable,
  combineLatest,
  filter,
  map,
  merge,
  pairwise,
  switchMap,
} from 'rxjs';
import { AccountState, GlobalState, TransactionState } from '../global-state';
import {
  Network,
  SupportedNetworks,
  filterEmpty,
} from '@notional-finance/util';
import { Registry } from '@notional-finance/core-entities';
import {
  calculateGroupedHoldings,
  calculateHoldings,
  calculateVaultHoldings,
} from '../account/holdings';
import { calculateAccruedIncentives } from '../account/incentives';
import {
  checkCommunityMembership,
  checkSanctionedAddress,
} from '../account/communities';

export function onWalletConnect(global$: Observable<GlobalState>) {
  return merge(onWalletChange$(global$), onAccountUpdates$());
}

function onWalletChange$(global$: Observable<GlobalState>) {
  return global$.pipe(
    pairwise(),
    filter(([prev, cur]) => {
      const didConnect = prev.wallet === undefined && cur.wallet !== undefined;
      const didChange =
        prev.wallet &&
        cur.wallet &&
        prev.wallet.selectedAddress !== cur.wallet.selectedAddress;
      return didChange || didConnect;
    }),
    switchMap(async ([_, cur]) => {
      const selectedAddress = cur.wallet?.selectedAddress;
      if (selectedAddress === undefined) return undefined;

      // check community membership
      const communityMembership = await checkCommunityMembership(
        selectedAddress
      );
      // check sanctioned address
      const isSanctionedAddress = await checkSanctionedAddress(selectedAddress);

      return {
        communityMembership,
        isSanctionedAddress,
        hasTrackedIdentify: false,
        networkAccounts: undefined,
        // Initialize network transactions to an empty record set
        networkTransactions: SupportedNetworks.reduce((acc, n) => {
          acc[n] = {
            sentTransactions: {},
            awaitingBalanceChanges: {},
            completedTransactions: {},
            pendingTokens: [],
            pendingTxns: [],
          };
          return acc;
        }, {} as Record<Network, TransactionState>),
      };
    }),
    filterEmpty()
  );
}

function onAccountUpdates$() {
  return combineLatest(
    SupportedNetworks.map((n) =>
      Registry.getAccountRegistry().subscribeActiveAccount(n)
    )
  ).pipe(
    // Ensure that at least one of the accounts is defined
    filter((accts) => !accts.every((a) => a === null)),
    map((accts) => {
      const networkAccounts = accts.reduce((n, a) => {
        if (a !== null) {
          const portfolioHoldings = calculateHoldings(a);
          const { accruedIncentives, totalIncentives } =
            calculateAccruedIncentives(a);

          n[a.network] = {
            isAccountReady: true,
            accountDefinition: a,
            portfolioHoldings,
            groupedHoldings: calculateGroupedHoldings(a, portfolioHoldings),
            vaultHoldings: calculateVaultHoldings(a),
            accruedIncentives,
            totalIncentives,
          };
        }

        return n;
      }, {} as Record<Network, AccountState>);

      return { networkAccounts };
    })
  );
}

// function onTrackIdentify$(global$: Observable<GlobalState>) {
//   return global$.pipe(
//     filter(
//       ({ hasTrackedIdentify, networkAccounts }) =>
//         hasTrackedIdentify === false && !!networkAccounts
//     ),
//     tap(({ networkAccounts }) => {

//     })
//   );
// }
