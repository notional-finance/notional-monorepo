import { AggregateCall } from '@notional-finance/multicall';
import { Network } from '@notional-finance/util';
import { DocumentNode } from 'graphql';
import { Knex } from 'knex';

export enum BackfillType {
  OracleData = 1,
  GenericData = 2,
}

export enum SourceType {
  Multicall = 'multicall',
  Subgraph = 'subgraph',
}

export enum TableName {
  GenericData = 'generic_data',
  TokenData = 'token_data',
}

export enum ProtocolName {
  NotionalV3 = 'NotionalV3',
  BalancerV2 = 'BalancerV2',
  Curve = 'Curve',
}

export enum Strategy {
  Generic = 1,
  Eth_Balancer_WETH_wstETH = 2,
  Eth_Balancer_AaveV3_Boosted = 3,
  Eth_Balancer_WETH_rETH = 4,
  Eth_Balancer_cbETH_wstETH = 5,
  Eth_Balancer_cbETH_bb_a_WETH = 6,
  Eth_Balancer_RPL_rETH = 7,
  Eth_Balancer_LDO_wstETH = 8,
  Eth_Balancer_OHM_LUSD = 9,
  Arb_Balancer_WETH_wstETH = 10,
  Arb_Balancer_Aave_V3Boosted = 11,
  Arb_Balancer_rETHb_baWETH = 12,
  Arb_Balancer_wstETH_bb_a_WETH = 13,
  Arb_Convex_USDC_FRAX = 14,
}

export interface MulticallConfig {
  contractAddress: string;
  contractABI: any;
  method: string;
  args?: unknown[];
  outputIndices?: number[];
}

export interface SubgraphConfig {
  protocol: ProtocolName;
  query: string;
  args?: Record<string, unknown>;
  transform?: (r: any) => unknown;
}

export interface GenericDataConfig {
  strategyId: number;
  variable: string;
  decimals: number;
}

export interface TokenDataConfig {
  decimals: number;
}

export interface ConfigDefinition {
  sourceType: SourceType;
  sourceConfig: MulticallConfig | SubgraphConfig;
  tableName: TableName;
  dataConfig: GenericDataConfig | TokenDataConfig;
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
  dataConfig: GenericDataConfig | TokenDataConfig;
  blockNumber: number;
  networkId: number;
  contractAddress?: string;
  method?: string;
  value: any;
}

export interface DataContext {
  tableName: string;
  timestamp: number;
  mergeConflicts: boolean;
}

export interface IDataWriter {
  write(db: Knex, context: DataContext, rows: DataRow[]): Promise<void>;
}

export interface VaultAccount {
  accountId: string;
  vaultId: string;
}
