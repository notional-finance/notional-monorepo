import {
  BASIS_POINT,
  RATE_PRECISION,
  Network,
  getNowSeconds,
  SECONDS_IN_DAY,
  SCALAR_PRECISION,
} from '@notional-finance/util';
import { BaseVaultParams, VaultAdapter } from './VaultAdapter';
import { BaseLiquidityPool } from '../exchanges';
import { TokenBalance } from '../token-balance';
import { defaultAbiCoder, BytesLike, formatUnits } from 'ethers/lib/utils';
import { BigNumber } from 'ethers';
import { TokenDefinition, VaultTradeMetadata } from '../Definitions';
import {
  PointsMultipliers,
  VaultDefaultDexParameters,
} from '../config/whitelisted-vaults';
import { TimeSeriesResponse } from '../models/ModelTypes';
import { getNetworkModel } from '../Models';
import { APYData } from '../models/views/YieldViews';

export interface SingleSidedLPParams extends BaseVaultParams {
  pool: string;
  singleSidedTokenIndex: number;
  totalLPTokens: TokenBalance;
  totalVaultShares: BigNumber;
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
  dexId: number;
  tradeType: number;
  tradeAmount: TokenBalance;
  minPurchaseAmount: TokenBalance;
  exchangeData: string;
}

export interface RedeemParams {
  minAmounts: TokenBalance[];
  redemptionTrades: TradeParams[];
}

/// @notice Deposit parameters
export interface DepositParams {
  minPoolClaim: TokenBalance;
  depositTrades: TradeParams[];
}

const TRADE_PARAMS_TYPE = `tuple(uint256 tradeAmount, uint16 dexId, uint8 tradeType, uint256 minPurchaseAmount, bytes exchangeData)`;

export class SingleSidedLP extends VaultAdapter {
  // We should make a method that just returns all of these...
  public pool: BaseLiquidityPool<unknown>; // hardcoded probably?
  public singleSidedTokenIndex: number;
  public totalLPTokens: TokenBalance;
  // This does not have a token balance because maturity is unset
  public totalVaultShares: BigNumber;
  public maxPoolShares: BigNumber;
  public totalPoolSupply: TokenBalance | undefined;
  public rewardState?: RewardState[];

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

  getLiquidationPriceTokens() {
    return this.pool.balances
      .filter(
        (b) =>
          // Exclude the LP token and the borrowed token
          b.tokenId !== this.pool.oneLPToken().tokenId &&
          b.tokenId !== this.borrowedToken.id
      )
      .map((b) => b.token);
  }

