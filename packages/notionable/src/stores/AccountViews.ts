import { AccountRiskProfile } from '@notional-finance/risk-engine';
import { RootStoreType } from './root-store';
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
  root: RootStoreType,
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

  return {
    getPortfolioLiquidationPrices,
    getAccountRiskProfile,
    getAccountIncentives,
    getPortfolioHoldings,
    getVaultHoldings,
    getCurrentFactors,
  };
};
