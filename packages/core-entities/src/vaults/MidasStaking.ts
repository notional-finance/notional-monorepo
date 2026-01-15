import { BASIS_POINT, RATE_PRECISION } from '@notional-finance/util';
import { TokenBalance } from '../token-balance';
import { defaultAbiCoder } from '@ethersproject/abi';
import { Staking } from './Staking';

export class MidasStaking extends Staking {
  override getNetVaultSharesCost(netVaultShares: TokenBalance): {
    netUnderlyingForVaultShares: TokenBalance;
    feesPaid: TokenBalance;
  } {
    const netUnderlyingForVaultShares = netVaultShares
      .toToken(this.borrowedToken)
      .neg();
    // TODO: include instant redeem fees

    return {
      netUnderlyingForVaultShares,
      feesPaid: netVaultShares.copy(0),
    };
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
    slippageFactor = 25 * BASIS_POINT
  ) {
    // This includes the fees paid
    const minReceiveAmount = vaultSharesToRedeem
      .toToken(this.borrowedToken)
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
}
