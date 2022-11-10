import { TokenBalance, selectWalletState } from '@notional-finance/notionable';
import {
  scan,
  distinctUntilChanged,
  BehaviorSubject,
  Subject,
  shareReplay,
  Observable,
} from 'rxjs';

export type TokenApprovalStatus =
  | 'APPROVED'
  | 'UNAPPROVED'
  | 'PENDING'
  | 'ERROR'
  | 'SUCCESS'
  | 'LOADING';

export interface TokenApprovalState {
  [key: string]: TokenApprovalStatus;
}

const tokens$ = selectWalletState('tokens') as Observable<Map<string, TokenBalance>>;
const initialState: TokenApprovalState = {};
const _tokenApprovalStoreBS = new BehaviorSubject<TokenApprovalState>(initialState);
const _tokenApprovalUpdateSubject = new Subject<TokenApprovalState>();

_tokenApprovalUpdateSubject
  .pipe(scan((state, update) => ({ ...state, ...update }), initialState))
  .subscribe(_tokenApprovalStoreBS);

const getApprovalStatus = (token: TokenBalance): TokenApprovalStatus => {
  const { symbol, allowance } = token;
  const existingStatus = _tokenApprovalStoreBS.value[symbol];
  const newStatus = allowance.isPositive() ? 'APPROVED' : 'UNAPPROVED';

  return newStatus === existingStatus ? existingStatus : newStatus;
};

// external api
export const updateTokenStatus = (status: TokenApprovalState) => {
  _tokenApprovalUpdateSubject.next(status);
};

// input streams
tokens$
  .pipe(
    distinctUntilChanged((prev, curr) => {
      return [...curr.entries()].every(([key, token]) => {
        const prevTokenAllowance = prev.get(key)?.allowance;
        const currTokenAllowance = token?.allowance;

        return (
          !!prevTokenAllowance && !!currTokenAllowance && prevTokenAllowance.eq(currTokenAllowance)
        );
      });
    })
  )
  .subscribe((tokens) => {
    const tokenApprovalState = [...tokens.entries()].reduce(
      (acc, [key, token]) => ({ ...acc, [key]: getApprovalStatus(token) }),
      {}
    );
    updateTokenStatus(tokenApprovalState);
  });

// output streams
export const tokenApprovalState$ = _tokenApprovalStoreBS.asObservable().pipe(shareReplay(1));
