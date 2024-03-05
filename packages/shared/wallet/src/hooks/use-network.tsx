import { Network } from '@notional-finance/util';
import { useParams } from 'react-router';
import { defineMessages } from 'react-intl';

export function useNetworkSelector() {
  const networkSelectorData = {
    [Network.ArbitrumOne]: {
      messages: defineMessages({
        networkName: {
          defaultMessage: 'Arbitrum',
          description: 'network name',
        },
      }),
      networkSymbol: 'arb',
    },
    [Network.Mainnet]: {
      messages: defineMessages({
        networkName: {
          defaultMessage: 'Mainnet',
          description: 'network name',
        },
      }),
      networkSymbol: 'eth',
    },
  };

  return networkSelectorData;
}
export function useSelectedNetwork() {
  const { selectedNetwork } = useParams<{ selectedNetwork: Network }>();

  return selectedNetwork;
}
