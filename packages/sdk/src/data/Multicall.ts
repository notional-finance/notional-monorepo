import { Contract, providers, utils } from 'ethers';
import { Multicall2, Multicall2ABI } from '@notional-finance/contracts';

const MULTICALL2 = {
  mainnet: '0x5ba1e12693dc8f9c48aad8770482f4739beed696',
  kovan: '0x5ba1e12693dc8f9c48aad8770482f4739beed696',
  rinkeby: '0x5ba1e12693dc8f9c48aad8770482f4739beed696',
  goerli: '0x5ba1e12693dc8f9c48aad8770482f4739beed696',
  ropsten: '0x5ba1e12693dc8f9c48aad8770482f4739beed696',
};

export interface AggregateCall {
  // Contract to target in the call
  target: Contract | ((prevResults: Record<string, any>) => Contract);
  // Function fragment to get the corresponding interface
  method: string | utils.FunctionFragment;
  // Arguments to call the method with
  args: any[] | ((prevResults: Record<string, any>) => any[]);
  // Key to lookup the result from the aggregate
  key: string;
  // Transform to apply to decoded result
  transform?: (callResult: any, aggregateResults: Record<string, any>) => any;
  // Allows multi-stage aggregate calls where results from the first
  // stage inform the second stage
  stage?: number;
}

async function executeStage<T extends Record<string, any>>(
  calls: AggregateCall[],
  aggregateResults: T,
  multicall: Multicall2
) {
  const aggregateCall = calls.map((c) => {
    const contract =
      typeof c.target === 'function' ? c.target(aggregateResults) : c.target;
    const args =
      typeof c.args === 'function' ? c.args(aggregateResults) : c.args;

    return {
      ...c,
      target: contract.address,
      callData: contract.interface.encodeFunctionData(c.method, args),
      contract,
    };
  });

  const { blockNumber, returnData } = await multicall.callStatic.aggregate(
    aggregateCall
  );
  const results = returnData.reduce((obj, r, i) => {
    const { key, method, transform, contract } = aggregateCall[i];
    let decoded = contract.interface.decodeFunctionResult(method, r);
    // For single return values, decodeFunctionResult still returns an
    // array which we eliminate here for simplicity
    if (decoded.length === 1) [decoded] = decoded;

    // eslint-disable-next-line no-param-reassign
    (obj[key] as Record<string, any>) = transform
      ? transform(decoded, obj)
      : decoded;
    return obj;
  }, aggregateResults);

  return { blockNum: blockNumber.toNumber(), results };
}

export async function aggregate<T extends Record<string, any>>(
  calls: AggregateCall[],
  provider: providers.Provider,
  _multicall?: Multicall2
) {
  let multicall: Multicall2;
  if (!_multicall) {
    const network = await provider.getNetwork();
    const networkName = network.name === 'homestead' ? 'mainnet' : network.name;
    // eslint-disable-next-line no-param-reassign
    multicall = new Contract(
      MULTICALL2[networkName as keyof typeof MULTICALL2],
      Multicall2ABI,
      provider
    ) as Multicall2;
  } else {
    multicall = _multicall;
  }

  const groupedStages = calls.reduce((m, c) => {
    const stage = c.stage || 0;
    m.set(stage, [...(m.get(stage) || []), c]);
    return m;
  }, new Map<number, AggregateCall[]>());

  let aggregateResults: T = {} as T;
  let blockNumber = 0;

  const stages = Array.from(groupedStages.keys()).sort();
  // eslint-disable-next-line no-restricted-syntax
  for (const s of stages) {
    // eslint-disable-next-line no-await-in-loop
    const { blockNum, results } = await executeStage<T>(
      groupedStages.get(s)!,
      aggregateResults,
      multicall
    );
    aggregateResults = results;
    blockNumber = blockNum;
  }

  return { blockNumber, results: aggregateResults };
}
