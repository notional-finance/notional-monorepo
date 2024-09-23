import {
  BASIS_POINT,
  RATE_PRECISION,
  Network,
  getNowSeconds,
  PRIME_CASH_VAULT_MATURITY,
  INTERNAL_TOKEN_DECIMALS,
  encodeERC1155Id,
  AssetType,
  SECONDS_IN_DAY,
} from '@notional-finance/util';
import { BaseVaultParams, VaultAdapter } from './VaultAdapter';
import { BaseLiquidityPool } from '../exchanges';
import { TokenBalance } from '../token-balance';
import { defaultAbiCoder } from 'ethers/lib/utils';
import { BigNumber } from 'ethers';
import { TokenDefinition } from '../Definitions';
import { PointsMultipliers } from '../config/whitelisted-vaults';
import { TimeSeriesResponse } from '../models/ModelTypes';

export interface SingleSidedLPParams extends BaseVaultParams {
  pool: string;
  singleSidedTokenIndex: number;
  totalLPTokens: TokenBalance;
  totalVaultShares: BigNumber;
  secondaryTradeParams: string;
  maxPoolShares: BigNumber;
  totalPoolSupply?: TokenBalance;
}

export interface TradeParams {
  // TODO: make an enum
  dexId: number;
  // TODO: make an enum
  tradeType: number;
  oracleSlippagePercentOrLimit: number;
  exchangeData: string;
}

export interface DepositTradeParams {
  tradeAmount: TokenBalance;
  tradeParams: TradeParams;
}

export interface RedeemParams {
  minAmounts: TokenBalance[];
  redemptionTrades: TradeParams[];
}

/// @notice Deposit parameters
export interface DepositParams {
  minPoolClaim: TokenBalance;
  depositTrades: DepositTradeParams[];
}

export class SingleSidedLP extends VaultAdapter {
  POOL_CAPACITY_PRECISION = 10_000;

  // We should make a method that just returns all of these...
  public pool: BaseLiquidityPool<unknown>; // hardcoded probably?
  public singleSidedTokenIndex: number;
  public totalLPTokens: TokenBalance;
  // This does not have a token balance because maturity is unset
  public totalVaultShares: BigNumber;
  public secondaryTradeParams: string;
  public maxPoolShares: BigNumber;
  public totalPoolSupply: TokenBalance | undefined;

  get strategy() {
    return 'SingleSidedLP';
  }

  get bptIndex() {
    return (
      (this.pool.poolParams as Record<string, unknown>)['bptIndex'] as
        | BigNumber
        | undefined
    )?.toNumber();
  }

  constructor(
    network: Network,
    vaultAddress: string,
    p: SingleSidedLPParams,
    _pool: BaseLiquidityPool<unknown>,
    public currencyId: number,
    public apyHistory?: TimeSeriesResponse
  ) {
    super(p.enabled, p.name, network, vaultAddress);

    this.pool = _pool;

    // NOTE: make a correction for BPT index to exclude it from ComposableStablePools
    const bptIndex = this.bptIndex;
    if (bptIndex !== undefined) {
      this.singleSidedTokenIndex =
        p.singleSidedTokenIndex < bptIndex
          ? p.singleSidedTokenIndex
          : p.singleSidedTokenIndex - 1;
    } else {
      this.singleSidedTokenIndex = p.singleSidedTokenIndex;
    }

    this.totalLPTokens = p.totalLPTokens;
    this.totalVaultShares = p.totalVaultShares;
    this.secondaryTradeParams = p.secondaryTradeParams;
    this.maxPoolShares = p.maxPoolShares;
    this.totalPoolSupply = p.totalPoolSupply;
  }

  get hashKey() {
    return [
      this.pool.hashKey,
      this.totalLPTokens.hashKey,
      this.totalVaultShares.toHexString(),
      this.singleSidedTokenIndex.toString(),
    ].join(':');
  }

  public getRemainingPoolCapacity() {
    if (this.totalPoolSupply) {
      const vaultShare = Registry.getTokenRegistry().getVaultShare(
        this.network,
        this.vaultAddress,
        PRIME_CASH_VAULT_MATURITY
      );
      const maxLPTokens = this.totalPoolSupply.scale(
        this.maxPoolShares,
        this.POOL_CAPACITY_PRECISION
      );
      const remainingLPTokens = maxLPTokens.sub(this.totalLPTokens);

      // Convert to vault shares in order to get the underlying value
      return this.getLPTokensToVaultShares(
        remainingLPTokens,
        vaultShare
      ).toUnderlying();
    }

    return undefined;
  }

