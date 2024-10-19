import {
  AccountRiskProfile,
  VaultAccountRiskProfile,
} from '@notional-finance/risk-engine';
import { RootStoreInterface } from './root-store';
import {
  AccountHistory,
  AccountModel,
  BalanceStatement,
  BalanceStatementModel,
  NotionalTypes,
  TokenBalance,
  TokenDefinition,
  TokenDefinitionModel,
} from '@notional-finance/core-entities';
import { getRoot, Instance, types, cast } from 'mobx-state-tree';
import { calculateAccruedIncentives } from '../global/account/incentives';
import {
  calculateAccountCurrentFactors,
  calculateGroupedHoldings,
  calculateHoldings,
  calculateVaultHoldings,
} from '../global/account/holdings';
import { Network } from '@notional-finance/util';

const APYDataModel = types.model('APYDataModel', {
  totalAPY: types.maybe(types.number),
  organicAPY: types.maybe(types.number),
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
  leverageRatio: types.maybe(types.number),
  debtAPY: types.maybe(types.number),
});

const DetailedHoldingModel = types.model('DetailedHolding', {
  balance: NotionalTypes.TokenBalance,
  statement: types.maybe(BalanceStatementModel),
  marketYield: types.maybe(APYDataModel),
  manageTokenId: types.string,
  maturedTokenId: types.string,
  perIncentiveEarnings: types.array(NotionalTypes.TokenBalance),
  totalIncentiveEarnings: NotionalTypes.TokenBalance,
  totalEarningsWithIncentives: types.maybe(NotionalTypes.TokenBalance),
  marketProfitLoss: types.maybe(NotionalTypes.TokenBalance),
  hasMatured: types.boolean,
  hasNToken: types.boolean,
  isHighUtilization: types.boolean,
});

const GroupedHoldingModel = types.model('GroupedHoldingModel', {
  asset: DetailedHoldingModel,
  debt: DetailedHoldingModel,
  presentValue: NotionalTypes.TokenBalance,
  totalInterestAccrual: NotionalTypes.TokenBalance,
  marketProfitLoss: NotionalTypes.TokenBalance,
  totalILAndFees: NotionalTypes.TokenBalance,
  totalEarnings: NotionalTypes.TokenBalance,
  leverageRatio: types.number,
  hasMatured: types.boolean,
  borrowAPY: types.maybe(types.number),
  totalLeveragedApy: types.maybe(types.number),
});

const VaultHoldingModel = types.model('VaultHoldingModel', {
  network: NotionalTypes.Network,
  name: types.string,
  maturity: types.number,
  underlying: TokenDefinitionModel,
  vaultShares: NotionalTypes.TokenBalance,
  vaultDebt: NotionalTypes.TokenBalance,
  liquidationPrices: types.array(
    types.model({
      asset: TokenDefinitionModel,
      debt: TokenDefinitionModel,
      threshold: types.maybeNull(NotionalTypes.TokenBalance),
      isDebtThreshold: types.boolean,
    })
  ),
  vaultAddress: types.string,
  netWorth: NotionalTypes.TokenBalance,
  totalAssets: NotionalTypes.TokenBalance,
  totalDebt: NotionalTypes.TokenBalance,
  maxLeverageRatio: types.number,
  healthFactor: types.maybeNull(types.number),
  totalAPY: types.maybe(types.number),
  borrowAPY: types.number,
  amountPaid: NotionalTypes.TokenBalance,
  strategyAPY: types.number,
  profit: NotionalTypes.TokenBalance,
  leverageRatio: types.number,
  vaultYield: types.maybeNull(APYDataModel),
  marketProfitLoss: NotionalTypes.TokenBalance,
  totalILAndFees: NotionalTypes.TokenBalance,
  totalInterestAccrual: NotionalTypes.TokenBalance,
  assetPnL: types.maybeNull(BalanceStatementModel),
  debtPnL: types.maybeNull(BalanceStatementModel),
  vaultMetadata: types.model({
    rewardClaims: types.maybeNull(types.array(NotionalTypes.TokenBalance)),
    vaultType: types.string,
    reinvestmentCadence: types.number,
    isExpired: types.maybe(types.boolean),
  }),
});

