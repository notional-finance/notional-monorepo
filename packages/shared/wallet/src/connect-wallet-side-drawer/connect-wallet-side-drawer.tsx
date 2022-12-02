import { useTheme, Box, styled } from '@mui/material';
import { useOnboard } from '@notional-finance/notionable-hooks';
import { ArrowIcon } from '@notional-finance/icons';
import { SETTINGS_SIDE_DRAWERS } from '@notional-finance/shared-config';
import { FormattedMessage } from 'react-intl';
import { useSideDrawerManager } from '@notional-finance/shared-web';
import { ViewAsAccount } from '../view-as-account/view-as-account';
import { useWalletSideDrawer } from '../hooks';
import { useEffect } from 'react';
import { H4 } from '@notional-finance/mui';

export const ConnectWalletSideDrawer = () => {
  const theme = useTheme();
  const { modules, connectWallet, connected } = useOnboard();
  const { currentSideDrawerKey } = useWalletSideDrawer();
  const { deleteWalletSideDrawer } = useSideDrawerManager();

  useEffect(() => {
    if (
      connected &&
      SETTINGS_SIDE_DRAWERS.CONNECT_WALLET === currentSideDrawerKey
    ) {
      deleteWalletSideDrawer();
    }
  }, [connected, currentSideDrawerKey, deleteWalletSideDrawer]);

  return (
    <>
      <Box>
        <Title>
          <FormattedMessage defaultMessage="Connect A Wallet" />
        </Title>
        {modules.length
          ? modules.map(({ label, icon }, index) => (
              <WalletButton onClick={() => connectWallet(label)} key={index}>
                <Box
                  sx={{
                    height: '35px',
                    width: '35px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <img
                    src={`data:image/svg+xml;utf8,${encodeURIComponent(icon)}`}
                    style={{ height: '35px', width: '35px' }}
                    alt="wallet icon"
                  />
                </Box>
                <H4 sx={{ whiteSpace: 'nowrap', marginLeft: theme.spacing(2) }}>
                  {label}
                </H4>
                <Box
                  sx={{
                    justifyContent: 'flex-end',
                    display: 'flex',
                    width: '100%',
                  }}
                >
                  <ArrowIcon
                    sx={{
                      transform: 'rotate(90deg)',
                      color: theme.palette.common.black,
                      fontSize: '.875rem',
                    }}
                  />
                </Box>
              </WalletButton>
            ))
          : null}
      </Box>
      <ViewAsAccount />
    </>
  );
};

//
const WalletButton = styled(Box)(
  ({ theme }) => `
  padding: ${theme.spacing(2.5)};
  border-radius: 6px;
  border: 1px solid ${theme.palette.borders.default};
  margin: ${theme.spacing(3, 0)};
  cursor: pointer;
  color: ${theme.palette.primary.dark};
  font-weight: 500;
  display: flex;
  align-items: center;
  &:hover{
    border: 1px solid ${theme.palette.primary.light};
    transition: .5s;
    background: ${theme.palette.info.light};
  }
  `
);

const Title = styled(Box)(
  ({ theme }) => `
  margin-bottom: ${theme.spacing(2.5)};
  margin-top: ${theme.spacing(2.5)};
  font-weight: 700;
  color: ${theme.palette.primary.dark};
  display: flex;
  text-transform: uppercase;
  `
);

export default ConnectWalletSideDrawer;
