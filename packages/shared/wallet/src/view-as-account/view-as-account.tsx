import React, { useState } from 'react';
import { ethers } from 'ethers';
import { Box, useTheme, styled } from '@mui/material';
import { Input, Button } from '@notional-finance/mui';
import { useSideDrawerManager } from '@notional-finance/notionable-hooks';
import { useNotionalContext } from '@notional-finance/notionable-hooks';
import { defineMessage, FormattedMessage } from 'react-intl';

export function ViewAsAccount() {
  const theme = useTheme();
  const [address, setAddress] = useState<string>('');
  const [error, setError] = useState<boolean>(false);
  const { clearWalletSideDrawer } = useSideDrawerManager();
  const { updateNotional } = useNotionalContext();

  const handleClick = () => {
    if (ethers.utils.isAddress(address)) {
      updateNotional({
        wallet: {
          signer: undefined,
          selectedAddress: address,
          isReadOnlyAddress: true,
          label: 'ReadOnly',
        },
      });
      clearWalletSideDrawer();
    } else {
      setError(true);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    const value = e?.target?.value;
    setAddress(value);
    if (error === true) {
      setError(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleClick();
    }
  };

  return (
    <Container>
      <Box
        sx={{
          borderTop: `1px solid ${theme.palette.borders.default}`,
          margin: theme.spacing(3, 0),
        }}
      ></Box>
      <Input
        placeholder="Enter ETH Address..."
        inputLabel={defineMessage({
          defaultMessage: 'View Site as Other Account',
        })}
        handleChange={handleChange}
        inputValue={address}
        onKeyDown={handleKeyDown}
        sx={{
          marginTop: theme.spacing(1),
          paddingLeft: theme.spacing(1),
          paddingRight: theme.spacing(1),
          borderColor: error ? theme.palette.error.main : '',
        }}
      />
      <Box
        component="span"
        sx={{
          color: error ? theme.palette.error.main : 'transparent',
          fontSize: '12px',
          minHeight: '15px',
        }}
      >
        {error ? <FormattedMessage defaultMessage="Address not valid" /> : '_'}
      </Box>
      <Button
        fullWidth
        variant="outlined"
        size="large"
        sx={{
          marginTop: {
            xs: theme.spacing(1),
            sm: theme.spacing(1),
            md: theme.spacing(4),
          },
        }}
        onClick={() => handleClick()}
      >
        <FormattedMessage defaultMessage="View Account" />
      </Button>
    </Container>
  );
}

const Container = styled(Box)(
  ({ theme }) => `
  padding-bottom: ${theme.spacing(6)};
  margin-top: auto;
  ${theme.breakpoints.down('sm')} {
    display: flex;
    flex-direction: column;
    height: 100%;
    background: ${theme.palette.background.paper};
  }
  `
);

export default ViewAsAccount;
