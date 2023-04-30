import { CurvePoolV2ABI, ERC20ABI } from '@notional-finance/contracts';
import BaseLiquidityPool from '../BaseLiquidityPool';
import { AggregateCall } from '@notional-finance/multicall';
import { BigNumber, Contract } from 'ethers';
import { Network, TokenBalance, TokenRegistry } from '../..';
import { getCommonCurveAggregateCall } from './Common';

export interface Curve2TokenPoolV2Params {
  A: BigNumber;
  gamma: BigNumber;
  D: BigNumber;
  adminBalance_0: BigNumber;
  adminBalance_1: BigNumber;
  adminFee: BigNumber;
  fee: BigNumber;
  priceScale: BigNumber;
  futureAGammaTime: BigNumber;
  virtualPrice: BigNumber;
}

export default class Curve2TokenPoolV2 extends BaseLiquidityPool<Curve2TokenPoolV2Params> {
  public static readonly N_COINS = BigNumber.from(2);
  public static readonly PRECISION = BigNumber.from(10).pow(18);
  public static readonly NOISE_FEE = BigNumber.from(10).pow(5); // 0.1 bps
  public static readonly A_MULTIPLIER = BigNumber.from(10000);

  public static override getInitData(
    network: Network,
    poolAddress: string
  ): AggregateCall[] {
    const pool = new Contract(poolAddress, CurvePoolV2ABI);
    const commonCalls = getCommonCurveAggregateCall(network, poolAddress, pool);

    return commonCalls.concat([
      {
        stage: 0,
        target: pool,
        method: 'token',
        key: 'lpTokenAddress',
      },
      {
        stage: 0,
        target: pool,
        method: 'A',
        key: 'A',
      },
      {
        stage: 0,
        target: pool,
        method: 'A',
        key: 'gamma',
      },
      {
        stage: 0,
        target: pool,
        method: 'D',
        key: 'D',
      },
      {
        stage: 0,
        target: pool,
        method: 'price_scale',
        key: 'priceScale',
      },
      {
        stage: 0,
        target: pool,
        method: 'future_A_gamma_time',
        key: 'futureAGammaTime',
      },
      {
        stage: 0,
        target: pool,
        method: 'fee',
        key: 'fee',
      },
      {
        stage: 0,
        target: pool,
        method: 'get_virtual_price',
        key: 'virtualPrice',
      },
    ]);
  }

  private _calc_token_fee(amounts: TokenBalance[]) {
    // fee = sum(amounts_i - avg(amounts)) * fee' / sum(amounts)
    const fee = this.poolParams.fee
      .mul(Curve2TokenPoolV2.N_COINS)
      .div(BigNumber.from(4).mul(Curve2TokenPoolV2.N_COINS.sub(1)));
    let S = BigNumber.from(0);
    for (const _x of amounts) {
      S = S.add(_x.n);
    }
    const avg = S.div(Curve2TokenPoolV2.N_COINS);
    let Sdiff = BigNumber.from(0);
    for (const _x of amounts) {
      if (_x.n.gt(avg)) {
        Sdiff = Sdiff.add(_x.n.sub(avg));
      } else {
        Sdiff = Sdiff.add(avg.sub(_x.n));
      }
    }
    return fee.mul(Sdiff).div(S).add(Curve2TokenPoolV2.NOISE_FEE);
  }

