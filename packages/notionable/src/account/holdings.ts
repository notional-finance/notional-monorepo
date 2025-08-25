import { Network, SECONDS_IN_DAY } from '@notional-finance/util';
import {
  AccountDefinition,
  FiatKeys,
  PendlePT,
  TokenBalance,
  NetworkClientModel,
  BalanceStatement,
  AccountHistory,
  createLeveragedAPYData,
} from '@notional-finance/core-entities';
import { VaultAccountRiskProfile } from '@notional-finance/risk-engine';
import { Instance } from 'mobx-state-tree';

export type VaultHolding = ReturnType<typeof calculateVaultHoldings>[number];
export type CurrentFactors = ReturnType<typeof calculateAccountCurrentFactors>;

/**
 * Calculates data to display for each vault holding
 */
export function calculateVaultHoldings(
  model: Instance<typeof NetworkClientModel>,
  balances: TokenBalance[],
  balanceStatements: BalanceStatement[],
  accountHistory: AccountHistory[],
  vaultLastUpdateTime: Map<string, number>,
  rewardClaims: Record<string, TokenBalance[]>
) {
  const vaultProfiles = VaultAccountRiskProfile.getAllRiskProfiles(model, {
    balances,
    accountHistory,
    vaultLastUpdateTime,
  } as AccountDefinition);

  return vaultProfiles.map((v) => {
    let debtPnL: BalanceStatement | undefined;
    let assetPnL: BalanceStatement | undefined;
    try {
      debtPnL = balanceStatements.find(
        (b) => b.token.id === v.vaultDebt.tokenId
      );
      assetPnL = balanceStatements?.find(
        (b) => b.token.id === v.vaultShares.tokenId
      );
    } catch {
      // No-op, allow the statement to be undefined
    }

    const denom = v.denom(v.defaultSymbol);
    const zeroDenom = TokenBalance.zero(denom);
    const profit = (assetPnL?.totalProfitAndLoss || zeroDenom).sub(
      debtPnL?.totalProfitAndLoss || zeroDenom
    );
    const vaultYield = model.getSpotAPY(v.vaultShares.tokenId);
    const debtAPY = model.getSpotAPY(v.vaultDebt.tokenId).totalAPY || 0;
    const assetInterestAccrual = assetPnL?.totalInterestAccrual || zeroDenom;

    const debtInterestAccrual =
      debtPnL?.totalInterestAccrual.neg() || zeroDenom;

    const assetEarnings = assetPnL?.totalProfitAndLoss || zeroDenom;
    const debtEarnings = debtPnL?.totalProfitAndLoss.neg() || zeroDenom;
    const assetFeesPaid = assetPnL?.totalVaultFees || zeroDenom;
    const debtFeesPaid = zeroDenom;
    const assetMarketPnL = assetEarnings?.sub(
      assetInterestAccrual || zeroDenom
    );
    const assetAmountPaid = assetPnL?.accumulatedCostRealized || zeroDenom;
    const assetEntryPrice = assetPnL?.adjustedCostBasis;
    const debtAmountPaid = debtPnL?.accumulatedCostRealized.neg() || zeroDenom;
    const debtEntryPrice = debtPnL?.adjustedCostBasis.neg();

    const amountPaid = assetAmountPaid.add(debtAmountPaid);

    const leverageRatio = v.leverageRatio() || 0;
    const { maxLeverageRatio } = model.getLeverageRatios(v.vaultDebt.token);

    const totalInterestAccrual = assetInterestAccrual.add(debtInterestAccrual);

    const totalILAndFees = assetFeesPaid.add(debtFeesPaid);
    const debtMarketPnL = debtEarnings?.add(debtInterestAccrual || zeroDenom);

    const marketProfitLoss = profit.sub(totalInterestAccrual);
    const strategyType = v.vaultConfig.strategyType;

    const vaultMetadata = {
      rewardClaims: rewardClaims[v.vaultAddress],
      strategyType,
      reinvestmentCadence:
        v.network === Network.arbitrum ? SECONDS_IN_DAY : 7 * SECONDS_IN_DAY,
      isExpired:
        strategyType === 'PendlePT'
          ? (v.vaultAdapter as PendlePT).timeToExpiry === 0
          : undefined,
    };

    return {
      name: v.vaultConfig.name,
      network: v.network,
      maturity: v.maturity,
      vaultAddress: v.vaultAddress,
      vaultShares: v.vaultShares,
      vaultDebt: v.vaultDebt,
      liquidationPrices: v.getAllLiquidationPrices(),
      netWorth: v.netWorth(),
      healthFactor: v.healthFactor(),
      totalAssets: v.totalAssets(),
      totalDebt: v.totalDebt(),
      maxLeverageRatio,
      apyData: createLeveragedAPYData(vaultYield, debtAPY, leverageRatio),
      impliedFixedRate: debtPnL?.impliedFixedRate,
      leverageRatio,
      amountPaid,
      profit,
      underlying: denom.symbol,
      vaultYield,
      marketProfitLoss,
      totalILAndFees,
      totalInterestAccrual,
      vaultMetadata,
      assetInterestAccrual,
      debtInterestAccrual,
      assetMarketPnL,
      debtMarketPnL,
      assetEarnings,
      debtEarnings,
      assetFeesPaid,
      debtFeesPaid,
      assetAmountPaid,
      debtAmountPaid,
      assetEntryPrice,
      debtEntryPrice,
    };
  });
}

export function calculateAccountCurrentFactors(
  vaults: VaultHolding[],
  baseCurrency: FiatKeys
) {
  const { weightedYield, netWorth, debts, assets } = vaults.reduce(
    (
      { weightedYield, netWorth, debts, assets },
      { apyData, totalAssets: a, totalDebt: d, netWorth: _w }
    ) => {
      const w = _w.toFiat(baseCurrency).toFloat();
      return {
        weightedYield: weightedYield + (apyData?.totalAPY || 0) * w,
        netWorth: netWorth.add(_w.toFiat(baseCurrency)),
        debts: debts.add(d.toFiat(baseCurrency)),
        assets: assets.add(a.toFiat(baseCurrency)),
      };
    },
    {
      weightedYield: 0,
      netWorth: new TokenBalance(0, baseCurrency, Network.all),
      debts: new TokenBalance(0, baseCurrency, Network.all),
      assets: new TokenBalance(0, baseCurrency, Network.all),
    }
  );

  return {
    currentAPY: !netWorth.isZero()
      ? weightedYield / netWorth.toFloat()
      : undefined,
    netWorth,
    debts,
    assets,
  };
}
