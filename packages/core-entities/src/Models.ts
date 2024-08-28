import { Network, ONE_MINUTE_MS } from '@notional-finance/util';
import { NetworkClientModel } from './models/NetworkModel';

export const NetworkModels = {
  [Network.mainnet]: NetworkClientModel.create({ network: Network.mainnet }),
  [Network.arbitrum]: NetworkClientModel.create({ network: Network.arbitrum }),
};

// NOTE: this has to be called outside of the model to avoid issues with scope
export function refreshNetworkModels(refreshInterval: number = ONE_MINUTE_MS) {
  setInterval(() => {
    console.log('Refreshing snapshots');
    NetworkModels[Network.mainnet].triggerRefresh();
    NetworkModels[Network.arbitrum].triggerRefresh();
  }, refreshInterval);
}
