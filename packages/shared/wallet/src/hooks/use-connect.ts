import { useConnectWallet } from '@web3-onboard/react';
import { useCallback, useEffect } from 'react';

export const useConnect = () => {
  const [
    { wallet },
    connect,
    disconnect,
    _updateBalances,
    _setWalletModules,
    setPrimaryWallet,
  ] = useConnectWallet();
  const currentLabel = wallet?.label;
  // The first account and chain are considered "selected" by the UI
  const selectedAddress = wallet?.accounts[0].address;
  const selectedChain = wallet?.chains[0].id;

  const connectWallet = useCallback(
    (walletLabel?: string) => {
      // No change to wallets, nothing to do here.
      if (!walletLabel || currentLabel === walletLabel) return;
      connect({ autoSelect: { label: walletLabel, disableModals: true } });
    },
    [connect, currentLabel]
  );

  const disconnectWallet = useCallback(() => {
    if (currentLabel) disconnect({ label: currentLabel });
  }, [disconnect, currentLabel]);

  // Listens for wallet changes and sets the primary wallet as well as sends the
  // addresses to the Notional global state
  useEffect(() => {
    console.log('wallet has changed');
    console.log(selectedAddress);
    console.log(selectedChain);
    if (wallet && selectedAddress) setPrimaryWallet(wallet, selectedAddress);

    // const hasNetworkError = notionalState.currentNetwork != wallet?.chains[0];
    // updateNotionalState({ walletNetwork: address$, hasNetworkError: true });
  }, [wallet, selectedAddress, selectedChain, setPrimaryWallet]);

  return {
    connectWallet,
    disconnectWallet,
    currentLabel,
  };
};
