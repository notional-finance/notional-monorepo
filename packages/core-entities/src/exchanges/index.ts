import WeightedPool from './BalancerV2/weighted-pool';
import BaseLiquidityPool from './base-liquidity-pool';
import {
  Curve2TokenPoolV1,
  Curve2TokenPoolV1_SelfLPToken,
  Curve2TokenPoolV1_HasOracle,
  Curve2TokenPoolV1_SelfLPTokenNoAdmin,
} from './Curve/Curve2TokenPoolV1';
import Curve2TokenPoolV2 from './Curve/Curve2TokenPoolV2';
import { ComposableStablePool } from './BalancerV2/composable-stable-pool';
import { TokenBalance } from '../token-balance';
import { Network } from '@notional-finance/util';
import { fCashMarket } from './NotionalV3/fCash-market';
import { BaseNotionalMarket } from './NotionalV3/BaseNotionalMarket';
import { pCashMarket } from './NotionalV3/pCash-market';

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
  WeightedPool: WeightedPool,
  fCashMarket: fCashMarket,
  ComposableStablePool: ComposableStablePool,
  Curve2TokenPoolV1: Curve2TokenPoolV1,
  Curve2TokenPoolV1_SelfLPToken: Curve2TokenPoolV1_SelfLPToken,
  Curve2TokenPoolV1_SelfLPTokenNoAdmin: Curve2TokenPoolV1_SelfLPTokenNoAdmin,
  Curve2TokenPoolV1_HasOracle: Curve2TokenPoolV1_HasOracle,
  Curve2TokenPoolV2: Curve2TokenPoolV2,
};

export {
  WeightedPool,
  BaseLiquidityPool,
  ComposableStablePool,
  fCashMarket,
  PoolClasses,
  PoolConstructor,
  Curve2TokenPoolV1,
  Curve2TokenPoolV2,
  BaseNotionalMarket,
  pCashMarket,
};
