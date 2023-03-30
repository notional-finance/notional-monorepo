import Notional, {
  Account,
  BigNumberType,
  SECONDS_IN_MONTH,
  TypedBigNumber,
  VaultAccount,
  VaultConfig,
} from '@notional-finance/sdk';
import { makeStore } from '../src/utils';
import { loadVaultActionManager } from '../src/leveraged-vaults/vault-action-manager';
import {
  VaultActionState,
  initialVaultActionState,
} from '../src/leveraged-vaults/vault-action-store';
import { updateVaultState } from '../src/leveraged-vaults/vault-store';
import { updateAccountState } from '../src/account/account-store';
import { updateNotionalState } from '../src/notional/notional-store';
import { errors$ } from '../src/error/error-manager';
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import MockSystem from '../../sdk/tests/mocks/MockSystem';
import { VAULT_ACTIONS } from '@notional-finance/shared-config';
import { BigNumber, ethers } from 'ethers';
import { getSequencer } from './test-utils.spec';

describe('Vault Actions', () => {
  const VAULT = '0xaaaa';
  const VAULT_NO_ROLL = '0xbbbb';
  const {
    updateState,
    _state$: state$,
    _store: stateStore,
  } = makeStore<VaultActionState>(initialVaultActionState);
  const vaultActionUpdates = loadVaultActionManager(state$);
  const system = new MockSystem();
  process.env['FAKE_TIME'] = '1677707666';

  const getMockAccount = (
    maturity: number,
    strategyTokens?: number,
    debt?: number
  ) => {
    const accountData = {
      getVaultAccount: jest.fn((a) => {
        // Add any mocks to simulated vault account here
        const acct = VaultAccount.emptyVaultAccount(a, maturity);
        if (strategyTokens) {
          acct.addStrategyTokens(
            TypedBigNumber.from(
              strategyTokens,
              BigNumberType.StrategyToken,
              acct.vaultSymbol
            ),
            true
          );
        }

        if (debt) {
          acct.updatePrimaryBorrowfCash(
            TypedBigNumber.fromBalance(debt, 'ETH', true),
            true
          );
        }
        return acct;
      }),
    };

    // Set the hash key on the account data so that account-store triggers updates
    Object.defineProperty(accountData, 'hashKey', {
      get: jest.fn(() => ethers.utils.id(Math.random().toString())),
    });

    return {
      accountData,
      address: '0x1234356',
    } as unknown as Account;
  };

  const testSequence = getSequencer((s) => {
    console.log('saw state', s);
    updateState(s);
  }, vaultActionUpdates);

  beforeAll(() => {
    system.setVault({
      vaultAddress: VAULT,
      primaryBorrowCurrency: 1,
      strategy: '0x71b1fca4', // simple strategy
      maxBorrowMarketIndex: 2,
      allowRollPosition: true,
      feeRateBasisPoints: 0,
      minAccountBorrowSize: TypedBigNumber.fromBalance(0.1e8, 'ETH', true),
      maxDeleverageCollateralRatioBasisPoints: 0.1e9,
      minCollateralRatioBasisPoints: 0.05e9,
      maxRequiredAccountCollateralRatioBasisPoints: 0.3e9,
      totalUsedPrimaryBorrowCapacity: TypedBigNumber.fromBalance(
        1e8,
        'ETH',
        true
      ),
      maxPrimaryBorrowCapacity: TypedBigNumber.fromBalance(1000e8, 'ETH', true),
      vaultStates: [
        {
          maturity: 1,
          isSettled: true,
          totalVaultShares: TypedBigNumber.from(
            1000e8,
            BigNumberType.VaultShare,
            `${VAULT}:1`
          ),
          totalStrategyTokens: TypedBigNumber.from(
            1000e8,
            BigNumberType.StrategyToken,
            `${VAULT}:1`
          ),
          remainingSettledStrategyTokens: TypedBigNumber.from(
            0,
            BigNumberType.StrategyToken,
            `${VAULT}:1`
          ),
          totalAssetCash: TypedBigNumber.fromBalance(50_000e8, 'cETH', true),
          remainingSettledAssetCash: TypedBigNumber.fromBalance(
            50_000e8,
            'cETH',
            true
          ),
          settlementRate: BigNumber.from(50e10),
          settlementStrategyTokenValue: TypedBigNumber.fromBalance(
            1e8,
            'ETH',
            true
          ),
          totalPrimaryfCashBorrowed: TypedBigNumber.fromBalance(
            -1000e8,
            'ETH',
            true
          ),
        },
        {
          maturity: system.getMarkets(1)[0].maturity,
          totalVaultShares: TypedBigNumber.from(
            1000e8,
            BigNumberType.VaultShare,
            `${VAULT}:${system.getMarkets(1)[0].maturity}`
          ),
          totalStrategyTokens: TypedBigNumber.from(
            1000e8,
            BigNumberType.StrategyToken,
            `${VAULT}:${system.getMarkets(1)[0].maturity}`
          ),
          totalAssetCash: TypedBigNumber.fromBalance(0, 'cETH', true),
          totalPrimaryfCashBorrowed: TypedBigNumber.fromBalance(
            -1000e8,
            'ETH',
            true
          ),
        },
      ],
    } as unknown as VaultConfig);
    system.setVaultData(VAULT, { exchangeRate: ethers.constants.WeiPerEther });

    system.setVault({
      vaultAddress: VAULT_NO_ROLL,
      primaryBorrowCurrency: 1,
      strategy: '0x71b1fca4', // simple strategy
      maxBorrowMarketIndex: 2,
      allowRollPosition: false,
      maxDeleverageCollateralRatioBasisPoints: 0.01e9,
      minCollateralRatioBasisPoints: 0.01e9,
      maxRequiredAccountCollateralRatioBasisPoints: 0.01e9,
      minAccountBorrowSize: TypedBigNumber.fromBalance(100e8, 'ETH', true),
      vaultStates: [
        {
          maturity: 1,
          isSettled: true,
        },
      ],
    } as VaultConfig);
    system.setVaultData(VAULT_NO_ROLL, { exchangeRate: 1 });

    const activeVaultMarkets = new Map<string, string[]>([
      [VAULT, system.getMarkets(1).map((m) => m.marketKey)],
      [VAULT_NO_ROLL, system.getMarkets(1).map((m) => m.marketKey)],
    ]);

    updateNotionalState({ notional: { system } as unknown as Notional });
    updateVaultState({ activeVaultMarkets });
    vaultActionUpdates.subscribe(updateState);
  });

  describe('Initialization', () => {
    it('reports an error on an unknown vault address', (done) => {
      let isDone = false;
      errors$.subscribe((e) => {
        expect(e.code).toBe(404);
        if (!isDone) {
          isDone = true;
          done();
        }
      });

      vaultActionUpdates.subscribe(() => {
        // Empty subscription to trigger event
        return 1;
      });

      updateState({ vaultAddress: '0x1234' });
    });

    it('only returns create vault if no maturity', () => {
      testSequence([
        [
          { vaultAddress: VAULT },
          (v) => {
            expect(v.vaultAction).toEqual(VAULT_ACTIONS.CREATE_VAULT_POSITION);
            expect(v.eligibleActions).toEqual([
              VAULT_ACTIONS.CREATE_VAULT_POSITION,
            ]);
            expect(v.eligibleMarkets?.length).toEqual(2);
          },
        ],
      ]);
    });

    it('returns withdraw post maturity and create vault position if has matured', () => {
      const maturedAccount = getMockAccount(1);
      updateAccountState({ account: maturedAccount });

      testSequence([
        [
          { vaultAddress: VAULT },
          (s) => {
            expect(s.eligibleActions).toEqual([
              VAULT_ACTIONS.CREATE_VAULT_POSITION,
              VAULT_ACTIONS.WITHDRAW_VAULT_POST_MATURITY,
            ]);
            expect(s.eligibleMarkets?.length).toEqual(2);
            expect(s.settledVaultValues).toBeDefined();
          },
        ],
      ]);
    });

    it('allows roll position', () => {
      const maturity = system.getMarkets(1)[0].maturity;
      const activeAccount = getMockAccount(maturity);
      updateAccountState({ account: activeAccount });

      testSequence([
        [
          { vaultAddress: VAULT },
          (s) => {
            expect(s.eligibleActions).toEqual([
              VAULT_ACTIONS.DEPOSIT_COLLATERAL,
              VAULT_ACTIONS.WITHDRAW_AND_REPAY_DEBT,
              VAULT_ACTIONS.WITHDRAW_VAULT,
              VAULT_ACTIONS.INCREASE_POSITION,
              VAULT_ACTIONS.ROLL_POSITION,
            ]);
            expect(s.eligibleMarkets?.length).toEqual(2);
          },
        ],
      ]);
    });

    it('filters longer dated maturities for roll position', () => {
      const maturity = system.getMarkets(1)[1].maturity;
      const activeAccount = getMockAccount(maturity);
      updateAccountState({ account: activeAccount });

      testSequence([
        [
          { vaultAddress: VAULT },
          (s) => {
            expect(s.eligibleActions).toEqual([
              VAULT_ACTIONS.DEPOSIT_COLLATERAL,
              VAULT_ACTIONS.WITHDRAW_AND_REPAY_DEBT,
              VAULT_ACTIONS.WITHDRAW_VAULT,
              VAULT_ACTIONS.INCREASE_POSITION,
            ]);
            expect(s.eligibleMarkets?.length).toEqual(1);
          },
        ],
      ]);
    });

    it('restricts eligible markets if not allow roll position', () => {
      const maturity = system.getMarkets(1)[0].maturity;
      const activeAccount = getMockAccount(maturity);
      updateAccountState({ account: activeAccount });

      testSequence([
        [
          { vaultAddress: VAULT_NO_ROLL },
          (s) => {
            expect(s.eligibleActions).toEqual([
              VAULT_ACTIONS.DEPOSIT_COLLATERAL,
              VAULT_ACTIONS.WITHDRAW_AND_REPAY_DEBT,
              VAULT_ACTIONS.WITHDRAW_VAULT,
              VAULT_ACTIONS.INCREASE_POSITION,
            ]);
            expect(s.eligibleMarkets?.length).toEqual(1);
          },
        ],
      ]);
    });

    it('resets vault information to default state when actions change', () => {
      testSequence([
        { vaultAddress: VAULT_NO_ROLL },
        { vaultAction: VAULT_ACTIONS.CREATE_VAULT_POSITION },
        { selectedMarketKey: '1:1:1679616000' },
        [
          { vaultAddress: VAULT },
          (s) => {
            expect(s.vaultConfig?.vaultAddress).toBe(VAULT);
            expect(s.minLeverageRatio).toBeCloseTo(3333333333);
            expect(s.maxLeverageRatio).toBe(20e9);
            expect(s.selectedMarketKey).toBeUndefined();
            expect(s.leverageRatio).toBeUndefined();
          },
        ],
      ]);
    });

    it('resets updated vault account when actions change from withdraw to borrow', () => {
      const maturity = system.getMarkets(1)[0].maturity;
      const activeAccount = getMockAccount(maturity, 5e8, -4e8);
      updateAccountState({ account: activeAccount });

      testSequence([
        { vaultAddress: VAULT },
        { vaultAction: VAULT_ACTIONS.WITHDRAW_VAULT },
        [
          { maxWithdraw: true },
          (v) => {
            expect(v.updatedVaultAccount).toBeDefined();
            expect(v.buildTransactionCall).toBeDefined();
          },
        ],
        [
          { vaultAction: VAULT_ACTIONS.DEPOSIT_COLLATERAL },
          (v) => {
            expect(v).toHaveProperty('updatedVaultAccount');
            expect(v).toHaveProperty('buildTransactionCall');
            expect(v.updatedVaultAccount).toBeUndefined();
            expect(v.buildTransactionCall).toBeUndefined();
          },
        ],
        [
          { depositAmount: TypedBigNumber.fromBalance(0.1e8, 'ETH', true) },
          (v) => {
            expect(v.updatedVaultAccount).toBeDefined();
            expect(v.buildTransactionCall).toBeDefined();
          },
        ],
        [
          { vaultAction: VAULT_ACTIONS.WITHDRAW_AND_REPAY_DEBT },
          (v) => {
            expect(v).toHaveProperty('updatedVaultAccount');
            expect(v).toHaveProperty('buildTransactionCall');
            expect(v.updatedVaultAccount).toBeUndefined();
            expect(v.buildTransactionCall).toBeUndefined();
          },
        ],
      ]);
    });
  });

  describe('Borrow', () => {
    it('sets borrow market data on create vault position', () => {
      updateAccountState({ account: getMockAccount(0) });

      testSequence([
        [
          { vaultAddress: VAULT },
          (v) => {
            expect(v.borrowMarketData?.length).toEqual(2);
            expect(v.leverageRatio).toBe(10e9);
            expect(v.transactionCosts).toBeUndefined();
            expect(v.cashBorrowed).toBeUndefined();
          },
        ],
        // user switches markets
        [
          { selectedMarketKey: '1:1:1679616000' },
          (v) => {
            // Switches traded rate based on selected market key
            expect(v.currentBorrowRate).toEqual(
              v.borrowMarketData![0].tradeRate
            );
          },
        ],
        [
          { selectedMarketKey: '1:2:1687392000' },
          (v) => {
            expect(v.currentBorrowRate).toEqual(
              v.borrowMarketData![1].tradeRate
            );
          },
        ],
        // user enters deposit amount
        [
          {
            depositAmount: TypedBigNumber.fromBalance(1e8, 'ETH', true),
          },
          (v, index, _, values) => {
            expect(v.fCashBorrowAmount).toBeDefined();
            expect(v.currentBorrowRate).toBeGreaterThan(
              values[index - 1].currentBorrowRate!
            );
            expect(v.updatedVaultAccount).toBeDefined();
            expect(v.netCapacityChange?.neg().eq(v.fCashBorrowAmount!)).toBe(
              true
            );
            expect(v.transactionCosts).toBeDefined();
            expect(v.cashBorrowed).toBeDefined();
          },
        ],
        [
          // user clears deposit amount
          { depositAmount: undefined },
          (v) => {
            expect(v.fCashBorrowAmount).toBeUndefined();
            expect(v.updatedVaultAccount).toBeUndefined();
            expect(v.netCapacityChange?.isZero()).toBe(true);
            expect(v.transactionCosts).toBeUndefined();
            expect(v.cashBorrowed).toBeUndefined();
          },
        ],
      ]);
    });

    it('sets borrow market data on increase vault position', () => {
      const maturity = system.getMarkets(1)[0].maturity;
      const activeAccount = getMockAccount(maturity, 5e8, -1e8);
      updateAccountState({ account: activeAccount });

      testSequence([
        { vaultAddress: VAULT },
        [
          { vaultAction: VAULT_ACTIONS.INCREASE_POSITION },
          (v) => {
            expect(v.borrowMarketData?.length).toEqual(1);
            // Current maturity is selected
            expect(v.selectedMarketKey).toEqual('1:1:1679616000');
            expect(v.transactionCosts).toBeDefined();
            expect(v.cashBorrowed).toBeDefined();
          },
        ],
        [
          {},
          (v) => {
            expect(v.updatedVaultAccount).toBeDefined();
          },
        ],
        [
          { vaultAction: VAULT_ACTIONS.ROLL_POSITION },
          (v) => {
            expect(v.borrowMarketData?.length).toEqual(1);
            // Next maturity is selected
            expect(v.selectedMarketKey).toEqual('1:2:1687392000');
            expect(v.transactionCosts).toBeDefined();
            expect(v.cashBorrowed).toBeDefined();
          },
        ],
      ]);
    });

    it('sets borrow market data on roll vault position', () => {
      const maturity = system.getMarkets(1)[0].maturity;
      const activeAccount = getMockAccount(maturity, 5e8, -1e8);
      updateAccountState({ account: activeAccount });

      testSequence([
        { vaultAddress: VAULT },
        [
          { vaultAction: VAULT_ACTIONS.ROLL_POSITION },
          (v) => {
            expect(v.borrowMarketData?.length).toEqual(1);
            // There is only one market here (also in increase markets) and it is auto selected
            expect(v.selectedMarketKey).toEqual('1:2:1687392000');
            expect(v.transactionCosts).toBeDefined();
            expect(v.cashBorrowed).toBeDefined();
          },
        ],
        [
          {},
          (v) => {
            expect(v.updatedVaultAccount).toBeDefined();
          },
        ],
      ]);
    });
  });

  describe('Withdraw', () => {
    it('post maturity withdraw', () => {
      updateAccountState({ account: getMockAccount(1) });
      testSequence([
        { vaultAddress: VAULT },
        [
          { vaultAction: VAULT_ACTIONS.WITHDRAW_VAULT_POST_MATURITY },
          (v) => {
            expect(v.updatedVaultAccount).toBeDefined();
            expect(v.updatedVaultAccount?.vaultShares.toFloat()).toBe(0);
            expect(v.updatedVaultAccount?.primaryBorrowfCash.toFloat()).toBe(0);
            expect(v.fCashToLend?.toFloat()).toBe(0);
            expect(v.vaultSharesToRedeem?.toFloat()).toBe(0);
            expect(v.amountToWallet?.toFloat()).toBe(0);
            expect(v.netCapacityChange?.isZero()).toBe(true);
            expect(v.transactionCosts?.isZero()).toBe(true);
            expect(v.costToRepay?.isZero()).toBe(true);
          },
        ],
      ]);
    });

    it('withdraw', () => {
      const maturity = system.getMarkets(1)[0].maturity;
      const activeAccount = getMockAccount(maturity, 5e8, -4e8);
      updateAccountState({ account: activeAccount });

      testSequence([
        { vaultAddress: VAULT },
        { vaultAction: VAULT_ACTIONS.WITHDRAW_VAULT },
        [
          // Tests user input
          { withdrawAmount: TypedBigNumber.fromBalance(0.01e8, 'ETH', true) },
          (v) => {
            expect(v.updatedVaultAccount).toBeDefined();
            expect(v.fCashToLend?.toFloat()).toBe(0.05);
            expect(v.vaultSharesToRedeem?.toFloat()).toBeCloseTo(0.06);
            expect(v.amountToWallet?.toFloat()).toBeCloseTo(0.01, 3);
            expect(v.netCapacityChange?.eq(v.fCashToLend!.neg())).toBe(true);
            expect(v.transactionCosts).toBeDefined();
            expect(v.costToRepay).toBeDefined();
          },
        ],
        [
          // Tests that max withdraw overrides input amounts
          { maxWithdraw: true },
          (v) => {
            expect(v.updatedVaultAccount).toBeDefined();
            expect(v.updatedVaultAccount?.vaultShares.toFloat()).toBe(0);
            expect(v.updatedVaultAccount?.primaryBorrowfCash.toFloat()).toBe(0);
            expect(v.fCashToLend?.toFloat()).toBe(4);
            expect(v.vaultSharesToRedeem?.toFloat()).toBe(5);
            expect(v.amountToWallet?.toFloat()).toBeCloseTo(1, 1);
            expect(v.netCapacityChange?.eq(v.fCashToLend!.neg())).toBe(true);
            expect(v.transactionCosts).toBeDefined();
            expect(v.costToRepay).toBeDefined();
          },
        ],
        [
          { maxWithdraw: false, withdrawAmount: undefined },
          (v) => {
            // Clears inputs when max withdraw is set to false
            expect(v).toHaveProperty('updatedVaultAccount');
            expect(v).toHaveProperty('fCashToLend');
            expect(v).toHaveProperty('vaultSharesToRedeem');
            expect(v).toHaveProperty('amountToWallet');
            expect(v.updatedVaultAccount).toBeUndefined();
            expect(v.fCashToLend).toBeUndefined();
            expect(v.vaultSharesToRedeem).toBeUndefined();
            expect(v.amountToWallet).toBeUndefined();
            expect(v.transactionCosts).toBeUndefined();
            expect(v.costToRepay).toBeUndefined();
          },
        ],
        [
          // Tests user input which triggers a full exit
          { withdrawAmount: TypedBigNumber.fromBalance(0.99e8, 'ETH', true) },
          (v) => {
            expect(v.updatedVaultAccount).toBeDefined();
            expect(v.vaultSharesToRedeem?.toFloat()).toBeCloseTo(5);
            expect(v.amountToWallet?.toFloat()).toBeCloseTo(1, 1);
            expect(v.fCashToLend?.toFloat()).toBe(4);
            expect(v.netCapacityChange?.eq(v.fCashToLend!.neg())).toBe(true);
            expect(v.transactionCosts).toBeDefined();
            expect(v.costToRepay).toBeDefined();
          },
        ],
      ]);
    });

    it('withdraw and repay debt', () => {
      const maturity = system.getMarkets(1)[0].maturity;
      const activeAccount = getMockAccount(maturity, 5e8, -4.75e8);
      updateAccountState({ account: activeAccount });

      testSequence([
        { vaultAddress: VAULT },
        [
          { vaultAction: VAULT_ACTIONS.WITHDRAW_AND_REPAY_DEBT },
          (v) => {
            // Vault is currently sitting at 19x leverage, this will reduce it to 10x
            expect(v.leverageRatio).toBe(10e9);
          },
        ],
        [
          {},
          (v) => {
            const baseVault = stateStore.value.baseVault;
            expect(v.updatedVaultAccount).toBeDefined();

            if (baseVault && v.updatedVaultAccount) {
              expect(
                baseVault?.getLeverageRatio(v.updatedVaultAccount) / 1e9
              ).toBeCloseTo(10, 0);
            } else {
              // If these are not defined throw an error
              expect(true).toBe(false);
            }
            expect(v.amountToWallet).toBeUndefined();
            expect(v.transactionCosts).toBeDefined();
            expect(v.costToRepay).toBeDefined();
          },
        ],
      ]);
    });
  });

  describe('Deposit', () => {
    it('updates vault account on deposit amount', () => {
      const maturity = system.getMarkets(1)[0].maturity;
      const activeAccount = getMockAccount(maturity, 5e8, -1e8);
      updateAccountState({ account: activeAccount });

      testSequence([
        [
          { vaultAddress: VAULT },
          (v) => {
            expect(v).toHaveProperty('depositAmount');
            expect(v.depositAmount).toBeUndefined();
          },
        ],
        [
          { vaultAction: VAULT_ACTIONS.DEPOSIT_COLLATERAL },
          (v) => {
            expect(v.updatedVaultAccount).toBeUndefined();
          },
        ],
        [
          { depositAmount: TypedBigNumber.fromBalance(0.1e8, 'ETH', true) },
          (v) => {
            expect(v.updatedVaultAccount).toBeDefined();
            expect(v.updatedVaultAccount?.vaultShares.toFloat()).toBe(5.1);
          },
        ],
        [
          { depositAmount: TypedBigNumber.fromBalance(0.2e8, 'ETH', true) },
          (v) => {
            expect(v.updatedVaultAccount).toBeDefined();
            expect(v.updatedVaultAccount?.vaultShares.toFloat()).toBe(5.2);
          },
        ],
      ]);
    });
  });
});
