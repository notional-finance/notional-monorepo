import { flow, types } from 'mobx-state-tree';
import { NotionalTypes } from './ModelTypes';
import { getProviderFromNetwork } from '@notional-finance/util';
import { providers } from 'ethers';
import { fetchCurrentAccount } from '../client/accounts/current-account';
import { AccountDefinition, CacheSchema } from '../Definitions';

const AccountIncentiveDebtModel = types.model('AccountIncentiveDebt', {
  value: NotionalTypes.TokenBalance,
  currencyId: types.number,
});

const BalanceStatementModel = types.model('BalanceStatement', {
  token: NotionalTypes.TokenDefinition,
  blockNumber: types.number,
  underlying: types.late(() => NotionalTypes.TokenDefinition),
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
  txnLabel: types.maybe(types.string),
  timestamp: types.number,
  blockNumber: types.number,
  token: NotionalTypes.TokenDefinition,
  underlying: NotionalTypes.TokenDefinition,
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

export const AccountModel = types
  .model('Account', {
    address: types.string,
    network: NotionalTypes.Network,
    lastUpdateTimestamp: types.optional(types.number, 0),
    systemAccountType: types.optional(NotionalTypes.SystemAccount, 'None'),
    balances: types.optional(types.array(NotionalTypes.TokenBalance), []),
    allowPrimeBorrow: types.maybe(types.boolean),
    vaultLastUpdateTime: types.optional(types.map(types.number), {}),
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
    accountHistory: types.maybe(types.array(AccountHistoryModel)),
    balanceStatement: types.maybe(types.array(BalanceStatementModel)),
    historicalBalances: types.maybe(
      types.array(
        types.model({
          timestamp: types.number,
          balance: NotionalTypes.TokenBalance,
        })
      )
    ),
  })
  .actions((self) => {
    let provider = getProviderFromNetwork(self.network);

    const refreshAccount = flow(function* () {
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
        self.lastUpdateTimestamp = result.lastUpdateTimestamp;
      }
    });

    return {
      afterCreate: refreshAccount,
      setProvider: (p: providers.Provider) => {
        provider = p;
      },
    };
  });