  private _newton_D(
    ANN: BigNumber,
    gamma: BigNumber,
    x_unsorted: TokenBalance[]
  ) {
    // Initial value of invariant D is that for constant-product invariant
    let x = x_unsorted;
    if (x[0].lt(x[1])) {
      x = [x_unsorted[1], x_unsorted[0]];
    }

    let D = Curve2TokenPoolV2.N_COINS.mul(self._geometric_mean(x, false));
    const S = x[0].add(x[1]);

    for (let i = 0; i < 255; i++) {
      const D_prev = D;

      // K0: uint256 = 10**18
      // for _x in x:
      //     K0 = K0 * _x * N_COINS / D
      // collapsed for 2 coins
      const K0 = Curve2TokenPoolV2.PRECISION.mul(
        Curve2TokenPoolV2.N_COINS.pow(2)
      )
        .mul(x[0].n)
        .div(D)
        .mul(x[1].n)
        .div(D);

      let _g1k0 = gamma.add(Curve2TokenPoolV2.PRECISION);
      if (_g1k0.gt(K0)) {
        _g1k0 = _g1k0.sub(K0).add(1);
      } else {
        _g1k0 = K0.sub(_g1k0).add(1);
      }

      // D / (A * N**N) * _g1k0**2 / gamma**2
      const mul1 = Curve2TokenPoolV2.PRECISION.mul(D)
        .div(gamma)
        .mul(_g1k0)
        .div(gamma)
        .mul(_g1k0)
        .mul(Curve2TokenPoolV2.A_MULTIPLIER)
        .div(ANN);

      // 2*N*K0 / _g1k0
      const mul2 = BigNumber.from(2)
        .mul(Curve2TokenPoolV2.PRECISION)
        .mul(Curve2TokenPoolV2.N_COINS)
        .mul(K0)
        .div(_g1k0);

      const neg_fprime = S.n
        .add(S.n.mul(mul2).div(Curve2TokenPoolV2.PRECISION))
        .add(mul1.mul(Curve2TokenPoolV2.N_COINS).div(K0))
        .sub(mul2.mul(D).div(Curve2TokenPoolV2.PRECISION));

      // D -= f / fprime
      const D_plus = D.mul(neg_fprime.add(S.n)).div(neg_fprime);
      let D_minus = D.mul(D).div(neg_fprime);
      if (Curve2TokenPoolV2.PRECISION > K0) {
        D_minus = D_minus.add(
          D.mul(mul1.div(neg_fprime))
            .div(Curve2TokenPoolV2.PRECISION)
            .mul(Curve2TokenPoolV2.PRECISION.sub(K0))
            .div(K0)
        );
      } else {
        D_minus = D_minus.sub(
          D.mul(mul1.div(neg_fprime))
            .div(Curve2TokenPoolV2.PRECISION)
            .mul(K0.sub(Curve2TokenPoolV2.PRECISION))
            .div(K0)
        );
      }

      if (D_plus.gt(D_minus)) {
        D = D_plus.sub(D_minus);
      } else {
        D = D_minus.sub(D_plus).div(2);
      }

      let diff = BigNumber.from(0);
      if (D.gt(D_prev)) {
        diff = D.sub(D_prev);
      } else {
        diff = D_prev.sub(D);
      }
      if (
        diff.mul(BigNumber.from(10).pow(14)) <
        this._max(BigNumber.from(10).pow(16), D)
      ) {
        // Could reduce precision for gas efficiency here
        return D;
      }
    }

    throw Error('Calculation did not converge');
  }

  private _get_precisions() {
    return [
      BigNumber.from(10).pow(this.balances[0].decimals),
      BigNumber.from(10).pow(this.balances[1].decimals),
    ];
  }

  public override getLPTokensGivenTokens(tokensIn: TokenBalance[]) {
    const A_gamma = [this.poolParams.A, this.poolParams.gamma];
    let xp = [...this.balances];
    const amountsp = [tokensIn[0].copy(0), tokensIn[1].copy(0)];
    let d_token = BigNumber.from(0);
    let d_token_fee = BigNumber.from(0);
    let old_D = BigNumber.from(0);
    let xp_old = xp;

    for (let i = 0; i < Curve2TokenPoolV2.N_COINS.toNumber(); i++) {
      const bal = xp[i].add(tokensIn[i]);
      xp[i] = bal;
    }

    const precisions = this._get_precisions();
    const price_scale = this.poolParams.priceScale.mul(precisions[1]);
    xp = [
      xp[0].copy(xp[0].n.mul(precisions[0])),
      xp[1].copy(xp[1].n.mul(price_scale).div(Curve2TokenPoolV2.PRECISION)),
    ];
    xp_old = [
      xp_old[0].copy(xp_old[0].n.mul(precisions[0])),
      xp_old[1].copy(
        xp_old[1].n.mul(price_scale).div(Curve2TokenPoolV2.PRECISION)
      ),
    ];

    for (let i = 0; i < Curve2TokenPoolV2.N_COINS.toNumber(); i++) {
      if (tokensIn[i].n.gt(0)) {
        amountsp[i] = xp[i].sub(xp_old[i]);
      }
    }

    const t = this.poolParams.futureAGammaTime;
    if (t.gt(0)) {
      old_D = this._newton_D(A_gamma[0], A_gamma[1], xp_old);
    } else {
      old_D = this.poolParams.D;
    }

    const D = this._newton_D(A_gamma[0], A_gamma[1], xp);

    const token_supply = this.totalSupply;
    if (old_D.gt(0)) {
      d_token = token_supply.n.mul(D).div(old_D).sub(token_supply.n);
    } else {
      /*
        self.get_xcp(self.D) = totalSupply * virtualPrice / 10**18
      */
      d_token = this.totalSupply.n
        .mul(this.poolParams.virtualPrice)
        .div(Curve2TokenPoolV2.PRECISION); // making initial virtual price equal to 1
    }

    if (old_D.gt(0)) {
      d_token_fee = this._calc_token_fee(amountsp)
        .mul(d_token)
        .div(BigNumber.from(10).pow(10))
        .add(1);
      d_token = d_token.sub(d_token_fee);
    }

    return {
      lpTokens: this.totalSupply.copy(d_token),
      feesPaid: [],
    };
  }

