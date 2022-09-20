import { BigNumber } from 'ethers';
import { CashGroup, Market, System } from '../system';
import GraphClient from '../data/GraphClient';
import TypedBigNumber, { BigNumberType } from '../libs/TypedBigNumber';
import { getNowSeconds } from '../libs/utils';
import AccountData from './AccountData';
import { AssetType, BalanceHistory, TradeType } from '../libs/types';
import BalanceSummary from './BalanceSummary';
import AssetSummary from './AssetSummary';
import { BalanceResponse, AssetResponse, AccountQuery, AccountQueryResponse } from './queries/AccountQuery';
import { BatchAccountQuery, BatchAccountResponse } from './queries/BatchAccountQuery';
import {
  BalanceHistoryResponse,
  LeveragedVaultHistoryResponse,
  StakedNoteResponse,
  TradeHistoryResponse,
  TransactionHistoryQuery,
  TransactionHistoryResponse,
} from './queries/TransactionHistory';
import { VaultAccountQuery, VaultAccountResponse } from './queries/VaultAccountQuery';
import { VaultAccount } from '../vaults';
import { SecondaryBorrowArray } from '..';

export default class AccountGraphLoader {
  private static parseBalance(balance: BalanceResponse) {
    const currencyId = Number(balance.currency.id);
    const currency = System.getSystem().getCurrencyById(currencyId);

    if (!currency) {
      throw Error(`Currency ${currencyId} cannot be found.`);
    }

    const cashBalance = TypedBigNumber.fromBalance(balance.assetCashBalance, currency.assetSymbol, true);
    const nTokenBalance = currency.nTokenSymbol
      ? TypedBigNumber.fromBalance(balance.nTokenBalance, currency.nTokenSymbol, true)
      : undefined;
    const lastClaimTime = BigNumber.from(balance.lastClaimTime);
    const accountIncentiveDebt = balance.didMigrateIncentives
      ? BigNumber.from(balance.accountIncentiveDebt)
      : BigNumber.from(balance.lastClaimIntegralSupply);

    return {
      currencyId,
      cashBalance,
      nTokenBalance,
      lastClaimTime,
      accountIncentiveDebt,
    };
  }

  private static parseAsset(asset: AssetResponse) {
    const currencyId = Number(asset.currency.id);
    const maturity = Number(asset.maturity);
    const assetType = asset.assetType as AssetType;
    const currency = System.getSystem().getCurrencyById(currencyId);

    if (!currency || !currency.underlyingSymbol) {
      throw Error(`Invalid currency ${currencyId}.`);
    }

    const notional =
      assetType === AssetType.fCash
        ? TypedBigNumber.from(asset.notional, BigNumberType.InternalUnderlying, currency.underlyingSymbol)
        : TypedBigNumber.from(asset.notional, BigNumberType.LiquidityToken, currency.assetSymbol);

    const hasMatured = maturity < getNowSeconds();
    const settlementDate = Number(asset.settlementDate);
    const isIdiosyncratic = CashGroup.isIdiosyncratic(maturity);
    return {
      currencyId,
      maturity,
      assetType,
      notional,
      hasMatured,
      settlementDate,
      isIdiosyncratic,
    };
  }

  private static parseTradeHistory(trades: TradeHistoryResponse[]) {
    return trades.map((t) => {
      const currencyId = Number(t.currency.id);
      const maturity = BigNumber.from(t.maturity);
      const currency = System.getSystem().getCurrencyById(currencyId);
      const underlyingSymbol = currency.underlyingSymbol || currency.assetSymbol;
      const { assetSymbol } = currency;
      const netUnderlyingCash = TypedBigNumber.from(
        t.netUnderlyingCash,
        BigNumberType.InternalUnderlying,
        underlyingSymbol
      );
      const netfCash = TypedBigNumber.from(t.netfCash, BigNumberType.InternalUnderlying, underlyingSymbol);

      const tradedInterestRate =
        t.tradeType === TradeType.Transfer
          ? 0
          : Market.exchangeToInterestRate(
              Market.exchangeRate(netfCash, netUnderlyingCash),
              t.timestamp,
              maturity.toNumber()
            );

      return {
        id: t.id,
        blockNumber: t.blockNumber,
        transactionHash: t.transactionHash,
        blockTime: new Date(t.timestamp * 1000),
        currencyId: Number(t.currency.id),
        tradeType: t.tradeType as TradeType,
        settlementDate: t.market ? BigNumber.from(t.market.settlementDate) : null,
        maturityLength: t.market ? t.market.marketMaturityLengthSeconds : null,
        maturity: BigNumber.from(t.maturity),
        netAssetCash: TypedBigNumber.from(t.netAssetCash, BigNumberType.InternalAsset, assetSymbol),
        netfCash,
        netUnderlyingCash,
        netLiquidityTokens: t.netLiquidityTokens
          ? TypedBigNumber.from(t.netLiquidityTokens, BigNumberType.LiquidityToken, assetSymbol)
          : null,
        tradedInterestRate,
      };
    });
  }

