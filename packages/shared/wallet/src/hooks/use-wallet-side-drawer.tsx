import { SETTINGS_SIDE_DRAWERS } from '@notional-finance/util';
import { useSideDrawerState } from '@notional-finance/notionable-hooks';
import SettingsSideDrawer from '../settings-side-drawer/settings-side-drawer';
import NotificationsSideDrawer from '../notifications-side-drawer/notifications-side-drawer';
import ConnectWalletSideDrawer from '../connect-wallet-side-drawer/connect-wallet-side-drawer';

export const useWalletSideDrawer = () => {
  const { sideDrawerOpen, currentSideDrawerKey } = useSideDrawerState();

  const drawers = {
    [SETTINGS_SIDE_DRAWERS.SETTINGS]: SettingsSideDrawer,
    [SETTINGS_SIDE_DRAWERS.NOTIFICATIONS]: NotificationsSideDrawer,
    [SETTINGS_SIDE_DRAWERS.CONNECT_WALLET]: ConnectWalletSideDrawer,
  };

  const SideDrawerComponent =
    currentSideDrawerKey && drawers[currentSideDrawerKey]
      ? drawers[currentSideDrawerKey]
      : null;

  const openDrawer = SideDrawerComponent && sideDrawerOpen ? true : false;

  return { SideDrawerComponent, openDrawer, currentSideDrawerKey };
};

export default useWalletSideDrawer;
