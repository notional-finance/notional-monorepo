import { Network } from '@notional-finance/util';
import {
  ConfigDefinition,
  SourceType,
  TableName,
  ProtocolName,
  Strategy,
} from '../../../types';
import {
  CurveGaugeABI,
  CurveGaugeControllerABI,
  CurvePoolTokenABI,
  CurvePoolV1ABI,
} from '@notional-finance/contracts';

export const configDefs: ConfigDefinition[] = [
  {
    sourceType: SourceType.Multicall,
    sourceConfig: {
      contractAddress: '0xc9b8a3fdecb9d5b218d02555a8baf332e5b740d5',
      contractABI: CurvePoolV1ABI,
      method: 'get_virtual_price',
    },
    tableName: TableName.GenericData,
    dataConfig: {
      strategyId: Strategy.Arb_Convex_USDC_FRAX,
      variable: 'USDC to FRAX exchange rate',
      decimals: 18,
    },
    network: Network.ArbitrumOne,
  },
  {
    sourceType: SourceType.Multicall,
    sourceConfig: {
      contractAddress: '0xc9b8a3fdecb9d5b218d02555a8baf332e5b740d5',
      contractABI: CurvePoolV1ABI,
      method: 'balances',
      args: [1],
    },
    tableName: TableName.GenericData,
    dataConfig: {
      strategyId: Strategy.Arb_Convex_USDC_FRAX,
      variable: 'USDC balance',
      decimals: 6,
    },
    network: Network.ArbitrumOne,
  },
  {
    sourceType: SourceType.Multicall,
    sourceConfig: {
      contractAddress: '0xc9b8a3fdecb9d5b218d02555a8baf332e5b740d5',
      contractABI: CurvePoolV1ABI,
      method: 'balances',
      args: [0],
    },
    tableName: TableName.GenericData,
    dataConfig: {
      strategyId: Strategy.Arb_Convex_USDC_FRAX,
      variable: 'FRAX balance',
      decimals: 18,
    },
    network: Network.ArbitrumOne,
  },
  {
    sourceType: SourceType.Multicall,
    sourceConfig: {
      contractAddress: '0xc9b8a3fdecb9d5b218d02555a8baf332e5b740d5',
      contractABI: CurvePoolTokenABI,
      method: 'totalSupply',
    },
    tableName: TableName.GenericData,
    dataConfig: {
      strategyId: Strategy.Arb_Convex_USDC_FRAX,
      variable: 'LP token Supply',
      decimals: 18,
    },
    network: Network.ArbitrumOne,
  },
  {
    sourceType: SourceType.Multicall,
    sourceConfig: {
      contractAddress: '0x95285Ea6fF14F80A2fD3989a6bAb993Bd6b5fA13',
      contractABI: CurveGaugeABI,
      method: 'totalSupply',
    },
    tableName: TableName.GenericData,
    dataConfig: {
      strategyId: Strategy.Arb_Convex_USDC_FRAX,
      variable: 'LP token Supply in Gauge',
      decimals: 18,
    },
    network: Network.ArbitrumOne,
  },
  {
    sourceType: SourceType.Multicall,
    sourceConfig: {
      contractAddress: '0x95285Ea6fF14F80A2fD3989a6bAb993Bd6b5fA13',
      contractABI: CurveGaugeABI,
      method: 'balanceOf',
      args: ['0x989AEb4d175e16225E39E87d0D97A3360524AD80'],
    },
    tableName: TableName.GenericData,
    dataConfig: {
      strategyId: Strategy.Arb_Convex_USDC_FRAX,
      variable: 'Convex LP token balance in Gauge',
      decimals: 18,
    },
    network: Network.ArbitrumOne,
  },
  {
    sourceType: SourceType.Multicall,
    sourceConfig: {
      contractAddress: '0x95285Ea6fF14F80A2fD3989a6bAb993Bd6b5fA13',
      contractABI: CurveGaugeABI,
      method: 'working_supply',
    },
    tableName: TableName.GenericData,
    dataConfig: {
      strategyId: Strategy.Arb_Convex_USDC_FRAX,
      variable: 'Working Supply',
      decimals: 18,
    },
    network: Network.ArbitrumOne,
  },
  {
    sourceType: SourceType.Multicall,
    sourceConfig: {
      contractAddress: '0x95285Ea6fF14F80A2fD3989a6bAb993Bd6b5fA13',
      contractABI: CurveGaugeABI,
      method: 'working_balances',
      args: ['0x989aeb4d175e16225e39e87d0d97a3360524ad80'],
    },
    tableName: TableName.GenericData,
    dataConfig: {
      strategyId: Strategy.Arb_Convex_USDC_FRAX,
      variable: 'Working Balance',
      decimals: 18,
    },
    network: Network.ArbitrumOne,
  },
  {
    sourceType: SourceType.Multicall,
    sourceConfig: {
      contractAddress: '0x2F50D538606Fa9EDD2B11E2446BEb18C9D5846bB',
      contractABI: CurveGaugeControllerABI,
      method: 'gauge_relative_weight(address)',
      args: ['0x95285Ea6fF14F80A2fD3989a6bAb993Bd6b5fA13'],
    },
    tableName: TableName.GenericData,
    dataConfig: {
      strategyId: Strategy.Arb_Convex_USDC_FRAX,
      variable: 'Gauge vote weight',
      decimals: 18,
    },
    network: Network.Mainnet,
  },
  {
    sourceType: SourceType.Subgraph,
    sourceConfig: {
      protocol: ProtocolName.Curve,
      query: 'CurveSwapFee.graphql',
      args: {
        poolId: '0xc9b8a3fdecb9d5b218d02555a8baf332e5b740d5',
      },
      transform: (r) =>
        r.liquidityPoolDailySnapshots[0].dailyProtocolSideRevenueUSD,
    },
    tableName: TableName.GenericData,
    dataConfig: {
      strategyId: Strategy.Arb_Convex_USDC_FRAX,
      variable: 'Swap fees',
      decimals: 0,
    },
    network: Network.ArbitrumOne,
  },
];
