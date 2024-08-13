import { makeAutoObservable, runInAction } from 'mobx';
import { useObserver } from 'mobx-react-lite';
import { useEffect, useCallback, useMemo } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import {
  PORTFOLIO_ACTIONS,
  SIDE_DRAWERS,
  PORTFOLIO_CATEGORIES,
  SIDE_DRAWERS_TYPE,
} from '@notional-finance/util';

// MobX Store
class SideDrawerStore {
  sideDrawerOpen = false;
  currentSideDrawerKey: SIDE_DRAWERS_TYPE | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  updateState(
    sideDrawerOpen: boolean,
    currentSideDrawerKey: SIDE_DRAWERS_TYPE | null
  ) {
    this.sideDrawerOpen = sideDrawerOpen;
    this.currentSideDrawerKey = currentSideDrawerKey;
  }
}

const sideDrawerStore = new SideDrawerStore();

export function useSideDrawerState() {
  return useObserver(() => ({
    sideDrawerOpen: sideDrawerStore.sideDrawerOpen,
    currentSideDrawerKey: sideDrawerStore.currentSideDrawerKey,
  }));
}

export interface PortfolioParams extends Record<string, string | undefined> {
  category?: PORTFOLIO_CATEGORIES;
  sideDrawerKey?: PORTFOLIO_ACTIONS;
}

// Main hook
export const useSideDrawerManager = () => {
  const navigate = useNavigate();
  const { search, pathname } = useLocation();
  const params = useParams<PortfolioParams>();
  const searchParams = useMemo(() => new URLSearchParams(search), [search]);
  const { currentSideDrawerKey, sideDrawerOpen } = useSideDrawerState();

  useEffect(() => {
    if (
      params?.sideDrawerKey &&
      !currentSideDrawerKey &&
      Object.values(SIDE_DRAWERS).includes(
        params.sideDrawerKey as unknown as SIDE_DRAWERS_TYPE
      ) &&
      !sideDrawerOpen
    ) {
      runInAction(() => {
        sideDrawerStore.updateState(
          true,
          params.sideDrawerKey as SIDE_DRAWERS_TYPE
        );
      });
    }
  }, [params?.sideDrawerKey, currentSideDrawerKey, sideDrawerOpen]);

  const setWalletSideDrawer = useCallback(
    (key: string, overRide?: boolean) => {
      if (!currentSideDrawerKey || overRide) {
        searchParams.set('sideDrawer', key);
        navigate(`${pathname}?${searchParams.toString()}`);
        runInAction(() => {
          sideDrawerStore.updateState(true, key as SIDE_DRAWERS_TYPE);
        });
      }
    },
    [navigate, searchParams, pathname, currentSideDrawerKey]
  );

  const clearWalletSideDrawer = useCallback(() => {
    searchParams.delete('sideDrawer');
    navigate(`${pathname}?${searchParams.toString()}`);
    runInAction(() => {
      sideDrawerStore.updateState(false, null);
    });
  }, [navigate, searchParams, pathname]);

  const setSideDrawer = useCallback(
    (newPath: string, key: SIDE_DRAWERS_TYPE) => {
      if (
        !currentSideDrawerKey ||
        currentSideDrawerKey === PORTFOLIO_ACTIONS.MANAGE_VAULT
      ) {
        navigate(newPath);
        runInAction(() => {
          sideDrawerStore.updateState(true, key);
        });
      }
    },
    [navigate, currentSideDrawerKey]
  );

  const clearSideDrawer = useCallback(
    (key?: string) => {
      if (key) {
        navigate(key);
      }
      runInAction(() => {
        sideDrawerStore.updateState(false, null);
      });
    },
    [navigate]
  );

  return {
    setSideDrawer,
    clearSideDrawer,
    setWalletSideDrawer,
    clearWalletSideDrawer,
  };
};

export default useSideDrawerManager;
