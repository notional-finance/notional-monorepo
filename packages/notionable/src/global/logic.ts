import { Network } from '@notional-finance/util';
import { AccountFetchMode, Registry } from '@notional-finance/core-entities';

export async function onSelectedNetworkChange(
  cacheHostname: string,
  selectedNetwork: Network,
  previousNetwork?: Network
) {
  // This is a no-op if the registry is already initialized
  Registry.initialize(cacheHostname, AccountFetchMode.SINGLE_ACCOUNT_DIRECT);
  if (previousNetwork && previousNetwork !== selectedNetwork)
    Registry.stopRefresh(previousNetwork);

  return {
    isNetworkReady: await new Promise<boolean>((resolve) => {
      Registry.startRefresh(selectedNetwork);
      Registry.onNetworkReady(selectedNetwork, () => {
        resolve(true);
      });
    }),
  };
}
