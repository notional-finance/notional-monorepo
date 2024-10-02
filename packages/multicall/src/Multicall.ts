import { Contract, providers } from 'ethers';
import { Multicall3, Multicall3ABI } from '@notional-finance/contracts';
import { AggregateCall, NO_OP } from './types';
import { batchArray } from '@notional-finance/util';

const MULTICALL3 = '0xcA11bde05977b3631167028862bE2a173976CA11';

export function getMulticall(provider: providers.Provider) {
  return new Contract(MULTICALL3, Multicall3ABI, provider) as Multicall3;
}

async function executeStage<T>(
  calls: AggregateCall<T>[],
  aggregateResults: Record<string, T>,
  multicall: Multicall3,
  allowFailure: boolean,
  blockNumber?: number
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
          allowFailure: allowFailure,
          contract,
        };
      } catch (e) {
        throw new SyntaxError(`
Error in Multicall, attempting to encode: ${contract.address}#${c.method}(${c.args}):
${e}`);
      }
    });

  let callResults: Multicall3.ResultStructOutput[];
  try {
    // Batch up calls so that we don't overload multicall
    const batchedCalls = batchArray(aggregateCall, 750);
    callResults = (
      await Promise.all(
        batchedCalls.map((batch) =>
          multicall.callStatic.aggregate3(
            batch.filter((c) => c.target !== NO_OP) as Multicall3.Call3Struct[],
            {
              blockTag: blockNumber || 'latest',
            }
          )
        )
      )
    ).flatMap((_) => _);
  } catch (e) {
    throw new Error(`
Error executing Multicall: ${aggregateCall.map((c) =>
      JSON.stringify({
        address: c.contract?.address,
        method: c.method,
        args: c.args,
      })
    )}
${e}, blockNumber=${blockNumber}`);
  }

  const results = aggregateCall.reduce(
    (obj, { key, method, transform, contract, target, args }) => {
      let result: unknown;

      // If the target is a NO_OP then the value must be fetched from the transform
      if (target === NO_OP) {
        if (transform === undefined)
          throw Error('Undefined transform for NO_OP');
        result = transform(undefined, obj);
      } else {
        // Otherwise we get the first element from the array
        const [r, ...tmp] = callResults;
        callResults = tmp;

        if (allowFailure && !r.success) {
          console.warn(
            `Multicall failed ${blockNumber}, ${contract?.address}#${method}(${args})`
          );
          return obj;
        }

        if (r.returnData === undefined || contract === undefined)
          throw Error(
            `Decode result error, ${r}, ${key}, ${method}, ${target}`
          );

        try {
          const decoded = contract.interface.decodeFunctionResult(
            method,
            r.returnData
          );
          // For single return values, decodeFunctionResult still returns an
          // array which we eliminate here for simplicity
          result = decoded.length === 1 ? decoded[0] : decoded;
        } catch {
          if (allowFailure) {
            console.warn(
              `Decode result error, ${r}, ${key}, ${method}, ${target}`
            );
          } else {
            throw Error(
              `Decode result error, ${r}, ${key}, ${method}, ${target}`
            );
          }
        }
      }

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
  blockNumber?: number,
  allowFailure = false,
  _multicall?: Multicall3
) {
  const multicall = _multicall || getMulticall(provider);
  const stages = getStages(calls);
  let results = {} as Record<string, T>;

  for (const calls of stages) {
    ({ results } = await executeStage<T>(
      calls,
      results,
      multicall,
      allowFailure,
      blockNumber
    ));
  }

  // Use latest block here, the returned block number from multicall is not accurate
  // on arbitrum: https://developer.arbitrum.io/time#case-study-multicall
  const block = await provider.getBlock(blockNumber || 'latest');

  return { block, results };
}
