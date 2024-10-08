import { useCallback } from 'react';
import { Box, styled } from '@mui/material';
import { LabelValue, SideDrawerActiveButton } from '@notional-finance/mui';
import { FormattedMessage } from 'react-intl';
import {
  useSideDrawerManager,
  useWalletConnectedNetwork,
} from '@notional-finance/notionable-hooks';
import { ViewAsAccount } from '../view-as-account/view-as-account';
import { useWalletModules } from '../onboard-context';
import { useConnect } from '../hooks/use-connect';
import { useLocation } from 'react-router-dom';
import { useAccountReady } from '@notional-finance/notionable-hooks';
import { observer } from 'mobx-react-lite';

const ConnectWalletSideDrawer = () => {
  const { connectWallet, currentLabel } = useConnect();
  const { pathname } = useLocation();
  const selectedChain = useWalletConnectedNetwork();
  const connected = useAccountReady(selectedChain);
  const { clearWalletSideDrawer } = useSideDrawerManager();
  const modules = useWalletModules();

  const handleConnect = useCallback(
    (label: string) => {
      connectWallet(label);
      clearWalletSideDrawer();
    },
    [clearWalletSideDrawer, connectWallet]
  );

  return (
    <Container>
      <Box>
        <Title>
          {connected ? (
            <FormattedMessage defaultMessage="Switch wallets" />
          ) : (
            <FormattedMessage defaultMessage="Connect a Wallet" />
          )}
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
              selectedKey={currentLabel}
              callback={handleConnect}
              key={index}
            />
          );
        })}
      </Box>
      {!pathname.includes('contest') && <ViewAsAccount />}
    </Container>
  );
};

const Title = styled(LabelValue)(
  ({ theme }) => `
  margin-bottom: ${theme.spacing(2.5)};
  margin-top: ${theme.spacing(3)};
  font-weight: 700;
  color: ${theme.palette.typography.light};
  display: flex;
  text-transform: uppercase;
  `
);

const Container = styled(Box)(
  ({ theme }) => `
    padding: ${theme.spacing(2)};
    ${theme.breakpoints.down('sm')} {
      width: 100vw;
    }
  `
);

export default observer(ConnectWalletSideDrawer);
