import { Box, Typography, Card, TextField, Button } from '@mui/material';
import { useAccount } from '@notional-finance/notionable';
import { TokenIcon } from './token-icon/token-icon';
import Date from './date/date';
import { useState } from 'react';

export const AccountView = () => {
  const [address, setAddress] = useState('');
  const {
    balanceSummary,
    assetSummary,
    isReadOnly,
    readOnlyAddress,
    account,
    setReadOnlyAddress,
  } = useAccount();

  const handleAddressChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAddress(event.target.value);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        paddingTop: 1,
        m: 1,
        maxWidth: 600,
      }}
    >
      <Typography variant="h5" component="h3" sx={{ marginBottom: 1 }}>
        Account
      </Typography>
      <Typography variant="subtitle1" component="h4" sx={{ marginBottom: 1 }}>
        Balance Summary
      </Typography>
      {[...balanceSummary.entries()].map(([key, summary]) => (
        <Card key={key} sx={{ p: 1, mb: 1 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignContent: 'center',
            }}
          >
            <Box sx={{ display: 'flex', alignContent: 'center' }}>
              <TokenIcon
                symbol={summary.underlyingSymbol ?? summary.symbol}
                width="24"
              />
              <Typography variant="caption" sx={{ ml: 1 }}>
                {summary.underlyingSymbol ?? summary.symbol}
              </Typography>
            </Box>
            <Box>{summary.totalUnderlyingValueDisplayString}</Box>
          </Box>
        </Card>
      ))}
      <Typography variant="subtitle1" component="h4" sx={{ marginBottom: 1 }}>
        Asset Summary
      </Typography>
      {[...assetSummary.entries()].map(([key, summary]) => (
        <Card key={key} sx={{ p: 1, mb: 1 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignContent: 'center',
            }}
          >
            <Box sx={{ display: 'flex', alignContent: 'center' }}>
              <TokenIcon
                symbol={summary.underlyingSymbol ?? summary.symbol}
                width="24"
              />
              <Typography variant="caption" sx={{ ml: 1 }}>
                {summary.underlyingSymbol ?? summary.symbol}
              </Typography>
            </Box>
            <Box>
              <Date timestampInSeconds={summary.maturity} />
            </Box>
            <Box>{summary.fCashValue.toDisplayString()}</Box>
          </Box>
        </Card>
      ))}
      <Typography variant="subtitle1" component="h4" sx={{ marginBottom: 1 }}>
        Account
      </Typography>
      <Card sx={{ p: 1, mb: 1 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignContent: 'center',
          }}
        >
          <Box sx={{ display: 'flex', alignContent: 'center' }}>
            <Typography variant="caption" sx={{ ml: 1 }}>
              Read Only
            </Typography>
            <Typography variant="caption" sx={{ ml: 1 }}>
              {isReadOnly ? 'true' : 'false'}
            </Typography>
          </Box>
        </Box>
      </Card>
      <Card sx={{ p: 1, mb: 1 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignContent: 'center',
          }}
        >
          <Box sx={{ display: 'flex', alignContent: 'center' }}>
            <Typography variant="caption" sx={{ ml: 1 }}>
              Account
            </Typography>
            <Typography variant="caption" sx={{ ml: 1 }}>
              {account?.address ?? '--'}
            </Typography>
          </Box>
        </Box>
      </Card>
      <Card sx={{ p: 1, mb: 1 }}>
        <Box
          component="form"
          sx={{
            '& > :not(style)': { m: 1, width: '25ch' },
          }}
          noValidate
          autoComplete="off"
        >
          <TextField
            label="Set Account"
            variant="standard"
            onChange={handleAddressChange}
          />
          <Button onClick={() => setReadOnlyAddress(address)}>Set</Button>
        </Box>
      </Card>
    </Box>
  );
};
