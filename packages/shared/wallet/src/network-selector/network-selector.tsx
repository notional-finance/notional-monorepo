import React, { useState } from 'react';
import { TokenIcon } from '@notional-finance/icons';
import { FormattedMessage } from 'react-intl';
import { Chain } from '@web3-onboard/common';
import { NotionalTheme } from '@notional-finance/styles';
import { ArrowIcon } from '@notional-finance/icons';
import { chains } from '../onboard-context';
import { Caption, H4, H5 } from '@notional-finance/mui';
import { useTheme, Box, Button, styled, Popover } from '@mui/material';
import { getNetworkSymbol } from '@notional-finance/util';
import { useSelectedNetwork } from '../hooks/use-network';
import { useHistory, useLocation } from 'react-router';
import { Network } from '@notional-finance/util';

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
  const selectedNetwork = useSelectedNetwork();
  const dataLabel = data.label as Network;
  return (
    <NetworkButton
      key={data.id}
      onClick={() => handleClick(data)}
      active={data?.label === selectedNetwork}
      theme={theme}
      sx={{
        borderRadius:
          dataLabel === selectedNetwork && dataLabel === Network.Mainnet
            ? '0px 0px 6px 6px'
            : '0px',
      }}
    >
      <Box sx={{ marginRight: theme.spacing(1) }}>
        <TokenIcon symbol={getNetworkSymbol(dataLabel)} size="medium" />
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
        {data.label}
      </H4>
    </NetworkButton>
  );
};

export function NetworkSelector() {
  const theme = useTheme();
  const history = useHistory();
  const { pathname } = useLocation();
  const selectedNetwork = useSelectedNetwork();
  const [anchorEl, setAnchorEl] = useState<any>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (data?: any) => {
    setAnchorEl(null);
    if (data.label && !pathname.includes(data.label) && selectedNetwork) {
      history.push(pathname.replace(selectedNetwork, data.label));
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
        onClick={handleClick}
        startIcon={
          <TokenIcon symbol={getNetworkSymbol(selectedNetwork)} size="small" />
        }
        endIcon={
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
                transform: open ? 'rotate(0deg)' : 'rotate(-180deg)',
                transition: '.5s ease',
                width: theme.spacing(1.5),
                color: theme.palette.secondary.light,
              }}
            />
          </Box>
        }
        sx={{ boxShadow: 'none' }}
      >
        <TextWrapper theme={theme}>{selectedNetwork}</TextWrapper>
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
          <Box sx={{ margin: 'auto' }}>
            {chains.map((data: Chain) => (
              <NetworkSelectorButton
                key={data.id}
                data={data}
                handleClick={() => handleClose(data)}
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
    min-width: ${theme.spacing(15)};
    margin-left: ${theme.spacing(2.5)};
    box-shadow: none;
    transition: .3s ease;
    border-radius: 50px;
    #basic-button {
      padding: ${theme.spacing(1, 1.5)};
      border-radius: 50px;
      border: ${theme.shape.borderStandard};
      color: ${theme.palette.typography.main};
      &:hover {
        box-shadow: none;
        background-color: ${theme.palette.info.light};
      }
    }
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
  font-size: 1rem;
  border: ${theme.shape.borderStandard};
  background: ${theme.palette.common.white};
`
);

const TextWrapper = styled(Caption)(
  ({ theme }) => `
  flex: 1;
  text-align: left;
  color: ${theme.palette.typography.light};
`
);

const Title = styled(H5)(
  ({ theme }) => `
  margin: 30px auto;
  padding-left: ${theme.spacing(3)};
  letter-spacing: 1px;
  color: ${theme.palette.typography.light};
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

export default NetworkSelector;
