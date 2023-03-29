import {
  PORTFOLIO_ACTIONS,
  SIDE_DRAWERS,
  PORTFOLIO_CATEGORIES,
  SIDE_DRAWERS_TYPE,
} from '@notional-finance/shared-config';
import { useLocation, useHistory, useParams } from 'react-router-dom';
import { useSideDrawerState } from './store/use-side-drawer-state';
import { updateSideDrawerState } from './store/side-drawer-store';
import { useCallback, useMemo } from 'react';

export const GetNotified = () => {
  return <div>Get Notified</div>;
};
export const RemindMe = () => {
  return <div>Remind Me</div>;
};

export interface PortfolioParams {
  category?: PORTFOLIO_CATEGORIES;
  sideDrawerKey?: PORTFOLIO_ACTIONS;
}

export const useSideDrawerManager = () => {
  const history = useHistory();
  const { search, pathname } = useLocation();
  const params = useParams<PortfolioParams>();
  const searchParams = useMemo(() => new URLSearchParams(search), [search]);
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

  const setWalletSideDrawer = useCallback(
    (key: string, overRide?: boolean) => {
      if (!currentSideDrawerKey || overRide) {
        searchParams.set('sideDrawer', key);
        history.push(`${pathname}?${searchParams.toString()}`);
        updateSideDrawerState({
          sideDrawerOpen: true,
          currentSideDrawerKey: key,
        });
      }
    },
    [history, searchParams, pathname, currentSideDrawerKey]
  );

  const clearWalletSideDrawer = useCallback(() => {
    searchParams.delete('sideDrawer');
    history.push(`${pathname}?${searchParams.toString()}`);
    updateSideDrawerState({
      sideDrawerOpen: false,
      currentSideDrawerKey: null,
    });
  }, [history, searchParams, pathname]);

  const setSideDrawer = useCallback(
    (newPath: string, key: SIDE_DRAWERS_TYPE) => {
      if (
        !currentSideDrawerKey ||
        currentSideDrawerKey === PORTFOLIO_ACTIONS.MANAGE_VAULT
      ) {
        history.push(newPath);
        updateSideDrawerState({
          sideDrawerOpen: true,
          currentSideDrawerKey: key,
        });
      }
    },
    [history, currentSideDrawerKey]
  );

  const clearSideDrawer = useCallback(
    (key?: string) => {
      if (key) {
        history.push(key);
      }
      updateSideDrawerState({
        sideDrawerOpen: false,
        currentSideDrawerKey: null,
      });
    },
    [history]
  );

  return {
    setSideDrawer,
    clearSideDrawer,
    setWalletSideDrawer,
    clearWalletSideDrawer,
  };
};

export default useSideDrawerManager;
