import { filterEmpty, Network } from '@notional-finance/util';
import { map, Observable } from 'rxjs';
import {
  BaseLiquidityPool,
  BaseNotionalMarket,
  fCashMarket,
  PoolClasses,
  PoolConstructor,
  pCashMarket,
  SNOTEWeightedPool,
} from '../exchanges';
import { PoolDefinition, Registry, TokenBalance } from '..';
import { ClientRegistry } from './client-registry';
import { Routes } from '../server';
import { ethers } from 'ethers';

export class ExchangeRegistryClient extends ClientRegistry<PoolDefinition> {
  protected cachePath() {
    return Routes.Exchanges;
  }

  public subscribePoolInstance<T extends BaseLiquidityPool<unknown>>(
    network: Network,
    address: string
  ) {
    return this.subscribeSubject(
      network,
      // Converts to a checksummed address
      ethers.utils.getAddress(address)
    )?.pipe(
      filterEmpty(),
      map((pool) => this._buildPool<T>(network, pool))
    );
  }

  public getPoolInstance<T extends BaseLiquidityPool<unknown>>(
    network: Network,
    address: string
  ) {
    const pool =
      this.getLatestFromSubject(network, ethers.utils.getAddress(address)) ||
      this.getLatestFromSubject(network, address.toLowerCase());
    if (!pool) throw Error(`Pool ${address} on ${network} not found`);
    return this._buildPool<T>(network, pool);
  }

  public getfCashMarket(network: Network, currencyId: number) {
    const nToken = Registry.getTokenRegistry().getNToken(network, currencyId);
    return this.getPoolInstance<fCashMarket>(network, nToken.address);
  }

  public subscribeNotionalMarket(
    network: Network,
    currencyId: number
  ): Observable<BaseNotionalMarket<{ currencyId: number }>> | undefined {
    const allTokens = Registry.getTokenRegistry()
      .getAllTokens(network)
      .filter((t) => t.currencyId === currencyId);
    const nToken = allTokens.find((t) => t.tokenType === 'nToken');
    if (nToken) return this.subscribePoolInstance(network, nToken.address);

    const pCash = allTokens.find((t) => t.tokenType === 'PrimeCash');
    const { primeCashCurve } = Registry.getConfigurationRegistry().getConfig(
      network,
      currencyId
    );
    if (!pCash || !primeCashCurve) throw Error('Prime Cash Curve not found');
    return Registry.getTokenRegistry()
      .subscribeSubject(network, pCash.address)
      ?.pipe(
        filterEmpty(),
        map(
          (p) =>
            new pCashMarket(
              network,
              [p.totalSupply || TokenBalance.zero(p)],
              p.totalSupply || TokenBalance.zero(p),
              {
                currencyId,
                primeCashCurve,
              }
            )
        )
      );
  }

  public getSNOTEPool() {
    return this.isKeyRegistered(Network.mainnet, SNOTEWeightedPool.sNOTE_Pool)
      ? this.getPoolInstance<SNOTEWeightedPool>(
          Network.mainnet,
          SNOTEWeightedPool.sNOTE_Pool
        )
      : undefined;
  }

  public getNotionalMarket(network: Network, currencyId: number) {
    const allTokens = Registry.getTokenRegistry()
      .getAllTokens(network)
      .filter((t) => t.currencyId === currencyId);
    const nToken = allTokens.find((t) => t.tokenType === 'nToken');
    if (nToken) return this.getfCashMarket(network, currencyId);

    const pCash = allTokens.find((t) => t.tokenType === 'PrimeCash');
    const { primeCashCurve } = Registry.getConfigurationRegistry().getConfig(
      network,
      currencyId
    );
    if (!pCash || !primeCashCurve) throw Error('Prime Cash Curve not found');
    return new pCashMarket(
      network,
      [pCash.totalSupply || TokenBalance.zero(pCash)],
      pCash.totalSupply || TokenBalance.zero(pCash),
      {
        currencyId,
        primeCashCurve,
      }
    );
  }

  private _buildPool<T>(network: Network, pool: PoolDefinition) {
    if (!pool.latestPoolData) throw Error(`Pool data not defined for ${pool}`);
    const PoolClass = PoolClasses[pool.PoolClass] as PoolConstructor;

    return new PoolClass(
      network,
      pool.latestPoolData.balances,
      pool.latestPoolData.totalSupply,
      pool.latestPoolData.poolParams
    ) as T;
  }
}
