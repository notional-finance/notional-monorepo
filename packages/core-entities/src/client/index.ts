import { BigNumber } from 'ethers';
import FixedPoint from '../exchanges/BalancerV2/fixed-point';
import { TokenBalance } from '../token-balance';
import crossFetch from 'cross-fetch';
import { getEnvVar, getEnvVarWithFallback } from '../utils/env';

const REGISTRY_HOSTNAME = getEnvVarWithFallback(
  'NX_REGISTRY_URL',
  getEnvVarWithFallback('REGISTRY_URL', 'https://registry-v4.notional.finance')
);
const USE_CROSS_FETCH =
  getEnvVar('NX_USE_CROSS_FETCH') || getEnvVar('NODE_ENV') == 'test';

export * from './accounts';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function reviver(key: string, value: any): any {
  if (value === undefined || value === null) {
    return value;
  } else if (Array.isArray(value)) {
    return value.map((v, i) => reviver(`${key}:${i.toString()}`, v));
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

export async function fetchFromRegistry<T>(
  path: string,
  registryUrl = REGISTRY_HOSTNAME
): Promise<T> {
  const _fetch = USE_CROSS_FETCH ? crossFetch : fetch;
  const result = await _fetch(`${registryUrl}/${path}`);
  const body = await result.text();
  if (result.status !== 200)
    throw Error(
      `Failed Request [Status: ${result.status}] to ${REGISTRY_HOSTNAME}/${path}: ${body}`
    );
  return JSON.parse(body, reviver);
}