  private static getBalanceHistoryType(
    assetCashBalanceBefore: TypedBigNumber,
    assetCashBalanceAfter: TypedBigNumber,
    nTokenBalanceBefore?: TypedBigNumber,
    nTokenBalanceAfter?: TypedBigNumber
  ) {
    let tradeType = '';
    if (assetCashBalanceBefore.gt(assetCashBalanceAfter)) {
      tradeType = 'Withdraw';
    } else if (assetCashBalanceBefore.lt(assetCashBalanceAfter)) {
      tradeType = 'Deposit';
    }

    if (!nTokenBalanceBefore || !nTokenBalanceAfter) return tradeType || 'unknown';
    if (nTokenBalanceBefore.gt(nTokenBalanceAfter)) {
      tradeType = tradeType ? `${tradeType} & Redeem nToken` : 'Redeem nToken';
    } else if (nTokenBalanceBefore.lt(nTokenBalanceAfter)) {
      tradeType = tradeType ? `${tradeType} & Mint nToken` : 'Mint nToken';
    }

    return tradeType || 'unknown';
  }

  private static parseBalanceHistory(balances: BalanceHistoryResponse[]) {
    return balances.map((r) => {
      const system = System.getSystem();
      const currencyId = Number(r.currency.id);
      const currency = system.getCurrencyById(currencyId);
      const { assetSymbol } = currency;
      const underlyingSymbol = currency.underlyingSymbol || currency.assetSymbol;
      const nTokenSymbol = system.getNToken(currencyId)?.nTokenSymbol;
      const assetCashBalanceBefore = TypedBigNumber.fromBalance(r.assetCashBalanceBefore, assetSymbol, true);
      const assetCashBalanceAfter = TypedBigNumber.fromBalance(r.assetCashBalanceAfter, assetSymbol, true);
      const nTokenBalanceBefore = nTokenSymbol
        ? TypedBigNumber.fromBalance(r.nTokenBalanceBefore, nTokenSymbol, true)
        : undefined;
      const nTokenBalanceAfter = nTokenSymbol
        ? TypedBigNumber.fromBalance(r.nTokenBalanceAfter, nTokenSymbol, true)
        : undefined;

      // Use from instead of fromBalance here to override default for NonMintable tokens
      // which are always categorized as InternalAsset
      const assetCashValueUnderlyingBefore = TypedBigNumber.from(
        r.assetCashValueUnderlyingBefore,
        BigNumberType.InternalUnderlying,
        underlyingSymbol
      );
      const assetCashValueUnderlyingAfter = TypedBigNumber.from(
        r.assetCashValueUnderlyingAfter,
        BigNumberType.InternalUnderlying,
        underlyingSymbol
      );
      const nTokenValueUnderlyingBefore = TypedBigNumber.from(
        r.nTokenValueUnderlyingBefore,
        BigNumberType.InternalUnderlying,
        underlyingSymbol
      );
      const nTokenValueUnderlyingAfter = TypedBigNumber.from(
        r.nTokenValueUnderlyingAfter,
        BigNumberType.InternalUnderlying,
        underlyingSymbol
      );
      const totalUnderlyingValueChange = assetCashValueUnderlyingAfter
        .sub(assetCashValueUnderlyingBefore)
        .add(nTokenValueUnderlyingAfter.sub(nTokenValueUnderlyingBefore));

      const tradeType = this.getBalanceHistoryType(
        assetCashBalanceBefore,
        assetCashBalanceAfter,
        nTokenBalanceBefore,
        nTokenBalanceAfter
      );

      return {
        id: r.id,
        blockNumber: r.blockNumber,
        blockTime: new Date(r.timestamp * 1000),
        transactionHash: r.transactionHash,
        currencyId: Number(r.currency.id),
        tradeType,
        assetCashBalanceBefore,
        assetCashBalanceAfter,
        assetCashValueUnderlyingBefore,
        assetCashValueUnderlyingAfter,
        nTokenBalanceBefore,
        nTokenBalanceAfter,
        nTokenValueUnderlyingBefore,
        nTokenValueUnderlyingAfter,
        nTokenValueAssetBefore: TypedBigNumber.from(r.nTokenValueAssetBefore, BigNumberType.InternalAsset, assetSymbol),
        nTokenValueAssetAfter: TypedBigNumber.from(r.nTokenValueAssetAfter, BigNumberType.InternalAsset, assetSymbol),
        totalUnderlyingValueChange,
      };
    });
  }

