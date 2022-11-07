import React, { useState } from 'react';
import { Chain } from '@web3-onboard/common';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PanoramaFishEyeIcon from '@mui/icons-material/PanoramaFishEye';
import { ArrowDownward } from '@mui/icons-material';
import { ChevronRight } from '@mui/icons-material';
import {
  useTheme,
  Box,
  Button,
  styled,
  ListItemIcon,
  Popover,
  Typography,
} from '@mui/material';
import { useNetworkSelector } from './use-network-selector';

/* eslint-disable-next-line */
export interface NetworkSelectorProps {
  networkData?: Chain;
}

export interface NetworkButtonProps {
  active?: boolean;
}

const NetworkSelectorWrapper = styled(Box)(
  ({ theme }) => `
    margin-left: 20px;
    #basic-button {
      padding: 10px 15px;
      border-radius: 10px;
      color: black;
    }
    #basic-menu {
      border-radius: 10px;
    }
  `
);

const DropdownButton = styled(Button)(
  ({ theme }) => `
  width: 100%;
  text-transform: capitalize;
  justify-content: flex-start;
  font-size: 1rem;
  border: 1px solid #2BCAD0;
  background: ${theme.palette.common.white};
  &:hover {
    background-color: ${theme.palette.common.white} !important;
  }
`
);

const TextWrapper = styled('div')(
  ({ theme }) => `
  flex: 1;
  text-align: left;
`
);

const Title = styled(Typography)(
  ({ theme }) => `
  margin: 30px auto;
  width: 380px;
  font-weight: 700;
  color: #1C4E5C;
  `
);

const NetworkButton = styled(Box, {
  shouldForwardProp: (prop: string) => prop !== 'active',
})(
  ({ active }: NetworkButtonProps) => `
  width: 380px;
  padding: 15px 10px;
  border-radius: 10px;
  border: 1px solid ${active ? '#1F9B99' : '#8F9BB3'};
  margin: 15px auto;
  cursor: pointer;
  background: ${active ? `rgba(19,187,194, 0.1)` : 'white'};
  color: #1C4E5C;
  font-weight: 500;
  display: flex;
  `
);

export function NetworkSelector() {
  const theme = useTheme();
  const { switchNetwork, supportedChains, chainEntities, getConnectedChain } =
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
        endIcon={
          <ChevronRight
            sx={{
              transform: open ? 'rotate(-90deg)' : 'rotate(90deg)',
            }}
          />
        }
      >
        <TextWrapper theme={theme}>
          {chain?.id && chainEntities[chain.id] && (
            <Typography component="span" variant="body2">
              {chainEntities[chain.id].label.slice(15)}
            </Typography>
          )}
        </TextWrapper>
      </DropdownButton>
      <Popover
        id="basic-menu"
        open={open}
        anchorEl={anchorEl}
        onClose={() => handleClose()}
        transitionDuration={{ exit: 0, enter: 200 }}
        sx={{ marginTop: '10px' }}
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
            <Typography component="span" variant="h5">
              Select a network
            </Typography>
          </Title>
          {supportedChains.map((data: Chain) => (
            <NetworkButton
              key={data.id}
              onClick={() => handleClose(data)}
              active={chain?.id === data.id}
              theme={theme}
            >
              <Box sx={{ flex: 1, alignItems: 'center', display: 'flex' }}>
                <Typography variant="body1">{data.label}</Typography>
              </Box>
              <Box
                sx={{
                  justifyContent: 'flex-end',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                {chain?.id === data.id ? (
                  <CheckCircleIcon sx={{ fill: '#1F9B99' }} />
                ) : (
                  <PanoramaFishEyeIcon sx={{ fill: '#8F9BB3' }} />
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
