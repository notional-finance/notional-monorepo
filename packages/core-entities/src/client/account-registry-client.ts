import {
  ERC20ABI,
  NotionalV3,
  NotionalV3ABI,
} from '@notional-finance/contracts';
import {
  AggregateCall,
  NO_OP,
  getMulticall,
} from '@notional-finance/multicall';
import {
  encodefCashId,
  getProviderFromNetwork,
  INTERNAL_TOKEN_PRECISION,
  MAX_APPROVAL,
  Network,
  NotionalAddress,
  PRIME_CASH_VAULT_MATURITY,
  RATE_PRECISION,
  ZERO_ADDRESS,
} from '@notional-finance/util';
import { BigNumber, Contract } from 'ethers';
import { BehaviorSubject, filter, lastValueFrom, take, takeUntil } from 'rxjs';
import {
  AccountDefinition,
  BalanceStatement,
  CacheSchema,
  Registry,
  TokenBalance,
  AccountHistory,
} from '..';
import { Routes } from '../server';
import {
  fetchGraph,
  fetchUsingMulticall,
  loadGraphClientDeferred,
} from '../server/server-registry';
import { ClientRegistry } from './client-registry';
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { BalanceSnapshot } from '../.graphclient';

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

  constructor(cacheHostname: string, public fetchMode: AccountFetchMode) {
    super(cacheHostname);
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
        takeUntil(this.activeAccount$.pipe(filter((a) => a !== account)))
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

    this.triggerRefresh(network, 0);

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
      this.triggerRefresh(network, 0);
    }
  }

  protected override async _refresh(
    network: Network
  ): Promise<CacheSchema<AccountDefinition>> {
    if (this.fetchMode === AccountFetchMode.SINGLE_ACCOUNT_DIRECT) {
      return this._fetchSingleAccount(network);
    } else {
      return super._refresh(network);
    }
  }

  private async _fetchSingleAccount(network: Network) {
    const provider = getProviderFromNetwork(network);
    const notional = new Contract(
      NotionalAddress[network],
      NotionalV3ABI,
      provider
    ) as NotionalV3;

    if (this.activeAccount === null) {
      return {
        values: [],
        network,
        lastUpdateTimestamp: this.getLastUpdateTimestamp(network),
        lastUpdateBlock: this.getLastUpdateBlock(network),
      };
    }
    const activeAccount = this.activeAccount;
    const tokens = Registry.getTokenRegistry();
    const config = Registry.getConfigurationRegistry();
    const walletTokensToTrack = tokens
      .getAllTokens(network)
      .filter((t) => t.currencyId !== undefined && t.tokenType === 'Underlying')
      .map((t) => t.address);

    const walletCalls = walletTokensToTrack.flatMap<AggregateCall>(
      (address) => {
        const def = tokens.getTokenByAddress(network, address);
        if (def.address === ZERO_ADDRESS) {
          return [
            {
              stage: 0,
              target: getMulticall(provider),
              method: 'getEthBalance',
              args: [activeAccount],
              key: `${address}.balance`,
              transform: (b: BigNumber) => {
                return TokenBalance.from(b, def);
              },
            },
            {
              stage: 0,
              target: NO_OP,
              method: NO_OP,
              key: `${address}.allowance`,
              transform: () => {
                return TokenBalance.from(MAX_APPROVAL, def);
              },
            },
          ];
        } else {
          return [
            {
              stage: 0,
              target: new Contract(address, ERC20ABI, provider),
              method: 'balanceOf',
              args: [activeAccount],
              key: `${address}.balance`,
              transform: (b: BigNumber) => {
                return TokenBalance.from(b, def);
              },
            },
            {
              stage: 0,
              target: new Contract(address, ERC20ABI, provider),
              method: 'allowance',
              args: [activeAccount, notional.address],
              key: `${address}.allowance`,
              transform: (b: BigNumber) => {
                return TokenBalance.from(b, def);
              },
            },
          ];
        }
      }
    );

    const vaultCalls =
      config.getAllListedVaults(network)?.flatMap<AggregateCall>((v) => {
        return [
          {
            stage: 0,
            target: notional,
            method: 'getVaultAccountWithFeeAccrual',
            args: [this.activeAccount, v.vaultAddress],
            key: `${v.vaultAddress}.balance`,
            transform: (
              r: Awaited<
                ReturnType<NotionalV3['getVaultAccountWithFeeAccrual']>
              >
            ) => {
              const vaultAccount = r[0];
              const maturity = vaultAccount.maturity.toNumber();
              if (maturity === 0) return [];
              const accountDebt = r.accruedPrimeVaultFeeInUnderlying.isZero()
                ? vaultAccount.accountDebtUnderlying
                : r.accruedPrimeVaultFeeInUnderlying;
              const {
                vaultShareID,
                primaryDebtID,
                primaryCashID,
                primaryTokenId,
              } = config.getVaultIDs(network, v.vaultAddress, maturity);
              const balances = [
                TokenBalance.fromID(
                  vaultAccount.vaultShares,
                  vaultShareID,
                  network
                ),
                this._parseVaultDebtBalance(
                  primaryDebtID,
                  primaryTokenId,
                  accountDebt,
                  maturity,
                  network
                ),
              ];

              if (!vaultAccount.tempCashBalance.isZero()) {
                balances.push(
                  TokenBalance.fromID(
                    vaultAccount.tempCashBalance,
                    primaryCashID,
                    network
                  )
                );
              }

              return balances;
            },
          },
          {
            stage: 0,
            target: notional,
            method: 'getVaultAccountSecondaryDebt',
            args: [this.activeAccount, v.vaultAddress],
            key: `${v.vaultAddress}.balance2`,
            transform: (
              r: Awaited<ReturnType<NotionalV3['getVaultAccountSecondaryDebt']>>
            ) => {
              const maturity = r.maturity.toNumber();
              if (maturity === 0) return [] as TokenBalance[];
              const {
                secondaryOneCashID,
                secondaryOneDebtID,
                secondaryOneTokenId,
                secondaryTwoCashID,
                secondaryTwoDebtID,
                secondaryTwoTokenId,
              } = config.getVaultIDs(network, v.vaultAddress, maturity);

              const secondaries: TokenBalance[] = [];

              if (
                secondaryOneDebtID &&
                secondaryOneTokenId &&
                !r.accountSecondaryDebt[0].isZero()
              ) {
                secondaries.push(
                  this._parseVaultDebtBalance(
                    secondaryOneDebtID,
                    secondaryOneTokenId,
                    r.accountSecondaryDebt[0],
                    maturity,
                    network
                  )
                );
              }

              if (
                secondaryTwoDebtID &&
                secondaryTwoTokenId &&
                !r.accountSecondaryDebt[1].isZero()
              ) {
                secondaries.push(
                  this._parseVaultDebtBalance(
                    secondaryTwoDebtID,
                    secondaryTwoTokenId,
                    r.accountSecondaryDebt[1],
                    maturity,
                    network
                  )
                );
              }

              if (
                secondaryOneCashID &&
                !r.accountSecondaryCashHeld[0].isZero()
              ) {
                secondaries.push(
                  TokenBalance.fromID(
                    r.accountSecondaryCashHeld[0],
                    secondaryOneCashID,
                    network
                  )
                );
              }

              if (
                secondaryTwoCashID &&
                !r.accountSecondaryCashHeld[1].isZero()
              ) {
                secondaries.push(
                  TokenBalance.fromID(
                    r.accountSecondaryCashHeld[1],
                    secondaryTwoCashID,
                    network
                  )
                );
              }

              return secondaries;
            },
          },
        ];
      }) || [];

    const calls = [
      ...walletCalls,
      ...vaultCalls,
      {
        target: notional,
        method: 'getAccount',
        args: [this.activeAccount],
        key: `${notional.address}.account`,
        transform: (r: Awaited<ReturnType<NotionalV3['getAccount']>>) => {
          const accountBalances = r.accountBalances.flatMap((b) => {
            const balances: TokenBalance[] = [];

            if (b.cashBalance.gt(0)) {
              const pCash = tokens.getPrimeCash(network, b.currencyId);
              balances.push(TokenBalance.from(b.cashBalance, pCash));
            } else if (b.cashBalance.lt(0)) {
              const pCash = tokens.getPrimeCash(network, b.currencyId);
              const pDebt = tokens.getPrimeDebt(network, b.currencyId);
              balances.push(
                TokenBalance.from(b.cashBalance, pCash).toToken(pDebt)
              );
            }

            if (b.nTokenBalance.gt(0)) {
              const nToken = tokens.getNToken(network, b.currencyId);
              balances.push(TokenBalance.from(b.nTokenBalance, nToken));
            }

            return balances;
          });

          const portfolioBalances = r.portfolio.map((a) => {
            const fCashId = encodefCashId(a.currencyId, a.maturity.toNumber());
            return TokenBalance.fromID(a.notional, fCashId, network);
          });

          return {
            balances: accountBalances.concat(portfolioBalances),
            allowPrimeBorrow: r.accountContext.allowPrimeBorrow,
          };
        },
      },
    ];

    const { finalResults: balanceStatement } =
      await this.fetchBalanceStatements(network, activeAccount);
    const { finalResults: accountHistory } = await this.fetchTransactionHistory(
      network,
      activeAccount
    );
    return fetchUsingMulticall<AccountDefinition>(network, calls, [
      (results: Record<string, TokenBalance | TokenBalance[]>) => {
        return {
          [activeAccount]: {
            address: activeAccount,
            network,
            balanceStatement: balanceStatement[activeAccount],
            accountHistory: accountHistory[activeAccount],
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            allowPrimeBorrow: (results[`${notional.address}.account`] as any)[
              'allowPrimeBorrow'
            ],
            balances: Object.keys(results).flatMap((k) =>
              k.includes('balance')
                ? results[k]
                : k.includes('account')
                ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  ((results[k] as any)['balances'] as TokenBalance[])
                : []
            ),
            allowances: Object.keys(results)
              .filter((k) => k.includes('.allowance'))
              .map((k) => {
                return {
                  spender: notional.address,
                  amount: results[k] as TokenBalance,
                };
              }),
          },
        };
      },
    ]);
  }

  private _parseBalanceStatement(
    tokenId: string,
    underlyingId: string,
    snapshot: BalanceSnapshot,
    network: Network
  ) {
    return {
      timestamp: snapshot.timestamp,
      balance: TokenBalance.fromID(snapshot.currentBalance, tokenId, network),
      accumulatedCostRealized: TokenBalance.fromID(
        snapshot._accumulatedCostRealized,
        underlyingId,
        network
      ),
      adjustedCostBasis: TokenBalance.fromID(
        snapshot.adjustedCostBasis,
        underlyingId,
        network
      ),
      totalILAndFees: TokenBalance.fromID(
        snapshot.totalILAndFeesAtSnapshot,
        underlyingId,
        network
      ),
      totalProfitAndLoss: TokenBalance.fromID(
        snapshot.totalProfitAndLossAtSnapshot,
        underlyingId,
        network
      ),
      totalInterestAccrual: TokenBalance.fromID(
        snapshot.totalInterestAccrualAtSnapshot,
        underlyingId,
        network
      ),
      impliedFixedRate: snapshot.impliedFixedRate
        ? snapshot.impliedFixedRate / RATE_PRECISION
        : undefined,
    };
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
            r.account?.profitLossLineItems?.map((p) => {
              const tokenId = p.token.id;
              const underlyingId = p.underlyingToken.id;
              const token = Registry.getTokenRegistry().getTokenByID(
                network,
                tokenId
              );
              const vaultName =
                !!token.vaultAddress && token.vaultAddress !== ZERO_ADDRESS
                  ? Registry.getConfigurationRegistry().getVaultName(
                      token.network,
                      token.vaultAddress
                    )
                  : undefined;

              return {
                timestamp: p.timestamp,
                token,
                vaultName,
                underlying: Registry.getTokenRegistry().getTokenByID(
                  network,
                  underlyingId
                ),
                tokenAmount: TokenBalance.fromID(
                  p.tokenAmount,
                  tokenId,
                  network
                ),
                bundleName: p.bundle.bundleName,
                transactionHash: p.transactionHash.id,
                underlyingAmountRealized: TokenBalance.fromID(
                  p.underlyingAmountRealized,
                  underlyingId,
                  network
                ),
                underlyingAmountSpot: TokenBalance.fromID(
                  p.underlyingAmountSpot,
                  underlyingId,
                  network
                ),
                realizedPrice: TokenBalance.fromID(
                  p.realizedPrice,
                  underlyingId,
                  network
                ),
                spotPrice: TokenBalance.fromID(
                  p.spotPrice,
                  underlyingId,
                  network
                ),
                impliedFixedRate: p.impliedFixedRate
                  ? p.impliedFixedRate / RATE_PRECISION
                  : undefined,
              };
            }) || [],
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
            r.account?.balances?.map(
              ({ current, snapshots, token: { id: tokenId, underlying } }) => {
                const tokens = Registry.getTokenRegistry();
                if (!underlying) throw Error('Unknown underlying');
                const currentStatement = this._parseBalanceStatement(
                  tokenId,
                  underlying.id,
                  current as BalanceSnapshot,
                  network
                );

                const currentProfitAndLoss = currentStatement.balance
                  .toUnderlying()
                  .sub(
                    currentStatement.adjustedCostBasis.scale(
                      currentStatement.balance.n,
                      INTERNAL_TOKEN_PRECISION
                    )
                  );
                const totalProfitAndLoss = currentStatement.balance
                  .toUnderlying()
                  .sub(currentStatement.accumulatedCostRealized);
                const totalInterestAccrual = currentProfitAndLoss.sub(
                  currentStatement.totalILAndFees
                );

                return {
                  token: tokens.getTokenByID(network, tokenId),
                  underlying: tokens.getTokenByID(network, underlying.id),
                  currentBalance: currentStatement.balance,
                  adjustedCostBasis: currentStatement.adjustedCostBasis,
                  totalILAndFees: currentStatement.totalILAndFees,
                  totalProfitAndLoss,
                  totalInterestAccrual,
                  accumulatedCostRealized:
                    currentStatement.accumulatedCostRealized,
                  historicalSnapshots:
                    snapshots?.map((s) =>
                      this._parseBalanceStatement(
                        tokenId,
                        underlying.id,
                        s as BalanceSnapshot,
                        network
                      )
                    ) || [],
                };
              }
            ) || [],
        };
      },
      {
        accountId: account.toLowerCase(),
      }
    );
  }

  private _parseVaultDebtBalance(
    debtID: string,
    underlyingID: string,
    balance: BigNumber,
    maturity: number,
    network: Network
  ) {
    if (maturity === PRIME_CASH_VAULT_MATURITY) {
      // In in the prime vault maturity, convert from underlying back to prime debt denomination
      const tokens = Registry.getTokenRegistry();
      const vaultDebtToken = tokens.getTokenByID(network, debtID);
      const pDebt = TokenBalance.fromID(balance, underlyingID, network)
        .scaleFromInternal()
        .toToken(tokens.unwrapVaultToken(vaultDebtToken));
      return TokenBalance.fromID(pDebt.n, debtID, network);
    }

    return TokenBalance.fromID(balance, debtID, network);
  }
}
