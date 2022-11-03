import { BigNumber, Contract } from 'ethers';
import {
  INTERNAL_TOKEN_PRECISION,
  RATE_PRECISION,
} from '../../../config/constants';
import TypedBigNumber, { BigNumberType } from '../../../libs/TypedBigNumber';
import { BalancerVault, BalancerVaultABI } from '@notional-finance/contracts';
import { doBinarySearch } from '../../Approximation';
import BaseVault from '../../BaseVault';
import VaultAccount from '../../VaultAccount';
import FixedPoint from './FixedPoint';

export interface DepositParams {
  minBPT: BigNumber;
  tradeData: string;
}

export interface RedeemParams {
  minPrimary: BigNumber;
  minSecondary: BigNumber;
  secondaryTradeParams: string;
}

export interface PoolContext {
  poolAddress: string;
  poolId: string;
  primaryTokenIndex: number;
  tokenOutIndex: number;
  primaryToken: string;
  secondaryToken: string;
  balances: FixedPoint[];
}

export interface BaseBalancerStablePoolInitParams {
  strategyContext: {
    totalStrategyTokensGlobal: FixedPoint;
    totalBPTHeld: FixedPoint;
  };
}

export abstract class BaseBalancerStablePool<
  I extends BaseBalancerStablePoolInitParams
