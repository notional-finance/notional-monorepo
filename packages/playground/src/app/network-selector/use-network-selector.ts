import {
  switchNetwork,
  useOnboard,
  chains,
  chainEntities,
  useNotional,
} from '@notional-finance/notionable';

export function useNetworkSelector() {
  const { connected, chain } = useOnboard();
  const { getConnectedChain } = useNotional();

  return {
    connected,
    chain,
    supportedChains: chains,
    switchNetwork,
    chainEntities,
    getConnectedChain,
  };
}
