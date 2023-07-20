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
  tableName: TableName;
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

export interface DataWriterConfig {
  tableName: TableName;
  dataWriter: IDataWriter;
}

export interface DataRow {
  id: string;
  sourceConfig: MulticallConfig;
  dataConfig: GenericDataConfig;
  value: unknown;
}

export interface DataContext {
  tableName: string;
  networkId: number;
  timestamp: number;
  blockNumber: number;
}

export interface IDataWriter {
  write(db: Knex, context: DataContext, rows: DataRow[]): Promise<void>;
}
