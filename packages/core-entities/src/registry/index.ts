import { Network } from '@notional-finance/util';
import { BehaviorSubject } from 'rxjs';

export interface CacheSchema<T> {
  values: Array<[string, T | null]>;
  network: Network;
  lastUpdateTimestamp: number;
  lastUpdateBlock: number;
}

export type SubjectMap<T> = Map<string, BehaviorSubject<T | null>>;
