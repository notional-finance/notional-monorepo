import React from 'react';
import { TokenIcon } from '@notional-finance/icons';
import { FormattedMessage } from 'react-intl';
import { Chain } from '@web3-onboard/common';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { NotionalTheme } from '@notional-finance/styles';
import { CircleIcon } from '@notional-finance/icons';
import { useTheme, Box, styled, ListItemIcon, Typography } from '@mui/material';
import { H4 } from '@notional-finance/mui';
import { useNetworkSelector } from './use-network-selector';

/* eslint-disable-next-line */
export interface NetworkSelectorProps {
  networkData?: Chain;
}

export interface NetworkButtonProps {
  active?: boolean;
  theme: NotionalTheme;
}

export const NetworkSelectorButton = () => {
  const theme = useTheme();
  const { getConnectedChain } = useNetworkSelector();
  const { chainEntities } = useNetworkSelector();
  const chain = getConnectedChain();

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <TokenIcon symbol="eth" size="medium" />
      <Box sx={{ marginLeft: theme.spacing(1) }}>
        {chain?.id && chainEntities[chain.id] && chainEntities[chain.id].label}
      </Box>
    </Box>
  );
};

export function NetworkSelector() {
  const theme = useTheme();
  const { switchNetwork, supportedChains, getConnectedChain, labels } =
    useNetworkSelector();
  const chain = getConnectedChain();

  const handleClick = async (chain?: Chain) => {
    if (chain) {
      switchNetwork(parseInt(chain.id));
    }
  };

  return (
    <NetworkWrapper>
      <Title>
        <FormattedMessage defaultMessage={'NETWORK'} />
      </Title>
      {supportedChains.map((data: Chain) => (
        <NetworkButton
          key={data.id}
          onClick={() => handleClick(data)}
          active={chain?.id === data.id}
          theme={theme}
        >
          <ListItemIcon sx={{ marginRight: '0px' }}>
            <TokenIcon symbol="eth" size="large" />
          </ListItemIcon>
          <H4 sx={{ flex: 1, alignItems: 'center', display: 'flex' }}>
            <FormattedMessage {...labels[data.label]} />
          </H4>
          <Box
            sx={{
              justifyContent: 'flex-end',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {chain?.id === data.id ? (
              <CheckCircleIcon sx={{ fill: theme.palette.primary.main }} />
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
        </NetworkButton>
      ))}
    </NetworkWrapper>
  );
}

const NetworkWrapper = styled(Box)(
  ({ theme }) => `
    width: 100%;
    margin-bottom: ${theme.spacing(5)};
    ${theme.breakpoints.down('sm')} {
      width: 100%;
      padding: ${theme.spacing(1)};
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

const NetworkButton = styled(Box, {
  shouldForwardProp: (prop: string) => prop !== 'active',
})(
  ({ theme, active }: NetworkButtonProps) => `
  width: 100%;
  padding: ${theme.spacing(2)};
  border-radius: ${theme.shape.borderRadius()};
  border: 1px solid ${
    active ? theme.palette.primary.main : theme.palette.borders.paper
  };
  margin: ${theme.spacing(1)} 0px;
  cursor: pointer;
  background: ${
    active ? theme.palette.info.light : theme.palette.background.paper
  };
  color: ${theme.palette.primary.dark};
  font-weight: 500;
  display: flex;
  ${theme.breakpoints.down('sm')} {
    width: auto;
  }
  `
);

export default NetworkSelector;
