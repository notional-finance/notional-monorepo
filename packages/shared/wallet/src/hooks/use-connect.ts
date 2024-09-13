import { trackEvent } from '@notional-finance/helpers';
import { pointsStore } from '@notional-finance/notionable';
import { useAppStore } from '@notional-finance/notionable';
import { getNetworkFromId, TRACKING_EVENTS } from '@notional-finance/util';
import { useConnectWallet, useSetChain } from '@web3-onboard/react';
import { BigNumber } from 'ethers';
import { useCallback, useEffect } from 'react';

export const useWalletActive = () => {
  const [{ wallet }] = useConnectWallet();
  return wallet?.accounts[0].address ? true : false;
}

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
  const [{ connectedChain }] = useSetChain(currentLabel);
  const appStore = useAppStore();
  const icon = wallet?.icon;
  // The first account and chain are considered "selected" by the UI
  const selectedAddress = appStore?.wallet?.userWallet?.isReadOnlyAddress
    ? appStore?.wallet?.userWallet?.selectedAddress
    : wallet?.accounts[0].address;
  const isReadOnlyAddress = appStore?.wallet?.userWallet?.isReadOnlyAddress;
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
    appStore.wallet.setUserWallet(undefined);
  }, [disconnect, currentLabel, appStore.wallet]);

  useEffect(() => {
    pointsStore.initialize(selectedAddress || '');
  }, [selectedAddress]);

  // Listens for wallet changes and sets the primary wallet as well as sends the
  // addresses to the Notional global state
  useEffect(() => {
    if (!selectedAddress) {
      appStore.wallet.setUserWallet(undefined);
    } else if (wallet && selectedAddress && !isReadOnlyAddress && selectedChain) {
      setPrimaryWallet(wallet, selectedAddress);
        appStore.wallet.setUserWallet({
          selectedChain,
          selectedAddress,
          isReadOnlyAddress: false,
          label: wallet.label,
        });
    }
  }, [
    wallet,
    appStore,
    selectedAddress,
    onboardChainId,
    selectedChain,
    setPrimaryWallet,
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
