import { useNotionalContext } from '@notional-finance/notionable-hooks';
import { truncateAddress } from '@notional-finance/helpers';
import { getNetworkFromId } from '@notional-finance/util';
import { useConnectWallet } from '@web3-onboard/react';
import { BigNumber, ethers } from 'ethers';
import { useCallback, useEffect } from 'react';

export const useConnect = () => {
  const { globalState, updateNotional } = useNotionalContext();
  const [
    { wallet, connecting },
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
  const selectedAddress =
    globalState?.wallet?.selectedAddress || wallet?.accounts[0].address;
  const isReadOnlyAddress = globalState?.wallet?.isReadOnlyAddress;

  const truncatedAddress = selectedAddress
    ? truncateAddress(selectedAddress)
    : '';

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
    updateNotional({ wallet: undefined });
  }, [disconnect, currentLabel, updateNotional]);

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
    isReadOnlyAddress,
  ]);

  return {
    connecting,
    isReadOnlyAddress,
    selectedAddress,
    truncatedAddress,
    connectWallet,
    disconnectWallet,
    currentLabel,
    icon,
  };
};
