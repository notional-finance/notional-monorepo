import { Network } from '@notional-finance/util';
import { AccountFetchMode, Registry } from '@notional-finance/core-entities';

const FEATURE_FLAG = process.env['NX_V3_FEATURE_FLAG'];

export function onSelectedNetworkChange(
  cacheHostname: string,
  selectedNetwork: Network,
  previousNetwork?: Network
) {
  // This is a no-op if the registry is already initialized
  Registry.initialize(cacheHostname, AccountFetchMode.SINGLE_ACCOUNT_DIRECT);
  // NOTE: this disables the registry refresh unless the feature flag is set
  if (FEATURE_FLAG === undefined) return;

  if (
    previousNetwork === selectedNetwork &&
    Registry.isRefreshRunning(selectedNetwork)
  ) {
    // No change
    return;
  } else if (
    Registry.isRefreshRunning(selectedNetwork) &&
    previousNetwork &&
    previousNetwork !== selectedNetwork
  ) {
    // Stop refresh and start a new one below
    Registry.stopRefresh(previousNetwork);
  }

  return {
    isNetworkReady: false,
    isNetworkPending: true,
  };
}

export async function onNetworkPending(selectedNetwork: Network) {
  const isNetworkReady = await new Promise<boolean>((resolve) => {
    Registry.startRefresh(selectedNetwork);
    Registry.onNetworkReady(selectedNetwork, () => {
      resolve(true);
    });
  });
  return { isNetworkReady, isNetworkPending: false };
}

export async function onAccountPending(
  selectedAccount: string,
  selectedNetwork: Network
) {
  const isAccountReady = await new Promise<boolean>((resolve) => {
    Registry.getAccountRegistry().onAccountReady(
      selectedNetwork,
      selectedAccount,
      () => {
        resolve(true);
      }
    );
  });

  return { isAccountReady, isAccountPending: false };
}

export async function disconnectAccount(selectedNetwork: Network) {
  Registry.getAccountRegistry().stopRefresh(selectedNetwork);
}
