import { BASIS_POINT, Network } from '@notional-finance/util';
import { BaseVaultParams, VaultAdapter } from './VaultAdapter';
import {
  APYData,
  getNetworkModel,
  TokenBalance,
  TokenDefinition,
  VaultDefaultDexParameters,
  VaultTradeMetadata,
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
    vaultTradeMetadata?: VaultTradeMetadata[];
  } {
    const netVaultSharesForUnderlying = netUnderlying.toToken(vaultShare);
    const vaultTradeMetadata: VaultTradeMetadata[] = [];

    if (netUnderlying.tokenId !== this.stakingToken.id) {
      const defaultDex =
        VaultDefaultDexParameters[this.network][this.vaultAddress];
      vaultTradeMetadata.push(
        this.getVaultTradeMetadata(
          netUnderlying,
          this.stakingToken,
          netUnderlying.isPositive()
            ? defaultDex.depositPoolAddress
            : defaultDex.redeemPoolAddress
        )
      );
    }

    if (this.stakingToken.id !== this.yieldToken.id) {
      vaultTradeMetadata.push(
        this.getVaultTradeMetadata(
          netUnderlying.toToken(this.stakingToken),
          this.yieldToken
        )
      );
    }

    return {
      feesPaid: netUnderlying.copy(0),
      netVaultSharesForUnderlying,
      vaultTradeMetadata,
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

  // TODO: need to switch on if there is a pending withdraw
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
