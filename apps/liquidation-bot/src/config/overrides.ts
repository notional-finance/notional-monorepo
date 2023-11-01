import { Network } from '@notional-finance/util';
import { CurrencyOverride } from '../types';

export const overrides = {
  [Network.ArbitrumOne]: [
    {
      // cbETH: flash borrow wstETH
      id: 9,
      flashBorrowAsset: '0x5979D7b546E38E414F7E9822514be443A4800529',
    },
    {
      // GMX: flash borrow WETH
      id: 10,
      flashBorrowAsset: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
    },
    {
      // RDNT: flash borrow WETH
      id: 12,
      flashBorrowAsset: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
    },
  ] as CurrencyOverride[],
};
