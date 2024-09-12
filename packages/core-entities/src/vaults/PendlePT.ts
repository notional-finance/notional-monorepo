import { Network, PRIME_CASH_VAULT_MATURITY } from '@notional-finance/util';
import { BaseVaultParams, VaultAdapter } from './VaultAdapter';
import { TokenBalance } from '../token-balance';
import { Registry } from '../Registry';
import { BigNumber, BytesLike } from 'ethers';
import { PendleMarket } from '../exchanges';

export interface PendlePTVaultParams extends BaseVaultParams {
  ptTokenAddress: string;
  currentPTPrice: TokenBalance;
  ptTokenExpiry: number;
  totalPTTokens: BigNumber;
  tokenInSyAddress: string;
  tokenOutSyAddress: string;
}

/**
 * Primary TODOs:
 *  - fetch necessary data inside the vault registry server
 *  - integrate with the pendle api to get the slippage calculations
 *  - need to get the trade execution data from some sort of API
 *  - basically the challenge here is making these calculations async and
 *    taking a look at how we trade into the token in sy
 *  - second challenge will be to figure out the user's APY, which needs
 *    to be done based on their cost basis of their vault shares
 */
export class PendlePT extends VaultAdapter {
  protected apiUrl = 'https://api-v2.pendle.finance/sdk/v1';

  public totalPTTokens: BigNumber;
  protected market: PendleMarket;

  constructor(network: Network, vaultAddress: string, p: PendlePTVaultParams) {
    super(p.enabled, p.name, network, vaultAddress);
    this.totalPTTokens = p.totalPTTokens;
    this.market = Registry.getExchangeRegistry().getPoolInstance<PendleMarket>(
      network,
      p.ptTokenAddress
    );
  }

  getVaultAPY(factors?: {
    account: string;
    vaultShares: TokenBalance;
    maturity: number;
  }): number {
    if (factors) {
      // then need to get the price that they bought vault shares at
      // and then get the apy to maturity of that price.
      return 0;
    } else {
      // return the current pendle PT yield to maturity
      return 0;
    }
  }

  getVaultTVL(): TokenBalance {
    const token = Registry.getTokenRegistry().getVaultShare(
      this.network,
      this.vaultAddress,
      PRIME_CASH_VAULT_MATURITY
    );
    return TokenBalance.from(this.totalPTTokens, token).toUnderlying();
  }

  get strategy() {
    return 'PendlePT';
  }

  get hashKey() {
    return [
      this.vaultAddress,
      this.totalPTTokens.toHexString(),
      this.currentPTPrice.toHexString(),
    ].join(':');
  }

  getInitialVaultShareValuation(maturity: number): ExchangeRate {
    // return the current pt price, 1 vault share = 1 pt
  }

  convertToPrimeVaultShares(vaultShares: TokenBalance): TokenBalance {
    // Prime vault shares convert 1-1
    const token = Registry.getTokenRegistry().getVaultShare(
      vaultShares.network,
      vaultShares.vaultAddress,
      PRIME_CASH_VAULT_MATURITY
    );
    return TokenBalance.from(vaultShares.n, token);
  }

  getNetVaultSharesCost(netVaultShares: TokenBalance): {
    netUnderlyingForVaultShares: TokenBalance;
    feesPaid: TokenBalance;
  } {
    const trade = this.market.calculateTokenTrade(
      netVaultShares,
      this.market.TOKEN_IN_INDEX
    );
  }

  getNetVaultSharesMinted(
    netUnderlying: TokenBalance,
    vaultShare: TokenDefinition
  ): {
    netVaultSharesForUnderlying: TokenBalance;
    feesPaid: TokenBalance;
  } {
    return { netVaultSharesForUnderlying, feesPaid };
  }

  override async getDepositParameters(
    account: string,
    maturity: number,
    totalDeposit: TokenBalance,
    slippageFactor: number
  ): BytesLike {
    /**
     * struct PendleDepositParams {
     *    // for trade execution from borrowed token to token in sy
     *    uint16 dexId;
     *    uint256 minPurchaseAmount;
     *    bytes exchangeData;
     *    // slippage factor for PT token
     *    uint256 minPtOut;
     *    // approx params for PT trade execution, fetched via pendle API
     *    IPRouter.ApproxParams approxParams;
     *}
     */
  }

  override async getRedeemParameters(
    account: string,
    maturity: number,
    vaultSharesToRedeem: TokenBalance,
    underlyingToRepayDebt: TokenBalance
  ): Promise<BytesLike> {
    if (this.tokenOutSy !== this.borrowedToken) {
      return '0x';
    } else {
      // todo: need to configure the default market parameters
    }
    /**
     * Used for the exit trade after redemption
     * struct RedeemParams {
     *    uint8 dexId;
     *    uint256 minPurchaseAmount;
     *    bytes exchangeData;
     *}
     */
  }
}
