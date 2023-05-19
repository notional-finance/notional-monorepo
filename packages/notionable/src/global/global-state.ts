import { Network } from '@notional-finance/util';

// Set this as the runtime default
const CACHE_HOSTNAME =
  process.env['NX_DATA_URL'] || 'https://data-dev.notional.finance';

export interface GlobalState extends Record<string, unknown> {
  wallet?: {
    selectedChain?: Network;
    selectedAddress: string;
    hasSelectedChainError: boolean;
  };
  selectedNetwork?: Network;
  isNetworkReady: boolean;
  cacheHostname: string;
}

export const initialGlobalState: GlobalState = {
  isNetworkReady: false,
  cacheHostname: CACHE_HOSTNAME,
};
