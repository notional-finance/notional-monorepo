import { RootStoreInterface } from './root-store';
import {
  AccountHistory,
  BalanceStatement,
  NotionalTypes,
  TokenBalance,
} from '@notional-finance/core-entities';
import { getRoot, Instance, types, cast, flow } from 'mobx-state-tree';
import {
  calculateAccountCurrentFactors,
  calculateVaultHoldings,
} from '../account/holdings';
import { Network } from '@notional-finance/util';
import { reaction } from 'mobx';
import { simulateRewardClaims } from '@notional-finance/transaction';
import { AccountModel } from './AccountModel';

const APYDataModel = types.model('APYDataModel', {
  totalAPY: types.maybe(types.number),
  // These next three values are used for leveraged APY
  assetAPY: types.maybe(types.number),
  leverageRatio: types.maybe(types.number),
  debtAPY: types.maybe(types.number),
  organicAPY: types.maybe(types.number),
  incentiveAPY: types.maybe(types.number),
  feeAPY: types.maybe(types.number),
  incentives: types.maybe(
    types.array(
      types.model({
        symbol: types.string,
        incentiveAPY: types.number,
      })
    )
  ),
  utilization: types.maybe(types.number),
  pointMultiples: types.maybe(types.map(types.number)),
});

const VaultHoldingModel = types.model('VaultHoldingModel', {
  network: NotionalTypes.Network,
  name: types.string,
  maturity: types.maybe(types.number),
  vaultAddress: types.string,
  vaultShares: NotionalTypes.TokenBalance,
  vaultDebt: NotionalTypes.TokenBalance,
  liquidationPrices: types.array(
    types.model({
      asset: types.string,
      debt: types.string,
      threshold: types.maybeNull(NotionalTypes.TokenBalance),
      isDebtThreshold: types.boolean,
    })
  ),
  hasPendingWithdraw: types.boolean,
  hasFinalizedWithdraw: types.boolean,
  impliedFixedRate: types.maybe(types.number),
  healthFactor: types.maybeNull(types.number),
  netWorth: NotionalTypes.TokenBalance,
  totalAssets: NotionalTypes.TokenBalance,
  totalDebt: NotionalTypes.TokenBalance,
  underlying: types.string,
  maxLeverageRatio: types.number,
  apyData: types.maybe(APYDataModel),
  leverageRatio: types.number,
  amountPaid: NotionalTypes.TokenBalance,
  totalEarnings: NotionalTypes.TokenBalance,
  vaultYield: types.maybeNull(APYDataModel),
  marketProfitLoss: NotionalTypes.TokenBalance,
  totalILAndFees: NotionalTypes.TokenBalance,
  totalInterestAccrual: NotionalTypes.TokenBalance,
  assetInterestAccrual: NotionalTypes.TokenBalance,
  debtInterestAccrual: NotionalTypes.TokenBalance,
  assetFeesPaid: NotionalTypes.TokenBalance,
  debtFeesPaid: NotionalTypes.TokenBalance,
  assetEarnings: NotionalTypes.TokenBalance,
  debtEarnings: NotionalTypes.TokenBalance,
  assetMarketPnL: NotionalTypes.TokenBalance,
  debtMarketPnL: NotionalTypes.TokenBalance,
  assetEntryPrice: types.maybe(NotionalTypes.TokenBalance),
  debtEntryPrice: types.maybe(NotionalTypes.TokenBalance),
  assetAmountPaid: NotionalTypes.TokenBalance,
  debtAmountPaid: NotionalTypes.TokenBalance,
  vaultMetadata: types.model({
    rewardClaims: types.optional(types.array(NotionalTypes.TokenBalance), []),
    strategyType: types.string,
    isExpired: types.maybe(types.boolean),
  }),
});

const PortfolioModel = types.model('PortfolioModel', {
  portfolioLiquidationPrices: types.optional(
    types.array(
      types.model({
        asset: types.string,
        threshold: types.maybeNull(NotionalTypes.TokenBalance),
        isDebtThreshold: types.boolean,
      })
    ),
    []
  ),
  vaultHoldings: types.optional(types.array(VaultHoldingModel), []),
  totalVaultHoldings: types.optional(
    types.maybe(
      types.model({
        amountPaid: NotionalTypes.TokenBalance,
        presentValue: NotionalTypes.TokenBalance,
        totalEarnings: NotionalTypes.TokenBalance,
        assets: NotionalTypes.TokenBalance,
        debts: NotionalTypes.TokenBalance,
        accruedInterest: NotionalTypes.TokenBalance,
        marketPNL: NotionalTypes.TokenBalance,
        feesPaid: NotionalTypes.TokenBalance,
      })
    ),
    undefined
  ),
  currentFactors: types.optional(
    types.model({
      currentAPY: types.maybe(types.number),
      netWorth: types.maybe(NotionalTypes.TokenBalance),
      debts: types.maybe(NotionalTypes.TokenBalance),
      assets: types.maybe(NotionalTypes.TokenBalance),
    }),
    {
      currentAPY: undefined,
      netWorth: undefined,
      debts: undefined,
      assets: undefined,
    }
  ),
  totalCurrencyHoldings: types.optional(
    types.model({
      holdings: types.array(
        types.model({
          currency: types.string,
          netWorth: NotionalTypes.TokenBalance,
          assets: NotionalTypes.TokenBalance,
          debts: NotionalTypes.TokenBalance,
        })
      ),
      totals: types.maybe(
        types.model({
          netWorth: NotionalTypes.TokenBalance,
          assets: NotionalTypes.TokenBalance,
          debts: NotionalTypes.TokenBalance,
        })
      ),
    }),
    {
      holdings: [],
      totals: undefined,
    }
  ),
});

