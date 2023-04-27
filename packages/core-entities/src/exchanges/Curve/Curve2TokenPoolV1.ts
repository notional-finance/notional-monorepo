import { CurvePoolV1ABI, ERC20ABI } from '@notional-finance/contracts';
import BaseLiquidityPool from '../BaseLiquidityPool';
import { AggregateCall } from '@notional-finance/multicall';
import { BigNumber, Contract } from 'ethers';
import { Network, TokenBalance, TokenRegistry } from '../..';

export interface Curve2TokenPoolV1Params {
  amplificationParameter: BigNumber;
  adminBalance_0: BigNumber;
  adminBalance_1: BigNumber;
  adminFee: BigNumber;
  fee: BigNumber;
}

export default class Curve2TokenPoolV1 extends BaseLiquidityPool<Curve2TokenPoolV1Params> {
  public static readonly N_COINS = BigNumber.from(2);
  public static readonly A_PRECISION = BigNumber.from(100);
  public static readonly FEE_DENOMINATOR = BigNumber.from(10).pow(10);

  public static override getInitData(
    network: Network,
    poolAddress: string
  ): AggregateCall[] {
    const pool = new Contract(poolAddress, CurvePoolV1ABI);

    return [
      {
        stage: 0,
        target: pool,
        method: 'A_precise',
        key: 'amplificationParameter',
      },
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
        stage: 0,
        target: pool,
        method: 'admin_balances',
        key: 'adminBalance_0',
        args: [0],
      },
      {
        stage: 0,
        target: pool,
        method: 'admin_balances',
        key: 'adminBalance_1',
        args: [1],
      },
      {
        stage: 0,
        target: pool,
        method: 'admin_fee',
        key: 'adminFee',
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

  public override getLPTokensGivenTokens(tokensIn: TokenBalance[]) {
    const amp = this.poolParams.amplificationParameter;
    const adminBalances = [
      this.poolParams.adminBalance_0,
      this.poolParams.adminBalance_1,
    ];
    const oldBalances = this.balances.map((b, i) =>
      TokenBalance.from(b.n.sub(adminBalances[i]), b.token)
    );
    const D0 = this._get_D(oldBalances, amp);

    const tokenSupply = this.totalSupply;
    const newBalances = oldBalances.map((b, i) => {
      if (tokenSupply.isZero()) {
        if (tokensIn[i].isZero()) {
          throw Error('Invalid tokensIn');
        }
      }
      return b.add(tokensIn[i]);
    });

    // # Invariant after change
    const D1 = this._get_D(newBalances, amp);

    if (!D1.gt(D0)) {
      throw Error('Invariant error');
    }

    // We need to recalculate the invariant accounting for fees
    // to calculate fair user's share
    const fees = [BigNumber.from(0), BigNumber.from(0)];
    let mintAmount = BigNumber.from(0);
    //D2: uint256 = 0
    if (tokenSupply.n.gt(0)) {
      //  # Only account for fees if we are not the first to deposit
      const fee = this.poolParams.fee
        .mul(Curve2TokenPoolV1.N_COINS)
        .div(BigNumber.from(4).mul(Curve2TokenPoolV1.N_COINS.sub(1)));
      const adminFee = this.poolParams.adminFee;
      for (let i = 0; i < Curve2TokenPoolV1.N_COINS.toNumber(); i++) {
        const idealBalance = D1.mul(oldBalances[i].n.div(D0));
        let difference = BigNumber.from(0);
        if (idealBalance.gt(newBalances[i].n)) {
          difference = idealBalance.sub(newBalances[i].n);
        } else {
          difference = newBalances[i].n.sub(idealBalance);
        }
        fees[i] = fee.mul(difference).div(Curve2TokenPoolV1.FEE_DENOMINATOR);
        if (!adminFee.isZero()) {
          adminBalances[i] = adminBalances[i].add(
            fees[i].mul(adminFee).div(Curve2TokenPoolV1.FEE_DENOMINATOR)
          );
        }
        newBalances[i].n = newBalances[i].n.sub(fees[i]);
      }
      const D2 = this._get_D(newBalances, amp);
      mintAmount = tokenSupply.n.mul(D2.sub(D0)).div(D0);
    } else {
      mintAmount = D1; // Take the dust if there was any
    }

    return {
      lpTokens: this.totalSupply.copy(mintAmount),
      feesPaid: [],
    };
  }

  private _get_D(xp: TokenBalance[], amp: BigNumber): BigNumber {
    let Dprev = BigNumber.from(0);

    const S = xp.map((b) => b.n).reduce((a, b) => a.add(b), BigNumber.from(0));

    if (S.isZero()) return BigNumber.from(0);

    let D = S;
    const Ann = amp.mul(Curve2TokenPoolV1.N_COINS);
    for (let i = 0; i < 255; i++) {
      let D_P = D;
      for (let j = 0; j < xp.length; j++) {
        const _x = xp[j];
        D_P = D_P.mul(D).div(_x.n.mul(Curve2TokenPoolV1.N_COINS).add(1)); // +1 is to prevent /0
        Dprev = D;
        D = Ann.mul(S)
          .div(Curve2TokenPoolV1.A_PRECISION)
          .add(D_P.mul(Curve2TokenPoolV1.N_COINS))
          .mul(D)
          .div(
            Ann.sub(Curve2TokenPoolV1.A_PRECISION)
              .mul(D)
              .div(Curve2TokenPoolV1.A_PRECISION)
              .add(Curve2TokenPoolV1.N_COINS.add(1).mul(D_P))
          );
        // Equality with the precision of 1
        if (D.gt(Dprev)) {
          if (D.sub(Dprev).lte(1)) {
            return D;
          }
        } else {
          if (Dprev.sub(D).lte(1)) {
            return D;
          }
        }
      }
    }

    // convergence typically occurs in 4 rounds or less, this should be unreachable!
    // if it does happen the pool is borked and LPs can withdraw via `remove_liquidity`
    throw Error('Calculation did not converge');
  }

  private _get_y_D(A_: BigNumber, i: number, xp: TokenBalance[], D: BigNumber) {
    const Ann = A_.mul(Curve2TokenPoolV1.N_COINS);
    let c = D;
    let S_ = BigNumber.from(0);
    let _x: TokenBalance;
    let y_prev = BigNumber.from(0);

    for (let _i = 0; _i < Curve2TokenPoolV1.N_COINS.toNumber(); _i++) {
      if (_i != i) {
        _x = xp[_i];
      } else {
        continue;
      }
      S_ = S_.add(_x.n);
      c = c.mul(D).div(_x.n.mul(Curve2TokenPoolV1.N_COINS));
    }
    c = c
      .mul(D)
      .mul(Curve2TokenPoolV1.A_PRECISION)
      .div(Ann.mul(Curve2TokenPoolV1.N_COINS));
    const b = S_.add(D.mul(Curve2TokenPoolV1.A_PRECISION).div(Ann));
    let y = D;

    for (let _i = 0; _i < 255; _i++) {
      y_prev = y;
      y = y.mul(y).add(c).div(BigNumber.from(2).mul(y).add(b).sub(D));
      // Equality with the precision of 1
      if (y.gt(y_prev)) {
        if (y.sub(y_prev).lte(1)) {
          return y;
        }
      } else {
        if (y_prev.sub(y).lte(1)) {
          return y;
        }
      }
    }

    throw Error('Calculation did not converge');
  }

  private _calc_withdraw_one_coin(lpTokens: TokenBalance, i: number) {
    const amp = this.poolParams.amplificationParameter;
    const xp = this.balances;
    const D0 = this._get_D(xp, amp);
    const totalSupply = this.totalSupply;
    const D1 = D0.sub(lpTokens.n.mul(D0).div(totalSupply.n));
    const new_y = this._get_y_D(amp, i, xp, D1);

    const fee = this.poolParams.fee
      .mul(Curve2TokenPoolV1.N_COINS)
      .div(
        BigNumber.from(4).mul(Curve2TokenPoolV1.N_COINS.sub(BigNumber.from(1)))
      );
    const xp_reduced = xp;
    for (let j = 0; j < Curve2TokenPoolV1.N_COINS.toNumber(); j++) {
      let dx_expected = BigNumber.from(0);
      if (j == i) {
        dx_expected = xp[j].n.mul(D1).div(D0).sub(new_y);
      } else {
        dx_expected = xp[j].n.sub(xp[j].n.mul(D1).div(D0));
      }
      xp_reduced[j] = xp[j].copy(
        xp_reduced[j].n.sub(
          fee.mul(dx_expected).div(Curve2TokenPoolV1.FEE_DENOMINATOR)
        )
      );
    }

    let dy = xp_reduced[i].n.sub(this._get_y_D(amp, i, xp_reduced, D1));

    dy = dy.sub(BigNumber.from(1)); // Withdraw less to account for rounding errors
    const dy_0 = xp[i].n.sub(new_y); // w/o fees

    return {
      dy: dy,
      dyFee: dy_0.sub(dy),
    };
  }

  public getTokensOutGivenLPTokens(
    lpTokens: TokenBalance,
    singleSidedExitTokenIndex?: number
  ) {
    let tokensOut: TokenBalance[] = [];
    let feesPaid: any[] = [];

    if (singleSidedExitTokenIndex) {
      const result = this._calc_withdraw_one_coin(
        lpTokens,
        singleSidedExitTokenIndex
      );
      const dy = result.dy;
      const dyFee = result.dyFee;
      const adminBalances = [
        this.poolParams.adminBalance_0,
        this.poolParams.adminBalance_1,
      ];

      feesPaid = [
        adminBalances[singleSidedExitTokenIndex].add(
          dyFee
            .mul(this.poolParams.adminFee)
            .div(Curve2TokenPoolV1.FEE_DENOMINATOR)
        ),
      ];
      tokensOut = [this.balances[singleSidedExitTokenIndex].copy(dy)];
    } else {
      const tokensOut = this.balances;
      const totalSupply = this.totalSupply;

      for (let i = 0; i < Curve2TokenPoolV1.N_COINS.toNumber(); i++) {
        tokensOut[i] = this.balances[i].copy(
          tokensOut[i].n.mul(lpTokens.n).div(totalSupply.n)
        );
      }
    }

    return {
      tokensOut: tokensOut,
      feesPaid: feesPaid,
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
