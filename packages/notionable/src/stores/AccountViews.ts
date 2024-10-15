import { AccountRiskProfile } from '@notional-finance/risk-engine';
import { RootStoreInterface } from './root-store';
import {
  AccountHistory,
  AccountModel,
  BalanceStatement,
} from '@notional-finance/core-entities';
import { Instance } from 'mobx-state-tree';
import { calculateAccruedIncentives } from '../global/account/incentives';
import {
  calculateAccountCurrentFactors,
  calculateGroupedHoldings,
  calculateHoldings,
  calculateVaultHoldings,
} from '../global/account/holdings';

export const AccountViews = (
  root: RootStoreInterface,
  self: Instance<typeof AccountModel>
) => {
  const getAccountRiskProfile = () => {
    return new AccountRiskProfile(
      self.balances.filter(
        (b) =>
          !b.isVaultToken &&
          b.tokenType !== 'Underlying' &&
          b.tokenType !== 'NOTE'
      ),
      self.network
    );
  };

  const getPortfolioLiquidationPrices = () => {
    return getAccountRiskProfile().getAllLiquidationPrices();
  };

  const getAccountIncentives = () => {
    return calculateAccruedIncentives(
      root.getNetworkClient(self.network),
      self.balances,
      self.accountIncentiveDebt,
      self.secondaryIncentiveDebt
    );
  };

  const getPortfolioHoldings = () => {
    const detailedHoldings = calculateHoldings(
      root.getNetworkClient(self.network),
      self.balances,
      self.balanceStatement as BalanceStatement[],
      getAccountIncentives().accruedIncentives
    );
    const groupedHoldings = calculateGroupedHoldings(
      self.balances,
      detailedHoldings
    );

    return { detailedHoldings, groupedHoldings };
  };

  const getVaultHoldings = () => {
    return calculateVaultHoldings(
      root.getNetworkClient(self.network),
      self.balances,
      self.balanceStatement as BalanceStatement[],
      self.accountHistory as AccountHistory[],
      Object.fromEntries(self.vaultLastUpdateTime.entries()),
      Object.fromEntries(self.rewardClaims.entries())
    );
  };

  const getCurrentFactors = () => {
    const { detailedHoldings } = getPortfolioHoldings();
    const vaultHoldings = getVaultHoldings();

    return calculateAccountCurrentFactors(
      detailedHoldings,
      vaultHoldings,
      root.appStore.baseCurrency
    );
  };

  const getTotalCurrencyHoldings = () => {
    const profile = getAccountRiskProfile();

    const holdings = profile.allCurrencyIds.map((currencyId) => {
      const underlying = root
        .getNetworkClient(self.network)
        .getUnderlying(currencyId);
      const totalAssets = profile.totalCurrencyAssets(
        currencyId,
        underlying.symbol
      );
      const totalDebts = profile.totalCurrencyDebts(
        currencyId,
        underlying.symbol
      );

      return {
        currency: underlying.symbol,
        netWorth: totalAssets.add(totalDebts),
        assets: totalAssets,
        debts: totalDebts,
      };
    });

    const totals = {
      netWorth: profile.netWorth(),
      assets: profile.totalAssets(),
      debts: profile.totalDebt(),
    };

    return { holdings, totals };
  };

  return {
    getPortfolioLiquidationPrices,
    getAccountRiskProfile,
    getAccountIncentives,
    getPortfolioHoldings,
    getVaultHoldings,
    getCurrentFactors,
    getTotalCurrencyHoldings,
  };
};
