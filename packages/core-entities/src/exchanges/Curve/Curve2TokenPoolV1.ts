import {
  CurvePoolV1ABI,
  CurvePoolV1WithOracleABI,
  IAggregatorABI,
} from '@notional-finance/contracts';
import { AggregateCall, NO_OP } from '@notional-finance/multicall';
import { Network } from '@notional-finance/util';
import { BigNumber, Contract } from 'ethers';
import { TokenBalance } from '../../token-balance';
import BaseLiquidityPool from '../base-liquidity-pool';
import { getCommonCurveAggregateCall } from './common-calls';

export interface Curve2TokenPoolV1Params {
  A: BigNumber;
  adminBalance_0: BigNumber;
  adminBalance_1: BigNumber;
  adminFee: BigNumber;
  fee: BigNumber;
  oracleRate: BigNumber;
  hasOracle: boolean;
  includeAdminBalances: boolean;
}

export class Curve2TokenPoolV1 extends BaseLiquidityPool<Curve2TokenPoolV1Params> {
  public static readonly N_COINS = BigNumber.from(2);
  public static readonly PRECISION = BigNumber.from(10).pow(18);
  public static readonly A_PRECISION = BigNumber.from(100);
  public static readonly FEE_DENOMINATOR = BigNumber.from(10).pow(10);
  public static readonly IS_SELF_LP_TOKEN: boolean = false;
  public static readonly INCLUDE_ADMIN_BALANCES: boolean = true;
  public static readonly HAS_ORACLE: boolean = false;

