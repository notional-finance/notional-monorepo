import { useCallback } from 'react';
import { Box, styled, Radio, useTheme } from '@mui/material';
import { LabelValue, SideDrawerActiveButton } from '@notional-finance/mui';
import { EyeIcon } from '@notional-finance/icons';
import { useConnect } from '../../../hooks/use-connect';
import { useSideDrawerManager } from '@notional-finance/side-drawer';
import { ViewAsAccount } from '../../../view-as-account/view-as-account';
import { FormattedMessage } from 'react-intl';
import {
  useTruncatedAddress,
  useWalletConnected,
} from '@notional-finance/notionable-hooks';

export const AddressButton = () => {
  const { isReadOnlyAddress } = useConnect();
  const truncatedAddress = useTruncatedAddress();
  const theme = useTheme();

  return (
    <Box
      sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      {!isReadOnlyAddress && (
        <Radio
          checked
          size="small"
          sx={{
            padding: '0px',
            color: truncatedAddress
              ? theme.palette.info.main
              : theme.palette.error.main,
            '&.Mui-checked': {
              color: truncatedAddress
                ? theme.palette.info.main
                : theme.palette.error.main,
            },
          }}
        />
      )}

      {isReadOnlyAddress && <EyeIcon sx={{ height: '18px', width: '18px' }} />}

      {truncatedAddress ? (
        <Box sx={{ paddingLeft: theme.spacing(1) }}>{truncatedAddress}</Box>
      ) : (
        ''
      )}
    </Box>
  );
};

export const WalletSwitcher = () => {
  const { connectWallet, displayConnectors, currentLabel } = useConnect();
  const { clearWalletSideDrawer } = useSideDrawerManager();
  const connected = useWalletConnected();
  const handleConnect = useCallback(
    (label: string) => {
      connectWallet(label);
      clearWalletSideDrawer();
    },
    [clearWalletSideDrawer, connectWallet]
  );

  return (
    <WalletSelectorContainer>
      <Title>
        {connected ? (
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
            selectedKey={currentLabel}
            callback={handleConnect}
            key={index}
          />
        );
      })}

      <ViewAsAccount />
    </WalletSelectorContainer>
  );
};

const Title = styled(LabelValue)(
  ({ theme }) => `
  margin-bottom: ${theme.spacing(2.5)};
  font-weight: 700;
  color: ${theme.palette.typography.light};
  text-transform: uppercase;
  `
);

const WalletSelectorContainer = styled(Box)(
  ({ theme }) => `
  margin: 0px;
  font-weight: 700;
  min-height: 100vh;
  color: ${theme.palette.primary.dark};
  background: ${theme.palette.background.paper};
  `
);

export default WalletSwitcher;
