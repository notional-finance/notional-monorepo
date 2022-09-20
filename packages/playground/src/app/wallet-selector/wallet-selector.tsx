import React, { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import NetworkSelector from '../network-selector/network-selector';
import { useOnboard } from '@notional-finance/notionable';

/* eslint-disable-next-line */
export interface WalletSelectorProps {}

export function WalletSelector(props: WalletSelectorProps) {
  const theme = useTheme();
  const { connected, icon, label, getTruncatedAddress, address } = useOnboard();

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      {connected ? (
        <>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              borderRadius: '10px',
              padding: '1px',
              border: `1px solid #2BCAD0`,
              backgroundColor: theme.palette.common.white,
              cursor: 'pointer',
            }}
          >
            {icon && icon.length > 0 && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '7px',
                  background:
                    'linear-gradient(180deg, #2BCAD0 0%, #8BC1E5 100%)',
                  borderRadius: '10px',
                }}
              >
                <img
                  src={`data:image/svg+xml;base64,${icon}`}
                  alt={`${label} wallet icon`}
                  height="24px"
                  width="24px"
                />
              </Box>
            )}
            <Box
              sx={{
                flex: 1,
                margin: '0px 10px',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Typography
                sx={{
                  fontWeight: 500,
                  color: theme.palette.common.black,
                }}
              >
                {getTruncatedAddress()}
              </Typography>
            </Box>
          </Box>
          <NetworkSelector />
        </>
      ) : (
        <Typography sx={{ color: theme.palette.common.black }}>
          Loading... ...
        </Typography>
      )}
    </Box>
  );
}

export default WalletSelector;
