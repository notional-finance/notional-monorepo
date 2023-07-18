import { AggregateCall } from '@notional-finance/multicall';
import { Network } from '@notional-finance/util';
import { Knex } from 'knex';

export enum SourceType {
  Multicall = 'multicall',
  Subgraph = 'subgraph',
}

export interface MulticallConfig {
  contractAddress: string;
  contractABI: any;
  method: string;
  args?: unknown[];
}

export interface SubgraphConfig {
  query: string;
}

export interface GenericDataConfig {
  decimals: number;
}

export interface ConfigDefinition {
  id: string;
  sourceType: SourceType;
  sourceConfig: MulticallConfig | SubgraphConfig;
  dataWriter: IDataWriter;
  dataConfig: GenericDataConfig;
  networkOverride?: Network;
}

export interface MulticallOperation {
  configDef: ConfigDefinition;
  aggregateCall: AggregateCall;
}

export interface DataOperations {
  aggregateCalls: Map<Network, MulticallOperation[]>;
}

export interface IDataWriter {
  write(db: Knex, configDef: ConfigDefinition, data: unknown): Promise<void>;
}
