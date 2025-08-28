import { BASIS_POINT, getNowSeconds, Network } from '@notional-finance/util';
import { BaseVaultParams, VaultAdapter } from './VaultAdapter';
import {
  APYData,
  ExchangeRate,
  getNetworkModel,
  TokenBalance,
  TokenDefinition,
  VaultDefaultDexParameters,
} from '..';
import { BytesLike } from 'ethers';
import { defaultAbiCoder } from 'ethers/lib/utils';

export interface StakingVaultParams extends BaseVaultParams {
  yieldToken: string;
}

export class Staking extends VaultAdapter {
  public stakingToken: TokenDefinition;

  constructor(
    network: Network,
    vaultAddress: string,
    p: StakingVaultParams,
    borrowedToken: TokenDefinition,
    yieldToken: TokenDefinition
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
    } else {
      this.stakingToken = this.yieldToken;
    }
  }

  override get hashKey(): string {
    return [this.stakingToken.id].join(':');
  }

  override getInitialVaultShareValuation(): ExchangeRate {
    const oneStakingToken = TokenBalance.unit(this.stakingToken);

    return {
      rate: oneStakingToken.toToken(this.borrowedToken).scaleTo(18),
      timestamp: getNowSeconds(),
      blockNumber: 0,
    };
  }

  override getNetVaultSharesCost(netVaultShares: TokenBalance): {
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

  override getNetVaultSharesMinted(
    netUnderlying: TokenBalance,
    vaultShare: TokenDefinition
  ): {
    netVaultSharesForUnderlying: TokenBalance;
    feesPaid: TokenBalance;
    vaultTradeMetadata?: unknown;
  } {
    return {
      feesPaid: netUnderlying.copy(0),
      netVaultSharesForUnderlying: netUnderlying.toToken(vaultShare),
    };
  }

  override async getDepositParameters(
    _account: string,
    _maturity: number,
    totalDeposit: TokenBalance,
    slippageFactor = 25 * BASIS_POINT
  ) {
    const { dexId, depositExchangeData: exchangeData } =
      VaultDefaultDexParameters[this.network][this.vaultAddress];
    const tradeType = 0; // Exact In Single
    const minPurchaseAmount = totalDeposit
      .toToken(this.stakingToken)
      .mulInRatePrecision(slippageFactor).n;

    return defaultAbiCoder.encode(
      [
        'tuple(uint8 tradeType, uint256 minPurchaseAmount, bytes exchangeData, uint16 dexId, bytes stakeData)',
      ],
      [
        {
          tradeType,
          minPurchaseAmount,
          exchangeData,
          dexId,
          stakeData: '0x',
        },
      ]
    );
  }

  override getRedeemParameters(
    _account: string,
    _maturity: number,
    _vaultSharesToRedeem: TokenBalance,
    _underlyingToRepayDebt: TokenBalance,
    _slippageFactor?: number
  ): Promise<BytesLike> {
    throw new Error('Method not implemented.');
  }

  override getVaultAPY(_factors?: {
    account: string;
    vaultShares: TokenBalance;
    maturity: number;
  }): number {
    return 5.3;
  }

  override getLiquidationPriceTokens(): TokenDefinition[] {
    return [this.stakingToken];
  }

  override getSimulatedAPY(
    _netAmount: TokenBalance,
    _vaultTradeMetadata?: unknown
  ): APYData {
    return {
      totalAPY: 0,
      organicAPY: 0,
      assetAPY: 0,
      feeAPY: 0,
      apySpread: 0,
      incentiveAPY: 0,
      incentives: [],
      utilization: 0,
      pointMultiples: {},
      leverageRatio: 0,
    };
  }
}
