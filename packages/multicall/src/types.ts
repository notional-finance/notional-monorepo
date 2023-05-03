import { Contract, utils } from 'ethers';

export interface AggregateCall<T = Record<string, unknown>> {
  // Contract to target in the call
  target: Contract | ((prevResults: Partial<T>) => Contract);
  // Function fragment to get the corresponding interface
  method: string | utils.FunctionFragment;
  // Arguments to call the method with
  args?: unknown[] | ((prevResults: Partial<T>) => unknown[]);
  // Key to put the output of the transform
  key: string | string[];
  // Transform to apply to decoded result
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  transform?: (callResult: any, prevResults: Partial<T>) => unknown;
  // Allows multi-stage aggregate calls where results from the first
  // stage inform the second stage
  stage?: number;
}
