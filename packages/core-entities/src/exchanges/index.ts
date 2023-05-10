import MetaStablePool from './BalancerV2/meta-stable-pool';
import WeightedPool from './BalancerV2/weighted-pool';
import BaseLiquidityPool from './base-liquidity-pool';
import {
  TwoTokenComposableStablePool,
  ThreeTokenComposableStablePool,
} from './BalancerV2/composable-stable-pool';
import { TokenBalance } from '../token-balance';
import { Network } from '@notional-finance/util';
import { fCashMarket } from './NotionalV3/fCash-market';

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
  fCashMarket: fCashMarket,
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
