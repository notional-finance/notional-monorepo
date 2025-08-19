import { PORTFOLIO_ACTIONS } from '@notional-finance/util';
import { useSideDrawerState } from '@notional-finance/notionable-hooks';
import { CoolDownDrawer } from '../side-drawers';

export const usePortfolioSideDrawers = () => {
  const { sideDrawerOpen, currentSideDrawerKey } = useSideDrawerState();

  const drawers = {
    [PORTFOLIO_ACTIONS.COOL_DOWN]: CoolDownDrawer,
  };

  const SideDrawerComponent =
    currentSideDrawerKey && drawers[currentSideDrawerKey]
      ? drawers[currentSideDrawerKey]
      : null;

  const openDrawer = SideDrawerComponent && sideDrawerOpen ? true : false;

  return { SideDrawerComponent, openDrawer, currentSideDrawerKey };
};

export default usePortfolioSideDrawers;
