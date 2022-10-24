import { SecondaryBorrowArray } from '../../data';
import { AggregateCall } from '../../data/Multicall';
import TypedBigNumber from '../../libs/TypedBigNumber';
import { LiquidationThreshold } from '../../libs/types';
import VaultAccount from '../VaultAccount';

export default abstract class AbstractStrategy<D, R, I> {
  abstract readonly depositTuple: string;

  abstract readonly redeemTuple: string;

  protected _initParams: I | undefined;

  public get initParams() {
    if (!this._initParams) throw Error('Vault not initialized');
    return this._initParams;
  }

  public abstract initVaultParams(): AggregateCall[];

  public abstract getLiquidationThresholds(
    vaultAccount: VaultAccount,
    blockTime: number
  ): Array<LiquidationThreshold>;

  public abstract getStrategyTokenValue(
    vaultAccount: VaultAccount
  ): TypedBigNumber;

  public abstract getStrategyTokensFromValue(
    maturity: number,
    valuation: TypedBigNumber,
    blockTime?: number
  ): TypedBigNumber;

  public abstract getDepositParametersExact(
    maturity: number,
    depositAmount: TypedBigNumber,
    slippageBuffer: number,
    blockTime?: number
  ): Promise<D>;

  public abstract getRedeemParametersExact(
    maturity: number,
    strategyTokens: TypedBigNumber,
    slippageBuffer: number,
    blockTime?: number
  ): Promise<R>;

  public abstract getDepositGivenStrategyTokens(
    maturity: number,
    strategyTokens: TypedBigNumber,
    blockTime?: number,
    vaultAccount?: VaultAccount
  ): {
    requiredDeposit: TypedBigNumber;
    secondaryfCashBorrowed: SecondaryBorrowArray;
  };

  public abstract getStrategyTokensGivenDeposit(
    maturity: number,
    depositAmount: TypedBigNumber,
    blockTime?: number,
    vaultAccount?: VaultAccount
  ): {
    strategyTokens: TypedBigNumber;
    secondaryfCashBorrowed: SecondaryBorrowArray;
  };

  public abstract getRedeemGivenStrategyTokens(
    maturity: number,
    strategyTokens: TypedBigNumber,
    blockTime?: number,
    vaultAccount?: VaultAccount
  ): {
    amountRedeemed: TypedBigNumber;
    secondaryfCashRepaid: SecondaryBorrowArray;
  };

  public abstract getStrategyTokensGivenRedeem(
    maturity: number,
    redeemAmount: TypedBigNumber,
    blockTime?: number,
    vaultAccount?: VaultAccount
  ): {
    strategyTokens: TypedBigNumber;
    secondaryfCashRepaid: SecondaryBorrowArray;
  };
}
