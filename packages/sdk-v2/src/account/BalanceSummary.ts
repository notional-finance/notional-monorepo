import { utils } from 'ethers';
import { Balance, BalanceHistory, NTokenStatus, ReturnsBreakdown, TransactionHistory } from '../libs/types';
import AccountData from './AccountData';
import { System, FreeCollateral, NTokenValue } from '../system';
import TypedBigNumber, { BigNumberType } from '../libs/TypedBigNumber';
import { Currency, nToken } from '../data';
import { RATE_PRECISION } from '../config/constants';

export default class BalanceSummary {
  private currency: Currency;

  private nToken?: nToken;

  public get hashKey() {
    return utils.id(`${this.currencyId}:${this.assetCashBalance.toString()}:${this.nTokenBalance?.toString()}`);
  }

  public get underlyingSymbol() {
    return this.currency.underlyingSymbol || this.currency.assetSymbol;
  }

  public get symbol() {
    return this.currency.assetSymbol;
  }

  public get nTokenSymbol() {
    return this.nToken?.nTokenSymbol;
  }

  public get totalUnderlyingValueDisplayString() {
    return this.totalUnderlyingValue.toDisplayString();
  }

  public get totalUnderlyingValue() {
    if (this.nTokenValueUnderlying) {
      return this.assetCashValueUnderlying.add(this.nTokenValueUnderlying);
    }

    return this.assetCashValueUnderlying;
  }

  public get totalCTokenInterest() {
    const netUnderlyingDeposit = this.history.reduce(
      (s, b) => s.add(b.assetCashValueUnderlyingAfter.sub(b.assetCashValueUnderlyingBefore)),
      this.assetCashValueUnderlying.copy(0)
    );

    const netAssetCashDeposit = this.history.reduce(
      (s, b) => s.add(b.assetCashBalanceAfter.sub(b.assetCashBalanceBefore)),
      this.assetCashBalance.copy(0)
    );

    return netAssetCashDeposit.toUnderlying().sub(netUnderlyingDeposit);
  }

  public get totalNTokenInterest() {
    return this.totalInterestAccrued.sub(this.totalCTokenInterest);
  }

  public get totalInterestAccrued() {
    let totalUnderlyingValue: TypedBigNumber;
    if (this.nTokenValueUnderlying) {
      totalUnderlyingValue = this.assetCashValueUnderlying.add(this.nTokenValueUnderlying);
    } else {
      totalUnderlyingValue = this.assetCashValueUnderlying;
    }

    const netUnderlyingDeposit = this.history.reduce(
      (s, b) => s.add(b.totalUnderlyingValueChange),
      totalUnderlyingValue.copy(0)
    );

    return totalUnderlyingValue.sub(netUnderlyingDeposit);
  }

  private static formatYieldRate(rate: number, locale = 'en-US', precision = 3) {
    return `${(rate * 100).toLocaleString(locale, {
      maximumFractionDigits: precision,
      minimumFractionDigits: precision,
    })}%`;
  }

  public get cTokenYieldDisplayString() {
    const cTokenYield = System.getSystem().getCashGroup(this.currencyId).blockSupplyRate / RATE_PRECISION;
    return BalanceSummary.formatYieldRate(cTokenYield);
  }

  public get assetCashBalanceDisplayString() {
    return this.assetCashBalance.toDisplayString();
  }

  public get underlyingCashBalanceDisplayString() {
    return this.assetCashValueUnderlying.toDisplayString();
  }

  public get isWithdrawable() {
    return this.maxWithdrawValueAssetCash.isPositive();
  }

