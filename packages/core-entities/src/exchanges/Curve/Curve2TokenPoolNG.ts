import { CurvePoolNGABI } from '@notional-finance/contracts';
import { AggregateCall, NO_OP } from '@notional-finance/multicall';
import { Network } from '@notional-finance/util';
import { TokenBalance } from '../../token-balance';
import BaseLiquidityPool from '../base-liquidity-pool';
import { Contract } from 'ethers';
import { BigNumber } from 'ethers';

interface Curve2TokenPoolNGParams {
  // Core pool parameters
  A: BigNumber; // Amplification coefficient
  fee: BigNumber; // Trading fee
  offpeg_fee_multiplier: BigNumber; // Fee multiplier for off-peg trades
  admin_fee: BigNumber; // Admin's portion of fees

  // Constants from contract
  A_PRECISION: BigNumber; // = 100
  FEE_DENOMINATOR: BigNumber; // = 10^10
  PRECISION: BigNumber; // = 10^18
  N_COINS: BigNumber; // = 2 for 2-token pool
  stored_rates: BigNumber[]; // = 10^18
  pool_balances: BigNumber[]; // balances adjusted for admin balances
}

export class Curve2TokenPoolNG extends BaseLiquidityPool<Curve2TokenPoolNGParams> {
  public static override getInitData(
    network: Network,
    poolAddress: string
  ): AggregateCall[] {
    const pool = new Contract(poolAddress, CurvePoolNGABI);

    const commonCalls = Curve2TokenPoolNG.getCurveAggregateCall(
      network,
      poolAddress,
      pool,
      2
    );

    const calls = commonCalls.concat([
      {
        target: pool,
        method: 'A_precise',
        key: 'A',
      },
      {
        target: pool,
        method: 'fee',
        key: 'fee',
      },
      {
        target: pool,
        method: 'admin_fee',
        key: 'admin_fee',
      },
      {
        target: pool,
        method: 'offpeg_fee_multiplier',
        key: 'offpeg_fee_multiplier',
      },
      // Add balances and totalSupply calls
      {
        target: pool,
        method: 'get_balances',
        key: 'pool_balances',
      },
      {
        target: pool,
        method: 'stored_rates',
        key: 'stored_rates',
      },
      {
        target: NO_OP,
        method: NO_OP,
        key: 'A_PRECISION',
        transform: () => BigNumber.from(100),
      },
      {
        target: pool,
        method: 'totalSupply',
        key: 'totalSupply',
        args: [],
        transform: (r: BigNumber) => {
          return TokenBalance.toJSON(r, poolAddress, network);
        },
      },
      {
        target: NO_OP,
        method: NO_OP,
        key: 'FEE_DENOMINATOR',
        transform: () => BigNumber.from(10).pow(10),
      },
      {
        target: NO_OP,
        method: NO_OP,
        key: 'PRECISION',
        transform: () => BigNumber.from(10).pow(18),
      },
      {
        target: NO_OP,
        method: NO_OP,
        key: 'N_COINS',
        transform: () => BigNumber.from(2),
      },
    ]);

    return calls;
  }

