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
  withLatestFrom,
} from 'rxjs';
import { AccountState, ApplicationState, GlobalState } from '../global-state';
import {
  Network,
  SupportedNetworks,
  filterEmpty,
} from '@notional-finance/util';
import {
  Registry,
  getArbBoosts,
  getPointsPerDay,
} from '@notional-finance/core-entities';
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
import { identify } from '@notional-finance/helpers';

export function onWalletConnect(
  global$: Observable<GlobalState>,
  app$: Observable<ApplicationState>
) {
  return merge(
    onWalletChange$(global$),
    onSyncAccountInfo$(global$),
    onAccountUpdates$(global$, app$),
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

      if (!isSanctionedAddress) {
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

function onAccountUpdates$(
  global$: Observable<GlobalState>,
  app$: Observable<ApplicationState>
) {
  return combineLatest([global$, app$]).pipe(
    distinctUntilChanged(
      ([p], [c]) => p.isAccountPending === c.isAccountPending
    ),
    filter(([g, a]) => !g.isAccountPending && isAppReady(a.networkState)),
    switchMap(([_, app]) => {
      return combineLatest(
        SupportedNetworks.map((n) =>
          Registry.getAccountRegistry().subscribeActiveAccount(n)
        )
      ).pipe(
        // Ensure that at least one of the accounts is defined
        filter((accts) => !accts.every((a) => a === null)),
        withLatestFrom(global$),
        switchMap(async ([accts, global]) => {
          const accountResults = await Promise.all(
            accts.map(async (a) => {
              if (a === null) return null;

              const priceChanges =
                app.priceChanges && app.priceChanges[a.network]
                  ? app.priceChanges[a.network]
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

              const prevRewardClaims = global.networkAccounts?.[
                a.network
              ]?.vaultHoldings?.map((v) => ({
                vaultAddress: v.vault.vaultAddress,
                rewardClaims: v.vaultMetadata.rewardClaims,
              }));

              const vaultHoldings = await calculateVaultHoldings(
                a,
                prevRewardClaims
              );

              let pointsPerDay = 0;
              if (a.network === Network.arbitrum) {
                pointsPerDay += vaultHoldings.reduce((t, { vault }) => {
                  const boostNum = getArbBoosts(vault.vaultShares.token, false);
                  const pointsPerDay =
                    vault.netWorth().toFiat('USD').toFloat() * boostNum;
                  return t + pointsPerDay;
                }, 0);

                pointsPerDay += portfolioHoldings.reduce(
                  (t, { balance }) => t + getPointsPerDay(balance),
                  0
                );
              }

              return {
                network: a.network,
                accountState: {
                  isSubgraphDown:
                    a.balanceStatement === undefined &&
                    a.accountHistory === undefined,
                  isAccountReady: true,
                  riskProfile,
                  accountDefinition: a,
                  portfolioLiquidationPrices:
                    riskProfile.getAllLiquidationPrices(),
                  portfolioHoldings,
                  groupedHoldings: calculateGroupedHoldings(
                    a,
                    portfolioHoldings
                  ),
                  vaultHoldings,
                  accruedIncentives,
                  totalIncentives,
                  currentFactors: calculateAccountCurrentFactors(
                    portfolioHoldings,
                    vaultHoldings,
                    app.baseCurrency
                  ),
                  pointsPerDay,
                },
              };
            })
          );

          const networkAccounts = accountResults.reduce((n, result) => {
            if (result !== null) {
              n[result.network] = result.accountState;
            }
            return n;
          }, {} as Record<Network, AccountState>);

          return { networkAccounts };
        }),
        filterEmpty()
      );
    })
  );
}
