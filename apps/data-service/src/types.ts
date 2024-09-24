import { AggregateCall } from '@notional-finance/multicall';
import { Network } from '@notional-finance/util';
import { DocumentNode } from 'graphql';
import { Knex } from 'knex';

export enum BackfillType {
  OracleData = 1,
  GenericData = 2,
  YieldData = 3,
}

export enum SourceType {
  Multicall = 'multicall',
  Subgraph = 'subgraph',
}

export enum TableName {
  VaultAPY = 'vault_apy',
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
  Arb_Balancer_USDC_USDC_e_DAI_USDT = 11,
  Arb_Balancer_rETH_WETH = 12,
  Arb_Balancer_wstETH_bb_a_WETH = 13,
  Arb_Convex_USDC_FRAX = 14,
  Arb_Balancer_wstETH_rETH_cbETH = 15,
  Arb_Balancer_wstETH_WETH = 16,
  Arb_Balancer_RDNT_WETH = 17,
  Arb_Convex_USDC_USDT = 18,
  Eth_Convex_USDC_crvUSD = 19,
  Eth_Convex_USDT_crvUSD = 20,
  Eth_Convex_USDC_pyUSD = 21,
  Eth_Balancer_USDC_GHO_USDT = 22,
  Eth_Balancer_rETH_weETH = 23,
  Arb_Convex_crvUSD_USDC = 24,
  Arb_Convex_crvUSD_USDT = 25,
  Eth_Balancer_ezETH_WETH = 26,
  Arb_Balancer_ezETH_wstETH = 27,
  Eth_Curve_USDe_USDC = 28,
  Arb_Convex_WBTC_tBTC = 29,
  Eth_Convex_GHO_crvUSD = 30,
  Eth_Curve_GHO_USDe = 31,
  Eth_Balancer_rsETH_WETH = 32,
  Arb_Balancer_rsETH_WETH = 33,
  Arb_Balancer_cbETH_rETH_wstETH = 34,
}

export interface MulticallConfig {
  contractAddress: string;
  contractABI: any;
  method: string;
  args?: unknown[];
  outputIndices?: number[];
  firstBlock?: number;
  finalBlock?: number;
  transform?: (
    callResult: any,
    prevResults: Partial<Record<string, unknown>>
  ) => unknown;
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

export interface VaultAPYConfig {
  decimals: number;
}

export interface ConfigDefinition {
  sourceType: SourceType;
  sourceConfig: MulticallConfig | SubgraphConfig;
  tableName: TableName;
  dataConfig: GenericDataConfig | TokenDataConfig;
  network: Network;
}

export interface ConfigFilter {
  include: GenericDataConfig[];
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

export interface IDataWriter<K = DataRow> {
  write(db: Knex, context: DataContext, rows: K[]): Promise<any>;
}

export interface VaultAccount {
  accountId: string;
  vaultId: string;
}

export interface VaultAPY {
  blockNumber: number;
  timestamp: number;
  vaultAddress: string;
  totalLpTokens: string;
  lpTokenValuePrimaryBorrow: string;
  rewardToken: string;
  rewardTokensClaimed: string;
  rewardTokenValuePrimaryBorrow: string;
  noVaultShares: boolean;
  swapFees: number;
  rewardTokenSymbol: string;
}

export interface ReinvestmentTrade {
  timestamp: number;
  vaultAddress: string;
  txHash: string;
  buyToken: string;
  sellToken: string;
  buyTokenAmount: string;
  sellTokenAmount: string;
  buyTokenPrice: string;
  sellTokenPrice: string;
  lossPercentage: string;
}

type DataServiceAccountContextUpdate = {
  name: 'AccountContextUpdate';
  params: {
    account: string;
  };
};

type DataServiceTransferBatch = {
  name: 'TransferBatch';
  params: {
    operator: string;
    from: string;
    to: string;
    ids: string[];
    values: string[];
  };
};
type DataServiceTransferSingle = {
  name: 'TransferSingle';
  params: {
    operator: string;
    from: string;
    to: string;
    id: string;
    value: string;
  };
};

export type DataServiceEvent =
  | DataServiceTransferSingle
  | DataServiceTransferBatch
  | DataServiceAccountContextUpdate;