  private static parseSNOTEHistory(stakedNoteBalance: StakedNoteResponse | null) {
    if (stakedNoteBalance === null) {
      // Handle the case where the user has not staked
      return {
        transactions: [],
        ethAmountJoined: TypedBigNumber.fromBalance(0, 'ETH', false),
        ethAmountRedeemed: TypedBigNumber.fromBalance(0, 'ETH', false),
        noteAmountJoined: TypedBigNumber.fromBalance(0, 'NOTE', false),
        noteAmountRedeemed: TypedBigNumber.fromBalance(0, 'NOTE', false),
      };
    }

    const history = stakedNoteBalance.stakedNoteChanges
      .map((r) => ({
        blockNumber: r.blockNumber,
        transactionHash: r.transactionHash,
        blockTime: new Date(r.timestamp * 1000),
        sNOTEAmountBefore: TypedBigNumber.fromBalance(r.sNOTEAmountBefore, 'sNOTE', false),
        sNOTEAmountAfter: TypedBigNumber.fromBalance(r.sNOTEAmountAfter, 'sNOTE', false),
        ethAmountChange: TypedBigNumber.fromBalance(r.ethAmountChange, 'ETH', false),
        noteAmountChange: TypedBigNumber.fromBalance(r.noteAmountChange, 'NOTE', false),
      }))
      .sort((a, b) => b.blockNumber - a.blockNumber); // sorts descending

    return {
      transactions: history,
      ethAmountJoined: TypedBigNumber.fromBalance(stakedNoteBalance.ethAmountJoined, 'ETH', false),
      ethAmountRedeemed: TypedBigNumber.fromBalance(stakedNoteBalance.ethAmountRedeemed, 'ETH', false),
      noteAmountJoined: TypedBigNumber.fromBalance(stakedNoteBalance.noteAmountJoined, 'NOTE', false),
      noteAmountRedeemed: TypedBigNumber.fromBalance(stakedNoteBalance.noteAmountRedeemed, 'NOTE', false),
    };
  }

