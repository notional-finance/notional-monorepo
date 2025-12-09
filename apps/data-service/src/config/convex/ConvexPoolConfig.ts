import {
  CurvePoolV1ABI,
  CurvePoolTokenABI,
  CurveGaugeABI,
  CurveGaugeControllerABI,
} from '@notional-finance/contracts';
import { graphQueries } from '../../graphQueries';
import {
  ConfigDefinition,
  ProtocolName,
  SourceType,
  Strategy,
  TableName,
} from '../../types';
import { Network } from '@notional-finance/util';

const MainnetGaugeControllerAddress =
  '0x2F50D538606Fa9EDD2B11E2446BEb18C9D5846bB';
const ConvexLPHolderAddress = '0x989AEb4d175e16225E39E87d0D97A3360524AD80';

/**
 * @param poolAddress address of the curve pool, assumes it is also the LP token
 * @param curveGaugeAddress where LP deposits go for curve rewards
 * @param gaugeWeightAddress the mainnet address where voting is applied
 * @param network network of the pool address
 * @param strategyId id of the strategy
 * @param tokens tokens in the pool, in the same order as they appear for balances
 * @param additionalConfigs arbitrary additional configuration
 * @returns ConfigDefinition
 */
export function getCurveV1PoolConfig(
  poolAddress: string,
  curveGaugeAddress: string,
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
        contractABI: CurvePoolV1ABI,
        method: 'get_virtual_price',
      },
      tableName: TableName.GenericData,
      dataConfig: {
        strategyId,
        variable: 'Exchange rate',
        decimals: 18,
      },
      network,
    },
    ...tokens.map(({ symbol, decimals }, i) => ({
      sourceType: SourceType.Multicall,
      sourceConfig: {
        contractAddress: poolAddress,
        contractABI: CurvePoolV1ABI,
        method: 'balances',
        args: [i],
      },
      tableName: TableName.GenericData,
      dataConfig: {
        strategyId,
        variable: `${symbol} balance`,
        decimals,
      },
      network,
    })),
    {
      sourceType: SourceType.Multicall,
      sourceConfig: {
        contractAddress: poolAddress,
        contractABI: CurvePoolTokenABI,
        method: 'totalSupply',
      },
      tableName: TableName.GenericData,
      dataConfig: {
        strategyId,
        variable: 'LP token Supply',
        decimals: 18,
      },
      network,
    },
    {
      sourceType: SourceType.Multicall,
      sourceConfig: {
        contractAddress: curveGaugeAddress,
        contractABI: CurveGaugeABI,
        method: 'totalSupply',
      },
      tableName: TableName.GenericData,
      dataConfig: {
        strategyId,
        variable: 'LP token Supply in Gauge',
        decimals: 18,
      },
      network,
    },
    {
      sourceType: SourceType.Multicall,
      sourceConfig: {
        contractAddress: curveGaugeAddress,
        contractABI: CurveGaugeABI,
        method: 'balanceOf',
        args: [ConvexLPHolderAddress],
      },
      tableName: TableName.GenericData,
      dataConfig: {
        strategyId,
        variable: 'Convex LP token balance in Gauge',
        decimals: 18,
      },
      network,
    },
    {
      sourceType: SourceType.Multicall,
      sourceConfig: {
        contractAddress: curveGaugeAddress,
        contractABI: CurveGaugeABI,
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
        contractAddress: curveGaugeAddress,
        contractABI: CurveGaugeABI,
        method: 'working_balances',
        args: [ConvexLPHolderAddress],
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
        contractABI: CurveGaugeControllerABI,
        method: 'gauge_relative_weight(address)',
        args: [curveGaugeAddress],
      },
      tableName: TableName.GenericData,
      dataConfig: {
        strategyId,
        variable: 'Gauge vote weight',
        decimals: 18,
      },
      // This is always on mainnet
      network: Network.mainnet,
    },
    {
      sourceType: SourceType.Subgraph,
      sourceConfig: {
        protocol: ProtocolName.Curve,
        query: graphQueries.CurveSwapFee,
        args: {
          poolId: poolAddress.toLowerCase(),
        },
        transform: (r) =>
          r.liquidityPoolDailySnapshots.length > 0
            ? r.liquidityPoolDailySnapshots[0].dailyProtocolSideRevenueUSD
            : 0,
      },
      tableName: TableName.GenericData,
      dataConfig: {
        strategyId,
        variable: 'Swap fees',
        decimals: 0,
      },
      network,
    },
    ...additionalConfigs,
  ];
}
