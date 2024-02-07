import { Network } from '@notional-finance/util';
import { useSetChain } from '@web3-onboard/react';
import { useCallback } from 'react';

export function useChangeNetwork() {
  const [{ chains, connectedChain }, setChain] = useSetChain();

  return useCallback(
    (
      network: Network,
      onSwitched: () => void = () => {
        /* No-Op */
      }
    ) => {
      const chainId = chains.find((c) => c.label === network)?.id;

      if (chainId && connectedChain?.id !== chainId) {
        setChain({ chainId }).then(onSwitched);
      }
    },
    [chains, connectedChain, setChain]
  );
}
