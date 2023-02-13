import { Network } from '../Definitions';
import { MetaStable2Token } from '.';
import BaseLiquidityPool from './BaseLiquidityPool';

const mainnetPools = new Map<string, typeof BaseLiquidityPool<unknown>>([
  ['0x32296969ef14eb0c6d29669c550d4a0449130230', MetaStable2Token],
]);

const defaultPools = new Map<
  Network,
  Map<string, typeof BaseLiquidityPool<unknown>>
>([[Network.Mainnet, mainnetPools]]);

export default defaultPools;