  // Returns cash balance and nToken withdraw amounts
  public getWithdrawAmounts(withdrawAmountInternalAsset: TypedBigNumber, preferCash: boolean) {
    withdrawAmountInternalAsset.check(BigNumberType.InternalAsset, this.currency.assetSymbol);
    const nTokenStatus = NTokenValue.getNTokenStatus(withdrawAmountInternalAsset.currencyId);
    const canWithdrawNToken = nTokenStatus === NTokenStatus.Ok || nTokenStatus === NTokenStatus.nTokenHasResidual;

    if (withdrawAmountInternalAsset.gt(this.maxWithdrawValueAssetCash)) {
      throw new Error('Cannot withdraw, over maximum value');
    } else if (!canWithdrawNToken || !this.nTokenBalance || this.nTokenBalance.isZero()) {
      // If the nToken cannot be withdrawn, only return cash amounts
      const cashWithdraw = TypedBigNumber.min(withdrawAmountInternalAsset, this.assetCashBalance);
      const nTokenRedeem = this.nTokenBalance?.copy(0);
      return { cashWithdraw, nTokenRedeem };
    } else if (preferCash) {
      // Cash preference supersedes nToken
      if (withdrawAmountInternalAsset.lte(this.assetCashBalance)) {
        // Cash is sufficient to cover the withdraw
        return {
          cashWithdraw: withdrawAmountInternalAsset,
          nTokenRedeem: this.nTokenBalance?.copy(0),
        };
      }
      // Withdraw all cash and some part of the nToken balance
      const requiredNTokenRedeem = withdrawAmountInternalAsset.sub(this.assetCashBalance);
      const nTokenRedeem = NTokenValue.getNTokenRedeemFromAsset(this.currencyId, requiredNTokenRedeem);

      return {
        cashWithdraw: this.assetCashBalance,
        // Cap the nTokenRedeem at the balance, it may go slightly over due to the reverse approximation inside
        // getNTokenRedeemFromAsset
        nTokenRedeem: TypedBigNumber.min(nTokenRedeem, this.nTokenBalance),
      };
    } else {
      // nToken supersedes cash and we know there is some nToken balance
      const nTokenRedeem = NTokenValue.getNTokenRedeemFromAsset(this.currencyId, withdrawAmountInternalAsset);
      if (nTokenRedeem.lte(this.nTokenBalance)) {
        // nTokenRedeem is sufficient for the withdraw
        return { cashWithdraw: this.assetCashBalance.copy(0), nTokenRedeem };
      }

      // Withdraw all nToken balance and some part of the cash
      const nTokenRedeemValue = NTokenValue.getAssetFromRedeemNToken(this.currencyId, this.nTokenBalance);
      const cashWithdraw = withdrawAmountInternalAsset.sub(nTokenRedeemValue);
      return { cashWithdraw, nTokenRedeem: this.nTokenBalance };
    }
  }

  public static getTransactionHistory(history: BalanceHistory[]): TransactionHistory[] {
    return history.map((h) => ({
      currencyId: h.currencyId,
      txnType: h.tradeType,
      timestampMS: h.blockTime.getTime(),
      transactionHash: h.transactionHash,
      amount: h.totalUnderlyingValueChange,
    }));
  }

  public getTransactionHistory(): TransactionHistory[] {
    return BalanceSummary.getTransactionHistory(this.history);
  }

  public getReturnsBreakdown(): ReturnsBreakdown[] {
    const returnsBreakdown: ReturnsBreakdown[] = [];

    if (!this.assetCashBalance.isZero()) {
      returnsBreakdown.push({
        source: this.symbol,
        balance: this.assetCashBalance,
        value: this.assetCashValueUnderlying,
        interestEarned: this.totalCTokenInterest,
      });
    }

    if (this.nTokenBalance && this.nTokenBalance.isPositive()) {
      returnsBreakdown.push({
        source: this.nTokenSymbol!,
        balance: this.nTokenBalance,
        value: this.nTokenValueUnderlying!,
        interestEarned: this.totalNTokenInterest,
      });
    }

    return returnsBreakdown;
  }

  constructor(
    public currencyId: number,
    public assetCashBalance: TypedBigNumber,
    public assetCashValueUnderlying: TypedBigNumber,
    public nTokenBalance: TypedBigNumber | undefined,
    public nTokenValueUnderlying: TypedBigNumber | undefined,
    public claimableIncentives: TypedBigNumber,
    public history: BalanceHistory[],
    public maxWithdrawValueAssetCash: TypedBigNumber
  ) {
    const system = System.getSystem();
    this.currency = system.getCurrencyById(this.currencyId);
    this.nToken = system.getNToken(this.currencyId);
  }

