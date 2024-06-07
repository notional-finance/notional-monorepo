import util from 'util';
import { exec } from 'child_process';
import { Contract, BigNumber } from 'ethers';
import { Provider } from './types';
import { ERC20Interface, } from './interfaces';


export const execPromise = util.promisify(exec);

export const wait = (ms: number) => new Promise(r => setTimeout(r, ms));

export const e = (decimals: number) => BigNumber.from(10).pow(decimals);

export const e18 = e(18);

// convert string representation of decimal number to integer with 18 places of precision
export function toInt18Precision(value: string | number) {
 return BigNumber.from((Number(value) * 1e15).toFixed(0)).mul(e(3))
}

export async function getTokenDecimals(tokenAddress: string, provider: Provider) {
  const token = new Contract(tokenAddress, ERC20Interface, provider);
  return token.callStatic.decimals();
}

