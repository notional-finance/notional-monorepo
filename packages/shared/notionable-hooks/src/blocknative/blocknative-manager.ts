import BlocknativeSdk from 'bnc-sdk';
import { selectOnboardState } from '@notional-finance/notionable';
import {
  Subject,
  Subscription,
  fromEvent,
  ReplaySubject,
  combineLatest,
  Observable,
} from 'rxjs';
import { share, tap } from 'rxjs/operators';

const address$ = selectOnboardState('address') as Observable<string>;
const dappId = process.env['NX_BLOCK_NATIVE_DAPP_ID'] as string;
let blocknative: BlocknativeSdk;
let txnRefreshSub: Subscription;

const _txnConfirmed = new Subject<any | any>();
export const txnConfirmed$ = _txnConfirmed.asObservable().pipe(share());

const _blocknativeRS = new ReplaySubject<BlocknativeSdk>(1);
export const blocknative$ = _blocknativeRS.asObservable().pipe(share());

export function initBlocknativeSDK(networkId: number) {
  blocknative = new BlocknativeSdk({
    dappId,
    networkId,
  });
  _blocknativeRS.next(blocknative);
}

export function getBlocknativeSDK() {
  return blocknative;
}

combineLatest(address$, blocknative$).subscribe(([address, bn]) => {
  if (txnRefreshSub) txnRefreshSub.unsubscribe();
  if (address && bn) {
    const { emitter } = bn.account(address);
    txnRefreshSub = fromEvent(emitter, 'txConfirmed')
      .pipe(tap(() => console.log('transaction confirmed')))
      .subscribe((txnHash: any | any) => _txnConfirmed.next(txnHash));
  }
});
