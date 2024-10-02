import {
  ACCOUNT_ID_RANGES,
  filterEmpty,
  getNowSeconds,
  getProviderFromNetwork,
  Network,
  SECONDS_IN_DAY,
} from '@notional-finance/util';
import { providers } from 'ethers';
import { BehaviorSubject, from, of, switchMap } from 'rxjs';
import {
  AccountDefinition,
  BalanceStatement,
  CacheSchema,
  TokenBalance,
  AccountHistory,
  HistoricalBalance,
  Registry,
} from '..';
import { Routes } from '../server';
import {
  fetchGraph,
  fetchGraphPaginate,
  loadGraphClientDeferred,
} from '../server/server-registry';
import { ClientRegistry } from './client-registry';
// eslint-disable-next-line @nx/enforce-module-boundaries
import {
  AllAccountsQuery,
  BalanceSnapshot,
  Token,
  Transaction,
} from '../.graphclient';
import { parseCurrentBalanceStatement } from './accounts/balance-statement';
import { parseTransaction } from './accounts/transaction-history';
import { fetchCurrentAccount } from './accounts/current-account';
import { ExecutionResult } from 'graphql';

export enum AccountFetchMode {
  // Used for the frontend UI, will fetch data for a single account direct from
  // a blockchain provider.
  SINGLE_ACCOUNT_DIRECT,
  // Used for bots or analytical systems, fetches batches of accounts via the
  // server, optionally filtered by some requirement
  BATCH_ACCOUNT_VIA_SERVER,
}

export class AccountRegistryClient extends ClientRegistry<AccountDefinition> {
  protected subgraphApiKey = '';

  protected _activeAccount = new BehaviorSubject<string | null>(null);

  protected _walletProvider?: providers.Provider;

  constructor(cacheHostname: string, public fetchMode: AccountFetchMode) {
    super(cacheHostname);
  }

  set walletProvider(p: providers.Provider) {
    this._walletProvider = p;
  }

  set setSubgraphAPIKey(s: string) {
    // NOTE: this should only be required in a Cloudflare environment where the process.env
    // is not set like it is in other places.
    this.subgraphApiKey = s;
  }

  protected cachePath() {
    if (this.fetchMode === AccountFetchMode.SINGLE_ACCOUNT_DIRECT) {
      // In single account mode, will only fetch the active account from the cache to get any
      // vault account positions
      return `${Routes.Accounts}/${this.activeAccount}`;
    } else {
      return Routes.Accounts;
    }
  }

  get activeAccount() {
    if (this.fetchMode !== AccountFetchMode.SINGLE_ACCOUNT_DIRECT)
      throw Error('Must be in single account mode');
    return this._activeAccount.getValue();
  }

  get activeAccount$() {
    return this._activeAccount.asObservable();
  }

  public getAccount(network: Network, account: string) {
    if (
      this.fetchMode === AccountFetchMode.SINGLE_ACCOUNT_DIRECT &&
      account !== this.activeAccount
    )
      throw Error('Can only fetch active account');

    return this.getLatestFromSubject(network, account);
  }

  public subscribeActiveAccount(network: Network) {
    return this.activeAccount$.pipe(
      switchMap((a) =>
        a
          ? from(
              new Promise<ReturnType<typeof this.subscribeSubject>>((resolve) =>
                this.onSubjectKeyRegistered(network, a, () =>
                  resolve(this.subscribeSubject(network, a))
                )
              )
            )
          : of(of(null))
      ),
      filterEmpty(),
      switchMap((o) => o)
    );
  }

  public async refreshBalanceHistory(network: Network) {
    if (this.activeAccount === null) return undefined;
    const subject = this._getNetworkSubjects(network).get(this.activeAccount);
    const currentAccount = subject?.value;

    if (currentAccount) {
      const newAccount = await this._refreshBalanceHistory(
        network,
        this.activeAccount,
        Object.assign(currentAccount)
      );
      subject.next(newAccount);

      return newAccount;
    }

    return undefined;
  }

  /** Triggers a manual refresh of the active account and provides an optional callback on refresh complete */
  public refreshActiveAccount(network: Network) {
    if (this.activeAccount === null) throw Error('No active account');
    this.triggerRefresh(network);
  }

  /** Switches the actively listened account to the newly registered one */
  public setAccount(network: Network, account: string) {
    if (
      this.fetchMode === AccountFetchMode.SINGLE_ACCOUNT_DIRECT &&
      (this.activeAccount !== account ||
        !this.isKeyRegistered(network, account))
    ) {
      // NOTE: deletes the previously active account from the network subjects
      // registry
      if (this.activeAccount)
        this.networkSubjects.get(network)?.delete(this.activeAccount);

      this._activeAccount.next(account);

      // Kick off a refresh of the accounts if in single account mode and we are
      // changing the account
      return this.triggerRefreshPromise(network);
    } else {
      return;
    }
  }

  protected override async _refresh(
    network: Network,
    blockNumber?: number
  ): Promise<CacheSchema<AccountDefinition>> {
    if (this.fetchMode === AccountFetchMode.SINGLE_ACCOUNT_DIRECT) {
      return this._fetchSingleAccount(
        network,
        // this._walletProvider || getProviderFromNetwork(network)
        getProviderFromNetwork(network)
      );
    } else if (this.fetchMode === AccountFetchMode.BATCH_ACCOUNT_VIA_SERVER) {
      return this._fetchBatchAccounts(network, blockNumber);
    }

    throw Error('Unknown fetch mode');
  }

