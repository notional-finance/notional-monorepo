import { keccak256, toUtf8Bytes } from 'ethers/lib/utils';
import BaseVault from './BaseVault';
import CrossCurrencyfCash from './strategy/CrossCurrencyfCash';

interface BaseVaultInstantiable<D, R> {
  new (vaultAddress: string): BaseVault<D, R>;
  initializeVault(): Promise<void>;
}

export default class VaultFactory {
  private static names = ['CrossCurrencyfCash', 'SimpleStrategyVault'];

  private static nameToClass: Record<string, any> = {
    CrossCurrencyfCash,
  };

  private static idsToNames = this.names.reduce((m, n: string) => {
    const hash = keccak256(toUtf8Bytes(n)).slice(0, 10);
    m.set(hash, n);
    return m;
  }, new Map<string, string>());

  public static resolveStrategyName(strategyId: string) {
    return this.idsToNames.get(strategyId);
  }

  public static resolveBaseVaultClass<D, R>(strategyId: string): BaseVaultInstantiable<D, R> {
    const name = this.resolveStrategyName(strategyId);
    if (!name) throw Error('Unknown strategy');
    return this.nameToClass[name];
  }

  public static async buildVault<D, R>(strategyId: string, vaultAddress: string) {
    const BaseVaultClass = this.resolveBaseVaultClass<D, R>(strategyId);
    const vaultInstance = new BaseVaultClass(vaultAddress);
    await vaultInstance.initializeVault();
    return vaultInstance;
  }
}
