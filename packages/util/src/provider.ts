import { ethers, providers } from 'ethers';
import {
  AlchemyNFTUrl,
  AlchemyUrl,
  Network,
  NetworkId,
  SupportedNetworks,
} from './constants';

const TESTNET_RPC =
  typeof process !== 'undefined'
    ? (process.env['NX_TESTNET_RPC'] as string | undefined)
    : undefined;
const USE_TESTNET_RPC = !!TESTNET_RPC;

// eslint-disable-next-line @cspell/spellchecker
/* cspell:disable-next-line */
export let ALCHEMY_KEY = 'pq08EwFvymYFPbDReObtP-SFw3bCes8Z';

export function setAlchemyKey(key: string) {
  ALCHEMY_KEY = key;
}

export function getProviderURLFromNetwork(network: Network, useNFT = false) {
  if (USE_TESTNET_RPC) return TESTNET_RPC;
  return `${
    useNFT ? AlchemyNFTUrl[network] : AlchemyUrl[network]
  }/${ALCHEMY_KEY}`;
}

export function getProviderFromNetwork(
  network: Network,
  skipFetchSetup = false
): providers.Provider {
  if (skipFetchSetup) {
    return new ethers.providers.JsonRpcBatchProvider({
      url: getProviderURLFromNetwork(network),
      skipFetchSetup: true,
    });
  }

  return new ethers.providers.JsonRpcProvider(
    getProviderURLFromNetwork(network)
  );
}

export function getNetworkFromId(id: number) {
  return SupportedNetworks.find(
    (k: keyof typeof NetworkId) => NetworkId[k] === id
  );
}

export function getDefaultNetworkFromHostname(hostname: string) {
  switch (hostname) {
    default:
      return Network.mainnet;
  }
}

/** Returns the token symbol associated with a given network */
export function getNetworkSymbol(network: Network | undefined) {
  switch (network) {
    case Network.arbitrum:
      return 'arbnetwork';
    case Network.mainnet:
      return 'ethnetwork';
    default:
      return 'eth';
  }
}

export function getNetworkTitle(network: Network | undefined) {
  switch (network) {
    case Network.arbitrum:
      return 'Arbitrum';
    case Network.mainnet:
      return 'Mainnet';
    default:
      return 'Unknown';
  }
}
