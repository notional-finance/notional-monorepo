import { logError } from '@notional-finance/util';
import { Subject } from 'rxjs';
import { NotionalError } from '../types';

const errorSubject = new Subject<NotionalError>();

export const errors$ = errorSubject.asObservable();

export function reportNotionalError(
  error: NotionalError,
  module: string,
  method: string,
  context?: Record<string, unknown>
) {
  errorSubject.next(error);
  logError(error, module, method, context);
}
