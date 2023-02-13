import { Contract, providers } from 'ethers';
import { Multicall2, Multicall2ABI } from '@notional-finance/contracts';
import { AggregateCall } from './types';
import { Subject } from 'rxjs';

const MULTICALL2 = {
  mainnet: '0x5ba1e12693dc8f9c48aad8770482f4739beed696',
  kovan: '0x5ba1e12693dc8f9c48aad8770482f4739beed696',
  rinkeby: '0x5ba1e12693dc8f9c48aad8770482f4739beed696',
  goerli: '0x5ba1e12693dc8f9c48aad8770482f4739beed696',
  ropsten: '0x5ba1e12693dc8f9c48aad8770482f4739beed696',
};

async function getMulticall(provider: providers.Provider) {
  const network = await provider.getNetwork();
  const networkName = network.name === 'homestead' ? 'mainnet' : network.name;
  if (!Object.keys(MULTICALL2).includes(networkName)) {
    throw Error(`Unknown Network in Multicall: ${networkName}`);
  }

  return new Contract(
    MULTICALL2[networkName as keyof typeof MULTICALL2],
    Multicall2ABI,
    provider
  ) as Multicall2;
}

async function executeStage<T extends Record<string, unknown>>(
  calls: AggregateCall[],
  aggregateResults: T,
  multicall: Multicall2
) {
  const aggregateCall = calls.map((c) => {
    const contract =
      typeof c.target === 'function' ? c.target(aggregateResults) : c.target;
    const args =
      typeof c.args === 'function' ? c.args(aggregateResults) : c.args || [];

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
    (obj[key] as Record<string, unknown>) = transform
      ? transform(decoded, obj)
      : decoded;
    return obj;
  }, aggregateResults);

  return { blockNumber: blockNumber.toNumber(), results };
}

function getStages(calls: AggregateCall[]) {
  const groupedStages = calls.reduce((m, c) => {
    const stage = c.stage || 0;
    m.set(stage, [...(m.get(stage) || []), c]);
    return m;
  }, new Map<number, AggregateCall[]>());

  return Array.from(groupedStages.entries())
    .sort(([a], [b]) => a - b)
    .map(([_, c]) => c);
}

export async function aggregate<T extends Record<string, unknown>>(
  calls: AggregateCall[],
  provider: providers.Provider,
  subjects?: Map<string, Subject<unknown>>,
  _multicall?: Multicall2
) {
  const multicall = _multicall || (await getMulticall(provider));
  const stages = getStages(calls);
  let results = {} as T;
  let blockNumber = 0;

  for (const calls of stages) {
    ({ blockNumber, results } = await executeStage<T>(
      calls,
      results,
      multicall
    ));
  }

  const block = await provider.getBlock(blockNumber);

  // Emits into subjects if they are are passed in via the map
  if (subjects)
    Object.keys(results).forEach((k) => subjects.get(k)?.next(results[k]));
  return { block, blockNumber, results };
}
