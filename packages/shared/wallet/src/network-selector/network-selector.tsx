import React, { useState } from 'react';
import { TokenIcon } from '@notional-finance/icons';
import { FormattedMessage } from 'react-intl';
import { Chain } from '@web3-onboard/common';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { NotionalTheme } from '@notional-finance/styles';
import { ArrowIcon, CircleIcon } from '@notional-finance/icons';
import { useTheme, Box, Button, styled, ListItemIcon, Popover, Typography } from '@mui/material';
import { useNetworkSelector } from './use-network-selector';

/* eslint-disable-next-line */
export interface NetworkSelectorProps {
  networkData?: Chain;
}

export interface NetworkButtonProps {
  active?: boolean;
  theme: NotionalTheme;
}

const NetworkSelectorWrapper = styled(Box)(
  ({ theme }) => `
    margin-left: ${theme.spacing(2.5)};    
    #basic-button {
      padding: 10px 15px;
      border-radius: ${theme.shape.borderRadius()};
      color: ${theme.palette.typography.main};
    }
    #basic-menu {
      border-radius: ${theme.shape.borderRadius()};
    }
    box-shadow: ${theme.shape.shadowStandard}
  `
);

const DropdownButton = styled(Button)(
  ({ theme }) => `
  transition: none;
  width: 100%;
  text-transform: capitalize;
  justify-content: flex-start;
  font-size: 1rem;
  border: 1px solid ${theme.palette.primary.light};
  background: ${theme.palette.common.white};
  &:hover {
    background-color: ${theme.palette.background.default} !important;
  }
`
);

const TextWrapper = styled('div')(
  () => `
  flex: 1;
  text-align: left;
`
);

const Title = styled(Typography)(
  ({ theme }) => `
  margin: 30px auto;
  width: 380px;
  font-weight: 700;
  color: ${theme.palette.primary.dark};
  `
);

const NetworkButton = styled(Box, {
  shouldForwardProp: (prop: string) => prop !== 'active',
})(
  ({ theme, active }: NetworkButtonProps) => `
  width: 380px;
  padding: 15px 10px;
  border-radius: ${theme.shape.borderRadius()};
  border: 1px solid ${active ? theme.palette.primary.main : theme.palette.borders.accentPaper};
  margin: 15px auto;
  cursor: pointer;
  background: ${active ? theme.palette.info.light : theme.palette.background.paper};
  color: ${theme.palette.primary.dark};
  font-weight: 500;
  display: flex;
  `
);

export function NetworkSelector() {
  const theme = useTheme();
  const { switchNetwork, supportedChains, chainEntities, getConnectedChain, labels } =
    useNetworkSelector();
  const chain = getConnectedChain();
  const [anchorEl, setAnchorEl] = useState<any>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = async (chain?: Chain) => {
    if (chain) {
      switchNetwork(parseInt(chain.id));
    }
    setAnchorEl(null);
  };

  return (
    <NetworkSelectorWrapper>
      <DropdownButton
        id="basic-button"
        aria-controls={open ? 'basic-menu' : undefined}
        aria-haspopup="true"
        variant="outlined"
        aria-expanded={open ? 'true' : undefined}
        onClick={handleClick}
        startIcon={<TokenIcon symbol="eth" size="medium" />}
        endIcon={<ArrowIcon sx={{ transform: 'rotate(-180deg)' }} />}
      >
        <TextWrapper theme={theme}>
          {chain?.id && chainEntities[chain.id] && chainEntities[chain.id].label}
        </TextWrapper>
      </DropdownButton>
      <Popover
        id="basic-menu"
        open={open}
        anchorEl={anchorEl}
        onClose={() => handleClose()}
        transitionDuration={{ exit: 0, enter: 200 }}
        sx={{
          marginTop: '10px',
          '.MuiPopover-paper': {
            boxShadow: theme.shape.shadowLarge(),
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
        <Box sx={{ width: '450px', marginTop: '40px', marginBottom: '40px' }}>
          <Title>
            <FormattedMessage defaultMessage={'NETWORK'} />
          </Title>
          {supportedChains.map((data: Chain) => (
            <NetworkButton
              key={data.id}
              onClick={() => handleClose(data)}
              active={chain?.id === data.id}
              theme={theme}
            >
              <ListItemIcon sx={{ marginRight: '0px' }}>
                <TokenIcon symbol="eth" size="large" />
              </ListItemIcon>
              <Box sx={{ flex: 1, alignItems: 'center', display: 'flex' }}>
                <FormattedMessage {...labels[data.label]} />
              </Box>
              <Box sx={{ justifyContent: 'flex-end', display: 'flex', alignItems: 'center' }}>
                {chain?.id === data.id ? (
                  <CheckCircleIcon sx={{ fill: theme.palette.primary.main }} />
                ) : (
                  <CircleIcon
                    sx={{
                      stroke: theme.palette.borders.accentPaper,
                      width: '20px',
                      height: '20px',
                    }}
                  />
                )}
              </Box>
            </NetworkButton>
          ))}
        </Box>
      </Popover>
    </NetworkSelectorWrapper>
  );
}

export default NetworkSelector;