  private _calc_withdraw_one_coin(
    A_gamma: BigNumber[],
    token_amount: TokenBalance,
    i: number,
    update_D: boolean
  ) {
    const token_supply = this.totalSupply;

    const xx = [...this.balances];
    let D0 = BigNumber.from(0);
    const precisions = this._get_precisions();

    let price_scale_i = this.poolParams.priceScale.mul(precisions[1]);
    const xp = [
      xx[0].copy(xx[0].n.mul(precisions[0])),
      xx[0].copy(xx[1].n.mul(price_scale_i).div(Curve2TokenPoolV2.PRECISION)),
    ];
    if (i == 0) {
      price_scale_i = Curve2TokenPoolV2.PRECISION.mul(precisions[0]);
    }

    if (update_D) {
      D0 = this._newton_D(A_gamma[0], A_gamma[1], xp);
    } else {
      D0 = this.poolParams.D;
    }

    let D = D0;

    // Charge the fee on D, not on y, e.g. reducing invariant LESS than charging the user
    const fee = this.poolParams.fee;
    const dD = token_amount.n.mul(D).div(token_supply.n);
    D = D.sub(
      dD.sub(
        fee
          .mul(dD)
          .div(BigNumber.from(2).mul(BigNumber.from(10).pow(10)))
          .add(1)
      )
    );
    const y = this._newton_y(A_gamma[0], A_gamma[1], xp, D, i);

    return xp[i].n.sub(y).mul(Curve2TokenPoolV2.PRECISION).div(price_scale_i);
  }

  private _max(x: BigNumber, y: BigNumber) {
    return x.gt(y) ? x : y;
  }

  private _newton_y(
    ANN: BigNumber,
    gamma: BigNumber,
    x: TokenBalance[],
    D: BigNumber,
    i: number
  ) {
    const x_j = x[1 - i];
    let y = D.pow(2).div(x_j.n.mul(Curve2TokenPoolV2.N_COINS.pow(2)));
    const K0_i = Curve2TokenPoolV2.PRECISION.mul(Curve2TokenPoolV2.N_COINS)
      .mul(x_j.n)
      .div(D);

    const convergence_limit = this._max(
      this._max(
        x_j.n.div(BigNumber.from(10).pow(14)),
        D.div(BigNumber.from(10).pow(14))
      ),
      BigNumber.from(100)
    );

    for (let j = 0; j < 255; j++) {
      const y_prev = y;

      const K0 = K0_i.mul(y).mul(Curve2TokenPoolV2.N_COINS).div(D);
      const S = x_j.n.add(y);

      let _g1k0 = gamma.add(Curve2TokenPoolV2.PRECISION);
      if (_g1k0 > K0) {
        _g1k0 = _g1k0.sub(K0).add(1);
      } else {
        _g1k0 = K0.sub(_g1k0).add(1);
      }

      // D / (A * N**N) * _g1k0**2 / gamma**2
      const mul1 = Curve2TokenPoolV2.PRECISION.mul(D)
        .div(gamma)
        .mul(_g1k0)
        .div(gamma)
        .mul(_g1k0)
        .mul(Curve2TokenPoolV2.A_MULTIPLIER)
        .div(ANN);

      // 2*K0 / _g1k0
      const mul2 = Curve2TokenPoolV2.PRECISION.add(
        BigNumber.from(2).mul(Curve2TokenPoolV2.PRECISION).mul(K0).div(_g1k0)
      );

      let yfprime = Curve2TokenPoolV2.PRECISION.mul(y)
        .add(S.mul(mul2))
        .add(mul1);
      const _dyfprime = this.poolParams.D.mul(mul2);
      if (yfprime.lt(_dyfprime)) {
        y = y_prev.div(2);
        continue;
      } else {
        yfprime = yfprime.sub(_dyfprime);
      }
      const fprime = yfprime.div(y);

      // y -= f / f_prime;  y = (y * fprime - f) / fprime
      // y = (yfprime + 10**18 * D - 10**18 * S) // fprime + mul1 // fprime * (10**18 - K0) // K0
      let y_minus = mul1.div(fprime);
      const y_plus = yfprime
        .add(Curve2TokenPoolV2.PRECISION.mul(this.poolParams.D))
        .div(fprime)
        .add(y_minus.mul(Curve2TokenPoolV2.PRECISION).div(K0));
      y_minus = y_minus.add(Curve2TokenPoolV2.PRECISION.mul(S).div(fprime));

      if (y_plus.lt(y_minus)) {
        y = y_prev.div(2);
      } else {
        y = y_plus.sub(y_minus);
      }

      let diff = BigNumber.from(0);
      if (y.gt(y_prev)) {
        diff = y.sub(y_prev);
      } else {
        diff = y_prev.sub(y);
      }
      if (
        diff < this._max(convergence_limit, y.div(BigNumber.from(10).pow(14)))
      ) {
        return y;
      }
    }

    throw Error('Calculation did not converge');
  }

