export enum Network {
  all = 'all',
  mainnet = 'mainnet',
  arbitrum = 'arbitrum',
  optimism = 'optimism',
}

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
