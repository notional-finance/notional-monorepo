import { BigNumber } from 'ethers';
import { BalanceHistory, StakedNoteHistory } from '../../src/libs/types';
import { getNowSeconds } from '../../src/libs/utils';
import { BalanceSummary } from '../../src/account';
import { SECONDS_IN_DAY } from '../../src/config/constants';
import MockSystem from '../mocks/MockSystem';
import MockAccountData from '../mocks/MockAccountData';
import TypedBigNumber, { BigNumberType } from '../../src/libs/TypedBigNumber';
import { System, CashGroup } from '../../src/system';

describe('Balance Summary', () => {
  const blockTime = CashGroup.getTimeReference(getNowSeconds());
  const system = new MockSystem();
  System.overrideSystem(system);
  afterAll(() => system.destroy());

  const baseBalanceHistory: BalanceHistory = {
    id: 'xxx',
    blockNumber: 0,
    blockTime: new Date((blockTime - 45 * SECONDS_IN_DAY) * 1000),
    transactionHash: 'xxx',
    currencyId: 2,
    tradeType: '',
    assetCashBalanceBefore: TypedBigNumber.from(0, BigNumberType.InternalAsset, 'cDAI'),
    assetCashBalanceAfter: TypedBigNumber.from(0, BigNumberType.InternalAsset, 'cDAI'),
    assetCashValueUnderlyingBefore: TypedBigNumber.from(0, BigNumberType.InternalUnderlying, 'DAI'),
    assetCashValueUnderlyingAfter: TypedBigNumber.from(0, BigNumberType.InternalUnderlying, 'DAI'),
    nTokenBalanceBefore: TypedBigNumber.from(0, BigNumberType.nToken, 'nDAI'),
    nTokenBalanceAfter: TypedBigNumber.from(0, BigNumberType.nToken, 'nDAI'),
    nTokenValueUnderlyingBefore: TypedBigNumber.from(0, BigNumberType.InternalUnderlying, 'DAI'),
    nTokenValueUnderlyingAfter: TypedBigNumber.from(0, BigNumberType.InternalUnderlying, 'DAI'),
    nTokenValueAssetBefore: TypedBigNumber.from(0, BigNumberType.InternalAsset, 'cDAI'),
    nTokenValueAssetAfter: TypedBigNumber.from(0, BigNumberType.InternalAsset, 'cDAI'),
    totalUnderlyingValueChange: TypedBigNumber.from(0, BigNumberType.InternalUnderlying, 'DAI'),
  };

  it('it returns the entire balance to withdraw if there is no debt', () => {
    const cTokenBalance = { ...baseBalanceHistory };
    cTokenBalance.assetCashBalanceAfter = TypedBigNumber.from(1000e8, BigNumberType.InternalAsset, 'cDAI');
    cTokenBalance.assetCashValueUnderlyingAfter = TypedBigNumber.from(20e8, BigNumberType.InternalUnderlying, 'DAI');
    const tradeHistory = [cTokenBalance];

    const data = new MockAccountData(
      0,
      false,
      false,
      0,
      [
        {
          currencyId: 2,
          cashBalance: TypedBigNumber.from(1000e8, BigNumberType.InternalAsset, 'cDAI'),
          nTokenBalance: TypedBigNumber.from(0, BigNumberType.nToken, 'nDAI'),
          lastClaimTime: BigNumber.from(0),
          accountIncentiveDebt: BigNumber.from(0),
        },
      ],
      [],
      false,
      {
        trades: [],
        balanceHistory: tradeHistory,
        sNOTEHistory: {} as StakedNoteHistory,
      }
    );
    const summary = BalanceSummary.build(data)[0];
    expect(summary.isWithdrawable).toBeTruthy();
    expect(summary.maxWithdrawValueAssetCash.toExactString()).toEqual('1000.0');
  });

  it('it returns the prorata balance to withdraw if there is debt', () => {
    const cTokenBalance = { ...baseBalanceHistory };
    cTokenBalance.assetCashBalanceAfter = TypedBigNumber.from(-1000e8, BigNumberType.InternalAsset, 'cETH');
    cTokenBalance.assetCashValueUnderlyingAfter = TypedBigNumber.from(-20e8, BigNumberType.InternalUnderlying, 'ETH');
    cTokenBalance.nTokenBalanceAfter = TypedBigNumber.from(5000e8, BigNumberType.nToken, 'nETH');
    cTokenBalance.nTokenValueAssetAfter = TypedBigNumber.from(2500e8, BigNumberType.InternalAsset, 'cETH');
    cTokenBalance.nTokenValueUnderlyingAfter = TypedBigNumber.from(50e8, BigNumberType.InternalUnderlying, 'ETH');
    const tradeHistory = [cTokenBalance];
    const data = new MockAccountData(
      0,
      true,
      false,
      0,
      [
        {
          currencyId: 1,
          cashBalance: TypedBigNumber.from(-2500e8, BigNumberType.InternalAsset, 'cETH'),
          nTokenBalance: TypedBigNumber.from(5000e8, BigNumberType.nToken, 'nETH'),
          lastClaimTime: BigNumber.from(0),
          accountIncentiveDebt: BigNumber.from(0),
        },
      ],
      [],
      false,
      {
        trades: [],
        balanceHistory: tradeHistory,
        sNOTEHistory: {} as StakedNoteHistory,
      }
    );
    const summary = BalanceSummary.build(data)[0];
    expect(summary.isWithdrawable).toBeTruthy();
    // ntoken pv == 5000, haircut value is: 4500, free collateral is 2000 <= this is what can be withdrawn
    expect(summary.maxWithdrawValueAssetCash.toExactString()).toEqual('2000.0');
  });
});
