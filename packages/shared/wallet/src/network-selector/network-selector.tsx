import React, { useState } from 'react';
import { TokenIcon } from '@notional-finance/icons';
import { FormattedMessage } from 'react-intl';
import { NotionalTheme } from '@notional-finance/styles';
import { ArrowIcon } from '@notional-finance/icons';
import { Caption, H4, H5, Paragraph, Subtitle } from '@notional-finance/mui';
import { useTheme, Box, Button, styled, Popover } from '@mui/material';
import {
  PRODUCTS,
  SupportedNetworks,
  getNetworkSymbol,
} from '@notional-finance/util';
import { useHistory, useLocation } from 'react-router';
import { Network } from '@notional-finance/util';
import {
  BaseTradeContext,
  useAccountNetWorth,
  useProductNetwork,
  useWalletBalancesOnNetworks,
} from '@notional-finance/notionable-hooks';
import { TokenBalance } from '@notional-finance/core-entities';
import { WalletIcon } from '@notional-finance/icons';
import { useSelectedNetwork } from '../hooks';

export interface NetworkButtonProps {
  active?: boolean;
  theme: NotionalTheme;
}
export interface NetworkSelectorButtonProps {
  isLast?: boolean;
  isSelected: boolean;
  network: Network;
  handleClick: (network: Network) => void;
  balance?: TokenBalance;
}

export const NetworkSelectorButton = ({
  isLast,
  isSelected,
  network,
  handleClick,
  balance,
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
      {balance && (
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
            {balance.toDisplayStringWithSymbol(4, true)}
            {balance.tokenType === 'Fiat' ? ' Net Worth' : ''}
          </Paragraph>
        </Box>
      )}
    </NetworkButton>
  );
};

export function TransactionNetworkSelector({
  context,
  product,
}: {
  context: BaseTradeContext;
  product: PRODUCTS;
}) {
  const {
    state: { selectedNetwork, deposit },
  } = context;
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
    />
  );
}

export function PortfolioNetworkSelector() {
  const selectedNetwork = useSelectedNetwork();
  const walletBalances = useAccountNetWorth();

  return (
    <NetworkSelector
      availableNetworks={SupportedNetworks}
      selectedNetwork={selectedNetwork}
      walletBalances={walletBalances}
      isPortfolio
    />
  );
}

function NetworkSelector({
  selectedNetwork,
  availableNetworks,
  walletBalances,
  isPortfolio,
}: {
  selectedNetwork?: Network;
  availableNetworks: Network[];
  walletBalances: Record<Network, TokenBalance>;
  isPortfolio?: boolean;
}) {
  const theme = useTheme();
  const history = useHistory();
  const { pathname } = useLocation();
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
      history.push(pathname.replace(selectedNetwork, network));
    }
  };

  return (
    <NetworkSelectorWrapper>
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
          <Subtitle light>{selectedNetwork}</Subtitle>
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
        <NetworkInnerWrapper>
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
    ${theme.breakpoints.down('sm')} {
      margin-left: 0px;
      margin-top: ${theme.spacing(3)};
    }
  `
);

const NetworkInnerWrapper = styled(Box)(
  ({ theme }) => `
    width: 350px;
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
