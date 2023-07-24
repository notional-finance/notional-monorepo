import { AggregateCall } from '@notional-finance/multicall';
import { Network } from '@notional-finance/util';
import { DocumentNode } from 'graphql';
import { Knex } from 'knex';

export enum SourceType {
  Multicall = 'multicall',
  Subgraph = 'subgraph',
}

export enum TableName {
  GenericData = 'generic_data',
}

export enum ProtocolName {
  BalancerV2 = 'BalancerV2',
  Curve = 'Curve',
}

export interface MulticallConfig {
  contractAddress: string;
  contractABI: any;
  method: string;
  args?: unknown[];
  outputIndices?: number[];
}

export interface SubgraphConfig {
  id: string;
  protocol: ProtocolName;
  query: string;
  args?: Record<string, unknown>;
  transform?: (r: any) => unknown;
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

export interface SubgraphOperation {
  configDef: ConfigDefinition;
  subgraphQuery: DocumentNode;
  endpoint: string;
}

export interface DataOperations {
  aggregateCalls: Map<Network, MulticallOperation[]>;
  subgraphCalls: Map<Network, SubgraphOperation[]>;
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
  value: any;
}

export interface DataContext {
  tableName: string;
  timestamp: number;
}

export interface IDataWriter {
  write(db: Knex, context: DataContext, rows: DataRow[]): Promise<void>;
}
