import { BalancerVault, BalancerVaultABI } from '@notional-finance/contracts';
import { AggregateCall } from '@notional-finance/multicall';
import { Network } from '@notional-finance/util';
import { BigNumber, Contract } from 'ethers';
import { TokenBalance } from '../..';
import FixedPoint from './fixed-point';

export function getCommonBalancerAggregateCall(
  network: Network,
  poolAddress: string,
  pool: Contract
): AggregateCall[] {
  return [
    {
      stage: 0,
      target: pool,
      method: 'getSwapFeePercentage',
      key: 'swapFeePercentage',
      args: [],
      transform: (r: BigNumber) => FixedPoint.from(r),
    },
    {
      stage: 0,
      target: pool,
      method: 'totalSupply',
      key: 'totalSupply',
      args: [],
      transform: (r: BigNumber) => {
        return TokenBalance.toJSON(r, poolAddress, network);
      },
    },
    {
      stage: 0,
      target: pool,
      method: 'getPoolId',
      key: 'poolId',
    },
    {
      stage: 0,
      target: pool,
      method: 'getVault',
      key: 'vaultAddress',
    },
    {
      stage: 1,
      target: (r) =>
        new Contract(
          r[`${poolAddress}.vaultAddress`] as string,
          BalancerVaultABI
        ),
      method: 'getPoolTokens',
      args: (r) => [r[`${poolAddress}.poolId`]],
      key: 'balances',
      transform: (
        r: Awaited<ReturnType<BalancerVault['functions']['getPoolTokens']>>
      ) =>
        r.balances.map((b, i) => TokenBalance.toJSON(b, r.tokens[i], network)),
    },
  ];
}
