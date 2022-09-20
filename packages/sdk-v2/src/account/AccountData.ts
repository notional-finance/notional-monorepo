import { BigNumber, utils } from 'ethers';
import {
  ETHER_CURRENCY_ID,
  INTERNAL_TOKEN_PRECISION,
  MAX_BALANCES,
  MAX_BITMAP_ASSETS,
  MAX_PORTFOLIO_ASSETS,
} from '../config/constants';
import TypedBigNumber, { BigNumberType } from '../libs/TypedBigNumber';
import {
  AssetType,
  Balance,
  BalanceHistory,
  TradeHistory,
  TransactionHistory,
  AccountHistory,
  CollateralAction,
  CollateralActionType,
} from '../libs/types';
import { assetTypeNum, convertAssetType, getNowSeconds, hasMatured } from '../libs/utils';
import { Asset } from '../data';
import { System, CashGroup, FreeCollateral, NTokenValue } from '../system';
import AccountGraphLoader from './AccountGraphLoader';
import AssetSummary from './AssetSummary';
import BalanceSummary from './BalanceSummary';
import NOTESummary from './NOTESummary';
import { VaultAccount } from '../vaults';

interface AssetResult {
  currencyId: BigNumber;
  maturity: BigNumber;
  assetType: BigNumber;
  notional: BigNumber;
  storageSlot: BigNumber;
  storageState: number;
}

interface BalanceResult {
  currencyId: number;
  cashBalance: BigNumber;
  nTokenBalance: BigNumber;
  lastClaimTime: BigNumber;
  accountIncentiveDebt: BigNumber;
}

export interface GetAccountResult {
  accountContext: {
    nextSettleTime: number;
    hasDebt: string;
    assetArrayLength: number;
    bitmapCurrencyId: number;
    activeCurrencies: string;
  };
  accountBalances: BalanceResult[];
  portfolio: AssetResult[];
}

export default class AccountData {
  public accountBalances: Balance[];

  protected constructor(
    public nextSettleTime: number,
    public hasCashDebt: boolean,
    public hasAssetDebt: boolean,
    public bitmapCurrencyId: number | undefined,
    _accountBalances: Balance[],
    private _portfolio: Asset[],
    public vaultAccounts: VaultAccount[],
    public isCopy: boolean,
    public accountHistory?: AccountHistory
  ) {
    // Assets of a currency that are not found in accountBalances must be marked as having a zero
    // balance in the accountBalances list
    const missingCurrencies = new Set(
      _portfolio.filter((a) => !_accountBalances.find((b) => b.currencyId === a.currencyId)).map((a) => a.currencyId)
    );

    let tmpBalances = _accountBalances;
    missingCurrencies.forEach((c) => {
      // Set the balance as having a zero asset cash balance
      // eslint-disable-next-line no-underscore-dangle
      tmpBalances = AccountData._updateBalance(tmpBalances, c, TypedBigNumber.getZeroUnderlying(c).toAssetCash(true));
    });

    this.accountBalances = tmpBalances;
  }

  public cashBalance(currencyId: number) {
    return this.accountBalances.find((b) => b.currencyId === currencyId)?.cashBalance;
  }

  public nTokenBalance(currencyId: number) {
    return this.accountBalances.find((b) => b.currencyId === currencyId)?.nTokenBalance;
  }

  public get portfolio() {
    return this._portfolio.filter((a) => !hasMatured(a));
  }

  public get portfolioWithMaturedAssets() {
    return this._portfolio;
  }

  public getAssetHistory(filterByAssetKey?: string): TradeHistory[] {
    if (!this.accountHistory) throw Error('Must fetch account history');
    return this.accountHistory.trades
      .filter((t) => {
        if (filterByAssetKey) {
          const historyAssetKey = `${t.currencyId.toString()}:${t.maturity.toString()}`;
          return historyAssetKey === filterByAssetKey;
        }
        return true;
      })
      .sort((a, b) => a.blockNumber - b.blockNumber);
  }

