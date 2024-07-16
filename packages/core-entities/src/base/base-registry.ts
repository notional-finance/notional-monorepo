import { filterEmpty, getNowSeconds, Network } from '@notional-finance/util';
import {
  BehaviorSubject,
  filter,
  from,
  map,
  Observable,
  of,
  Subscription,
  switchMap,
  take,
  timeout,
  timer,
} from 'rxjs';
import { CacheSchema, SubjectMap } from '..';

interface SubjectKey {
  network: Network;
  key: string;
}

/** Generic class for registries that manages internal subjects and creates observables for them.  */
export abstract class BaseRegistry<T> {
  private _interval = new Map<Network, Observable<number>>();
  private _intervalMS = new Map<Network, number>();
  private _intervalSubscription = new Map<Network, Subscription>();

  protected defaultFreshnessIntervals = 1;

  /** Emits a network when a network has completed its first refresh */
  protected networkRegistered = new BehaviorSubject<Network | null>(null);

  /** Emits a subject key (network, key) tuple every time a new subject is registered */
  protected subjectRegistered = new BehaviorSubject<SubjectKey | null>(null);

  /** Mapping of data monitored by the registry */
  protected networkSubjects = new Map<Network, SubjectMap<T>>();

  /** Last time the network was updated for a given block */
  protected lastUpdateBlock = new Map<Network, BehaviorSubject<number>>();

  /** Last time the timestamp was updated for a given block */
  protected lastUpdateTimestamp = new Map<Network, BehaviorSubject<number>>();

  protected abstract _refresh(
    network: Network,
    blockNumber?: number
  ): Promise<CacheSchema<T>>;

  /** Gets the map of subjects for a given network, checking for existence */
  protected _getNetworkSubjects(network: Network) {
    const subjects = this.networkSubjects.get(network);
    if (subjects === undefined)
      throw Error(`Network ${network} not initialized`);
    return subjects;
  }

  /** Initializes an entire network if it does not yet exit */
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
    let didInitNetwork = false;
    if (!this.networkSubjects.has(data.network)) {
      // Initialize the network if it does not yet exist
      this._initializeNetworkSubject(data.network);
      didInitNetwork = true;
    }
    const subjects = this._getNetworkSubjects(data.network);

    // Update global counters for the given network
    this.lastUpdateBlock.get(data.network)?.next(data.lastUpdateBlock);
    this.lastUpdateTimestamp.get(data.network)?.next(data.lastUpdateTimestamp);

    // Calls next on all the data that is pushed into the base registry.
    data.values.forEach(([key, value]) => {
      const s = subjects.get(key);
      if (s) {
        s.next(value);
      } else {
        this._addSubjectKey(subjects, data.network, key, value);
      }
    });