  public getTokensOutGivenLPTokens(
    lpTokens: TokenBalance,
    singleSidedExitTokenIndex?: number
  ) {
    let tokensOut: TokenBalance[] = [];
    let feesPaid: TokenBalance[] = [];
    if (singleSidedExitTokenIndex) {
      const A_gamma = [this.poolParams.A, this.poolParams.gamma];
      const future_A_gamma_time = this.poolParams.futureAGammaTime;
      const dy = this._calc_withdraw_one_coin(
        A_gamma,
        lpTokens,
        singleSidedExitTokenIndex,
        future_A_gamma_time.gt(0)
      );
      tokensOut = [this.balances[0].copy(0), this.balances[1].copy(0)];
      tokensOut[singleSidedExitTokenIndex] =
        this.balances[singleSidedExitTokenIndex].copy(dy);
    } else {
      const total_supply = this.totalSupply;
      const amount = lpTokens.n.sub(1); // Make rounding errors favoring other LPs a tiny bit

      tokensOut = [this.balances[0].copy(0), this.balances[1].copy(0)];

      for (let i = 0; i < Curve2TokenPoolV2.N_COINS.toNumber(); i++) {
        tokensOut[i] = this.balances[i].copy(
          this.balances[i].n.mul(amount).div(total_supply.n)
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
    const A_gamma = [this.poolParams.A, this.poolParams.gamma];
    let xp = [...(_balanceOverrides || this.balances)];
    let dy = BigNumber.from(0);
    const i = tokenIndexIn;
    const j = tokenIndexOut;

    let x0 = xp[i];
    xp[i] = x0.add(tokensIn);

    const price_scale = this.poolParams.priceScale;
    const precisions = this._get_precisions();

    xp = [
      xp[0].copy(xp[0].n.mul(precisions[0])),
      xp[1].copy(
        xp[1].n
          .mul(price_scale)
          .mul(precisions[1])
          .div(Curve2TokenPoolV2.PRECISION)
      ),
    ];

    let prec_i = precisions[0];
    let prec_j = precisions[1];
    if (i == 1) {
      prec_i = precisions[1];
      prec_j = precisions[0];
    }

    // In case ramp is happening
    let D = this.poolParams.D;
    const t = this.poolParams.futureAGammaTime;
    if (t.gt(0)) {
      x0 = x0.copy(x0.n.mul(prec_i));
      if (i > 0) {
        x0 = x0.copy(x0.n.mul(price_scale).div(Curve2TokenPoolV2.PRECISION));
      }
      const x1 = xp[i]; // Back up old value in xp
      xp[i] = x0;
      D = this._newton_D(A_gamma[0], A_gamma[1], xp);
      xp[i] = x1; // And restore
    }

    dy = xp[j].n.sub(this._newton_y(A_gamma[0], A_gamma[1], xp, D, j));
    // Not defining new "y" here to have less variables / make subsequent calls cheaper
    xp[j] = xp[j].copy(xp[j].n.sub(dy));
    dy = dy.sub(1);

    if (j > 0) {
      dy = dy.mul(Curve2TokenPoolV2.PRECISION).div(price_scale);
    }
    dy = dy.div(prec_j);
    dy = dy.sub(this.poolParams.fee.mul(dy).div(BigNumber.from(10).pow(10)));

    return {
      tokensOut: xp[j].copy(dy),
      feesPaid: [],
    };
  }
}
