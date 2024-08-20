import { trackEvent } from '@notional-finance/helpers';
import { pointsStore } from '@notional-finance/notionable';
import { useNotionalContext } from '@notional-finance/notionable-hooks';
import { getNetworkFromId, TRACKING_EVENTS } from '@notional-finance/util';
import { useConnectWallet, useSetChain } from '@web3-onboard/react';
import { BigNumber, ethers } from 'ethers';
import { useCallback, useEffect } from 'react';

export const useWalletActive = () => {
  const [{ wallet }] = useConnectWallet();
  return wallet?.accounts[0].address ? true : false;
}

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
  const currentLabel = wallet?.label;
  const [{ connectedChain }] = useSetChain(currentLabel);
  const icon = wallet?.icon;

  // The first account and chain are considered "selected" by the UI
  const selectedAddress = globalState?.wallet?.isReadOnlyAddress
    ? globalState?.wallet?.selectedAddress
    : wallet?.accounts[0].address;
  const isReadOnlyAddress = globalState?.wallet?.isReadOnlyAddress;

  const onboardChainId = connectedChain?.id;
  const selectedChain = onboardChainId
    ? getNetworkFromId(BigNumber.from(onboardChainId).toNumber())
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
      trackEvent(TRACKING_EVENTS.DISCONNECT_WALLET, {
        wallet: currentLabel,
      });
    }
    updateNotional({ wallet: undefined });
  }, [disconnect, currentLabel, updateNotional]);

  useEffect(() => {
    pointsStore.initialize(selectedAddress || '');
  }, [selectedAddress]);

  // Listens for wallet changes and sets the primary wallet as well as sends the
  // addresses to the Notional global state
  useEffect(() => {
    if (!selectedAddress) {
      updateNotional({ wallet: undefined });
    } else if (wallet && selectedAddress && !isReadOnlyAddress) {
      setPrimaryWallet(wallet, selectedAddress);
      const provider = new ethers.providers.Web3Provider(wallet.provider);
      const signer = provider.getSigner();

      updateNotional({
        wallet: {
          signer,
          selectedChain,
          selectedAddress,
          isReadOnlyAddress: false,
          label: wallet.label,
          provider,
        },
      });
    }
  }, [
    wallet,
    selectedAddress,
    onboardChainId,
    selectedChain,
    setPrimaryWallet,
    updateNotional,
    isReadOnlyAddress,
  ]);

  return {
    isReadOnlyAddress,
    connectWallet,
    disconnectWallet,
    currentLabel,
    icon,
  };
};
