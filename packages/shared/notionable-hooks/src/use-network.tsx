import { Network } from '@notional-finance/util';
import { useParams } from 'react-router';

export function useSelectedNetwork() {
  const { selectedNetwork } = useParams<{ selectedNetwork: Network }>();

  return selectedNetwork || Network.mainnet;
}