  public static override getInitData(
    network: Network,
    poolAddress: string
  ): AggregateCall[] {
    const pool = new Contract(
      poolAddress,
      this.HAS_ORACLE ? CurvePoolV1WithOracleABI : CurvePoolV1ABI
    );
    const commonCalls = getCommonCurveAggregateCall(network, poolAddress, pool);

    const calls = commonCalls.concat([
      {
        stage: 0,
        target: pool,
        method: 'A_precise',
        key: 'A',
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
    ]);

    if (this.IS_SELF_LP_TOKEN) {
      calls.push({
        stage: 0,
        target: NO_OP,
        method: NO_OP,
        key: 'lpTokenAddress',
        transform: () => poolAddress,
      });
    } else {
      calls.push({
        stage: 0,
        target: pool,
        method: 'lp_token',
        key: 'lpTokenAddress',
      });
    }

    if (this.INCLUDE_ADMIN_BALANCES) {
      calls.push({
        stage: 0,
        target: NO_OP,
        method: NO_OP,
        key: 'includeAdminBalances',
        transform: () => true,
      });
    } else {
      calls.push({
        stage: 0,
        target: NO_OP,
        method: NO_OP,
        key: 'includeAdminBalances',
        transform: () => false,
      });
    }

    if (this.HAS_ORACLE) {
      calls.push({
        stage: 0,
        target: pool,
        method: 'oracle',
        key: 'oracleAddress',
        args: [],
      });

      calls.push({
        stage: 1,
        target: (r) =>
          new Contract(
            r[`${poolAddress}.oracleAddress`] as string,
            IAggregatorABI
          ),
        method: 'latestAnswer',
        key: 'oracleRate',
      });

      calls.push({
        stage: 0,
        target: NO_OP,
        method: NO_OP,
        key: 'hasOracle',
        transform: () => true,
      });
    } else {
      calls.push({
        stage: 0,
        target: NO_OP,
        method: NO_OP,
        key: 'hasOracle',
        transform: () => false,
      });
    }

    return calls;
  }

  private _stored_rates() {
    // TODO: get precision from token0 decimals
    return [Curve2TokenPoolV1.PRECISION, this.poolParams.oracleRate];
  }

  private _get_D_mem(
    rates: BigNumber[],
    _balances: TokenBalance[],
    amp: BigNumber
  ) {
    const result = rates.map((r, i) =>
      r.mul(_balances[i].n).div(Curve2TokenPoolV1.PRECISION)
    );
    return this._get_D(result, amp);
  }

  private _getLPTokensGivenTokensWithOracle(tokensIn: TokenBalance[]) {
    const amp = this.poolParams.A;
    const rates = this._stored_rates();

    let D0 = BigNumber.from(0);
    const old_balances = [...this.balances];
    if (!this.totalSupply.isZero()) {
      D0 = this._get_D_mem(rates, old_balances, amp);
    }

    const new_balances = old_balances.map((b, i) => {
      return b.add(tokensIn[i]);
    });

    const D1 = this._get_D_mem(rates, new_balances, amp);

    let D2 = D1;
    const fees = this.balances.map((b) => b.copy(BigNumber.from(0)));
    let mint_amount = BigNumber.from(0);
    if (!this.totalSupply.isZero()) {
      const _fee = this.poolParams.fee
        .mul(Curve2TokenPoolV1.N_COINS)
        .div(BigNumber.from(4).mul(Curve2TokenPoolV1.N_COINS.sub(1)));
      for (let i = 0; i < Curve2TokenPoolV1.N_COINS.toNumber(); i++) {
        const ideal_balance = D1.mul(old_balances[i].n).div(D0);
        let difference = BigNumber.from(0);
        if (ideal_balance.gt(new_balances[i].n)) {
          difference = ideal_balance.sub(new_balances[i].n);
        } else {
          difference = new_balances[i].n.sub(ideal_balance);
        }
        fees[i] = this.balances[i].copy(
          _fee.mul(difference).div(Curve2TokenPoolV1.FEE_DENOMINATOR)
        );
        new_balances[i] = new_balances[i].sub(fees[i]);
      }
      D2 = this._get_D_mem(rates, new_balances, amp);
      mint_amount = this.totalSupply.n.mul(D2.sub(D0)).div(D0);
    } else {
      mint_amount = D1;
    }

    const lpTokens = this.totalSupply.copy(mint_amount);
    const lpClaims = this.getLPTokenClaims(
      lpTokens,
      new_balances,
      this.totalSupply.add(lpTokens)
    );
    return {
      lpTokens,
      feesPaid: fees.map((b, i) => this.balances[i].copy(b.n)),
      lpClaims,
    };
  }

  public override getLPTokensGivenTokens(tokensIn: TokenBalance[]) {
    if (this.poolParams.hasOracle) {
      return this._getLPTokensGivenTokensWithOracle(tokensIn);
    }

    const amp = this.poolParams.A;
    const admin_balances = [
      this.poolParams.adminBalance_0,
      this.poolParams.adminBalance_1,
    ];
    const old_balances = this.poolParams.includeAdminBalances
      ? this.balances.map((b, i) => b.copy(b.n.sub(admin_balances[i])))
      : [...this.balances];

    const D0 = this._get_D(this._xp_mem(old_balances), amp);
    const token_supply = this.totalSupply;
    const new_balances = old_balances.map((b, i) => b.add(tokensIn[i]));

    // # Invariant after change
    const D1 = this._get_D(this._xp_mem(new_balances), amp);

    // We need to recalculate the invariant accounting for fees
    // to calculate fair user's share
    const fees = [BigNumber.from(0), BigNumber.from(0)];
    let mintAmount = BigNumber.from(0);
    //D2: uint256 = 0
    if (token_supply.n.gt(0)) {
      //  # Only account for fees if we are not the first to deposit
      const fee = this.poolParams.fee
        .mul(Curve2TokenPoolV1.N_COINS)
        .div(BigNumber.from(4).mul(Curve2TokenPoolV1.N_COINS.sub(1)));
      for (let i = 0; i < Curve2TokenPoolV1.N_COINS.toNumber(); i++) {
        const ideal_balance = D1.mul(old_balances[i].n).div(D0);
        let difference = BigNumber.from(0);
        if (ideal_balance.gt(new_balances[i].n)) {
          difference = ideal_balance.sub(new_balances[i].n);
        } else {
          difference = new_balances[i].n.sub(ideal_balance);
        }
        fees[i] = fee.mul(difference).div(Curve2TokenPoolV1.FEE_DENOMINATOR);
        new_balances[i] = this.balances[i].copy(new_balances[i].n.sub(fees[i]));
      }

      const D2 = this._get_D(this._xp_mem(new_balances), amp);
      mintAmount = token_supply.n.mul(D2.sub(D0)).div(D0);
    } else {
      mintAmount = D1; // Take the dust if there was any
    }

    const lpTokens = this.totalSupply.copy(mintAmount);
    const lpClaims = this.getLPTokenClaims(
      lpTokens,
      new_balances,
      this.totalSupply.add(lpTokens)
    );
    return {
      lpTokens,
      feesPaid: fees.map((b, i) => this.balances[i].copy(b)),
      lpClaims,
    };
  }

  private _get_D(xp: BigNumber[], amp: BigNumber): BigNumber {
    let Dprev = BigNumber.from(0);

    const S = xp.reduce((a, b) => a.add(b), BigNumber.from(0));

    if (S.isZero()) return BigNumber.from(0);

    let D = S;
    const Ann = amp.mul(Curve2TokenPoolV1.N_COINS);
    for (let i = 0; i < 255; i++) {
      let D_P;

      if (this.poolParams.includeAdminBalances) {
        D_P = D.mul(D)
          .div(xp[0])
          .mul(D)
          .div(xp[1])
          .div(Curve2TokenPoolV1.N_COINS.pow(2));
      } else {
        D_P = D;
        for (const _x of xp) {
          D_P = D_P.mul(D).div(_x.mul(Curve2TokenPoolV1.N_COINS).add(1)); // +1 is to prevent /0
        }
      }

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

    // convergence typically occurs in 4 rounds or less, this should be unreachable!
    // if it does happen the pool is borked and LPs can withdraw via `remove_liquidity`
    throw Error('Calculation did not converge');
  }

  private _get_y_D(A_: BigNumber, i: number, xp: BigNumber[], D: BigNumber) {
    const Ann = A_.mul(Curve2TokenPoolV1.N_COINS);
    let c = D;
    let S_ = BigNumber.from(0);
    let _x = BigNumber.from(0);
    let y_prev = BigNumber.from(0);

    for (let _i = 0; _i < Curve2TokenPoolV1.N_COINS.toNumber(); _i++) {
      if (_i !== i) {
        _x = xp[_i];
      } else {
        continue;
      }
      S_ = S_.add(_x);
      c = c.mul(D).div(_x.mul(Curve2TokenPoolV1.N_COINS));
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

  private _get_y(i: number, j: number, x: BigNumber, xp: BigNumber[]) {
    // x in the input is converted to the same price/precision

    const amp = this.poolParams.A;
    const D = this._get_D(xp, amp);
    const Ann = amp.mul(Curve2TokenPoolV1.N_COINS);
    let c = D;
    let S_ = BigNumber.from(0);
    let _x = BigNumber.from(0);
    let y_prev = BigNumber.from(0);

    for (let _i = 0; _i < Curve2TokenPoolV1.N_COINS.toNumber(); _i++) {
      if (_i === i) {
        _x = x;
      } else if (_i !== j) {
        _x = xp[_i];
      } else {
        continue;
      }
      S_ = S_.add(_x);
      c = c.mul(D).div(_x.mul(Curve2TokenPoolV1.N_COINS));
    }

    c = c
      .mul(D)
      .mul(Curve2TokenPoolV1.A_PRECISION)
      .div(Ann.mul(Curve2TokenPoolV1.N_COINS));
    const b = S_.add(D.mul(Curve2TokenPoolV1.A_PRECISION).div(Ann)); // - D
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

  private _xp_rates(balances: TokenBalance[], rates: BigNumber[]) {
    return balances.map((b, i) =>
      rates[i].mul(b.n).div(Curve2TokenPoolV1.PRECISION)
    );
  }

  private _xp_mem(balances: TokenBalance[]) {
    return balances.map((b) =>
      b.n.mul(Curve2TokenPoolV1.PRECISION).div(b.precision)
    );
  }

  private _calc_withdraw_one_coin(lpTokens: TokenBalance, i: number) {
    const amp = this.poolParams.A;
    const xp = this.poolParams.hasOracle
      ? this._xp_rates(this.balances, this._stored_rates())
      : [...this._xp_mem(this.balances)];
    const D0 = this._get_D(xp, amp);
    const totalSupply = this.totalSupply;
    const D1 = D0.sub(lpTokens.n.mul(D0).div(totalSupply.n));

    const new_y = this._get_y_D(amp, i, xp, D1);

    const fee = this.poolParams.fee
      .mul(Curve2TokenPoolV1.N_COINS)
      .div(
        BigNumber.from(4).mul(Curve2TokenPoolV1.N_COINS.sub(BigNumber.from(1)))
      );
    const xp_reduced = [BigNumber.from(0), BigNumber.from(0)];
    for (let j = 0; j < Curve2TokenPoolV1.N_COINS.toNumber(); j++) {
      let dx_expected = BigNumber.from(0);
      const xp_j = xp[j];
      if (j === i) {
        dx_expected = xp_j.mul(D1).div(D0).sub(new_y);
      } else {
        dx_expected = xp_j.sub(xp_j.mul(D1).div(D0));
      }
      xp_reduced[j] = xp_j.sub(
        fee.mul(dx_expected).div(Curve2TokenPoolV1.FEE_DENOMINATOR)
      );
    }

    let dy = xp_reduced[i].sub(this._get_y_D(amp, i, xp_reduced, D1));

    dy = dy.sub(BigNumber.from(1)); // Withdraw less to account for rounding errors

    let dy_0 = xp[i].sub(new_y); // w/o fees

    if (this.poolParams.hasOracle) {
      const rate = this._stored_rates()[i];
      dy = dy.mul(Curve2TokenPoolV1.PRECISION).div(rate);
      dy_0 = dy_0.mul(Curve2TokenPoolV1.PRECISION).div(rate);
    } else {
      dy = dy.mul(this.balances[i].precision).div(Curve2TokenPoolV1.PRECISION);
      dy_0 = dy_0
        .mul(this.balances[i].precision)
        .div(Curve2TokenPoolV1.PRECISION);
    }

    return {
      dy: dy,
      dyFee: dy_0.sub(dy),
    };
  }

  public getTokensOutGivenLPTokens(
    lpTokens: TokenBalance,
    singleSidedExitTokenIndex?: number
  ) {
    const tokensOut = this.zeroTokenArray();
    const feesPaid = this.zeroTokenArray();

    if (singleSidedExitTokenIndex !== undefined) {
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

      feesPaid[singleSidedExitTokenIndex] = feesPaid[
        singleSidedExitTokenIndex
      ].copy(
        this.poolParams.includeAdminBalances
          ? adminBalances[singleSidedExitTokenIndex].add(
              dyFee
                .mul(this.poolParams.adminFee)
                .div(Curve2TokenPoolV1.FEE_DENOMINATOR)
            )
          : dyFee
      );

      tokensOut[singleSidedExitTokenIndex] =
        tokensOut[singleSidedExitTokenIndex].copy(dy);
    } else {
      const totalSupply = this.totalSupply;

      for (let i = 0; i < Curve2TokenPoolV1.N_COINS.toNumber(); i++) {
        tokensOut[i] = this.balances[i].scale(lpTokens, totalSupply);
      }
    }

    return {
      tokensOut: tokensOut,
      feesPaid: feesPaid,
    };
  }

  public calculateTokenTrade(
    tokensIn: TokenBalance,
    tokenIndexOut: number,
    _balanceOverrides?: TokenBalance[]
  ) {
    const tokenIndexIn = this.getTokenIndex(tokensIn.token);

    const adminBalances = [
      this.poolParams.adminBalance_0,
      this.poolParams.adminBalance_1,
    ];
    const xp = [
      ...(_balanceOverrides
        ? this._xp_mem(_balanceOverrides)
        : this.poolParams.hasOracle
        ? this._xp_rates(this.balances, this._stored_rates())
        : this._xp_mem(this.balances)),
    ];
    let dx = tokensIn.n;

    if (this.poolParams.hasOracle) {
      dx = dx
        .mul(this._stored_rates()[tokenIndexIn])
        .div(Curve2TokenPoolV1.PRECISION);
    } else {
      dx = dx.mul(Curve2TokenPoolV1.PRECISION).div(tokensIn.precision);
    }

    const x = xp[tokenIndexIn].add(dx);
    const y = this._get_y(tokenIndexIn, tokenIndexOut, x, xp);
    let dy = xp[tokenIndexOut].sub(y).sub(1);
    const dy_fee = dy
      .mul(this.poolParams.fee)
      .div(Curve2TokenPoolV1.FEE_DENOMINATOR);

    // Convert all to real units
    dy = dy.sub(dy_fee);

    if (this.poolParams.hasOracle) {
      dy = dy
        .mul(Curve2TokenPoolV1.PRECISION)
        .div(this._stored_rates()[tokenIndexOut]);
    } else {
      dy = dy
        .mul(this.balances[tokenIndexOut].precision)
        .div(Curve2TokenPoolV1.PRECISION);
    }

    const admin_fee = this.poolParams.adminFee;
    const feesPaid = this.zeroTokenArray();
    if (!admin_fee.isZero()) {
      const dy_admin_fee = dy_fee
        .mul(admin_fee)
        .div(Curve2TokenPoolV1.FEE_DENOMINATOR);
      if (!dy_admin_fee.isZero()) {
        feesPaid[tokenIndexOut] = this.balances[tokenIndexOut].copy(
          adminBalances[tokenIndexOut].add(
            dy_admin_fee
              .mul(this.balances[tokenIndexOut].precision)
              .div(Curve2TokenPoolV1.PRECISION)
          )
        );
      }
    }

    return {
      tokensOut: this.balances[tokenIndexOut].copy(dy),
      feesPaid: feesPaid,
    };
  }
}

/**
 * Variant of the Curve2TokenPoolV1 wCurve2TokenPoolV1 the lp_token call is not defined because the token pool itself
 * is also the LP token contract.
 */
export class Curve2TokenPoolV1_SelfLPToken extends Curve2TokenPoolV1 {
  public static override readonly IS_SELF_LP_TOKEN: boolean = true;
}

export class Curve2TokenPoolV1_SelfLPTokenNoAdmin extends Curve2TokenPoolV1_SelfLPToken {
  public static override readonly INCLUDE_ADMIN_BALANCES: boolean = false;
}

export class Curve2TokenPoolV1_HasOracle extends Curve2TokenPoolV1 {
  public static override readonly HAS_ORACLE: boolean = true;
}
