import { useOnboard, useNotional } from '@notional-finance/notionable-hooks';
import {
  chains,
  chainEntities,
  switchNetwork,
} from '@notional-finance/notionable';
import { CHAIN_NAMES } from '@notional-finance/shared-config';
import { defineMessages } from 'react-intl';

export function useNetworkSelector() {
  const { connected, chain } = useOnboard();
  const { getConnectedChain } = useNotional();
  const labels = defineMessages({
    [CHAIN_NAMES.GOERLI]: {
      defaultMessage: 'Goerli',
    },
    [CHAIN_NAMES.MAINNET]: {
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
