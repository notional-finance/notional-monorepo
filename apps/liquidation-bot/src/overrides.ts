import { Network } from '@notional-finance/util';
import { CurrencyOverride } from './types';
import { ethers } from 'ethers';

export const overrides = {
  [Network.arbitrum]: [
    {
      // LDO: flash borrow WETH
      id: 15,
      flashBorrowAsset: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
      // LDO / ETH oracle
      oracle: '0x0fea5ea82add0efd3e197893dbfa40349e4b254f',
      basePrecision: ethers.constants.WeiPerEther,
      overridePrecision: ethers.constants.WeiPerEther,
    },
  ] as CurrencyOverride[],
  [Network.mainnet]: [] as CurrencyOverride[],
};
