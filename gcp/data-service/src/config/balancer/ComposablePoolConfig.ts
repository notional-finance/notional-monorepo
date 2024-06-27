import {
  BalancerVaultABI,
  BalancerGaugeABI,
  BalancerGaugeControllerABI,
  BalancerBoostedPoolABI,
} from '@notional-finance/contracts';
import { Network } from '@notional-finance/util';
import { graphQueries } from '../../graphQueries';
import {
  ConfigDefinition,
  ProtocolName,
  SourceType,
  Strategy,
  TableName,
} from '../../types';

const BalancerVault = '0xBA12222222228d8Ba445958a75a0704d566BF2C8';
// NOTE: this controller is always called on mainnet
const MainnetGaugeControllerAddress =
  '0xC128468b7Ce63eA702C1f104D55A2566b13D3ABD';
const AuraLPHolderAddress = (network: Network) =>
  network === Network.arbitrum
    ? '0xC181Edc719480bd089b94647c2Dc504e2700a2B0'
    : network === Network.mainnet
    ? '0xaF52695E1bB01A16D33D7194C28C42b10e0Dbec2'
    : '0x';

/**
 * @param poolId balancer id of the pool
 * @param poolAddress address of the pool
 * @param balancerGaugeAddress where LP deposits go for curve rewards
 * @param gaugeWeightAddress the mainnet address where voting is applied
 * @param network network of the pool address
 * @param strategyId id of the strategy
 * @param tokens tokens in the pool
 * @param additionalConfigs arbitrary additional configuration
 * @returns ConfigDefinition
 */
export function getComposablePoolConfig(
  poolId: string,
  poolAddress: string,
  balancerGaugeAddress: string,
  gaugeWeightAddress: string,
  network: Network,
  strategyId: Strategy,
  tokens: { address: string; symbol: string; decimals: number }[],
  additionalConfigs: ConfigDefinition[] = []
): ConfigDefinition[] {
  return [
    {
      sourceType: SourceType.Multicall,
      sourceConfig: {
        contractAddress: poolAddress,
        contractABI: BalancerBoostedPoolABI,
        method: 'getActualSupply',
      },
      tableName: TableName.GenericData,
      dataConfig: {
        strategyId,
        variable: 'BPT Supply',
        decimals: 18,
      },
      network,
    },
    {
      sourceType: SourceType.Multicall,
      sourceConfig: {
        contractAddress: balancerGaugeAddress,
        contractABI: BalancerGaugeABI,
        method: 'totalSupply',
      },
      tableName: TableName.GenericData,
      dataConfig: {
        strategyId,
        variable: 'BPT Supply in Gauge',
        decimals: 18,
      },
      network,
    },
    {
      sourceType: SourceType.Multicall,
      sourceConfig: {
        contractAddress: AuraLPHolderAddress(network),
        contractABI: BalancerGaugeABI,
        method: 'balanceOfPool',
        args: [balancerGaugeAddress],
      },
      tableName: TableName.GenericData,
      dataConfig: {
        strategyId,
        variable: 'Aura BPT balance in Gauge',
        decimals: 18,
      },
      network,
    },
    {
      sourceType: SourceType.Multicall,
      sourceConfig: {
        contractAddress: balancerGaugeAddress,
        contractABI: BalancerGaugeABI,
        method: 'working_supply',
      },
      tableName: TableName.GenericData,
      dataConfig: {
        strategyId,
        variable: 'Working Supply',
        decimals: 18,
      },
      network,
    },
    {
      sourceType: SourceType.Multicall,
      sourceConfig: {
        contractAddress: balancerGaugeAddress,
        contractABI: BalancerGaugeABI,
        method: 'working_balances',
        args: [AuraLPHolderAddress(network)],
      },
      tableName: TableName.GenericData,
      dataConfig: {
        strategyId,
        variable: 'Working Balance',
        decimals: 18,
      },
      network,
    },
    {
      sourceType: SourceType.Multicall,
      sourceConfig: {
        contractAddress: MainnetGaugeControllerAddress,
        contractABI: BalancerGaugeControllerABI,
        method: 'gauge_relative_weight(address)',
        args: [gaugeWeightAddress],
      },
      tableName: TableName.GenericData,
      dataConfig: {
        strategyId,
        variable: 'Gauge vote weight',
        decimals: 18,
      },
      // NOTE: this is always on mainnet
      network: Network.mainnet,
    },
    {
      sourceType: SourceType.Subgraph,
      sourceConfig: {
        protocol: ProtocolName.BalancerV2,
        query: graphQueries.BalancerV2SwapFee,
        args: { poolId: poolId.toLowerCase() },
        transform: (r) =>
          r.poolSnapshots[0].swapFees - r.poolSnapshots[1].swapFees,
      },
      tableName: TableName.GenericData,
      dataConfig: {
        strategyId,
        variable: 'Swap fees',
        decimals: 0,
      },
      network,
    },
    ...tokens.map(({ address, symbol, decimals }) => ({
      sourceType: SourceType.Multicall,
      sourceConfig: {
        contractAddress: BalancerVault,
        contractABI: BalancerVaultABI,
        method: 'getPoolTokenInfo',
        args: [poolId, address],
        outputIndices: [0],
      },
      tableName: TableName.GenericData,
      dataConfig: {
        strategyId,
        variable: `${symbol} balance`,
        decimals,
      },
      network,
    })),
    ...additionalConfigs,
  ];
}

export function getComposablePoolConfigNoAura(
  poolId: string,
  poolAddress: string,
  network: Network,
  strategyId: Strategy,
  tokens: { address: string; symbol: string; decimals: number }[],
  additionalConfigs: ConfigDefinition[] = []
): ConfigDefinition[] {
  return [
    {
      sourceType: SourceType.Multicall,
      sourceConfig: {
        contractAddress: poolAddress,
        contractABI: BalancerBoostedPoolABI,
        method: 'getActualSupply',
      },
      tableName: TableName.GenericData,
      dataConfig: {
        strategyId,
        variable: 'BPT Supply',
        decimals: 18,
      },
      network,
    },
    {
      sourceType: SourceType.Subgraph,
      sourceConfig: {
        protocol: ProtocolName.BalancerV2,
        query: graphQueries.BalancerV2SwapFee,
        args: { poolId: poolId.toLowerCase() },
        transform: (r) =>
          r.poolSnapshots[0].swapFees - r.poolSnapshots[1].swapFees,
      },
      tableName: TableName.GenericData,
      dataConfig: {
        strategyId,
        variable: 'Swap fees',
        decimals: 0,
      },
      network,
    },
    ...tokens.map(({ address, symbol, decimals }) => ({
      sourceType: SourceType.Multicall,
      sourceConfig: {
        contractAddress: BalancerVault,
        contractABI: BalancerVaultABI,
        method: 'getPoolTokenInfo',
        args: [poolId, address],
        outputIndices: [0],
      },
      tableName: TableName.GenericData,
      dataConfig: {
        strategyId,
        variable: `${symbol} balance`,
        decimals,
      },
      network,
    })),
    ...additionalConfigs,
  ];
}
