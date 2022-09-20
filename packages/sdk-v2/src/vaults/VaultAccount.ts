import { INTERNAL_TOKEN_PRECISION } from '../config/constants';
import { SecondaryBorrowArray, VaultConfig, VaultState } from '../data';
import TypedBigNumber, { BigNumberType } from '../libs/TypedBigNumber';
import { System } from '../system';

export default class VaultAccount {
  public static emptyVaultAccount(vaultAddress: string, maturity = 0) {
    const vault = System.getSystem().getVault(vaultAddress);
    return new VaultAccount(
      vaultAddress,
      maturity,
      TypedBigNumber.from(0, BigNumberType.VaultShare, System.getSystem().getVaultSymbol(vaultAddress, maturity)),
      TypedBigNumber.getZeroUnderlying(vault.primaryBorrowCurrency),
      undefined
    );
  }

  public static copy(vaultAccount: VaultAccount) {
    return new VaultAccount(
      vaultAccount.vaultAddress,
      vaultAccount.maturity,
      vaultAccount.vaultShares,
      vaultAccount.primaryBorrowfCash,
      vaultAccount.secondaryBorrowDebtShares
    );
  }

  constructor(
    public vaultAddress: string,
    private _maturity: number,
    private _vaultShares: TypedBigNumber,
    private _primaryBorrowfCash: TypedBigNumber,
    private _secondaryBorrowDebtShares: SecondaryBorrowArray
  ) {}

  public get maturity() {
    return this._maturity;
  }

  public get vaultShares() {
    return this._vaultShares;
  }

  public get primaryBorrowfCash() {
    return this._primaryBorrowfCash;
  }

  public get secondaryBorrowDebtShares() {
    return this._secondaryBorrowDebtShares;
  }

  public get vaultSymbol() {
    return System.getVaultSymbol(this.vaultAddress, this.maturity);
  }

  public getDebtShareSymbol(index: 0 | 1) {
    return System.getSystem().getDebtShareSymbol(this.vaultAddress, this.maturity, index);
  }

  public getVaultState() {
    return System.getSystem().getVaultState(this.vaultAddress, this.maturity);
  }

  public getVault() {
    return System.getSystem().getVault(this.vaultAddress);
  }

  public canSettle() {
    if (this.maturity === 0) return false;
    return this.getVaultState().isSettled;
  }

  public updateMaturity(maturity: number) {
    if (this.maturity === maturity) return;
    if (this.maturity !== 0) throw Error('Cannot set maturity');
    if (!this.vaultShares.isZero()) throw Error('Cannot set with vault shares');
    this._maturity = maturity;
    this._vaultShares = TypedBigNumber.from(0, BigNumberType.VaultShare, this.vaultSymbol);
  }

  public updateVaultShares(netVaultShares: TypedBigNumber) {
    netVaultShares.check(BigNumberType.VaultShare, this.vaultSymbol);
    const newVaultShares = this.vaultShares.add(netVaultShares);
    if (newVaultShares.isNegative()) throw Error('Cannot reduce vault shares negative');
    this._vaultShares = newVaultShares;
  }

  public updatePrimaryBorrowfCash(netfCash: TypedBigNumber) {
    const underlyingSymbol = System.getSystem().getUnderlyingSymbol(this.getVault().primaryBorrowCurrency);
    netfCash.check(BigNumberType.InternalUnderlying, underlyingSymbol);
    const newPrimaryBorrow = this.primaryBorrowfCash.add(netfCash);
    if (newPrimaryBorrow.isPositive()) throw Error('Cannot have positive fCash');
    if (newPrimaryBorrow.isNegative() && newPrimaryBorrow.neg().lt(this.getVault().minAccountBorrowSize))
      throw Error('Below minimum borrow size');
    this._primaryBorrowfCash = newPrimaryBorrow;
  }

  public addStrategyTokens(strategyTokens: TypedBigNumber) {
    const vaultState = this.getVaultState();
    if (!vaultState.totalAssetCash.isZero()) throw Error('Cannot add strategy tokens when has asset cash');

    if (vaultState.totalVaultShares.isZero()) {
      this.updateVaultShares(vaultState.totalVaultShares.copy(strategyTokens.n));
    } else {
      this.updateVaultShares(vaultState.totalVaultShares.scale(strategyTokens, vaultState.totalStrategyTokens));
    }
  }

