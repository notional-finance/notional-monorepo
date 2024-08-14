import { Box, styled, useTheme } from '@mui/material';
import { SideDrawer } from '@notional-finance/mui';
import { CloseX } from '@notional-finance/icons';
import { SETTINGS_SIDE_DRAWERS, THEME_VARIANTS } from '@notional-finance/util';
import { NotionalTheme, useNotionalTheme } from '@notional-finance/styles';
import { useSideDrawerManager } from '@notional-finance/notionable-hooks';
import { useWalletSideDrawer } from '../hooks';
import { FormattedMessage } from 'react-intl';

interface SettingsButtonProps {
  theme: NotionalTheme;
  currentSidebar: string;
}

export function WalletSideDrawer() {
  const lightTheme = useNotionalTheme(THEME_VARIANTS.LIGHT);
  const defaultTheme = useTheme();
  const { clearWalletSideDrawer, setWalletSideDrawer } = useSideDrawerManager();
  const { SideDrawerComponent, openDrawer, currentSideDrawerKey } =
    useWalletSideDrawer();
  const showSettingsHeader =
    currentSideDrawerKey === SETTINGS_SIDE_DRAWERS.SETTINGS ||
    currentSideDrawerKey === SETTINGS_SIDE_DRAWERS.NOTIFICATIONS;

  const handleClick = (key: string) => {
    setWalletSideDrawer(key, true);
  };

  const handleDrawer = () => {
    clearWalletSideDrawer();
  };

  const SettingsHeader = currentSideDrawerKey
    ? () => {
        return (
          <HeaderContainer theme={lightTheme}>
            <SettingsButton
              onClick={() => handleClick(SETTINGS_SIDE_DRAWERS.SETTINGS)}
              currentSidebar={currentSideDrawerKey}
              theme={lightTheme}
            >
              <FormattedMessage defaultMessage="Settings" />
            </SettingsButton>
            <NotificationsButton
              onClick={() => handleClick(SETTINGS_SIDE_DRAWERS.NOTIFICATIONS)}
              currentSidebar={currentSideDrawerKey}
              theme={lightTheme}
            >
              <FormattedMessage defaultMessage="Notifications" />
            </NotificationsButton>
            <CloseButton theme={lightTheme}>
              <CloseX
                onClick={() => handleDrawer()}
                style={{
                  stroke: lightTheme.palette.primary.contrastText,
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
      <ConnectWalletContainer theme={defaultTheme}>
        <CloseButton theme={defaultTheme}>
          <CloseX
            onClick={() => handleDrawer()}
            style={{
              stroke: defaultTheme.palette.primary.dark,
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
      openDrawer={openDrawer}
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
  margin-top: ${theme.spacing(9.25)};
  font-size: 20px;
  display: flex;
  font-weight: 500;
  color: ${theme.palette.primary.contrastText};
  min-height: 70px;
  align-items: center;
  justify-content: flex-end;
  width: 100%;
  ${theme.breakpoints.down('sm')} {
    margin-top: 0px;
    z-index: 1210;
  }
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
    currentSidebar === SETTINGS_SIDE_DRAWERS.SETTINGS &&
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
    currentSidebar === SETTINGS_SIDE_DRAWERS.NOTIFICATIONS &&
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
