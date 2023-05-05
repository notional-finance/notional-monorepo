import { Network } from '..';
import {
  BehaviorSubject,
  exhaustMap,
  filter,
  from,
  interval,
  Observable,
  Subscription,
  take,
  timeout,
} from 'rxjs';
import { CacheSchema, SubjectMap } from '.';

interface SubjectKey {
  network: Network;
  key: string;
}

/**
 * Generic class for registries that manages internal subjects and creates observables for them.
 *
 * - [Server Side] Serializes cached data
 * - [Server Side] Fetches data from Graph
 * - [Server Side] Fetches data from Blockchain
 * - [Client Side] Fetches and deserializes cached data
 * - [Both] Updates observables when new data has changed
 * - [Both] Updates observables internal timestamps and block numbers
 */
export abstract class BaseRegistry<T> {
  private _interval = new Map<Network, Observable<number>>();
  private _intervalSubscription = new Map<Network, Subscription>();

  protected abstract _refresh(
    network: Network,
    intervalNum: number
  ): Promise<CacheSchema<T>>;

  protected stopRefresh(network: Network) {
    this._intervalSubscription.get(network)?.unsubscribe();
  }

  protected startRefreshInterval(network: Network, intervalMS: number) {
    this.stopRefresh(network);

    const newInterval = interval(intervalMS);
    this._intervalSubscription.set(
      network,
      newInterval
        .pipe(
          // This will block until the previous refresh has completed so that they do not stack up
          // if there is a long timeout
          exhaustMap((intervalNum) => {
            return from(this._refresh(network, intervalNum)).pipe(
              timeout(intervalMS / 2)
            );
          })
        )
        .subscribe(this._updateNetworkObservables)
    );

    this._interval.set(network, newInterval);
  }

  protected subjectRegistered = new BehaviorSubject<SubjectKey | null>(null);

  protected networkSubjects = new Map<Network, SubjectMap<T>>();

  protected lastUpdateBlock = new Map<Network, BehaviorSubject<number>>();

  protected lastUpdateTimestamp = new Map<Network, BehaviorSubject<number>>();

  protected _getNetworkSubjects(network: Network) {
    const subjects = this.networkSubjects.get(network);
    if (subjects === undefined)
      throw Error(`Network ${network} not initialized`);
    return subjects;
  }

  private _initializeNetworkSubject(network: Network) {
    this.networkSubjects.set(
      network,
      new Map<string, BehaviorSubject<T | null>>()
    );
    this.lastUpdateBlock.set(network, new BehaviorSubject<number>(0));
    this.lastUpdateTimestamp.set(network, new BehaviorSubject<number>(0));
  }

  /**
   * Updates local observables for data fetched from a single network.
   * @param data fetched data from a single network
   */
  protected _updateNetworkObservables(data: CacheSchema<T>) {
    if (!this.networkSubjects.has(data.network)) {
      // Initialize the network if it does not yet exist
      this._initializeNetworkSubject(data.network);
    }
    const subjects = this._getNetworkSubjects(data.network);

    // Calls next on all the data that is pushed into the base registry.
    data.values.forEach(([key, value]) => {
      const s = subjects.get(key);
      if (s) {
        s.next(value);
      } else {
        // Create a new subject at the key if it does not yet exist
        const newSubject = new BehaviorSubject<T | null>(null);
        newSubject.next(value);
        subjects.set(key, newSubject);

        // Emits a message that a new subject has been registered at a given key
        this.subjectRegistered.next({ network: data.network, key });
      }
    });

    // Update global counters for the given network
    this.lastUpdateBlock.get(data.network)?.next(data.lastUpdateBlock);
    this.lastUpdateTimestamp.get(data.network)?.next(data.lastUpdateTimestamp);
  }

  // Public Observable methods
  public getLastUpdateBlock(network: Network) {
    return this.lastUpdateBlock.get(network)?.value || 0;
  }

  public subscribeLastUpdateBlock(network: Network) {
    return this.lastUpdateBlock.get(network)?.asObservable();
  }

  public getLastUpdateTimestamp(network: Network) {
    return this.lastUpdateTimestamp.get(network)?.value || 0;
  }

  public subscribeLastUpdateTimestamp(network: Network) {
    return this.lastUpdateTimestamp.get(network)?.asObservable();
  }

  /** Returns a subscription to when keys are updated */
  public subscribeNetworkKeys(network: Network) {
    return this.subjectRegistered
      .asObservable()
      .pipe(filter((v) => v?.network === network));
  }

  /**
   * Returns all the registered subject keys
   */
  public getAllSubjectKeys(network: Network) {
    return Array.from(this._getNetworkSubjects(network).keys());
  }

  /**
   * Returns true if a key has already been registered
   */
  public isKeyRegistered(network: Network, key: string) {
    return this.networkSubjects.get(network)?.has(key) === true;
  }

  /**
   * Executes a callback once when a key has been registered
   */
  public onSubjectKeyRegistered(network: Network, key: string, fn: () => void) {
    return this.subjectRegistered
      .asObservable()
      .pipe(
        filter((v) => v?.network === network && v?.key === key),
        take(1)
      )
      .subscribe(fn);
  }

  /**
   * Returns an observable that can be subscribed to whenever a key is updated. Will throw
   * error if the key is not yet registered.
   */
  public subscribeSubject(network: Network, key: string) {
    if (!this.isKeyRegistered(network, key))
      throw Error('Subject key not registered');

    return this._getNetworkSubjects(network).get(key)?.asObservable();
  }

  /**
   * Returns the latest value from a subject
   */
  public getLatestFromSubject(network: Network, key: string) {
    return this._getNetworkSubjects(network).get(key)?.value;
  }

  /**
   * Returns the latest value from all subjects (if a value is set)
   */
  protected getLatestFromAllSubjects(network: Network) {
    return this.getAllSubjectKeys(network).reduce((map, k) => {
      const v = this.getLatestFromSubject(network, k);
      if (v) map.set(k, v);
      return map;
    }, new Map<string, T>());
  }
}
