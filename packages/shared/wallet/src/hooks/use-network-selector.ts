import { useOnboard, useNotional } from '@notional-finance/notionable-hooks';
import {
  chains,
  chainEntities,
  switchNetwork,
} from '@notional-finance/notionable';
import { Network } from '@notional-finance/util';
import { defineMessages } from 'react-intl';

export function useNetworkSelector() {
  const { connected, chain } = useOnboard();
  const { getConnectedChain } = useNotional();
  const labels = defineMessages({
    [Network.ArbitrumOne]: {
      defaultMessage: 'Arbitrum',
    },

    [Network.Mainnet]: {
      defaultMessage: 'Mainnet',
    },
  });

  return {
    connected,
    chain,
    supportedChains: chains,
    switchNetwork,
    labels,
    chainEntities,
    getConnectedChain,
  };
}
