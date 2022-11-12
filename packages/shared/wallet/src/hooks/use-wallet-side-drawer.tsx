import { useLocation, useHistory } from 'react-router-dom';
import { updateSideDrawerState } from '@notional-finance/shared-web';

export const useWalletSideDrawer = () => {
  const history = useHistory();
  const { search, pathname } = useLocation();
  const searchParams = new URLSearchParams(search);

  const setWalletSideDrawer = (key: string) => {
    searchParams.set('sideDrawer', key);
    history.push(`${pathname}?${searchParams.toString()}`);
  };
  const deleteWalletSideDrawer = () => {
    updateSideDrawerState({ sideDrawerOpen: false });
    searchParams.delete('sideDrawer');
    history.push(`${pathname}?${searchParams.toString()}`);
  };

  return {
    setWalletSideDrawer,
    deleteWalletSideDrawer,
  };
};

export default useWalletSideDrawer;
