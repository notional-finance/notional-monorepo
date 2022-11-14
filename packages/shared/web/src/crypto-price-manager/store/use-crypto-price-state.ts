import { useObservableState } from 'observable-hooks';
import { cryptoPrices$ } from './crypto-price-store';

export function useCryptoPriceState() {
  const cryptoPrices = useObservableState(cryptoPrices$, {});

  return {
    cryptoPrices,
  };
}