  private async _refreshBalanceHistory(
    network: Network,
    address: string,
    account: AccountDefinition
  ) {
    try {
      const [txnHistory, balanceStatements, historicalBalances] =
        await Promise.all([
          this.fetchTransactionHistory(network, address),
          this.fetchBalanceStatements(network, address),
          this.fetchHistoricalBalances(network, address),
        ]);

      // Set the balance statement and txn history
      account.balanceStatement = balanceStatements.finalResults[address];
      account.accountHistory = txnHistory.finalResults[address];
      account.historicalBalances = historicalBalances.finalResults[
        address
      ].sort((a, b) => a.timestamp - b.timestamp);
    } catch (e) {
      console.error(e);
      account.balanceStatement = undefined;
      account.accountHistory = undefined;
      account.historicalBalances = undefined;
    }

    return account;
  }

  private async _fetchSingleAccount(
    network: Network,
    provider: providers.Provider
  ) {
    if (this.activeAccount === null) {
      return {
        values: [],
        network,
        lastUpdateTimestamp: this.getLastUpdateTimestamp(network),
        lastUpdateBlock: this.getLastUpdateBlock(network),
      };
    }
    const account = await fetchCurrentAccount(
      network,
      this.activeAccount,
      provider
    );

    account.values[0][1] = await this._refreshBalanceHistory(
      network,
      this.activeAccount,
      account.values[0][1] as AccountDefinition
    );

    return account;
  }

  public async fetchTransactionHistory(network: Network, account: string) {
    const { AccountTransactionHistoryDocument } =
      await loadGraphClientDeferred();
    return await fetchGraph(
      network,
      AccountTransactionHistoryDocument,
      (r): Record<string, AccountHistory[]> => {
        return {
          [account]: r.transactions
            ?.map((t) => {
              return parseTransaction(t as Transaction, network);
            })
            .flatMap((_) => _),
        };
      },
      this.subgraphApiKey,
      {
        accountId: account.toLowerCase(),
      }
    );
  }

  public async fetchHistoricalBalances(
    network: Network,
    account: string,
    minTimestamp = getNowSeconds() - 30 * SECONDS_IN_DAY
  ) {
    const { AccountHoldingsHistoricalDocument } =
      await loadGraphClientDeferred();
    return await fetchGraph(
      network,
      AccountHoldingsHistoricalDocument,
      (r): Record<string, HistoricalBalance[]> => {
        // These are the balances of any tokens that do not have
        // a snapshot in the time range (meaning their balance did)
        // not change during the time span
        const current =
          r.account?.balances
            ?.filter(({ current }) => current.timestamp < minTimestamp)
            .map(({ current, token }) => {
              const t = Registry.getTokenRegistry().getTokenByID(
                network,
                token.id
              );
              return {
                timestamp: current.timestamp,
                balance: TokenBalance.from(current.currentBalance, t),
              };
            }) || [];

        const snapshots =
          r.account?.balances?.flatMap(({ snapshots, token }) => {
            const t = Registry.getTokenRegistry().getTokenByID(
              network,
              token.id
            );
            return (
              snapshots?.map(({ timestamp, currentBalance }) => ({
                timestamp,
                balance: TokenBalance.from(currentBalance, t),
              })) || []
            );
          }) || [];

        return {
          [account]: snapshots.concat(current),
        };
      },
      this.subgraphApiKey,
      {
        accountId: account.toLowerCase(),
        minTimestamp,
      }
    );
  }

  public async fetchBalanceStatements(network: Network, account: string) {
    const { AccountBalanceStatementDocument } = await loadGraphClientDeferred();
    return await fetchGraph(
      network,
      AccountBalanceStatementDocument,
      (r): Record<string, BalanceStatement[]> => {
        return {
          [account]:
            r.account?.balances
              ?.filter(({ token }) => !!token.underlying)
              .map(({ current, token }) => {
                if (!token.underlying) throw Error('Unknown underlying');
                return {
                  ...parseCurrentBalanceStatement(
                    current as BalanceSnapshot,
                    token as Token,
                    network
                  ),
                };
              }) || [],
        };
      },
      this.subgraphApiKey,
      {
        accountId: account.toLowerCase(),
      }
    );
  }

  private async _fetchBatchAccounts(network: Network, blockNumber?: number) {
    const { AllAccountsDocument, AllAccountsByBlockDocument } =
      await loadGraphClientDeferred();

    const accountData: AccountDefinition[] = [];
    for (let i = 0; i < ACCOUNT_ID_RANGES.length - 1; i++) {
      const results = await fetchGraphPaginate(
        network,
        blockNumber ? AllAccountsByBlockDocument : AllAccountsDocument,
        'accounts',
        this.subgraphApiKey,
        {
          skip: 0,
          startId: ACCOUNT_ID_RANGES[i],
          endId: ACCOUNT_ID_RANGES[i + 1],
          blockNumber,
        }
      );

      (results as ExecutionResult<AllAccountsQuery>).data?.accounts.forEach(
        (a) => {
          accountData.push({
            address: a.id,
            network,
            systemAccountType: a.systemAccountType,
            balances:
              a.balances?.map((b) =>
                TokenBalance.fromID(
                  b.current.currentBalance,
                  b.token.id,
                  network
                )
              ) || [],
          } as AccountDefinition);
        }
      );
    }

    return {
      values: accountData.reduce((acc, a) => {
        acc.push([a.address, a]);
        return acc;
      }, [] as [string, AccountDefinition | null][]),
      network,
      lastUpdateTimestamp: getNowSeconds(),
      lastUpdateBlock: 0,
    };
  }
}
