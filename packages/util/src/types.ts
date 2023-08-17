import { Observable } from 'rxjs';

type GenericObservable<T> = Observable<T>;
export type ExtractObservableReturn<T> = T extends GenericObservable<infer X>
  ? X
  : never;
