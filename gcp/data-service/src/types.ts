import { AggregateCall } from '@notional-finance/multicall';
import { Network } from '@notional-finance/util';
import { Knex } from 'knex';

export enum SourceType {
  Multicall = 'multicall',
  Subgraph = 'subgraph',
}

export enum TableName {
  GenericData = 'generic_data',
}

export interface MulticallConfig {
  contractAddress: string;
  contractABI: any;
  method: string;
  args?: unknown[];
  outputIndices?: number[];
}

export interface SubgraphConfig {
  query: string;
}

export interface GenericDataConfig {
  decimals: number;
}

export interface ConfigDefinition {
  sourceType: SourceType;
  sourceConfig: MulticallConfig | SubgraphConfig;
  tableName: TableName;
  dataConfig: GenericDataConfig;
  network: Network;
}

export interface MulticallOperation {
  configDef: ConfigDefinition;
  aggregateCall: AggregateCall;
}

export interface DataOperations {
  aggregateCalls: Map<Network, MulticallOperation[]>;
}

export interface DataWriterConfig {
  tableName: TableName;
  dataWriter: IDataWriter;
}

export interface DataRow {
  id: string;
  dataConfig: GenericDataConfig;
  blockNumber: number;
  networkId: number;
  contractAddress?: string;
  method?: string;
  value: unknown;
}

export interface DataContext {
  tableName: string;
  timestamp: number;
}

export interface IDataWriter {
  write(db: Knex, context: DataContext, rows: DataRow[]): Promise<void>;
}
