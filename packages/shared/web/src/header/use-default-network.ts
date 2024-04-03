import {
  useSelectedNetwork,
  useWalletConnectedNetwork,
} from '@notional-finance/notionable-hooks';
import { getDefaultNetworkFromHostname } from '@notional-finance/util';

export const useDefaultNetwork = () => {
  // In the dropdown menu we ensure that we always resolve to some network
  // destination
  const currentNetwork = useSelectedNetwork();
  const defaultNetwork =
    useWalletConnectedNetwork() ||
    getDefaultNetworkFromHostname(window.location.hostname);
  return currentNetwork || defaultNetwork;
};
