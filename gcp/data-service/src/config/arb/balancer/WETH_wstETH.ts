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
      contractAddress: '0x36bf227d6BaC96e2aB1EbB5492ECec69C691943f',
      contractABI: BalancerStablePoolABI,
      method: 'getLatest',
      args: [0],
    },
    tableName: TableName.GenericData,
    dataConfig: {
      strategyId: Strategy.Arb_Balancer_WETH_wstETH,
      variable: 'stETH to WETH exchange rate',
      decimals: 18,
    },
    network: Network.ArbitrumOne,
  },
  {
    sourceType: SourceType.Multicall,
    sourceConfig: {
      contractAddress: '0xBA12222222228d8Ba445958a75a0704d566BF2C8',
      contractABI: BalancerVaultABI,
      method: 'getPoolTokenInfo',
      args: [
        '0x36bf227d6bac96e2ab1ebb5492ecec69c691943f000200000000000000000316',
        '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
      ],
      outputIndices: [0],
    },
    tableName: TableName.GenericData,
    dataConfig: {
      strategyId: Strategy.Arb_Balancer_WETH_wstETH,
      variable: 'WETH balance',
      decimals: 18,
    },
    network: Network.ArbitrumOne,
  },
  {
    sourceType: SourceType.Multicall,
    sourceConfig: {
      contractAddress: '0xBA12222222228d8Ba445958a75a0704d566BF2C8',
      contractABI: BalancerVaultABI,
      method: 'getPoolTokenInfo',
      args: [
        '0x36bf227d6bac96e2ab1ebb5492ecec69c691943f000200000000000000000316',
        '0x5979D7b546E38E414F7E9822514be443A4800529',
      ],
      outputIndices: [0],
    },
    tableName: TableName.GenericData,
    dataConfig: {
      strategyId: Strategy.Arb_Balancer_WETH_wstETH,
      variable: 'wstETH balance',
      decimals: 18,
    },
    network: Network.ArbitrumOne,
  },
  {
    sourceType: SourceType.Multicall,
    sourceConfig: {
      contractAddress: '0x36bf227d6BaC96e2aB1EbB5492ECec69C691943f',
      contractABI: BalancerStablePoolABI,
      method: 'totalSupply',
    },
    tableName: TableName.GenericData,
    dataConfig: {
      strategyId: Strategy.Arb_Balancer_WETH_wstETH,
      variable: 'BPT Supply',
      decimals: 18,
    },
    network: Network.ArbitrumOne,
  },
  {
    sourceType: SourceType.Multicall,
    sourceConfig: {
      contractAddress: '0x8F0B53F3BA19Ee31C0A73a6F6D84106340fadf5f',
      contractABI: BalancerGaugeABI,
      method: 'totalSupply',
    },
    tableName: TableName.GenericData,
    dataConfig: {
      strategyId: Strategy.Arb_Balancer_WETH_wstETH,
      variable: 'BPT Supply in Gauge',
      decimals: 18,
    },
    network: Network.ArbitrumOne,
  },
  {
    sourceType: SourceType.Multicall,
    sourceConfig: {
      contractAddress: '0x8F0B53F3BA19Ee31C0A73a6F6D84106340fadf5f',
      contractABI: BalancerGaugeABI,
      method: 'balanceOf',
      args: ['0xc181edc719480bd089b94647c2dc504e2700a2b0'],
    },
    tableName: TableName.GenericData,
    dataConfig: {
      strategyId: Strategy.Arb_Balancer_WETH_wstETH,
      variable: 'Aura BPT balance in Gauge',
      decimals: 18,
    },
    network: Network.ArbitrumOne,
  },
  {
    sourceType: SourceType.Multicall,
    sourceConfig: {
      contractAddress: '0x8F0B53F3BA19Ee31C0A73a6F6D84106340fadf5f',
      contractABI: BalancerGaugeABI,
      method: 'working_supply',
    },
    tableName: TableName.GenericData,
    dataConfig: {
      strategyId: Strategy.Arb_Balancer_WETH_wstETH,
      variable: 'Working Supply',
      decimals: 18,
    },
    network: Network.ArbitrumOne,
  },
  {
    sourceType: SourceType.Multicall,
    sourceConfig: {
      contractAddress: '0x8F0B53F3BA19Ee31C0A73a6F6D84106340fadf5f',
      contractABI: BalancerGaugeABI,
      method: 'working_balances',
      args: ['0xc181edc719480bd089b94647c2dc504e2700a2b0'],
    },
    tableName: TableName.GenericData,
    dataConfig: {
      strategyId: Strategy.Arb_Balancer_WETH_wstETH,
      variable: 'Working Balance',
      decimals: 18,
    },
    network: Network.ArbitrumOne,
  },
  {
    sourceType: SourceType.Multicall,
    sourceConfig: {
      contractAddress: '0xC128468b7Ce63eA702C1f104D55A2566b13D3ABD',
      contractABI: BalancerGaugeControllerABI,
      method: 'gauge_relative_weight(address)',
      args: ['0xDf464348c4EC2Bf0e5D6926b9f707c8e02301adf'],
    },
    tableName: TableName.GenericData,
    dataConfig: {
      strategyId: Strategy.Arb_Balancer_WETH_wstETH,
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
          '0x36bf227d6bac96e2ab1ebb5492ecec69c691943f000200000000000000000316',
      },
      transform: (r) =>
        r.poolSnapshots[0].swapFees - r.poolSnapshots[1].swapFees,
    },
    tableName: TableName.GenericData,
    dataConfig: {
      strategyId: Strategy.Arb_Balancer_WETH_wstETH,
      variable: 'Swap fees',
      decimals: 0,
    },
    network: Network.ArbitrumOne,
  },
];