  public static getCurveAggregateCall(
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

  public calculateTokenTrade(
    tokensIn: TokenBalance,
    tokenIndexOut: number,
    balanceOverrides?: TokenBalance[]
  ): {
    tokensOut: TokenBalance;
    feesPaid: TokenBalance[];
  } {
    const tokenIndexIn = this.getTokenIndex(tokensIn.token);
    let old_balances: TokenBalance[];
    if (balanceOverrides) {
      old_balances = balanceOverrides;
    } else {
      // Create a copy of balances with updated n values
      old_balances = this.balances.map((balance, i) => {
        return balance.copy(this.poolParams.pool_balances[i]);
      });
    }
    const rates = this.poolParams.stored_rates;
    const xp = this._xp_mem(rates, old_balances);

    const dx = tokensIn.n;

    // Calculate output
    const x = xp[tokenIndexIn].add(
      dx.mul(rates[tokenIndexIn]).div(this.poolParams.PRECISION)
    );
    const amp = this.poolParams.A;
    const D = this.get_D(xp, amp);
    const y = this.get_y(tokenIndexIn, tokenIndexOut, x, xp, amp, D);

    // dy = xp[j] - y - 1 (subtract 1 to handle rounding errors)
    let dy = xp[tokenIndexOut].sub(y).sub(1);

    // Calculate dynamic fee
    const dynamic_fee = this.dynamic_fee(
      xp[tokenIndexIn].add(x).div(2), // average of input amounts
      xp[tokenIndexOut].add(y).div(2), // average of output amounts
      this.poolParams.fee
    );

    // Apply fees
    const dy_fee = dy.mul(dynamic_fee).div(this.poolParams.FEE_DENOMINATOR);
    dy = dy.sub(dy_fee);

    // Convert back to token precision
    dy = dy.mul(this.poolParams.PRECISION).div(rates[tokenIndexOut]);

    // Calculate admin fee
    const feesPaid = this.zeroTokenArray();
    const admin_fee = this.poolParams.admin_fee;
    if (!admin_fee.isZero()) {
      const dy_admin_fee = dy_fee
        .mul(admin_fee)
        .div(this.poolParams.FEE_DENOMINATOR)
        .mul(this.poolParams.PRECISION)
        .div(rates[tokenIndexOut]);

      if (!dy_admin_fee.isZero()) {
        feesPaid[tokenIndexOut] =
          old_balances[tokenIndexOut].copy(dy_admin_fee);
      }
    }
    return {
      tokensOut: old_balances[tokenIndexOut].copy(dy),
      feesPaid,
    };
  }

  private get_D(xp: BigNumber[], amp: BigNumber): BigNumber {
    let S = BigNumber.from(0);
    for (const x of xp) {
      S = S.add(x);
    }
    if (S.isZero()) return BigNumber.from(0);

    let D = S;
    const Ann = amp.mul(this.poolParams.N_COINS);

    for (let i = 0; i < 255; i++) {
      let D_P = D;
      for (const x of xp) {
        D_P = D_P.mul(D).div(x.mul(this.poolParams.N_COINS));
      }
      const Dprev = D;

      // D = (Ann * S / A_PRECISION + D_P * N_COINS) * D /
      //     ((Ann - A_PRECISION) * D / A_PRECISION + (N_COINS + 1) * D_P)
      D = Ann.mul(S)
        .div(this.poolParams.A_PRECISION)
        .add(D_P.mul(this.poolParams.N_COINS))
        .mul(D)
        .div(
          Ann.sub(this.poolParams.A_PRECISION)
            .mul(D)
            .div(this.poolParams.A_PRECISION)
            .add(this.poolParams.N_COINS.add(1).mul(D_P))
        );

      if (D.gt(Dprev)) {
        if (D.sub(Dprev).lte(1)) return D;
      } else {
        if (Dprev.sub(D).lte(1)) return D;
      }
    }

    throw new Error('D convergence failed');
  }

  private get_y(
    i: number,
    j: number,
    x: BigNumber,
    xp: BigNumber[],
    amp: BigNumber,
    D: BigNumber
  ): BigNumber {
    const N_COINS = this.poolParams.N_COINS;
    const Ann = amp.mul(N_COINS);
    let c = D;
    let S_ = BigNumber.from(0);

    for (let _i = 0; _i < N_COINS.toNumber(); _i++) {
      if (_i === i) {
        c = c.mul(D).div(x.mul(N_COINS));
        S_ = S_.add(x);
      } else if (_i !== j) {
        c = c.mul(D).div(xp[_i].mul(N_COINS));
        S_ = S_.add(xp[_i]);
      }
    }

    c = c.mul(D).mul(this.poolParams.A_PRECISION).div(Ann.mul(N_COINS));
    const b = S_.add(D.mul(this.poolParams.A_PRECISION).div(Ann));
    let y = D;

    for (let _i = 0; _i < 255; _i++) {
      const y_prev = y;
      y = y.mul(y).add(c).div(y.mul(2).add(b).sub(D));
      if (y.gt(y_prev)) {
        if (y.sub(y_prev).lte(1)) return y;
      } else {
        if (y_prev.sub(y).lte(1)) return y;
      }
    }

    throw new Error('y convergence failed');
  }

  private dynamic_fee(
    xpi: BigNumber,
    xpj: BigNumber,
    fee: BigNumber
  ): BigNumber {
    const offpeg_fee_multiplier = this.poolParams.offpeg_fee_multiplier;
    if (offpeg_fee_multiplier.lte(this.poolParams.FEE_DENOMINATOR)) {
      return fee;
    }

    const xps2 = xpi.add(xpj).pow(2);
    return offpeg_fee_multiplier
      .mul(fee)
      .div(
        offpeg_fee_multiplier
          .sub(this.poolParams.FEE_DENOMINATOR)
          .mul(4)
          .mul(xpi)
          .mul(xpj)
          .div(xps2)
          .add(this.poolParams.FEE_DENOMINATOR)
      );
  }

  private _xp_mem(rates: BigNumber[], balances: TokenBalance[]): BigNumber[] {
    const result: BigNumber[] = [];
    for (let i = 0; i < this.poolParams.N_COINS.toNumber(); i++) {
      result.push(rates[i].mul(balances[i].n).div(this.poolParams.PRECISION));
    }
    return result;
  }

  private get_D_mem(
    rates: BigNumber[],
    balances: TokenBalance[],
    amp: BigNumber
  ): BigNumber {
    const xp = this._xp_mem(rates, balances);
    return this.get_D(xp, amp);
  }

  public getLPTokensGivenTokens(tokensIn: TokenBalance[]): {
    lpTokens: TokenBalance;
    feesPaid: TokenBalance[];
    lpClaims: TokenBalance[];
  } {
    const amp = this.poolParams.A;
    const old_balances = this.balances.map((balance, i) => {
      return balance.copy(this.poolParams.pool_balances[i]);
    });
    const rates = this.poolParams.stored_rates;
    const N_COINS = this.poolParams.N_COINS;

    // Initial invariant
    const D0 = this.get_D_mem(rates, old_balances, amp);

    const total_supply = this.totalSupply;
    const new_balances = old_balances.map((b, i) =>
      tokensIn[i].isZero() ? b : b.copy(b.n.add(tokensIn[i].n))
    );

    // Invariant after change
    const D1 = this.get_D_mem(rates, new_balances, amp);
    if (!D1.gt(D0)) {
      throw new Error('D1 must be greater than D0');
    }

    // We need to recalculate the invariant accounting for fees
    const fees = this.zeroTokenArray();
    let mint_amount = BigNumber.from(0);

    if (!total_supply.isZero()) {
      // Only account for fees if we are not the first to deposit
      const base_fee = this.poolParams.fee
        .mul(N_COINS)
        .div(BigNumber.from(4).mul(N_COINS.sub(1)));

      const ys = D0.add(D1).div(N_COINS);

      for (let i = 0; i < N_COINS.toNumber(); i++) {
        const ideal_balance = D1.mul(old_balances[i].n).div(D0);
        let difference = BigNumber.from(0);
        const new_balance = new_balances[i].n;

        if (ideal_balance.gt(new_balance)) {
          difference = ideal_balance.sub(new_balance);
        } else {
          difference = new_balance.sub(ideal_balance);
        }

        // fee[i] = _dynamic_fee(xs, ys, base_fee) * difference / FEE_DENOMINATOR
        const xs = old_balances[i].n
          .add(new_balance)
          .mul(rates[i])
          .div(this.poolParams.PRECISION);

        const dynamic_fee = this.dynamic_fee(xs, ys, base_fee);
        const fee = dynamic_fee
          .mul(difference)
          .div(this.poolParams.FEE_DENOMINATOR);

        fees[i] = old_balances[i].copy(fee);
        new_balances[i] = new_balances[i].sub(fees[i]);
      }

      // Recalculate the invariant with fees
      const xp = this._xp_mem(rates, new_balances);
      const D2 = this.get_D(xp, amp);
      mint_amount = total_supply.n.mul(D2.sub(D0)).div(D0);
    } else {
      mint_amount = D1; // Take the dust if there was any
    }

    return {
      lpTokens: total_supply.copy(mint_amount),
      feesPaid: fees,
      lpClaims: this.getLPTokenClaims(
        total_supply.copy(mint_amount),
        new_balances,
        total_supply.add(total_supply.copy(mint_amount))
      ),
    };
  }

  public getTokensOutGivenLPTokens(
    lpTokens: TokenBalance,
    singleSidedExitTokenIndex?: number
  ): {
    tokensOut: TokenBalance[];
    feesPaid: TokenBalance[];
  } {
    const tokensOut = this.zeroTokenArray();
    const feesPaid = this.zeroTokenArray();

    if (singleSidedExitTokenIndex !== undefined) {
      // Single-sided exit (remove_liquidity_one_coin)
      const amp = this.poolParams.A;
      const old_balances = this.balances.map((balance, i) => {
        return balance.copy(this.poolParams.pool_balances[i]);
      });
      const xp = this._xp_mem(this.poolParams.stored_rates, old_balances);
      const D0 = this.get_D(xp, amp);

      // Calculate D1 after removing liquidity
      const D1 = D0.sub(lpTokens.n.mul(D0).div(this.totalSupply.n));

      // Calculate new y for the selected token
      const new_y = this.get_y_D(amp, singleSidedExitTokenIndex, xp, D1);

      // Calculate dynamic fee
      const base_fee = this.poolParams.fee
        .mul(this.poolParams.N_COINS)
        .div(BigNumber.from(4).mul(this.poolParams.N_COINS.sub(1)));

      // Calculate expected dx for each token
      const xp_reduced = xp.map((x_j, j) => {
        if (j === singleSidedExitTokenIndex) {
          const dx_expected = x_j.mul(D1).div(D0).sub(new_y);
          const dynamic_fee = this.dynamic_fee(x_j, new_y, base_fee);
          const fee = dynamic_fee
            .mul(dx_expected)
            .div(this.poolParams.FEE_DENOMINATOR);
          return x_j.sub(fee);
        } else {
          const dx_expected = x_j.sub(x_j.mul(D1).div(D0));
          const dynamic_fee = this.dynamic_fee(
            x_j,
            x_j.sub(dx_expected),
            base_fee
          );
          const fee = dynamic_fee
            .mul(dx_expected)
            .div(this.poolParams.FEE_DENOMINATOR);
          return x_j.sub(fee);
        }
      });

      // Calculate final amount out
      let dy = xp_reduced[singleSidedExitTokenIndex].sub(
        this.get_y_D(amp, singleSidedExitTokenIndex, xp_reduced, D1)
      );

      // Calculate fee amount
      const dy_0 = xp[singleSidedExitTokenIndex]
        .sub(new_y)
        .mul(this.poolParams.PRECISION)
        .div(this.poolParams.stored_rates[singleSidedExitTokenIndex]);

      // Convert to token precision
      dy = dy
        .sub(1)
        .mul(this.poolParams.PRECISION)
        .div(this.poolParams.stored_rates[singleSidedExitTokenIndex]);

      const dy_fee = dy_0.sub(dy);

      // Calculate admin fee
      if (!this.poolParams.admin_fee.isZero()) {
        const admin_fee = dy_fee
          .mul(this.poolParams.admin_fee)
          .div(this.poolParams.FEE_DENOMINATOR);

        feesPaid[singleSidedExitTokenIndex] =
          this.balances[singleSidedExitTokenIndex].copy(admin_fee);
      }

      tokensOut[singleSidedExitTokenIndex] =
        this.balances[singleSidedExitTokenIndex].copy(dy);
    } else {
      // Proportional exit (remove_liquidity)
      for (let i = 0; i < this.poolParams.N_COINS.toNumber(); i++) {
        tokensOut[i] = this.balances[i].scale(lpTokens, this.totalSupply);
      }
    }

    return {
      tokensOut,
      feesPaid,
    };
  }

  // Helper method for single-sided exit
  private get_y_D(
    amp: BigNumber,
    i: number,
    xp: BigNumber[],
    D: BigNumber
  ): BigNumber {
    const N_COINS = this.poolParams.N_COINS;
    const Ann = amp.mul(N_COINS);
    let c = D;
    let S_ = BigNumber.from(0);

    for (let j = 0; j < N_COINS.toNumber(); j++) {
      if (j !== i) {
        S_ = S_.add(xp[j]);
        c = c.mul(D).div(xp[j].mul(N_COINS));
      }
    }

    c = c.mul(D).mul(this.poolParams.A_PRECISION).div(Ann.mul(N_COINS));
    const b = S_.add(D.mul(this.poolParams.A_PRECISION).div(Ann));
    let y = D;

    for (let j = 0; j < 255; j++) {
      const y_prev = y;
      y = y.mul(y).add(c).div(y.mul(2).add(b).sub(D));
      if (y.gt(y_prev)) {
        if (y.sub(y_prev).lte(1)) return y;
      } else {
        if (y_prev.sub(y).lte(1)) return y;
      }
    }

    throw new Error('y_D convergence failed');
  }
}
