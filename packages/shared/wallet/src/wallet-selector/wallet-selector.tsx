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
import {
  ProgressIndicator,
  ButtonText,
  CopyCaption,
} from '@notional-finance/mui';
import { ContestDropdown } from './contest-drop-down';
import { useSideDrawerManager } from '@notional-finance/side-drawer';
import { useConnect } from '../hooks';
import { useWalletSideDrawer } from '../hooks';
import {
  PORTFOLIO_ACTIONS,
  PORTFOLIO_CATEGORIES,
  SETTINGS_SIDE_DRAWERS,
} from '@notional-finance/util';
import { useLocation } from 'react-router-dom';
import {
  useNotionalContext,
  useTruncatedAddress,
} from '@notional-finance/notionable-hooks';

export interface PortfolioParams {
  category?: PORTFOLIO_CATEGORIES;
  sideDrawerKey?: PORTFOLIO_ACTIONS;
}

export function WalletSelector() {
  const theme = useTheme();
  const { pathname } = useLocation();

  const { isReadOnlyAddress, icon, currentLabel } = useConnect();
  const {
    globalState: { selectedAccount, isAccountPending },
  } = useNotionalContext();
  const truncatedAddress = useTruncatedAddress();
  const [notificationsActive, setNotificationsActive] =
    useState<boolean>(false);
  const [showAlert, setShowAlert] = useState<boolean>(false);

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

  useEffect(() => {
    if (showAlert) {
      setTimeout(() => {
        setShowAlert(false);
      }, 1000);
    }
  }, [showAlert, setShowAlert]);

  const handleCopy = () => {
    if (selectedAccount) {
      navigator.clipboard.writeText(selectedAccount);
      setShowAlert(true);
    }
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <OuterContainer>
        <ContestDropdown />
        <Container>
          {truncatedAddress && (
            <>
              {icon && icon.length > 0 && !isReadOnlyAddress && (
                <IconContainer>
                  <img
                    src={`data:image/svg+xml;utf8,${encodeURIComponent(icon)}`}
                    alt={`${currentLabel} wallet icon`}
                    height="24px"
                    width="24px"
                  />
                </IconContainer>
              )}
              {isReadOnlyAddress && (
                <IconContainer>
                  <EyeIcon />
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
                <CopyCaption
                  showAlert={showAlert}
                  sx={{ marginTop: theme.spacing(12) }}
                />
                <Box onClick={handleCopy}>
                  <ButtonText>{truncatedAddress}</ButtonText>
                </Box>
                {!isReadOnlyAddress && (
                  <Box
                    sx={{ marginLeft: '10px', display: 'flex' }}
                    onClick={() =>
                      handleClick(SETTINGS_SIDE_DRAWERS.NOTIFICATIONS)
                    }
                  >
                    {notificationsActive ? <ActiveBellIcon /> : <BellIcon />}
                  </Box>
                )}
              </Box>
            </>
          )}
          {!truncatedAddress && !isAccountPending && (
            <ProcessContainer
              onClick={() => handleClick(SETTINGS_SIDE_DRAWERS.CONNECT_WALLET)}
            >
              <ButtonText>
                <FormattedMessage defaultMessage="Connect a Wallet" />
              </ButtonText>
            </ProcessContainer>
          )}
          {isAccountPending && (
            <ProcessContainer>
              <ProgressIndicator type="circular" circleSize={18} />
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
      {!pathname.includes('contest') && <NetworkSelector />}
    </Box>
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
