import { useState, useEffect } from 'react';
import { Box, styled } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { FormattedMessage } from 'react-intl';
import { GearIcon, EyeIcon, TokenIcon } from '@notional-finance/icons';
import WalletSideDrawer from '../wallet-side-drawer/wallet-side-drawer';
import { getNotificationsData } from './wallet-selector.service';
import {
  ProgressIndicator,
  ButtonText,
  CopyCaption,
} from '@notional-finance/mui';
import { useSideDrawerManager } from '@notional-finance/notionable-hooks';
import { useWalletSideDrawer, useConnect, useIntercomUpdate } from '../hooks';
import {
  PORTFOLIO_ACTIONS,
  PORTFOLIO_CATEGORIES,
  SETTINGS_SIDE_DRAWERS,
  getNetworkSymbol,
} from '@notional-finance/util';
import {
  useAccountLoading,
  useTruncatedAddress,
  useWalletAddress,
  useWalletConnectedNetwork,
} from '@notional-finance/notionable-hooks';

export interface PortfolioParams {
  category?: PORTFOLIO_CATEGORIES;
  sideDrawerKey?: PORTFOLIO_ACTIONS;
}

export function WalletSelector() {
  const theme = useTheme();
  const { isReadOnlyAddress, icon } = useConnect();
  const isAccountPending = useAccountLoading();
  const selectedAccount = useWalletAddress();
  const walletNetwork = useWalletConnectedNetwork();
  const truncatedAddress = useTruncatedAddress();
  const [showAlert, setShowAlert] = useState<boolean>(false);
  const { setWalletSideDrawer, clearWalletSideDrawer } = useSideDrawerManager();
  const { openDrawer } = useWalletSideDrawer();
  useIntercomUpdate();

  useEffect(() => {
    getNotificationsData();
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
        <Container>
          {truncatedAddress && !isAccountPending && (
            <>
              {icon && icon.length > 0 && !isReadOnlyAddress && (
                <IconContainer sx={{ paddingRight: '0px' }}>
                  <TokenIcon
                    symbol={getNetworkSymbol(walletNetwork)}
                    size="medium"
                  />
                </IconContainer>
              )}
              {isReadOnlyAddress && (
                <IconContainer sx={{ paddingRight: '0px' }}>
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
  justify-content: space-between;
  border-radius: ${theme.shape.borderRadius()};
  padding: 1px;
  border: 1px solid ${theme.palette.primary.light};
  background-color: ${theme.palette.common.white};
  cursor: pointer;
  width: ${theme.spacing(26)};
  `
);

const ProcessContainer = styled(Box)(
  () => `
  width: 100%;
  display: flex;
  justify-content: center;
  `
);

const IconContainer = styled(Box)(
  ({ theme }) => `
  display: flex;
  align-items: center;
  padding: ${theme.spacing(1)};
  border-radius: 4px;
  `
);

export default WalletSelector;