  constructor(
    network: Network,
    vaultAddress: string,
    p: SingleSidedLPParams,
    _pool: BaseLiquidityPool<unknown>,
    borrowedToken: TokenDefinition,
    yieldToken: TokenDefinition,
    public apyHistory?: TimeSeriesResponse
  ) {
    super(
      p.enabled,
      p.strategyType,
      network,
      vaultAddress,
      borrowedToken,
      yieldToken
    );

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
    this.maxPoolShares = p.maxPoolShares;
    this.totalPoolSupply = p.totalPoolSupply;
    this.rewardState = p.rewardState;
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
      const vaultShare = getNetworkModel(this.network).getTokenByID(
        this.vaultAddress
      );
      const maxLPTokens = this.totalPoolSupply.scale(
        this.maxPoolShares,
        SCALAR_PRECISION
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
          .scale(SCALAR_PRECISION, this.totalPoolSupply)
          .scaleTo(18)
      : BigNumber.from(0);
  }

  public getMaxPoolShare() {
    return parseFloat(formatUnits(this.maxPoolShares, 18));
  }

  public isOverMaxPoolShare(vaultShares?: TokenBalance) {
    const poolShare = this.getPoolShare(vaultShares);
    return poolShare.gt(this.maxPoolShares);
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
      return TokenBalance.from(
        lpTokens.scaleTo(vaultShare.decimals),
        vaultShare
      );

    return TokenBalance.from(
      this.totalVaultShares.mul(lpTokens.n).div(this.totalLPTokens.n),
      vaultShare
    );
  }

  override getVaultTVL() {
    return new TokenBalance(
      this.totalVaultShares,
      this.vaultAddress,
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

  getRewardAPY(): {
    incentiveAPY: number;
    incentives: { symbol: string; incentiveAPY: number }[];
  } {
    const incentiveAverages = this.getIncentiveAPYRecord();

    // Calculate total incentive APY for backward compatibility
    const totalIncentiveAPY = Object.values(incentiveAverages).reduce(
      (sum, value) => sum + value,
      0
    );

    // Convert to the expected format
    const incentives = Object.entries(incentiveAverages).map(([key, value]) => {
      const symbol = key.split(' ')[0];
      return {
        symbol: symbol,
        incentiveAPY: value,
      };
    });

    return {
      incentiveAPY: totalIncentiveAPY,
      incentives,
    };
  }

  getIncentiveAPYRecord(): Record<string, number> {
    const last7Days = this.apyHistory?.data?.filter(
      ({ timestamp }) => timestamp > getNowSeconds() - 7 * SECONDS_IN_DAY
    );

    if (!last7Days || last7Days.length === 0) {
      return {};
    }

    // Get all incentive keys from all data points
    const incentiveKeys = new Set<string>();
    last7Days.forEach((dataPoint) => {
      Object.keys(dataPoint).forEach((key) => {
        if (key.toLowerCase().includes('incentive')) {
          incentiveKeys.add(key);
        }
      });
    });

    // Calculate average for each incentive key over the last 7 days
    const incentiveAverages: Record<string, number> = {};

    for (const key of incentiveKeys) {
      const values = last7Days
        .map((r) => r[key] || 0)
        .filter((value) => value !== null && value !== undefined);

      if (values.length > 0) {
        incentiveAverages[key] =
          values.reduce((sum, value) => sum + value, 0) / values.length;
      }
    }

    return incentiveAverages;
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

  override simulateWithdraw(vaultSharesToRedeem: TokenBalance) {
    const model = getNetworkModel(this.network);
    const withdrawManager = model.getWithdrawManagers(this.vaultAddress);
    if (!withdrawManager || withdrawManager.length === 0)
      throw Error('Withdraw manager not found');
    const { tokensOut } = this.pool.getTokensOutGivenLPTokens(
      this.getVaultSharesToLPTokens(vaultSharesToRedeem)
    );

    return withdrawManager.map((w) => {
      const yieldTokensRedeemed = tokensOut.find(
        (t) => t.tokenId === w.yieldToken.id
      );
      if (!yieldTokensRedeemed) throw Error('Yield token not found');

      const withdrawTokensToReceive = yieldTokensRedeemed.toToken(
        w.withdrawToken
      );
      return {
        estimatedWithdrawTime: w.estimatedWithdrawTimeInSeconds,
        yieldTokensRedeemed: yieldTokensRedeemed,
        withdrawTokensToReceive: withdrawTokensToReceive,
      };
    });
  }

  override async getInitiateWithdrawParameters(
    account: string,
    vaultSharesToRedeem: TokenBalance
  ) {
    const model = getNetworkModel(this.network);
    const withdrawManager = model.getWithdrawManagers(this.vaultAddress);
    if (!withdrawManager || withdrawManager.length === 0)
      throw Error('Withdraw manager not found');
    const { tokensOut } = this.pool.getTokensOutGivenLPTokens(
      this.getVaultSharesToLPTokens(vaultSharesToRedeem)
    );

    const minAmounts = tokensOut.map(
      (t) => t.mulInRatePrecision(RATE_PRECISION - 10 * BASIS_POINT).n
    );

    const withdrawData = withdrawManager.map((w, i) => {
      if (tokensOut[i].tokenId !== w.yieldToken.id)
        throw Error('Yield token not found');

      return w.getWithdrawParameters(account, vaultSharesToRedeem);
    });

    return defaultAbiCoder.encode(
      ['tuple(uint256[] minAmounts, bytes[] withdrawData) d'],
      [minAmounts, withdrawData]
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
  override getWithdrawTradeMetadata(withdrawTokensBurned: TokenBalance[]) {
    return [
      ...withdrawTokensBurned.map((t) =>
        this.getVaultTradeMetadata(t, this.borrowedToken)
      ),
    ];
  }

  override async getWithdrawParameters(
    _account: string,
    _vaultSharesToRedeem: TokenBalance,
    withdrawTokensBurned: TokenBalance[],
    slippageFactor = 10 * BASIS_POINT
  ): Promise<BytesLike> {
    const { dexId, withdrawExchangeData: exchangeData } =
      VaultDefaultDexParameters[this.network][this.vaultAddress];

    const redemptionTrades = withdrawTokensBurned
      .map((t) => {
        return {
          tradeAmount: t,
          dexId,
          tradeType: 0,
          minPurchaseAmount: t.mulInRatePrecision(
            RATE_PRECISION - slippageFactor
          ).n,
          exchangeData,
        };
      })
      .map((t) => defaultAbiCoder.encode([TRADE_PARAMS_TYPE], [t]));

    return defaultAbiCoder.encode(
      ['tuple(uint256[] minAmounts, bytes[] redemptionTrades) r'],
      [
        {
          // No min amounts required for withdraws
          minAmounts: [],
          redemptionTrades: redemptionTrades,
        },
      ]
    );
  }

  override async getRedeemParameters(
    _account: string,
    _maturity: number,
    vaultSharesToRedeem: TokenBalance,
    _underlyingToRepayDebt: TokenBalance,
    slippageFactor = 10 * BASIS_POINT
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
      ['tuple(uint256[] minAmounts, bytes[] redemptionTrades) r'],
      [
        {
          minAmounts,
          redemptionTrades: [],
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

  /** No dilution is applied to SingleSidedLP vaults */
  override getSimulatedAPY(
    _netAmount: TokenBalance,
    _vaultTradeMetadata?: VaultTradeMetadata[]
  ): APYData {
    const { incentiveAPY, incentives } = this.getRewardAPY();
    const assetAPY = this.getVaultAPY();

    return {
      incentiveAPY: incentiveAPY,
      organicAPY: assetAPY - incentiveAPY,
      incentives: incentives,
      totalAPY: assetAPY,
      assetAPY: assetAPY,
      pointMultiples: this.getPointMultiples(),
    };
  }
}
