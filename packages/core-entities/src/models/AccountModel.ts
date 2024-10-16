import { flow, Instance, types } from 'mobx-state-tree';
import { NotionalTypes, TokenDefinitionModel } from './ModelTypes';
import { getProviderFromNetwork } from '@notional-finance/util';
import { providers } from 'ethers';
import { fetchCurrentAccount } from '../client/accounts/current-account';
import { AccountDefinition, CacheSchema } from '../Definitions';
import { AccountRegistryClient } from '../client/account-registry-client';

const NX_SUBGRAPH_API_KEY = process.env['NX_SUBGRAPH_API_KEY'] as string;

const AccountIncentiveDebtModel = types.model('AccountIncentiveDebt', {
  value: NotionalTypes.TokenBalance,
  currencyId: types.number,
});

export const BalanceStatementModel = types.model('BalanceStatement', {
  token: TokenDefinitionModel,
  blockNumber: types.number,
  underlying: TokenDefinitionModel,
  currentBalance: NotionalTypes.TokenBalance,
  adjustedCostBasis: NotionalTypes.TokenBalance,
  totalILAndFees: NotionalTypes.TokenBalance,
  totalProfitAndLoss: NotionalTypes.TokenBalance,
  totalInterestAccrual: NotionalTypes.TokenBalance,
  accumulatedCostRealized: NotionalTypes.TokenBalance,
  incentives: types.array(
    types.model({
      totalClaimed: NotionalTypes.TokenBalance,
      adjustedClaimed: NotionalTypes.TokenBalance,
    })
  ),
  impliedFixedRate: types.maybe(types.number),
});

const AccountHistoryModel = types.model('AccountHistory', {
  label: types.string,
  txnLabel: types.optional(types.maybe(types.string), undefined),
  timestamp: types.number,
  blockNumber: types.number,
  token: types.reference(TokenDefinitionModel),
  underlying: types.reference(TokenDefinitionModel),
  tokenAmount: NotionalTypes.TokenBalance,
  bundleName: types.string,
  transactionHash: types.string,
  underlyingAmountRealized: NotionalTypes.TokenBalance,
  underlyingAmountSpot: NotionalTypes.TokenBalance,
  realizedPrice: NotionalTypes.TokenBalance,
  spotPrice: NotionalTypes.TokenBalance,
  vaultName: types.maybe(types.string),
  impliedFixedRate: types.maybe(types.number),
  isTransientLineItem: types.boolean,
  account: types.maybe(types.string),
});

const HistoricalBalanceModel = types.model('HistoricalBalance', {
  timestamp: types.number,
  balance: NotionalTypes.TokenBalance,
});