  public getBalanceHistory(filterByCurrencyId?: number): BalanceHistory[] {
    if (!this.accountHistory) throw Error('Must fetch account history');
    return this.accountHistory.balanceHistory
      .filter((h) => (filterByCurrencyId ? h.currencyId === filterByCurrencyId : true))
      .sort((a, b) => a.blockNumber - b.blockNumber);
  }

  public getBalanceTransactionHistory(filterByCurrencyId?: number): TransactionHistory[] {
    return this.getBalanceHistory(filterByCurrencyId).map((h) => ({
      currencyId: h.currencyId,
      txnType: h.tradeType,
      timestampMS: h.blockTime.getTime(),
      transactionHash: h.transactionHash,
      amount: h.totalUnderlyingValueChange,
    }));
  }

  public getFullTransactionHistory(filterStartTime?: number): TransactionHistory[] {
    const fullHistory = BalanceSummary.getTransactionHistory(this.getBalanceHistory())
      .concat(AssetSummary.getTransactionHistory(this.getAssetHistory()))
      .concat(NOTESummary.getTransactionHistory(this.accountHistory?.sNOTEHistory));

    return fullHistory
      .filter((h) => (filterStartTime ? h.timestampMS >= filterStartTime : true))
      .sort((a, b) => a.timestampMS - b.timestampMS);
  }

  public get hashKey() {
    return this.getHash();
  }

  public getHash() {
    // Gets a rough hash of the account data object to detect if it has changed
    return utils.id(
      [
        this.nextSettleTime.toString(),
        this.hasCashDebt.toString(),
        this.hasAssetDebt.toString(),
        this.bitmapCurrencyId?.toString() || '',
        JSON.stringify(this.accountBalances),
        JSON.stringify(this.portfolio),
        this.isCopy.toString(),
      ].join(':')
    );
  }

  public static emptyAccountData() {
    return AccountData.copyAccountData();
  }

  /**
   * Copies an account data object for simulation
   * @param account if undefined, will return an empty account data object
   * @returns an account data object that is mutable
   */
  public static copyAccountData(accountData?: AccountData) {
    if (!accountData) {
      return new AccountData(0, false, false, undefined, [], [], [], true);
    }

    return new AccountData(
      accountData.nextSettleTime,
      accountData.hasCashDebt,
      accountData.hasAssetDebt,
      accountData.bitmapCurrencyId,
      accountData.accountBalances.map((b) => ({ ...b })),
      accountData.portfolio.map((a) => ({ ...a })),
      accountData.vaultAccounts,
      true,
      accountData.accountHistory
    );
  }

  public copy() {
    return AccountData.copyAccountData(this);
  }

  public static parsePortfolioFromBlockchain(portfolio: AssetResult[]): Asset[] {
    const system = System.getSystem();
    return portfolio.map((v) => {
      const currency = system.getCurrencyById(v.currencyId.toNumber());
      const underlyingSymbol = system.getUnderlyingSymbol(v.currencyId.toNumber());
      const maturity = v.maturity.toNumber();
      const assetType = convertAssetType(v.assetType);
      const notional =
        assetType === AssetType.fCash
          ? TypedBigNumber.from(v.notional, BigNumberType.InternalUnderlying, underlyingSymbol)
          : TypedBigNumber.from(v.notional, BigNumberType.LiquidityToken, currency.assetSymbol);
      const settlementDate = CashGroup.getSettlementDate(assetType, maturity);

      return {
        currencyId: currency.id,
        maturity,
        assetType,
        notional,
        hasMatured: settlementDate < getNowSeconds(),
        settlementDate,
        isIdiosyncratic: CashGroup.isIdiosyncratic(maturity),
      };
    });
  }