  public isOverMaxPoolShare(vaultShares?: TokenBalance) {
    const additionalLPTokens = vaultShares
      ? this.getVaultSharesToLPTokens(vaultShares)
      : TokenBalance.zero(this.totalLPTokens.token);

    const poolShare = this.totalPoolSupply
      ? this.totalLPTokens
          .add(additionalLPTokens)
          .ratioWith(this.totalPoolSupply)
          .toNumber()
      : 0;
    return (
      poolShare >
      (this.maxPoolShares.toNumber() * RATE_PRECISION) /
        this.POOL_CAPACITY_PRECISION
    );
  }

  private getVaultSharesToLPTokens(vaultShares: TokenBalance) {
    if (this.totalVaultShares.isZero()) {
      return TokenBalance.fromFloat(
        vaultShares.toFloat(),
        this.totalLPTokens.token
      );
    } else {
      return this.totalLPTokens.scale(vaultShares.n, this.totalVaultShares);
    }
  }

  private getLPTokensToVaultShares(
    lpTokens: TokenBalance,
    vaultShare: TokenDefinition
  ) {
    if (this.totalLPTokens.isZero())
      return TokenBalance.from(lpTokens.scaleTo(8), vaultShare);

    return TokenBalance.from(
      this.totalVaultShares.mul(lpTokens.n).div(this.totalLPTokens.n),
      vaultShare
    );
  }

  convertToPrimeVaultShares(vaultShares: TokenBalance) {
    // Prime vault shares convert 1-1
    const primeVaultShareId = encodeERC1155Id(
      this.currencyId,
      PRIME_CASH_VAULT_MATURITY,
      AssetType.VAULT_SHARE_ASSET_TYPE,
      false,
      this.vaultAddress
    );
    return new TokenBalance(vaultShares.n, primeVaultShareId, this.network);
  }

  getVaultTVL() {
    const primeVaultShareId = encodeERC1155Id(
      this.currencyId,
      PRIME_CASH_VAULT_MATURITY,
      AssetType.VAULT_SHARE_ASSET_TYPE,
      false,
      this.vaultAddress
    );
    return new TokenBalance(
      this.totalVaultShares,
      primeVaultShareId,
      this.network
    ).toUnderlying();
  }

  getVaultAPY() {
    const vaultAPYs =
      this.apyHistory?.data
        ?.filter(
          ({ timestamp }) => timestamp > getNowSeconds() - 7 * SECONDS_IN_DAY
        )
        .map(({ totalAPY }) => totalAPY)
        .filter((apy) => apy !== null) || [];

    return vaultAPYs.length > 0
      ? vaultAPYs.reduce((t, a) => t + a, 0) / vaultAPYs.length
      : 0;
  }

  getInitialVaultShareValuation(_maturity: number) {
    return {
      rate: this.pool.getLPTokenSpotValue(this.singleSidedTokenIndex).n,
      timestamp: getNowSeconds(),
      blockNumber: 0,
    };
  }

  getNetVaultSharesMinted(
    netUnderlying: TokenBalance,
    vaultShare: TokenDefinition
  ): {
    netVaultSharesForUnderlying: TokenBalance;
    feesPaid: TokenBalance;
  } {
    if (netUnderlying.isPositive()) {
      const tokensIn = this.pool.zeroTokenArray();
      tokensIn[this.singleSidedTokenIndex] = netUnderlying;
      const { lpTokens, feesPaid } = this.pool.getLPTokensGivenTokens(tokensIn);

      return {
        feesPaid: this._sumFeesPaid(feesPaid),
        netVaultSharesForUnderlying: this.getLPTokensToVaultShares(
          lpTokens,
          vaultShare
        ),
      };
    } else {
      const tokensOut = this.pool.zeroTokenArray();
      tokensOut[this.singleSidedTokenIndex] = netUnderlying.neg();
      const { lpTokens, feesPaid } =
        this.pool.getLPTokensRequiredForTokens(tokensOut);

      return {
        feesPaid: this._sumFeesPaid(feesPaid),
        netVaultSharesForUnderlying: this.getLPTokensToVaultShares(
          lpTokens,
          vaultShare
        ).neg(),
      };
    }
  }

