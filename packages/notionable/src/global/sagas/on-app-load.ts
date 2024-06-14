import {
  Observable,
  distinctUntilChanged,
  filter,
  from,
  map,
  merge,
  mergeMap,
  switchMap,
  withLatestFrom,
} from 'rxjs';
import { GlobalState } from '../global-state';
import {
  Network,
  SupportedNetworks,
  filterEmpty,
} from '@notional-finance/util';
import { AccountFetchMode, Registry } from '@notional-finance/core-entities';
import { isAppReady } from '../../utils';

const vpnCheck = 'https://detect.notional.finance/';
const dataURL = process.env['NX_DATA_URL'] || 'https://data.notional.finance';

export function onAppLoad(global$: Observable<GlobalState>) {
  return merge(
    exportControlState$(global$),
    initNetworkRegistry$(global$),
    onNetworkLoaded$(global$)
  );
}

export function globalWhenAppReady$(global$: Observable<GlobalState>) {
  return global$.pipe(
    distinctUntilChanged(
      (p, c) => isAppReady(p.networkState) === isAppReady(c.networkState)
    ),
    filter((g) => isAppReady(g.networkState))
  );
}

function exportControlState$(global$: Observable<GlobalState>) {
  return global$.pipe(
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
}

function initNetworkRegistry$(global$: Observable<GlobalState>) {
  return global$.pipe(
    filter(({ networkState }) => networkState === undefined),
    map(({ cacheHostname }) => {
      // This is a no-op if the registry is already initialized
      Registry.initialize(
        { NX_SUBGRAPH_API_KEY: process.env['NX_SUBGRAPH_API_KEY'] as string },
        cacheHostname,
        AccountFetchMode.SINGLE_ACCOUNT_DIRECT
      );

      const networkState = SupportedNetworks.reduce((ns, n) => {
        Registry.startRefresh(n);
        ns[n] = 'Pending';
        return ns;
      }, {} as NonNullable<GlobalState['networkState']>);
      // This has to be set manually
      networkState[Network.all] = 'Pending';

      return { networkState };
    })
  );
}

function onNetworkLoaded$(global$: Observable<GlobalState>) {
  return global$.pipe(
    map(({ networkState }) => {
      if (networkState) {
        const pendingNetworks = [...SupportedNetworks, Network.all].filter(
          (n) => networkState[n] === 'Pending'
        );
        if (pendingNetworks.length) return pendingNetworks;
      }
      return undefined;
    }),
    filterEmpty(),
    // Merge map flattens incoming arrays and processes them concurrently
    mergeMap((pendingNetwork) => pendingNetwork),
    mergeMap(
      async (network) =>
        await new Promise<Network>((resolve) => {
          Registry.onNetworkReady(network, () => resolve(network));
        })
    ),
    withLatestFrom(global$),
    map(([n, { networkState }]) => {
      if (networkState && networkState[n] === 'Loaded') {
        return undefined;
      } else {
        return {
          networkState: networkState
            ? Object.assign(networkState, { [n]: 'Loaded' })
            : undefined,
        };
      }
    }),
    filterEmpty()
  );
}
