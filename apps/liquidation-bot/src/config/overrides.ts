import { Network } from '@notional-finance/util';
import { CurrencyOverride } from '../types';
import { BigNumber } from 'ethers';

export const overrides = {
  [Network.arbitrum]: [
    // {
    //   // cbETH: flash borrow rETH
    //   id: 9,
    //   flashBorrowAsset: '0xEC70Dcb4A1EFa46b8F2D97C310C9c4790ba5ffA8',
    // },
    // {
    //   // GMX: flash borrow WETH
    //   id: 10,
    //   flashBorrowAsset: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
    // },
    // {
    //   // RDNT: flash borrow WETH
    //   id: 12,
    //   flashBorrowAsset: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
    // },
    // {
    //   // UNI: flash borrow WETH
    //   id: 14,
    //   flashBorrowAsset: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
    // },
    // {
    //   // LDO: flash borrow WETH
    //   id: 15,
    //   flashBorrowAsset: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
    // },
  ] as CurrencyOverride[],
  [Network.mainnet]: [
    {
      // GHO: flash borrow USDC
      id: 11,
      flashBorrowAsset: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      overridePrecision: BigNumber.from(10).pow(6),
      basePrecision: BigNumber.from(10).pow(18),
    },
  ] as CurrencyOverride[],
};