  public static parseBalancesFromBlockchain(accountBalances: BalanceResult[]): Balance[] {
    const system = System.getSystem();
    return accountBalances
      .filter((v) => v.currencyId !== 0)
      .map((v) => {
        const { assetSymbol } = system.getCurrencyById(v.currencyId);
        const nTokenSymbol = system.getNToken(v.currencyId)?.nTokenSymbol;
        return {
          currencyId: v.currencyId,
          cashBalance: TypedBigNumber.from(v.cashBalance, BigNumberType.InternalAsset, assetSymbol),
          nTokenBalance: nTokenSymbol
            ? TypedBigNumber.from(v.nTokenBalance, BigNumberType.nToken, nTokenSymbol)
            : undefined,
          lastClaimTime: v.lastClaimTime,
          accountIncentiveDebt: v.accountIncentiveDebt,
        };
      });
  }

  public static async loadFromBlockchain(
    result: GetAccountResult,
    vaultAccounts: VaultAccount[]
  ): Promise<AccountData> {
    const portfolio = AccountData.parsePortfolioFromBlockchain(result.portfolio);
    const balances = AccountData.parseBalancesFromBlockchain(result.accountBalances);

    // eslint-disable-next-line
    const bitmapCurrencyId =
      result.accountContext.bitmapCurrencyId === 0 ? undefined : result.accountContext.bitmapCurrencyId;

    return AccountData.load(
      result.accountContext.nextSettleTime,
      result.accountContext.hasDebt === '0x02' || result.accountContext.hasDebt === '0x03',
      result.accountContext.hasDebt === '0x01' || result.accountContext.hasDebt === '0x03',
      bitmapCurrencyId,
      balances,
      portfolio,
      vaultAccounts
    );
  }

  public static async load(
    nextSettleTime: number,
    hasCashDebt: boolean,
    hasAssetDebt: boolean,
    bitmapCurrencyId: number | undefined,
    balances: Balance[],
    portfolio: Asset[],
    vaultAccounts: VaultAccount[]
  ): Promise<AccountData> {
    const system = System.getSystem();

    // Settles matured assets here to cash and fCash assets
    const maturedAssets = portfolio.filter((a) => hasMatured(a));

    // eslint-disable-next-line no-restricted-syntax
    for (const asset of maturedAssets) {
      // eslint-disable-next-line no-await-in-loop
      const { assetCash, fCashAsset } = await system.settlePortfolioAsset(asset);

      // Use private static methods to bypass copy check
      // eslint-disable-next-line no-underscore-dangle
      if (fCashAsset) AccountData._updateAsset(portfolio, asset, bitmapCurrencyId);
      // eslint-disable-next-line no-underscore-dangle
      AccountData._updateBalance(balances, asset.currencyId, assetCash, undefined, bitmapCurrencyId);
    }

    return new AccountData(
      nextSettleTime,
      hasCashDebt,
      hasAssetDebt,
      bitmapCurrencyId,
      balances,
      portfolio,
      vaultAccounts,
      false
    );
  }

  public async fetchHistory(address: string) {
    const { graphClient } = System.getSystem();
    this.accountHistory = await AccountGraphLoader.loadTransactionHistory(address, graphClient);
  }

  /**
   * Updates a balance in place, can only be done on copied account data objects, will throw an error if balances
   * exceed the maximum number of slots.
   * @param currencyId
   * @param netCashChange
   * @param netNTokenChange
   */
  public updateBalance(currencyId: number, netCashChange?: TypedBigNumber, netNTokenChange?: TypedBigNumber) {
    if (!this.isCopy) throw Error('Cannot update balances on non copy');
    const { assetSymbol } = System.getSystem().getCurrencyById(currencyId);
    // eslint-disable-next-line no-underscore-dangle
    this.accountBalances = AccountData._updateBalance(
      this.accountBalances,
      currencyId,
      netCashChange || TypedBigNumber.fromBalance(0, assetSymbol, true),
      netNTokenChange,
      this.bitmapCurrencyId
    );
  }

