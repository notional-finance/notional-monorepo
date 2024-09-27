import {
  useReadOnlyAddress,
  useWalletConnectedNetwork,
} from '@notional-finance/notionable-hooks';
import { Network } from '@notional-finance/util';
import { useSetChain } from '@web3-onboard/react';
import { useCallback } from 'react';

export function useChangeNetwork(selectedNetwork: Network | undefined) {
  const [{ chains, connectedChain }, setChain] = useSetChain();
  const walletConnectedNetwork = useWalletConnectedNetwork();
  const isReadyOnlyWallet = useReadOnlyAddress();

  const changeNetwork = useCallback(
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

  return {
    changeNetwork,
    mustSwitchNetwork:
      selectedNetwork !== walletConnectedNetwork && !isReadyOnlyWallet,
  };
}
