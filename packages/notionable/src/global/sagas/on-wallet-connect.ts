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
  ONE_WEEK,
  SupportedNetworks,
  TRACKING_EVENTS,
  filterEmpty,
  getFromLocalStorage,
  getNowSeconds,
  setInLocalStorage,
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
import { update } from '@intercom/messenger-js-sdk';
import { isAppReady } from '../../utils';
import {
  identify,
  safeDatadogRum,
  trackEvent,
} from '@notional-finance/helpers';

export function onWalletConnect(
  global$: Observable<GlobalState>,
  app$: Observable<ApplicationState>
) {
  return merge(
    onWalletChange$(global$),
    onSyncAccountInfo$(global$),
    onAccountUpdates$(global$, app$),
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

async function fetchDeBankNetWorth(walletAddress) {
  const DeBankAPIKey = process.env['NX_DEBANK_API_KEY'] as string | undefined;
  const url = `https://pro-openapi.debank.com/v1/user/total_balance?id=${walletAddress}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        accept: 'application/json',
        AccessKey: DeBankAPIKey || '',
      },
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    const data = await response.json();

    return data.total_usd_value;
  } catch (error) {
    console.error('Failed to fetch DeBank net worth:', error);
  }
}

async function getDebBankData(selectedAddress, isReadOnlyAddress) {
  const userSettings = getFromLocalStorage('userSettings');
  const newDeBankWallet = !userSettings.debankAddress;
  const updateDeBankWallet =
    userSettings.debankAddress &&
    !isReadOnlyAddress &&
    userSettings.debankAddress !== selectedAddress;
  const weeklyCheck = (() => {
    if (userSettings.debankTimestamp) {
      const currentDate = getNowSeconds();
      return currentDate - userSettings.debankTimestamp > ONE_WEEK;
    }
    return false;
  })();

  let isFetching = false;
  let currentNetWorth = 0;

  async function updateDeBankNetWorth(address: string) {
    if (isFetching) return;
    isFetching = true;
    try {
      const netWorth = await fetchDeBankNetWorth(address);
      const currentTimestamp = getNowSeconds();
      currentNetWorth = Math.trunc(netWorth);

      const userSettings = getFromLocalStorage('userSettings');
      setInLocalStorage('userSettings', {
        ...userSettings,
        debankAddress: address,
        debankNetWorth: currentNetWorth,
        debankTimestamp: currentTimestamp,
      });
    } finally {
      isFetching = false;
    }
  }

  if (newDeBankWallet || updateDeBankWallet || weeklyCheck) {
    await updateDeBankNetWorth(selectedAddress);
  }

  return !userSettings.debankNetWorth
    ? currentNetWorth
    : userSettings.debankNetWorth;
}

async function updateWalletTracking(
  selectedAddress: string,
  isReadOnlyAddress: boolean | undefined
) {
  const balanceData = {
    walletBalance: 0,
    notionalBalance: 0,
  };
  const userSettings = getFromLocalStorage('userSettings');
  let debankNetWorth = 0;
  await getDebBankData(selectedAddress, isReadOnlyAddress).then((netWorth) => {
    debankNetWorth = netWorth;
  });
  const accounts = Registry.getAccountRegistry();

  SupportedNetworks.forEach((network) => {
    const account = accounts.getAccount(network, selectedAddress)
      ? accounts.getAccount(network, selectedAddress)
      : undefined;

    const walletBalance = account?.balances
      .filter((b) => b.tokenType === 'Underlying' && b.symbol !== 'sNOTE')
      .reduce((acc, b) => acc + b.toFiat('USD').toFloat(), 0);

    const notionalBalance = account?.balances
      .filter((b) => b.tokenType !== 'Underlying' && b.symbol !== 'sNOTE')
      .reduce((acc, b) => acc + b.toFiat('USD').toFloat(), 0);

    if (walletBalance) {
      balanceData.walletBalance = balanceData.walletBalance + walletBalance;
    }

    if (notionalBalance) {
      balanceData.notionalBalance =
        balanceData.notionalBalance + notionalBalance;
    }
  });

  const totalBalance = balanceData.notionalBalance + balanceData.walletBalance;

  if (
    !userSettings.connectedWallets ||
    (userSettings.connectedWallets &&
      !userSettings.connectedWallets.includes(selectedAddress))
  ) {
    const createdAt = Math.floor(Date.now() / 1000);
    update({
      created_at: createdAt,
    });
    setInLocalStorage('userSettings', {
      ...userSettings,
      connectedWallets: userSettings.connectedWallets
        ? [...userSettings.connectedWallets, selectedAddress]
        : [selectedAddress],
    });
  }

  trackEvent(TRACKING_EVENTS.WALLET_CONNECTED, {
    id: selectedAddress,
    walletAddress: selectedAddress,
    TotalWalletBalance: balanceData.walletBalance,
    TotalNotionalBalance: balanceData.notionalBalance,
    TotalBalance: totalBalance,
    DeBankNetWorth: debankNetWorth,
  });

  safeDatadogRum.setUser({
    id: selectedAddress,
    newUser:
      userSettings.connectedWallets && userSettings.connectedWallets.length > 0
        ? false
        : true,
    walletAddress: selectedAddress,
    TotalWalletBalance: balanceData.walletBalance,
    TotalNotionalBalance: balanceData.notionalBalance,
    TotalBalance: totalBalance,
    DeBankNetWorth: debankNetWorth,
  });

  update({
    userId: selectedAddress,
    name: selectedAddress,
    customAttributes: {
      TotalWalletBalance: balanceData.walletBalance,
      TotalNotionalBalance: balanceData.notionalBalance,
      TotalBalance: totalBalance,
      DeBankNetWorth: debankNetWorth,
    },
  });
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

      updateWalletTracking(selectedAddress, g.wallet?.isReadOnlyAddress);

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

function onSyncArbPoints$(global$: Observable<GlobalState>) {
  return globalWhenWalletChanges$(global$).pipe(
    switchMap(async (g) => {
      const selectedAddress = g.wallet?.selectedAddress;
      if (selectedAddress) {
        try {
          const arbPoints: {
            token: string;
            points: number;
            season_one: number;
            season_two: number;
            season_three: number;
          }[] = await fetch(
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
