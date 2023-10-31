import { Network } from '@notional-finance/util';
import { CurrencyOverride } from '../types';

export const overrides = {
  [Network.ArbitrumOne]: [
    // {
    //   id: 3,
    //   flashBorrowAsset: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8',
    // },
  ] as CurrencyOverride[],
};
