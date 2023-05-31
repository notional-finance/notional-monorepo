<<<<<<< feature/updates-network-selectors:packages/shared/wallet/src/hooks/use-network-selector.ts
import { useOnboard, useNotional } from '@notional-finance/notionable-hooks';
import {
  chains,
  chainEntities,
  switchNetwork,
} from '@notional-finance/notionable';
import { Network } from '@notional-finance/util';
=======
import { CHAIN_NAMES } from '@notional-finance/shared-config';
>>>>>>> build: removes use onboard hook:packages/shared/wallet/src/network-selector/use-network-selector.ts
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
