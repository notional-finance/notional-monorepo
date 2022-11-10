import { BehaviorSubject, shareReplay } from 'rxjs';

const _stakedNoteInputStringBS = new BehaviorSubject<string>('');
export const stakedNoteInputString$ = _stakedNoteInputStringBS.asObservable().pipe(shareReplay(1));

export function setStakedNOTEInputString(input: string) {
  _stakedNoteInputStringBS.next(input);
}
