import { ERC20ABI } from '@notional-finance/contracts';
import { AggregateCall, NO_OP } from '@notional-finance/multicall';
import { Network } from '@notional-finance/util';
import { BigNumber, Contract } from 'ethers';
import { TokenBalance } from '../../token-balance';

export function getCommonCurveAggregateCall(
  network: Network,
  poolAddress: string,
  pool: Contract,
  N_COINS: number
): AggregateCall[] {
  return [
    ...Array.from({ length: N_COINS }, (_, i) => ({
      stage: 0,
      target: pool,
      method: 'coins',
      key: `coins_${i}`,
      args: [i],
    })),
    ...Array.from({ length: N_COINS }, (_, i) => ({
      stage: 0,
      target: pool,
      method: 'balances',
      key: `balances_${i}`,
      args: [i],
    })),
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
      target: NO_OP,
      method: NO_OP,
      key: 'balances',
      transform: (_, ar) => {
        const coins = Array.from(
          { length: N_COINS },
          (_, i) => ar[`${poolAddress}.coins_${i}`]
        );
        const balances = Array.from(
          { length: N_COINS },
          (_, i) => ar[`${poolAddress}.balances_${i}`] as BigNumber
        );

        return balances.map((b, i) => {
          return TokenBalance.toJSON(b, coins[i] as string, network);
        });
      },
    },
  ];
}
