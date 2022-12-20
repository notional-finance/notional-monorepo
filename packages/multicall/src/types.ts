import { Contract, utils } from 'ethers';

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
