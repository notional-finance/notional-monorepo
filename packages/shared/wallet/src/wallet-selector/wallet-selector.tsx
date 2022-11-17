import { useState, useEffect } from 'react';
import { Box, styled } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { FormattedMessage } from 'react-intl';
import {
  GearIcon,
  ActiveBellIcon,
  BellIcon,
  EyeIcon,
} from '@notional-finance/icons';
import { getFromLocalStorage } from '@notional-finance/helpers';
import WalletSideDrawer from '../wallet-side-drawer/wallet-side-drawer';
import { getNotificationsData } from './wallet-selector.service';
import NetworkSelector from '../network-selector/network-selector';
import { useOnboard, useAccount } from '@notional-finance/notionable-hooks';
import { useParams } from 'react-router-dom';
import { ProgressIndicator } from '@notional-finance/mui';
import { useWalletSideDrawer } from '../hooks';
import {
  PORTFOLIO_ACTIONS,
  PORTFOLIO_CATEGORIES,
  SIDEBAR_CATEGORIES,
} from '@notional-finance/shared-config';
import {
  useSideDrawerState,
  useSideDrawerManager,
} from '@notional-finance/shared-web';
import { ButtonText } from '@notional-finance/mui';

export interface PortfolioParams {
  category?: PORTFOLIO_CATEGORIES;
  sideDrawerKey?: PORTFOLIO_ACTIONS;
}

export function WalletSelector() {
  const theme = useTheme();
  const params = useParams<PortfolioParams>();
  const { connected, icon, label } = useOnboard();
  const { truncatedAddress } = useAccount();
  const [notificationsActive, setNotificationsActive] =
    useState<boolean>(false);
  const { drawerOpen } = useSideDrawerManager();
  const notifications = getFromLocalStorage('notifications');
  const { setWalletSideDrawer, deleteWalletSideDrawer } = useWalletSideDrawer();

  useEffect(() => {
    if (!notifications.blogData) {
      getNotificationsData().then((activeResult) =>
        activeResult ? setNotificationsActive(activeResult) : null
      );
    }
    setNotificationsActive(notifications.active);
  }, [notifications]);

  const handleClick = (key: SIDEBAR_CATEGORIES) => {
    if (drawerOpen) {
      deleteWalletSideDrawer();
    }

    if (!drawerOpen && !params?.sideDrawerKey) {
      setWalletSideDrawer(key);
    }
  };

  return (
    <>
      <OuterContainer>
        <Container>
          {connected && truncatedAddress && (
            <>
              {icon && icon.length > 0 && (
                <IconContainer>
                  <img
                    src={`data:image/svg+xml;base64,${icon}`}
                    alt={`${label} wallet icon`}
                    height="24px"
                    width="24px"
                  />
                </IconContainer>
              )}
              <Box
                sx={{
                  flex: 1,
                  margin: '0px 10px',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <ButtonText>{truncatedAddress}</ButtonText>
                <Box
                  sx={{ marginLeft: '10px', display: 'flex' }}
                  onClick={() => handleClick(SIDEBAR_CATEGORIES.NOTIFICATIONS)}
                >
                  {notificationsActive ? <ActiveBellIcon /> : <BellIcon />}
                </Box>
              </Box>
            </>
          )}

          {!connected && truncatedAddress && (
            <ProcessContainer
              onClick={() => handleClick(SIDEBAR_CATEGORIES.CONNECT_WALLET)}
            >
              <IconContainer>
                <EyeIcon />
              </IconContainer>
              <ButtonText
                sx={{ flex: 1, textAlign: 'center', alignSelf: 'center' }}
              >
                {truncatedAddress}
              </ButtonText>
            </ProcessContainer>
          )}
          {!connected && !truncatedAddress && (
            <ProcessContainer
              onClick={() => handleClick(SIDEBAR_CATEGORIES.CONNECT_WALLET)}
            >
              <ButtonText>
                <FormattedMessage defaultMessage="Connect a Wallet" />
              </ButtonText>
            </ProcessContainer>
          )}
          {connected && !truncatedAddress && (
            <ProcessContainer>
              <ProgressIndicator type="circular" size={18} />
            </ProcessContainer>
          )}
          <IconContainer
            sx={{ background: theme.palette.info.light }}
            onClick={() => handleClick(SIDEBAR_CATEGORIES.SETTINGS)}
          >
            <GearIcon />
          </IconContainer>
        </Container>
      </OuterContainer>
      <WalletSideDrawer />
      <NetworkSelector />
    </>
  );
}

const OuterContainer = styled(Box)(
  ({ theme }) => `
  display: flex;
  align-items: center;
  min-width: ${theme.spacing(30)};
`
);

const Container = styled(Box)(
  ({ theme }) => `
  display: flex;
  align-items: center;
  border-radius: ${theme.shape.borderRadius()};
  padding: 1px;
  border: 1px solid ${theme.palette.primary.light};
  background-color: ${theme.palette.common.white};
  cursor: pointer;
  `
);

const ProcessContainer = styled(Box)(
  () => `
  min-width: 180px;
  display: flex;
  justify-content: center;
  `
);

const IconContainer = styled(Box)(
  ({ theme }) => `
  display: flex;
  align-items: center;
  padding: ${theme.spacing(1)};
  background: ${theme.gradient.aqua};
  border-radius: 4px;
  `
);

export default WalletSelector;
