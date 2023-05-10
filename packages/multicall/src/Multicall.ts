import { Contract, providers } from 'ethers';
import { Multicall2, Multicall2ABI } from '@notional-finance/contracts';
import { AggregateCall } from './types';
import { Subject } from 'rxjs';

const MULTICALL3 = '0xcA11bde05977b3631167028862bE2a173976CA11';

async function getMulticall(provider: providers.Provider) {
  return new Contract(MULTICALL3, Multicall2ABI, provider) as Multicall2;
}

async function executeStage<T>(
  calls: AggregateCall<T>[],
  aggregateResults: Record<string, T>,
  multicall: Multicall2
) {
  const aggregateCall = calls
    .filter((c) => c.target !== undefined)
    .map((c) => {
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

  const { returnData } = await multicall.callStatic.aggregate(aggregateCall);

  const results = returnData.reduce((obj, r, i) => {
    const { key, method, transform, contract } = aggregateCall[i];
    let decoded = contract.interface.decodeFunctionResult(method, r);
    // For single return values, decodeFunctionResult still returns an
    // array which we eliminate here for simplicity
    if (decoded.length === 1) [decoded] = decoded;

    // eslint-disable-next-line no-param-reassign
    const values = transform ? transform(decoded, obj) : decoded;
    if (typeof key === 'string') {
      (obj as Record<string, unknown>)[key] = values;
    } else {
      (key as string[]).forEach(
        (k) =>
          ((obj as Record<string, unknown>)[k] = (
            values as Record<string, unknown>
          )[k])
      );
    }
    return obj;
  }, aggregateResults);

  return { results };
}

function getStages<T>(calls: AggregateCall<T>[]) {
  const groupedStages = calls.reduce((m, c) => {
    const stage = c.stage || 0;
    m.set(stage, [...(m.get(stage) || []), c]);
    return m;
  }, new Map<number, AggregateCall<T>[]>());

  return Array.from(groupedStages.entries())
    .sort(([a], [b]) => a - b)
    .map(([_, c]) => c);
}

export async function aggregate<T = unknown>(
  calls: AggregateCall<T>[],
  provider: providers.Provider,
  subjects?: Map<string, Subject<T>>,
  _multicall?: Multicall2
) {
  const multicall = _multicall || (await getMulticall(provider));
  const stages = getStages(calls);
  let results = {} as Record<string, T>;

  for (const calls of stages) {
    ({ results } = await executeStage<T>(calls, results, multicall));
  }

  // Use latest block here, the returned block number from multicall is not accurate
  // on arbitrum: https://developer.arbitrum.io/time#case-study-multicall
  const block = await provider.getBlock('latest');

  // Emits into subjects if they are are passed in via the map
  if (subjects)
    Object.keys(results).forEach((k) => subjects.get(k)?.next(results[k]));
  return { block, results };
}