const _AccountPortfolioModel = types.compose(AccountModel, PortfolioModel);

export const AccountPortfolioActions = (
  self: Instance<typeof _AccountPortfolioModel>
) => {
  const root = () => getRoot<RootStoreInterface>(self);

  const getVaultHoldings = () => {
    const vaultHoldings = calculateVaultHoldings(
      root().getNetworkClient(self.network),
      self.balances,
      self.balanceStatement as BalanceStatement[],
      self.accountHistory as AccountHistory[],
      new Map(self.vaultLastUpdateTime.entries()),
      Object.fromEntries(self.rewardClaims.entries()),
      new Map(self.withdrawRequests.entries())
    );

    const baseCurrency = root().appStore.baseCurrency;
    const totalVaultHoldings = vaultHoldings.reduce(
      (accumulator, vault) => {
        return {
          amountPaid: accumulator.amountPaid.add(
            vault.amountPaid.toFiat(baseCurrency)
          ),
          presentValue: accumulator.presentValue.add(
            vault.netWorth.toFiat(baseCurrency)
          ),
          totalEarnings: accumulator.totalEarnings.add(
            vault.totalEarnings.toFiat(baseCurrency)
          ),
          assets: accumulator.assets.add(
            vault.totalAssets.toFiat(baseCurrency)
          ),
          debts: accumulator.debts.add(vault.totalDebt.toFiat(baseCurrency)),
          accruedInterest: accumulator.accruedInterest.add(
            vault.totalInterestAccrual.toFiat(baseCurrency)
          ),
          marketPNL: accumulator.marketPNL.add(
            vault.marketProfitLoss.toFiat(baseCurrency)
          ),
          feesPaid: accumulator.feesPaid.add(
            vault.totalILAndFees.toFiat(baseCurrency)
          ),
        };
      },
      {
        amountPaid: new TokenBalance(0, baseCurrency, Network.all),
        presentValue: new TokenBalance(0, baseCurrency, Network.all),
        totalEarnings: new TokenBalance(0, baseCurrency, Network.all),
        assets: new TokenBalance(0, baseCurrency, Network.all),
        debts: new TokenBalance(0, baseCurrency, Network.all),
        accruedInterest: new TokenBalance(0, baseCurrency, Network.all),
        marketPNL: new TokenBalance(0, baseCurrency, Network.all),
        feesPaid: new TokenBalance(0, baseCurrency, Network.all),
      }
    );

    return {
      vaultHoldings,
      totalVaultHoldings,
    };
  };

  const getCurrentFactors = () => {
    const { vaultHoldings } = getVaultHoldings();

    return calculateAccountCurrentFactors(
      vaultHoldings,
      root().appStore.baseCurrency
    );
  };

  const refreshAccountHoldings = () => {
    const startTime = performance.now();
    const { vaultHoldings, totalVaultHoldings } = getVaultHoldings();
    const currentFactors = getCurrentFactors();
    self.currentFactors = currentFactors;
    self.totalVaultHoldings = totalVaultHoldings;
    self.vaultHoldings.replace(
      vaultHoldings.map((h) => ({
        ...h,
        liquidationPrices: cast(
          h.liquidationPrices.map((p) => ({
            ...p,
            asset: p.asset.id,
            debt: p.debt.id,
          }))
        ),
        vaultYield: APYDataModel.create(h.vaultYield),
        apyData: APYDataModel.create(h.apyData),
        vaultMetadata: {
          ...h.vaultMetadata,
          // NOTE: cast to JSON so that it can be stored properly in mobx
          rewardClaims: cast(
            h.vaultMetadata.rewardClaims?.map((r) => r.toJSON())
          ),
        },
      }))
    );

    const endTime = performance.now();
    console.log(
      `refreshAccountHoldings ${self.address} on ${
        self.network
      } execution time: ${endTime - startTime} ms`
    );
  };

  const afterAttach = flow(function* () {
    yield new Promise((resolve) => {
      const disposer = reaction(
        () => root().appStore.isAppReady,
        (isReady) => {
          if (isReady) {
            disposer();
            resolve(self.refreshAccount());
          }
        },
        { fireImmediately: true }
      );
    });

    yield Promise.resolve(refreshAccountHoldings());
  });

  const refreshPortfolio = flow(function* () {
    yield Promise.resolve(self.refreshAccount());
    yield Promise.resolve(refreshAccountHoldings());
  });

  const refreshRewardClaims = flow(function* (vaultAddress: string) {
    self.rewardClaims.set(
      vaultAddress,
      yield simulateRewardClaims(
        self.network,
        self.address,
        vaultAddress,
        '' // TODO: Lending Router
      )
    );
  });

  return {
    afterAttach,
    refreshPortfolio,
    refreshRewardClaims,
  };
};

export const AccountPortfolioModel = _AccountPortfolioModel
  .actions((self) => ({
    ...AccountPortfolioActions(self),
  }))
  .views((self) => {
    const root = () => getRoot<RootStoreInterface>(self);

    return {
      get positiveAllowances() {
        return (
          self.allowances?.filter(
            (a) => a.amount.isPositive() && a.amount.symbol !== 'ETH'
          ) || []
        );
      },
      balanceOf(symbol: string) {
        return (
          self.balances.find((b) => b.symbol === symbol) ||
          TokenBalance.zero(
            root().getNetworkClient(self.network).getTokenBySymbol(symbol)
          )
        );
      },
    };
  });
