import { getNowSeconds, Network } from '@notional-finance/util';
import { BaseVaultParams, VaultAdapter } from './VaultAdapter';
import {
  APYData,
  ExchangeRate,
  getNetworkModel,
  TokenBalance,
  TokenDefinition,
} from '..';
import { BytesLike } from 'ethers';

export interface StakingVaultParams extends BaseVaultParams {
  stakingToken: string;
}

export class Staking extends VaultAdapter {
  public stakingToken: TokenDefinition;

  constructor(
    network: Network,
    vaultAddress: string,
    p: StakingVaultParams,
    borrowedToken: TokenDefinition
  ) {
    super(p.enabled, p.strategyType, network, vaultAddress, borrowedToken);
    this.stakingToken = getNetworkModel(this.network).getTokenByID(
      p.stakingToken
    );
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
    const netUnderlyingForVaultShares = netVaultShares.toToken(
      this.borrowedToken
    );
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

  override getDepositParameters(
    _account: string,
    _maturity: number,
    _totalDeposit: TokenBalance,
    _slippageFactor?: number
  ): Promise<BytesLike> {
    throw new Error('Method not implemented.');
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
