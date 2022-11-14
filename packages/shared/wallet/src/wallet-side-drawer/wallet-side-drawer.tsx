import { useEffect } from 'react';
import { Box, styled } from '@mui/material';
import { SideDrawer } from '@notional-finance/mui';
import { CloseX } from '@notional-finance/icons';
import {
  SIDEBAR_CATEGORIES,
  THEME_VARIANTS,
} from '@notional-finance/shared-config';
import { useQueryParams } from '@notional-finance/utils';
import { NotionalTheme, useNotionalTheme } from '@notional-finance/styles';
import { useWalletSideDrawer } from '../hooks';
import {
  updateSideDrawerState,
  useSideDrawerManager,
} from '@notional-finance/shared-web';
import { FormattedMessage } from 'react-intl';
import SettingsSideDrawer from '../settings-side-drawer/settings-side-drawer';
import NotificationsSideDrawer from '../notifications-side-drawer/notifications-side-drawer';
import ConnectWalletSideDrawer from '../connect-wallet-side-drawer/connect-wallet-side-drawer';

interface SettingsButtonProps {
  theme: NotionalTheme;
  currentSidebar: string;
}

export function WalletSideDrawer() {
  const theme = useNotionalTheme(THEME_VARIANTS.LIGHT);
  const { sideDrawer } = useQueryParams();
  const { setWalletSideDrawer, deleteWalletSideDrawer } = useWalletSideDrawer();
  const sideDrawerKey = sideDrawer
    ? (sideDrawer as SIDEBAR_CATEGORIES)
    : undefined;

  const {
    SideDrawerComponent,
    currentSideDrawerId,
    drawerOpen,
    addSideDrawers,
  } = useSideDrawerManager(sideDrawerKey);

  useEffect(() => {
    addSideDrawers({
      [SIDEBAR_CATEGORIES.SETTINGS]: SettingsSideDrawer,
      [SIDEBAR_CATEGORIES.NOTIFICATIONS]: NotificationsSideDrawer,
      [SIDEBAR_CATEGORIES.CONNECT_WALLET]: ConnectWalletSideDrawer,
    });
  }, []);

  const showSettingsHeader =
    currentSideDrawerId === SIDEBAR_CATEGORIES.SETTINGS ||
    currentSideDrawerId === SIDEBAR_CATEGORIES.NOTIFICATIONS;

  useEffect(() => {
    if (SideDrawerComponent) {
      updateSideDrawerState({ sideDrawerOpen: true });
    }
  }, [SideDrawerComponent]);

  const handleClick = (key: string) => {
    setWalletSideDrawer(key);
  };

  const handleDrawer = (drawerState: boolean) => {
    if (drawerState === false) {
      deleteWalletSideDrawer();
    }
    updateSideDrawerState({ sideDrawerOpen: drawerState });
  };

  const SettingsHeader = currentSideDrawerId
    ? () => {
        return (
          <HeaderContainer theme={theme}>
            <SettingsButton
              onClick={() => handleClick(SIDEBAR_CATEGORIES.SETTINGS)}
              currentSidebar={currentSideDrawerId}
              theme={theme}
            >
              <FormattedMessage defaultMessage="Settings" />
            </SettingsButton>
            <NotificationsButton
              onClick={() => handleClick(SIDEBAR_CATEGORIES.NOTIFICATIONS)}
              currentSidebar={currentSideDrawerId}
              theme={theme}
            >
              <FormattedMessage defaultMessage="Notifications" />
            </NotificationsButton>
            <CloseButton theme={theme}>
              <CloseX
                onClick={() => handleDrawer(false)}
                style={{
                  stroke: theme.palette.primary.contrastText,
                  float: 'right',
                  cursor: 'pointer',
                }}
              />
            </CloseButton>
          </HeaderContainer>
        );
      }
    : undefined;

  const ConnectWalletHeader = () => {
    return (
      <ConnectWalletContainer theme={theme}>
        <CloseButton theme={theme}>
          <CloseX
            onClick={() => handleDrawer(false)}
            style={{
              stroke: theme.palette.primary.contrastText,
              float: 'right',
              cursor: 'pointer',
            }}
          />
        </CloseButton>
      </ConnectWalletContainer>
    );
  };

  return (
    <SideDrawer
      callback={handleDrawer}
      drawerOpen={drawerOpen}
      CustomHeader={showSettingsHeader ? SettingsHeader : ConnectWalletHeader}
    >
      {SideDrawerComponent && <SideDrawerComponent />}
    </SideDrawer>
  );
}

const HeaderContainer = styled(Box)(
  ({ theme }) => `
  margin-top: 74px;
  font-size: 20px;
  display: flex;
  background: ${theme.palette.background.accentDefault};
  font-weight: 500;
  color: ${theme.palette.primary.contrastText};
  min-height: 70px;
  align-items: center;
`
);

const ConnectWalletContainer = styled(Box)(
  ({ theme }) => `
  margin-top: 74px;
  font-size: 20px;
  display: flex;
  font-weight: 500;
  color: ${theme.palette.primary.contrastText};
  min-height: 70px;
  align-items: center;
  justify-content: flex-end;
  width: 100%;
    `
);

const CloseButton = styled(Box)(
  ({ theme }) => `
  display: flex;
  width: 70px;
  justify-content: center;
  align-items: center;
  height: 65%;
  border-left: 1px solid ${theme.palette.primary.contrastText};
    `
);

const SettingsButton = styled(Box, {
  shouldForwardProp: (prop: string) => prop !== 'currentSidebar',
})(
  ({ theme, currentSidebar }: SettingsButtonProps) => `
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  cursor: pointer;
  border-bottom: 5px solid transparent;
  ${
    currentSidebar === SIDEBAR_CATEGORIES.SETTINGS &&
    `color: ${theme.palette.info.main};
    border-bottom: 5px solid ${theme.palette.info.main};
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;`
  }
    `
);

const NotificationsButton = styled(Box, {
  shouldForwardProp: (prop: string) => prop !== 'currentSidebar',
})(
  ({ theme, currentSidebar }: SettingsButtonProps) => `
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  cursor: pointer;
  border-bottom: 5px solid transparent;
  ${
    currentSidebar === SIDEBAR_CATEGORIES.NOTIFICATIONS &&
    `color: ${theme.palette.info.main};
    border-bottom: 5px solid ${theme.palette.info.main};
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;`
  }
    `
);

export default WalletSideDrawer;