  /**
   * Updates the portfolio in place, can only be done on copied account data objects, will throw an error if assets
   * exceed the maximum number of slots
   * @param asset
   */
  public updateAsset(asset: Asset) {
    if (!this.isCopy) throw Error('Cannot update assets on non copy');
    if (hasMatured(asset)) throw Error('Cannot add matured asset to account copy');

    // eslint-disable-next-line no-underscore-dangle
    this._portfolio = AccountData._updateAsset(this._portfolio, asset, this.bitmapCurrencyId);
    const { assetSymbol } = System.getSystem().getCurrencyById(asset.currencyId);

    // Do this to ensure that there is a balance slot set for the asset
    this.updateBalance(asset.currencyId, TypedBigNumber.from(0, BigNumberType.InternalAsset, assetSymbol));
  }

  public updateCollateralAction(collateralAction: CollateralAction) {
    const { amount } = collateralAction;
    if (!amount) return;

    const { currencyId } = amount;
    const assetCash = amount.toAssetCash(true);
    if (collateralAction.type === CollateralActionType.ASSET_CASH) {
      this.updateBalance(currencyId, assetCash);
    } else if (collateralAction.type === CollateralActionType.NTOKEN) {
      const nTokensMinted = NTokenValue.getNTokensToMint(currencyId, assetCash);
      this.updateBalance(currencyId, assetCash.copy(0), nTokensMinted);
    } else if (collateralAction.type === CollateralActionType.LEND_FCASH) {
      const m = System.getSystem()
        .getMarkets(currencyId)
        .find((m) => m.marketKey === collateralAction.marketKey);
      const fCashAmount = m?.getfCashAmountGivenCashAmount(amount.toUnderlying(true).neg());
      if (!m || !fCashAmount || fCashAmount.isZero()) throw Error('Unable to apply lend collateral action');

      this.updateAsset({
        currencyId,
        maturity: m.maturity,
        assetType: AssetType.fCash,
        notional: fCashAmount,
        settlementDate: m.maturity,
      });
    }
  }

  /**
   * Returns total assets and total debts in each currency without local currency netting and
   * without haircuts and buffers applied.
   */
  public getTotalCurrencyValue() {
    const system = System.getSystem();
    return this.accountBalances.reduce((totals, b) => {
      const id = b.currencyId;
      let totalAssets = TypedBigNumber.getZeroUnderlying(id);
      let totalDebts = TypedBigNumber.getZeroUnderlying(id);
      const cashGroup = system.getCashGroup(id);

      const { totalCashClaims, fCashAssets } = FreeCollateral.getNetfCashPositions(
        id,
        this.portfolio,
        undefined,
        false
      );
      totalAssets = totalAssets.add(totalCashClaims);
      fCashAssets.forEach((a) => {
        const pv = cashGroup.getfCashPresentValueUnderlyingInternal(a.maturity, a.notional, false);
        if (pv.isPositive()) {
          totalAssets = totalAssets.add(pv);
        } else {
          totalDebts = totalDebts.add(pv.abs());
        }
      });

      if (b.nTokenBalance) {
        totalAssets = totalAssets.add(b.nTokenBalance.toUnderlying());
      }

      if (b.cashBalance?.isPositive()) {
        totalAssets = totalAssets.add(b.cashBalance.toUnderlying());
      } else if (b.cashBalance?.isNegative()) {
        totalDebts = totalDebts.add(b.cashBalance.toUnderlying().abs());
      }

      totals.set(id, { totalAssets, totalDebts });
      return totals;
    }, new Map<number, { totalAssets: TypedBigNumber; totalDebts: TypedBigNumber }>());
  }

