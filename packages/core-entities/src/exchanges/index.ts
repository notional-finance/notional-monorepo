import WeightedPool from './BalancerV2/weighted-pool';
import BaseLiquidityPool from './base-liquidity-pool';
import {
  Curve2TokenPoolV1,
  Curve2TokenPoolV1_SelfLPToken,
  Curve2TokenPoolV1_HasOracle,
  Curve2TokenPoolV1_SelfLPTokenNoAdmin,
  Curve3Pool,
} from './Curve/Curve2TokenPoolV1';
import Curve2TokenPoolV2 from './Curve/Curve2TokenPoolV2';
import { ComposableStablePool } from './BalancerV2/composable-stable-pool';
import { TokenBalance } from '../token-balance';
import { Network } from '@notional-finance/util';
import SNOTEWeightedPool from './BalancerV2/snote-weighted-pool';
import {
  PendleMarket,
  PendleMarketWithFixedSyToAssetExchangeRate,
} from './Pendle/PendleMarket';
import { Curve2TokenPoolNG } from './Curve/Curve2TokenPoolNG';
import {
  MorphoAdaptiveIRM,
  MorphoVariableMarket,
} from './Morpho/MorphoVariableMarket';
import { MidasPool } from './Midas/MidasPool';

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
  SNOTEWeightedPool: SNOTEWeightedPool,
  ComposableStablePool: ComposableStablePool,
  Curve2TokenPoolV1: Curve2TokenPoolV1,
  Curve2TokenPoolV1_SelfLPToken: Curve2TokenPoolV1_SelfLPToken,
  Curve2TokenPoolV1_SelfLPTokenNoAdmin: Curve2TokenPoolV1_SelfLPTokenNoAdmin,
  Curve2TokenPoolV1_HasOracle: Curve2TokenPoolV1_HasOracle,
  Curve2TokenPoolV2: Curve2TokenPoolV2,
  Curve3Pool: Curve3Pool,
  PendleMarket: PendleMarket,
  PendleMarketWithFixedSyToAssetExchangeRate:
    PendleMarketWithFixedSyToAssetExchangeRate,
  Curve2TokenPoolNG: Curve2TokenPoolNG,
  MorphoAdaptiveIRM: MorphoAdaptiveIRM,
  MidasPool: MidasPool,
};

export type LendingMarket = MorphoVariableMarket;

export {
  MorphoVariableMarket,
  MorphoAdaptiveIRM,
  WeightedPool,
  BaseLiquidityPool,
  ComposableStablePool,
  PoolClasses,
  PoolConstructor,
  Curve2TokenPoolV1,
  Curve2TokenPoolV2,
  Curve2TokenPoolV1_SelfLPTokenNoAdmin,
  Curve2TokenPoolV1_SelfLPToken,
  SNOTEWeightedPool,
  PendleMarket,
  Curve2TokenPoolNG,
  MidasPool,
};
