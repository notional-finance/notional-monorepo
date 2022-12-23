import { Box, Typography, styled, Radio, useTheme } from '@mui/material';
import { H4 } from '@notional-finance/mui';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { CircleIcon, EyeIcon } from '@notional-finance/icons';
import { NotionalTheme } from '@notional-finance/styles';
import { useOnboard, useAccount } from '@notional-finance/notionable-hooks';
import { useSideDrawerManager } from '@notional-finance/side-drawer';
import { trackEvent } from '@notional-finance/helpers';
import { ViewAsAccount } from '../../view-as-account/view-as-account';
import { FormattedMessage } from 'react-intl';

export const AddressButton = () => {
  const { connected } = useOnboard();
  const { truncatedAddress } = useAccount();
  const theme = useTheme();

  return (
    <Box
      sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      {connected || (!connected && !truncatedAddress) ? (
        <Radio
          checked
          size="small"
          sx={{
            padding: '0px',
            color: connected
              ? theme.palette.info.main
              : theme.palette.error.main,
            '&.Mui-checked': {
              color: connected
                ? theme.palette.info.main
                : theme.palette.error.main,
            },
          }}
        />
      ) : (
        ''
      )}
      {truncatedAddress && !connected && (
        <EyeIcon sx={{ height: '18px', width: '18px' }} />
      )}

      {truncatedAddress && (
        <Box sx={{ paddingLeft: theme.spacing(1) }}>{truncatedAddress}</Box>
      )}
    </Box>
  );
};

export const WalletSwitcher = () => {
  const { modules, connectWallet, label, connected } = useOnboard();
  const { clearWalletSideDrawer } = useSideDrawerManager();
  const theme = useTheme();
  const currentLabel = label;

  const handleConnect = (label: string) => {
    connectWallet(label);
    trackEvent('CONNECT_WALLET', { wallet: label });
    clearWalletSideDrawer();
  };

  return (
    <>
      <WalletSelectorContainer>
        <Title>
          {connected ? (
            <FormattedMessage defaultMessage="Switch wallets" />
          ) : (
            <FormattedMessage defaultMessage="Connect a Wallet" />
          )}
        </Title>
        {modules
          ? modules.map(({ label, icon }, index) => (
              <WalletButton
                onClick={() => handleConnect(label)}
                key={index}
                active={currentLabel === label}
                theme={theme}
              >
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
                <H4
                  sx={{ whiteSpace: 'nowrap', marginLeft: theme.spacing(1) }}
                  fontWeight="regular"
                >
                  {label}
                </H4>
                <Box
                  sx={{
                    justifyContent: 'flex-end',
                    display: 'flex',
                    width: '100%',
                  }}
                >
                  {currentLabel === label ? (
                    <CheckCircleIcon
                      sx={{ fill: theme.palette.primary.main }}
                    />
                  ) : (
                    <CircleIcon
                      sx={{
                        stroke: theme.palette.borders.accentPaper,
                        width: theme.spacing(2.5),
                        height: theme.spacing(2.5),
                      }}
                    />
                  )}
                </Box>
              </WalletButton>
            ))
          : null}
      </WalletSelectorContainer>
      <ViewAsAccount />
    </>
  );
};

const WalletButton = styled(Box, {
  shouldForwardProp: (prop: string) => prop !== 'active',
})(
  ({ theme, active }: { active: boolean; theme: NotionalTheme }) => `
  padding: ${theme.spacing(2.5)};
  border-radius: ${theme.shape.borderRadius()};
  border: 1px solid ${
    active ? theme.palette.primary.main : theme.palette.borders.paper
  };
  margin: ${theme.spacing(1)} 0px;
  cursor: pointer;
  background: ${active ? theme.palette.info.light : theme.palette.common.white};
  color: ${theme.palette.primary.dark};
  font-weight: 500;
  display: flex;
  align-items: center;
  &:hover {
    transition: .5s ease;
    background: ${theme.palette.info.light};
  }
  `
);

const Title = styled(Typography)(
  ({ theme }) => `
  margin-bottom: ${theme.spacing(2.5)};
  font-weight: 700;
  color: ${theme.palette.borders.accentDefault};
  text-transform: uppercase;
  `
);

const WalletSelectorContainer = styled(Box)(
  ({ theme }) => `
  margin: 0px;
  font-weight: 700;
  color: ${theme.palette.primary.dark};
  background: ${theme.palette.background.paper};
  `
);

export default WalletSwitcher;