  /**
   * Calculates loan to value ratio. A loan to value ratio is the total value of debts in ETH divided by
   * the total value of collateral in ETH. It does not use any net currency values.
   */
  public loanToValueRatio() {
    const system = System.getSystem();
    // All values in this method are denominated in ETH

    /* eslint-disable @typescript-eslint/no-shadow */
    /* eslint-disable no-param-reassign */
    const { cashDebts, cashAssets, cashDebtsWithBuffer, cashAssetsWithHaircut, cashGroups } =
      this.accountBalances.reduce(
        ({ cashDebts, cashAssets, cashDebtsWithBuffer, cashAssetsWithHaircut, cashGroups }, b) => {
          if (b.cashBalance.isNegative()) {
            cashDebts = cashDebts.add(b.cashBalance.toETH(false).abs());
            cashDebtsWithBuffer = cashDebtsWithBuffer.add(b.cashBalance.toETH(true).abs());
          } else if (b.cashBalance.isPositive()) {
            cashAssets = cashAssets.add(b.cashBalance.toETH(false));
            cashAssetsWithHaircut = cashAssetsWithHaircut.add(b.cashBalance.toETH(true));
          }

          if (b.nTokenBalance?.isPositive()) {
            cashAssets = cashAssets.add(b.nTokenBalance.toAssetCash().toETH(false));
            const nTokenHaircut = NTokenValue.convertNTokenToInternalAsset(b.currencyId, b.nTokenBalance, true);
            cashAssetsWithHaircut = cashAssetsWithHaircut.add(nTokenHaircut.toETH(true));
          }

          const { totalCashClaims, fCashAssets } = FreeCollateral.getNetfCashPositions(
            b.currencyId,
            this.portfolio,
            undefined,
            false
          );
          const { totalCashClaims: totalCashClaimsHaircut, fCashAssets: fCashAssetsHaircut } =
            FreeCollateral.getNetfCashPositions(b.currencyId, this.portfolio, undefined, true);

          cashAssets = cashAssets.add(totalCashClaims.toETH(false));
          cashAssetsWithHaircut = cashAssetsWithHaircut.add(totalCashClaimsHaircut.toETH(true));
          if (fCashAssets.length > 0 || fCashAssetsHaircut.length > 0) {
            cashGroups.push({ currencyId: b.currencyId, noHaircut: fCashAssets, haircut: fCashAssetsHaircut });
          }

          return {
            cashDebts,
            cashAssets,
            cashDebtsWithBuffer,
            cashAssetsWithHaircut,
            cashGroups,
          };
        },
        {
          cashDebts: TypedBigNumber.fromBalance(0, 'ETH', true),
          cashAssets: TypedBigNumber.fromBalance(0, 'ETH', true),
          cashDebtsWithBuffer: TypedBigNumber.fromBalance(0, 'ETH', true),
          cashAssetsWithHaircut: TypedBigNumber.fromBalance(0, 'ETH', true),
          cashGroups: Array<{ currencyId: number; noHaircut: Asset[]; haircut: Asset[] }>(),
        }
      );

    const { fCashDebts, fCashAssets, fCashAssetsWithHaircut, fCashDebtsWithBuffer } = cashGroups.reduce(
      (
        { fCashDebts, fCashAssets, fCashAssetsWithHaircut, fCashDebtsWithBuffer },
        { currencyId, haircut, noHaircut }
      ) => {
        const cashGroup = system.getCashGroup(currencyId);

        noHaircut.forEach((a) => {
          const ethPV = cashGroup.getfCashPresentValueUnderlyingInternal(a.maturity, a.notional, false).toETH(false);
          if (a.notional.isPositive()) {
            fCashAssets = fCashAssets.add(ethPV);
          } else {
            fCashDebts = fCashDebts.add(ethPV.abs());
          }
        });

        haircut.forEach((a) => {
          const ethPV = cashGroup.getfCashPresentValueUnderlyingInternal(a.maturity, a.notional, true).toETH(true);
          if (a.notional.isPositive()) {
            fCashAssetsWithHaircut = fCashAssetsWithHaircut.add(ethPV);
          } else {
            fCashDebtsWithBuffer = fCashDebtsWithBuffer.add(ethPV.abs());
          }
        });

        return {
          fCashDebts,
          fCashAssets,
          fCashAssetsWithHaircut,
          fCashDebtsWithBuffer,
        };
      },
      {
        fCashDebts: TypedBigNumber.fromBalance(0, 'ETH', true),
        fCashAssets: TypedBigNumber.fromBalance(0, 'ETH', true),
        fCashAssetsWithHaircut: TypedBigNumber.fromBalance(0, 'ETH', true),
        fCashDebtsWithBuffer: TypedBigNumber.fromBalance(0, 'ETH', true),
      }
    );
    /* eslint-enable @typescript-eslint/no-shadow */
    /* eslint-enable no-param-reassign */

    const totalETHValue = cashAssets.add(fCashAssets);
    const totalETHDebts = cashDebts.add(fCashDebts);
    const totalETHValueHaircut = cashAssetsWithHaircut.add(fCashAssetsWithHaircut);
    const totalETHDebtsBuffer = cashDebtsWithBuffer.add(fCashDebtsWithBuffer);
    let loanToValue: number | null = null;
    let haircutLoanToValue: number | null = null;
    let maxLoanToValue: number | null = null;
    if (!totalETHValue.isZero() && !totalETHValueHaircut.isZero()) {
      loanToValue =
        (totalETHDebts.scale(INTERNAL_TOKEN_PRECISION, totalETHValue.n).toNumber() / INTERNAL_TOKEN_PRECISION) * 100;
      haircutLoanToValue =
        (totalETHDebtsBuffer.scale(INTERNAL_TOKEN_PRECISION, totalETHValueHaircut.n).toNumber() /
          INTERNAL_TOKEN_PRECISION) *
        100;
      maxLoanToValue = (loanToValue / haircutLoanToValue) * 100;
    }

    return {
      totalETHDebts,
      totalETHValue,
      loanToValue,
      haircutLoanToValue,
      maxLoanToValue,
    };
  }

