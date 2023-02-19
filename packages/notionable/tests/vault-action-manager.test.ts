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
import { ethers } from 'ethers';
import { getSequencer } from './test-utils';

describe('Vault Actions', () => {
  const VAULT = '0xaaaa';
  const VAULT_NO_ROLL = '0xbbbb';
  const { updateState, _state$: state$ } = makeStore<VaultActionState>(
    initialVaultActionState
  );
  const vaultActionUpdates = loadVaultActionManager(state$);
  const system = new MockSystem();
  process.env['FAKE_TIME'] = (
    system.getMarkets(1)[0].maturity - SECONDS_IN_MONTH
  ).toString();

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

        acct.getSettlementValues = jest.fn(() => {
          return {
            strategyTokens: TypedBigNumber.from(
              0,
              BigNumberType.StrategyToken,
              acct.vaultSymbol
            ),
            assetCash: TypedBigNumber.fromBalance(0, 'cETH', true),
          };
        });

        return acct;
      }),
    };

    // Set the hash key on the account data so that account-store triggers updates
    Object.defineProperty(accountData, 'hashKey', {
      get: jest.fn(() => 'mock'),
    });

    return {
      accountData,
    } as unknown as Account;
  };

  const testSequence = getSequencer(updateState, vaultActionUpdates);

  beforeAll(() => {
    system.setVault({
      vaultAddress: VAULT,
      primaryBorrowCurrency: 1,
      strategy: '0x71b1fca4', // simple strategy
      maxBorrowMarketIndex: 2,
      allowRollPosition: true,
      feeRateBasisPoints: 0,
      minAccountBorrowSize: TypedBigNumber.fromBalance(0, 'ETH', true),
      maxDeleverageCollateralRatioBasisPoints: 0.08e9,
      minCollateralRatioBasisPoints: 0.05e9,
      maxRequiredAccountCollateralRatioBasisPoints: 0.1e9,
      vaultStates: [
        {
          maturity: 1,
          isSettled: true,
        },
      ],
    } as VaultConfig);
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
            expect(s.minLeverageRatio).toBe(10e9);
            expect(s.maxLeverageRatio).toBe(20e9);
            expect(s.selectedMarketKey).toBeUndefined();
            expect(s.leverageRatio).toBeUndefined();
          },
        ],
      ]);
    });
  });

  describe('Borrow', () => {
    it.only('sets borrow market data on create vault position', () => {
      testSequence([
        { vaultAddress: VAULT },
        [
          { vaultAction: VAULT_ACTIONS.CREATE_VAULT_POSITION },
          (v) => {
            expect(v.leverageRatio).toBe(12.5e9);
            expect(v.borrowMarketData?.length).toEqual(2);
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
          (v, index, values) => {
            expect(v.fCashBorrowAmount).toBeDefined();
            expect(v.currentBorrowRate).toBeGreaterThan(
              values[index - 1].currentBorrowRate!
            );
            console.log(v);
            // @todo update vault account should trigger
          },
        ],
        [
          // user clears deposit amount
          { depositAmount: undefined },
          (v) => {
            expect(v.fCashBorrowAmount).toBeUndefined();
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
            console.log(v);
            expect(v.borrowMarketData?.length).toEqual(1);
          },
        ],
      ]);
    });

    // it('sets borrow market data on roll vault position', () => {});
  });

  describe('Withdraw', () => {});

  describe('Deposit', () => {});

  afterEach(() => {
    updateState(initialVaultActionState);
    updateAccountState({ account: undefined });
  });
});
