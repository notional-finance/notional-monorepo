import { Network } from '@notional-finance/util';
import { useParams } from 'react-router';
import { defineMessages } from 'react-intl';

export function useNetworkSelector() {
  const labels = defineMessages({
    [Network.arbitrum]: {
      defaultMessage: 'Arbitrum',
    },

    [Network.mainnet]: {
      defaultMessage: 'Mainnet',
    },
  });

  return {
    labels,
  };
}
export function useSelectedNetwork() {
  const { selectedNetwork } = useParams<{ selectedNetwork: Network }>();
  return selectedNetwork;
}
