import { BASIS_POINT, RATE_PRECISION } from '@notional-finance/util';
import { TokenBalance } from '../token-balance';
import { defaultAbiCoder } from '@ethersproject/abi';
import { Staking } from './Staking';
import { TokenDefinition, VaultTradeMetadata } from '../Definitions';
import { VaultDefaultDexParameters } from '../config/whitelisted-vaults';
import { getNetworkModel } from '../Models';
import { MidasPool } from '../exchanges';
import { APYData } from '..';

export class MidasStaking extends Staking {
  override getPendingWithdrawAPY(): APYData {
    const organicAPY = this.getVaultAPY();
    return {
      totalAPY: organicAPY,
      assetAPY: organicAPY,
      organicAPY: organicAPY,
      feeAPY: 0,
    };
  }

  override getVaultShareExitToUnderlying(netVaultShares: TokenBalance): {
    netUnderlyingForVaultShares: TokenBalance;
    feesPaid: TokenBalance;
    vaultTradeMetadata?: VaultTradeMetadata[];
  } {
    const defaultDex =
      VaultDefaultDexParameters[this.network][this.vaultAddress];
    return super.getVaultShareExitToUnderlying(
      netVaultShares,
      defaultDex.depositPoolAddress
    );
  }

  override getRedeemVaultShares(
    netUnderlying: TokenBalance,
    vaultShare: TokenDefinition,
    stakingPoolAddress?: string
  ): {
    netVaultSharesForUnderlying: TokenBalance;
    feesPaid: TokenBalance;
    vaultTradeMetadata?: VaultTradeMetadata[];
  } {
    if (!stakingPoolAddress)
      throw new Error('Staking pool address is required');
    const midasPool = getNetworkModel(this.network).getPoolInstance(
      stakingPoolAddress
    ) as MidasPool;
    // Increase the amount of underlying required to account for the instant redeem fee
    const yieldTokens = netUnderlying
      .neg()
      .scale(midasPool.poolParams.instantRedeemFee.add(10000), 10000)
      .toToken(this.yieldToken);

    const tradeMetadata = this.getVaultTradeMetadata(
      yieldTokens,
      this.borrowedToken,
      stakingPoolAddress
    );

    return {
      feesPaid: netUnderlying.copy(0),
      netVaultSharesForUnderlying: yieldTokens.neg().toToken(vaultShare),
      vaultTradeMetadata: [tradeMetadata],
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
    const defaultDex =
      VaultDefaultDexParameters[this.network][this.vaultAddress];
    return super.getNetVaultSharesMinted(
      netUnderlying,
      vaultShare,
      defaultDex.depositPoolAddress
    );
  }

  override async getDepositParameters(
    _account: string,
    _maturity: number,
    totalDeposit: TokenBalance,
    slippageFactor = 25 * BASIS_POINT
  ) {
    const minReceiveAmount = totalDeposit
      .toToken(this.yieldToken)
      .mulInRatePrecision(RATE_PRECISION - slippageFactor).n;

    return defaultAbiCoder.encode(
      ['tuple(uint256 minReceiveAmount)'],
      [
        {
          minReceiveAmount,
        },
      ]
    );
  }

  override getWithdrawTradeMetadata(_withdrawTokensBurned: TokenBalance[]) {
    return [];
  }

  override async getWithdrawParameters(
    _account: string,
    _vaultSharesToRedeem: TokenBalance,
    _withdrawTokensBurned: TokenBalance[],
    _slippageFactor = 25 * BASIS_POINT
  ) {
    return '0x';
  }

  override async getRedeemParameters(
    _account: string,
    _maturity: number,
    vaultSharesToRedeem: TokenBalance,
    _underlyingToRepayDebt: TokenBalance,
    slippageFactor = 55 * BASIS_POINT
  ) {
    const defaultDex =
      VaultDefaultDexParameters[this.network][this.vaultAddress];
    const pool = getNetworkModel(this.network).getPoolInstance(
      defaultDex.redeemPoolAddress || ''
    );
    const instantRedeemFee = (pool as MidasPool).poolParams.instantRedeemFee;

    // This includes the fees paid
    const minReceiveAmount = vaultSharesToRedeem
      .toToken(this.borrowedToken)
      .mulInRatePrecision(
        RATE_PRECISION -
          (instantRedeemFee.toNumber() * RATE_PRECISION) / 10000 -
          slippageFactor
      ).n;

    return defaultAbiCoder.encode(
      ['tuple(uint256 minReceiveAmount)'],
      [
        {
          minReceiveAmount,
        },
      ]
    );
  }
}
