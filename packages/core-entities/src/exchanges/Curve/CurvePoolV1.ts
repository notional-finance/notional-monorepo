import { CurvePoolV1ABI, ERC20ABI } from '@notional-finance/contracts';
import BaseLiquidityPool from '../BaseLiquidityPool';
import { AggregateCall } from '@notional-finance/multicall';
import { BigNumber, Contract } from 'ethers';
import { Network, TokenBalance, TokenRegistry } from '../..';

export interface CurvePoolV1Params {
  poolId: string;
}

export default class CurvePoolV1 extends BaseLiquidityPool<CurvePoolV1Params> {
  public static override getInitData(
    network: Network,
    poolAddress: string
  ): AggregateCall[] {
    const pool = new Contract(poolAddress, CurvePoolV1ABI);

    return [
      {
        stage: 0,
        target: pool,
        method: 'lp_token',
        key: 'lpTokenAddress',
      },
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
        target: (r) =>
          new Contract(r[`${poolAddress}.lpTokenAddress`], ERC20ABI),
        method: 'totalSupply',
        key: 'totalSupply',
        args: [],
        transform: (r: BigNumber, ar) => {
          const lpTokenAddress = ar[`${poolAddress}.lpTokenAddress`];
          const token = TokenRegistry.getTokenByAddress(
            network,
            lpTokenAddress
          );
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

  public override getLPTokenClaims(
    lpTokens: TokenBalance,
    _balancesOverrides?: TokenBalance[]
  ): TokenBalance[] {
    return [];
  }

  // Initial invariant
  // amp: uint256 = self._A()
  // old_balances: uint256[N_COINS] = self._balances(msg.value)
  // D0: uint256 = self.get_D(old_balances, amp)

  // lp_token: address = self.lp_token
  // token_supply: uint256 = ERC20(lp_token).totalSupply()
  // new_balances: uint256[N_COINS] = old_balances
  //for i in range(N_COINS):
  // if token_supply == 0:
  // assert amounts[i] > 0  # dev: initial deposit requires all coins
  // new_balances[i] += amounts[i]

  // # Invariant after change
  // D1: uint256 = self.get_D(new_balances, amp)
  // assert D1 > D0

  // We need to recalculate the invariant accounting for fees
  // to calculate fair user's share
  //fees: uint256[N_COINS] = empty(uint256[N_COINS])
  //mint_amount: uint256 = 0
  //D2: uint256 = 0
  //if token_supply > 0:
  //  # Only account for fees if we are not the first to deposit
  //  fee: uint256 = self.fee * N_COINS / (4 * (N_COINS - 1))
  //  admin_fee: uint256 = self.admin_fee
  //  for i in range(N_COINS):
  //      ideal_balance: uint256 = D1 * old_balances[i] / D0
  //      difference: uint256 = 0
  //      if ideal_balance > new_balances[i]:
  //          difference = ideal_balance - new_balances[i]
  //      else:
  //          difference = new_balances[i] - ideal_balance
  //      fees[i] = fee * difference / FEE_DENOMINATOR
  //      if admin_fee != 0:
  //          self.admin_balances[i] += fees[i] * admin_fee / FEE_DENOMINATOR
  //      new_balances[i] -= fees[i]
  //  D2 = self.get_D(new_balances, amp)
  //  mint_amount = token_supply * (D2 - D0) / D0
  // else:
  // mint_amount = D1  # Take the dust if there was any

  // assert mint_amount >= min_mint_amount, "Slippage screwed you"

  // Take coins from the sender
  // assert msg.value == amounts[0]
  // if amounts[1] > 0:
  //    assert ERC20(self.coins[1]).transferFrom(msg.sender, self, amounts[1])

  // # Mint pool tokens
  // CurveToken(lp_token).mint(msg.sender, mint_amount)

  public override getLPTokensGivenTokens(tokensIn: TokenBalance[]) {
    return {
      lpTokens: tokensIn[0],
      feesPaid: [],
    };
  }

  public getTokensOutGivenLPTokens(
    lpTokens: TokenBalance,
    singleSidedExitTokenIndex?: number
  ) {
    return {
      tokensOut: [],
      feesPaid: [],
    };
  }

  public calculateTokenTrade(
    tokensIn: TokenBalance,
    tokenIndexIn: number,
    tokenIndexOut: number,
    _balanceOverrides?: TokenBalance[]
  ) {
    return {
      tokensOut: tokensIn,
      feesPaid: [],
    };
  }
}