  /**
   * Returns components of the free collateral figure for this account.
   */
  public getFreeCollateral() {
    return FreeCollateral.getFreeCollateral(this);
  }

  /**
   * Calculates the liquidation price between collateral and debt currency holding everything
   * else in the portfolio constant.
   *
   * @param collateralId
   * @param debtCurrencyId
   * @returns Debt denominated liquidation price
   */
  public getLiquidationPrice(collateralId: number, debtCurrencyId: number) {
    const { netETHCollateralWithHaircut, netETHDebtWithBuffer, netUnderlyingAvailable } =
      FreeCollateral.getFreeCollateral(this);
    const collateralAmount = netUnderlyingAvailable.get(collateralId);
    // There is no collateral in the specified currency so we do not have a liquidation price
    if (!collateralAmount || collateralAmount.n.lte(0)) return null;

    const aggregateFC = netETHCollateralWithHaircut.sub(netETHDebtWithBuffer);
    let targetCurrencyFC: TypedBigNumber;
    let netUnderlying: TypedBigNumber | undefined;
    if (collateralId === ETHER_CURRENCY_ID) {
      // We represent everything as FX to ETH so in the case that the collateral is in ETH we
      // vary the debt currency id. Use the negative of the targetCurrencyFC to ensure that we
      // use buffer when we convert from aggregateFC
      targetCurrencyFC = aggregateFC.neg().fromETH(debtCurrencyId, true);
      netUnderlying = netUnderlyingAvailable.get(debtCurrencyId);
    } else {
      targetCurrencyFC = aggregateFC.fromETH(collateralId, true);
      netUnderlying = netUnderlyingAvailable.get(collateralId);
    }

    if (!netUnderlying) throw Error('Invalid target currency when calculating liquidation price');
    const fcSurplusProportion = targetCurrencyFC.scale(INTERNAL_TOKEN_PRECISION, netUnderlying.n).abs();
    const singleUnitTargetCurrency = fcSurplusProportion.copy(INTERNAL_TOKEN_PRECISION);
    // This is the max exchange rate decrease as a portion of a single token in internal token precision, can
    // see this as the liquidation price of a single unit of ETH
    const maxExchangeRateDecrease =
      collateralId === ETHER_CURRENCY_ID
        ? singleUnitTargetCurrency.add(fcSurplusProportion)
        : singleUnitTargetCurrency.sub(fcSurplusProportion);

    // If the max exchange rate decrease is negative then there is no possible liquidation price, this can
    // happen if aggregateFC > netUnderlying.
    if (maxExchangeRateDecrease.isNegative() && aggregateFC.isPositive()) return null;

    // Convert to the debt currency denomination
    if (collateralId === ETHER_CURRENCY_ID) {
      // If using the debt currency this will do 1 / maxExchangeRateDecrease.toETH(), returning a TypedNumber
      // in the debt currency denomination
      return maxExchangeRateDecrease
        .copy(INTERNAL_TOKEN_PRECISION)
        .scale(INTERNAL_TOKEN_PRECISION, maxExchangeRateDecrease.toETH(false).n);
    }

    // Convert from collateral to debt via ETH. This will be negative if the account is undercollateralized
    return maxExchangeRateDecrease.toETH(false).fromETH(debtCurrencyId, false);
  }

