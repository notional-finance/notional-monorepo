import { filter, OperatorFunction } from 'rxjs';

export function filterEmpty<T>() {
  return filter<T>((v) => v !== undefined && v !== null) as OperatorFunction<
    T,
    NonNullable<T>
  >;
}
