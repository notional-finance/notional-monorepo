import { Network } from '@notional-finance/util';
import { CurrencyOverride } from '../types';

export const overrides = {
  [Network.ArbitrumOne]: [
    {
      // cbETH: flash borrow rETH
      id: 9,
      flashBorrowAsset: '0xEC70Dcb4A1EFa46b8F2D97C310C9c4790ba5ffA8',
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
