import crossFetch from 'cross-fetch';
import { BigNumber } from 'ethers';
import { CacheSchema } from '.';
import FixedPoint from '../exchanges/BalancerV2/FixedPoint';
import { TokenBalance } from '../tokens/TokenBalance';
import { BaseRegistry } from './BaseRegistry';

const USE_CROSS_FETCH = process.env['NX_USE_CROSS_FETCH'];

export abstract class ClientRegistry<T> extends BaseRegistry<T> {
  protected abstract _cacheURL: string;

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

  protected async _refresh(): Promise<CacheSchema<T>> {
    const _fetch = USE_CROSS_FETCH ? crossFetch : fetch;
    const jsonMap = await (await _fetch(this._cacheURL)).text();
    return JSON.parse(jsonMap, this.reviver) as CacheSchema<T>;
  }
}
