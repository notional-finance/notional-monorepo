import { providers as ethersProviders } from 'ethers';
let initialized = false;
const providers: Map<string, ethersProviders.JsonRpcBatchProvider> = new Map();

export function initializeProviders(alchemyKey: string) {
  providers.set(
    'mainnet',
    new ethersProviders.JsonRpcBatchProvider({
      url: `https://eth-mainnet.g.alchemy.com/v2/${alchemyKey}`,
      skipFetchSetup: true,
    })
  );

  providers.set(
    'goerli',
    new ethersProviders.JsonRpcBatchProvider({
      url: `https://eth-goerli.g.alchemy.com/v2/${alchemyKey}`,
      skipFetchSetup: true,
    })
  );

  initialized = true;
}

export function getProvider(
  network: string
): ethersProviders.JsonRpcBatchProvider {
  if (!initialized) {
    throw new Error('Providers not initialized');
  }
  if (!providers.has(network)) {
    throw new Error(`Provider for network ${network} not found`);
  }

  return providers.get(network);
}
