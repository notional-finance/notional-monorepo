import { useObservableState } from 'observable-hooks';
import { sideDrawerOpen$ } from './side-drawer-store';

export function useSideDrawerState() {
  const sideDrawerOpen = useObservableState(sideDrawerOpen$, false);

  return {
    sideDrawerOpen,
  };
}
