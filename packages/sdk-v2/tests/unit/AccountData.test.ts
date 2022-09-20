import { BigNumber, ethers } from 'ethers';
import { AccountData } from '../../src/account';
import TypedBigNumber, { BigNumberType } from '../../src/libs/TypedBigNumber';
import { AssetType, CollateralActionType } from '../../src/libs/types';
import MockSystem, { MutableForTesting } from '../mocks/MockSystem';
import { FreeCollateral, System } from '../../src/system';
import { getNowSeconds } from '../../src/libs/utils';
import MockAccountData from '../mocks/MockAccountData';
import { ETHRate } from '../../src/data';

describe('Account Data', () => {
  const system = new MockSystem();
  System.overrideSystem(system);
  afterAll(() => {
    system.destroy();
  });

  const accountData = new MockAccountData(
    0,
    false,
    false,
    undefined,
    [
      {
        currencyId: 1,
        cashBalance: TypedBigNumber.from(5000e8, BigNumberType.InternalAsset, 'cETH'),
        nTokenBalance: TypedBigNumber.from(0, BigNumberType.nToken, 'nETH'),
        lastClaimTime: BigNumber.from(0),
        accountIncentiveDebt: BigNumber.from(0),
      },
    ],
    [],
    false
  );

  describe('hashKey', () => {
    let testAcct1: MockAccountData;

    beforeEach(() => {
      testAcct1 = new MockAccountData(
        0,
        false,
        false,
        undefined,
        [
          {
            currencyId: 1,
            cashBalance: TypedBigNumber.from(5000e8, BigNumberType.InternalAsset, 'cETH'),
            nTokenBalance: TypedBigNumber.from(0, BigNumberType.nToken, 'nETH'),
            lastClaimTime: BigNumber.from(0),
            accountIncentiveDebt: BigNumber.from(0),
          },
        ],
        [],
        false
      );
    });
    it('should return different hash keys for an account with different balances', () => {
      const prevHash = testAcct1.hashKey;
      testAcct1.accountBalances[0].cashBalance = TypedBigNumber.from(5001e8, BigNumberType.InternalAsset, 'cETH');
      const newHash = testAcct1.hashKey;
      expect(prevHash).not.toEqual(newHash);
    });
    it('should return different hash keys for an account with different portfolios', () => {
      const prevHash = testAcct1.hashKey;
      const asset1 = {
        currencyId: 1,
        maturity: getNowSeconds() + 1000,
        assetType: AssetType.fCash,
        notional: TypedBigNumber.from(100e8, BigNumberType.InternalUnderlying, 'ETH'),
        settlementDate: getNowSeconds() + 1000,
      };
      const testAccount2 = new MockAccountData(
        0,
        false,
        false,
        undefined,
        [
          {
            currencyId: 1,
            cashBalance: TypedBigNumber.from(5000e8, BigNumberType.InternalAsset, 'cETH'),
            nTokenBalance: TypedBigNumber.from(0, BigNumberType.nToken, 'nETH'),
            lastClaimTime: BigNumber.from(0),
            accountIncentiveDebt: BigNumber.from(0),
          },
        ],
        [asset1],
        false
      );
      const newHash = testAccount2.hashKey;
      expect(prevHash).not.toEqual(newHash);
    });
  });

  it('creates a zero cash balance entry if required on construction', () => {
    const mockAccount = new MockAccountData(
      0,
      false,
      false,
      undefined,
      [],
      [
        {
          currencyId: 2,
          maturity: getNowSeconds() + 1000,
          assetType: AssetType.fCash,
          notional: TypedBigNumber.from(100e8, BigNumberType.InternalUnderlying, 'DAI'),
          settlementDate: getNowSeconds() + 1000,
        },
      ],
      false
    );

    expect(mockAccount.cashBalance(2)?.isZero()).toBeTruthy();
  });

  it('does not update non copy', () => {
    expect(() =>
      accountData.updateBalance(
        1,
        TypedBigNumber.from(-100e8, BigNumberType.InternalAsset, 'cETH'),
        TypedBigNumber.from(0, BigNumberType.nToken, 'nETH')
      )
    ).toThrowError();

    expect(() =>
      accountData.updateAsset({
        currencyId: 2,
        maturity: 100,
        assetType: AssetType.fCash,
        notional: TypedBigNumber.from(100e8, BigNumberType.InternalUnderlying, 'DAI'),
        settlementDate: 100,
      })
    ).toThrowError();
  });

  it('updates cash balances', () => {
    const accountDataCopy = AccountData.copyAccountData(accountData);
    accountDataCopy.updateBalance(1, TypedBigNumber.from(-100e8, BigNumberType.InternalAsset, 'cETH'));
    expect(accountDataCopy.cashBalance(1)!.n).toEqual(BigNumber.from(4900e8));
    // Expect original object did not change
    expect(accountData.cashBalance(1)!.n).toEqual(BigNumber.from(5000e8));
  });

  it('fails to update when balances dont match types', () => {
    const accountDataCopy = AccountData.copyAccountData(accountData);
    // eslint-disable-next-line
    expect(() =>
      accountDataCopy.updateBalance(1, TypedBigNumber.from(-100e8, BigNumberType.ExternalAsset, 'cDAI'))
    ).toThrowError();

    expect(() =>
      accountDataCopy.updateBalance(
        1,
        TypedBigNumber.from(0, BigNumberType.InternalAsset, 'cDAI'),
        TypedBigNumber.from(100e8, BigNumberType.nToken, 'nDAI')
      )
    ).toThrowError();
  });

  it('adds cash balances', () => {
    const accountDataCopy = AccountData.copyAccountData(accountData);
    accountDataCopy.updateBalance(
      2,
      TypedBigNumber.from(100e8, BigNumberType.InternalAsset, 'cDAI'),
      TypedBigNumber.from(0, BigNumberType.nToken, 'nDAI')
    );
    expect(accountDataCopy.cashBalance(2)!.n).toEqual(BigNumber.from(100e8));
  });

  it('updates ntoken balances', () => {
    const accountDataCopy = AccountData.copyAccountData(accountData);
    accountDataCopy.updateBalance(
      2,
      TypedBigNumber.from(0, BigNumberType.InternalAsset, 'cDAI'),
      TypedBigNumber.from(100e8, BigNumberType.nToken, 'nDAI')
    );
    expect(accountDataCopy.nTokenBalance(2)!.n).toEqual(BigNumber.from(100e8));
  });

  it('fails to update when assets dont match types', () => {
    const accountDataCopy = AccountData.copyAccountData(accountData);
    expect(() => {
      const asset1 = {
        currencyId: 1,
        maturity: 100,
        assetType: AssetType.fCash,
        notional: TypedBigNumber.from(100e8, BigNumberType.InternalUnderlying, 'ETH'),
        hasMatured: false,
        settlementDate: 100,
        isIdiosyncratic: false,
      };
      const asset2 = {
        currencyId: 1,
        maturity: 100,
        assetType: AssetType.fCash,
        notional: TypedBigNumber.from(100e8, BigNumberType.InternalUnderlying, 'DAI'),
        hasMatured: false,
        settlementDate: 100,
        isIdiosyncratic: false,
      };
      accountDataCopy.updateAsset(asset1);
      accountDataCopy.updateAsset(asset2);
    }).toThrowError();
  });

  it('updates assets and sorts', () => {
    const accountDataCopy = AccountData.copyAccountData(accountData);
    const asset1 = {
      currencyId: 1,
      maturity: getNowSeconds() + 1000,
      assetType: AssetType.fCash,
      notional: TypedBigNumber.from(100e8, BigNumberType.InternalUnderlying, 'ETH'),
      settlementDate: getNowSeconds() + 1000,
    };
    const asset2 = {
      currencyId: 1,
      maturity: getNowSeconds() + 1000,
      assetType: AssetType.LiquidityToken_3Month,
      notional: TypedBigNumber.from(100e8, BigNumberType.LiquidityToken, 'cETH'),
      settlementDate: getNowSeconds() + 1000,
    };
    accountDataCopy.updateAsset(asset2);
    accountDataCopy.updateAsset(asset1);
    expect(accountDataCopy.portfolio[0]).toEqual(asset1);
    expect(accountDataCopy.portfolio[1]).toEqual(asset2);
  });

  it('settles matured cash balances', (done) => {
    const maturity = BigNumber.from(getNowSeconds() - 1000);
    const accountResult = {
      accountContext: {
        nextSettleTime: 0,
        hasDebt: '0x00',
        assetArrayLength: 1,
        bitmapCurrencyId: 0,
        activeCurrencies: '',
      },
      accountBalances: [],
      portfolio: [
        {
          currencyId: BigNumber.from(2),
          maturity,
          assetType: BigNumber.from(1),
          notional: BigNumber.from(1000e8),
          storageSlot: BigNumber.from(0),
          storageState: 0,
        },
      ],
    };

    system.setSettlementRate(2, maturity.toNumber(), BigNumber.from('250000000000000000000000000'));

    AccountData.loadFromBlockchain(accountResult, [])
      .then((a) => {
        expect(a.cashBalance(2)?.toExactString()).toEqual('40000.0');
        expect(a.portfolio.length).toEqual(0);
        expect(a.portfolioWithMaturedAssets.length).toEqual(1);
        done();
      })
      .catch((e) => {
        console.log(e);
        expect(false).toBeTruthy();
        done();
      });
  });

  describe('loan to value ratio', () => {
    it('no debt', () => {
      const { totalETHDebts, totalETHValue, loanToValue } = accountData.loanToValueRatio();
      expect(totalETHValue.toNumber()).toBe(100e8);
      expect(totalETHDebts.isZero()).toBeTruthy();
      expect(loanToValue).toBe(0);
    });

    it('ntoken value', () => {
      const accountData2 = new MockAccountData(
        0,
        false,
        false,
        undefined,
        [
          {
            currencyId: 1,
            cashBalance: TypedBigNumber.from(5000e8, BigNumberType.InternalAsset, 'cETH'),
            nTokenBalance: TypedBigNumber.from(5000e8, BigNumberType.nToken, 'nETH'),
            lastClaimTime: BigNumber.from(0),
            accountIncentiveDebt: BigNumber.from(0),
          },
        ],
        [],
        false
      );

      const { totalETHDebts, totalETHValue, loanToValue } = accountData2.loanToValueRatio();
      expect(totalETHValue.toNumber()).toBe(200e8);
      expect(totalETHDebts.isZero()).toBeTruthy();
      expect(loanToValue).toBe(0);
    });

    it('haircut ltv is 100 when fc is zero', () => {
      const accountData2 = new MockAccountData(
        0,
        false,
        false,
        undefined,
        [
          {
            currencyId: 2,
            cashBalance: TypedBigNumber.from(-3500e8 * 0.92, BigNumberType.InternalAsset, 'cDAI'),
            nTokenBalance: TypedBigNumber.from(0, BigNumberType.nToken, 'nDAI'),
            lastClaimTime: BigNumber.from(0),
            accountIncentiveDebt: BigNumber.from(0),
          },
          {
            currencyId: 3,
            cashBalance: TypedBigNumber.from(3500e8 * 1.09, BigNumberType.InternalAsset, 'cUSDC'),
            nTokenBalance: TypedBigNumber.from(0, BigNumberType.nToken, 'nUSDC'),
            lastClaimTime: BigNumber.from(0),
            accountIncentiveDebt: BigNumber.from(0),
          },
        ],
        [],
        false
      );

      const { netETHCollateralWithHaircut, netETHDebtWithBuffer } = FreeCollateral.getFreeCollateral(accountData2);
      expect(netETHCollateralWithHaircut.sub(netETHDebtWithBuffer).isZero()).toBeTruthy();
      const { haircutLoanToValue, maxLoanToValue, loanToValue } = accountData2.loanToValueRatio();
      expect(haircutLoanToValue).toBe(100);
      expect(maxLoanToValue).toBe(loanToValue);
    });

    // todo more tests
  });

  describe('liquidation price', () => {
    it('gets liquidation price with ETH collateral', () => {
      const account = new MockAccountData(
        0,
        false,
        false,
        undefined,
        [
          {
            currencyId: 1,
            cashBalance: TypedBigNumber.from(50e8 * 1.09, BigNumberType.InternalAsset, 'cETH'),
            nTokenBalance: TypedBigNumber.from(0, BigNumberType.nToken, 'nETH'),
            lastClaimTime: BigNumber.from(0),
            accountIncentiveDebt: BigNumber.from(0),
          },
          {
            currencyId: 2,
            cashBalance: TypedBigNumber.from(0, BigNumberType.InternalAsset, 'cDAI'),
            nTokenBalance: TypedBigNumber.from(0, BigNumberType.nToken, 'nDAI'),
            lastClaimTime: BigNumber.from(0),
            accountIncentiveDebt: BigNumber.from(0),
          },
        ],
        [
          {
            currencyId: 2,
            maturity: getNowSeconds() + 1000,
            assetType: AssetType.fCash,
            notional: TypedBigNumber.from(-100e8 * 0.78, BigNumberType.InternalUnderlying, 'DAI'),
            settlementDate: getNowSeconds() + 1000,
          },
        ],
        false
      );

      const ethRateData: MutableForTesting<ETHRate> = system.getETHRate(2);
      ethRateData.latestRate = BigNumber.from(ethers.utils.parseUnits('0.01'));
      const rateProvider = { getETHRate: () => ethRateData };
      system.setETHRateProvider(2, rateProvider);

      const liquidationPrice = account.getLiquidationPrice(1, 2);
      expect(liquidationPrice?.symbol).toBe('DAI');

      const { netETHCollateralWithHaircut, netETHDebtWithBuffer } = account.getFreeCollateral();
      const aggregateFC = netETHCollateralWithHaircut.sub(netETHDebtWithBuffer);
      expect(aggregateFC.toNumber()).toBeCloseTo(0, -6);

      const { totalPenalty, totalPenaltyRate, totalPenaltyETHValueAtLiquidationPrice } = account.getLiquidationPenalty(
        1,
        liquidationPrice!
      );

      expect(totalPenaltyRate).toBe(4);
      expect(totalPenalty?.symbol).toBe('ETH');
      const ethValue = account.cashBalance(1)!.toUnderlying().toFloat() * 0.4 * 0.04;
      expect(totalPenalty?.toFloat()).toBeCloseTo(ethValue);
      expect(totalPenaltyETHValueAtLiquidationPrice?.symbol).toBe('ETH');
      expect(totalPenaltyETHValueAtLiquidationPrice?.toFloat()).toBeCloseTo(totalPenalty!.toFloat());
    });

    it('returns null on negative liquidation price', () => {
      const account = new MockAccountData(
        0,
        false,
        false,
        undefined,
        [
          {
            currencyId: 1,
            cashBalance: TypedBigNumber.from(50e8, BigNumberType.InternalAsset, 'cETH'),
            nTokenBalance: TypedBigNumber.from(0, BigNumberType.nToken, 'nETH'),
            lastClaimTime: BigNumber.from(0),
            accountIncentiveDebt: BigNumber.from(0),
          },
          {
            currencyId: 2,
            cashBalance: TypedBigNumber.from(500000e8, BigNumberType.InternalAsset, 'cDAI'),
            nTokenBalance: TypedBigNumber.from(0, BigNumberType.nToken, 'nDAI'),
            lastClaimTime: BigNumber.from(0),
            accountIncentiveDebt: BigNumber.from(0),
          },
        ],
        [
          {
            currencyId: 1,
            maturity: getNowSeconds() + 1000,
            assetType: AssetType.fCash,
            notional: TypedBigNumber.from(-0.75e8, BigNumberType.InternalUnderlying, 'ETH'),
            settlementDate: getNowSeconds() + 1000,
          },
        ],
        false
      );

      expect(account.getLiquidationPrice(2, 1)).toBeNull();
    });

    it('gets liquidation price with USDC collateral', () => {
      const account = new MockAccountData(
        0,
        false,
        false,
        undefined,
        [
          {
            currencyId: 2,
            cashBalance: TypedBigNumber.from(0, BigNumberType.InternalAsset, 'cDAI'),
            nTokenBalance: TypedBigNumber.from(0, BigNumberType.nToken, 'nDAI'),
            lastClaimTime: BigNumber.from(0),
            accountIncentiveDebt: BigNumber.from(0),
          },
          {
            currencyId: 3,
            cashBalance: TypedBigNumber.from(Math.floor(5000e8 * 2.18), BigNumberType.InternalAsset, 'cUSDC'),
            nTokenBalance: TypedBigNumber.from(0, BigNumberType.nToken, 'nUSDC'),
            lastClaimTime: BigNumber.from(0),
            accountIncentiveDebt: BigNumber.from(0),
          },
        ],
        [
          {
            currencyId: 2,
            maturity: getNowSeconds() + 1000,
            assetType: AssetType.fCash,
            notional: TypedBigNumber.from(-100e8 * 0.92, BigNumberType.InternalUnderlying, 'DAI'),
            settlementDate: getNowSeconds() + 1000,
          },
        ],
        false
      );
      const ethRateData: MutableForTesting<ETHRate> = system.getETHRate(2);
      ethRateData.latestRate = BigNumber.from(ethers.utils.parseUnits('0.01'));
      const rateProvider = {
        getETHRate: () => ethRateData,
      };
      system.setETHRateProvider(2, rateProvider);

      const liquidationPrice = account.getLiquidationPrice(3, 2);
      expect(liquidationPrice?.symbol).toBe('DAI');
      // 2x collateral in stables, liquidation price is $0.50
      expect(liquidationPrice?.toNumber()).toBeCloseTo(0.5e8, -6);

      const { totalPenalty, totalPenaltyRate, totalPenaltyETHValueAtLiquidationPrice } = account.getLiquidationPenalty(
        3,
        liquidationPrice!
      );

      expect(totalPenaltyRate).toBe(4);
      expect(totalPenalty?.symbol).toBe('USDC');
      const usdcValue = account.cashBalance(3)!.toUnderlying().toFloat() * 0.4 * 0.04;
      expect(totalPenalty?.toFloat()).toBeCloseTo(usdcValue);
      expect(totalPenaltyETHValueAtLiquidationPrice?.symbol).toBe('ETH');
      // The value of the penalty is at $0.50 USD, and the value of USDC will be priced at $0.50
      expect(totalPenaltyETHValueAtLiquidationPrice?.toUSD().toFloat()).toBeCloseTo(totalPenalty!.toFloat() / 2);
    });

    it('gets liquidation penalty with nUSDC collateral', () => {
      const account = new MockAccountData(
        0,
        false,
        false,
        undefined,
        [
          {
            currencyId: 2,
            cashBalance: TypedBigNumber.from(0, BigNumberType.InternalAsset, 'cDAI'),
            nTokenBalance: TypedBigNumber.from(0, BigNumberType.nToken, 'nDAI'),
            lastClaimTime: BigNumber.from(0),
            accountIncentiveDebt: BigNumber.from(0),
          },
          {
            currencyId: 3,
            cashBalance: TypedBigNumber.from(1000e8, BigNumberType.InternalAsset, 'cUSDC'),
            nTokenBalance: TypedBigNumber.from(5000e8, BigNumberType.nToken, 'nUSDC'),
            lastClaimTime: BigNumber.from(0),
            accountIncentiveDebt: BigNumber.from(0),
          },
        ],
        [
          {
            currencyId: 2,
            maturity: getNowSeconds() + 1000,
            assetType: AssetType.fCash,
            notional: TypedBigNumber.from(-100e8 * 0.92, BigNumberType.InternalUnderlying, 'DAI'),
            settlementDate: getNowSeconds() + 1000,
          },
        ],
        false
      );
      const ethRateData: MutableForTesting<ETHRate> = system.getETHRate(2);
      ethRateData.latestRate = BigNumber.from(ethers.utils.parseUnits('0.01'));
      const rateProvider = {
        getETHRate: () => ethRateData,
      };
      system.setETHRateProvider(2, rateProvider);

      const liquidationPrice = account.getLiquidationPrice(3, 2);
      const { totalPenalty, totalPenaltyRate } = account.getLiquidationPenalty(3, liquidationPrice!);

      expect(totalPenaltyRate).toBeCloseTo(8.3847);
      expect(totalPenalty?.symbol).toBe('USDC');
    });
  });

  it('returns total assets and debts per currency', () => {
    const account = new MockAccountData(
      0,
      false,
      false,
      undefined,
      [
        {
          currencyId: 2,
          cashBalance: TypedBigNumber.from(-5000e8, BigNumberType.InternalAsset, 'cDAI'),
          nTokenBalance: TypedBigNumber.from(0, BigNumberType.nToken, 'nDAI'),
          lastClaimTime: BigNumber.from(0),
          accountIncentiveDebt: BigNumber.from(0),
        },
        {
          currencyId: 3,
          cashBalance: TypedBigNumber.from(Math.floor(5000e8), BigNumberType.InternalAsset, 'cUSDC'),
          nTokenBalance: TypedBigNumber.from(1000e8, BigNumberType.nToken, 'nUSDC'),
          lastClaimTime: BigNumber.from(0),
          accountIncentiveDebt: BigNumber.from(0),
        },
      ],
      [
        {
          currencyId: 2,
          maturity: getNowSeconds() + 1000,
          assetType: AssetType.fCash,
          notional: TypedBigNumber.from(200e8, BigNumberType.InternalUnderlying, 'DAI'),
          settlementDate: getNowSeconds() + 1000,
        },
        {
          currencyId: 3,
          maturity: getNowSeconds() + 1000,
          assetType: AssetType.fCash,
          notional: TypedBigNumber.from(-150e8, BigNumberType.InternalUnderlying, 'USDC'),
          settlementDate: getNowSeconds() + 1000,
        },
      ],
      false
    );

    const totals = account.getTotalCurrencyValue();
    expect(totals.size).toBe(2);
    expect(totals.get(2)?.totalAssets.toFloat()).toBeCloseTo(200);
    expect(totals.get(2)?.totalDebts.toFloat()).toBeCloseTo(100);
    expect(totals.get(3)?.totalAssets.toFloat()).toBeCloseTo(119.833);
    expect(totals.get(3)?.totalDebts.toFloat()).toBeCloseTo(150);
  });

  describe('updates based on collateral actions', () => {
    it('updates on asset cash action', () => {
      const accountData = AccountData.emptyAccountData();
      accountData.updateCollateralAction({
        type: CollateralActionType.ASSET_CASH,
        amount: TypedBigNumber.fromBalance(100e8, 'DAI', true),
      });

      expect(accountData.cashBalance(2)?.toFloat()).toBe(5000);

      accountData.updateCollateralAction({
        type: CollateralActionType.ASSET_CASH,
        amount: TypedBigNumber.fromBalance(100e8, 'cDAI', true),
      });

      expect(accountData.cashBalance(2)?.toFloat()).toBe(5100);
    });

    it('updates on ntoken action', () => {
      const accountData = AccountData.emptyAccountData();
      accountData.updateCollateralAction({
        type: CollateralActionType.NTOKEN,
        amount: TypedBigNumber.fromBalance(100e8, 'DAI', true),
      });

      expect(accountData.nTokenBalance(2)?.toFloat()).toBeCloseTo(5026, 0);

      accountData.updateCollateralAction({
        type: CollateralActionType.NTOKEN,
        amount: TypedBigNumber.fromBalance(100e8, 'cDAI', true),
      });

      expect(accountData.nTokenBalance(2)?.toFloat()).toBeCloseTo(5127, 0);
    });

    it('updates on lend fcash action', () => {
      const accountData = AccountData.emptyAccountData();
      const market = System.getSystem().getMarkets(2)[0];
      accountData.updateCollateralAction({
        type: CollateralActionType.LEND_FCASH,
        amount: TypedBigNumber.fromBalance(100e8, 'DAI', true),
        marketKey: market.marketKey,
      });

      expect(accountData.portfolio[0].currencyId).toBe(2);
      expect(accountData.portfolio[0].maturity).toBe(market.maturity);
      expect(accountData.portfolio[0].notional.toFloat()).toBeCloseTo(100, 0);

      accountData.updateCollateralAction({
        type: CollateralActionType.LEND_FCASH,
        amount: TypedBigNumber.fromBalance(5000e8, 'cDAI', true),
        marketKey: market.marketKey,
      });

      expect(accountData.portfolio[0].currencyId).toBe(2);
      expect(accountData.portfolio[0].maturity).toBe(market.maturity);
      expect(accountData.portfolio[0].notional.toFloat()).toBeCloseTo(200, 0);
    });
  });
});
