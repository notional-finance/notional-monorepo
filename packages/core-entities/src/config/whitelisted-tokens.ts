import { Network } from '@notional-finance/util';

export function getSecondaryTokenIncentive(network: Network, base: string) {
  if (network === Network.arbitrum) {
    return 'ARB';
  } else if (
    network === Network.mainnet &&
    // GHO token
    base === '0x40d16fc0246ad3160ccc09b8d0d3a2cd28ae6c2f'
  ) {
    return 'GHO';
  } else {
    return undefined;
  }
}

/**
 * If defined, this is an inclusive restriction on the currency ids shown on a given network,
 * in other words, if there are 11 currency ids and the MaxCurrencyId is set to 10, then the 11th
 * currency will not be shown on the UI.
 */
export const MaxCurrencyId: Record<Network, number | undefined> = {
  [Network.all]: undefined,
  [Network.optimism]: undefined,
  [Network.mainnet]: 11,
  [Network.arbitrum]: undefined,
};

// This is only used in the claim NOTE button
export const SecondaryIncentiveToken = {
  [Network.arbitrum]: 'ARB',
  [Network.mainnet]: 'GHO',
};
