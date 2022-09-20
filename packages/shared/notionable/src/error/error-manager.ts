import { Subject } from 'rxjs';

export interface NotionalError extends Error {
  msgId?: string;
  code?: number;
}

const errorSubject = new Subject<NotionalError>();

export const errors$ = errorSubject.asObservable();

export function reportError(error: NotionalError) {
  errorSubject.next(error);
}