  private static parseVaultTradeHistory(vaultTradeHistory: LeveragedVaultHistoryResponse[]) {
    const system = System.getSystem();
    return vaultTradeHistory.map((t) => {
      const vault = system.getVault(t.leveragedVault.vaultAddress);
      const primaryBorrowSymbol = system.getUnderlyingSymbol(vault.primaryBorrowCurrency);
      const maturityBefore = t.leveragedVaultMaturityBefore?.maturity;
      const maturityAfter = t.leveragedVaultMaturityAfter?.maturity;
      const vaultSymbolBefore = maturityBefore
        ? system.getVaultSymbol(t.leveragedVault.vaultAddress, maturityBefore)
        : undefined;
      const vaultSymbolAfter = maturityAfter
        ? system.getVaultSymbol(t.leveragedVault.vaultAddress, maturityAfter)
        : undefined;
      const secondarySymbolsBefore = maturityBefore
        ? system.getDebtShareSymbols(vault.vaultAddress, maturityBefore)
        : undefined;
      const secondarySymbolsAfter = maturityAfter
        ? system.getDebtShareSymbols(vault.vaultAddress, maturityAfter)
        : undefined;

      return {
        blockNumber: t.blockNumber,
        transactionHash: t.transactionHash,
        timestamp: new Date(t.timestamp * 1000),
        vaultTradeType: t.vaultTradeType,
        vaultAddress: vault.vaultAddress,
        maturityBefore,
        maturityAfter,
        primaryBorrowfCashBefore: TypedBigNumber.fromBalance(t.primaryBorrowfCashBefore, primaryBorrowSymbol, true),
        primaryBorrowfCashAfter: TypedBigNumber.fromBalance(t.primaryBorrowfCashAfter, primaryBorrowSymbol, true),
        netPrimaryBorrowfCashChange: t.netPrimaryBorrowfCashChange
          ? TypedBigNumber.fromBalance(t.netPrimaryBorrowfCashChange, primaryBorrowSymbol, true)
          : undefined,
        vaultSharesBefore: vaultSymbolBefore
          ? TypedBigNumber.from(t.vaultSharesBefore, BigNumberType.VaultShare, vaultSymbolBefore)
          : undefined,
        vaultSharesAfter: vaultSymbolAfter
          ? TypedBigNumber.from(t.vaultSharesAfter, BigNumberType.VaultShare, vaultSymbolAfter)
          : undefined,
        netVaultSharesChange: t.netVaultSharesChange
          ? TypedBigNumber.from(
              t.netVaultSharesChange,
              BigNumberType.VaultShare,
              (vaultSymbolAfter || vaultSymbolBefore)!
            )
          : undefined,
        secondaryDebtSharesBefore: t.secondaryDebtSharesBefore?.map((s, i) =>
          secondarySymbolsBefore && secondarySymbolsBefore[i] !== undefined
            ? TypedBigNumber.from(s, BigNumberType.DebtShare, secondarySymbolsBefore[i]!)
            : undefined
        ),
        secondaryDebtSharesAfter: t.secondaryDebtSharesAfter?.map((s, i) =>
          secondarySymbolsAfter && secondarySymbolsAfter[i] !== undefined
            ? TypedBigNumber.from(s, BigNumberType.DebtShare, secondarySymbolsAfter[i]!)
            : undefined
        ),
        netSecondaryDebtSharesChange: t.netSecondaryDebtSharesChange?.map((s, i) => {
          if (secondarySymbolsAfter && secondarySymbolsAfter[i] !== undefined) {
            return TypedBigNumber.from(s, BigNumberType.DebtShare, secondarySymbolsAfter[i]!);
          }
          if (secondarySymbolsBefore && secondarySymbolsBefore[i] !== undefined) {
            return TypedBigNumber.from(s, BigNumberType.DebtShare, secondarySymbolsBefore[i]!);
          }
          return undefined;
        }),
        netUnderlyingCash: t.netUnderlyingCash
          ? TypedBigNumber.fromBalance(t.netUnderlyingCash, primaryBorrowSymbol, true)
          : undefined,
      };
    });
  }

  public static parseVaultAccount(data: VaultAccountResponse) {
    return data.leveragedVaultAccounts.map((v) => {
      const system = System.getSystem();
      const vault = system.getVault(v.leveragedVault.vaultAddress);
      const primaryBorrowSymbol = system.getUnderlyingSymbol(vault.primaryBorrowCurrency);
      const secondarySymbols = system.getDebtShareSymbols(vault.vaultAddress, v.maturity);
      const secondaryDebtShares: SecondaryBorrowArray = v.secondaryBorrowDebtShares
        ? [
            secondarySymbols && secondarySymbols[0]
              ? TypedBigNumber.from(v.secondaryBorrowDebtShares[0], BigNumberType.DebtShare, secondarySymbols[0])
              : undefined,
            secondarySymbols && secondarySymbols[1]
              ? TypedBigNumber.from(v.secondaryBorrowDebtShares[1], BigNumberType.DebtShare, secondarySymbols[1])
              : undefined,
          ]
        : undefined;

      return new VaultAccount(
        vault.vaultAddress,
        v.maturity,
        TypedBigNumber.from(
          v.vaultShares,
          BigNumberType.VaultShare,
          system.getVaultSymbol(vault.vaultAddress, v.maturity)
        ),
        TypedBigNumber.fromBalance(v.primaryBorrowfCash, primaryBorrowSymbol, true),
        secondaryDebtShares
      );
    });
  }

