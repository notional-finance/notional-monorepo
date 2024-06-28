import spindl from '@spindl-xyz/attribution';
import {
  Observable,
  combineLatest,
  distinctUntilChanged,
  filter,
  map,
  merge,
  pairwise,
  switchMap,
} from 'rxjs';
import { AccountState, GlobalState } from '../global-state';
import {
  Network,
  SupportedNetworks,
  filterEmpty,
} from '@notional-finance/util';
import { Registry } from '@notional-finance/core-entities';
import {
  calculateAccountCurrentFactors,
  calculateGroupedHoldings,
  calculateHoldings,
  calculateVaultHoldings,
} from '../account/holdings';
import { calculateAccruedIncentives } from '../account/incentives';
import {
  checkCommunityMembership,
  checkSanctionedAddress,
} from '../account/communities';
import { AccountRiskProfile } from '@notional-finance/risk-engine';
import { isAppReady } from '../../utils';
import { identify, getFromLocalStorage } from '@notional-finance/helpers';
const userSettings = getFromLocalStorage('userSettings');

export function onWalletConnect(global$: Observable<GlobalState>) {
  return merge(
    onWalletChange$(global$),
    onSyncAccountInfo$(global$),
    onAccountUpdates$(global$),
    onSyncArbPoints$(global$)
  );
}

function globalWhenWalletChanges$(global$: Observable<GlobalState>) {
  return global$.pipe(
    pairwise(),
    filter(([prev, cur]) => {
      const didConnect = prev.wallet === undefined && cur.wallet !== undefined;
      const didChange =
        !!prev.wallet &&
        !!cur.wallet &&
        prev.wallet.selectedAddress !== cur.wallet.selectedAddress;
      return didChange || didConnect;
    }),
    map(([_, c]) => c)
  );
}

/** This observable emits immediately when the wallet changes */
function onWalletChange$(global$: Observable<GlobalState>) {
  return globalWhenWalletChanges$(global$).pipe(
    map((cur) => {
      const selectedAddress = cur.wallet?.selectedAddress;
      if (selectedAddress === undefined) return undefined;

      return {
        networkAccounts: undefined,
        isAccountPending: true,
      };
    }),
    filterEmpty()
  );
}

/** This observable emits async when the wallet info changes */
function onSyncAccountInfo$(global$: Observable<GlobalState>) {
  return globalWhenWalletChanges$(global$).pipe(
    switchMap(async (g) => {
      const selectedAddress = g.wallet?.selectedAddress;
      if (selectedAddress === undefined) return undefined;
      const accounts = Registry.getAccountRegistry();
      if (
        g.wallet?.provider &&
        g.wallet.selectedChain &&
        SupportedNetworks.includes(g.wallet.selectedChain)
      ) {
        accounts.walletProvider = g.wallet?.provider;
      }

      // Set up account refresh on all supported networks
      const tokenBalances = Object.fromEntries(
        await Promise.all(
          SupportedNetworks.map(async (n) => {
            await accounts.setAccount(n, selectedAddress);
            return [
              n,
              accounts
                .getAccount(n, selectedAddress)
                ?.balances.filter((t) => t.tokenType === 'Underlying')
                .map((t) => t.toDisplayStringWithSymbol(6)) || [],
            ];
          })
        )
      );

      if (g.wallet?.isReadOnlyAddress === false) {
        identify(
          selectedAddress,
          g.wallet.selectedChain,
          g.wallet.label || 'unknown',
          JSON.stringify(tokenBalances)
        );
      }

      // check community membership
      const communityMembership = await checkCommunityMembership(
        selectedAddress
      );
      // check sanctioned address
      const isSanctionedAddress = await checkSanctionedAddress(selectedAddress);

      if(!isSanctionedAddress) {
        spindl.attribute(selectedAddress);
      }

      return {
        communityMembership,
        isSanctionedAddress,
        isAccountPending: false,
      };
    }),
    filterEmpty()
  );
}

function onAccountUpdates$(global$: Observable<GlobalState>) {
  return global$.pipe(
    distinctUntilChanged((p, c) => p.isAccountPending === c.isAccountPending),
    filter((g) => !g.isAccountPending && isAppReady(g.networkState)),
    switchMap((g) => {
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
              const priceChanges =
                g.priceChanges && g.priceChanges[a.network]
                  ? g.priceChanges[a.network]
                  : undefined;
              const { accruedIncentives, totalIncentives } =
                calculateAccruedIncentives(a);

              const portfolioHoldings = calculateHoldings(
                a,
                accruedIncentives,
                priceChanges
              );
              const riskProfile = new AccountRiskProfile(
                a?.balances.filter(
                  (b) =>
                    !b.isVaultToken &&
                    b.tokenType !== 'Underlying' &&
                    b.tokenType !== 'NOTE'
                ) || [],
                a.network
              );
              const vaultHoldings = calculateVaultHoldings(a);

              n[a.network] = {
                isSubgraphDown:
                  a.balanceStatement === undefined &&
                  a.accountHistory === undefined,
                isAccountReady: true,
                riskProfile,
                accountDefinition: a,
                portfolioLiquidationPrices:
                  riskProfile.getAllLiquidationPrices(),
                portfolioHoldings,
                groupedHoldings: calculateGroupedHoldings(a, portfolioHoldings),
                vaultHoldings,
                accruedIncentives,
                totalIncentives,
                currentFactors: calculateAccountCurrentFactors(
                  portfolioHoldings,
                  vaultHoldings,
                  userSettings.baseCurrency
                ),
              };
            }

            return n;
          }, {} as Record<Network, AccountState>);

          return { networkAccounts };
        })
      );
    }),
    filterEmpty()
  );
}

function onSyncArbPoints$(global$: Observable<GlobalState>) {
  return globalWhenWalletChanges$(global$).pipe(
    switchMap(async (g) => {
      const selectedAddress = g.wallet?.selectedAddress;
      if (selectedAddress) {
        try {
          const arbPoints: { token: string; points: number }[] = await fetch(
            `https://points.notional.finance/arb_account_points/${selectedAddress.toLowerCase()}`
          ).then((r) => r.json());
          const totalPoints = arbPoints.reduce(
            (t, { points }) => t + points,
            0
          );

          return { arbPoints, totalPoints };
        } catch {
          return undefined;
        }
      }
      return undefined;
    }),
    filterEmpty()
  );
}
