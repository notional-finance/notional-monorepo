import {
  BalancerStablePoolABI,
  BalancerVaultABI,
  BalancerGaugeABI,
  BalancerGaugeControllerABI,
} from '@notional-finance/contracts';
import { Network } from '@notional-finance/util';
import {
  ConfigDefinition,
  SourceType,
  TableName,
  ProtocolName,
  Strategy,
} from '../../../types';
import { graphQueries } from '../../../graphQueries';

export const configDefs: ConfigDefinition[] = [
  {
    sourceType: SourceType.Multicall,
    sourceConfig: {
      contractAddress: '0x32296969ef14eb0c6d29669c550d4a0449130230',
      contractABI: BalancerStablePoolABI,
      method: 'getLatest',
      args: [0],
    },
    tableName: TableName.GenericData,
    dataConfig: {
      strategyId: Strategy.Eth_Balancer_WETH_wstETH,
      variable: 'stETH to WETH exchange rate',
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
        '0x32296969ef14eb0c6d29669c550d4a0449130230000200000000000000000080',
        '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
      ],
      outputIndices: [0],
    },
    tableName: TableName.GenericData,
    dataConfig: {
      strategyId: Strategy.Eth_Balancer_WETH_wstETH,
      variable: 'WETH balance',
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
        '0x32296969ef14eb0c6d29669c550d4a0449130230000200000000000000000080',
        '0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0',
      ],
      outputIndices: [0],
    },
    tableName: TableName.GenericData,
    dataConfig: {
      strategyId: Strategy.Eth_Balancer_WETH_wstETH,
      variable: 'wstETH balance',
      decimals: 18,
    },
    network: Network.Mainnet,
  },
  {
    sourceType: SourceType.Multicall,
    sourceConfig: {
      contractAddress: '0x32296969ef14eb0c6d29669c550d4a0449130230',
      contractABI: BalancerStablePoolABI,
      method: 'totalSupply',
    },
    tableName: TableName.GenericData,
    dataConfig: {
      strategyId: Strategy.Eth_Balancer_WETH_wstETH,
      variable: 'BPT Supply',
      decimals: 18,
    },
    network: Network.Mainnet,
  },
  {
    sourceType: SourceType.Multicall,
    sourceConfig: {
      contractAddress: '0xcD4722B7c24C29e0413BDCd9e51404B4539D14aE',
      contractABI: BalancerGaugeABI,
      method: 'totalSupply',
    },
    tableName: TableName.GenericData,
    dataConfig: {
      strategyId: Strategy.Eth_Balancer_WETH_wstETH,
      variable: 'BPT Supply in Gauge',
      decimals: 18,
    },
    network: Network.Mainnet,
  },
  {
    sourceType: SourceType.Multicall,
    sourceConfig: {
      contractAddress: '0xcD4722B7c24C29e0413BDCd9e51404B4539D14aE',
      contractABI: BalancerGaugeABI,
      method: 'balanceOf',
      args: ['0xaf52695e1bb01a16d33d7194c28c42b10e0dbec2'],
    },
    tableName: TableName.GenericData,
    dataConfig: {
      strategyId: Strategy.Eth_Balancer_WETH_wstETH,
      variable: 'Aura BPT balance in Gauge',
      decimals: 18,
    },
    network: Network.Mainnet,
  },
  {
    sourceType: SourceType.Multicall,
    sourceConfig: {
      contractAddress: '0xcD4722B7c24C29e0413BDCd9e51404B4539D14aE',
      contractABI: BalancerGaugeABI,
      method: 'working_supply',
    },
    tableName: TableName.GenericData,
    dataConfig: {
      strategyId: Strategy.Eth_Balancer_WETH_wstETH,
      variable: 'Working Supply',
      decimals: 18,
    },
    network: Network.Mainnet,
  },
  {
    sourceType: SourceType.Multicall,
    sourceConfig: {
      contractAddress: '0xcD4722B7c24C29e0413BDCd9e51404B4539D14aE',
      contractABI: BalancerGaugeABI,
      method: 'working_balances',
      args: ['0xaf52695e1bb01a16d33d7194c28c42b10e0dbec2'],
    },
    tableName: TableName.GenericData,
    dataConfig: {
      strategyId: Strategy.Eth_Balancer_WETH_wstETH,
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
      args: ['0xcD4722B7c24C29e0413BDCd9e51404B4539D14aE'],
    },
    tableName: TableName.GenericData,
    dataConfig: {
      strategyId: Strategy.Eth_Balancer_WETH_wstETH,
      variable: 'Gauge vote weight',
      decimals: 18,
    },
    network: Network.Mainnet,
  },
  {
    sourceType: SourceType.Subgraph,
    sourceConfig: {
      protocol: ProtocolName.BalancerV2,
      query: graphQueries.BalancerV2SwapFee,
      args: {
        poolId:
          '0x32296969ef14eb0c6d29669c550d4a0449130230000200000000000000000080',
      },
      transform: (r) =>
        r.poolSnapshots[0].swapFees - r.poolSnapshots[1].swapFees,
    },
    tableName: TableName.GenericData,
    dataConfig: {
      strategyId: Strategy.Eth_Balancer_WETH_wstETH,
      variable: 'Swap fees',
      decimals: 0,
    },
    network: Network.Mainnet,
  },
];
