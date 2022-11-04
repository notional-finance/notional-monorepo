import { Box } from '@mui/material';
import { AccountView } from '../views/account-view';
import { TokenBalances } from '../views/token-balances';
import { CurrencyMarkets } from '../views/currency-markets';
import { useAccount } from '@notional-finance/notionable';

export function Home() {
  const { accountConnected } = useAccount();

  return (
    <Box
      sx={{ display: 'flex', flexDirection: 'column', mt: '1rem', mx: '3rem' }}
    >
      <CurrencyMarkets />
      <Box sx={{ display: 'flex' }}>
        {accountConnected && <TokenBalances />}
        {accountConnected && <AccountView />}
      </Box>
    </Box>
  );
}

export default Home;
