import { Network } from '@notional-finance/util';
import crossFetch from 'cross-fetch';
import { BigNumber } from 'ethers';
import { CacheSchema } from '.';
import FixedPoint from '../exchanges/BalancerV2/fixed-point';
import { TokenBalance } from '../token-balance';
import { BaseRegistry } from './base-registry';

const USE_CROSS_FETCH = process.env['NX_USE_CROSS_FETCH'];

export abstract class ClientRegistry<T> extends BaseRegistry<T> {
  protected abstract cachePath: string;

  constructor(public cacheHostname: string) {
    super();
  }

  protected _cacheURL(network: Network) {
    return `http://${this.cacheHostname}/${this.cachePath}?network=${network}`;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected reviver(key: string, value: any): any {
    if (Array.isArray(value)) {
      return value.map((v, i) => this.reviver(`${key}:${i.toString()}`, v));
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

  protected async _refresh(network: Network): Promise<CacheSchema<T>> {
    const _fetch = USE_CROSS_FETCH ? crossFetch : fetch;
    const jsonMap = await (await _fetch(this._cacheURL(network))).text();
    return JSON.parse(jsonMap, this.reviver) as CacheSchema<T>;
  }
}
