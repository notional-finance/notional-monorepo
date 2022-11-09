import { makeStore } from '@notional-finance/notionable';
import { Observable } from 'rxjs';

export interface SideDrawerState {
  sideDrawerOpen: boolean;
}

export const initialSideDrawerState = {
  sideDrawerOpen: false,
};

const {
  updateState: updateSideDrawerState,
  _state$: sideDrawerState$,
  selectState: selectSideDrawerState,
} = makeStore<SideDrawerState>(initialSideDrawerState);

export const sideDrawerOpen$ = selectSideDrawerState('sideDrawerOpen') as Observable<boolean>;

export { updateSideDrawerState, selectSideDrawerState, sideDrawerState$ };
