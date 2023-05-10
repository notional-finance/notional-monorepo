import { filter, OperatorFunction } from 'rxjs';

/** RxJS filter to remove undefined and null values, also rewrites the returned type appropriately */
export function filterEmpty<T>() {
  return filter<T>((v) => v !== undefined && v !== null) as OperatorFunction<
    T,
    NonNullable<T>
  >;
}
