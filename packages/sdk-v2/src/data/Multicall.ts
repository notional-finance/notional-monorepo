import { Contract, providers, utils } from 'ethers';
import { Multicall2 } from '@notional-finance/contracts';

import Multicall2ABI from '.././abi/Multicall2.json';

const MULTICALL2 = {
  mainnet: '0x5ba1e12693dc8f9c48aad8770482f4739beed696',
  kovan: '0x5ba1e12693dc8f9c48aad8770482f4739beed696',
  rinkeby: '0x5ba1e12693dc8f9c48aad8770482f4739beed696',
  goerli: '0x5ba1e12693dc8f9c48aad8770482f4739beed696',
  ropsten: '0x5ba1e12693dc8f9c48aad8770482f4739beed696',
};

export interface AggregateCall {
  // Contract to target in the call
  target: Contract;
  // Function fragment to get the corresponding interface
  method: string | utils.FunctionFragment;
  // Arguments to call the method with
  args: any[];
  // Key to lookup the result from the aggregate
  key: string;
  // Transform to apply to decoded result
  transform?: (result: any) => any;
}

export async function aggregate(calls: AggregateCall[], provider: providers.Provider, multicall?: Multicall2) {
  if (!multicall) {
    const network = await provider.getNetwork();
    const networkName = network.name === 'homestead' ? 'mainnet' : network.name;
    // eslint-disable-next-line no-param-reassign
    multicall = new Contract(MULTICALL2[networkName], Multicall2ABI, provider) as Multicall2;
  }

  const aggregateCall = calls.map((c) => ({
    target: c.target.address,
    callData: c.target.interface.encodeFunctionData(c.method, c.args),
  }));

  const { blockNumber, returnData } = await multicall.callStatic.aggregate(aggregateCall);
  const results = returnData.reduce((obj, r, i) => {
    const { key, method, target, transform } = calls[i];
    let decoded = target.interface.decodeFunctionResult(method, r);
    // For single return values, decodeFunctionResult still returns an
    // array which we eliminate here for simplicity
    if (decoded.length === 1) [decoded] = decoded;

    // eslint-disable-next-line no-param-reassign
    obj[key] = transform ? transform(decoded) : decoded;
    return obj;
  }, {});

  return { blockNumber, results };
}
