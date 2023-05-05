import MetaStablePool from './BalancerV2/MetaStablePool';
import WeightedPool from './BalancerV2/WeightedPool';
import BaseLiquidityPool from './BaseLiquidityPool';
import {
  TwoTokenComposableStablePool,
  ThreeTokenComposableStablePool,
} from './BalancerV2/ComposableStablePool';
import { TokenBalance } from '../tokens/TokenBalance';
import { Network } from '..';

type PoolConstructor = new (
  network: Network,
  balances: TokenBalance[],
  totalSupply: TokenBalance,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  poolParams: any
) => BaseLiquidityPool<unknown>;

const PoolClasses: Record<
  string,
  typeof BaseLiquidityPool<unknown> & PoolConstructor
> = {
  MetaStablePool: MetaStablePool,
  WeightedPool: WeightedPool,
  TwoTokenComposableStablePool: TwoTokenComposableStablePool,
  ThreeTokenComposableStablePool: ThreeTokenComposableStablePool,
};

export {
  MetaStablePool,
  WeightedPool,
  BaseLiquidityPool,
  TwoTokenComposableStablePool,
  ThreeTokenComposableStablePool,
  PoolClasses,
  PoolConstructor,
};
