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
  filterEmpty,
  getNowSeconds,
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
  AccountIncentiveDebt,
} from '..';
import { Routes } from '../server';
import {
  fetchGraph,
  fetchUsingGraph,
  fetchUsingMulticall,
  loadGraphClientDeferred,
} from '../server/server-registry';
import { ClientRegistry } from './client-registry';
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { BalanceSnapshot, ProfitLossLineItem, Token } from '../.graphclient';

const USE_CROSS_FETCH =
  process.env['NX_USE_CROSS_FETCH'] === 'true' ||
  process.env['NODE_ENV'] === 'test';

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
      return this._fetchSingleAccount(network);
    } else if (this.fetchMode === AccountFetchMode.BATCH_ACCOUNT_VIA_SERVER) {
      return this._fetchBatchAccounts(network);
    }

    throw Error('Unknown fetch mode');
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
                return { balances: [TokenBalance.from(b, def)] };
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
                return { balances: [TokenBalance.from(b, def)] };
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
            method: 'getVaultAccount',
            args: [this.activeAccount, v.vaultAddress],
            key: `${v.vaultAddress}.balance`,
            transform: (
              vaultAccount: Awaited<ReturnType<NotionalV3['getVaultAccount']>>
            ) => {
              const maturity = vaultAccount.maturity.toNumber();
              if (maturity === 0) return { balances: [] };
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
                  vaultAccount.accountDebtUnderlying,
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

              return {
                balances,
                vaultLastUpdateTime: {
                  [v.vaultAddress]: vaultAccount.lastUpdateBlockTime.toNumber(),
                },
              };
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
              if (maturity === 0) return { balances: [] };
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

              return { balances: secondaries };
            },
          },
        ];
      }) || [];

    const nowSeconds = getNowSeconds();
    const NOTE = Registry.getTokenRegistry().getTokenBySymbol(network, 'NOTE');
    const calls = [
      ...walletCalls,
      ...vaultCalls,
      {
        target: notional,
        method: 'getAccount',
        args: [this.activeAccount],
        key: `${notional.address}.account`,
        transform: (r: Awaited<ReturnType<NotionalV3['getAccount']>>) => {
          const accountIncentiveDebt: AccountIncentiveDebt[] = [];

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

            accountIncentiveDebt.push({
              value: TokenBalance.from(b.accountIncentiveDebt, NOTE),
              currencyId: b.currencyId,
            });

            return balances;
          });

          const portfolioBalances = r.portfolio.map((a) => {
            const fCashId = encodefCashId(a.currencyId, a.maturity.toNumber());
            return TokenBalance.fromID(a.notional, fCashId, network);
          });

          return {
            balances: accountBalances.concat(portfolioBalances),
            accountIncentiveDebt,
            allowPrimeBorrow: r.accountContext.allowPrimeBorrow,
          };
        },
      },
      {
        target: notional,
        method: 'nTokenGetClaimableIncentives',
        args: [this.activeAccount, nowSeconds],
        key: `${notional.address}.NOTE`,
        transform: (
          r: Awaited<ReturnType<NotionalV3['nTokenGetClaimableIncentives']>>
        ) => {
          return TokenBalance.fromID(r, 'NOTE', Network.All);
        },
      },
      {
        target: notional,
        method: 'nTokenGetClaimableIncentives',
        args: [this.activeAccount, getNowSeconds() + 100],
        key: `${notional.address}.NOTE_plus100`,
        transform: (
          r: Awaited<ReturnType<NotionalV3['nTokenGetClaimableIncentives']>>
        ) => {
          return TokenBalance.fromID(r, 'NOTE', Network.All);
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
      (results: Record<string, unknown>) => {
        const currentNOTE = results[`${notional.address}.NOTE`] as TokenBalance;
        const notePlus100s = results[
          `${notional.address}.NOTE_plus100`
        ] as TokenBalance;
        const noteClaim = currentNOTE.isPositive()
          ? {
              currentNOTE,
              noteAccruedPerSecond: notePlus100s.sub(currentNOTE).scale(1, 100),
            }
          : undefined;

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
              k.includes('balance') || k.includes('account')
                ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  ((results[k] as any)['balances'] as TokenBalance[])
                : []
            ),
            accountIncentiveDebt: Object.keys(results).flatMap(
              (k) =>
                (k.includes('account')
                  ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (results[k] as any)['accountIncentiveDebt']
                  : []) as AccountIncentiveDebt[]
            ),
            vaultLastUpdateTime: Object.keys(results).reduce(
              (agg, k) =>
                Object.assign(
                  agg,
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  ((results[k] as any)['vaultLastUpdateTime'] as Record<
                    string,
                    number
                  >) || {}
                ),
              {} as Record<string, number>
            ),
            allowances: Object.keys(results)
              .filter((k) => k.includes('.allowance'))
              .map((k) => {
                return {
                  spender: notional.address,
                  amount: results[k] as TokenBalance,
                };
              }),
            noteClaim,
          },
        };
      },
    ]);
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
                return this._parseTransactionHistory(
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
                  ...this._parseCurrentBalanceStatement(
                    current as BalanceSnapshot,
                    token as Token,
                    network
                  ),
                  historicalSnapshots:
                    snapshots?.map((s) =>
                      this._parseBalanceStatement(
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
                this._parseCurrentBalanceStatement(
                  b.current as BalanceSnapshot,
                  b.token as Token,
                  network
                )
              ),
            accountHistory:
              a.profitLossLineItems?.map((p) =>
                this._parseTransactionHistory(p as ProfitLossLineItem, network)
              ) || [],
          } as AccountDefinition;

          return Object.assign(o, { [a.id]: acct });
        }, {} as Record<string, AccountDefinition>);
      },
      { skip: 0 },
      'accounts'
    );

    // NOTE claims are turned off while not running the contest
    // const provider = getProviderFromNetwork(network, !USE_CROSS_FETCH);
    // const nowSeconds = getNowSeconds();
    // const notional = new Contract(
    //   NotionalAddress[network],
    //   NotionalV3ABI,
    //   provider
    // ) as NotionalV3;

    // const { results: noteClaims } = await aggregate<TokenBalance>(
    //   accounts.values.map(([a]) => {
    //     return {
    //       target: notional,
    //       method: 'nTokenGetClaimableIncentives',
    //       args: [a, nowSeconds + 100],
    //       key: a,
    //       transform: (
    //         r: Awaited<ReturnType<NotionalV3['nTokenGetClaimableIncentives']>>
    //       ) => {
    //         return TokenBalance.fromID(r, 'NOTE', Network.All);
    //       },
    //     };
    //   }),
    //   provider
    // );

    // Object.entries(noteClaims).forEach(([acct, currentNOTE]) => {
    //   const definition = accounts.values.find(([a]) => a === acct);
    //   if (definition && definition[1]) {
    //     definition[1].noteClaim = {
    //       currentNOTE,
    //       noteAccruedPerSecond: currentNOTE.copy(0),
    //     };
    //   }
    // });

    return accounts;
  }

  private _parseCurrentBalanceStatement(
    current: BalanceSnapshot,
    token: Token,
    network: Network
  ) {
    const tokens = Registry.getTokenRegistry();
    if (!token.underlying) throw Error('Unknown underlying');
    const tokenId = token.id;
    const underlying = token.underlying;
    const currentStatement = this._parseBalanceStatement(
      tokenId,
      underlying.id,
      current as BalanceSnapshot,
      network
    );
    const NOTE = Registry.getTokenRegistry().getTokenBySymbol(network, 'NOTE');

    const currentProfitAndLoss = currentStatement.balance
      .toUnderlying()
      .sub(
        currentStatement.adjustedCostBasis.scale(
          currentStatement.balance.n,
          INTERNAL_TOKEN_PRECISION
        )
      );
    const totalInterestAccrual = currentProfitAndLoss.sub(
      currentStatement.totalILAndFees
    );
    const adjustedNOTEClaimed = TokenBalance.from(
      current.adjustedNOTEClaimed,
      NOTE
    );
    const totalNOTEClaimed = TokenBalance.from(current.totalNOTEClaimed, NOTE);

    return {
      token: tokens.getTokenByID(network, tokenId),
      blockNumber: current.blockNumber,
      underlying: tokens.getTokenByID(network, underlying.id),
      currentBalance: currentStatement.balance,
      adjustedCostBasis: currentStatement.adjustedCostBasis,
      totalILAndFees: currentStatement.totalILAndFees,
      impliedFixedRate: currentStatement.impliedFixedRate,
      totalProfitAndLoss: currentProfitAndLoss,
      totalInterestAccrual,
      accumulatedCostRealized: currentStatement.accumulatedCostRealized,
      adjustedNOTEClaimed,
      totalNOTEClaimed,
    };
  }

  private _parseBalanceStatement(
    tokenId: string,
    underlyingId: string,
    snapshot: BalanceSnapshot,
    network: Network
  ) {
    const balance = TokenBalance.fromID(
      snapshot.currentBalance,
      tokenId,
      network
    );

    const adjustedCostBasis = TokenBalance.fromID(
      snapshot.adjustedCostBasis,
      underlyingId,
      network
    );
    const accumulatedCostRealized = adjustedCostBasis.scale(
      balance,
      balance.precision
    );
    return {
      balance,
      adjustedCostBasis,
      timestamp: snapshot.timestamp,
      accumulatedCostRealized,
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
        ? (snapshot.impliedFixedRate * 100) / RATE_PRECISION
        : undefined,
    };
  }

  private _parseTransactionHistory(p: ProfitLossLineItem, network: Network) {
    const tokenId = p.token.id;
    const underlyingId = p.underlyingToken.id;
    const token = Registry.getTokenRegistry().getTokenByID(network, tokenId);
    const vaultName =
      !!token.vaultAddress && token.vaultAddress !== ZERO_ADDRESS
        ? Registry.getConfigurationRegistry().getVaultName(
            token.network,
            token.vaultAddress
          )
        : undefined;

    let tokenAmount = TokenBalance.fromID(p.tokenAmount, tokenId, network);
    let underlyingAmountRealized = TokenBalance.fromID(
      p.underlyingAmountRealized,
      underlyingId,
      network
    );
    let underlyingAmountSpot = TokenBalance.fromID(
      p.underlyingAmountSpot,
      underlyingId,
      network
    );

    if (tokenAmount.tokenType === 'PrimeDebt') {
      tokenAmount = tokenAmount.neg();
      underlyingAmountRealized = underlyingAmountRealized.neg();
      underlyingAmountSpot = underlyingAmountSpot.neg();
    } else if (tokenAmount.tokenType === 'fCash' && token.isFCashDebt) {
      underlyingAmountRealized = underlyingAmountRealized.neg();
      underlyingAmountSpot = underlyingAmountSpot.neg();
    }

    return {
      timestamp: p.timestamp,
      blockNumber: p.blockNumber,
      token,
      vaultName,
      underlying: Registry.getTokenRegistry().getTokenByID(
        network,
        underlyingId
      ),
      bundleName: p.bundle?.bundleName,
      transactionHash: p.transactionHash.id,
      tokenAmount,
      underlyingAmountRealized,
      underlyingAmountSpot,
      realizedPrice: TokenBalance.fromID(
        p.realizedPrice,
        underlyingId,
        network
      ),
      spotPrice: TokenBalance.fromID(p.spotPrice, underlyingId, network),
      impliedFixedRate: p.impliedFixedRate
        ? (p.impliedFixedRate * 100) / RATE_PRECISION
        : undefined,
      isTransientLineItem: p.isTransientLineItem,
    };
  }
}
