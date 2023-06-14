import { Network } from '@notional-finance/util';

type VaultAddress = string;
type PoolAddress = string;

export const vaultPool: Record<
  Network,
  Record<VaultAddress, { address: PoolAddress }>
> = {
  [Network.Mainnet]: {},
  [Network.ArbitrumOne]: {
    '0x0000000000000000000000000000000000000000': {
      address: '0xC9B8a3FDECB9D5b218d02555a8Baf332E5B740d5',
    },
  },
  [Network.All]: {},
};
