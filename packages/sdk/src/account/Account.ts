import { BigNumber, ethers, Overrides, Signer } from 'ethers';
import { System } from '../system';
import {
  Notional as NotionalTypechain,
  ERC20,
} from '@notional-finance/contracts';
import AccountRefresh from './AccountRefresh';
import TypedBigNumber, { BigNumberType } from '../libs/TypedBigNumber';
import { getNowSeconds } from '../libs/utils';
import AccountGraphLoader from './AccountGraphLoader';
import NOTESummary from './NOTESummary';
import GraphClient from '../data/GraphClient';

export default class Account extends AccountRefresh {
  private constructor(
    address: string,
    provider: ethers.providers.JsonRpcBatchProvider,
    notionalProxy: NotionalTypechain,
    graphClient: GraphClient,
    public signer?: Signer
  ) {
    super(address, provider, notionalProxy, graphClient);
  }

  /**
   * Loads an account object
   *
   * @param _signer
   * @param provider
   * @param system
   * @returns
   */
  public static async load(
    _signer: string | Signer,
    provider: ethers.providers.JsonRpcBatchProvider,
    graphClient: GraphClient,
    system: System
  ) {
    let address: string;
    let notionalProxy = system.getNotionalProxy();
    let signer: Signer | undefined;

    if (typeof _signer === 'string') {
      address = _signer;
    } else {
      try {
        address = await _signer.getAddress();
      } catch {
        address = ethers.constants.AddressZero;
      }
      notionalProxy = notionalProxy.connect(_signer);
      signer = _signer;
    }

    const account = new Account(
      address,
      provider,
      notionalProxy,
      graphClient,
      signer
    );
    await account.refreshAccountData();

    return account;
  }

  /**
   * Returns a summary of an account's balances with historical transactions and internal return rate
   */
  public async getBalanceSummary() {
    const [{ balanceSummary }, noteSummary] = await Promise.all([
      AccountGraphLoader.getBalanceSummary(this.address, this.accountData),
      NOTESummary.build(this),
    ]);

    return { balanceSummary, noteSummary };
  }

  /**
   * Returns the tradeHistory and assetSummary for an account
   */
  public async getAssetSummary() {
    if (!this.accountData) {
      return {
        assetSummary: [],
        tradeHistory: [],
      };
    }

    return AccountGraphLoader.getAssetSummary(this.address, this.accountData);
  }

  /**
   * Returns the amount of deposit required and the amount of cash balance that will be applied
   * to a given trade.
   *
   * @param symbol
   * @param netCashRequiredInternal
   * @returns
   */
  public getNetCashAmount(
    symbol: string,
    netCashRequiredInternal: TypedBigNumber
  ) {
    const currency = System.getSystem().getCurrencyBySymbol(symbol);
    const isUnderlying = currency.underlyingSymbol === symbol;
    const cashBalance =
      this.accountData?.cashBalance(currency.id) ||
      TypedBigNumber.from(0, BigNumberType.InternalAsset, currency.assetSymbol);
    const assetCashRequired = netCashRequiredInternal.toAssetCash(true);

    if (netCashRequiredInternal.isNegative())
      throw new Error('Net cash required must be positive');

    if (assetCashRequired.gt(cashBalance)) {
      const depositAmount = assetCashRequired.sub(cashBalance);

      return {
        // External amounts
        depositAmount: isUnderlying
          ? depositAmount.toUnderlying(false)
          : depositAmount.toAssetCash(false),
        cashBalanceApplied: cashBalance,
      };
    }
    return {
      depositAmount: TypedBigNumber.from(
        0,
        isUnderlying
          ? BigNumberType.ExternalUnderlying
          : BigNumberType.ExternalAsset,
        symbol
      ),
      cashBalanceApplied: netCashRequiredInternal,
    };
  }

  /**
   * Checks if the account has sufficient allowance for the deposit amount
   *
   * @param symbol
   * @param depositAmount
   * @returns
   */
  public async hasAllowanceAsync(
    symbol: string,
    depositAmount: TypedBigNumber
  ) {
    const token = System.getSystem().getTokenBySymbol(symbol);
    const allowance = await this.getAllowance(symbol, token);
    return allowance.gte(depositAmount);
  }

  /**
   * Returns the transfer allowance for a given currency symbol
   * @returns BigNumber
   */
  private async getAllowance(
    symbol: string,
    token: ERC20,
    spender: string = this.notionalProxy.address
  ) {
    if (symbol === 'ETH') {
      return TypedBigNumber.from(
        ethers.constants.MaxUint256,
        BigNumberType.ExternalUnderlying,
        'ETH'
      );
    }

    const allowance = await token.allowance(this.address, spender);
    return TypedBigNumber.fromBalance(allowance, symbol, false);
  }

  /**
   * Sends a populated transaction
   *
   * @param txn a populated transaction
   * @returns a pending transaction object
   */
  public async sendTransaction(txn: ethers.PopulatedTransaction) {
    // eslint-disable-next-line no-param-reassign
    txn.from = this.address;
    if (!this.signer) throw Error('No signer on account');
    return this.signer.sendTransaction(txn);
  }

  /**
   * Sets the ERC20 token allowance on the given symbol
   *
   * @param symbol
   * @param amount
   * @param overrides
   * @returns
   */
  public async setAllowance(
    symbol: string,
    amount: BigNumber,
    spender: string = this.notionalProxy.address,
    overrides = {} as Overrides
  ) {
    if (symbol === 'ETH') throw Error('Cannot set allowance on ETH');

    const token = System.getSystem().getTokenBySymbol(symbol);
    const allowance = await this.getAllowance(symbol, token);
    if (!allowance.isZero() && !amount.isZero()) {
      throw new Error(
        `Resetting allowance from ${allowance.toString()}, first set allowance to zero`
      );
    }

    return token.populateTransaction.approve(spender, amount, overrides);
  }

  public async fetchClaimableIncentives(
    account: string,
    blockTime = getNowSeconds()
  ) {
    return this.notionalProxy
      .connect(account)
      .nTokenGetClaimableIncentives(account, blockTime);
  }
}
