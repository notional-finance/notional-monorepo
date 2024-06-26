import { Network } from '@notional-finance/util';
import { useMemo } from 'react';
import { useParams } from 'react-router';

export function useSelectedNetwork() {
  const props = useParams<{ selectedNetwork: Network }>();

  return useMemo(() => props.selectedNetwork, [props.selectedNetwork]);
}
