import { useNotionalContext } from '@notional-finance/notionable-hooks';
import { getNetworkFromId } from '@notional-finance/util';
import { useConnectWallet } from '@web3-onboard/react';
import { BigNumber } from 'ethers';
import { useCallback, useEffect } from 'react';

export const useConnect = () => {
  const {
    globalState: { selectedNetwork },
    updateNotional,
  } = useNotionalContext();
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
  const selectedChain = wallet?.chains[0].id
    ? getNetworkFromId(BigNumber.from(wallet.chains[0].id).toNumber())
    : undefined;

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
    if (!selectedAddress) {
      updateNotional({ wallet: undefined });
    } else if (wallet && selectedAddress) {
      setPrimaryWallet(wallet, selectedAddress);

      updateNotional({
        wallet: {
          selectedChain,
          selectedAddress,
          hasSelectedChainError:
            selectedNetwork !== undefined && selectedChain !== selectedNetwork,
        },
      });
    }
  }, [
    wallet,
    selectedAddress,
    selectedChain,
    selectedNetwork,
    setPrimaryWallet,
    updateNotional,
  ]);

  return {
    connectWallet,
    disconnectWallet,
    currentLabel,
  };
};
