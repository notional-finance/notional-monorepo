import { Network } from '@notional-finance/util';
import { defineMessages } from 'react-intl';

export function useNetworkSelector() {
  const labels = defineMessages({
    [Network.ArbitrumOne]: {
      defaultMessage: 'Arbitrum',
    },

    [Network.Mainnet]: {
      defaultMessage: 'Mainnet',
    },
  });

  return {
    labels,
  };
}
