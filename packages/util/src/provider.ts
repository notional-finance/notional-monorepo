import { ethers, providers } from 'ethers';
import {
  AlchemyNFTUrl,
  AlchemyUrl,
  IS_TEST_ENV,
  Network,
  NetworkId,
  SupportedNetworks,
} from './constants';

// eslint-disable-next-line @cspell/spellchecker
/* cspell:disable-next-line */
export const ALCHEMY_KEY = 'pq08EwFvymYFPbDReObtP-SFw3bCes8Z';

export function getProviderURLFromNetwork(network: Network, useNFT = false) {
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
  const provider = new ethers.providers.AlchemyProvider(
    NetworkId[network],
    ALCHEMY_KEY
  );
  provider.send = ethers.providers.JsonRpcBatchProvider.prototype.send;
  return provider;
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
