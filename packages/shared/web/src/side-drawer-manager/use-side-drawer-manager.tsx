import { useEffect } from 'react';
import {
  SETTINGS_SIDE_DRAWERS,
  PORTFOLIO_ACTIONS,
  SIDE_DRAWERS,
  PORTFOLIO_CATEGORIES,
  SIDE_DRAWERS_TYPE,
} from '@notional-finance/shared-config';
import { useQueryParams } from '@notional-finance/utils';
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
  const { sideDrawer } = useQueryParams();
  const { search, pathname } = useLocation();
  const params = useParams<PortfolioParams>();
  const searchParams = new URLSearchParams(search);
  const { sideDrawerOpen, currentSideDrawerKey } = useSideDrawerState();

  useEffect(() => {
    if (sideDrawerOpen && (!params?.sideDrawerKey || !sideDrawer))
      updateSideDrawerState({
        sideDrawerOpen: false,
        currentSideDrawerKey: null,
      });
  }, [params?.sideDrawerKey, sideDrawer, sideDrawerOpen]);

  if (
    sideDrawer &&
    !currentSideDrawerKey &&
    Object.values(SIDE_DRAWERS).includes(
      sideDrawer as unknown as SIDE_DRAWERS_TYPE
    ) &&
    !sideDrawerOpen
  ) {
    updateSideDrawerState({
      sideDrawerOpen: true,
      currentSideDrawerKey: sideDrawer,
    });
  }

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

  const setWalletSideDrawer = (key: string) => {
    if (!currentSideDrawerKey) {
      searchParams.set('sideDrawer', key);
      history.push(`${pathname}?${searchParams.toString()}`);
    }
  };

  const deleteWalletSideDrawer = () => {
    updateSideDrawerState({
      sideDrawerOpen: false,
      currentSideDrawerKey: null,
    });
    searchParams.delete('sideDrawer');
    history.push(`${pathname}?${searchParams.toString()}`);
  };

  return {
    setWalletSideDrawer,
    deleteWalletSideDrawer,
  };
};
