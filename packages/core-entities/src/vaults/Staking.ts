import {
  BASIS_POINT,
  DEX_ID,
  getNowSeconds,
  Network,
  SCALAR_PRECISION,
  SECONDS_IN_DAY,
} from '@notional-finance/util';
import { BaseVaultParams, VaultAdapter } from './VaultAdapter';
import {
  APYData,
  getNetworkModel,
  BalanceStatementReturnType,
  TimeSeriesResponse,
  TokenBalance,
  TokenDefinition,
  VaultDefaultDexParameters,
  VaultTradeMetadata,
} from '..';
import { defaultAbiCoder } from 'ethers/lib/utils';
import { BigNumber } from 'ethers';

export interface StakingVaultParams extends BaseVaultParams {
  yieldToken: string;
}

export class Staking extends VaultAdapter {
  public stakingToken: TokenDefinition;
  public withdrawToken?: TokenDefinition;

  constructor(
    network: Network,
    vaultAddress: string,
    p: StakingVaultParams,
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
    const model = getNetworkModel(this.network);
    this.yieldToken = model.getTokenByID(p.yieldToken);
    const vaultConfig = model.getVaultConfig(this.vaultAddress);
    if (vaultConfig.withdrawRequestManagers.length === 1) {
      this.stakingToken = model.getTokenByID(
        vaultConfig.withdrawRequestManagers[0].stakingToken.id
      );
      this.withdrawToken = model.getTokenByID(
        vaultConfig.withdrawRequestManagers[0].withdrawToken.id
      );
    } else {
      this.stakingToken = this.yieldToken;
    }
  }

  override get hashKey(): string {
    return [this.stakingToken.id].join(':');
  }

  getStakeTrade(
    stakingTokens: TokenBalance,
    vaultShare: TokenDefinition
  ): {
    vaultShares: TokenBalance;
    tradeMetadata?: VaultTradeMetadata;
  } {
    if (this.stakingToken.id === this.yieldToken.id) {
      return {
        vaultShares: stakingTokens.toToken(vaultShare),
        tradeMetadata: undefined,
      };
    } else {
      // This is based on the exchange rate of the staking token to the yield token.
      const tradeMetadata = this.getEstimatedVaultTrade(
        stakingTokens,
        this.yieldToken
      );
      const vaultShares = tradeMetadata.tokensBought.toToken(vaultShare);
      return {
        vaultShares,
        tradeMetadata,
      };
    }
  }

  override getEstimatedUnderlying(netVaultShares: TokenBalance): {
    netUnderlyingForVaultShares: TokenBalance;
    feesPaid: TokenBalance;
  } {
    const netUnderlyingForVaultShares = netVaultShares
      .toToken(this.borrowedToken)
      .neg();
    return {
      netUnderlyingForVaultShares: netUnderlyingForVaultShares,
      feesPaid: netUnderlyingForVaultShares.copy(0),
    };
  }

  override getEstimatedVaultShares(
    netUnderlying: TokenBalance,
    vaultShare: TokenDefinition
  ): {
    netVaultSharesForUnderlying: TokenBalance;
    feesPaid: TokenBalance;
    vaultTradeMetadata?: VaultTradeMetadata[];
  } {
    let netStakingTokens: TokenBalance;
    const vaultTradeMetadata: VaultTradeMetadata[] = [];

    if (netUnderlying.tokenId === this.stakingToken.id) {
      netStakingTokens = netUnderlying;
    } else {
      const defaultDex =
        VaultDefaultDexParameters[this.network][this.vaultAddress];
      const tradeMetadata = this.getEstimatedVaultTrade(
        netUnderlying,
        this.stakingToken,
        defaultDex
          ? netUnderlying.isPositive()
            ? defaultDex.depositPoolAddress
            : defaultDex.redeemPoolAddress
          : undefined
      );
      netStakingTokens = tradeMetadata.tokensBought;
      vaultTradeMetadata.push(tradeMetadata);
    }

    const { vaultShares, tradeMetadata } = this.getStakeTrade(
      netStakingTokens,
      vaultShare
    );

    if (tradeMetadata) vaultTradeMetadata.push(tradeMetadata);

    return {
      feesPaid: netUnderlying.copy(0),
      netVaultSharesForUnderlying: vaultShares,
      vaultTradeMetadata,
    };
  }

  override async getVaultShares(
    netUnderlying: TokenBalance,
    vaultShare: TokenDefinition
  ): Promise<{
    netVaultSharesForUnderlying: TokenBalance;
    feesPaid: TokenBalance;
    vaultTradeMetadata?: VaultTradeMetadata[];
  }> {
    const vaultTradeMetadata: VaultTradeMetadata[] = [];
    let netStakingTokens: TokenBalance;

    if (netUnderlying.tokenId === this.stakingToken.id) {
      netStakingTokens = netUnderlying;
    } else {
      const tradeMetadata = await this.getVaultTrade(
        netUnderlying,
        this.stakingToken,
        'ZeroEx'
      );
      netStakingTokens = tradeMetadata.tokensBought;
      vaultTradeMetadata.push(tradeMetadata);
    }

    const { vaultShares, tradeMetadata } = this.getStakeTrade(
      netStakingTokens,
      vaultShare
    );
    if (tradeMetadata) vaultTradeMetadata.push(tradeMetadata);

    return {
      netVaultSharesForUnderlying: vaultShares,
      feesPaid: netUnderlying.copy(0),
      vaultTradeMetadata,
    };
  }