  public static build(accountData: AccountData) {
    const system = System.getSystem();
    const { netETHCollateralWithHaircut, netETHDebtWithBuffer, netUnderlyingAvailable } =
      FreeCollateral.getFreeCollateral(accountData);
    const fcAggregate = netETHCollateralWithHaircut.sub(netETHDebtWithBuffer);

    return (
      accountData.accountBalances
        .map((v) => {
          const filteredHistory = accountData.getBalanceHistory(v.currencyId);

          const claimableIncentives = v.nTokenBalance
            ? NTokenValue.getClaimableIncentives(v.currencyId, v.nTokenBalance, v.lastClaimTime, v.accountIncentiveDebt)
            : TypedBigNumber.fromBalance(0, 'NOTE', true);

          const currency = system.getCurrencyById(v.currencyId);
          const underlyingSymbol = currency.underlyingSymbol || currency.assetSymbol;
          const localNetAvailable =
            netUnderlyingAvailable.get(v.currencyId) ||
            TypedBigNumber.from(0, BigNumberType.InternalUnderlying, underlyingSymbol);
          const maxWithdrawValueAssetCash = BalanceSummary.getMaxWithdrawData(
            v,
            fcAggregate,
            localNetAvailable,
            system,
            accountData.hasAssetDebt || accountData.hasCashDebt
          );

          return new BalanceSummary(
            v.currencyId,
            v.cashBalance,
            v.cashBalance.toUnderlying(),
            v.nTokenBalance,
            v.nTokenBalance
              ? NTokenValue.convertNTokenToInternalAsset(v.currencyId, v.nTokenBalance, false).toUnderlying()
              : undefined,
            claimableIncentives,
            filteredHistory,
            maxWithdrawValueAssetCash
          );
        })
        // Ensure that there is some balance for each summary
        .filter((b) => !b.assetCashBalance.isZero() || (b.nTokenBalance && b.nTokenBalance.isPositive()))
        .sort((a, b) => a.currencyId - b.currencyId)
    );
  }

  /**
   * Gets the currencies that can be withdrawn from the account
   * @returns the maximum an account can withdraw in this balance in asset cash terms
   */
  private static getMaxWithdrawData(
    balance: Balance,
    fcAggregate: TypedBigNumber,
    localNetAvailable: TypedBigNumber,
    system: System,
    hasDebt: boolean
  ) {
    let nTokenAssetPV: TypedBigNumber | undefined;
    const nTokenStatus = NTokenValue.getNTokenStatus(balance.currencyId);
    if (nTokenStatus === NTokenStatus.Ok || nTokenStatus === NTokenStatus.nTokenHasResidual) {
      // We don't need to take the haircut on the nTokenBalance because this is already taken into
      // account in the free collateral calculation.
      nTokenAssetPV = balance.nTokenBalance?.toAssetCash(true);
    }

    const totalAccountAssetValue = nTokenAssetPV ? balance.cashBalance.add(nTokenAssetPV) : balance.cashBalance;
    if (!hasDebt) return totalAccountAssetValue;

    const { haircut, buffer } = system.getETHRate(balance.currencyId);
    const multiplier = localNetAvailable.isPositive() ? haircut : buffer;
    let fcLocal: TypedBigNumber;
    if (multiplier === 0) {
      // If multiplier is zero then the user can withdraw the local net available, there is no collateral
      // value to the currency
      fcLocal = localNetAvailable;
    } else {
      fcLocal = fcAggregate.fromETH(balance.currencyId).scale(100, multiplier);
    }

    // If fc is negative then undercollateralized and cannot withdraw.
    if (fcLocal.isNegative()) {
      return balance.cashBalance.copy(0);
    }

    const fcLocalAsset = fcLocal.toAssetCash(true);
    return fcLocalAsset.lt(totalAccountAssetValue) ? fcLocalAsset : totalAccountAssetValue;
  }
}
