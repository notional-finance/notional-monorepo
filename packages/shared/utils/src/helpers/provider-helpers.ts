import { ethers } from 'ethers';

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
