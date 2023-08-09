import {
  BalancerVaultABI,
  BalancerGaugeABI,
  BalancerGaugeControllerABI,
  BalancerBoostedPoolABI,
} from '@notional-finance/contracts';
import { Network } from '@notional-finance/util';
import {
  ConfigDefinition,
  SourceType,
  TableName,
  ProtocolName,
  Strategy,
} from '../../../types';

export const configDefs: ConfigDefinition[] = [
  {
    sourceType: SourceType.Multicall,
    sourceConfig: {
      contractAddress: '0xBA12222222228d8Ba445958a75a0704d566BF2C8',
      contractABI: BalancerVaultABI,
      method: 'getPoolTokenInfo',
      args: [
        '0xfebb0bbf162e64fb9d0dfe186e517d84c395f016000000000000000000000502',
        '0xcbfa4532d8b2ade2c261d3dd5ef2a2284f792692',
      ],
      outputIndices: [0],
    },
    tableName: TableName.GenericData,
    dataConfig: {
      strategyId: Strategy.Eth_Balancer_AaveV3_Boosted,
      variable: 'bbaUsdcBalance',
      decimals: 18,
    },
    network: Network.Mainnet,
  },
  {
    sourceType: SourceType.Multicall,
    sourceConfig: {
      contractAddress: '0xBA12222222228d8Ba445958a75a0704d566BF2C8',
      contractABI: BalancerVaultABI,
      method: 'getPoolTokenInfo',
      args: [
        '0xfebb0bbf162e64fb9d0dfe186e517d84c395f016000000000000000000000502',
        '0xa1697f9af0875b63ddc472d6eebada8c1fab8568',
      ],
      outputIndices: [0],
    },
    tableName: TableName.GenericData,
    dataConfig: {
      strategyId: Strategy.Eth_Balancer_AaveV3_Boosted,
      variable: 'bbaUsdtBalance',
      decimals: 18,
    },
    network: Network.Mainnet,
  },
  {
    sourceType: SourceType.Multicall,
    sourceConfig: {
      contractAddress: '0xBA12222222228d8Ba445958a75a0704d566BF2C8',
      contractABI: BalancerVaultABI,
      method: 'getPoolTokenInfo',
      args: [
        '0xfebb0bbf162e64fb9d0dfe186e517d84c395f016000000000000000000000502',
        '0x6667c6fa9f2b3fc1cc8d85320b62703d938e4385',
      ],
      outputIndices: [0],
    },
    tableName: TableName.GenericData,
    dataConfig: {
      strategyId: Strategy.Eth_Balancer_AaveV3_Boosted,
      variable: 'bbaDaiBalance',
      decimals: 18,
    },
    network: Network.Mainnet,
  },
  {
    sourceType: SourceType.Multicall,
    sourceConfig: {
      contractAddress: '0xfeBb0bbf162E64fb9D0dfe186E517d84C395f016',
      contractABI: BalancerBoostedPoolABI,
      method: 'getActualSupply',
    },
    tableName: TableName.GenericData,
    dataConfig: {
      strategyId: Strategy.Eth_Balancer_AaveV3_Boosted,
      variable: 'BPT Supply',
      decimals: 18,
    },
    network: Network.Mainnet,
  },
  {
    sourceType: SourceType.Multicall,
    sourceConfig: {
      contractAddress: '0x0052688295413b32626D226a205b95cDB337DE86',
      contractABI: BalancerGaugeABI,
      method: 'totalSupply',
    },
    tableName: TableName.GenericData,
    dataConfig: {
      strategyId: Strategy.Eth_Balancer_AaveV3_Boosted,
      variable: 'BPT Supply in Gauge',
      decimals: 18,
    },
    network: Network.Mainnet,
  },
  {
    sourceType: SourceType.Multicall,
    sourceConfig: {
      contractAddress: '0x0052688295413b32626D226a205b95cDB337DE86',
      contractABI: BalancerGaugeABI,
      method: 'balanceOf',
      args: ['0xaf52695e1bb01a16d33d7194c28c42b10e0dbec2'],
    },
    tableName: TableName.GenericData,
    dataConfig: {
      strategyId: Strategy.Eth_Balancer_AaveV3_Boosted,
      variable: 'Aura BPT balance in Gauge',
      decimals: 18,
    },
    network: Network.Mainnet,
  },
  {
    sourceType: SourceType.Multicall,
    sourceConfig: {
      contractAddress: '0x0052688295413b32626D226a205b95cDB337DE86',
      contractABI: BalancerGaugeABI,
      method: 'working_supply',
    },
    tableName: TableName.GenericData,
    dataConfig: {
      strategyId: Strategy.Eth_Balancer_AaveV3_Boosted,
      variable: 'Working Supply',
      decimals: 18,
    },
    network: Network.Mainnet,
  },
  {
    sourceType: SourceType.Multicall,
    sourceConfig: {
      contractAddress: '0x0052688295413b32626D226a205b95cDB337DE86',
      contractABI: BalancerGaugeABI,
      method: 'working_balances',
      args: ['0xaf52695e1bb01a16d33d7194c28c42b10e0dbec2'],
    },
    tableName: TableName.GenericData,
    dataConfig: {
      strategyId: Strategy.Eth_Balancer_AaveV3_Boosted,
      variable: 'Working Balance',
      decimals: 18,
    },
    network: Network.Mainnet,
  },
  {
    sourceType: SourceType.Multicall,
    sourceConfig: {
      contractAddress: '0xC128468b7Ce63eA702C1f104D55A2566b13D3ABD',
      contractABI: BalancerGaugeControllerABI,
      method: 'gauge_relative_weight(address)',
      args: ['0x0052688295413b32626D226a205b95cDB337DE86'],
    },
    tableName: TableName.GenericData,
    dataConfig: {
      strategyId: Strategy.Eth_Balancer_AaveV3_Boosted,
      variable: 'Gauge vote weight',
      decimals: 18,
    },
    network: Network.Mainnet,
  },
  {
    sourceType: SourceType.Subgraph,
    sourceConfig: {
      protocol: ProtocolName.BalancerV2,
      query: 'BalancerV2SwapFee.graphql',
      args: {
        poolId:
          '0xfebb0bbf162e64fb9d0dfe186e517d84c395f016000000000000000000000502',
      },
      transform: (r) =>
        r.poolSnapshots[0].swapFees - r.poolSnapshots[1].swapFees,
    },
    tableName: TableName.GenericData,
    dataConfig: {
      strategyId: Strategy.Eth_Balancer_AaveV3_Boosted,
      variable: 'Swap fees',
      decimals: 0,
    },
    network: Network.Mainnet,
  },
];
