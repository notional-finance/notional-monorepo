import { useCallback } from 'react';
import { trackEvent } from '@notional-finance/helpers';
import { useNotionalContext } from '@notional-finance/notionable-hooks';
import { getNetworkFromId, TRACKING_EVENTS } from '@notional-finance/util';
import MetaMask from '../images/meta-mask.svg';
import WalletConnect from '../images/wallet-connect.svg';
import CoinbaseWallet from '../images/coinbase-wallet.svg';
import Safe from '../images/safe.svg';
import { BigNumber } from 'ethers';
import { useEffect } from 'react';
import { providers } from 'ethers';
import { useMemo } from 'react';
import type { Account, Chain, Client, Transport } from 'viem';
import { useAccount as useWagmiAccount, Config, useConnectorClient, Connector, useConnect as useWagmiConnect, useDisconnect as useWagmiDisconnect } from 'wagmi';

export function clientToSigner(client: Client<Transport, Chain, Account>) {
  const { account, chain, transport } = client;
  const network = {
    chainId: chain.id,
    name: chain.name,
    ensAddress: chain.contracts?.ensRegistry?.address,
  };
  const provider = new providers.Web3Provider(transport, network);
  const signer = provider.getSigner(account.address);
  return { signer, provider };
}

/** Hook to convert a Viem Client to an ethers.js Signer. */
export function useEthersSigner({ chainId }: { chainId?: number } = {}) {
  const { data: client } = useConnectorClient<Config>({ chainId });
  return useMemo(() => (client ? clientToSigner(client) : undefined), [client]);
}

const connectorIcons = {
  MetaMask: MetaMask,
  Safe: Safe,
  WalletConnect: WalletConnect,
  'Coinbase Wallet': CoinbaseWallet,
};

export const useConnect = () => {
  const { globalState, updateNotional } = useNotionalContext();
  const wagmiAccount = useWagmiAccount();
  const { disconnect } = useWagmiDisconnect({
    mutation: {
      onSuccess: () => {
        updateNotional({ wallet: undefined });
      },
    },
  });
  const { connectors, connect } = useWagmiConnect();
  const ethersData = useEthersSigner({ chainId: wagmiAccount?.chain?.id });
  const currentLabel = wagmiAccount?.connector?.name;
  const isReadOnlyAddress = globalState?.wallet?.isReadOnlyAddress;

  const connectWallet = useCallback(
    (walletLabel?: string) => {
      // No change to wallets, nothing to do here.
      if (!walletLabel || currentLabel === walletLabel) return;
      const connector = connectors.find(
        (c) => c.name === walletLabel
      ) as Connector;
      connect({ connector });
    },
    [currentLabel, connectors, connect]
  );

  const displayConnectors = useMemo(() => {
    return connectors
      .filter(({ id }) => id !== 'injected' && id !== 'metaMaskSDK')
      .map((data) => {
        return {
          ...data,
          displayIcon: connectorIcons[data.name],
        };
      });
  }, [connectors]);

  const icon = displayConnectors.find(
    ({ name }) => name === wagmiAccount?.connector?.name
  )?.displayIcon;

  const disconnectWallet = useCallback(() => {
    if (currentLabel) {
      disconnect();
      updateNotional({ wallet: undefined });
      trackEvent(TRACKING_EVENTS.DISCONNECT_WALLET, {
        wallet: currentLabel,
      });
    }
  }, [disconnect, currentLabel, updateNotional]);

  // // Listens for wallet changes and sets the primary wallet as well as sends the
  // // addresses to the Notional global state
  useEffect(() => {
    if (
      wagmiAccount?.address &&
      ethersData &&
      globalState?.wallet === undefined &&
      !isReadOnlyAddress
    ) {
      const { signer, provider } = ethersData;
      updateNotional({
        wallet: {
          isReadOnlyAddress: false,
          selectedChainId: wagmiAccount.chainId,
          selectedAddress: wagmiAccount?.address,
          selectedChain: getNetworkFromId(
            BigNumber.from(wagmiAccount.chainId).toNumber()
          ),
          label: '',
          signer,
          provider,
        },
      });
    } 
  }, [
    wagmiAccount,
    ethersData,
    updateNotional,
    globalState?.wallet,
    isReadOnlyAddress,
    disconnect,
  ]);

  // Handles wallet change or network change
  useEffect(() => {
    if (
      ethersData &&
      !isReadOnlyAddress &&
      globalState?.wallet !== undefined &&
      wagmiAccount.address &&
      wagmiAccount.chainId &&
      (wagmiAccount.chainId !== globalState?.wallet?.selectedChainId ||
        wagmiAccount.address !== globalState?.wallet?.selectedAddress)
    ) {
      const { signer, provider } = ethersData;
      updateNotional({
        wallet: {
          ...globalState?.wallet,
          selectedChainId: wagmiAccount.chainId,
          selectedAddress: wagmiAccount?.address,
          selectedChain: getNetworkFromId(
            BigNumber.from(wagmiAccount.chainId).toNumber()
          ),
          signer,
          provider,
        },
      });
    }
  }, [ethersData, wagmiAccount, updateNotional, globalState?.wallet, isReadOnlyAddress]);

  return {
    isReadOnlyAddress,
    connectWallet,
    disconnectWallet,
    displayConnectors,
    currentLabel,
    icon,
  };
};
