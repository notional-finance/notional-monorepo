import { useObservableState } from 'observable-hooks';
import { SIDE_DRAWERS_TYPE } from '@notional-finance/shared-config';
import { sideDrawerOpen$, currentSideDrawerKey$ } from './side-drawer-store';

export function useSideDrawerState() {
  const sideDrawerOpen = useObservableState(sideDrawerOpen$, false);
  const currentSideDrawerKey = useObservableState(currentSideDrawerKey$, null) as SIDE_DRAWERS_TYPE;

  return {
    sideDrawerOpen,
    currentSideDrawerKey,
  };
}