  public addSecondaryDebtShares(secondaryfCashBorrowed: SecondaryBorrowArray) {
    if (
      !secondaryfCashBorrowed ||
      (secondaryfCashBorrowed[0] === undefined && secondaryfCashBorrowed[1] === undefined)
    ) {
      return;
    }

    const { secondaryBorrowCurrencies } = this.getVault();
    if (!secondaryBorrowCurrencies) throw Error('Invalid secondary borrow');

    const didBorrow =
      (secondaryfCashBorrowed[0] && !secondaryfCashBorrowed[0].isZero()) ||
      (secondaryfCashBorrowed[1] && !secondaryfCashBorrowed[1].isZero());

    if (didBorrow && !this.secondaryBorrowDebtShares) {
      const symbol1 = this.getDebtShareSymbol(0);
      const symbol2 = this.getDebtShareSymbol(1);
      // Init the array if it does not yet exit
      this._secondaryBorrowDebtShares = [
        symbol1 ? TypedBigNumber.from(0, BigNumberType.DebtShare, symbol1) : undefined,
        symbol2 ? TypedBigNumber.from(0, BigNumberType.DebtShare, symbol2) : undefined,
      ];
    }

    if (secondaryfCashBorrowed[0] && !secondaryfCashBorrowed[0].isZero()) {
      const newDebtShares = this.secondaryBorrowDebtShares![0]!.add(
        this._getDebtSharesMinted(0, secondaryfCashBorrowed[0])
      );
      if (newDebtShares.isNegative()) throw Error('Debt shares negative');
      this._secondaryBorrowDebtShares![0] = newDebtShares;
    }

    if (secondaryfCashBorrowed[1] && !secondaryfCashBorrowed[1].isZero()) {
      const newDebtShares = this.secondaryBorrowDebtShares![1]!.add(
        this._getDebtSharesMinted(1, secondaryfCashBorrowed[1])
      );

      if (newDebtShares.isNegative()) throw Error('Debt shares negative');
      this._secondaryBorrowDebtShares![1] = newDebtShares;
    }
  }

  private _getDebtSharesMinted(index: number, secondaryfCashBorrowed: TypedBigNumber) {
    const vaultState = this.getVaultState();
    const totalfCashBorrowed = vaultState.totalSecondaryfCashBorrowed![index]!;
    const totalAccountDebtShares = vaultState.totalSecondaryDebtShares![index]!;
    if (totalfCashBorrowed.isZero()) {
      return totalAccountDebtShares.copy(secondaryfCashBorrowed.neg().n);
    }
    return totalAccountDebtShares.scale(secondaryfCashBorrowed, totalfCashBorrowed);
  }

  public getSecondaryBorrowIndex(currencyId: number): 0 | 1 {
    const vault = this.getVault();
    if (!vault.secondaryBorrowCurrencies) {
      throw Error('Invalid secondary borrow');
    } else if (vault.secondaryBorrowCurrencies[0] === currencyId) {
      return 0;
    } else if (vault.secondaryBorrowCurrencies[1] === currencyId) {
      return 1;
    } else {
      throw Error('Invalid secondary borrow');
    }
  }

  public getSecondaryDebtOwed() {
    if (this.secondaryBorrowDebtShares) {
      const vault = this.getVault();
      const vaultState = this.getVaultState();
      const value0 = this._getSecondaryDebtOwed(vault, vaultState, 0);
      const value1 = this._getSecondaryDebtOwed(vault, vaultState, 1);
      return [value0?.totalBorrowed, value1?.totalBorrowed];
    }

    return [undefined, undefined];
  }

  private _getSecondaryDebtOwed(vault: VaultConfig, vaultState: VaultState, index: 0 | 1) {
    if (!vault.secondaryBorrowCurrencies) return undefined;
    if (!this.secondaryBorrowDebtShares) return undefined;

    if (vault.secondaryBorrowCurrencies[index] !== 0) {
      const symbol = System.getSystem().getUnderlyingSymbol(vault.secondaryBorrowCurrencies[index]);
      const totalBorrowed = this.secondaryBorrowDebtShares[index]?.isPositive()
        ? vaultState.totalSecondaryfCashBorrowed![index]!.scale(
            this.secondaryBorrowDebtShares[index]!,
            vaultState.totalSecondaryDebtShares![index]!
          )
        : TypedBigNumber.getZeroUnderlying(vault.secondaryBorrowCurrencies![index]);
      return { symbol, totalBorrowed };
    }

    return undefined;
  }

