import { keccak256, toUtf8Bytes } from 'ethers/lib/utils';
import { fetch as crossFetch } from 'cross-fetch';
import { ethers, providers } from 'ethers';
import { System } from '../system';
import BaseVault from './BaseVault';
import CrossCurrencyfCash from './strategy/notional/CrossCurrencyfCash';
import { VaultReturn } from '../libs/types';
import MetaStable2TokenAura from './strategy/balancer/MetaStable2TokenAura';
import Boosted3TokenAuraVault from './strategy/balancer/Boosted3TokenAuraVault';
import { RATE_PRECISION } from '../config/constants';
import { decodeValue } from '../data/SystemData';

interface BaseVaultInstantiable<D, R, I extends Record<string, any>> {
  new (vaultAddress: string, initParams?: I): BaseVault<D, R, I>;
  initializeVault(): Promise<void>;
}

export default class VaultFactory {
  private static names = [
    'CrossCurrencyfCash',
    'MetaStable2TokenAura',
    'Boosted3TokenAuraVault',
  ];

  private static nameToClass: Record<string, any> = {
    CrossCurrencyfCash,
    MetaStable2TokenAura,
    Boosted3TokenAuraVault,
  };

  private static idsToNames = this.names.reduce((m, n: string) => {
    const hash = keccak256(toUtf8Bytes(n)).slice(0, 10);
    m.set(hash, n);
    return m;
  }, new Map<string, string>());

  // Resolves a hashed strategy id to a name
  public static resolveStrategyName(strategyId: string) {
    return this.idsToNames.get(strategyId);
  }

  /**
   * Resolves a strategy id to its generic base vault class
   * @param strategyId
   * @returns
   */
  public static resolveBaseVaultClass<D, R, I extends Record<string, any>>(
    strategyId: string
  ): BaseVaultInstantiable<D, R, I> {
    const name = this.resolveStrategyName(strategyId);
    if (!name) throw Error('Unknown strategy');
    return this.nameToClass[name];
  }

  public static buildVaultFromCache<D, R, I extends Record<string, any>>(
    strategyId: string,
    vaultAddress: string
  ) {
    const initParamsJSON = System.getSystem().getVaultJSONParams(vaultAddress);
    try {
      const initParams = decodeValue(JSON.parse(initParamsJSON));
      const BaseVaultClass = this.resolveBaseVaultClass<D, R, I>(strategyId);
      return new BaseVaultClass(vaultAddress, initParams);
    } catch {
      throw Error(`Unable to parse init params for ${vaultAddress}`);
    }
  }

  public static async buildVault<D, R, I extends Record<string, any>>(
    strategyId: string,
    vaultAddress: string,
    provider: providers.JsonRpcProvider
  ) {
    const BaseVaultClass = this.resolveBaseVaultClass<D, R, I>(strategyId);
    const vaultInstance = new BaseVaultClass(vaultAddress);
    const { blockNumber, initParams } = await vaultInstance.initializeVault(
      provider
    );
    return {
      blockNumber,
      vaultInstance,
      initParams,
    };
  }

  public static async fetchVaultReturns(
    vaultAddress: string,
    maturity?: number
  ): Promise<VaultReturn[]> {
    const system = System.getSystem();
    const _fetch = system.skipFetchSetup ? fetch : crossFetch;
    const _checkedAddress = ethers.utils.getAddress(vaultAddress);
    const returnsURL = maturity
      ? `${system.cacheUrl}/vault-returns/${_checkedAddress}/${maturity}`
      : `${system.cacheUrl}/vault-returns/${_checkedAddress}`;

    return _fetch(returnsURL).then((r) => r.json());
  }

  public static calculateAverageReturns(
    vaultReturns: VaultReturn[],
    sinceTime: number
  ) {
    if (vaultReturns.length === 0) throw Error('No vault returns');
    const accumulators = Array.from(Object.keys(vaultReturns[0]))
      .filter((h) => h !== 'timestamp')
      .reduce((acc, h) => {
        acc.set(h, [0, 0]);
        return acc;
      }, new Map<string, [number, number]>());

    vaultReturns
      .filter((row) => row.timestamp >= sinceTime)
      .forEach((row) => {
        Array.from(Object.keys(row))
          .filter((k) => k !== 'timestamp')
          .forEach((h) => {
            const [sum, count] = accumulators.get(h)!;
            accumulators.set(h, [sum + (row[h] || 0), count + 1]);
          });
      });

    const returnDrivers = Array.from(accumulators.entries()).map(
      ([source, [sum, count]]) => ({
        source,
        avg: Math.floor((sum * RATE_PRECISION) / (count * 100)),
      })
    );

    const totalReturns = returnDrivers.reduce((s, r) => s + r.avg, 0);

    return { returnDrivers, totalReturns };
  }
}
