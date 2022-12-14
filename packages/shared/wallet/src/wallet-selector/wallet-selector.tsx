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
import WalletSideDrawer from '../wallet-side-drawer/wallet-side-drawer';
import { getNotificationsData } from './wallet-selector.service';
import NetworkSelector from '../network-selector/network-selector';
import { useOnboard, useAccount } from '@notional-finance/notionable-hooks';
import { ProgressIndicator } from '@notional-finance/mui';
import { useSideDrawerManager } from '@notional-finance/side-drawer';
import { useWalletSideDrawer } from '../hooks';
import {
  PORTFOLIO_ACTIONS,
  PORTFOLIO_CATEGORIES,
  SETTINGS_SIDE_DRAWERS,
} from '@notional-finance/shared-config';
import { ButtonText } from '@notional-finance/mui';

export interface PortfolioParams {
  category?: PORTFOLIO_CATEGORIES;
  sideDrawerKey?: PORTFOLIO_ACTIONS;
}

export function WalletSelector() {
  const theme = useTheme();
  const { connected, icon, label } = useOnboard();
  const { truncatedAddress } = useAccount();
  const [notificationsActive, setNotificationsActive] =
    useState<boolean>(false);

  const { setWalletSideDrawer, clearWalletSideDrawer } = useSideDrawerManager();
  const { openDrawer } = useWalletSideDrawer();

  useEffect(() => {
    getNotificationsData().then((activeResult) => {
      return activeResult ? setNotificationsActive(activeResult) : null;
    });
  }, []);

  const handleClick = (key: SETTINGS_SIDE_DRAWERS) => {
    if (openDrawer) {
      clearWalletSideDrawer();
    }
    if (!openDrawer) {
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
                  onClick={() =>
                    handleClick(SETTINGS_SIDE_DRAWERS.NOTIFICATIONS)
                  }
                >
                  {notificationsActive ? <ActiveBellIcon /> : <BellIcon />}
                </Box>
              </Box>
            </>
          )}

          {!connected && truncatedAddress && (
            <ProcessContainer
              onClick={() => handleClick(SETTINGS_SIDE_DRAWERS.CONNECT_WALLET)}
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
              onClick={() => handleClick(SETTINGS_SIDE_DRAWERS.CONNECT_WALLET)}
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
            onClick={() => handleClick(SETTINGS_SIDE_DRAWERS.SETTINGS)}
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