  public getLiquidationPenalty(collateralId: number, liquidationPrice?: TypedBigNumber) {
    const { netUnderlyingAvailable } = FreeCollateral.getFreeCollateral(this);
    const netCollateral = netUnderlyingAvailable.get(collateralId);
    if (!netCollateral || netCollateral.isNegative()) {
      return {};
    }

    // Scale by default liquidation portion
    const cashBalance = this.cashBalance(collateralId)?.toUnderlying();
    const nTokenBalance = this.nTokenBalance(collateralId)?.toUnderlying();

    const { liquidationDiscount } = System.getSystem().getETHRate(collateralId);
    let netCollateralPortion = netCollateral.scale(40, 100);
    let cashBalancePenalty: TypedBigNumber;
    let nTokenPenalty = TypedBigNumber.getZeroUnderlying(collateralId);

    // First apply cash balances to the penalty
    const cashPenaltyRate = liquidationDiscount - 100;
    if (cashBalance && cashBalance.gte(netCollateralPortion)) {
      cashBalancePenalty = netCollateralPortion.scale(liquidationDiscount - 100, 100);
      netCollateralPortion = netCollateralPortion.copy(0);
    } else if (cashBalance && cashBalance.isPositive()) {
      cashBalancePenalty = cashBalance.scale(liquidationDiscount - 100, 100);
      netCollateralPortion = netCollateralPortion.sub(cashBalance);
    } else {
      cashBalancePenalty = TypedBigNumber.getZeroUnderlying(collateralId);
    }

    // Then apply nToken balances to the penalty
    const nToken = System.getSystem().getNToken(collateralId);
    let nTokenPenaltyRate = 0;
    if (nToken) {
      const { liquidationHaircutPercentage } = nToken;
      nTokenPenaltyRate = 100 - liquidationHaircutPercentage + cashPenaltyRate;

      if (netCollateralPortion.isPositive() && nTokenBalance) {
        nTokenPenalty = nTokenBalance.gte(netCollateralPortion)
          ? netCollateralPortion.scale(nTokenPenaltyRate, 100)
          : nTokenBalance.scale(nTokenPenaltyRate, 100);
      }
    }

    const totalPenalty = cashBalancePenalty.add(nTokenPenalty);
    const totalPenaltyRate = totalPenalty.isZero()
      ? 0
      : cashBalancePenalty
          .scale(cashPenaltyRate, 1)
          .add(nTokenPenalty.scale(nTokenPenaltyRate, 1))
          .scale(INTERNAL_TOKEN_PRECISION, totalPenalty)
          .toNumber() / INTERNAL_TOKEN_PRECISION;

    let totalPenaltyETHValueAtLiquidationPrice: TypedBigNumber | undefined;
    if (liquidationPrice) {
      // Liquidation Price is in the debt currency, convert it to ETH
      const liquidationETHPrice = liquidationPrice.toETH(false).toInternalPrecision();
      totalPenaltyETHValueAtLiquidationPrice = liquidationETHPrice.scale(totalPenalty, INTERNAL_TOKEN_PRECISION);
    }

    return { totalPenalty, totalPenaltyRate, totalPenaltyETHValueAtLiquidationPrice };
  }

