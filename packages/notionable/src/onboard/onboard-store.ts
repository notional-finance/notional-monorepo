import { providers } from 'ethers';
import {
  BehaviorSubject,
  distinctUntilKeyChanged,
  map,
  Observable,
  scan,
  shareReplay,
  Subject,
} from 'rxjs';
import { SupportedWallet } from '../types';
import { ConnectedChain } from '@web3-onboard/core';
import { Chain } from '@web3-onboard/common';

export interface OnboardState {
  connected: boolean;
  chain: ConnectedChain | null;
  address: string;
  icon: string;
  label: string;
  signer: providers.JsonRpcSigner | null;
  // The chains onboard was initialized with
  chains: Chain[];
  modules: SupportedWallet[];
  accounts: string[];
}

export type OnboardStateKeys = keyof OnboardState;

export const initialOnboardState: OnboardState = {
  connected: false,
  chain: null,
  address: '',
  icon: '',
  label: '',
  signer: null,
  chains: [],
  modules: [],
  accounts: [],
};

export const resetOnboardState: Partial<OnboardState> = {
  connected: false,
  chain: null,
  address: '',
  icon: '',
  label: '',
  signer: null,
  accounts: [],
};

const _onboardStore = new BehaviorSubject<OnboardState>(initialOnboardState);
const _updateSubject = new Subject<Partial<OnboardState>>();

_updateSubject
  .pipe(scan((state, update) => ({ ...state, ...update }), initialOnboardState))
  .subscribe(_onboardStore);

export const onboardState$ = _onboardStore.asObservable().pipe(shareReplay(1));
export function updateOnboardState(update: Partial<OnboardState>) {
  _updateSubject.next(update);
}

export function selectOnboardState(key: OnboardStateKeys) {
  return onboardState$.pipe(
    distinctUntilKeyChanged(key),
    map((state) => state[key])
  );
}

export const onboardConnected$ = selectOnboardState(
  'connected'
) as Observable<boolean>;

export const signer$ = selectOnboardState(
  'signer'
) as Observable<providers.JsonRpcSigner | null>;
export const address$ = selectOnboardState('address') as Observable<string>;
export const modules$ = selectOnboardState('modules') as Observable<
  SupportedWallet[]
>;
