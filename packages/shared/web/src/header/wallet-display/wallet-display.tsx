import React, { useState } from 'react';
import { Box, IconButton, MenuItem, MenuList, Popover, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { ArrowIcon } from '@notional-finance/icons';
import { FormattedMessage } from 'react-intl';

 
export interface WalletDisplayProps {
  address: string;
  type: string;
  hasLoaded: boolean;
  walletIconSrc: string;
  resetWallet: () => void;
}

export function WalletDisplay({
  address,
  type,
  hasLoaded,
  walletIconSrc,
  resetWallet,
}: WalletDisplayProps) {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
  };
  const open = Boolean(anchorEl);
  const id = open ? 'reset-wallet' : undefined;

  let walletIcon;
  if (walletIconSrc) {
    walletIcon = <img src={walletIconSrc} alt={`${type} wallet icon`} height="24px" width="24px" />;
  }
  const truncatedAddress = address
    ? `${address.slice(0, 6)}...${address.slice(address.length - 4)}`
    : '';

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      {hasLoaded ? (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            borderRadius: theme.shape.borderRadius(),
            border: `1px solid ${theme.palette.borders.paper}`,
            backgroundColor: theme.palette.common.white,
            padding: '5px 15px 5px 20px',
            marginRight: '10px',
          }}
        >
          <Box sx={{ marginRight: '10px' }}>{walletIcon}</Box>
          <Box>
            <Typography
              sx={{
                color: theme.palette.common.black,
              }}
            >
              <FormattedMessage defaultMessage={'Wallet'} />
            </Typography>
          </Box>
          <Box sx={{ marginLeft: '40px' }}>
            <Typography
              sx={{
                color: theme.palette.common.black,
              }}
            >
              {truncatedAddress}
            </Typography>
          </Box>
        </Box>
      ) : (
        <Typography sx={{ color: theme.palette.common.black }}>
          {walletIcon} <FormattedMessage defaultMessage={'Loading'} />
          ...
        </Typography>
      )}
      <IconButton
        color="inherit"
        aria-describedby={id}
        onClick={handleClick}
        sx={{ backgroundColor: theme.palette.common.white }}
        size="small"
      >
        <ArrowIcon
          sx={{
            color: theme.palette.primary.light,
            fontSize: '.875rem',
            fontWeight: 700,
            transform: `rotate(${open ? '0' : '180'}deg)`,
            transition: 'transform .5s ease-in-out',
          }}
        />
      </IconButton>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClick}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuList>
          <MenuItem onClick={resetWallet}>
            <FormattedMessage defaultMessage={'Reset Wallet'} />
          </MenuItem>
        </MenuList>
      </Popover>
    </Box>
  );
}

export default WalletDisplay;
