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
        max(BigNumber.from(10).pow(16), D)
      ) {
        // Could reduce precision for gas efficiency here
        return D;
      }
    }

    throw Error('Calculation did not converge');
  }

  public override getLPTokensGivenTokens(tokensIn: TokenBalance[]) {
    const A_gamma = [this.poolParams.A, this.poolParams.gamma];
    let xp = this.balances;
    const amountsp = [tokensIn[0].copy(0), tokensIn[1].copy(0)];
    let d_token = BigNumber.from(0);
    let d_token_fee = BigNumber.from(0);
    let old_D = BigNumber.from(0);
    let xp_old = xp;

    for (let i = 0; i < Curve2TokenPoolV2.N_COINS.toNumber(); i++) {
      const bal = xp[i].add(tokensIn[i]);
      xp[i] = bal;
    }

    const precisions = [
      BigNumber.from(10).pow(tokensIn[0].decimals),
      BigNumber.from(10).pow(tokensIn[1].decimals),
    ];
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
      tokensOut: this.balances[0],
      feesPaid: [],
    };
  }
}
