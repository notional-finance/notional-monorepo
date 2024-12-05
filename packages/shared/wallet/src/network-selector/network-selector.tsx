import React, { useState } from 'react';
import { TokenIcon } from '@notional-finance/icons';
import { FormattedMessage } from 'react-intl';
import { NotionalTheme } from '@notional-finance/styles';
import { ArrowIcon } from '@notional-finance/icons';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { Caption, H4, H5, LabelValue, Paragraph } from '@notional-finance/mui';
import {
  useTheme,
  Box,
  Button,
  styled,
  Popover,
  SxProps,
  Drawer,
} from '@mui/material';
import {
  PRODUCTS,
  SupportedNetworks,
  getFromLocalStorage,
  getNetworkSymbol,
  setInLocalStorage,
} from '@notional-finance/util';
import { useLocation, useNavigate } from 'react-router-dom';
import { Network } from '@notional-finance/util';
import {
  useAccountNetWorth,
  useProductNetwork,
  useWalletBalancesOnNetworks,
  useSelectedNetwork,
  usePortfolioStore,
  useCurrentTradeContext,
} from '@notional-finance/notionable-hooks';
import { TokenBalance } from '@notional-finance/core-entities';
import { WalletIcon } from '@notional-finance/icons';

export interface NetworkButtonProps {
  active?: boolean;
  theme: NotionalTheme;
}
export interface NetworkInnerWrapperProps {
  hideNetWorth?: boolean;
  theme: NotionalTheme;
}
export interface NetworkSelectorButtonProps {
  isLast?: boolean;
  isSelected: boolean;
  hideNetWorth?: boolean;
  network: Network;
  handleClick: (network: Network) => void;
  balance?: TokenBalance;
  sx?: SxProps;
  showCheck?: boolean;
}

export const NetworkSelectorButton = ({
  isLast,
  isSelected,
  network,
  handleClick,
  balance,
  hideNetWorth,
  showCheck,
  sx,
}: NetworkSelectorButtonProps) => {
  const theme = useTheme();
  return (
    <NetworkButton
      key={network}
      onClick={() => handleClick(network)}
      active={isSelected}
      theme={theme}
      sx={{
        borderRadius: isSelected && isLast ? '0px 0px 6px 6px' : '0px',
        ...sx,
      }}
    >
      <Box sx={{ marginRight: theme.spacing(1), lineHeight: 1 }}>
        <TokenIcon symbol={getNetworkSymbol(network)} size="medium" />
      </Box>
      <H4
        sx={{
          flex: 1,
          alignItems: 'center',
          display: 'flex',
          fontWeight: 500,
          textTransform: 'capitalize',
        }}
      >
        {network}
      </H4>
      {isSelected && showCheck && (
        <CheckCircleIcon sx={{ fill: theme.palette.primary.main }} />
      )}
      {balance && !hideNetWorth && (
        <Box
          sx={{
            display: 'flex',
            gap: theme.spacing(1),
            alignItems: 'center',
          }}
        >
          {balance.tokenType !== 'Fiat' && (
            <WalletIcon
              sx={{ width: theme.spacing(2), height: theme.spacing(2) }}
            />
          )}
          <Paragraph main>
            {balance.toDisplayStringWithSymbol(2, true)}
            {balance.tokenType === 'Fiat' ? ' Net Worth' : ''}
          </Paragraph>
        </Box>
      )}
    </NetworkButton>
  );
};

export function TransactionNetworkSelector({ product }: { product: PRODUCTS }) {
  const trade = useCurrentTradeContext();
  const deposit = trade?.selectedTokens?.deposit;
  const selectedNetwork = trade?.selectedNetwork;

  const availableNetworks = useProductNetwork(product, deposit?.symbol);
  const walletBalances = useWalletBalancesOnNetworks(
    availableNetworks,
    deposit?.symbol
  );

  return (
    <NetworkSelector
      availableNetworks={availableNetworks}
      selectedNetwork={selectedNetwork}
      walletBalances={walletBalances}
      hideOnMobile
    />
  );
}

export function PortfolioNetworkSelector({
  sx,
  hideNetWorth,
}: {
  sx?: SxProps;
  hideNetWorth?: boolean;
}) {
  const selectedNetwork = useSelectedNetwork();
  const walletBalances = useAccountNetWorth();
  const portfolioStore = usePortfolioStore();

  return (
    <NetworkSelector
      availableNetworks={SupportedNetworks}
      selectedNetwork={selectedNetwork}
      walletBalances={walletBalances}
      hideNetWorth={hideNetWorth}
      sx={sx}
      isPortfolio
      onNetworkChange={(network) => portfolioStore.setNetwork(network)}
      hideOnMobile
    />
  );
}

