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

interface VaultMock extends VaultAccount {
  mockId: string;
}

describe('Vault Actions - Initialization', () => {
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

  const getMockAccount = (maturity: number, mockId: string) => {
    const accountData = {
      getVaultAccount: jest.fn((a) => {
        // Add any mocks to simulated vault account here
        const acct = VaultAccount.emptyVaultAccount(a, maturity);

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

        // Add a mock ID to differentiate between accounts in subscribes
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (acct as VaultMock).mockId = mockId;

        return acct;
      }),
    };

    // Set the hash key on the account data so that account-store triggers updates
    Object.defineProperty(accountData, 'hashKey', {
      get: jest.fn(() => mockId || 'none'),
    });

    return {
      accountData,
    } as unknown as Account;
  };

  const isMock = (
    vaultAccount: VaultAccount | undefined,
    mockId: string | undefined
  ) => {
    return vaultAccount && (vaultAccount as VaultMock).mockId === mockId;
  };

  beforeAll(() => {
    system.setVault({
      vaultAddress: VAULT,
      primaryBorrowCurrency: 1,
      strategy: '0x71b1fca4', // simple strategy
      maxBorrowMarketIndex: 2,
      allowRollPosition: true,
      vaultStates: [
        {
          maturity: 1,
          isSettled: true,
        },
      ],
    } as VaultConfig);
    system.setVaultData(VAULT, { exchangeRate: 1 });

    system.setVault({
      vaultAddress: VAULT_NO_ROLL,
      primaryBorrowCurrency: 1,
      strategy: '0x71b1fca4', // simple strategy
      maxBorrowMarketIndex: 2,
      allowRollPosition: false,
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
  });

  it('reports an error on an unknown vault address', (done) => {
    errors$.subscribe((e) => {
      expect(e.code).toBe(404);
      done();
    });

    vaultActionUpdates.subscribe(() => {
      // Empty subscription to trigger event
      return 1;
    });

    updateState({ vaultAddress: '0x1234' });
  });

  it('only returns create vault if no maturity', (done) => {
    vaultActionUpdates.subscribe((s) => {
      if (isMock(s.vaultAccount, undefined)) {
        expect(s.eligibleActions).toEqual([
          VAULT_ACTIONS.CREATE_VAULT_POSITION,
        ]);
        expect(s.eligibleMarkets?.length).toEqual(2);
        done();
      }
    });

    updateState({ vaultAddress: VAULT });
  });

  it('returns withdraw post maturity and create vault position if has matured', (done) => {
    vaultActionUpdates.subscribe((s) => {
      if (isMock(s.vaultAccount, 'A')) {
        expect(s.eligibleActions).toEqual([
          VAULT_ACTIONS.CREATE_VAULT_POSITION,
          VAULT_ACTIONS.WITHDRAW_VAULT_POST_MATURITY,
        ]);
        expect(s.eligibleMarkets?.length).toEqual(2);
        expect(s.settledVaultValues).toBeDefined();
        done();
      }
    });

    const maturedAccount = getMockAccount(1, 'A');
    updateAccountState({ account: maturedAccount });
    updateState({ vaultAddress: VAULT });
  });

  it('allows roll position', (done) => {
    const maturity = system.getMarkets(1)[0].maturity;

    vaultActionUpdates.subscribe((s) => {
      console.log(s);
      if (isMock(s.vaultAccount, 'B')) {
        expect(s.eligibleActions).toEqual([
          VAULT_ACTIONS.DEPOSIT_COLLATERAL,
          VAULT_ACTIONS.WITHDRAW_AND_REPAY_DEBT,
          VAULT_ACTIONS.WITHDRAW_VAULT,
          VAULT_ACTIONS.INCREASE_POSITION,
          VAULT_ACTIONS.ROLL_POSITION,
        ]);
        expect(s.eligibleMarkets?.length).toEqual(2);
        done();
      }
    });

    const activeAccount = getMockAccount(maturity, 'B');
    updateAccountState({ account: activeAccount });
    updateState({ vaultAddress: VAULT });
  });

  it('filters longer dated maturities for roll position', (done) => {
    // Allows roll but there is no longer dated market
    vaultActionUpdates.subscribe((s) => {
      if (isMock(s.vaultAccount, 'C')) {
        expect(s.eligibleActions).toEqual([
          VAULT_ACTIONS.DEPOSIT_COLLATERAL,
          VAULT_ACTIONS.WITHDRAW_AND_REPAY_DEBT,
          VAULT_ACTIONS.WITHDRAW_VAULT,
          VAULT_ACTIONS.INCREASE_POSITION,
        ]);
        expect(s.eligibleMarkets?.length).toEqual(1);
        done();
      }
    });

    const maturity = system.getMarkets(1)[1].maturity;
    const activeAccount = getMockAccount(maturity, 'C');
    updateAccountState({ account: activeAccount });
    updateState({ vaultAddress: VAULT });
  });

  it('restricts eligible markets if not allow roll position', (done) => {
    // Allows roll but there is no longer dated market
    vaultActionUpdates.subscribe((s) => {
      if (isMock(s.vaultAccount, 'D')) {
        expect(s.eligibleActions).toEqual([
          VAULT_ACTIONS.DEPOSIT_COLLATERAL,
          VAULT_ACTIONS.WITHDRAW_AND_REPAY_DEBT,
          VAULT_ACTIONS.WITHDRAW_VAULT,
          VAULT_ACTIONS.INCREASE_POSITION,
        ]);
        expect(s.eligibleMarkets?.length).toEqual(1);
        done();
      }
    });

    const maturity = system.getMarkets(1)[0].maturity;
    const activeAccount = getMockAccount(maturity, 'D');
    updateAccountState({ account: activeAccount });
    updateState({ vaultAddress: VAULT_NO_ROLL });
  });
});

// describe('Vault Actions - Borrow Data', () => {

// })

// describe('Vault Actions - Withdraw Data', () => {

// })

// describe('Vault Actions - Update Account', () => {

// })
