import { useState } from 'react';
import { TokenIcon } from '@notional-finance/icons';
import { FormattedMessage } from 'react-intl';
import { ArrowIcon } from '@notional-finance/icons';
import { useTheme, Box, Button, styled, SxProps, Drawer } from '@mui/material';
import {
  SupportedNetworks,
  getFromLocalStorage,
  getNetworkSymbol,
  setInLocalStorage,
} from '@notional-finance/util';
import { useLocation, useNavigate } from 'react-router-dom';
import { Network } from '@notional-finance/util';
import {
  useAccountNetWorth,
  useSelectedNetwork,
} from '@notional-finance/notionable-hooks';
import { TokenBalance } from '@notional-finance/core-entities';
import {
  NetworkInnerWrapperProps,
  NetworkSelectorButton,
} from '../network-selector/network-selector';
import { H4 } from '@notional-finance/mui';

export function MobileNetworkSelector() {
  const selectedNetwork = useSelectedNetwork();
  const walletBalances = useAccountNetWorth();

  return (
    <NetworkSelectorDrawer
      availableNetworks={SupportedNetworks}
      selectedNetwork={selectedNetwork}
      walletBalances={walletBalances}
      isPortfolio
    />
  );
}

function NetworkSelectorDrawer({
  selectedNetwork,
  availableNetworks,
  walletBalances,
  hideNetWorth,
  sx,
  onNetworkChange,
}: {
  onNetworkChange?: (network: Network) => void;
  selectedNetwork?: Network;
  availableNetworks: Network[];
  walletBalances: Record<Network, TokenBalance>;
  hideNetWorth?: boolean;
  isPortfolio?: boolean;
  sx?: SxProps;
}) {
  const theme = useTheme();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const userSettings = getFromLocalStorage('userSettings');
  const [isOpen, setIsOpen] = useState(false);
  const canSelect = availableNetworks.length > 1;

  const handleClose = (network?: Network) => {
    setIsOpen(false);
    if (network && !pathname.includes(network) && selectedNetwork) {
      if (onNetworkChange && network) onNetworkChange(network);
      setInLocalStorage('userSettings', { ...userSettings, network: network });
      navigate(pathname.replace(selectedNetwork, network));
    }
  };

  return (
    <NetworkSelectorWrapper sx={{ ...sx }}>
      <DropdownButton
        id="basic-button"
        aria-controls={isOpen ? 'basic-menu' : undefined}
        variant="outlined"
        aria-expanded={isOpen ? 'true' : undefined}
        disabled={!canSelect}
        onClick={() => setIsOpen(!isOpen)}
        startIcon={
          <TokenIcon
            symbol={getNetworkSymbol(selectedNetwork)}
            size={'medium'}
          />
        }
        endIcon={
          canSelect ? (
            <Box
              sx={{
                borderRadius: '50%',
                background: theme.palette.info.light,
                height: theme.spacing(2),
                width: theme.spacing(2),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ArrowIcon
                sx={{
                  transform: isOpen ? 'rotate(0deg)' : 'rotate(-180deg)',
                  transition: '.5s ease',
                  width: theme.spacing(1.5),
                  color: theme.palette.secondary.light,
                }}
              />
            </Box>
          ) : undefined
        }
        sx={{
          boxShadow: 'none',
          padding: '6px 12px',
          borderRadius: '50px',
          border: theme.shape.borderStandard,
          color: theme.palette.typography.main,
          '&:hover': {
            boxShadow: 'none',
          },
          '.MuiButton-endIcon': {
            marginLeft: '0px',
          },
          '.MuiButton-startIcon': {
            marginStart: '0px',
          },
        }}
      />
      <Drawer
        anchor="top"
        open={isOpen}
        onClose={() => handleClose()}
        sx={{
          '& .MuiDrawer-paper': {
            height: 'fit-content',
            borderBottomLeftRadius: theme.shape.borderRadius(),
            borderBottomRightRadius: theme.shape.borderRadius(),
            boxShadow: theme.shape.shadowLarge(),
            border: theme.shape.borderStandard,
            background: theme.palette.background.default,
          },
        }}
      >
        <NetworkInnerWrapper
          hideNetWorth={hideNetWorth}
          theme={theme}
          sx={{
            marginTop: theme.spacing(9),
            padding: `${theme.spacing(2)} !important`,
          }}
        >
          <Box sx={{ padding: theme.spacing(3), paddingLeft: '0px' }}>
            <H4 sx={{ fontWeight: 700, color: theme.palette.typography.light }}>
              <FormattedMessage defaultMessage={'NETWORK'} />
            </H4>
          </Box>
          <Box
            sx={{
              margin: 'auto',
              maxHeight: 'calc(50vh - 80px)', // Account for header
              overflowY: 'auto',
            }}
          >
            {availableNetworks.map((n, i) => (
              <NetworkSelectorButton
                key={n}
                isLast={i === availableNetworks.length - 1}
                isSelected={n === selectedNetwork}
                network={n}
                handleClick={() => handleClose(n)}
                balance={walletBalances[n]}
                hideNetWorth={true}
                showCheck
                sx={{
                  borderRadius: theme.shape.borderRadius(),
                  marginBottom: theme.spacing(2),
                  background:
                    n === selectedNetwork
                      ? theme.palette.info.light
                      : theme.palette.background.paper,
                }}
              />
            ))}
          </Box>
        </NetworkInnerWrapper>
      </Drawer>
    </NetworkSelectorWrapper>
  );
}

const NetworkSelectorWrapper = styled(Box)(
  ({ theme }) => `
    margin-left: ${theme.spacing(2.5)};
    box-shadow: none;
    transition: .3s ease;
    border-radius: 50px;
    #basic-menu {
      border-radius: ${theme.shape.borderRadius()};
    }
  `
);

const NetworkInnerWrapper = styled(Box, {
  shouldForwardProp: (prop: string) => prop !== 'hideNetWorth',
})(
  ({ theme, hideNetWorth }: NetworkInnerWrapperProps) => `
    width: ${hideNetWorth ? '200px' : '350px'};
    ${theme.breakpoints.down('sm')} {
      width: 100%;
      padding: ${theme.spacing(1)};
    }
  `
);

const DropdownButton = styled(Button)(
  ({ theme }) => `
  transition: none;
  width: 100%;
  text-transform: capitalize;
  justify-content: flex-start;
  border: ${theme.shape.borderStandard};
  background: ${theme.palette.common.white};
`
);