export function MobileNetworkSelector() {
  const selectedNetwork = useSelectedNetwork();
  const walletBalances = useAccountNetWorth();
  const portfolioStore = usePortfolioStore();

  return (
    <NetworkSelectorDrawer
      availableNetworks={SupportedNetworks}
      selectedNetwork={selectedNetwork}
      walletBalances={walletBalances}
      isPortfolio
      onNetworkChange={(network) => portfolioStore.setNetwork(network)}
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
          sx={{ marginTop: '72px', padding: '16px !important' }}
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

function NetworkSelector({
  selectedNetwork,
  availableNetworks,
  walletBalances,
  hideNetWorth,
  isPortfolio,
  hideOnMobile,
  sx,
  onNetworkChange,
}: {
  onNetworkChange?: (network: Network) => void;
  selectedNetwork?: Network;
  availableNetworks: Network[];
  walletBalances: Record<Network, TokenBalance>;
  hideNetWorth?: boolean;
  isPortfolio?: boolean;
  hideOnMobile?: boolean;
  sx?: SxProps;
}) {
  const theme = useTheme();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const userSettings = getFromLocalStorage('userSettings');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [anchorEl, setAnchorEl] = useState<any>(null);
  const open = Boolean(anchorEl);
  const canSelect = availableNetworks.length > 1;

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (network?: Network) => {
    setAnchorEl(null);
    if (network && !pathname.includes(network) && selectedNetwork) {
      if (onNetworkChange && network) onNetworkChange(network);

      setInLocalStorage('userSettings', { ...userSettings, network: network });
      navigate(pathname.replace(selectedNetwork, network));
    }
  };

  return (
    <NetworkSelectorWrapper
      sx={{ ...sx, display: hideOnMobile ? 'none' : 'block' }}
    >
      <DropdownButton
        id="basic-button"
        aria-controls={open ? 'basic-menu' : undefined}
        aria-haspopup="true"
        variant="outlined"
        aria-expanded={open ? 'true' : undefined}
        disabled={!canSelect}
        onClick={handleClick}
        startIcon={
          <TokenIcon
            symbol={getNetworkSymbol(selectedNetwork)}
            size={isPortfolio ? 'medium' : 'small'}
          />
        }
        endIcon={
          canSelect ? (
            <Box
              sx={{
                marginLeft: isPortfolio ? theme.spacing(3) : theme.spacing(1),
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
                  transform: open ? 'rotate(0deg)' : 'rotate(-180deg)',
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
          padding: isPortfolio ? '8px 12px' : '6px 12px',
          borderRadius: '50px',
          border: theme.shape.borderStandard,
          color: theme.palette.typography.main,
          '&:hover': {
            boxShadow: 'none',
            backgroundColor: theme.palette.info.light,
          },
        }}
      >
        {isPortfolio ? (
          <LabelValue>{selectedNetwork}</LabelValue>
        ) : (
          <Caption>{selectedNetwork}</Caption>
        )}
      </DropdownButton>
      <Popover
        id="basic-menu"
        open={open}
        anchorEl={anchorEl}
        onClose={() => handleClose()}
        transitionDuration={{ exit: 0, enter: 200 }}
        sx={{
          marginTop: theme.spacing(1),
          '.MuiPopover-paper': {
            boxShadow: theme.shape.shadowLarge(),
            borderRadius: theme.shape.borderRadius(),
            border: theme.shape.borderStandard,
            width: {
              xs: '100%',
              sm: '100%',
              md: 'auto',
              lg: 'auto',
              xl: 'auto',
            },
          },
        }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <NetworkInnerWrapper hideNetWorth={hideNetWorth} theme={theme}>
          <Box sx={{ padding: theme.spacing(3) }}>
            <H5>
              <FormattedMessage defaultMessage={'NETWORK'} />
            </H5>
          </Box>
          <Box sx={{ margin: 'auto' }}>
            {availableNetworks.map((n, i) => (
              <NetworkSelectorButton
                key={n}
                isLast={i === availableNetworks.length - 1}
                isSelected={n === selectedNetwork}
                network={n}
                handleClick={() => handleClose(n)}
                balance={walletBalances[n]}
                hideNetWorth={hideNetWorth}
              />
            ))}
          </Box>
        </NetworkInnerWrapper>
      </Popover>
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

const NetworkButton = styled(Box, {
  shouldForwardProp: (prop: string) => prop !== 'active',
})(
  ({ theme, active }: NetworkButtonProps) => `
  width: 100%;
  padding: ${theme.spacing(2.5, 3)};
  border: ${active ? '1px solid ' + theme.palette.secondary.light : 'none'};
  margin: auto;
  cursor: pointer;
  background: ${active ? theme.palette.info.light : 'transparent'};
  color: ${theme.palette.primary.dark};
  font-weight: 500;
  display: flex;
  justify-content: space-between;
  &:hover {
    background-color: ${theme.palette.info.light};
  }
  `
);

export default TransactionNetworkSelector;
