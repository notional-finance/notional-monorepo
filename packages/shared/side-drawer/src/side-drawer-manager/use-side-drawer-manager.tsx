import {
  SETTINGS_SIDE_DRAWERS,
  PORTFOLIO_ACTIONS,
  SIDE_DRAWERS,
  PORTFOLIO_CATEGORIES,
  SIDE_DRAWERS_TYPE,
} from '@notional-finance/shared-config';
import { useLocation, useHistory, useParams } from 'react-router-dom';
import { useSideDrawerState } from './store/use-side-drawer-state';
import { updateSideDrawerState } from './store/side-drawer-store';

export const GetNotified = () => {
  return <div>Get Notified</div>;
};
export const RemindMe = () => {
  return <div>Remind Me</div>;
};
export const ConvertCashToNToken = () => {
  return <div>Convert Cash To nTokens</div>;
};

export interface PortfolioParams {
  category?: PORTFOLIO_CATEGORIES;
  sideDrawerKey?: PORTFOLIO_ACTIONS;
}

export const useSideDrawerManager = () => {
  const history = useHistory();
  const { search, pathname } = useLocation();
  const params = useParams<PortfolioParams>();
  const searchParams = new URLSearchParams(search);
  const { currentSideDrawerKey, sideDrawerOpen } = useSideDrawerState();

  if (
    params?.sideDrawerKey &&
    !currentSideDrawerKey &&
    Object.values(SIDE_DRAWERS).includes(
      params.sideDrawerKey as unknown as SIDE_DRAWERS_TYPE
    ) &&
    !sideDrawerOpen
  ) {
    updateSideDrawerState({
      sideDrawerOpen: true,
      currentSideDrawerKey: params?.sideDrawerKey,
    });
  }

  const setWalletSideDrawer = (key: string, overRide?: boolean) => {
    if (!currentSideDrawerKey || overRide) {
      searchParams.set('sideDrawer', key);
      history.push(`${pathname}?${searchParams.toString()}`);
      updateSideDrawerState({
        sideDrawerOpen: true,
        currentSideDrawerKey: key,
      });
    }
  };

  const clearWalletSideDrawer = () => {
    searchParams.delete('sideDrawer');
    history.push(`${pathname}?${searchParams.toString()}`);
    updateSideDrawerState({
      sideDrawerOpen: false,
      currentSideDrawerKey: null,
    });
  };

  const setSideDrawer = (newPath: string, key: PORTFOLIO_ACTIONS) => {
    if (!currentSideDrawerKey) {
      history.push(newPath);
      updateSideDrawerState({
        sideDrawerOpen: true,
        currentSideDrawerKey: key,
      });
    }
  };

  const clearSideDrawer = (key: string) => {
    history.push(key);
    updateSideDrawerState({
      sideDrawerOpen: false,
      currentSideDrawerKey: null,
    });
  };

  return {
    setSideDrawer,
    clearSideDrawer,
    setWalletSideDrawer,
    clearWalletSideDrawer,
  };
};

export default useSideDrawerManager;
