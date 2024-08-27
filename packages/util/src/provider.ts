import { ethers, providers } from 'ethers';
import {
  AlchemyNFTUrl,
  AlchemyUrl,
  IS_TEST_ENV,
  Network,
  NetworkId,
  SupportedNetworks,
} from './constants';

class AlchemyBatchProvider extends ethers.providers.AlchemyProvider {
  // _pendingBatchAggregator?: NodeJS.Timer;
  // _pendingBatch?: Array<{
  //     request: { method: string, params: Array<any>, id: number, jsonrpc: "2.0" },
  //     resolve: (result: any) => void,
  //     reject: (error: Error) => void
  // }>;
  // constructor(network, apiKey) {
  //   super(network, apiKey)
  // }
}

export function getProvider(networkId: number) {
  if (networkId === 1) {
    // Mainnet
    const provider = new AlchemyBatchProvider(
      networkId,
      'JU05SBqaAUg1-2xYuUvvJlE2-zcFKSwz'
    );
    provider.send = ethers.providers.JsonRpcBatchProvider.prototype.send;
    return provider;
  } else if (networkId === 5) {
    // Goerli
    const provider = new AlchemyBatchProvider(
      networkId,
      'u9PaziJgX-8l4j8_c88b777-Io4scNUe'
    );
    provider.send = ethers.providers.JsonRpcBatchProvider.prototype.send;
    return provider;
  } else {
    // Goerli
    const provider = new AlchemyBatchProvider(
      networkId,
      'u9PaziJgX-8l4j8_c88b777-Io4scNUe'
    );
    provider.send = ethers.providers.JsonRpcBatchProvider.prototype.send;
    return provider;
  }
}

export function getProviderURLFromNetwork(network: Network, useNFT = false) {
  return `${
    useNFT ? AlchemyNFTUrl[network] : AlchemyUrl[network]
  }/pq08EwFvymYFPbDReObtP-SFw3bCes8Z`;
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
    'pq08EwFvymYFPbDReObtP-SFw3bCes8Z'
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