    if (didInitNetwork) this.networkRegistered.next(data.network);
  }

  private _addSubjectKey(
    subjects: SubjectMap<T>,
    network: Network,
    key: string,
    value: T | null
  ) {
    // Create a new subject at the key if it does not yet exist
    const newSubject = new BehaviorSubject<T | null>(null);
    newSubject.next(value);
    subjects.set(key, newSubject);

    // Emits a message that a new subject has been registered at a given key
    this.subjectRegistered.next({ network: network, key });
  }

  /** Protected method that allows child classes to expose direct listing of subject keys */
  protected _updateSubjectKeyDirect(
    network: Network,
    key: string,
    value: T,
    allowUpdate = false
  ) {
    let didInitNetwork = false;
    if (!this.networkSubjects.has(network)) {
      // Initialize the network if it does not yet exist
      this._initializeNetworkSubject(network);
      didInitNetwork = true;
    }
    const subjects = this._getNetworkSubjects(network);

    if (allowUpdate && subjects.has(key)) {
      subjects.get(key)?.next(value);
    } else if (!subjects.has(key)) {
      // Do not re-register the subject key if it is already registered
      this._addSubjectKey(subjects, network, key, value);
    }

    if (didInitNetwork) this.networkRegistered.next(network);
  }

  /** Stops refreshes on the selected network */
  public stopRefresh(network: Network) {
    this._intervalSubscription.get(network)?.unsubscribe();
    this._interval.delete(network);
    this._intervalMS.delete(network);
  }

  public triggerRefresh(
    network: Network,
    onComplete?: () => void,
    blockNumber?: number
  ) {
    of(1)
      .pipe(
        switchMap(() => {
          return from(this._refresh(network, blockNumber));
        })
      )
      .subscribe((d) => {
        this._updateNetworkObservables(d);
        if (onComplete) onComplete();
      });
  }

  public async triggerRefreshPromise(network: Network, blockNumber?: number) {
    return new Promise<void>((resolve) => {
      this.triggerRefresh(network, resolve, blockNumber);
    });
  }

  /** Starts refreshes on the network at the specified interval */
  public startRefreshInterval(network: Network, intervalMS: number) {
    this.stopRefresh(network);

    const newInterval = timer(0, intervalMS);
    this._intervalSubscription.set(
      network,
      newInterval
        .pipe(
          switchMap(() => {
            return from(this._refresh(network)).pipe(timeout(intervalMS / 2));
          })
        )
        .subscribe((d) => {
          this._updateNetworkObservables(d);
        })
    );

    this._interval.set(network, newInterval);
    this._intervalMS.set(network, intervalMS);
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

  public isNetworkRegistered(network: Network) {
    return this.networkSubjects.has(network);
  }

  public subscribeNetworks() {
    return this.networkRegistered
      .asObservable()
      .pipe(map(() => Array.from(this.networkSubjects.keys())));
  }

  public onNetworkRegistered(network: Network, fn: () => void) {
    if (this.isNetworkRegistered(network)) {
      fn();
    } else {
      this.networkRegistered.asObservable().subscribe((n) => {
        if (n === network) fn();
      });
    }
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

  /** Returns true if a key has already been registered */
  public isKeyRegistered(network: Network, key: string) {
    return this.networkSubjects.get(network)?.has(key) === true;
  }

  /** Executes a callback once when a key has been registered */
  public onSubjectKeyRegistered(network: Network, key: string, fn: () => void) {
    if (this.isKeyRegistered(network, key)) {
      fn();
    } else {
      this.subjectRegistered
        .asObservable()
        .pipe(
          filter((v) => v?.network === network && v?.key === key),
          take(1)
        )
        .subscribe(fn);
    }
  }

  /** Executes a callback when a key has been registered and data is populated */
  public onSubjectKeyReady(network: Network, key: string, fn: (v: T) => void) {
    this.onSubjectKeyRegistered(network, key, () => {
      this.subscribeSubject(network, key)
        ?.pipe(filterEmpty(), take(1))
        .subscribe(fn);
    });
  }

  /**
   * Returns an observable that can be subscribed to whenever a key is updated. Will throw
   * error if the key is not yet registered.
   */
  public subscribeSubject(network: Network, key: string) {
    if (!this.isKeyRegistered(network, key))
      throw Error(`Subject key not registered: ${network} ${key}`);

    return this._getNetworkSubjects(network).get(key)?.asObservable();
  }

  /**
   * Returns the latest value from a subject
   *
   * @param checkFreshness (default: 1) ensures that the returned value is within certain refresh intervals. Set
   * this to zero if no refresh check is desired
   */
  public getLatestFromSubject(
    network: Network,
    key: string,
    checkFreshness = this.defaultFreshnessIntervals
  ) {
    console.log("network", network);
    // Don't check freshness if no interval is set
    const intervalMS = this._intervalMS.get(network);
    if (checkFreshness > 0 && intervalMS) {
      const updateTimestamp = this.getLastUpdateTimestamp(network);
      const nextRefreshTime = updateTimestamp + intervalMS * checkFreshness;
      const nowSeconds = getNowSeconds();
      if (nextRefreshTime < nowSeconds) {
        throw Error(
          `${key} on ${network} has missed ${Math.floor(
            (updateTimestamp - nowSeconds) / intervalMS
          )} refreshes`
        );
      }
    }

    return this._getNetworkSubjects(network).get(key)?.value;
  }

  /**
   * Returns the latest value from all subjects (if a value is set)
   */
  public getLatestFromAllSubjects(network: Network, checkFreshness = 1) {
    return this.getAllSubjectKeys(network).reduce((map, k) => {
      const v = this.getLatestFromSubject(network, k, checkFreshness);
      if (v) map.set(k, v);
      return map;
    }, new Map<string, T>());
  }

  public isRefreshRunning(network: Network) {
    return this._intervalSubscription.has(network);
  }
}
