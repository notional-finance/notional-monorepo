import { ERC20ABI } from '@notional-finance/contracts';
import { AggregateCall } from '@notional-finance/multicall';
import { BigNumber, Contract } from 'ethers';
import { Network, TokenBalance, TokenRegistry } from '../..';

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
      stage: 1,
      target: (r) => new Contract(r[`${poolAddress}.lpTokenAddress`], ERC20ABI),
      method: 'totalSupply',
      key: 'totalSupply',
      args: [],
      transform: (r: BigNumber, ar) => {
        const lpTokenAddress = ar[`${poolAddress}.lpTokenAddress`];
        const token = TokenRegistry.getTokenByAddress(network, lpTokenAddress);
        if (!token)
          throw Error(`${lpTokenAddress} not found in token registry`);
        return TokenBalance.from(r, token);
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
        return [ar[`${poolAddress}.balances_0`], r].map((b, i) => {
          const token = TokenRegistry.getTokenByAddress(network, coins[i]);
          if (!token) throw Error(`${coins[i]} not found in registry`);
          return TokenBalance.from(b, token);
        });
      },
    },
  ];
}