  /**
   * Loads multiple accounts in a single query.
   *
   * @param graphClient
   * @returns Map<string, AccountData>
   */
  public static async loadBatch(graphClient: GraphClient) {
    const response = (await graphClient.batchQuery(BatchAccountQuery)) as BatchAccountResponse;
    const accounts = new Map<string, AccountData>();
    await Promise.all(
      response.map(async (account) => {
        const accountData = await AccountData.load(
          account.nextSettleTime,
          account.hasCashDebt,
          account.hasPortfolioAssetDebt,
          account.assetBitmapCurrency?.id ? Number(account.assetBitmapCurrency.id) : undefined,
          account.balances.map(AccountGraphLoader.parseBalance),
          account.portfolio.map(AccountGraphLoader.parseAsset),
          AccountGraphLoader.parseVaultAccount(account)
        );
        return accounts.set(account.id, accountData);
      })
    );
    return accounts;
  }

  public static async loadTransactionHistory(address: string, graphClient: GraphClient) {
    const lowerCaseAddress = address.toLowerCase(); // Account id in subgraph is in lower case.
    const history = await graphClient.queryOrThrow<TransactionHistoryResponse>(TransactionHistoryQuery, {
      id: lowerCaseAddress,
    });

    return {
      trades: this.parseTradeHistory(history.trades),
      balanceHistory: this.parseBalanceHistory(history.balanceChanges),
      sNOTEHistory: this.parseSNOTEHistory(history.stakedNoteBalance),
      vaultTradeHistory: this.parseVaultTradeHistory(history.leveragedVaultTrades),
    };
  }

  /**
   * Returns a summary of an account's balances with historical transactions and internal return rate
   */
  public static async getBalanceSummary(address: string, accountData: AccountData | undefined) {
    if (!accountData) {
      return {
        balanceHistory: new Array<BalanceHistory>(),
        balanceSummary: new Array<BalanceSummary>(),
      };
    }
    if (!accountData.accountHistory) {
      await accountData.fetchHistory(address);
    }

    const { balanceHistory } = accountData.accountHistory!;
    const balanceSummary = BalanceSummary.build(accountData);
    return { balanceHistory, balanceSummary };
  }

  /**
   * Returns the tradeHistory and assetSummary for an account
   */
  public static async getAssetSummary(address: string, accountData?: AccountData) {
    if (!accountData) {
      return {
        balanceHistory: new Array<BalanceHistory>(),
        balanceSummary: new Array<BalanceSummary>(),
      };
    }
    if (!accountData.accountHistory) {
      await accountData.fetchHistory(address);
    }

    const tradeHistory = accountData.accountHistory!.trades;
    const assetSummary = AssetSummary.build(accountData);
    return { tradeHistory, assetSummary };
  }

  public static async loadVaultAccounts(graphClient: GraphClient, address: string) {
    const lowerCaseAddress = address.toLowerCase(); // Account id in subgraph is in lower case.
    const response = await graphClient.queryOrThrow<VaultAccountResponse>(VaultAccountQuery, { id: lowerCaseAddress });
    return AccountGraphLoader.parseVaultAccount(response);
  }

  /**
   * Loads a single account
   * @param graphClient
   * @param address
   * @returns AccountData instance for requested account
   */
  public static async load(graphClient: GraphClient, address: string) {
    const lowerCaseAddress = address.toLowerCase(); // Account id in subgraph is in lower case.
    const { account } = await graphClient.queryOrThrow<AccountQueryResponse>(AccountQuery, { id: lowerCaseAddress });

    const balances = account.balances.map(AccountGraphLoader.parseBalance);
    const portfolio = account.portfolio.map(AccountGraphLoader.parseAsset);
    const vaultAccounts = AccountGraphLoader.parseVaultAccount(account);

    return AccountData.load(
      account.nextSettleTime,
      account.hasCashDebt,
      account.hasPortfolioAssetDebt,
      account.assetBitmapCurrency?.id ? Number(account.assetBitmapCurrency?.id) : undefined,
      balances,
      portfolio,
      vaultAccounts
    );
  }
}
