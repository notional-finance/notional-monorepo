import { Subject } from 'rxjs';
import { NotionalError } from '../types';

const errorSubject = new Subject<NotionalError>();

export const errors$ = errorSubject.asObservable();

export function reportError(error: NotionalError) {
  errorSubject.next(error);
}