  /**
   * Calculates a collateral ratio, this uses the net value of currencies in the free collateral figure without
   * applying any buffers or haircuts. This is used as a user friendly way of showing free collateral.
   */
  public collateralRatio() {
    const { netETHCollateral, netETHDebt } = FreeCollateral.getFreeCollateral(this);
    return FreeCollateral.calculateCollateralRatio(netETHCollateral, netETHDebt);
  }

  /**
   * Calculates a buffered collateral ratio, this uses the net value of currencies in the free collateral figure
   * after applying buffers and haircuts. An account is liquidatable when this is below 100.
   */
  public bufferedCollateralRatio() {
    const { netETHCollateralWithHaircut, netETHDebtWithBuffer } = FreeCollateral.getFreeCollateral(this);
    return FreeCollateral.calculateCollateralRatio(netETHCollateralWithHaircut, netETHDebtWithBuffer);
  }

  private static _updateBalance(
    accountBalances: Balance[],
    currencyId: number,
    netCashChange: TypedBigNumber,
    netNTokenChange?: TypedBigNumber,
    bitmapCurrencyId?: number
  ) {
    const balance = accountBalances.find((v) => v.currencyId === currencyId);
    if (!balance) {
      // Cannot have negative balances if the balance is not in the account already
      if (netNTokenChange && netNTokenChange.isNegative()) throw Error('nToken balance not found');
      if (bitmapCurrencyId && accountBalances.length === MAX_BALANCES) throw Error('Exceeds max balances');
      if (!bitmapCurrencyId && accountBalances.length === MAX_BALANCES - 1) throw Error('Exceeds max balances');

      accountBalances.push({
        currencyId,
        cashBalance: netCashChange,
        nTokenBalance: netNTokenChange,
        lastClaimTime: BigNumber.from(0),
        accountIncentiveDebt: BigNumber.from(0),
      });

      return accountBalances.sort((a, b) => a.currencyId - b.currencyId);
    }

    balance.cashBalance = balance.cashBalance.add(netCashChange);
    if (netNTokenChange && !netNTokenChange.isZero()) {
      if (!balance.nTokenBalance) {
        balance.nTokenBalance = netNTokenChange;
      } else {
        balance.nTokenBalance = balance.nTokenBalance.add(netNTokenChange);
      }
    }

    return accountBalances;
  }

  private static _updateAsset(portfolio: Asset[], asset: Asset, bitmapCurrencyId?: number) {
    let wasFound = false;
    const newPortfolio = portfolio.map((a) => {
      if (a.currencyId === asset.currencyId && a.assetType === asset.assetType && a.maturity === asset.maturity) {
        wasFound = true;
        // Is an existing asset
        return {
          ...a,
          notional: a.notional.add(asset.notional),
        };
      }
      return a;
    });

    if (!wasFound) {
      if (bitmapCurrencyId && bitmapCurrencyId !== asset.currencyId) throw Error('Asset is not bitmap currency');
      if (bitmapCurrencyId && portfolio.length === MAX_BITMAP_ASSETS) throw Error('Max bitmap assets');
      if (!bitmapCurrencyId && portfolio.length === MAX_PORTFOLIO_ASSETS) throw Error('Max portfolio assets');
      newPortfolio.push(asset);

      // Sorting is done in place
      newPortfolio.sort(
        (a, b) =>
          a.currencyId - b.currencyId ||
          assetTypeNum(a.assetType) - assetTypeNum(b.assetType) ||
          a.maturity - b.maturity
      );
    }

    return newPortfolio;
  }
}
