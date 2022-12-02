import { makeStore } from '@notional-finance/notionable';
import { Observable } from 'rxjs';

export interface SideDrawerState {
  sideDrawerOpen: boolean;
  currentSideDrawerKey: string | null;
}

export const initialSideDrawerState = {
  sideDrawerOpen: false,
  currentSideDrawerKey: null,
};

const {
  updateState: updateSideDrawerState,
  _state$: sideDrawerState$,
  selectState: selectSideDrawerState,
} = makeStore<SideDrawerState>(initialSideDrawerState);

export const sideDrawerOpen$ = selectSideDrawerState('sideDrawerOpen') as Observable<boolean>;
export const currentSideDrawerKey$ = selectSideDrawerState('currentSideDrawerKey') as Observable<string | null>;

export { updateSideDrawerState, selectSideDrawerState, sideDrawerState$ };