  getNetVaultSharesCost(netVaultShares: TokenBalance): {
    netUnderlyingForVaultShares: TokenBalance;
    feesPaid: TokenBalance;
  } {
    if (netVaultShares.isPositive()) {
      const { tokensIn, feesPaid } = this.pool.getTokensRequiredForLPTokens(
        this.getVaultSharesToLPTokens(netVaultShares),
        this.singleSidedTokenIndex
      );

      return {
        netUnderlyingForVaultShares: tokensIn[this.singleSidedTokenIndex],
        feesPaid: this._sumFeesPaid(feesPaid),
      };
    } else {
      const { tokensOut, feesPaid } = this.pool.getTokensOutGivenLPTokens(
        this.getVaultSharesToLPTokens(netVaultShares.neg()),
        this.singleSidedTokenIndex
      );

      return {
        netUnderlyingForVaultShares: tokensOut[this.singleSidedTokenIndex],
        feesPaid: this._sumFeesPaid(feesPaid),
      };
    }
  }

  private _sumFeesPaid(feesPaid: TokenBalance[]) {
    const primaryToken = feesPaid[this.singleSidedTokenIndex].token;
    return feesPaid.reduce(
      (s, f) => s.add(f.toToken(primaryToken)),
      TokenBalance.zero(primaryToken)
    );
  }

  getDepositParameters(
    _account: string,
    _maturity: number,
    totalDeposit: TokenBalance,
    slippageFactor = 5 * BASIS_POINT
  ) {
    const tokensIn = this.pool.zeroTokenArray();
    tokensIn[this.singleSidedTokenIndex] = totalDeposit;
    const { lpTokens } = this.pool.getLPTokensGivenTokens(tokensIn);
    const minLPTokens = lpTokens.mulInRatePrecision(
      RATE_PRECISION - slippageFactor
    );

    return defaultAbiCoder.encode(
      ['tuple(uint256 minPoolClaim, bytes tradeData) d'],
      [
        {
          // Floor min lp tokens at zero
          minPoolClaim:
            minLPTokens.toFloat() > 0.0001 ? minLPTokens.n : BigNumber.from(0),
          // Deposit trades are not implemented
          tradeData: '0x',
        },
      ]
    );
  }

  getRedeemParameters(
    _account: string,
    _maturity: number,
    vaultSharesToRedeem: TokenBalance,
    _underlyingToRepayDebt: TokenBalance,
    slippageFactor = 5 * BASIS_POINT
  ) {
    // Since this is single sided then everything is back to one side.
    const { tokensOut } = this.pool.getTokensOutGivenLPTokens(
      this.getVaultSharesToLPTokens(vaultSharesToRedeem),
      this.singleSidedTokenIndex
    );

    const minAmounts = tokensOut.map(
      (t) => t.mulInRatePrecision(RATE_PRECISION - slippageFactor).n
    );

    if (this.bptIndex !== undefined) {
      // Insert a zero for the bpt index
      minAmounts.splice(this.bptIndex, 0, BigNumber.from(0));
    }

    return defaultAbiCoder.encode(
      ['tuple(uint256[] minAmounts, bytes secondaryTradeParams) r'],
      [
        {
          minAmounts,
          secondaryTradeParams: '0x',
        },
      ]
    );
  }

  /** Returns the percentage of the pool that the given token index has */
  getTokenPoolShare(tokenIndex: number) {
    const balance = this.pool.balances[tokenIndex];
    const tvl = this.pool.totalValueLocked(tokenIndex);
    return balance.ratioWith(tvl).toNumber() / RATE_PRECISION;
  }

  getPointMultiples() {
    const pointsFunc = PointsMultipliers[this.network][this.vaultAddress];
    if (pointsFunc) return pointsFunc(this);

    return undefined;
  }

  getPriceExposure() {
    // TODO: this only works on two token pools
    return (
      this.pool
        // This is trading towards the single sided token [profit]
        .getPriceExposureTable(
          1 - this.singleSidedTokenIndex,
          this.singleSidedTokenIndex
        )
        .map(({ tokenOutPrice, lpTokenValueOut }) => ({
          price: tokenOutPrice,
          vaultSharePrice: lpTokenValueOut.scale(
            this.totalLPTokens.scaleTo(INTERNAL_TOKEN_DECIMALS),
            this.totalVaultShares
          ),
        }))
        .reverse()
        // This is trading away from the single sided token [loss]
        .concat(
          this.pool
            .getPriceExposureTable(
              this.singleSidedTokenIndex,
              1 - this.singleSidedTokenIndex
            )
            .map(({ tokenInPrice, lpTokenValueIn }) => ({
              price: tokenInPrice,
              vaultSharePrice: lpTokenValueIn.scale(
                this.totalLPTokens.scaleTo(INTERNAL_TOKEN_DECIMALS),
                this.totalVaultShares
              ),
            }))
        )
    );
  }
}