> extends BaseVault<DepositParams, RedeemParams, I> {
  public override simulateSettledStrategyTokens = false;

  BalancerVault = new Contract(
    '0xBA12222222228d8Ba445958a75a0704d566BF2C8',
    BalancerVaultABI
  ) as BalancerVault;

  readonly depositTuple: string = 'tuple(uint256 minBPT, bytes tradeData) d';

  readonly redeemTuple: string =
    'tuple(int256 minPrimary, uint256 minSecondary, bytes secondaryTradeParams) r';

  protected convertBPTToStrategyTokens(
    bptAmount: FixedPoint,
    maturity: number
  ) {
    const { totalBPTHeld, totalStrategyTokensGlobal } =
      this.initParams.strategyContext;
    const tokens = totalBPTHeld.isZero()
      ? bptAmount
          .mul(FixedPoint.from(INTERNAL_TOKEN_PRECISION))
          .div(FixedPoint.ONE).n
      : // bptAmount * totalStrategyTokensGlobal / totalBPTHeld
        totalStrategyTokensGlobal.mul(bptAmount).div(totalBPTHeld).n;

    return TypedBigNumber.from(
      tokens,
      BigNumberType.StrategyToken,
      this.getVaultSymbol(maturity)
    );
  }

  protected convertStrategyTokensToBPT(
    strategyTokens: TypedBigNumber,
    simulatedStrategyTokens?: TypedBigNumber
  ) {
    // If there are simulated strategy tokens, assume they are 1-1 with BPTs because there
    // will be no BPT compounding during the simulation
    const { totalBPTHeld, totalStrategyTokensGlobal } =
      this.initParams.strategyContext;
    if (simulatedStrategyTokens) {
      const totalStrategyTokens = totalStrategyTokensGlobal.add(
        FixedPoint.from(simulatedStrategyTokens.n)
      );
      const simulatedBPT = FixedPoint.from(simulatedStrategyTokens.n)
        .mul(FixedPoint.ONE)
        .div(FixedPoint.from(INTERNAL_TOKEN_PRECISION));
      return totalBPTHeld
        .add(simulatedBPT)
        .mul(FixedPoint.from(strategyTokens.n))
        .div(totalStrategyTokens);
    } else if (totalStrategyTokensGlobal.isZero()) {
      return FixedPoint.from(strategyTokens.n);
    } else {
      return totalBPTHeld
        .mul(FixedPoint.from(strategyTokens.n))
        .div(totalStrategyTokensGlobal);
    }
  }

  protected abstract getBPTValue(amountIn: FixedPoint): FixedPoint;

  protected abstract getBPTOut(tokenAmountIn: FixedPoint): FixedPoint;

  protected abstract getUnderlyingOut(BPTIn: FixedPoint): TypedBigNumber;

  public getStrategyTokenValue(vaultAccount: VaultAccount): TypedBigNumber {
    const { strategyTokens } = vaultAccount.getPoolShare();
    const simulatedStrategyTokens = vaultAccount.getSimulatedStrategyTokens();
    const bptClaim = this.convertStrategyTokensToBPT(
      strategyTokens,
      simulatedStrategyTokens
    );
    const bptValue = this.getBPTValue(bptClaim);
    // This is in 8 decimal precision
    const accountValue = bptValue
      .mul(FixedPoint.from(INTERNAL_TOKEN_PRECISION))
      .div(FixedPoint.ONE);

    return TypedBigNumber.fromBalance(
      accountValue.n,
      this.getPrimaryBorrowSymbol(),
      true
    );
  }

  public getStrategyTokensFromValue(
    maturity: number,
    valuation: TypedBigNumber,
    _blockTime?: number
  ) {
    // This is an approximation based on one BPT worth of value
    const oneBPTValue = this.getBPTValue(FixedPoint.ONE);
    const tokens = valuation.scale(FixedPoint.ONE.n, oneBPTValue.n).n;

    // This is in 8 decimal precision
    return TypedBigNumber.from(
      tokens,
      BigNumberType.StrategyToken,
      this.getVaultSymbol(maturity)
    );
  }

  public async getDepositParametersExact(
    _maturity: number,
    depositAmount: TypedBigNumber,
    slippageBuffer: number,
    _blockTime?: number
  ) {
    // Convert deposit amount to 18 decimals
    const tokenAmountIn = FixedPoint.from(
      depositAmount
        .toInternalPrecision()
        .scale(FixedPoint.ONE.n, INTERNAL_TOKEN_PRECISION).n
    );
    const minBPT = this.getBPTOut(tokenAmountIn)
      .mul(FixedPoint.from(RATE_PRECISION - slippageBuffer))
      .div(FixedPoint.from(RATE_PRECISION)).n;

    return {
      minBPT,
      // By default we do not specify any traded data here
      tradeData: '0x',
    };
  }

  public getStrategyTokensGivenDeposit(
    maturity: number,
    depositAmount: TypedBigNumber,
    _blockTime?: number,
    _?: VaultAccount
  ) {
    // Convert deposit amount to 18 decimals
    const tokenAmountIn = FixedPoint.from(
      depositAmount
        .toInternalPrecision()
        .scale(FixedPoint.ONE.n, INTERNAL_TOKEN_PRECISION).n
    );
    const bptOut = this.getBPTOut(tokenAmountIn);
    return {
      strategyTokens: this.convertBPTToStrategyTokens(bptOut, maturity),
      secondaryfCashBorrowed: undefined,
    };
  }

  public getRedeemGivenStrategyTokens(
    _maturity: number,
    strategyTokens: TypedBigNumber,
    _blockTime?: number,
    _?: VaultAccount
  ) {
    // Convert strategy token amount to 18 decimals
    const BPTIn = FixedPoint.from(
      strategyTokens.scale(FixedPoint.ONE.n, INTERNAL_TOKEN_PRECISION).n
    );
    const amountRedeemed = this.getUnderlyingOut(BPTIn);
    return {
      amountRedeemed,
      secondaryfCashRepaid: undefined,
    };
  }

  public getDepositGivenStrategyTokens(
    maturity: number,
    strategyTokens: TypedBigNumber,
    _blockTime?: number,
    _vaultAccount?: VaultAccount
  ) {
    // In this case, all strategy tokens are "simulated" in that they are additional tokens
    // added to the pool
    const bptIn = this.convertStrategyTokensToBPT(
      strategyTokens,
      strategyTokens
    );
    const RP = FixedPoint.from(RATE_PRECISION);
    // 1 bpt * oneBPTValue = depositAmount
    const initialMultiple = this.getBPTValue(FixedPoint.ONE)
      .mul(RP)
      .div(FixedPoint.ONE)
      .n.toNumber();

    const calculationFunction = (multiple: number) => {
      const depositAmount = bptIn.mul(FixedPoint.from(multiple)).div(RP);
      const bptAmount = this.getBPTOut(depositAmount);
      const tokens = this.convertBPTToStrategyTokens(bptAmount, maturity);
      const actualMultiple = tokens
        .scale(RATE_PRECISION, strategyTokens)
        .toNumber();

      return {
        actualMultiple,
        breakLoop: false,
        value: depositAmount,
      };
    };

    const requiredDepositFP = doBinarySearch(
      initialMultiple,
      RATE_PRECISION,
      calculationFunction
    );

    const requiredDeposit = TypedBigNumber.fromBalance(
      requiredDepositFP
        .mul(FixedPoint.from(INTERNAL_TOKEN_PRECISION))
        .div(FixedPoint.ONE).n,
      this.getPrimaryBorrowSymbol(),
      true
    );

    return {
      requiredDeposit,
      secondaryfCashBorrowed: undefined,
    };
  }

  public getStrategyTokensGivenRedeem(
    maturity: number,
    redeemAmount: TypedBigNumber,
    _blockTime?: number,
    _vaultAccount?: VaultAccount
  ) {
    const RP = FixedPoint.from(RATE_PRECISION);
    const redeemAmountFP = FixedPoint.from(
      redeemAmount
        .toInternalPrecision()
        .scale(FixedPoint.ONE.n, INTERNAL_TOKEN_PRECISION).n
    );
    // redeemAmount / oneBPTValue = 1 bpt
    const initialMultiple = redeemAmountFP
      .mul(RP)
      .div(this.getBPTValue(FixedPoint.ONE))
      .n.toNumber();

    const calculationFunction = (multiple: number) => {
      const BPTIn = redeemAmountFP.mul(FixedPoint.from(multiple)).div(RP);
      const amountRedeemed = this.getUnderlyingOut(BPTIn);
      const actualMultiple = amountRedeemed
        .scale(RATE_PRECISION, redeemAmount)
        .toNumber();

      return {
        actualMultiple,
        breakLoop: false,
        value: this.convertBPTToStrategyTokens(BPTIn, maturity),
      };
    };

    const strategyTokens = doBinarySearch(
      initialMultiple,
      RATE_PRECISION,
      calculationFunction
    );
    return {
      strategyTokens,
      secondaryfCashRepaid: undefined,
    };
  }
}
