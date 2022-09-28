import { providers, utils } from 'ethers';
import { VaultConfig } from '..';
import {
  BASIS_POINT,
  INTERNAL_TOKEN_PRECISION,
  RATE_PRECISION,
  SECONDS_IN_YEAR,
} from '../config/constants';
import { aggregate } from '../data/Multicall';
import TypedBigNumber, { BigNumberType } from '../libs/TypedBigNumber';
import { getNowSeconds, populateTxnAndGas } from '../libs/utils';
import { System, CashGroup, Market } from '../system';
import doBinarySearchApprox from './Approximation';
import AbstractStrategy from './strategy/AbstractStrategy';
import VaultAccount from './VaultAccount';

export default abstract class BaseVault<
  D,
  R,
  I extends Record<string, any>
> extends AbstractStrategy<D, R, I> {
  public static collateralToLeverageRatio(collateralRatio: number): number {
    return (
      Math.floor((RATE_PRECISION / collateralRatio) * RATE_PRECISION) +
      RATE_PRECISION
    );
  }

  public static leverageToCollateralRatio(leverageRatio: number): number {
    return Math.floor(
      (RATE_PRECISION / (leverageRatio - RATE_PRECISION)) * RATE_PRECISION
    );
  }

  public encodeDepositParams(depositParams: D) {
    return utils.defaultAbiCoder.encode([this.depositTuple], [depositParams]);
  }

  public encodeRedeemParams(redeemParams: R) {
    return utils.defaultAbiCoder.encode([this.redeemTuple], [redeemParams]);
  }

  constructor(public vaultAddress: string, initParams?: I) {
    super();
    this._initParams = initParams;
  }

  public async initializeVault(provider: providers.Provider) {
    const initParamCalls = this.initVaultParams();
    const { blockNumber, results: initParams } = await aggregate<I>(
      initParamCalls,
      provider
    );
    this._initParams = initParams;
    return { blockNumber, initParams };
  }

  public getVaultState(maturity: number) {
    return System.getSystem().getVaultState(this.vaultAddress, maturity);
  }

  public getVault() {
    return System.getSystem().getVault(this.vaultAddress);
  }

  public getVaultSymbol(maturity: number) {
    return System.getSystem().getVaultSymbol(this.vaultAddress, maturity);
  }

  public getPrimaryBorrowSymbol() {
    return System.getSystem().getUnderlyingSymbol(
      this.getVault().primaryBorrowCurrency
    );
  }

  public getLiquidationVaultShareValue(vaultAccount: VaultAccount) {
    // Liquidation exchange rate is the exchange rate where the value of the vault shares
    // is below the minimum required collateral ratio of the borrowed currency
    if (vaultAccount.vaultShares.isZero()) {
      return {
        liquidationVaultSharesValue: vaultAccount.primaryBorrowfCash.copy(0),
        perShareValue: vaultAccount.primaryBorrowfCash.copy(0),
      };
    }

    // minCollateralRatio = (vaultShares - debtOutstanding) / debtOutstanding
    // minCollateralRatio * debtOutstanding + debtOutstanding = vaultShares
    // (minCollateralRatio + 1) * debtOutstanding = vaultSharesValue
    const debtOutstanding = vaultAccount.primaryBorrowfCash.neg();
    const minCollateralRatio = this.getVault().minCollateralRatioBasisPoints;

    // If the account's vault shares reach this value then they will become eligible for liquidation
    const liquidationVaultSharesValue = debtOutstanding.scale(
      minCollateralRatio + RATE_PRECISION,
      RATE_PRECISION
    );

    return {
      liquidationVaultSharesValue,
      perShareValue: liquidationVaultSharesValue.scale(
        INTERNAL_TOKEN_PRECISION,
        vaultAccount.vaultShares
      ),
    };
  }

  public getDebtShareSymbol(index: 0 | 1, maturity: number) {
    return System.getSystem().getDebtShareSymbol(
      this.vaultAddress,
      maturity,
      index
    );
  }

  public getVaultMarket(maturity: number) {
    const vault = this.getVault();
    const marketIndex = CashGroup.getMarketIndexForMaturity(maturity);
    if (marketIndex > vault.maxBorrowMarketIndex)
      throw Error(`Invalid maturity for vault ${vault.name}`);
    return System.getSystem()
      .getCashGroup(vault.primaryBorrowCurrency)
      .getMarket(marketIndex);
  }

  // Account Descriptive Factors
  public getCollateralRatio(vaultAccount: VaultAccount) {
    if (vaultAccount.primaryBorrowfCash.isZero()) return null;

    const debtOutstanding = vaultAccount.primaryBorrowfCash.toAssetCash().neg();
    const netAssetValue =
      this.getCashValueOfShares(vaultAccount).sub(debtOutstanding);
    return netAssetValue.scale(RATE_PRECISION, debtOutstanding.n).toNumber();
  }

  public getLeverageRatio(vaultAccount: VaultAccount) {
    const debtOutstanding = vaultAccount.primaryBorrowfCash.toAssetCash().neg();
    const netAssetValue =
      this.getCashValueOfShares(vaultAccount).sub(debtOutstanding);
    if (netAssetValue.isZero()) return RATE_PRECISION;

    // Minimum leverage ratio is 1
    return (
      debtOutstanding.scale(RATE_PRECISION, netAssetValue.n).toNumber() +
      RATE_PRECISION
    );
  }

  public getCashValueOfShares(vaultAccount: VaultAccount) {
    const { assetCash } = vaultAccount.getPoolShare();
    const underlyingStrategyTokenValue =
      this.getStrategyTokenValue(vaultAccount);

    return assetCash.add(underlyingStrategyTokenValue.toAssetCash());
  }

  public getPoolShare(maturity: number, vaultShares: TypedBigNumber) {
    const vaultState = this.getVaultState(maturity);
    if (vaultState.totalVaultShares.isZero()) {
      return {
        assetCash: vaultState.totalAssetCash.copy(0),
        strategyTokens: vaultState.totalStrategyTokens.copy(0),
      };
    }

    return {
      assetCash: vaultState.totalAssetCash.scale(
        vaultShares,
        vaultState.totalVaultShares
      ),
      strategyTokens: vaultState.totalStrategyTokens.scale(
        vaultShares,
        vaultState.totalVaultShares
      ),
    };
  }

  // Operations
  public static getDepositedCashFromBorrow(
    market: Market,
    vault: VaultConfig,
    fCashToBorrow: TypedBigNumber,
    blockTime = getNowSeconds()
  ) {
    const { netCashToAccount: cashToBorrow } =
      market.getCashAmountGivenfCashAmount(fCashToBorrow, blockTime);
    const assessedFee = BaseVault.assessVaultFees(
      market.maturity,
      vault,
      cashToBorrow,
      blockTime
    );
    return {
      cashToVault: cashToBorrow.sub(assessedFee),
      assessedFee,
    };
  }

  public static assessVaultFees(
    maturity: number,
    vault: VaultConfig,
    cashBorrowed: TypedBigNumber,
    blockTime = getNowSeconds()
  ) {
    const annualizedFeeRate = vault.feeRateBasisPoints;
    const feeRate = Math.floor(
      annualizedFeeRate * ((maturity - blockTime) / SECONDS_IN_YEAR)
    );
    return cashBorrowed.scale(feeRate, RATE_PRECISION);
  }

  public getDepositedCashFromBorrow(
    maturity: number,
    fCashToBorrow: TypedBigNumber,
    blockTime = getNowSeconds()
  ) {
    const market = this.getVaultMarket(maturity);
    return BaseVault.getDepositedCashFromBorrow(
      market,
      this.getVault(),
      fCashToBorrow,
      blockTime
    );
  }

  public assessVaultFees(
    maturity: number,
    cashBorrowed: TypedBigNumber,
    blockTime = getNowSeconds()
  ) {
    return BaseVault.assessVaultFees(
      maturity,
      this.getVault(),
      cashBorrowed,
      blockTime
    );
  }

  public getCostToRepay(
    vaultAccount: VaultAccount,
    fCashDebtToRepay: TypedBigNumber,
    blockTime = getNowSeconds()
  ) {
    const { assetCash } = vaultAccount.getPoolShare();
    const vaultMarket = this.getVaultMarket(vaultAccount.maturity);
    // Calculate the cost to exit the position
    let costToLend: TypedBigNumber;
    try {
      // netCashToAccount is negative here
      const { netCashToAccount } = vaultMarket.getCashAmountGivenfCashAmount(
        fCashDebtToRepay.neg(),
        blockTime
      );
      costToLend = netCashToAccount.toAssetCash().sub(assetCash);
    } catch {
      // If unable to lend then the cost to lend is at 0% interest
      costToLend = fCashDebtToRepay.toAssetCash();
    }

    // Cost to lend returned is negative
    return costToLend;
  }

  public checkBorrowCapacity(fCashToBorrow: TypedBigNumber) {
    const fCashCurrency = System.getSystem().getCurrencyBySymbol(
      fCashToBorrow.symbol
    );
    const vault = this.getVault();
    if (fCashCurrency.id === vault.primaryBorrowCurrency) {
      return vault.totalUsedPrimaryBorrowCapacity
        .add(fCashToBorrow)
        .lte(vault.maxPrimaryBorrowCapacity);
    }
    if (vault.secondaryBorrowCurrencies) {
      if (vault.secondaryBorrowCurrencies[0] === fCashCurrency.id) {
        return vault
          .totalUsedSecondaryBorrowCapacity![0]!.add(fCashToBorrow)
          .lte(vault.maxSecondaryBorrowCapacity![0]!);
      }
      if (vault.secondaryBorrowCurrencies[1] === fCashCurrency.id) {
        return vault
          .totalUsedSecondaryBorrowCapacity![1]!.add(fCashToBorrow)
          .lte(vault.maxSecondaryBorrowCapacity![1]!);
      }
    }

    throw Error(
      `${fCashToBorrow.symbol} is not valid currency for vault ${vault.name}`
    );
  }

  // Vault Operations
  public simulateEnter(
    vaultAccount: VaultAccount,
    maturity: number,
    fCashToBorrow: TypedBigNumber,
    depositAmount: TypedBigNumber,
    slippageBuffer: number,
    blockTime = getNowSeconds()
  ) {
    const vaultState = this.getVaultState(maturity);
    if (vaultState.isSettled || vaultState.totalAssetCash.isPositive()) {
      throw Error('Cannot enter vault');
    }
    const { cashToVault, assessedFee } = this.getDepositedCashFromBorrow(
      maturity,
      fCashToBorrow,
      blockTime
    );
    let totalCashDeposit = cashToVault.add(depositAmount);
    const newVaultAccount = VaultAccount.copy(vaultAccount);

    if (vaultAccount.canSettle()) {
      const { assetCash, strategyTokens } =
        newVaultAccount.settleVaultAccount();
      newVaultAccount.updateMaturity(maturity);
      newVaultAccount.addStrategyTokens(
        TypedBigNumber.from(
          strategyTokens.n,
          BigNumberType.StrategyToken,
          newVaultAccount.vaultSymbol
        ),
        true
      );
      totalCashDeposit = totalCashDeposit.add(assetCash.toUnderlying());
    } else if (vaultAccount.maturity === 0) {
      newVaultAccount.updateMaturity(maturity);
    }
    if (newVaultAccount.maturity !== maturity)
      throw Error('Cannot Enter, Invalid Maturity');

    const { strategyTokens, secondaryfCashBorrowed, depositParams } =
      this.getStrategyTokensGivenDeposit(
        newVaultAccount.maturity,
        totalCashDeposit,
        slippageBuffer,
        blockTime
      );
    if (!this.checkBorrowCapacity(fCashToBorrow.neg()))
      throw Error('Exceeds max primary borrow capacity');

    if (secondaryfCashBorrowed) {
      if (
        secondaryfCashBorrowed[0] &&
        !this.checkBorrowCapacity(secondaryfCashBorrowed[0])
      )
        throw Error('Exceeds max secondary borrow capacity');
      if (
        secondaryfCashBorrowed[1] &&
        !this.checkBorrowCapacity(secondaryfCashBorrowed[1])
      )
        throw Error('Exceeds max secondary borrow capacity');
    }

    newVaultAccount.updatePrimaryBorrowfCash(fCashToBorrow, true);
    newVaultAccount.addStrategyTokens(strategyTokens, true);
    newVaultAccount.addSecondaryDebtShares(secondaryfCashBorrowed, true);

    return {
      assessedFee,
      totalCashDeposit,
      newVaultAccount,
      depositParams,
    };
  }

  public simulateExitPostMaturity(
    vaultAccount: VaultAccount,
    slippageBuffer: number,
    blockTime = getNowSeconds()
  ) {
    const vaultState = this.getVaultState(vaultAccount.maturity);
    if (!vaultState.isSettled) throw Error('Cannot exit, not settled');
    const newVaultAccount = VaultAccount.copy(vaultAccount);

    const { assetCash, strategyTokens } = newVaultAccount.settleVaultAccount();
    const { amountRedeemed, redeemParams } = this.getRedeemGivenStrategyTokens(
      // Pass the previous vault account prior to settlement (which clears all the attributes)
      vaultAccount.maturity,
      strategyTokens,
      slippageBuffer,
      blockTime
    );

    return {
      amountRedeemed: amountRedeemed
        .toInternalPrecision()
        .add(assetCash.toUnderlying(true)),
      redeemParams,
      newVaultAccount,
    };
  }

  public getExitParamsFromLeverageRatio(
    vaultAccount: VaultAccount,
    leverageRatio: number,
    slippageBuffer: number,
    blockTime = getNowSeconds(),
    precision = BASIS_POINT * 50
  ) {
    if (leverageRatio < RATE_PRECISION)
      throw new Error('Leverage Ratio below 1');
    const currentLeverageRatio = this.getLeverageRatio(vaultAccount);
    if (currentLeverageRatio === null || leverageRatio > currentLeverageRatio)
      throw new Error('Leverage Ratio above current');
    const { minAccountBorrowSize } = this.getVault();
    const tempVaultAccount = VaultAccount.copy(vaultAccount);

    const calculationFunction = (multiple: number) => {
      const assetValue =
        this.getCashValueOfShares(tempVaultAccount).toUnderlying();
      // Given the net asset value, in order to achieve the target leverage
      // ratio we must reduce debt outstanding to this figure:
      //  debtOutstanding / (assetValue - debtOutstanding) + 1 = leverageRatio
      //  =>
      //  ((leverageRatio - 1) * assetValue) / leverageRatio = debtOutstanding
      const targetDebtOutstanding = assetValue
        .scale(leverageRatio - RATE_PRECISION, leverageRatio)
        .neg();

      const fCashToLend = targetDebtOutstanding.abs().lt(minAccountBorrowSize)
        ? vaultAccount.primaryBorrowfCash.neg()
        : // We scale this lend amount by a multiple because assetValue will decrease as a result of
          // selling tokens to lend
          targetDebtOutstanding
            .sub(vaultAccount.primaryBorrowfCash)
            .scale(multiple, RATE_PRECISION);

      const { newVaultAccount } = this.simulateExitPreMaturityGivenRepayment(
        vaultAccount,
        fCashToLend,
        slippageBuffer,
        blockTime
      );
      const actualLeverageRatio = this.getLeverageRatio(newVaultAccount);

      return {
        actualMultiple: actualLeverageRatio,
        breakLoop: actualLeverageRatio === RATE_PRECISION,
        value: fCashToLend,
      };
    };

    // prettier-ignore
    const fCashToLend = doBinarySearchApprox(
      leverageRatio,
      leverageRatio,
      calculationFunction,
      precision,
      // Need a custom adjustment here
      (m, d) => Math.floor(m - d * 2)
    );
    return this.simulateExitPreMaturityGivenRepayment(
      vaultAccount,
      fCashToLend,
      slippageBuffer,
      blockTime
    );
  }

  public simulateExitPreMaturityGivenRepayment(
    vaultAccount: VaultAccount,
    fCashToLend: TypedBigNumber,
    slippageBuffer: number,
    blockTime = getNowSeconds()
  ) {
    const vaultState = this.getVaultState(vaultAccount.maturity);
    if (vaultState.maturity <= blockTime || vaultState.isSettled)
      throw Error('Cannot Exit, in Settlement');
    if (fCashToLend.add(vaultAccount.primaryBorrowfCash).isPositive())
      throw Error('Cannot lend to positive balance');

    const newVaultAccount = VaultAccount.copy(vaultAccount);
    const costToRepay = this.getCostToRepay(
      vaultAccount,
      fCashToLend.neg(),
      blockTime
    );
    const { strategyTokens, secondaryfCashRepaid, redeemParams } =
      this.getStrategyTokensGivenRedeem(
        newVaultAccount.maturity,
        costToRepay.neg().toUnderlying(),
        slippageBuffer,
        blockTime
      );

    const vaultSharesToRedeemAtCost = vaultState.totalVaultShares.scale(
      strategyTokens,
      vaultState.totalStrategyTokens
    );
    newVaultAccount.updateVaultShares(vaultSharesToRedeemAtCost.neg(), true);
    newVaultAccount.updatePrimaryBorrowfCash(fCashToLend, true);
    newVaultAccount.addSecondaryDebtShares(secondaryfCashRepaid, true);

    return {
      costToRepay,
      vaultSharesToRedeemAtCost,
      redeemParams,
      newVaultAccount,
    };
  }

  public simulateExitPreMaturityGivenWithdraw(
    vaultAccount: VaultAccount,
    amountWithdrawn: TypedBigNumber,
    slippageBuffer: number,
    blockTime = getNowSeconds()
  ) {
    const vaultState = this.getVaultState(vaultAccount.maturity);
    if (vaultState.maturity <= blockTime || vaultState.isSettled)
      throw Error('Cannot Exit, in Settlement');

    const newVaultAccount = VaultAccount.copy(vaultAccount);
    const { strategyTokens, secondaryfCashRepaid, redeemParams } =
      this.getStrategyTokensGivenRedeem(
        newVaultAccount.maturity,
        amountWithdrawn,
        slippageBuffer,
        blockTime
      );

    const vaultSharesToRedeemAtCost = vaultState.totalVaultShares.scale(
      strategyTokens,
      vaultState.totalStrategyTokens
    );
    newVaultAccount.updateVaultShares(vaultSharesToRedeemAtCost.neg(), true);
    newVaultAccount.addSecondaryDebtShares(secondaryfCashRepaid, true);

    return {
      vaultSharesToRedeemAtCost,
      redeemParams,
      newVaultAccount,
    };
  }

  public simulateRollPosition(
    _vaultAccount: VaultAccount,
    newMaturity: number,
    depositAmount: TypedBigNumber,
    slippageBuffer: number,
    blockTime = getNowSeconds()
  ) {
    const vault = this.getVault();
    if (!vault.allowRollPosition) throw Error('Cannot roll position in vault');

    const vaultAccount = VaultAccount.copy(_vaultAccount);
    const vaultState = this.getVaultState(vaultAccount.maturity);
    if (vaultState.maturity <= blockTime || vaultState.isSettled)
      throw Error('Cannot Roll, in Settlement');

    // This is a negative number in asset cash terms
    const costToRepay = this.getCostToRepay(
      vaultAccount,
      vaultAccount.primaryBorrowfCash,
      blockTime
    ).add(depositAmount.toAssetCash());

    // Calculate amount to borrow to get sufficient funds for cost to lend
    let fCashToBorrowForRepayment: TypedBigNumber;
    if (costToRepay.isNegative()) {
      const newVaultMarket = this.getVaultMarket(newMaturity);
      const assessedFee = this.assessVaultFees(
        newMaturity,
        costToRepay.neg(),
        blockTime
      );
      fCashToBorrowForRepayment = newVaultMarket
        .getfCashAmountGivenCashAmount(
          costToRepay.neg().add(assessedFee).toUnderlying(),
          blockTime
        )
        // Buffer the fcash to borrow by some slippage amount
        .scale(slippageBuffer + RATE_PRECISION, RATE_PRECISION);

      if (
        !this.checkBorrowCapacity(
          fCashToBorrowForRepayment.sub(vaultAccount.primaryBorrowfCash).neg()
        )
      )
        throw Error('Exceeds max primary borrow capacity');
    } else {
      // This may trip minimum borrow requirements
      fCashToBorrowForRepayment = vaultAccount.primaryBorrowfCash.copy(0);
    }

    // These strategy tokens are transferred from one maturity to the next
    const { strategyTokens } = vaultAccount.getPoolShare();
    const newVaultAccount = VaultAccount.emptyVaultAccount(this.vaultAddress);
    newVaultAccount.updateMaturity(newMaturity);
    newVaultAccount.addStrategyTokens(
      TypedBigNumber.from(
        strategyTokens.n,
        BigNumberType.StrategyToken,
        newVaultAccount.vaultSymbol
      ),
      true
    );
    newVaultAccount.updatePrimaryBorrowfCash(fCashToBorrowForRepayment, true);

    return {
      fCashToBorrowForRepayment,
      costToRepay,
      newVaultAccount,
    };
  }

  public getfCashBorrowFromLeverageRatio(
    maturity: number,
    depositAmount: TypedBigNumber,
    leverageRatio: number,
    slippageBuffer: number,
    _vaultAccount?: VaultAccount,
    blockTime = getNowSeconds(),
    precision = BASIS_POINT * 50
  ) {
    const vaultAccount =
      _vaultAccount ??
      VaultAccount.emptyVaultAccount(this.vaultAddress, maturity);
    const calculationFunction = (depositMultiple: number) => {
      const valuation = this.getCashValueOfShares(vaultAccount)
        .toUnderlying()
        .add(vaultAccount.primaryBorrowfCash)
        .add(depositAmount)
        .scale(depositMultiple, RATE_PRECISION);
      const strategyTokens = this.getStrategyTokensFromValue(
        maturity,
        valuation,
        blockTime
      );
      const { requiredDeposit } = this.getDepositGivenStrategyTokens(
        maturity,
        strategyTokens,
        slippageBuffer
      );
      const borrowedCash = requiredDeposit.sub(depositAmount);

      // If borrowed cash is negative then floor it at zero
      const fees = borrowedCash.isPositive()
        ? this.assessVaultFees(maturity, borrowedCash, blockTime)
        : borrowedCash.copy(0);
      const fCashToBorrow = borrowedCash.isPositive()
        ? this.getVaultMarket(maturity).getfCashAmountGivenCashAmount(
            borrowedCash.add(fees),
            blockTime
          )
        : borrowedCash.copy(0);

      const { newVaultAccount } = this.simulateEnter(
        vaultAccount,
        maturity,
        fCashToBorrow,
        depositAmount,
        slippageBuffer,
        blockTime
      );

      const actualLeverageRatio = this.getLeverageRatio(newVaultAccount);
      return {
        actualMultiple: actualLeverageRatio,
        breakLoop: false,
        value: fCashToBorrow,
      };
    };

    // The initial multiple should be based on the account's current leverage ratio if
    // it is already set
    let initialMultiple = leverageRatio;
    if (_vaultAccount) {
      const currentLeverageRatio = this.getLeverageRatio(_vaultAccount);
      initialMultiple = Math.floor(
        (currentLeverageRatio * RATE_PRECISION) / leverageRatio
      );
    }

    return doBinarySearchApprox(
      initialMultiple,
      leverageRatio,
      calculationFunction,
      precision
    );
  }

  public async populateEnterTransaction(
    account: string,
    depositAmount: TypedBigNumber,
    maturity: number,
    fCashToBorrow: TypedBigNumber,
    slippageBuffer: number
  ) {
    const system = System.getSystem();
    const notional = system.getNotionalProxy();
    const underlyingSymbol = system.getUnderlyingSymbol(
      this.getVault().primaryBorrowCurrency
    );
    depositAmount.check(BigNumberType.ExternalUnderlying, underlyingSymbol);
    fCashToBorrow.check(BigNumberType.InternalUnderlying, underlyingSymbol);
    const overrides =
      underlyingSymbol === 'ETH' ? { value: depositAmount.n } : {};
    const { cashToVault } = this.getDepositedCashFromBorrow(
      maturity,
      fCashToBorrow
    );
    const totalDepositAmount = cashToVault
      .toExternalPrecision()
      .add(depositAmount);
    const depositParams = await this.getDepositParametersExact(
      maturity,
      totalDepositAmount,
      slippageBuffer
    );

    // Get the market rate and set the maxBorrowRate given the slippage buffer, this is
    // applied prior to fees are assessed.
    const market = this.getVaultMarket(maturity);
    const { netCashToAccount } =
      market.getCashAmountGivenfCashAmount(fCashToBorrow);
    const maxBorrowRate =
      market.interestRate(fCashToBorrow, netCashToAccount) + slippageBuffer;

    return populateTxnAndGas(notional, account, 'enterVault', [
      account,
      this.vaultAddress,
      depositAmount.n,
      maturity,
      fCashToBorrow.neg().n,
      maxBorrowRate,
      this.encodeDepositParams(depositParams),
      overrides,
    ]);
  }

  public async populateExitTransaction(
    account: string,
    maturity: number,
    vaultSharesToRedeem: TypedBigNumber,
    fCashToLend: TypedBigNumber,
    slippageBuffer: number,
    receiver?: string
  ) {
    const system = System.getSystem();
    const notional = system.getNotionalProxy();
    const underlyingSymbol = system.getUnderlyingSymbol(
      this.getVault().primaryBorrowCurrency
    );
    if (vaultSharesToRedeem.type !== BigNumberType.VaultShare)
      throw Error('Invalid vault shares');
    fCashToLend.check(BigNumberType.InternalUnderlying, underlyingSymbol);
    const { strategyTokens } = this.getPoolShare(maturity, vaultSharesToRedeem);
    const redeemParams = await this.getRedeemParametersExact(
      maturity,
      strategyTokens,
      slippageBuffer
    );

    // Get the market rate and set the minLendRate given the slippage buffer
    const market = this.getVaultMarket(maturity);
    const { netCashToAccount } =
      market.getCashAmountGivenfCashAmount(fCashToLend);
    const minLendRate =
      market.interestRate(fCashToLend, netCashToAccount) - slippageBuffer;

    return populateTxnAndGas(notional, account, 'exitVault', [
      account,
      this.vaultAddress,
      receiver ?? account,
      vaultSharesToRedeem.n,
      fCashToLend.n,
      Math.max(minLendRate, 0),
      this.encodeRedeemParams(redeemParams),
    ]);
  }

  public async populateRollTransaction(
    account: string,
    newMaturity: number,
    depositAmount: TypedBigNumber,
    fCashToBorrow: TypedBigNumber,
    slippageBuffer: number,
    vaultAccount: VaultAccount
  ) {
    const system = System.getSystem();
    const notional = system.getNotionalProxy();
    const underlyingSymbol = system.getUnderlyingSymbol(
      this.getVault().primaryBorrowCurrency
    );
    depositAmount.check(BigNumberType.ExternalUnderlying, underlyingSymbol);
    fCashToBorrow.check(BigNumberType.InternalUnderlying, underlyingSymbol);
    const { cashToVault } = this.getDepositedCashFromBorrow(
      newMaturity,
      fCashToBorrow
    );
    const costToRepay = this.getCostToRepay(
      vaultAccount,
      vaultAccount.primaryBorrowfCash
    );
    const totalDepositAmount = costToRepay
      .toUnderlying()
      .toExternalPrecision()
      .add(cashToVault.toExternalPrecision())
      .add(depositAmount);

    if (totalDepositAmount.isNegative())
      throw Error('Negative deposit amount during roll');
    const depositParams = await this.getDepositParametersExact(
      newMaturity,
      totalDepositAmount,
      slippageBuffer
    );

    // Get the market rate and set the minLendRate given the slippage buffer
    const minLendRate =
      this.getVaultMarket(vaultAccount.maturity).interestRate(
        vaultAccount.primaryBorrowfCash,
        costToRepay.toUnderlying()
      ) - slippageBuffer;

    const newMarket = this.getVaultMarket(newMaturity);
    const { netCashToAccount } =
      newMarket.getCashAmountGivenfCashAmount(fCashToBorrow);
    const maxBorrowRate =
      newMarket.interestRate(fCashToBorrow, netCashToAccount) + slippageBuffer;

    return populateTxnAndGas(notional, account, 'rollVaultPosition', [
      account,
      this.vaultAddress,
      fCashToBorrow.neg().n,
      newMaturity,
      depositAmount.n,
      Math.max(minLendRate, 0),
      maxBorrowRate,
      this.encodeDepositParams(depositParams),
    ]);
  }
}
