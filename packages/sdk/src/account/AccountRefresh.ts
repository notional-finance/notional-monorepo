import { ethers } from 'ethers';
import { Notional as NotionalTypechain } from '@notional-finance/contracts';
import AccountData from './AccountData';
import GraphClient from '../data/GraphClient';
import AccountGraphLoader from './AccountGraphLoader';

/**
 * Manages refresh intervals for an Account. An Account has two sets of data, one is the
 * Notional related balances and the other is a set of balances in it's Wallet
 */
export default abstract class AccountRefresh {
  private _lastUpdateTime: Date = new Date(0);

  private _accountData?: AccountData;

  get lastUpdateTime() {
    return this._lastUpdateTime;
  }

  get accountData() {
    return this._accountData;
  }

  constructor(
    public address: string,
    protected provider: ethers.providers.JsonRpcBatchProvider,
    protected notionalProxy: NotionalTypechain,
    protected graphClient: GraphClient
  ) {}

  public async refreshAccountData() {
    try {
      const vaultAccounts = await AccountGraphLoader.loadVaultAccounts(
        this.graphClient,
        this.address
      );
      const data = await this.notionalProxy
        .getAccount(this.address)
        .then((r) => AccountData.loadFromBlockchain(r, vaultAccounts));
      await data.fetchHistory(this.address);
      this._accountData = data;
      this._lastUpdateTime = new Date();
    } catch (e) {
      throw new Error(`Failed to refresh account data for ${this.address}`);
    }
  }
}
