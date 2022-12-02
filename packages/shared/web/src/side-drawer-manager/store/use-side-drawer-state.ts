import { useObservableState } from 'observable-hooks';
import { sideDrawerOpen$, currentSideDrawerKey$ } from './side-drawer-store';

export function useSideDrawerState() {
  const sideDrawerOpen = useObservableState(sideDrawerOpen$, false);
  const currentSideDrawerKey = useObservableState(currentSideDrawerKey$, null);

  return {
    sideDrawerOpen,
    currentSideDrawerKey,
  };
}
