import { getNowSeconds, Network } from '@notional-finance/util';
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

/** Generic class for registries that manages internal subjects and creates observables for them.  */
export abstract class BaseRegistry<T> {
  private _interval = new Map<Network, Observable<number>>();
  private _intervalMS = new Map<Network, number>();
  private _intervalSubscription = new Map<Network, Subscription>();

  protected abstract _refresh(
    network: Network,
    intervalNum: number
  ): Promise<CacheSchema<T>>;

  /** Emits a subject key (network, key) tuple every time a new subject is registered */
  protected subjectRegistered = new BehaviorSubject<SubjectKey | null>(null);

  /** Mapping of data monitored by the registry */
  protected networkSubjects = new Map<Network, SubjectMap<T>>();

  /** Last time the network was updated for a given block */
  protected lastUpdateBlock = new Map<Network, BehaviorSubject<number>>();

  /** Last time the timestamp was updated for a given block */
  protected lastUpdateTimestamp = new Map<Network, BehaviorSubject<number>>();

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
        this._addSubjectKey(subjects, data.network, key, value);
      }
    });

    // Update global counters for the given network
    this.lastUpdateBlock.get(data.network)?.next(data.lastUpdateBlock);
    this.lastUpdateTimestamp.get(data.network)?.next(data.lastUpdateTimestamp);
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
    if (!this.networkSubjects.has(network)) {
      // Initialize the network if it does not yet exist
      this._initializeNetworkSubject(network);
    }
    const subjects = this._getNetworkSubjects(network);

    if (allowUpdate && subjects.has(key)) {
      subjects.get(key)?.next(value);
    } else if (!subjects.has(key)) {
      // Do not re-register the subject key if it is already registered
      this._addSubjectKey(subjects, network, key, value);
    }
  }

  /** Stops refreshes on the selected network */
  public stopRefresh(network: Network) {
    this._intervalSubscription.get(network)?.unsubscribe();
    this._interval.delete(network);
    this._intervalMS.delete(network);
  }

  /** Starts refreshes on the network at the specified interval */
  public startRefreshInterval(network: Network, intervalMS: number) {
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
   *
   * @param checkFreshness (default: 1) ensures that the returned value is within certain refresh intervals. Set
   * this to zero if no refresh check is desired
   */
  public getLatestFromSubject(
    network: Network,
    key: string,
    checkFreshness = 1
  ) {
    if (checkFreshness > 0) {
      const updateTimestamp = this.getLastUpdateTimestamp(network);
      const intervalMS = this._intervalMS.get(network);
      if (!intervalMS) throw Error(`${key} on ${network} is not refreshing`);
      if (updateTimestamp + intervalMS * checkFreshness < getNowSeconds()) {
        throw Error(
          `${key} on ${network} has missed ${Math.floor(
            updateTimestamp - getNowSeconds() / intervalMS
          )} refreshes`
        );
      }
    }

    return this._getNetworkSubjects(network).get(key)?.value;
  }

  /**
   * Returns the latest value from all subjects (if a value is set)
   */
  public getLatestFromAllSubjects(network: Network) {
    return this.getAllSubjectKeys(network).reduce((map, k) => {
      const v = this.getLatestFromSubject(network, k);
      if (v) map.set(k, v);
      return map;
    }, new Map<string, T>());
  }
}
