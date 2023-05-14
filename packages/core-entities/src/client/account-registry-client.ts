import {
  ERC20ABI,
  NotionalV3,
  NotionalV3ABI,
} from '@notional-finance/contracts';
import { AggregateCall } from '@notional-finance/multicall';
import {
  getProviderFromNetwork,
  Network,
  NotionalAddress,
  unique,
} from '@notional-finance/util';
import { BigNumber, Contract } from 'ethers';
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
      this._refresh(network);
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

    const [_, cachedAccount] = (await super._refresh(network)).values.find(
      ([acct, _]) => acct === activeAccount
    ) || [undefined, null];

    const tokens = Registry.getTokenRegistry();
    const walletTokensToTrack = tokens
      .getAllTokens(network)
      .filter((t) => t.currencyId !== undefined && t.tokenType === 'Underlying')
      .map((t) => t.address);

    const calls: AggregateCall[] = walletTokensToTrack.flatMap((address) => {
      const def = tokens.getTokenByAddress(network, address);
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
    });

    const vaultCalls = (
      unique(
        cachedAccount?.balances
          .filter((v) => v.token.vaultAddress !== undefined)
          .map((v) => v.token.vaultAddress) || []
      ) as string[]
    ).flatMap((v) => {
      return [
        {
          stage: 0,
          target: notional,
          method: 'getVaultAccountWithFeeAccrual',
          args: [this.activeAccount, v],
          key: `${v}.vaultAccount`,
          // todo: do some transforms in here
        },
        {
          stage: 0,
          target: notional,
          method: 'getVaultAccountSecondaryDebt',
          args: [this.activeAccount, v],
          key: `${v}.vaultSecondaryBorrow`,
          // todo: do some transforms in here
        },
      ];
    });

    calls.push(...vaultCalls);
    calls.push({
      target: notional,
      method: 'getAccount',
      args: [this.activeAccount],
      key: 'account',
      // todo: do some transforms in here
    });

    return fetchUsingMulticall<AccountDefinition>(network, calls, (results) => {
      // todo: final transforms here...
      return results;
    });
  }
}
