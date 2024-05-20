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

export const MaxCurrencyId: Record<Network, number | undefined> = {
  [Network.all]: undefined,
  [Network.optimism]: undefined,
  [Network.mainnet]: 10,
  [Network.arbitrum]: undefined,
};
