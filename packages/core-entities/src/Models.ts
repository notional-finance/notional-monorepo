import { Network, ONE_MINUTE_MS } from '@notional-finance/util';
import { NetworkClientModel } from './models/NetworkModel';

const MainnetNetworkModel = NetworkClientModel.create({
  network: Network.mainnet,
});
const ArbitrumNetworkModel = NetworkClientModel.create({
  network: Network.arbitrum,
});
const AllNetworkModel = NetworkClientModel.create({
  network: Network.all,
});

export function getNetworkModel(network: Network | undefined) {
  switch (network) {
    case Network.mainnet:
      return MainnetNetworkModel;
    case Network.arbitrum:
      return ArbitrumNetworkModel;
    case Network.all:
      return AllNetworkModel;
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
