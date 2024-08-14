import { types } from 'mobx-state-tree';
import { useObserver } from 'mobx-react-lite';
import { useCallback } from 'react';
import { useLocation, useParams, useNavigate, NavigateFunction } from 'react-router-dom';
import {
  PORTFOLIO_ACTIONS,
  SIDE_DRAWERS,
  PORTFOLIO_CATEGORIES,
  SIDE_DRAWERS_TYPE,
} from '@notional-finance/util';

export interface PortfolioParams extends Record<string, string | undefined> {
  category?: PORTFOLIO_CATEGORIES;
  sideDrawerKey?: PORTFOLIO_ACTIONS;
}

const SideDrawerModel = types
  .model('SideDrawer', {
    sideDrawerOpen: types.optional(types.boolean, false),
    currentSideDrawerKey: types.maybeNull(types.string),
  })
  .actions((self) => ({
    setWalletSideDrawer(key: string, overRide: boolean, navigate: NavigateFunction, search: string, pathname: string) {
      if (!self.currentSideDrawerKey || overRide) {
        const searchParams = new URLSearchParams(search);
        searchParams.set('sideDrawer', key);
        navigate(`${pathname}?${searchParams.toString()}`);
        self.sideDrawerOpen = true;
        self.currentSideDrawerKey = key as SIDE_DRAWERS_TYPE;
      }
    },
    clearWalletSideDrawer(navigate: NavigateFunction, search: string, pathname: string) {
      const searchParams = new URLSearchParams(search);
      searchParams.delete('sideDrawer');
      navigate(`${pathname}?${searchParams.toString()}`);
      self.sideDrawerOpen = false;
      self.currentSideDrawerKey = null;
    },
    setSideDrawer(newPath: string, key: SIDE_DRAWERS_TYPE, navigate: NavigateFunction) {
      if (
        !self.currentSideDrawerKey ||
        self.currentSideDrawerKey === PORTFOLIO_ACTIONS.MANAGE_VAULT
      ) {
        navigate(newPath);
        self.sideDrawerOpen = true;
        self.currentSideDrawerKey = key;
      }
    },
    clearSideDrawer(key: string | undefined, navigate: NavigateFunction) {
      if (key) {
        navigate(key);
      }
      self.sideDrawerOpen = false;
      self.currentSideDrawerKey = null;
    },
    updateFromParams(sideDrawerKey: string | undefined) {
      if (
        sideDrawerKey &&
        !self.currentSideDrawerKey &&
        Object.values(SIDE_DRAWERS).includes(sideDrawerKey as unknown as SIDE_DRAWERS_TYPE) &&
        !self.sideDrawerOpen
      ) {
        self.sideDrawerOpen = true;
        self.currentSideDrawerKey = sideDrawerKey as SIDE_DRAWERS_TYPE;
      }
    },
  }));

const sideDrawerStore = SideDrawerModel.create();

export const useSideDrawerManager = () => {
  const navigate = useNavigate();
  const { search, pathname } = useLocation();
  const params = useParams<PortfolioParams>();

  const updateFromParams = useCallback(() => {
    sideDrawerStore.updateFromParams(params?.sideDrawerKey);
  }, [params?.sideDrawerKey]);

  return useObserver(() => {
    updateFromParams();
    return {
      setSideDrawer: (newPath: string, key: SIDE_DRAWERS_TYPE) => 
        sideDrawerStore.setSideDrawer(newPath, key, navigate),
      clearSideDrawer: (key?: string) => 
        sideDrawerStore.clearSideDrawer(key, navigate),
      setWalletSideDrawer: (key: string, overRide = false) => 
        sideDrawerStore.setWalletSideDrawer(key, overRide, navigate, search, pathname),
      clearWalletSideDrawer: () => 
        sideDrawerStore.clearWalletSideDrawer(navigate, search, pathname),
    };
  });
};

export default useSideDrawerManager;