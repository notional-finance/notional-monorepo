import { Network } from '@notional-finance/util';
import {
  ConfigDefinition,
  SourceType,
  TableName,
  ProtocolName,
  Strategy,
} from '../types';

export const configDefs: ConfigDefinition[] = [
  {
    strategyId: Strategy.ArbConvexUSDCFRAX,
    variable: 'Swap fees',
    sourceType: SourceType.Subgraph,
    sourceConfig: {
      id: '0xc9b8a3fdecb9d5b218d02555a8baf332e5b740d5:SwapFee',
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
      decimals: 0,
    },
    network: Network.ArbitrumOne,
  },
];
