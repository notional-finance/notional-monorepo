import Notional from '@notional-finance/sdk';
import { System } from '@notional-finance/sdk/system';
import { makeStore } from '../src/utils';
import { loadVaultActionManager } from '../src/leveraged-vaults/vault-action-manager';
import {
  VaultActionState,
  initialVaultActionState,
} from '../src/leveraged-vaults/vault-action-store';
import { updateNotionalState } from '../src/notional/notional-store';
import { errors$ } from '../src/error/error-manager';

describe('Vault Actions - Initialization', () => {
  // todo: mock system, account, state$

  updateNotionalState({
    notional: {
      system: {
        getVault: jest.fn((address) => {
          if (address === '0x1234') throw Error(address);
        }),
      } as unknown as System,
    } as Notional,
  });
  const { updateState, _state$: state$ } = makeStore<VaultActionState>(
    initialVaultActionState
  );
  const vaultActionUpdates = loadVaultActionManager(state$);

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

  // it(
  //   'filters eligible markets to longer dated maturities if allow roll position'
  // );
  // it('restricts eligible markets if not allow roll position');
  // it('only returns create vault if no maturity');
  // it('returns withdraw post maturity and create vault position if has matured');
});

// describe('Vault Actions - Borrow Data', () => {

// })

// describe('Vault Actions - Withdraw Data', () => {

// })

// describe('Vault Actions - Update Account', () => {

// })
