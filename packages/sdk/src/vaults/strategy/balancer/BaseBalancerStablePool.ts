import { BigNumber, Contract } from 'ethers';
import {
  INTERNAL_TOKEN_PRECISION,
  RATE_PRECISION,
} from '../../../config/constants';
import TypedBigNumber, { BigNumberType } from '../../../libs/TypedBigNumber';
import { BalancerVault } from '@notional-finance/contracts';
import { doBinarySearch } from '../../Approximation';
import BaseVault from '../../BaseVault';
import VaultAccount from '../../VaultAccount';
import FixedPoint from './FixedPoint';

import BalancerVaultABI from '../../../abi/BalancerVault.json';

export interface DepositParams {
  minBPT: BigNumber;
  tradeData: string;
}

export interface RedeemParams {
  minSecondaryLendRate: number;
  minPrimary: BigNumber;
  minSecondary: BigNumber;
  secondaryTradeParams: string;
}

export interface PoolContext {
  poolAddress: string;
  poolId: string;
  primaryTokenIndex: number;
  tokenOutIndex: number;
  balances: FixedPoint[];
}

export interface BaseBalancerStablePoolInitParams extends Record<string, any> {
  strategyContext: {
    totalStrategyTokensGlobal: FixedPoint;
    totalBPTHeld: FixedPoint;
  };
}

export abstract class BaseBalancerStablePool<
  I extends BaseBalancerStablePoolInitParams
> extends BaseVault<DepositParams, RedeemParams, I> {
  BalancerVault = new Contract(
    '0xBA12222222228d8Ba445958a75a0704d566BF2C8',
    BalancerVaultABI
  ) as BalancerVault;

  readonly depositTuple: string = 'tuple(uint256 minBPT, bytes tradeData) d';

  readonly redeemTuple: string =
    'tuple(uint32 minSecondaryLendRate, uint256 minPrimary, uint256 minSecondary, bytes secondaryTradeParams) r';

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
    }
    return totalBPTHeld
      .mul(FixedPoint.from(strategyTokens.n))
      .div(totalStrategyTokensGlobal);
  }

  protected abstract getBPTValue(amountIn?: FixedPoint): FixedPoint;

  protected abstract getBPTOut(tokenAmountIn: FixedPoint): FixedPoint;

  protected abstract getUnderlyingOut(BPTIn: FixedPoint): TypedBigNumber;

  public getStrategyTokenValue(vaultAccount: VaultAccount): TypedBigNumber {
    const { strategyTokens } = vaultAccount.getPoolShare();
    const oneBPTValue = this.getBPTValue();
    const simulatedStrategyTokens = vaultAccount.getSimulatedStrategyTokens();
    const bptClaim = this.convertStrategyTokensToBPT(
      strategyTokens,
      simulatedStrategyTokens
    );
    // This is in 8 decimal precision
    const accountValue = bptClaim
      .mul(oneBPTValue)
      .mul(FixedPoint.from(INTERNAL_TOKEN_PRECISION))
      .div(FixedPoint.ONE)
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
    const oneBPTValue = this.getBPTValue();
    const tokens = valuation.scale(FixedPoint.ONE.n, oneBPTValue.n).n;

    // This is in 8 decimal precision
    return TypedBigNumber.from(
      tokens,
      BigNumberType.StrategyToken,
      this.getVaultSymbol(maturity)
    );
  }

  public getDepositParameters(
    _maturity: number,
    _depositAmount: TypedBigNumber,
    _slippageBuffer: number,
    _blockTime?: number
  ) {
    // TODO: need to get minBPT
    return {
      minBPT: BigNumber.from(0),
      tradeData: '0x',
    };
  }

  public async getDepositParametersExact(
    maturity: number,
    depositAmount: TypedBigNumber,
    slippageBuffer: number,
    blockTime?: number
  ) {
    return this.getDepositParameters(
      maturity,
      depositAmount,
      slippageBuffer,
      blockTime
    );
  }

  public getRedeemParameters(
    _maturity: number,
    _strategyTokens: TypedBigNumber,
    _slippageBuffer: number,
    _blockTime?: number
  ) {
    // TODO: need to get min primary and secondary, also specify trade
    return {
      minSecondaryLendRate: 0, // TODO: should this be here?
      minPrimary: BigNumber.from(0),
      minSecondary: BigNumber.from(0),
      secondaryTradeParams: '0x',
    };
  }

  public async getRedeemParametersExact(
    maturity: number,
    strategyTokens: TypedBigNumber,
    slippageBuffer: number,
    blockTime?: number
  ) {
    return this.getRedeemParameters(
      maturity,
      strategyTokens,
      slippageBuffer,
      blockTime
    );
  }

  public getSlippageForDeposit(
    _maturity: number,
    _depositAmount: TypedBigNumber,
    _strategyTokens: TypedBigNumber,
    _params: DepositParams,
    _blockTime?: number
  ) {
    return { likelySlippage: 0, worstCaseSlippage: 0 };
  }

  // eslint-ignore unused-parameters
  public getSlippageForRedeem(
    _maturity: number,
    _redeemAmount: TypedBigNumber,
    _strategyTokens: TypedBigNumber,
    _params: RedeemParams,
    _blockTime?: number
  ) {
    return { likelySlippage: 0, worstCaseSlippage: 0 };
  }

  public getStrategyTokensGivenDeposit(
    maturity: number,
    depositAmount: TypedBigNumber,
    slippageBuffer: number,
    blockTime?: number,
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
      depositParams: this.getDepositParameters(
        maturity,
        depositAmount,
        slippageBuffer,
        blockTime
      ),
    };
  }

  public getRedeemGivenStrategyTokens(
    maturity: number,
    strategyTokens: TypedBigNumber,
    slippageBuffer: number,
    blockTime?: number,
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
      redeemParams: this.getRedeemParameters(
        maturity,
        strategyTokens,
        slippageBuffer,
        blockTime
      ),
    };
  }

  public getDepositGivenStrategyTokens(
    maturity: number,
    strategyTokens: TypedBigNumber,
    slippageBuffer: number,
    blockTime?: number,
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
    const initialMultiple = this.getBPTValue()
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
      depositParams: this.getDepositParameters(
        maturity,
        requiredDeposit,
        slippageBuffer,
        blockTime
      ),
    };
  }

  public getStrategyTokensGivenRedeem(
    maturity: number,
    redeemAmount: TypedBigNumber,
    slippageBuffer: number,
    blockTime?: number,
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
      .div(this.getBPTValue())
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
      redeemParams: this.getRedeemParameters(
        maturity,
        strategyTokens,
        slippageBuffer,
        blockTime
      ),
    };
  }
}
