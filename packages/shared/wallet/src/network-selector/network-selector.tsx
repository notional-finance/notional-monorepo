import React, { useState } from 'react';
import { TokenIcon } from '@notional-finance/icons';
import { FormattedMessage } from 'react-intl';
import { Chain } from '@web3-onboard/common';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { NotionalTheme } from '@notional-finance/styles';
import { ArrowIcon, CircleIcon } from '@notional-finance/icons';
import { chains } from '../onboard-context';
import { LabelValue } from '@notional-finance/mui';
import {
  useTheme,
  Box,
  Button,
  styled,
  ListItemIcon,
  Popover,
} from '@mui/material';
import { useNotionalContext } from '@notional-finance/notionable-hooks';
import { Network } from '@notional-finance/util';
import { useNetworkSelector } from '../hooks/use-network-selector';

export interface NetworkButtonProps {
  active?: boolean;
  theme: NotionalTheme;
}
export interface NetworkSelectorButtonProps {
  data: Chain;
  handleClick: (data: Chain) => void;
}

export const NetworkSelectorButton = ({
  data,
  handleClick,
}: NetworkSelectorButtonProps) => {
  const theme = useTheme();
  const { labels } = useNetworkSelector();
  const label = data.label ? labels[data.label] : '';
  return (
    <NetworkButton
      key={data.id}
      onClick={data.id === chains[0].id ? () => handleClick(data) : undefined}
      active={data?.id === chains[0].id}
      theme={theme}
    >
      <ListItemIcon sx={{ marginRight: '0px' }}>
        <TokenIcon
          symbol={data.id === chains[0].id ? 'arb' : 'eth'}
          size="large"
        />
      </ListItemIcon>
      <Box sx={{ flex: 1, alignItems: 'center', display: 'flex' }}>
        <FormattedMessage {...label} />
      </Box>
      <Box
        sx={{
          justifyContent: 'flex-end',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {chains[0].id === data.id ? (
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
  );
};

export function NetworkSelector() {
  const theme = useTheme();
  const { updateNotional } = useNotionalContext();
  const [anchorEl, setAnchorEl] = useState<any>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = async (chain?: Chain) => {
    if (chain) {
      const currentChain = chain.label as Network;
      updateNotional({ selectedNetwork: currentChain });
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
        startIcon={<TokenIcon symbol="arb" size="medium" />}
        endIcon={<ArrowIcon sx={{ transform: 'rotate(-180deg)' }} />}
      >
        <TextWrapper theme={theme}>{chains[0].label}</TextWrapper>
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
          <Title>
            <FormattedMessage defaultMessage={'NETWORK'} />
          </Title>
          <Box sx={{ width: '380px', margin: 'auto' }}>
            {chains.map((data: Chain) => (
              <NetworkSelectorButton
                key={data.id}
                data={data}
                handleClick={handleClose}
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
    #basic-button {
      padding: 10px 15px;
      border-radius: ${theme.shape.borderRadius()};
      color: ${theme.palette.typography.main};
    }
    #basic-menu {
      border-radius: ${theme.shape.borderRadius()};
    }
    box-shadow: ${theme.shape.shadowStandard};
    ${theme.breakpoints.down('sm')} {
      margin-left: 0px;
      margin-top: ${theme.spacing(3)};
    }
  `
);

const NetworkInnerWrapper = styled(Box)(
  ({ theme }) => `
    width: 450px;
    margin-top: ${theme.spacing(5)};
    margin-bottom: ${theme.spacing(5)};
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

const Title = styled(LabelValue)(
  ({ theme }) => `
  margin: 30px auto;
  width: 380px;
  font-weight: 700;
  color: ${theme.palette.borders.accentDefault};
  ${theme.breakpoints.down('sm')} {
    width: auto;
  }
  `
);

const NetworkButton = styled(Box, {
  shouldForwardProp: (prop: string) => prop !== 'active',
})(
  ({ theme, active }: NetworkButtonProps) => `
  width: 100%;
  padding: 15px 10px;
  border-radius: ${theme.shape.borderRadius()};
  border: 1px solid ${
    active ? theme.palette.primary.main : theme.palette.borders.accentPaper
  };
  margin: 15px auto;
  cursor: ${active ? 'pointer' : 'not-allowed'};
  background: ${
    active ? theme.palette.info.light : theme.palette.borders.default
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
