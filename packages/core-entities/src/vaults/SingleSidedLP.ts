import {
  BASIS_POINT,
  RATE_PRECISION,
  Network,
  getNowSeconds,
  PRIME_CASH_VAULT_MATURITY,
  INTERNAL_TOKEN_DECIMALS,
} from '@notional-finance/util';
import { BaseVaultParams, VaultAdapter } from './VaultAdapter';
import { BaseLiquidityPool } from '../exchanges';
import { TokenBalance } from '../token-balance';
import { defaultAbiCoder } from 'ethers/lib/utils';
import { Registry } from '../Registry';
import { BigNumber } from 'ethers';
import { TokenDefinition } from '../Definitions';

export interface SingleSidedLPParams extends BaseVaultParams {
  pool: string;
  singleSidedTokenIndex: number;
  totalLPTokens: TokenBalance;
  totalVaultShares: BigNumber;
  secondaryTradeParams: string;
}

export class SingleSidedLP extends VaultAdapter {
  // We should make a method that just returns all of these...
  public pool: BaseLiquidityPool<unknown>; // hardcoded probably?
  public singleSidedTokenIndex: number;
  public totalLPTokens: TokenBalance;
  // This does not have a token balance because maturity is unset
  public totalVaultShares: BigNumber;
  public secondaryTradeParams: string;

  get strategy() {
    return 'SingleSidedLP';
  }

  constructor(network: Network, vaultAddress: string, p: SingleSidedLPParams) {
    super(p.enabled, p.name);

    this.pool = Registry.getExchangeRegistry().getPoolInstance(network, p.pool);
    this.singleSidedTokenIndex = p.singleSidedTokenIndex;
    this.totalLPTokens = p.totalLPTokens;
    this.totalVaultShares = p.totalVaultShares;
    this.secondaryTradeParams = p.secondaryTradeParams;

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

  private getVaultSharesToLPTokens(vaultShares: TokenBalance) {
    return this.totalLPTokens.scale(vaultShares.n, this.totalVaultShares);
  }

  private getLPTokensToVaultShares(
    lpTokens: TokenBalance,
    vaultShare: TokenDefinition
  ) {
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

    // TODO: check the deposit params
    return defaultAbiCoder.encode(
      ['tuple(uint256 minLPTokens, bytes tradeData) d'],
      [
        {
          // Floor min lp tokens at zero
          minLPTokens:
            minLPTokens.toFloat() > 0.0001 ? minLPTokens.n : BigNumber.from(0),
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
    const { tokensOut } = this.pool.getTokensOutGivenLPTokens(
      this.getVaultSharesToLPTokens(vaultSharesToRedeem)
    );
    const minPrimary = tokensOut[this.singleSidedTokenIndex].mulInRatePrecision(
      RATE_PRECISION - slippageFactor
    );
    const minSecondary = tokensOut[
      1 - this.singleSidedTokenIndex
    ].mulInRatePrecision(RATE_PRECISION - slippageFactor);

    // TODO: check the redeem params
    return defaultAbiCoder.encode(
      [
        'tuple( uint256 minPrimary, uint256 minSecondary, bytes secondaryTradeParams) r',
      ],
      [
        {
          minPrimary: minPrimary.n,
          minSecondary: minSecondary.n,
          secondaryTradeParams: this.secondaryTradeParams,
        },
      ]
    );
  }

  getPriceExposure() {
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
