import { ethers, BigNumber } from 'ethers';
import { SECONDS_IN_QUARTER } from '../../src/config/constants';
import { getNowSeconds } from '../../src/libs/utils';
import { CashGroup } from '../../src/system';
import { Notional as NotionalTypechain } from '@notional-finance/contracts';

const MockNotionalProxy = {
  getSettlementRate: (
    currencyId: ethers.BigNumberish,
    _maturity: ethers.BigNumberish,
    _overrides?: ethers.CallOverrides | undefined
  ): Promise<{
    rateOracle: string;
    rate: BigNumber;
    underlyingDecimals: BigNumber;
  }> => {
    if (currencyId === 1) {
      return Promise.resolve({
        rateOracle: '0x0',
        rate: BigNumber.from(0),
        underlyingDecimals: BigNumber.from(0),
      });
    }

    return Promise.resolve({
      rateOracle: '0x0',
      rate: BigNumber.from('200000000000000000000000000'),
      underlyingDecimals: ethers.constants.WeiPerEther,
    });
  },

  getActiveMarketsAtBlockTime: (
    _currencyId: ethers.BigNumberish,
    _blockTime: ethers.BigNumberish,
    _overrides?: ethers.CallOverrides | undefined
  ): Promise<
    {
      maturity: BigNumber;
      totalfCash: BigNumber;
      totalAssetCash: BigNumber;
      totalLiquidity: BigNumber;
    }[]
  > =>
    Promise.resolve([
      {
        maturity: BigNumber.from(CashGroup.getTimeReference(getNowSeconds()) + SECONDS_IN_QUARTER),
        totalfCash: BigNumber.from(1e8),
        totalAssetCash: BigNumber.from(1e8),
        totalLiquidity: BigNumber.from(1e8),
      },
    ]),
};

export default MockNotionalProxy as unknown as NotionalTypechain;
