import {
  filterEmpty,
  getProviderFromNetwork,
  Network,
} from '@notional-finance/util';
import { providers } from 'ethers';
import { BehaviorSubject, filter, lastValueFrom, take, takeUntil } from 'rxjs';
import {
  AccountDefinition,
  BalanceStatement,
  CacheSchema,
  TokenBalance,
  AccountHistory,
} from '..';
import { Routes } from '../server';
import {
  fetchGraph,
  fetchUsingGraph,
  loadGraphClientDeferred,
} from '../server/server-registry';
import { ClientRegistry } from './client-registry';
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { BalanceSnapshot, ProfitLossLineItem, Token } from '../.graphclient';
import {
  parseBalanceStatement,
  parseCurrentBalanceStatement,
} from './accounts/balance-statement';
import { parseTransactionHistory } from './accounts/transaction-history';
import { fetchCurrentAccount } from './accounts/current-account';

export enum AccountFetchMode {
  // Used for the frontend UI, will fetch data for a single account direct from
  // a blockchain provider.
  SINGLE_ACCOUNT_DIRECT,
  // Used for bots or analytical systems, fetches batches of accounts via the
  // server, optionally filtered by some requirement
  BATCH_ACCOUNT_VIA_SERVER,
}

export class AccountRegistryClient extends ClientRegistry<AccountDefinition> {
  protected _activeAccount = new BehaviorSubject<string | null>(null);

  protected _walletProvider?: providers.Web3Provider;

  constructor(cacheHostname: string, public fetchMode: AccountFetchMode) {
    super(cacheHostname);
  }

  set walletProvider(p: providers.Web3Provider) {
    this._walletProvider = p;
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

  public subscribeAccount(network: Network, account: string) {
    const sub = this.subscribeSubject(network, account);
    if (!sub) throw Error(`Account ${account} on ${network} not found`);

    if (this.fetchMode === AccountFetchMode.SINGLE_ACCOUNT_DIRECT) {
      if (account !== this.activeAccount)
        throw Error('Can only fetch active account');

      // Take the values from the subscription until the active account changes
      return sub.pipe(
        takeUntil(this.activeAccount$.pipe(filter((a) => a !== account))),
        filterEmpty()
      );
    }

    return sub;
  }

  /** Triggers a manual refresh of the active account and provides an optional callback on refresh complete */
  public refreshActiveAccount(network: Network) {
    if (this.activeAccount === null) throw Error('No active account');

    // Returns a promise for the  value from the manual refresh
    const p = lastValueFrom(
      this.subscribeAccount(network, this.activeAccount).pipe(take(1))
    );

    this.triggerRefresh(network);

    return p;
  }

  /** Switches the actively listened account to the newly registered one on the specified network*/
  public onAccountReady(
    network: Network,
    account: string,
    fn: (a: AccountDefinition) => void
  ) {
    this.onSubjectKeyReady(network, account, fn);

    if (
      this.fetchMode === AccountFetchMode.SINGLE_ACCOUNT_DIRECT &&
      this.activeAccount !== account
    ) {
      // NOTE: deletes the previously active account from the network subjects
      // registry
      if (this.activeAccount)
        this.networkSubjects.get(network)?.delete(this.activeAccount);

      this._activeAccount.next(account);

      // Kick off a refresh of the accounts if in single account mode and we are
      // changing the account
      this.triggerRefresh(network);
    }
  }

  protected override async _refresh(
    network: Network
  ): Promise<CacheSchema<AccountDefinition>> {
    if (this.fetchMode === AccountFetchMode.SINGLE_ACCOUNT_DIRECT) {
      return this._fetchSingleAccount(
        network,
        this._walletProvider || getProviderFromNetwork(network)
      );
    } else if (this.fetchMode === AccountFetchMode.BATCH_ACCOUNT_VIA_SERVER) {
      return this._fetchBatchAccounts(network);
    }

    throw Error('Unknown fetch mode');
  }

  private async _fetchSingleAccount(
    network: Network,
    provider: providers.Web3Provider
  ) {
    if (this.activeAccount === null) {
      return {
        values: [],
        network,
        lastUpdateTimestamp: this.getLastUpdateTimestamp(network),
        lastUpdateBlock: this.getLastUpdateBlock(network),
      };
    }
    const [txnHistory, balanceStatements, account] = await Promise.all([
      this.fetchTransactionHistory(network, this.activeAccount),
      this.fetchBalanceStatements(network, this.activeAccount),
      fetchCurrentAccount(network, this.activeAccount, provider),
    ]);

    if (account.values[0][1]) {
      // Set the balance statement and txn history
      account.values[0][1].balanceStatement =
        balanceStatements.finalResults[this.activeAccount];
      account.values[0][1].accountHistory =
        txnHistory.finalResults[this.activeAccount];
    }

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
          [account]:
            r.account?.profitLossLineItems
              ?.map((p) => {
                return parseTransactionHistory(
                  p as ProfitLossLineItem,
                  network
                );
              })
              .sort((a, b) => b.timestamp - a.timestamp) || [],
        };
      },
      {
        accountId: account.toLowerCase(),
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
              .map(({ current, snapshots, token }) => {
                if (!token.underlying) throw Error('Unknown underlying');
                return {
                  ...parseCurrentBalanceStatement(
                    current as BalanceSnapshot,
                    token as Token,
                    network
                  ),
                  // NOTE: this is used to populate the account history chart in the portfolio page
                  historicalSnapshots:
                    snapshots?.map((s) =>
                      parseBalanceStatement(
                        token.id,
                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                        token.underlying!.id,
                        s as BalanceSnapshot,
                        network
                      )
                    ) || [],
                };
              }) || [],
        };
      },
      {
        accountId: account.toLowerCase(),
      }
    );
  }

  private async _fetchBatchAccounts(network: Network) {
    const { AllAccountsDocument } = await loadGraphClientDeferred();
    const accounts = await fetchUsingGraph(
      network,
      AllAccountsDocument,
      (r) => {
        return r.accounts.reduce((o, a) => {
          const acct = {
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
            balanceStatement: a.balances
              ?.filter((b) => !!b.token.underlying)
              .map((b) =>
                parseCurrentBalanceStatement(
                  b.current as BalanceSnapshot,
                  b.token as Token,
                  network
                )
              ),
            accountHistory:
              a.profitLossLineItems?.map((p) =>
                parseTransactionHistory(p as ProfitLossLineItem, network)
              ) || [],
          } as AccountDefinition;

          return Object.assign(o, { [a.id]: acct });
        }, {} as Record<string, AccountDefinition>);
      },
      { skip: 0 },
      'accounts'
    );

    return accounts;
  }
}
