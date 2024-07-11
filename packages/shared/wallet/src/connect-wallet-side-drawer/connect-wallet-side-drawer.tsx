import { useCallback } from 'react';
import { Box, styled } from '@mui/material';
import { LabelValue, SideDrawerActiveButton } from '@notional-finance/mui';
import { FormattedMessage } from 'react-intl';
import { ViewAsAccount } from '../view-as-account/view-as-account';
import { useConnect } from '../hooks/use-connect';
import { useLocation } from 'react-router-dom';
import { useWalletAddress } from '@notional-finance/notionable-hooks';

export const ConnectWalletSideDrawer = () => {
  const { pathname } = useLocation();
  const { connectWallet, displayConnectors } = useConnect();
  const address = useWalletAddress();

  const handleConnect = useCallback(
    (label: string) => {
      connectWallet(label);
    },
    [connectWallet]
  );

  return (
    <Container>
      <Box>
        <Title>
          {address ? (
            <FormattedMessage defaultMessage="Switch wallets" />
          ) : (
            <FormattedMessage defaultMessage="Connect a Wallet" />
          )}
        </Title>
        {displayConnectors.map(({ name, displayIcon }, index) => {
          const image = (
            <img
              src={displayIcon}
              style={{ height: '35px', width: '35px' }}
              alt="wallet icon"
            />
          );
          return (
            <SideDrawerActiveButton
              label={name}
              Icon={image}
              dataKey={name}
              selectedKey={''}
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

export default ConnectWalletSideDrawer;
