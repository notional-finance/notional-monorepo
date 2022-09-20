import { VaultFactory } from '../../../src/vaults';

describe('Vault Factory', () => {
  it('decodes vault names', () => {
    expect(VaultFactory.resolveStrategyName('0x8fd8f0b0')).toBe('CrossCurrencyfCash');
  });
});
