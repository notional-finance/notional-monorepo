import { BigNumber } from 'ethers';
import { System, FreeCollateral, NTokenValue, CashGroup } from '../../src/system';
import MockSystem from '../mocks/MockSystem';
import { SECONDS_IN_MONTH } from '../../src/config/constants';
import TypedBigNumber, { BigNumberType } from '../../src/libs/TypedBigNumber';
import { AssetType } from '../../src/libs/types';
import { getNowSeconds } from '../../src/libs/utils';
import MockAccountData from '../mocks/MockAccountData';
import { AccountData } from '../../src/account';
import { IAggregator } from '@notional-finance/contracts';

describe('calculates free collateral', () => {
  const system = new MockSystem();
  System.overrideSystem(system);
  afterAll(() => {
    system.destroy();
  });

  describe('total borrow capacity', () => {
    it('calculates with no net local', () => {
      const accountData = new MockAccountData(
        0,
        false,
        false,
        undefined,
        [
          {
            currencyId: 2,
            cashBalance: TypedBigNumber.from(5000e8, BigNumberType.InternalAsset, 'cDAI'),
            nTokenBalance: TypedBigNumber.from(0, BigNumberType.nToken, 'nDAI'),
            lastClaimTime: BigNumber.from(0),
            accountIncentiveDebt: BigNumber.from(0),
          },
        ],
        [],
        true
      );

      const { usedBorrowCapacity, totalBorrowCapacity } = FreeCollateral.getBorrowCapacity(3, accountData);
      expect(usedBorrowCapacity.isZero()).toBeTruthy();
      expect(totalBorrowCapacity.toFloat()).toBeCloseTo((92 / 109) * 100);
      expect(totalBorrowCapacity.symbol).toBe('USDC');
    });

    it('calculates it with positive net local', () => {
      const accountData = new MockAccountData(
        0,
        false,
        false,
        undefined,
        [
          {
            currencyId: 2,
            cashBalance: TypedBigNumber.from(5000e8, BigNumberType.InternalAsset, 'cDAI'),
            nTokenBalance: TypedBigNumber.from(0, BigNumberType.nToken, 'nDAI'),
            lastClaimTime: BigNumber.from(0),
            accountIncentiveDebt: BigNumber.from(0),
          },
          {
            currencyId: 3,
            cashBalance: TypedBigNumber.from(5000e8, BigNumberType.InternalAsset, 'cUSDC'),
            nTokenBalance: TypedBigNumber.from(0, BigNumberType.nToken, 'nUSDC'),
            lastClaimTime: BigNumber.from(0),
            accountIncentiveDebt: BigNumber.from(0),
          },
        ],
        [],
        true
      );

      const { usedBorrowCapacity, totalBorrowCapacity } = FreeCollateral.getBorrowCapacity(3, accountData);
      expect(usedBorrowCapacity.isZero()).toBeTruthy();
      expect(totalBorrowCapacity.toFloat()).toBeCloseTo((92 / 109) * 100 + 100);
      expect(totalBorrowCapacity.symbol).toBe('USDC');
    });

    it('calculates it with negative net local', () => {
      const accountData = new MockAccountData(
        0,
        false,
        false,
        undefined,
        [
          {
            currencyId: 2,
            cashBalance: TypedBigNumber.from(5000e8, BigNumberType.InternalAsset, 'cDAI'),
            nTokenBalance: TypedBigNumber.from(0, BigNumberType.nToken, 'nDAI'),
            lastClaimTime: BigNumber.from(0),
            accountIncentiveDebt: BigNumber.from(0),
          },
          {
            currencyId: 3,
            cashBalance: TypedBigNumber.from(-500e8, BigNumberType.InternalAsset, 'cUSDC'),
            nTokenBalance: TypedBigNumber.from(0, BigNumberType.nToken, 'nUSDC'),
            lastClaimTime: BigNumber.from(0),
            accountIncentiveDebt: BigNumber.from(0),
          },
        ],
        [],
        true
      );

      accountData.updateAsset({
        currencyId: 3,
        maturity: getNowSeconds() + 100,
        assetType: AssetType.fCash,
        notional: TypedBigNumber.from(-10e8, BigNumberType.InternalUnderlying, 'USDC'),
        settlementDate: getNowSeconds() + 100,
      });

      const { usedBorrowCapacity, totalBorrowCapacity } = FreeCollateral.getBorrowCapacity(3, accountData);
      expect(usedBorrowCapacity.toFloat()).toBeCloseTo(20);
      expect(totalBorrowCapacity.toFloat()).toBeCloseTo((92 / 109) * 100);
      expect(totalBorrowCapacity.symbol).toBe('USDC');
    });
  });

  describe('calculates free collateral', () => {
    const blockTime = CashGroup.getTimeReference(getNowSeconds());
    const maturity = CashGroup.getMaturityForMarketIndex(1, blockTime);

    it('handles nontradable assets', () => {
      const accountData = new MockAccountData(0, false, true, 0, [], [], true);
      accountData.accountBalances = [
        {
          currencyId: 5,
          cashBalance: TypedBigNumber.from(1e8, BigNumberType.InternalAsset, 'NOMINT'),
          nTokenBalance: undefined,
          lastClaimTime: BigNumber.from(0),
          accountIncentiveDebt: BigNumber.from(0),
        },
      ];

      // prettier-ignore
      const {
        netETHDebt, netETHDebtWithBuffer, netETHCollateralWithHaircut, netUnderlyingAvailable,
      } = FreeCollateral.getFreeCollateral(
        accountData,
        blockTime,
      );

      expect(netETHDebt.isZero()).toBeTruthy();
      expect(netETHDebtWithBuffer.isZero()).toBeTruthy();
      expect(netETHCollateralWithHaircut.toNumber()).toBeLessThanOrEqual(0.78e8);
      expect(netUnderlyingAvailable.get(5)?.isPositive()).toBeTruthy();
    });

    it('for positive fcash', () => {
      const accountData = new MockAccountData(0, false, true, 0, [], [], true);
      accountData.accountBalances = [
        {
          currencyId: 2,
          cashBalance: TypedBigNumber.from(0, BigNumberType.InternalAsset, 'cDAI'),
          nTokenBalance: TypedBigNumber.from(0, BigNumberType.nToken, 'nDAI'),
          lastClaimTime: BigNumber.from(0),
          accountIncentiveDebt: BigNumber.from(0),
        },
      ];
      accountData.updateAsset({
        currencyId: 2,
        maturity,
        assetType: AssetType.fCash,
        notional: TypedBigNumber.from(100e8, BigNumberType.InternalUnderlying, 'DAI'),
        settlementDate: maturity,
      });
      // prettier-ignore
      const {
        netETHDebt, netETHDebtWithBuffer, netETHCollateralWithHaircut, netUnderlyingAvailable,
      } = FreeCollateral.getFreeCollateral(
        accountData,
        blockTime,
      );

      expect(netETHDebt.isZero()).toBeTruthy();
      expect(netETHDebtWithBuffer.isZero()).toBeTruthy();
      // 100 fDAI with a 95% haircut to pv should be a little more than 95% of the notional
      expect(netETHCollateralWithHaircut.n.sub(BigNumber.from(0.95e8)).abs().toNumber()).toBeLessThanOrEqual(0.051e8);
      expect(netUnderlyingAvailable.get(2)!.scale(1, 100).toNumber()).toBeCloseTo(
        netETHCollateralWithHaircut.scale(100, 92).toNumber(),
        -1
      );
    });

    it('for negative fcash', () => {
      const accountData = new MockAccountData(0, false, true, 0, [], [], true);
      accountData.accountBalances = [
        {
          currencyId: 2,
          cashBalance: TypedBigNumber.from(0, BigNumberType.InternalAsset, 'cDAI'),
          nTokenBalance: TypedBigNumber.from(0, BigNumberType.nToken, 'nDAI'),
          lastClaimTime: BigNumber.from(0),
          accountIncentiveDebt: BigNumber.from(0),
        },
      ];

      accountData.updateAsset({
        currencyId: 2,
        maturity,
        assetType: AssetType.fCash,
        notional: TypedBigNumber.from(-100e8, BigNumberType.InternalUnderlying, 'DAI'),
        settlementDate: maturity,
      });

      const { netETHDebt, netETHDebtWithBuffer, netETHCollateralWithHaircut, netUnderlyingAvailable } =
        FreeCollateral.getFreeCollateral(accountData, blockTime);

      expect(netETHDebt.n.sub(BigNumber.from(1e8)).abs().toNumber()).toBeLessThanOrEqual(0.03e8);
      // Should be buffered by 109
      expect(Math.abs(netETHDebtWithBuffer.scale(100, netETHDebt.n).toNumber() - 109)).toBeLessThanOrEqual(1);
      expect(netETHCollateralWithHaircut.isZero()).toBeTruthy();
      expect(netUnderlyingAvailable.get(2)!.scale(1, 100).toString()).toBe(netETHDebt.neg().toString());
    });

    it('for liquidity token', () => {
      const accountData = new MockAccountData(0, false, true, 0, [], [], true);
      const ltMaturity = blockTime + 6 * SECONDS_IN_MONTH;
      accountData.accountBalances = [
        {
          currencyId: 2,
          cashBalance: TypedBigNumber.from(0, BigNumberType.InternalAsset, 'cDAI'),
          nTokenBalance: TypedBigNumber.from(0, BigNumberType.nToken, 'nDAI'),
          lastClaimTime: BigNumber.from(0),
          accountIncentiveDebt: BigNumber.from(0),
        },
      ];
      accountData.updateAsset({
        currencyId: 2,
        maturity: ltMaturity,
        assetType: AssetType.LiquidityToken_6Month,
        notional: TypedBigNumber.from(5000e8, BigNumberType.InternalUnderlying, 'DAI'),
        settlementDate: CashGroup.getSettlementDate(AssetType.LiquidityToken_6Month, ltMaturity),
      });

      accountData.updateAsset({
        currencyId: 2,
        maturity: ltMaturity,
        assetType: AssetType.fCash,
        notional: TypedBigNumber.from(-100e8, BigNumberType.InternalUnderlying, 'DAI'),
        settlementDate: maturity,
      });

      const { netETHDebt, netETHDebtWithBuffer, netETHCollateralWithHaircut, netUnderlyingAvailable } =
        FreeCollateral.getFreeCollateral(accountData, blockTime);

      expect(netETHDebt.isZero()).toBeTruthy();
      expect(netETHDebtWithBuffer.isZero()).toBeTruthy();
      expect(netETHCollateralWithHaircut.toNumber()).toEqual(Math.trunc((29624839724 / 100) * 0.92));
      expect(netUnderlyingAvailable.get(2)!.toNumber()).toBe(29624839724);
    });

    it('for cash balances and ntokens with fcash', () => {
      const accountData = new MockAccountData(0, false, true, 0, [], [], true);
      accountData.accountBalances = [
        {
          currencyId: 2,
          cashBalance: TypedBigNumber.from(5000e8, BigNumberType.InternalAsset, 'cDAI'),
          nTokenBalance: TypedBigNumber.from(100e8, BigNumberType.nToken, 'nDAI'),
          lastClaimTime: BigNumber.from(0),
          accountIncentiveDebt: BigNumber.from(0),
        },
      ];
      accountData.updateAsset({
        currencyId: 2,
        maturity,
        assetType: AssetType.fCash,
        notional: TypedBigNumber.from(100e8, BigNumberType.InternalUnderlying, 'DAI'),
        settlementDate: maturity,
      });

      const { netETHDebt, netETHDebtWithBuffer, netETHCollateralWithHaircut, netUnderlyingAvailable } =
        FreeCollateral.getFreeCollateral(accountData, blockTime);

      expect(netETHDebt.isZero()).toBeTruthy();
      expect(netETHDebtWithBuffer.isZero()).toBeTruthy();
      expect(netETHCollateralWithHaircut.toNumber()).toBeGreaterThan(1.98e8 * 0.92);
      expect(netETHCollateralWithHaircut.toNumber()).toBeLessThan(2.0e8 * 0.92);
      expect(netUnderlyingAvailable.get(2)!.toNumber()).toBeGreaterThan(198e8);
      expect(netUnderlyingAvailable.get(2)!.toNumber()).toBeLessThan(200e8);
    });

    it('for negative cash balances with fcash', () => {
      const accountData = new MockAccountData(0, false, true, 0, [], [], true);
      accountData.accountBalances = [
        {
          currencyId: 2,
          cashBalance: TypedBigNumber.from(5000e8, BigNumberType.InternalAsset, 'cDAI'),
          nTokenBalance: TypedBigNumber.from(1000e8, BigNumberType.nToken, 'nDAI'),
          lastClaimTime: BigNumber.from(0),
          accountIncentiveDebt: BigNumber.from(0),
        },
      ];
      accountData.updateAsset({
        currencyId: 2,
        maturity,
        assetType: AssetType.fCash,
        notional: TypedBigNumber.from(-100e8, BigNumberType.InternalUnderlying, 'DAI'),
        settlementDate: maturity,
      });

      const { netETHDebt, netETHDebtWithBuffer, netETHCollateralWithHaircut, netUnderlyingAvailable } =
        FreeCollateral.getFreeCollateral(accountData, blockTime);

      expect(netETHDebt.isZero()).toBeTruthy();
      expect(netETHDebtWithBuffer.isZero()).toBeTruthy();
      expect(netETHCollateralWithHaircut.toNumber()).toBeGreaterThan(0.15e8 * 0.92);
      expect(netETHCollateralWithHaircut.toNumber()).toBeLessThan(0.17e8 * 0.92);
      expect(netUnderlyingAvailable.get(2)!.toNumber()).toBeGreaterThan(15e8);
      expect(netUnderlyingAvailable.get(2)!.toNumber()).toBeLessThan(17e8);
    });
  });

  describe('borrow requirements', () => {
    const borrowCurrencyId = 2;
    // use USDC because it has both haircuts and buffers in this configuration
    const collateralCurrencyId = 3;
    const blockTime = getNowSeconds();
    let cashGroup: CashGroup;
    let maturity: number;
    let borrowfCashAmount: TypedBigNumber;
    let borrowAmountHaircutPV: number;

    beforeEach(() => {
      cashGroup = system.getCashGroup(borrowCurrencyId);
      maturity = cashGroup.markets[0].maturity;
      borrowfCashAmount = TypedBigNumber.from(-100e8, BigNumberType.InternalUnderlying, 'DAI');
      borrowAmountHaircutPV = cashGroup
        .getfCashPresentValueUnderlyingInternal(maturity, borrowfCashAmount, true, blockTime)
        .toNumber();
    });

    it('calculates borrowing requires when collateral is a nontradable assets', () => {
      const accountData = AccountData.emptyAccountData();
      accountData.updateAsset({
        currencyId: borrowCurrencyId,
        maturity,
        assetType: AssetType.fCash,
        notional: borrowfCashAmount,
        settlementDate: maturity,
      });

      const { minCollateralRatio, minBufferedRatio, targetCollateralRatio, targetBufferedRatio } =
        FreeCollateral.calculateBorrowRequirement(5, 200, accountData, false, blockTime);

      expect(minCollateralRatio).toBeCloseTo(129 / 0.92, -1);
      expect(targetCollateralRatio).toBeCloseTo(minCollateralRatio! * 2, -1);
      expect(minBufferedRatio).toBeCloseTo(100);
      expect(targetBufferedRatio).toBeCloseTo(200);
    });

    it('calculates borrowing requirements for stable / stable with no account data', () => {
      const accountData = AccountData.emptyAccountData();
      accountData.updateAsset({
        currencyId: borrowCurrencyId,
        maturity,
        assetType: AssetType.fCash,
        notional: borrowfCashAmount,
        settlementDate: maturity,
      });

      const {
        minCollateral,
        targetCollateral,
        minCollateralRatio,
        minBufferedRatio,
        targetCollateralRatio,
        targetBufferedRatio,
      } = FreeCollateral.calculateBorrowRequirement(collateralCurrencyId, 200, accountData, false, blockTime);

      expect(minCollateralRatio).toBeCloseTo(109 / 0.92, -1);
      expect(targetCollateralRatio).toBeCloseTo(minCollateralRatio! * 2, -1);
      expect(minBufferedRatio).toBeCloseTo(100);
      expect(targetBufferedRatio).toBeCloseTo(200);

      const usdcCollateral = (borrowAmountHaircutPV * -1.09) / 0.92;
      const usdcTargetCollateral = (borrowAmountHaircutPV * -2.18) / 0.92;
      expect(minCollateral.toNumber()).toBeCloseTo(usdcCollateral, -3);
      expect(targetCollateral.toNumber()).toBeCloseTo(usdcTargetCollateral, -3);
    });

    it('calculates borrowing requirements for stable / crypto with no account data', () => {
      const accountData = AccountData.emptyAccountData();
      accountData.updateAsset({
        currencyId: borrowCurrencyId,
        maturity,
        assetType: AssetType.fCash,
        notional: borrowfCashAmount,
        settlementDate: maturity,
      });

      const {
        minCollateral,
        targetCollateral,
        minCollateralRatio,
        minBufferedRatio,
        targetCollateralRatio,
        targetBufferedRatio,
      } = FreeCollateral.calculateBorrowRequirement(1, 200, accountData, false, blockTime);

      expect(minCollateralRatio).toBeCloseTo(129 / 0.92, -1);
      expect(targetCollateralRatio).toBeCloseTo(minCollateralRatio! * 2, -1);
      expect(minBufferedRatio).toBeCloseTo(100);
      expect(targetBufferedRatio).toBeCloseTo(200);

      const ethCollateral = (-borrowAmountHaircutPV * minCollateralRatio!) / (100 * 100);
      const ethTargetCollateral = (-borrowAmountHaircutPV * targetCollateralRatio!) / (100 * 100);
      expect(minCollateral.toNumber()).toBeCloseTo(ethCollateral, -3);
      expect(targetCollateral.toNumber()).toBeCloseTo(ethTargetCollateral, -3);
    });

    it('calculates borrowing requirements for stable / crypto with nTokens', () => {
      const accountData = AccountData.emptyAccountData();
      accountData.updateAsset({
        currencyId: borrowCurrencyId,
        maturity,
        assetType: AssetType.fCash,
        notional: borrowfCashAmount,
        settlementDate: maturity,
      });

      const {
        minCollateral,
        targetCollateral,
        minCollateralRatio,
        minBufferedRatio,
        targetCollateralRatio,
        targetBufferedRatio,
      } = FreeCollateral.calculateBorrowRequirement(1, 200, accountData, true, blockTime);

      expect(minCollateralRatio).toBeCloseTo(129 / 0.92, -1);
      expect(targetCollateralRatio).toBeCloseTo(minCollateralRatio! * 2, -1);
      expect(minBufferedRatio).toBeCloseTo(100);
      expect(targetBufferedRatio).toBeCloseTo(200);

      const ethCollateral = (-borrowAmountHaircutPV * minCollateralRatio! * 50) / (100 * 100 * 0.9);
      const ethTargetCollateral = (-borrowAmountHaircutPV * targetCollateralRatio! * 50) / (100 * 100 * 0.9);
      expect(minCollateral.toNumber()).toBeCloseTo(ethCollateral, -3);
      expect(targetCollateral.toNumber()).toBeCloseTo(ethTargetCollateral, -3);
    });

    it('calculates borrowing requirements when local collateral can net off', () => {
      const accountData = new MockAccountData(
        0,
        false,
        false,
        undefined,
        [
          {
            currencyId: borrowCurrencyId,
            cashBalance: TypedBigNumber.from(5000e8, BigNumberType.InternalAsset, 'cDAI'),
            nTokenBalance: TypedBigNumber.from(0, BigNumberType.nToken, 'nDAI'),
            lastClaimTime: BigNumber.from(0),
            accountIncentiveDebt: BigNumber.from(0),
          },
        ],
        [],
        true
      );
      accountData.updateAsset({
        currencyId: borrowCurrencyId,
        maturity,
        assetType: AssetType.fCash,
        notional: borrowfCashAmount,
        settlementDate: maturity,
      });

      const {
        minCollateral,
        targetCollateral,
        minCollateralRatio,
        minBufferedRatio,
        targetCollateralRatio,
        targetBufferedRatio,
      } = FreeCollateral.calculateBorrowRequirement(collateralCurrencyId, 200, accountData, false, blockTime);

      expect(minCollateral.toNumber()).toBe(0);
      expect(targetCollateral.toNumber()).toBe(0);
      expect(minCollateralRatio).toBeNull();
      expect(targetCollateralRatio).toBeNull();
      expect(minBufferedRatio).toBeNull();
      expect(targetBufferedRatio).toBeNull();
    });

    it('calculates borrowing requirements when local collateral can partially net off', () => {
      const accountData = new MockAccountData(
        0,
        false,
        false,
        undefined,
        [
          {
            currencyId: borrowCurrencyId,
            cashBalance: TypedBigNumber.from(2500e8, BigNumberType.InternalAsset, 'cDAI'),
            nTokenBalance: TypedBigNumber.from(0, BigNumberType.nToken, 'nDAI'),
            lastClaimTime: BigNumber.from(0),
            accountIncentiveDebt: BigNumber.from(0),
          },
        ],
        [],
        true
      );
      accountData.updateAsset({
        currencyId: borrowCurrencyId,
        maturity,
        assetType: AssetType.fCash,
        notional: borrowfCashAmount,
        settlementDate: maturity,
      });

      const {
        minCollateral,
        targetCollateral,
        minCollateralRatio,
        minBufferedRatio,
        targetCollateralRatio,
        targetBufferedRatio,
      } = FreeCollateral.calculateBorrowRequirement(collateralCurrencyId, 200, accountData, false, blockTime);

      expect(minCollateralRatio).toBeCloseTo(109 / 0.92, -1);
      expect(targetCollateralRatio).toBeCloseTo(minCollateralRatio! * 2, -1);
      expect(minBufferedRatio).toBeCloseTo(100);
      expect(targetBufferedRatio).toBeCloseTo(200);

      const usdcCollateral = ((borrowAmountHaircutPV + 50e8) * -1.09) / 0.92;
      const usdcTargetCollateral = ((borrowAmountHaircutPV + 50e8) * -2.18) / 0.92;
      expect(minCollateral.toNumber()).toBeCloseTo(usdcCollateral, -3);
      expect(targetCollateral.toNumber()).toBeCloseTo(usdcTargetCollateral, -3);
    });

    it('calculates borrowing requirements when local collateral is in debt', () => {
      const accountData = new MockAccountData(
        0,
        false,
        false,
        undefined,
        [
          {
            currencyId: borrowCurrencyId,
            cashBalance: TypedBigNumber.from(-2500e8, BigNumberType.InternalAsset, 'cDAI'),
            nTokenBalance: TypedBigNumber.from(0, BigNumberType.nToken, 'nDAI'),
            lastClaimTime: BigNumber.from(0),
            accountIncentiveDebt: BigNumber.from(0),
          },
        ],
        [],
        true
      );
      accountData.updateAsset({
        currencyId: borrowCurrencyId,
        maturity,
        assetType: AssetType.fCash,
        notional: borrowfCashAmount,
        settlementDate: maturity,
      });

      const {
        minCollateral,
        targetCollateral,
        minCollateralRatio,
        minBufferedRatio,
        targetCollateralRatio,
        targetBufferedRatio,
      } = FreeCollateral.calculateBorrowRequirement(collateralCurrencyId, 200, accountData, false, blockTime);

      const usdcCollateral = ((borrowAmountHaircutPV - 50e8) * -1.09) / 0.92;
      const usdcTargetCollateral = ((borrowAmountHaircutPV - 50e8) * -2.18) / 0.92;
      expect(minCollateral.toNumber()).toBeCloseTo(usdcCollateral, -3);
      expect(targetCollateral.toNumber()).toBeCloseTo(usdcTargetCollateral, -3);
      expect(minCollateralRatio).toBeCloseTo(109 / 0.92, -1);
      expect(targetCollateralRatio).toBeCloseTo(minCollateralRatio! * 2, -1);
      expect(minBufferedRatio).toBeCloseTo(100);
      expect(targetBufferedRatio).toBeCloseTo(200);
    });

    it('calculates borrowing requirements when collateral is positive', () => {
      const accountData = new MockAccountData(
        0,
        false,
        false,
        undefined,
        [
          {
            currencyId: collateralCurrencyId,
            cashBalance: TypedBigNumber.from(500e8, BigNumberType.InternalAsset, 'cUSDC'),
            nTokenBalance: TypedBigNumber.from(0, BigNumberType.nToken, 'nUSDC'),
            lastClaimTime: BigNumber.from(0),
            accountIncentiveDebt: BigNumber.from(0),
          },
        ],
        [],
        true
      );
      accountData.updateAsset({
        currencyId: borrowCurrencyId,
        maturity,
        assetType: AssetType.fCash,
        notional: borrowfCashAmount,
        settlementDate: maturity,
      });

      const {
        minCollateral,
        targetCollateral,
        minCollateralRatio,
        minBufferedRatio,
        targetCollateralRatio,
        targetBufferedRatio,
      } = FreeCollateral.calculateBorrowRequirement(collateralCurrencyId, 200, accountData, false, blockTime);

      // We don't haircut the usdc cash balance here since we have converted collateral figures
      // into required USDC amounts already by dividing by 0.95
      const usdcCollateral = (borrowAmountHaircutPV * -1.09) / 0.92 - 10e8;
      const usdcTargetCollateral = (borrowAmountHaircutPV * -2.18) / 0.92 - 10e8;
      expect(minCollateral.toNumber()).toBeCloseTo(usdcCollateral, -3);
      expect(targetCollateral.toNumber()).toBeCloseTo(usdcTargetCollateral, -3);
      expect(minCollateralRatio).toBeCloseTo(109 / 0.92, -1);
      expect(targetCollateralRatio).toBeCloseTo(minCollateralRatio! * 2, -1);
      expect(minBufferedRatio).toBeCloseTo(100);
      expect(targetBufferedRatio).toBeCloseTo(200);
    });

    it('calculates borrowing requirements when more collateral than ratio', () => {
      const accountData = new MockAccountData(
        0,
        false,
        false,
        undefined,
        [
          {
            currencyId: collateralCurrencyId,
            cashBalance: TypedBigNumber.from(50000e8, BigNumberType.InternalAsset, 'cUSDC'),
            nTokenBalance: TypedBigNumber.from(0, BigNumberType.nToken, 'nUSDC'),
            lastClaimTime: BigNumber.from(0),
            accountIncentiveDebt: BigNumber.from(0),
          },
        ],
        [],
        true
      );
      accountData.updateAsset({
        currencyId: borrowCurrencyId,
        maturity,
        assetType: AssetType.fCash,
        notional: borrowfCashAmount,
        settlementDate: maturity,
      });
      const { netETHCollateral, netETHCollateralWithHaircut, netETHDebt, netETHDebtWithBuffer } =
        FreeCollateral.getFreeCollateral(accountData);
      const collateralRatioBefore = FreeCollateral.calculateCollateralRatio(netETHCollateral, netETHDebt);
      const bufferedRatioBefore = FreeCollateral.calculateCollateralRatio(
        netETHCollateralWithHaircut,
        netETHDebtWithBuffer
      );

      const { minCollateral, targetCollateral, targetCollateralRatio, minBufferedRatio, targetBufferedRatio } =
        FreeCollateral.calculateBorrowRequirement(collateralCurrencyId, 200, accountData, false, blockTime);

      expect(minCollateral.toNumber()).toBe(0);
      expect(targetCollateral.toNumber()).toBe(0);
      expect(targetCollateralRatio).toBeCloseTo(collateralRatioBefore!);
      expect(minBufferedRatio).toBeCloseTo(bufferedRatioBefore!);
      expect(targetBufferedRatio).toBeCloseTo(bufferedRatioBefore!);
    });

    it('calculates borrowing requirements when net collateral is negative but no eth required', () => {
      const accountData = new MockAccountData(
        0,
        false,
        false,
        undefined,
        [
          {
            currencyId: 1,
            cashBalance: TypedBigNumber.from(250e8, BigNumberType.InternalAsset, 'cETH'),
            nTokenBalance: undefined,
            lastClaimTime: BigNumber.from(0),
            accountIncentiveDebt: BigNumber.from(0),
          },
          {
            currencyId: collateralCurrencyId,
            cashBalance: TypedBigNumber.from(-5000e8, BigNumberType.InternalAsset, 'cUSDC'),
            nTokenBalance: TypedBigNumber.from(0, BigNumberType.nToken, 'nUSDC'),
            lastClaimTime: BigNumber.from(0),
            accountIncentiveDebt: BigNumber.from(0),
          },
        ],
        [],
        true
      );
      accountData.updateAsset({
        currencyId: borrowCurrencyId,
        maturity,
        assetType: AssetType.fCash,
        notional: borrowfCashAmount,
        settlementDate: maturity,
      });

      const { netETHCollateral, netETHCollateralWithHaircut, netETHDebt, netETHDebtWithBuffer } =
        FreeCollateral.getFreeCollateral(accountData);
      const collateralRatioBefore = FreeCollateral.calculateCollateralRatio(netETHCollateral, netETHDebt);
      const bufferedRatioBefore = FreeCollateral.calculateCollateralRatio(
        netETHCollateralWithHaircut,
        netETHDebtWithBuffer
      );

      const { minCollateral, targetCollateral, minCollateralRatio, minBufferedRatio } =
        FreeCollateral.calculateBorrowRequirement(collateralCurrencyId, 200, accountData, false, blockTime);

      expect(minCollateral.toNumber()).toBe(0);
      expect(minCollateralRatio).toBeCloseTo(collateralRatioBefore!);
      expect(minBufferedRatio).toBeCloseTo(bufferedRatioBefore!);
      const assetCashBalance = targetCollateral.toAssetCash();

      accountData.updateBalance(collateralCurrencyId, assetCashBalance);
      const { netETHCollateralWithHaircut: netETHAfter, netETHDebtWithBuffer: netDebtAfter } =
        FreeCollateral.getFreeCollateral(accountData);
      // Expect that the buffered collateral ratio afterwards is about 200
      expect(FreeCollateral.calculateCollateralRatio(netETHAfter, netDebtAfter)).toBeCloseTo(200, 0);
    });

    it('calculates borrowing requirements when collateral is negative', () => {
      const accountData = new MockAccountData(
        0,
        false,
        false,
        undefined,
        [
          {
            currencyId: collateralCurrencyId,
            cashBalance: TypedBigNumber.from(-5000e8, BigNumberType.InternalAsset, 'cUSDC'),
            nTokenBalance: TypedBigNumber.from(0, BigNumberType.nToken, 'nUSDC'),
            lastClaimTime: BigNumber.from(0),
            accountIncentiveDebt: BigNumber.from(0),
          },
        ],
        [],
        true
      );
      accountData.updateAsset({
        currencyId: borrowCurrencyId,
        maturity,
        assetType: AssetType.fCash,
        notional: borrowfCashAmount,
        settlementDate: maturity,
      });

      const { targetCollateral } = FreeCollateral.calculateBorrowRequirement(
        collateralCurrencyId,
        200,
        accountData,
        false,
        blockTime
      );

      const targetAssetCashBalance = targetCollateral.toAssetCash();
      accountData.updateBalance(
        collateralCurrencyId,
        targetAssetCashBalance,
        TypedBigNumber.from(0, BigNumberType.nToken, 'nUSDC')
      );
      const { netETHCollateralWithHaircut, netETHDebtWithBuffer } = FreeCollateral.getFreeCollateral(accountData);
      // Expect that the buffered collateral ratio afterwards is about 200
      expect(FreeCollateral.calculateCollateralRatio(netETHCollateralWithHaircut, netETHDebtWithBuffer)).toBeCloseTo(
        200,
        0
      );
    });

    it('it nets off fcash before calculating collateral requirement', () => {
      const accountData = new MockAccountData(
        0,
        false,
        false,
        undefined,
        [
          {
            currencyId: borrowCurrencyId,
            cashBalance: TypedBigNumber.from(0, BigNumberType.InternalAsset, 'cDAI'),
            nTokenBalance: TypedBigNumber.from(0, BigNumberType.nToken, 'nDAI'),
            lastClaimTime: BigNumber.from(0),
            accountIncentiveDebt: BigNumber.from(0),
          },
        ],
        [
          // This asset should be net off exactly
          {
            currencyId: borrowCurrencyId,
            assetType: AssetType.fCash,
            notional: borrowfCashAmount.neg(),
            maturity,
            settlementDate: maturity,
          },
        ],
        true
      );
      accountData.updateAsset({
        currencyId: borrowCurrencyId,
        maturity,
        assetType: AssetType.fCash,
        notional: borrowfCashAmount,
        settlementDate: maturity,
      });

      const { targetCollateral, minCollateral } = FreeCollateral.calculateBorrowRequirement(
        collateralCurrencyId,
        200,
        accountData,
        false,
        blockTime
      );

      expect(minCollateral.isZero()).toBeTruthy();
      expect(targetCollateral.isZero()).toBeTruthy();
    });

    it('can override ETH rate', () => {
      const accountData = new MockAccountData(
        0,
        false,
        false,
        undefined,
        [
          {
            currencyId: collateralCurrencyId,
            cashBalance: TypedBigNumber.from(-5000e8, BigNumberType.InternalAsset, 'cUSDC'),
            nTokenBalance: TypedBigNumber.from(0, BigNumberType.nToken, 'nUSDC'),
            lastClaimTime: BigNumber.from(0),
            accountIncentiveDebt: BigNumber.from(0),
          },
        ],
        [],
        true
      );

      expect(FreeCollateral.getFreeCollateral(accountData).netETHDebtWithBuffer.toString()).toEqual('109000000');

      system.setETHRateProvider(collateralCurrencyId, {
        getETHRate: () => ({
          rateOracle: null as unknown as IAggregator,
          haircut: 96,
          buffer: 105,
          mustInvert: false,
          rateDecimalPlaces: 18,
          latestRate: BigNumber.from('100000000000000'),
          liquidationDiscount: 104,
        }),
      });

      expect(FreeCollateral.getFreeCollateral(accountData).netETHDebtWithBuffer.toString()).toEqual('1050000');
    });

    it('can override nToken asset cash PV', () => {
      let val = NTokenValue.getAssetRequiredToMintNToken(
        collateralCurrencyId,
        TypedBigNumber.from(5000e8, BigNumberType.nToken, 'nUSDC')
      );

      expect(val.toString()).toEqual('495832892946');

      system.setNTokenAssetCashPVProvider(collateralCurrencyId, {
        getNTokenAssetCashPV: () => TypedBigNumber.from(5000000e8, BigNumberType.InternalAsset, 'cUSDC'),
      });

      val = NTokenValue.getAssetRequiredToMintNToken(
        collateralCurrencyId,
        TypedBigNumber.from(5000e8, BigNumberType.nToken, 'nUSDC')
      );

      expect(val.toString()).toEqual('1885674641');
    });
  });
});
