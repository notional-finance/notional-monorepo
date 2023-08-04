import { useCallback } from 'react';
import { Box, styled } from '@mui/material';
import { SETTINGS_SIDE_DRAWERS } from '@notional-finance/shared-config';
import { LabelValue, SideDrawerActiveButton } from '@notional-finance/mui';
import { FormattedMessage } from 'react-intl';
import { useSideDrawerManager } from '@notional-finance/side-drawer';
import { trackEvent } from '@notional-finance/helpers';
import { ViewAsAccount } from '../view-as-account/view-as-account';
import { modules } from '../onboard-context';
import { useWalletSideDrawer } from '../hooks';
import { useEffect } from 'react';
import { useConnect } from '../hooks/use-connect';

export const ConnectWalletSideDrawer = () => {
  const { connectWallet, selectedAddress } = useConnect();
  const { currentSideDrawerKey } = useWalletSideDrawer();
  const { clearWalletSideDrawer } = useSideDrawerManager();

  useEffect(() => {
    if (
      selectedAddress &&
      SETTINGS_SIDE_DRAWERS.CONNECT_WALLET === currentSideDrawerKey
    ) {
      clearWalletSideDrawer();
    }
  }, [selectedAddress, currentSideDrawerKey, clearWalletSideDrawer]);

  const handleConnect = useCallback(
    (label: string) => {
      connectWallet(label);
      trackEvent('CONNECT_WALLET', { wallet: label });
    },
    [connectWallet]
  );

  return (
    <>
      <Box>
        <Title>
          <FormattedMessage defaultMessage="Connect A Wallet" />
        </Title>
        {modules.map(({ label, icon }, index) => {
          const image = (
            <img
              src={icon}
              style={{ height: '35px', width: '35px' }}
              alt="wallet icon"
            />
          );
          return (
            <SideDrawerActiveButton
              label={label}
              Icon={image}
              dataKey={label}
              callback={handleConnect}
              key={index}
            />
          );
        })}
      </Box>
      <ViewAsAccount />
    </>
  );
};

const Title = styled(LabelValue)(
  ({ theme }) => `
  margin-bottom: ${theme.spacing(2.5)};
  margin-top: ${theme.spacing(3)};
  font-weight: 700;
  color: ${theme.palette.borders.accentDefault};
  display: flex;
  text-transform: uppercase;
  `
);

export default ConnectWalletSideDrawer;
