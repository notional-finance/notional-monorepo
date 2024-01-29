import { Network } from '@notional-finance/util';
import { getCurveV1PoolConfig } from './ConvexPoolConfig';
import { ArbTokenConfig } from '..';
import { Strategy } from '../../../types';

export const Arb_Curve_Config = [
  getCurveV1PoolConfig(
    '0x7f90122BF0700F9E7e1F688fe926940E8839F353',
    '0xCE5F24B7A95e9cBa7df4B54E911B4A3Dc8CDAf6f',
    Network.ArbitrumOne,
    Strategy.Arb_Convex_USDC_USDT,
    [ArbTokenConfig['USDC_e'], ArbTokenConfig['USDT']]
  ),
].flatMap((_) => _);
