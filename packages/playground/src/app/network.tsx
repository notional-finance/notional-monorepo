import { Box, Grid, MenuItem, Select, Typography, Button } from '@mui/material';
import { useOnboard, chains, useNotional, switchNetwork } from '@notional-finance/notionable';
import { useState } from 'react';

export function Network() {
  const { connectWallet, supportedWallets, connected, chain, label } = useOnboard();
  const { connectedChain, loaded } = useNotional();
  const [selectedChain, setSelectedChain] = useState(chains[1].id);
  const [selectedWallet, setSelectedWallet] = useState('MetaMask');
  const handleWalletClick = async () => {
    try {
      await connectWallet(selectedWallet);
    } catch (error) {
      console.error(error);
    }
  };

  const handleChainClick = () => {
    switchNetwork(selectedChain);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', mt: '1rem', mx: '3rem' }}>
      <Box sx={{ display: 'flex', mb: '2rem' }}>
        <Select value={selectedChain} onChange={(e) => setSelectedChain(e.target.value)}>
          {chains.map((chain, index) => (
            <MenuItem key={chain.id} value={chain.id}>
              {chain.label}
            </MenuItem>
          ))}
        </Select>
        <Button variant="contained" color="primary" onClick={handleChainClick}>
          Switch Chain
        </Button>
        <Select value={selectedWallet} onChange={(e) => setSelectedWallet(e.target.value)}>
          {supportedWallets.map((wallet) => (
            <MenuItem key={wallet} value={wallet}>
              {wallet}
            </MenuItem>
          ))}
        </Select>
        <Button variant="contained" color="primary" onClick={handleWalletClick}>
          Connect Wallet
        </Button>
      </Box>
      <Box sx={{ display: 'flex', mb: '2rem' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography variant="h6" component="h3">
            Notional
          </Typography>
          {loaded && (
            <Grid
              container
              component="dl" // mount a Definition List
              spacing={2}
            >
              <Grid item>
                <Typography component="dt" variant="subtitle1">
                  Network
                </Typography>
              </Grid>
              <Grid item>
                <Typography component="dd" variant="body2">
                  {connectedChain}
                </Typography>
              </Grid>
            </Grid>
          )}
        </Box>
        {connected && (
          <Box sx={{ display: 'flex', flexDirection: 'column', ml: '2rem' }}>
            <Typography variant="h6" component="h3">
              Onboard
            </Typography>

            <Grid container component="dl" spacing={2}>
              <Grid item xs={6}>
                <Typography component="dt" variant="subtitle1">
                  Network
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography component="dd" variant="body2">
                  {chain?.id}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography component="dt" variant="subtitle1">
                  Wallet
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography component="dd" variant="body2">
                  {label}
                </Typography>
              </Grid>
            </Grid>
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default Network;
