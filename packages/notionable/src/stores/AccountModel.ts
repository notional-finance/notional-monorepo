import {
  flow,
  getParent,
  getRoot,
  getType,
  Instance,
  types,
} from 'mobx-state-tree';
import { getProviderFromNetwork, Network } from '@notional-finance/util';
import { providers } from 'ethers';
import {
  AccountDefinition,
  CacheSchema,
  NotionalTypes,
  TokenDefinitionModel,
  fetchBalanceStatements,
  fetchCurrentAccount,
  fetchHistoricalBalances,
  fetchTransactionHistory,
} from '@notional-finance/core-entities';
import { RootStoreInterface } from './root-store';
import { TradeModel } from './TradeModel';

const NX_SUBGRAPH_API_KEY = process.env['NX_SUBGRAPH_API_KEY'] as string;

const TokenDefinitionReference = types.reference(TokenDefinitionModel, {
  get(identifier, parent) {
    const root = () => getRoot<RootStoreInterface>(parent);
    const parentName = getType(parent).name;

    let selectedNetwork: Network | undefined;

    switch (parentName) {
      case 'TradeModel':
        selectedNetwork = parent?.selectedNetwork;
        break;
      case 'TokenOption':
        selectedNetwork = getParent<Instance<typeof TradeModel>>(
          parent,
          2
        )?.selectedNetwork;
        break;
      case 'BalanceStatement':
      case 'AccountHistory': {
        const accountModel = getParent<Instance<typeof AccountModel>>(
          parent,
          2
        );
        selectedNetwork = accountModel?.network;
        break;
      }
      default:
        selectedNetwork =
          getParent<Instance<typeof TradeModel>>(parent)?.selectedNetwork;
    }

    if (!selectedNetwork) {
      console.error('Parent reference lookup failed for:', {
        parentName,
        identifier,
        parent,
      });
      throw Error(
        `Token Definition parent reference not found for ${parentName}`
      );
    }

    const model = root().getNetworkClient(selectedNetwork);
    return model.getTokenByID(identifier.toString()) as Instance<
      typeof TokenDefinitionModel
    >;
  },
  set(value) {
    return value.id;
  },
});

export const BalanceStatementModel = types.model('BalanceStatement', {
  token: TokenDefinitionReference,
  blockNumber: types.number,
  underlying: TokenDefinitionReference,
  currentBalance: NotionalTypes.TokenBalance,
  adjustedCostBasis: NotionalTypes.TokenBalance,
  totalVaultFees: NotionalTypes.TokenBalance,
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

const WithdrawRequestModel = types.model('WithdrawRequest', {
  withdrawManager: types.string,
  requestId: NotionalTypes.BigNumber,
  sharesAmount: NotionalTypes.TokenBalance,
  yieldTokenAmount: NotionalTypes.TokenBalance,
  finalized: types.boolean,
  withdrawTokenAmount: types.maybe(NotionalTypes.TokenBalance),
  canFinalize: types.maybe(types.boolean),
});

const AccountHistoryModel = types.model('AccountHistory', {
  lineItemType: types.string,
  txnLabel: types.optional(types.maybe(types.string), undefined),
  timestamp: types.number,
  blockNumber: types.number,
  token: TokenDefinitionReference,
  underlying: TokenDefinitionReference,
  tokenAmount: NotionalTypes.TokenBalance,
  transactionHash: types.string,
  underlyingAmountRealized: NotionalTypes.TokenBalance,
  underlyingAmountSpot: NotionalTypes.TokenBalance,
  realizedPrice: NotionalTypes.TokenBalance,
  spotPrice: NotionalTypes.TokenBalance,
  impliedFixedRate: types.maybe(types.number),
  account: types.maybe(types.string),
});

export const HistoricalBalanceModel = types.model('HistoricalBalance', {
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
    isContract: types.maybe(types.boolean),
    vaultLastUpdateTime: types.optional(types.map(types.number), {}),
    rewardClaims: types.optional(
      types.map(types.array(NotionalTypes.TokenBalance)),
      {}
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
    lendingRouterApprovals: types.optional(types.map(types.boolean), {}),
    // NOTE: below here are values fetched from the graph and will be updated
    // later so that the UI can become active sooner
    accountHistory: types.optional(types.array(AccountHistoryModel), []),
    balanceStatement: types.optional(types.array(BalanceStatementModel), []),
    historicalBalances: types.optional(types.array(HistoricalBalanceModel), []),
    withdrawRequests: types.optional(
      types.map(types.array(WithdrawRequestModel)),
      {}
    ),
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
        if (accountDefinition.vaultLastUpdateTime) {
          self.vaultLastUpdateTime.replace(
            accountDefinition.vaultLastUpdateTime
          );
        }
        if (accountDefinition.stakeNOTEStatus) {
          self.stakeNOTEStatus = accountDefinition.stakeNOTEStatus;
        }
        if (accountDefinition.rewardClaims) {
          self.rewardClaims.replace(accountDefinition.rewardClaims);
        }
        if (accountDefinition.lendingRouterApprovals) {
          self.lendingRouterApprovals.replace(
            accountDefinition.lendingRouterApprovals
          );
        }
        if (accountDefinition.withdrawRequests) {
          self.withdrawRequests.replace(accountDefinition.withdrawRequests);
        }
        self.lastUpdateTimestamp = result.lastUpdateTimestamp;
        self.isContract = accountDefinition?.isContract || false;
      }

      // NOTE: don't allow any of these to fail and cause the account
      // to not fully load
      try {
        yield fetchStatements();
      } catch (e) {
        console.error(e);
      }

      try {
        yield fetchAccountHistory();
      } catch (e) {
        console.error(e);
      }

      try {
        yield fetchHistoryBalances();
      } catch (e) {
        console.error(e);
      }

      const endTime = performance.now();
      console.log(
        `refreshAccount ${self.address} on ${self.network} execution time: ${
          endTime - startTime
        } ms`
      );
    });

    const fetchAccountHistory = flow(function* () {
      const history = (yield fetchTransactionHistory(
        self.network,
        self.address,
        NX_SUBGRAPH_API_KEY
      )) as Awaited<ReturnType<typeof fetchTransactionHistory>>;

      self.accountHistory.replace(
        history.finalResults[self.address].map((v) => ({
          ...v,
          blockNumber: Number(v.blockNumber),
        })) as Instance<typeof AccountHistoryModel>[]
      );
    });

    const fetchStatements = flow(function* () {
      try {
        const balanceStatements = (yield fetchBalanceStatements(
          self.network,
          self.address,
          NX_SUBGRAPH_API_KEY
        )) as Awaited<ReturnType<typeof fetchBalanceStatements>>;

        self.balanceStatement.replace(
          balanceStatements.finalResults[self.address].map((v) => ({
            ...v,
            blockNumber: Number(v.blockNumber),
          })) as Instance<typeof BalanceStatementModel>[]
        );
      } catch (e) {
        console.error(e);
      }
    });

    const fetchHistoryBalances = flow(function* () {
      const historicalBalances = (yield fetchHistoricalBalances(
        self.network,
        self.address,
        NX_SUBGRAPH_API_KEY
      )) as Awaited<ReturnType<typeof fetchHistoricalBalances>>;

      self.historicalBalances.replace(
        historicalBalances.finalResults[self.address]
      );
    });

    return {
      refreshAccount,
      setProvider: (p: providers.Provider) => {
        provider = p;
      },
    };
  });
