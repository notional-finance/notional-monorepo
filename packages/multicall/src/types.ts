import { Contract, utils } from 'ethers';

export const NO_OP = 'NO_OP';

export interface AggregateCall<T = unknown> {
  // Contract to target in the call
  target:
    | Contract
    | ((prevResults: Partial<Record<string, T>>) => Contract)
    | typeof NO_OP;
  // Function fragment to get the corresponding interface
  method: string | utils.FunctionFragment | typeof NO_OP;
  // Arguments to call the method with
  args?: unknown[] | ((prevResults: Partial<Record<string, T>>) => unknown[]);
  // Key to put the output of the transform
  key: string | string[];
  // Transform to apply to decoded result
  transform?: (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    callResult: any,
    prevResults: Partial<Record<string, T>>
  ) => unknown;
  // Allows multi-stage aggregate calls where results from the first
  // stage inform the second stage
  stage?: number;
}
