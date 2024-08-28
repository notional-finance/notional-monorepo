import { Network, ONE_MINUTE_MS } from '@notional-finance/util';
import { NetworkClientModel } from './models/NetworkModel';

const MainnetNetworkModel = NetworkClientModel.create({
  network: Network.mainnet,
});
const ArbitrumNetworkModel = NetworkClientModel.create({
  network: Network.arbitrum,
});

export function getNetworkModel(network: Network | undefined) {
  switch (network) {
    case Network.mainnet:
      return MainnetNetworkModel;
    case Network.arbitrum:
      return ArbitrumNetworkModel;
    default:
      throw new Error('Network not supported');
  }
}

// NOTE: this has to be called outside of the model to avoid issues with scope
export function refreshNetworkModels(refreshInterval: number = ONE_MINUTE_MS) {
  setInterval(() => {
    console.log('Refreshing snapshots');
    MainnetNetworkModel.triggerRefresh();
    ArbitrumNetworkModel.triggerRefresh();
  }, refreshInterval);
}
