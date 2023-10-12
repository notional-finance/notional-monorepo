import { trackEvent } from '@notional-finance/helpers';
import { useNotionalContext } from '@notional-finance/notionable-hooks';
import { getNetworkFromId } from '@notional-finance/util';
import { useConnectWallet } from '@web3-onboard/react';
import { BigNumber, ethers } from 'ethers';
import { useCallback, useEffect } from 'react';
import useNftContract from './use-nft-contract';

export const useConnect = () => {
  const { globalState, updateNotional } = useNotionalContext();
  const [
    { wallet },
    connect,
    disconnect,
    _updateBalances,
    _setWalletModules,
    setPrimaryWallet,
  ] = useConnectWallet();

  const { selectedNetwork } = globalState;
  const currentLabel = wallet?.label;
  const icon = wallet?.icon;

  // The first account and chain are considered "selected" by the UI
  const selectedAddress = globalState?.wallet?.isReadOnlyAddress
    ? globalState?.wallet?.selectedAddress
    : wallet?.accounts[0].address;
  const isReadOnlyAddress = globalState?.wallet?.isReadOnlyAddress;

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
    if (currentLabel) {
      disconnect({ label: currentLabel });
      trackEvent('DisconnectWallet', { wallet: currentLabel, selectedNetwork });
    }
    updateNotional({ wallet: undefined });
  }, [disconnect, currentLabel, updateNotional, selectedNetwork]);

  // Listens for wallet changes and sets the primary wallet as well as sends the
  // addresses to the Notional global state
  useEffect(() => {
    if (!selectedAddress) {
      updateNotional({ wallet: undefined });
    } else if (wallet && selectedAddress && !isReadOnlyAddress) {
      setPrimaryWallet(wallet, selectedAddress);
      const provider = new ethers.providers.Web3Provider(wallet.provider);
      const signer = provider.getSigner();
      const hasSelectedChainError =
        selectedNetwork !== undefined && selectedChain !== selectedNetwork;

      if (hasSelectedChainError) {
        updateNotional({
          hasSelectedChainError,
          wallet: undefined,
        });
      } else {
        updateNotional({
          hasSelectedChainError,
          wallet: {
            signer,
            selectedChain,
            selectedAddress,
            isReadOnlyAddress: false,
            label: wallet.label,
          },
        });
      }
    }
  }, [
    wallet,
    selectedAddress,
    selectedChain,
    selectedNetwork,
    setPrimaryWallet,
    updateNotional,
    isReadOnlyAddress,
  ]);

  useNftContract(selectedAddress);

  return {
    isReadOnlyAddress,
    connectWallet,
    disconnectWallet,
    currentLabel,
    icon,
  };
};