export const AccountModel = types
  .model('Account', {
    address: types.string,
    network: NotionalTypes.Network,
    lastUpdateTimestamp: types.optional(types.number, 0),
    systemAccountType: types.optional(NotionalTypes.SystemAccount, 'None'),
    balances: types.optional(types.array(NotionalTypes.TokenBalance), []),
    allowPrimeBorrow: types.maybe(types.boolean),
    vaultLastUpdateTime: types.optional(types.map(types.number), {}),
    rewardClaims: types.optional(
      types.map(types.array(NotionalTypes.TokenBalance)),
      {}
    ),
    accountIncentiveDebt: types.optional(
      types.array(AccountIncentiveDebtModel),
      []
    ),
    secondaryIncentiveDebt: types.optional(
      types.array(AccountIncentiveDebtModel),
      []
    ),
    allowances: types.optional(
      types.array(
        types.model({
          spender: types.string,
          amount: NotionalTypes.TokenBalance,
        })
      ),
      []
    ),
    stakeNOTEStatus: types.maybe(
      types.model({
        inCoolDown: types.boolean,
        inRedeemWindow: types.boolean,
        redeemWindowBegin: types.number,
        redeemWindowEnd: types.number,
      })
    ),
    // NOTE: below here are values fetched from the graph and will be updated
    // later so that the UI can become active sooner
    accountHistory: types.optional(types.array(AccountHistoryModel), []),
    balanceStatement: types.optional(types.array(BalanceStatementModel), []),
    historicalBalances: types.optional(types.array(HistoricalBalanceModel), []),
  })
  .actions((self) => {
    let provider = getProviderFromNetwork(self.network);

    const refreshAccount = flow(function* () {
      const startTime = performance.now();

      const result: CacheSchema<AccountDefinition> = yield fetchCurrentAccount(
        self.network,
        self.address,
        provider
      );

      const accountDefinition =
        result.values.length === 1 &&
        result.values[0].length === 2 &&
        result.values[0][1] !== null
          ? result.values[0][1]
          : undefined;

      if (accountDefinition) {
        // This is supposed to do a diff and only update the ones that have changed
        self.balances.replace(accountDefinition.balances);

        if (accountDefinition.allowances) {
          self.allowances.replace(accountDefinition.allowances);
        }
        if (accountDefinition.systemAccountType) {
          self.systemAccountType = accountDefinition.systemAccountType;
        }
        if (accountDefinition.allowPrimeBorrow) {
          self.allowPrimeBorrow = accountDefinition.allowPrimeBorrow;
        }
        if (accountDefinition.vaultLastUpdateTime) {
          self.vaultLastUpdateTime.replace(
            accountDefinition.vaultLastUpdateTime
          );
        }
        if (accountDefinition.accountIncentiveDebt) {
          self.accountIncentiveDebt.replace(
            accountDefinition.accountIncentiveDebt
          );
        }
        if (accountDefinition.secondaryIncentiveDebt) {
          self.secondaryIncentiveDebt.replace(
            accountDefinition.secondaryIncentiveDebt
          );
        }
        if (accountDefinition.stakeNOTEStatus) {
          self.stakeNOTEStatus = accountDefinition.stakeNOTEStatus;
        }
        if (accountDefinition.rewardClaims) {
          self.rewardClaims.replace(accountDefinition.rewardClaims);
        }
        self.lastUpdateTimestamp = result.lastUpdateTimestamp;
      }

      const endTime = performance.now();
      console.log(
        `refreshAccount ${self.address} on ${self.network} execution time: ${
          endTime - startTime
        } ms`
      );
    });

    const fetchAccountHistory = flow(function* () {
      const history = (yield AccountRegistryClient.fetchTransactionHistory(
        self.network,
        self.address,
        NX_SUBGRAPH_API_KEY
      )) as Awaited<
        ReturnType<typeof AccountRegistryClient.fetchTransactionHistory>
      >;

      self.accountHistory.replace(
        history.finalResults[self.address] as Instance<
          typeof AccountHistoryModel
        >[]
      );
    });

    const fetchBalanceStatements = flow(function* () {
      const balanceStatements =
        (yield AccountRegistryClient.fetchBalanceStatements(
          self.network,
          self.address,
          NX_SUBGRAPH_API_KEY
        )) as Awaited<
          ReturnType<typeof AccountRegistryClient.fetchBalanceStatements>
        >;

      self.balanceStatement.replace(
        balanceStatements.finalResults[self.address] as Instance<
          typeof BalanceStatementModel
        >[]
      );
    });

    const fetchHistoricalBalances = flow(function* () {
      const historicalBalances =
        (yield AccountRegistryClient.fetchHistoricalBalances(
          self.network,
          self.address,
          NX_SUBGRAPH_API_KEY
        )) as Awaited<
          ReturnType<typeof AccountRegistryClient.fetchHistoricalBalances>
        >;

      self.historicalBalances.replace(
        historicalBalances.finalResults[self.address]
      );
    });

    return {
      afterCreate: refreshAccount,
      refreshAccount,
      fetchAccountHistory,
      fetchBalanceStatements,
      fetchHistoricalBalances,
      setProvider: (p: providers.Provider) => {
        provider = p;
      },
    };
  });