  override simulateWithdraw(vaultSharesToRedeem: TokenBalance) {
    const model = getNetworkModel(this.network);
    const withdrawManager = model.getWithdrawManagers(this.vaultAddress);
    if (!withdrawManager || withdrawManager.length !== 1 || !this.withdrawToken)
      throw Error('Withdraw manager not found');
    const yieldTokensRedeemed = vaultSharesToRedeem.toToken(this.yieldToken);
    const withdrawTokensToReceive = yieldTokensRedeemed.toToken(
      this.withdrawToken
    );
    return [
      {
        estimatedWithdrawTime:
          withdrawManager[0].estimatedWithdrawTimeInSeconds,
        yieldTokensRedeemed,
        withdrawTokensToReceive,
      },
    ];
  }

  override async getInitiateWithdrawParameters(
    account: string,
    vaultSharesToRedeem: TokenBalance
  ) {
    const model = getNetworkModel(this.network);
    const withdrawManager = model.getWithdrawManagers(this.vaultAddress);
    if (!withdrawManager || withdrawManager.length !== 1 || !this.withdrawToken)
      throw Error('Withdraw manager not found');
    return withdrawManager[0].getWithdrawParameters(
      account,
      vaultSharesToRedeem
    );
  }

  override async getDepositParameters(
    _account: string,
    totalDeposit: TokenBalance,
    vaultTradeMetadata?: VaultTradeMetadata[],
    slippageFactor = 25 * BASIS_POINT
  ) {
    const { dexId, exchangeData, minPurchaseAmount } = this.getExchangeData(
      vaultTradeMetadata,
      'deposit',
      totalDeposit.toToken(this.stakingToken).mulInRatePrecision(slippageFactor)
        .n
    );

    return defaultAbiCoder.encode(
      [
        'tuple(uint8 tradeType, uint256 minPurchaseAmount, bytes exchangeData, uint16 dexId, bytes stakeData)',
      ],
      [
        {
          tradeType: 0, // Exact In Single
          minPurchaseAmount,
          exchangeData,
          dexId,
          stakeData: '0x',
        },
      ]
    );
  }

  // TODO: this needs an estimated version
  override getWithdrawTradeMetadata(withdrawTokensBurned: TokenBalance[]) {
    if (withdrawTokensBurned.length !== 1)
      throw Error('Staking vault only supports one withdraw token');
    const defaultDex =
      VaultDefaultDexParameters[this.network][this.vaultAddress];
    return [
      this.getEstimatedVaultTrade(
        withdrawTokensBurned[0],
        this.borrowedToken,
        defaultDex?.withdrawPoolAddress
      ),
    ];
  }

  override async getWithdrawParameters(
    _account: string,
    _vaultSharesToRedeem: TokenBalance,
    withdrawTokensBurned: TokenBalance[],
    vaultTradeMetadata?: VaultTradeMetadata[],
    slippageFactor = 25 * BASIS_POINT
  ) {
    if (withdrawTokensBurned.length !== 1)
      throw Error('Staking vault only supports one withdraw token');
    const { dexId, exchangeData, minPurchaseAmount } = this.getExchangeData(
      vaultTradeMetadata,
      'withdraw',
      withdrawTokensBurned[0]
        .toToken(this.borrowedToken)
        .mulInRatePrecision(slippageFactor || 0).n
    );

    return defaultAbiCoder.encode(
      ['tuple(uint16 dexId, uint256 minPurchaseAmount, bytes exchangeData)'],
      [
        {
          dexId,
          minPurchaseAmount,
          exchangeData,
        },
      ]
    );
  }

  override async getRedeemParameters(
    _account: string,
    vaultSharesToRedeem: TokenBalance,
    _underlyingToRepayDebt: TokenBalance,
    vaultTradeMetadata?: VaultTradeMetadata[],
    slippageFactor = 25 * BASIS_POINT
  ) {
    const { dexId, exchangeData, minPurchaseAmount } = this.getExchangeData(
      vaultTradeMetadata,
      'redeem',
      vaultSharesToRedeem
        .toToken(this.borrowedToken)
        .mulInRatePrecision(slippageFactor || 0).n
    );

    return defaultAbiCoder.encode(
      ['tuple(uint16 dexId, uint256 minPurchaseAmount, bytes exchangeData)'],
      [
        {
          minPurchaseAmount,
          exchangeData,
          dexId,
        },
      ]
    );
  }

  override getVaultAPY(_factors?: {
    account: string;
    vaultShares: TokenBalance;
    maturity: number;
  }): number {
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

  override getLiquidationPriceTokens(): TokenDefinition[] {
    return [this.stakingToken];
  }

  override getAdditionalAccruedInterest(
    statement: BalanceStatementReturnType
  ): TokenBalance {
    const model = getNetworkModel(this.network);
    const oracle = model.oracles.get(
      `${this.stakingToken.id}:${this.yieldToken.id}:WithdrawTokenExchangeRate`
    );
    const currentInterestAccumulator =
      oracle?.latestRate.rate || BigNumber.from(0);
    const accountingAsset = model.getTokenByID(statement.accountingAssetId);

    return TokenBalance.unit(accountingAsset)
      .scale(
        currentInterestAccumulator.sub(statement.lastInterestAccumulator),
        SCALAR_PRECISION
      )
      .scale(statement.balance, statement.balance.precision);
  }

  override getSimulatedAPY(
    _netAmount: TokenBalance,
    _vaultTradeMetadata?: unknown
  ): APYData {
    const organicAPY = this.getVaultAPY();

    return {
      totalAPY: organicAPY,
      organicAPY: organicAPY,
      assetAPY: organicAPY,
    };
  }
}
