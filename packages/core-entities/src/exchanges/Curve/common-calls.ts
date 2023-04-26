import { ERC20ABI } from '@notional-finance/contracts';
import { AggregateCall } from '@notional-finance/multicall';
import { Network } from '@notional-finance/util';
import { BigNumber, Contract } from 'ethers';
import { TokenBalance } from '../../token-balance';

export function getCommonCurveAggregateCall(
  network: Network,
  poolAddress: string,
  pool: Contract
): AggregateCall[] {
  return [
    {
      stage: 0,
      target: pool,
      method: 'coins',
      key: 'coins_0',
      args: [0],
    },
    {
      stage: 0,
      target: pool,
      method: 'coins',
      key: 'coins_1',
      args: [1],
    },
    {
      stage: 0,
      target: pool,
      method: 'balances',
      key: 'balances_0',
      args: [0],
    },
    {
      stage: 0,
      target: pool,
      method: 'fee',
      key: 'fee',
    },
    {
      stage: 1,
      target: (r) =>
        new Contract(r[`${poolAddress}.lpTokenAddress`] as string, ERC20ABI),
      method: 'totalSupply',
      key: 'totalSupply',
      args: [],
      transform: (r: BigNumber, ar) => {
        const lpTokenAddress = ar[`${poolAddress}.lpTokenAddress`] as string;
        return TokenBalance.toJSON(r, lpTokenAddress, network);
      },
    },
    {
      stage: 1,
      target: pool,
      method: 'balances',
      args: [1],
      key: 'balances',
      transform: (r: BigNumber, ar) => {
        const coins = [
          ar[`${poolAddress}.coins_0`],
          ar[`${poolAddress}.coins_1`],
        ];
        return [ar[`${poolAddress}.balances_0`] as BigNumber, r].map((b, i) => {
          return TokenBalance.toJSON(b, coins[i] as string, network);
        });
      },
    },
  ];
}