  public getPoolShare() {
    const vaultState = this.getVaultState();
    if (vaultState.totalVaultShares.isZero()) {
      return {
        assetCash: vaultState.totalAssetCash.copy(0),
        strategyTokens: vaultState.totalStrategyTokens.copy(0),
      };
    }

    return {
      assetCash: vaultState.totalAssetCash.scale(this.vaultShares, vaultState.totalVaultShares),
      strategyTokens: vaultState.totalStrategyTokens.scale(this.vaultShares, vaultState.totalVaultShares),
    };
  }

  public settleVaultAccount() {
    if (!this.canSettle()) throw Error('Vault not settled');
    const vaultState = this.getVaultState();
    const vault = this.getVault();

    const totalStrategyTokenValueAtSettlement = TypedBigNumber.fromBalance(
      vaultState.totalStrategyTokens.scale(vaultState.settlementStrategyTokenValue!, INTERNAL_TOKEN_PRECISION).n,
      System.getSystem().getUnderlyingSymbol(vault.primaryBorrowCurrency),
      true
    );

    let totalVaultShareValueAtSettlement = totalStrategyTokenValueAtSettlement.add(
      vaultState.totalAssetCash.toUnderlying(true, vaultState.settlementRate)
    );

    let totalAccountValue = this.primaryBorrowfCash;
    if (vault.secondaryBorrowCurrencies && this.secondaryBorrowDebtShares) {
      const [debtSharesOne, debtSharesTwo] = this.secondaryBorrowDebtShares;
      const [totalDebtOne, totalDebtTwo] = vaultState.settlementSecondaryBorrowfCashSnapshot!;
      const [totalDebtSharesOne, totalDebtSharesTwo] = vaultState.totalSecondaryDebtShares!;

      if (totalDebtOne) {
        if (debtSharesOne) {
          const debtOwedOne = totalDebtOne.scale(debtSharesOne, totalDebtSharesOne!);
          totalAccountValue = totalAccountValue.sub(debtOwedOne);
        }
        totalVaultShareValueAtSettlement = totalVaultShareValueAtSettlement.add(totalDebtOne);
      }

      if (totalDebtTwo) {
        if (debtSharesTwo) {
          const debtOwedTwo = totalDebtTwo.scale(debtSharesTwo, totalDebtSharesTwo!);
          totalAccountValue = totalAccountValue.sub(debtOwedTwo);
        }
        totalVaultShareValueAtSettlement = totalVaultShareValueAtSettlement.add(totalDebtTwo);
      }
    }

    totalAccountValue = totalAccountValue.add(
      totalVaultShareValueAtSettlement.scale(this.vaultShares, vaultState.totalVaultShares)
    );

    if (totalAccountValue.isNegative()) {
      // This is an insolvent account
      totalAccountValue = totalAccountValue.copy(0);
    }

    const residualAssetCashBalance = vaultState.totalAssetCash.add(
      vaultState.totalPrimaryfCashBorrowed.toAssetCash(true, vaultState.settlementRate)
    );

    const settledVaultValue = residualAssetCashBalance
      .toUnderlying(true, vaultState.settlementRate)
      .add(totalStrategyTokenValueAtSettlement);

    const strategyTokens = vaultState.totalStrategyTokens.scale(totalAccountValue, settledVaultValue);
    const assetCash = residualAssetCashBalance.scale(totalAccountValue, settledVaultValue);

    // Clear all vault data at settlement
    this._maturity = 0;
    this._primaryBorrowfCash = this.primaryBorrowfCash.copy(0);
    this._vaultShares = TypedBigNumber.from(0, BigNumberType.VaultShare, this.vaultSymbol);
    this._secondaryBorrowDebtShares = undefined;

    return { strategyTokens, assetCash };
  }
}
