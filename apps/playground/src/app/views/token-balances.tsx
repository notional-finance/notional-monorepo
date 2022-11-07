import { useWallet } from '@notional-finance/notionable';
import { Box, Card, Typography } from '@mui/material';
import { TokenIcon } from '../components/token-icon';

export const TokenBalances = () => {
  const { tokens } = useWallet();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        paddingTop: 1,
        m: 1,
        maxWidth: 200,
      }}
    >
      <Typography variant="h5" component="h3" sx={{ marginBottom: 1 }}>
        Wallet Balances
      </Typography>
      {[...tokens.entries()].map(([key, token]) => (
        <Card key={key} sx={{ p: 1, mb: 1 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignContent: 'center',
            }}
          >
            <Box sx={{ display: 'flex', alignContent: 'center' }}>
              <TokenIcon symbol={key} width="24" />
              <Typography variant="caption" sx={{ ml: 1 }}>
                {key}
              </Typography>
            </Box>
            <Box>{token.balance.toDisplayString()}</Box>
            {/* <Box>{token.balance.isUnderlying() ? 'true' : 'false'}</Box> */}
          </Box>
        </Card>
      ))}
    </Box>
  );
};
