import { Contract, providers } from 'ethers';
import { Multicall2, Multicall2ABI } from '@notional-finance/contracts';
import { AggregateCall, NO_OP } from './types';

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
      // Short circuit NO_OP calls
      if (c.target === NO_OP) {
        return {
          ...c,
          contract: undefined,
        };
      }

      const contract =
        typeof c.target === 'function' ? c.target(aggregateResults) : c.target;
      const args =
        typeof c.args === 'function' ? c.args(aggregateResults) : c.args || [];
      try {
        return {
          ...c,
          target: contract.address,
          callData: contract.interface.encodeFunctionData(c.method, args),
          contract,
        };
      } catch (e) {
        throw new SyntaxError(`
Error in Multicall, attempting to encode: ${contract.address}#${c.method}(${c.args}):
${e}`);
      }
    });

  let returnData: string[];
  try {
    ({ returnData } = await multicall.callStatic.aggregate(
      aggregateCall.filter((c) => c.target !== NO_OP) as Multicall2.CallStruct[]
    ));
  } catch (e) {
    throw new Error(`
Error executing Multicall: ${aggregateCall}
${e}`);
  }

  const results = aggregateCall.reduce(
    (obj, { key, method, transform, contract, target }) => {
      let result: unknown;

      // If the target is a NO_OP then the value must be fetched from the transform
      if (target === NO_OP) {
        if (transform === undefined)
          throw Error('Undefined transform for NO_OP');
        result = transform(undefined, obj);
      } else {
        // Otherwise we get the first element from the array
        const [r, ...tmp] = returnData;
        returnData = tmp;
        if (r === undefined || contract === undefined)
          throw Error(
            `Decode result error, ${r}, ${key}, ${method}, ${target}`
          );
        const decoded = contract.interface.decodeFunctionResult(method, r);
        // For single return values, decodeFunctionResult still returns an
        // array which we eliminate here for simplicity
        result = decoded.length === 1 ? decoded[0] : decoded;
      }

      // eslint-disable-next-line no-param-reassign
      const values = transform ? transform(result, obj) : result;
      if (Array.isArray(key)) {
        (key as string[]).forEach(
          (k) =>
            ((obj as Record<string, unknown>)[k] = (
              values as Record<string, unknown>
            )[k])
        );
      } else {
        (obj as Record<string, unknown>)[key] = values;
      }
      return obj;
    },
    aggregateResults
  );

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

  return { block, results };
}
