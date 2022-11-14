import {
  SIDEBAR_CATEGORIES,
  PORTFOLIO_ACTIONS,
  SIDE_DRAWERS,
} from '@notional-finance/shared-config';
import { useState } from 'react';
import { useSideDrawerState } from './store/use-side-drawer-state';

export const GetNotified = () => {
  return <div>Get Notified</div>;
};
export const RemindMe = () => {
  return <div>Remind Me</div>;
};
export const ConvertCashToNToken = () => {
  return <div>Convert Cash To nTokens</div>;
};

export const useSideDrawerManager = (key?: SIDE_DRAWERS) => {
  const { sideDrawerOpen } = useSideDrawerState();
  const [sideDrawers, setSideDrawers] = useState<
    Record<SIDE_DRAWERS, React.ElementType>
  >({} as Record<SIDE_DRAWERS, React.ElementType>);

  const SideDrawerComponent =
    key && sideDrawers[key] ? sideDrawers[key] : undefined;
  const drawerOpen = sideDrawerOpen && SideDrawerComponent ? true : false;

  const addSideDrawers = (drawers) => {
    setSideDrawers({ ...sideDrawers, ...drawers });
  };
  return {
    currentSideDrawerId: key,
    SideDrawerComponent,
    drawerOpen,
    addSideDrawers,
  };
};
