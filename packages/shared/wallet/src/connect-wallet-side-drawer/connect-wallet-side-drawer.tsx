import { useTheme, Box, styled } from '@mui/material';
import { useOnboard } from '@notional-finance/notionable-hooks';
import { useHistory } from 'react-router-dom';
import { ArrowIcon } from '@notional-finance/icons';
import { SIDEBAR_CATEGORIES } from '@notional-finance/shared-config';
import { FormattedMessage } from 'react-intl';
import { useSideDrawerManager } from '@notional-finance/notional-web';
import { useQueryParams } from '@notional-finance/utils';
import { ViewAsAccount } from '../view-as-account/view-as-account';
import { useWalletSideDrawer } from '../hooks';
import { useEffect } from 'react';
import { H4 } from '@notional-finance/mui';

export const ConnectWalletSideDrawer = () => {
  const theme = useTheme();
  const history = useHistory();
  const { sideDrawer } = useQueryParams();
  const sideDrawerKey = sideDrawer
    ? (sideDrawer as SIDEBAR_CATEGORIES)
    : undefined;
  const { modules, connectWallet, connected } = useOnboard();
  const { deleteWalletSideDrawer } = useWalletSideDrawer();
  const { currentSideDrawerId } = useSideDrawerManager(sideDrawerKey);

  useEffect(() => {
    if (
      connected &&
      SIDEBAR_CATEGORIES.CONNECT_WALLET === currentSideDrawerId
    ) {
      deleteWalletSideDrawer();
    }
  }, [connected, currentSideDrawerId, history, deleteWalletSideDrawer]);

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
  padding: 20px;
  border-radius: 6px;
  border: 1px solid ${theme.palette.borders.default};
  margin: 24px 0px;
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
  margin-bottom: 20px;
  margin-top: 20px;
  font-weight: 700;
  color: ${theme.palette.primary.dark};
  display: flex;
  text-transform: uppercase;
  `
);

export default ConnectWalletSideDrawer;
