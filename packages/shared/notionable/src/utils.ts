import { BehaviorSubject, Subject, scan, shareReplay, distinctUntilKeyChanged, map } from 'rxjs';
import { ethers } from 'ethers';

export function makeStore<StateType>(initialState: StateType) {
  const _store = new BehaviorSubject(initialState);
  const _updateSubject = new Subject<Partial<StateType>>();

  _updateSubject
    .pipe(scan((state, update) => ({ ...state, ...update }), initialState))
    .subscribe(_store);

  const updateState = (update: Partial<StateType>) => {
    _updateSubject.next(update);
  };

  const _state$ = _store.asObservable().pipe(shareReplay(1));
  type StateKeys = keyof StateType;

  const selectState = (key: StateKeys) => {
    return _state$.pipe(
      distinctUntilKeyChanged(key),
      map((state) => state[key])
    );
  };

  return { _store, _updateSubject, updateState, selectState, _state$ };
}

export function getFromLocalStorage(item: string) {
  const retrievedItem = window.localStorage.getItem(item);

  if (retrievedItem) {
    return JSON.parse(retrievedItem);
  }
  return {};
}

export function setInLocalStorage(key: string, item: unknown) {
  window.localStorage.setItem(key, JSON.stringify(item));
}

export function getNetworkIdFromHostname(hostname: string) {
  if (hostname.endsWith('sad-yonath-181142.netlify.app')) {
    return 1;
  } else if (hostname.endsWith('kovan-v2.netlify.app')) {
    return 42;
  }

  switch (hostname) {
    case 'notional.finance':
      return 1;
    case 'develop.notional.finance':
      return 5;
    case 'localhost':
      return 5;
    default:
      return 5;
  }
}

class AlchemyBatchProvider extends ethers.providers.AlchemyProvider {
  // _pendingBatchAggregator?: NodeJS.Timer;
  // _pendingBatch?: Array<{
  //     request: { method: string, params: Array<any>, id: number, jsonrpc: "2.0" },
  //     resolve: (result: any) => void,
  //     reject: (error: Error) => void
  // }>;
  // constructor(network, apiKey) {
  //   super(network, apiKey)
  // }
}

export function getProvider(networkId: number) {
  if (networkId === 1) {
    // Mainnet
    const provider = new AlchemyBatchProvider(
      networkId,
      'JU05SBqaAUg1-2xYuUvvJlE2-zcFKSwz'
    );
    provider.send = ethers.providers.JsonRpcBatchProvider.prototype.send;
    return provider;
  } else if (networkId === 5) {
    // Goerli
    const provider = new AlchemyBatchProvider(
      networkId,
      'u9PaziJgX-8l4j8_c88b777-Io4scNUe'
    );
    provider.send = ethers.providers.JsonRpcBatchProvider.prototype.send;
    return provider;
  } else {
    // Goerli
    const provider = new AlchemyBatchProvider(
      networkId,
      'u9PaziJgX-8l4j8_c88b777-Io4scNUe'
    );
    provider.send = ethers.providers.JsonRpcBatchProvider.prototype.send;
    return provider;
  }
}