const PortfolioModel = types.model('PortfolioModel', {
  portfolioLiquidationPrices: types.optional(
    types.array(
      types.model({
        asset: TokenDefinitionModel,
        threshold: types.maybeNull(NotionalTypes.TokenBalance),
        isDebtThreshold: types.boolean,
      })
    ),
    []
  ),
  portfolioRiskProfile: types.optional(
    types.maybe(
      types.model({
        loanToValue: types.maybeNull(types.number),
        healthFactor: types.maybeNull(types.number),
        totalAssets: NotionalTypes.TokenBalance,
        totalDebt: NotionalTypes.TokenBalance,
        balances: types.array(NotionalTypes.TokenBalance),
      })
    ),
    undefined
  ),
  totalIncentives: types.optional(
    types.map(
      types.model({
        current: NotionalTypes.TokenBalance,
        in100Sec: NotionalTypes.TokenBalance,
      })
    ),
    {}
  ),
  accruedIncentives: types.optional(
    types.array(
      types.model({
        currencyId: types.number,
        incentives: types.array(NotionalTypes.TokenBalance),
        incentivesIn100Seconds: types.array(NotionalTypes.TokenBalance),
      })
    ),
    []
  ),
  detailedHoldings: types.optional(types.array(DetailedHoldingModel), []),
  groupedHoldings: types.optional(types.array(GroupedHoldingModel), []),
  totalPortfolioHoldings: types.optional(
    types.maybe(
      types.model({
        amountPaid: NotionalTypes.TokenBalance,
        presentValue: NotionalTypes.TokenBalance,
        earnings: NotionalTypes.TokenBalance,
        nonNoteEarnings: NotionalTypes.TokenBalance,
        perIncentiveEarnings: types.array(NotionalTypes.TokenBalance),
        noteEarnings: NotionalTypes.TokenBalance,
      })
    ),
    undefined
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

const _AccountPortfolioModel = types
  .compose(AccountModel, PortfolioModel)
  .views((self) => ({
    maxPortfolioWithdraw(token: TokenDefinition) {
      return new AccountRiskProfile(
        self.balances.filter(
          (b) =>
            !b.isVaultToken &&
            b.tokenType !== 'Underlying' &&
            b.tokenType !== 'NOTE'
        ),
        self.network
      ).maxWithdraw(token);
    },
    maxVaultWithdraw(vaultAddress: string) {
      return new VaultAccountRiskProfile(
        vaultAddress,
        self.balances,
        self.vaultLastUpdateTime?.get(vaultAddress) || 0
      ).maxWithdraw();
    },
  }));

export const AccountPortfolioActions = (
  self: Instance<typeof _AccountPortfolioModel>
) => {
  const root = getRoot<RootStoreInterface>(self);

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

  const getPortfolioRiskProfile = () => {
    const profile = getAccountRiskProfile();
    return {
      loanToValue: profile.loanToValue(),
      healthFactor: profile.healthFactor(),
      totalAssets: profile.totalAssets(),
      totalDebt: profile.totalDebt(),
      balances: profile.balances,
    };
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

    const baseCurrency = root.appStore.baseCurrency;
    const zeroFiat = new TokenBalance(0, baseCurrency, Network.all);
    const NOTE = root.getNetworkClient(self.network).getTokenBySymbol('NOTE');

    const totalPortfolioHoldings = detailedHoldings.reduce(
      (t, { balance, statement, perIncentiveEarnings }) => {
        const totalEarningsWithNOTE = statement?.totalProfitAndLoss
          .toFiat(baseCurrency)
          .add(
            perIncentiveEarnings.reduce(
              (s, i) => s.add(i.toFiat(baseCurrency)),
              zeroFiat
            )
          );

        if (statement) {
          t.amountPaid = t.amountPaid.add(
            statement.accumulatedCostRealized.toFiat(baseCurrency)
          );
          t.presentValue = t.presentValue.add(balance.toFiat(baseCurrency));
          t.earnings = totalEarningsWithNOTE
            ? t.earnings.add(totalEarningsWithNOTE.toFiat(baseCurrency))
            : t.earnings.add(statement.totalProfitAndLoss.toFiat(baseCurrency));
          t.nonNoteEarnings = t.nonNoteEarnings.add(
            statement.totalProfitAndLoss.toFiat(baseCurrency)
          );
          const totalNOTEEarnings = perIncentiveEarnings.find(
            (t) => t.symbol === 'NOTE'
          );
          t.noteEarnings = totalNOTEEarnings
            ? t?.noteEarnings?.add(totalNOTEEarnings)
            : t.noteEarnings;

          perIncentiveEarnings.forEach((data) => {
            const currentTokenBalance = t.perIncentiveEarnings.findIndex(
              (t) => t.symbol === data.symbol
            );
            if (currentTokenBalance > -1) {
              t.perIncentiveEarnings[currentTokenBalance] =
                t.perIncentiveEarnings[currentTokenBalance].add(data);
            } else {
              t.perIncentiveEarnings.push(data);
            }
          });
        }
        return t;
      },
      {
        amountPaid: zeroFiat,
        presentValue: zeroFiat,
        earnings: zeroFiat,
        nonNoteEarnings: zeroFiat,
        perIncentiveEarnings: [] as TokenBalance[],
        noteEarnings: TokenBalance.from(0, NOTE),
      }
    );

    return { detailedHoldings, groupedHoldings, totalPortfolioHoldings };
  };

  const getVaultHoldings = () => {
    const vaultHoldings = calculateVaultHoldings(
      root.getNetworkClient(self.network),
      self.balances,
      self.balanceStatement as BalanceStatement[],
      self.accountHistory as AccountHistory[],
      Object.fromEntries(self.vaultLastUpdateTime.entries()),
      Object.fromEntries(self.rewardClaims.entries())
    );

    const baseCurrency = root.appStore.baseCurrency;
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
            vault.profit.toFiat(baseCurrency)
          ),
          assets: accumulator.assets.add(
            vault.totalAssets.toFiat(baseCurrency)
          ),
          debts: accumulator.debts.add(vault.totalDebt.toFiat(baseCurrency)),
        };
      },
      {
        amountPaid: new TokenBalance(0, baseCurrency, self.network),
        presentValue: new TokenBalance(0, baseCurrency, self.network),
        totalEarnings: new TokenBalance(0, baseCurrency, self.network),
        assets: new TokenBalance(0, baseCurrency, self.network),
        debts: new TokenBalance(0, baseCurrency, self.network),
      }
    );

    return {
      vaultHoldings,
      totalVaultHoldings,
    };
  };

  const getCurrentFactors = () => {
    const { detailedHoldings } = getPortfolioHoldings();
    const { vaultHoldings } = getVaultHoldings();

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

  const refreshAccountHoldings = () => {
    const { detailedHoldings, groupedHoldings, totalPortfolioHoldings } =
      getPortfolioHoldings();
    const { totalIncentives, accruedIncentives } = getAccountIncentives();
    const { vaultHoldings, totalVaultHoldings } = getVaultHoldings();
    const currentFactors = getCurrentFactors();
    const totalCurrencyHoldings = getTotalCurrencyHoldings();
    const portfolioLiquidationPrices = getPortfolioLiquidationPrices();
    const portfolioRiskProfile = getPortfolioRiskProfile();

    self.portfolioRiskProfile = {
      ...portfolioRiskProfile,
      balances: cast(portfolioRiskProfile.balances),
    };

    self.totalIncentives.replace(totalIncentives);
    self.accruedIncentives.replace(
      accruedIncentives.map((item) => ({
        currencyId: item.currencyId,
        incentives: cast(item.incentives),
        incentivesIn100Seconds: cast(item.incentivesIn100Seconds),
      }))
    );

    self.currentFactors = currentFactors;
    self.detailedHoldings.replace(
      detailedHoldings.map((h) => ({
        ...h,
        statement: BalanceStatementModel.create(h.statement),
        marketYield: APYDataModel.create(h.marketYield),
        perIncentiveEarnings: cast(h.perIncentiveEarnings),
      }))
    );
    self.totalPortfolioHoldings = {
      ...totalPortfolioHoldings,
      perIncentiveEarnings: cast(totalPortfolioHoldings.perIncentiveEarnings),
    };

    self.groupedHoldings.replace(
      groupedHoldings.map((h) => ({
        ...h,
        asset: DetailedHoldingModel.create(h.asset),
        debt: DetailedHoldingModel.create(h.debt),
      }))
    );
    self.totalVaultHoldings = totalVaultHoldings;
    self.vaultHoldings.replace(
      vaultHoldings.map((h) => ({
        ...h,
        liquidationPrices: cast(h.liquidationPrices),
        assetPnL: BalanceStatementModel.create(h.assetPnL),
        debtPnL: BalanceStatementModel.create(h.debtPnL),
        underlying: TokenDefinitionModel.create(h.underlying),
        vaultYield: APYDataModel.create(h.vaultYield),
        vaultMetadata: {
          ...h.vaultMetadata,
          rewardClaims: cast(h.vaultMetadata.rewardClaims),
        },
      }))
    );

    self.totalCurrencyHoldings.holdings.replace(totalCurrencyHoldings.holdings);
    self.totalCurrencyHoldings.totals = totalCurrencyHoldings.totals;
    self.portfolioLiquidationPrices.replace(
      portfolioLiquidationPrices.map((item) => ({
        asset: TokenDefinitionModel.create(item.asset),
        threshold: item.threshold,
        isDebtThreshold: item.isDebtThreshold,
      }))
    );
  };

  return {
    refreshAccountHoldings,
  };
};

export const AccountPortfolioModel = _AccountPortfolioModel.actions((self) => ({
  ...AccountPortfolioActions(self),
}));
