import {
  ERC20ABI,
  NotionalV3,
  NotionalV3ABI,
} from '@notional-finance/contracts';
import { AggregateCall, NO_OP } from '@notional-finance/multicall';
import {
  encodefCashId,
  getProviderFromNetwork,
  MAX_APPROVAL,
  Network,
  NotionalAddress,
  PRIME_CASH_VAULT_MATURITY,
  ZERO_ADDRESS,
} from '@notional-finance/util';
import { BigNumber, Contract } from 'ethers';
import { take } from 'rxjs';
import { AccountDefinition, CacheSchema, Registry, TokenBalance } from '..';
import { Routes } from '../server';
import { fetchUsingMulticall } from '../server/server-registry';
import { ClientRegistry } from './client-registry';

export enum AccountFetchMode {
  // Used for the frontend UI, will fetch data for a single account direct from
  // a blockchain provider.
  SINGLE_ACCOUNT_DIRECT,
  // Used for bots or analytical systems, fetches batches of accounts via the
  // server, optionally filtered by some requirement
  BATCH_ACCOUNT_VIA_SERVER,
}

export class AccountRegistryClient extends ClientRegistry<AccountDefinition> {
  protected _activeAccount: string | undefined;

  constructor(cacheHostname: string, public fetchMode: AccountFetchMode) {
    super(cacheHostname);
  }

  protected get cachePath() {
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
    return this._activeAccount;
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
    if (
      this.fetchMode === AccountFetchMode.SINGLE_ACCOUNT_DIRECT &&
      account !== this.activeAccount
    )
      throw Error('Can only fetch active account');

    return this.subscribeSubject(network, account);
  }

  /** Triggers a manual refresh of the active account and provides an optional callback on refresh complete */
  public refreshActiveAccount(
    network: Network,
    onRefresh?: (a: AccountDefinition | null) => void
  ) {
    if (this.activeAccount === undefined) throw Error('No active account');

    if (onRefresh) {
      this.subscribeAccount(network, this.activeAccount)
        ?.pipe(take(1))
        .subscribe(onRefresh);
    }

    this._triggerRefresh(network, 0);
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
      this._activeAccount !== account
    ) {
      // NOTE: deletes the previously active account from the network subjects
      // registry, this does not emit an event currently
      if (this._activeAccount)
        this.networkSubjects.get(network)?.delete(this._activeAccount);

      this._activeAccount = account;

      // Kick off a refresh of the accounts if in single account mode and we are
      // changing the account
      this._triggerRefresh(network, 0);
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

    if (this.activeAccount === undefined) {
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
            // {
            //   stage: 0,
            //   target: new VoidSigner(address, provider),
            //   method: 'balance',
            //   args: [],
            //   key: `${address}.balance`,
            //   transform: (b: BigNumber) => {
            //     return TokenBalance.from(b, def);
            //   },
            // },
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
            key: `${v}.balance`,
            transform: (
              r: Awaited<
                ReturnType<NotionalV3['getVaultAccountWithFeeAccrual']>
              >
            ) => {
              const maturity = r[0].maturity.toNumber();
              if (maturity === 0) return [];
              const {
                vaultShareID,
                primaryDebtID,
                primaryCashID,
                primaryTokenId,
              } = config.getVaultIDs(network, v.vaultAddress, maturity);
              const balances = [
                TokenBalance.fromID(r[0].vaultShares, vaultShareID, network),
                this._parseVaultDebtBalance(
                  primaryDebtID,
                  primaryTokenId,
                  r[0].accountDebtUnderlying,
                  maturity,
                  network
                ),
              ];

              if (!r[0].tempCashBalance.isZero()) {
                balances.push(
                  TokenBalance.fromID(
                    r[0].tempCashBalance,
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
            key: `${v}.balance2`,
            transform: (
              r: Awaited<ReturnType<NotionalV3['getVaultAccountSecondaryDebt']>>
            ) => {
              const maturity = r.maturity.toNumber();
              if (maturity === 0) return [];
              const {
                secondaryOneCashID,
                secondaryOneDebtID,
                secondaryOneTokenId,
                secondaryTwoCashID,
                secondaryTwoDebtID,
                secondaryTwoTokenId,
              } = config.getVaultIDs(network, v.vaultAddress, maturity);

              const secondaries = [];

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
        key: `${notional.address}.balance`,
        transform: (r: Awaited<ReturnType<NotionalV3['getAccount']>>) => {
          const accountBalances = r.accountBalances.flatMap((b) => {
            const balances = [];
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

          return accountBalances.concat(portfolioBalances);
        },
      },
    ];

    // TODO: still need to fetch transactions
    return fetchUsingMulticall<AccountDefinition>(network, calls, [
      (results: Record<string, TokenBalance | TokenBalance[]>) => {
        return {
          [activeAccount]: {
            address: activeAccount,
            network,
            balances: Object.keys(results)
              .filter((k) => k.includes('.balance'))
              .flatMap((k) => results[k]),
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
      return TokenBalance.fromID(balance, underlyingID, network).toToken(
        tokens.getTokenByID(network, debtID)
      );
    }

    return TokenBalance.fromID(balance, debtID, network);
  }
}
