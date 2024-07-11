import { Network, NetworkId } from '@notional-finance/util';
import { useSwitchChain, useChainId } from 'wagmi'
import { useCallback } from 'react';

export function useChangeNetwork() {
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()

  return useCallback(
    (
      network: Network,
    ) => {
      if(chainId !== NetworkId[network]) {
        switchChain({ chainId: NetworkId[network] })
      }
    },
    [switchChain, chainId]
  );
}
