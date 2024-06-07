import { Contract } from 'ethers';
import { Provider } from './types';
import { ERC20Interface, } from './interfaces';

export async function getTokenDecimals(tokenAddress: string, provider: Provider) {
  const token = new Contract(tokenAddress, ERC20Interface, provider);
  return token.callStatic.decimals();
}

