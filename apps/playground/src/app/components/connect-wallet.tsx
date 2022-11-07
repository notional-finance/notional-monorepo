import { Button, useTheme } from '@mui/material';
import { useOnboard } from '@notional-finance/notionable';

export function ConnectWallet() {
  const theme = useTheme();
  const { connectWallet } = useOnboard();
  const handleConnect = () => {
    connectWallet();
  };

  return (
    <Button
      variant="outlined"
      onClick={handleConnect}
      size="large"
      sx={{
        padding: '5px 20px',
        textTransform: 'capitalize',
        background: 'inherit',
      }}
    >
      Connect Wallet
    </Button>
  );
}

export default ConnectWallet;
