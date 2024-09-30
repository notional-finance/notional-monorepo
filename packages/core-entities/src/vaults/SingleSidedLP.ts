import {
  BASIS_POINT,
  RATE_PRECISION,
  Network,
  getNowSeconds,
  PRIME_CASH_VAULT_MATURITY,
  INTERNAL_TOKEN_DECIMALS,
  SECONDS_IN_DAY,
} from '@notional-finance/util';
import { BaseVaultParams, VaultAdapter } from './VaultAdapter';
import { BaseLiquidityPool } from '../exchanges';
import { TokenBalance } from '../token-balance';
import { defaultAbiCoder } from 'ethers/lib/utils';
import { Registry } from '../Registry';
import { BigNumber } from 'ethers';
import { TokenDefinition } from '../Definitions';
import { PointsMultipliers } from '../config/whitelisted-vaults';

export interface SingleSidedLPParams extends BaseVaultParams {
  pool: string;
  singleSidedTokenIndex: number;
  totalLPTokens: TokenBalance;
  totalVaultShares: BigNumber;
  secondaryTradeParams: string;
  maxPoolShares: BigNumber;
  totalPoolSupply?: TokenBalance;
  rewardState?: RewardState[];
}

interface RewardState {
  lastAccumulatedTime: number;
  endTime: number;
  rewardToken: string;
  emissionRatePerYear: BigNumber; // in internal precision
  accumulatedRewardPerVaultShare: BigNumber;
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
  public rewardState?: RewardState[];

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

  get rewardTokens() {
    return this.rewardState?.map((r) => r.rewardToken) || [];
  }

  constructor(network: Network, vaultAddress: string, p: SingleSidedLPParams) {
    super(p.enabled, p.name, network, vaultAddress);

    this.pool = Registry.getExchangeRegistry().getPoolInstance(network, p.pool);

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
    this.rewardState = p.rewardState;

    this._initOracles(network, vaultAddress.toLowerCase());
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

  public getPoolShare(vaultShares?: TokenBalance) {
    const additionalLPTokens = vaultShares
      ? this.getVaultSharesToLPTokens(vaultShares)
      : TokenBalance.zero(this.totalLPTokens.token);

    return this.totalPoolSupply
      ? this.totalLPTokens
          .add(additionalLPTokens)
          .ratioWith(this.totalPoolSupply)
          .toNumber()
      : 0;
  }

  public isOverMaxPoolShare(vaultShares?: TokenBalance) {
    const poolShare = this.getPoolShare(vaultShares);
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
    const token = Registry.getTokenRegistry().getVaultShare(
      vaultShares.network,
      vaultShares.vaultAddress,
      PRIME_CASH_VAULT_MATURITY
    );
    return TokenBalance.from(vaultShares.n, token);
  }

  override getVaultTVL() {
    const token = Registry.getTokenRegistry().getVaultShare(
      this.network,
      this.vaultAddress,
      PRIME_CASH_VAULT_MATURITY
    );
    return TokenBalance.from(this.totalVaultShares, token).toUnderlying();
  }

  getVaultAPY() {
    const analytics = Registry.getAnalyticsRegistry();
    if (
      this.vaultAddress.toLowerCase() ===
      '0x0e8c1a069f40d0e8fa861239d3e62003cbf3dcb2'
    ) {
      // Special handling for this vault which has manual incentives
      const vaultAPYWithoutArb = (analytics
        .getVault(this.network, this.vaultAddress)
        ?.filter(
          ({ timestamp }) => timestamp > getNowSeconds() - 7 * SECONDS_IN_DAY
        )
        .map((data) =>
          data['totalAPY'] && data.returnDrivers['ARB Incentive APY']
            ? data['totalAPY'] - data.returnDrivers['ARB Incentive APY']
            : data['totalAPY']
        )
        .filter((apy) => apy !== null) || []) as number[];

      const totalAPYWithoutArb =
        vaultAPYWithoutArb.length > 0
          ? vaultAPYWithoutArb.reduce((t, a) => t + a, 0) /
            vaultAPYWithoutArb.length
          : 0;

      const vaultTVL = this.getVaultTVL();
      const arbReinvestInPrimary = TokenBalance.fromFloat(
        466.4,
        Registry.getTokenRegistry().getTokenBySymbol(this.network, 'ARB')
      ).toToken(vaultTVL.token);
      const arbAPY =
        100 * 365 * (arbReinvestInPrimary.toFloat() / vaultTVL.toFloat());

      return totalAPYWithoutArb + arbAPY;
    }

    const vaultAPYs = (analytics
      .getVault(this.network, this.vaultAddress)
      ?.filter(
        ({ timestamp }) => timestamp > getNowSeconds() - 7 * SECONDS_IN_DAY
      )
      .map(({ totalAPY }) => totalAPY)
      .filter((apy) => apy !== null) || []) as number[];

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

  override async getDepositParameters(
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

  override async getRedeemParameters(
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

  override getPointMultiples() {
    const pointsFunc = PointsMultipliers[this.network][this.vaultAddress];
    if (pointsFunc) return pointsFunc(this);

    return undefined;
  }
}
