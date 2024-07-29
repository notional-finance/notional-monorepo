import { Network } from '@notional-finance/util';
import crossFetch from 'cross-fetch';
import { BigNumber } from 'ethers';
import { CacheSchema } from '..';
import FixedPoint from '../exchanges/BalancerV2/fixed-point';
import { TokenBalance } from '../token-balance';
import { BaseRegistry } from '../base/base-registry';

const USE_CROSS_FETCH =
  process.env['NX_USE_CROSS_FETCH'] || process.env['NODE_ENV'] == 'test';

export abstract class ClientRegistry<T> extends BaseRegistry<T> {
  protected abstract cachePath(): string;

  constructor(public cacheHostname: string) {
    super();
  }

  public cacheURL(network: Network) {
    return `${this.cacheHostname}/${network}/${this.cachePath()}`;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected static reviver(key: string, value: any): any {
    if (value === undefined || value === null) {
      return value;
    } else if (Array.isArray(value)) {
      return value.map((v, i) =>
        ClientRegistry.reviver(`${key}:${i.toString()}`, v)
      );
    } else if (typeof value === 'object') {
      if (
        Object.prototype.hasOwnProperty.call(value, 'type') &&
        value.type === 'BigNumber'
      ) {
        return BigNumber.from(value);
      } else if (
        Object.prototype.hasOwnProperty.call(value, '_isFixedPoint') &&
        value._isFixedPoint
      ) {
        return FixedPoint.from(value._hex);
      } else if (
        Object.prototype.hasOwnProperty.call(value, '_isTokenBalance') &&
        value._isTokenBalance
      ) {
        return TokenBalance.fromJSON(value);
      }
    }

    return value;
  }

  public static async fetch<T>(
    cacheUrl: string,
    urlSuffix?: string
  ): Promise<T> {
    const _fetch = USE_CROSS_FETCH ? crossFetch : fetch;
    const result = await _fetch(
      urlSuffix ? `${cacheUrl}/${urlSuffix}` : cacheUrl
    );
    const body = await result.text();
    if (result.status !== 200)
      throw Error(
        `Failed Request [Status: ${result.status}] to ${cacheUrl}: ${body}`
      );
    return JSON.parse(body, ClientRegistry.reviver);
  }

  protected async _fetch<T>(network: Network, urlSuffix?: string): Promise<T> {
    return ClientRegistry.fetch(this.cacheURL(network), urlSuffix);
  }

  protected async _refresh(
    network: Network,
    blockNumber?: number
  ): Promise<CacheSchema<T>> {
    return this._fetch(network, blockNumber?.toString());
  }
}
