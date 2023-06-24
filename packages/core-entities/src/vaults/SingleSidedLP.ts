import {
  BASIS_POINT,
  RATE_PRECISION,
  Network,
  getNowSeconds,
} from '@notional-finance/util';
import { VaultAdapter } from './VaultAdapter';
import { BaseLiquidityPool } from '../exchanges';
import { TokenBalance } from '../token-balance';
import { defaultAbiCoder } from 'ethers/lib/utils';
import { Registry } from '../Registry';
import { BigNumber } from 'ethers';

export interface SingleSidedLPParams {
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

  constructor(network: Network, vaultAddress: string, p: SingleSidedLPParams) {
    super();

    this.pool = Registry.getExchangeRegistry().getPoolInstance(network, p.pool);
    this.singleSidedTokenIndex = p.singleSidedTokenIndex;
    this.totalLPTokens = p.totalLPTokens;
    this.totalVaultShares = p.totalVaultShares;
    this.secondaryTradeParams = p.secondaryTradeParams;

    this._initOracles(network, vaultAddress);
  }

  get hashKey() {
    return [
      this.pool.hashKey,
      this.totalLPTokens.hashKey,
      this.totalVaultShares.toHexString(),
      this.singleSidedTokenIndex.toString(),
    ].join(':');
  }

  getVaultSharesToLPTokens(vaultShares: TokenBalance) {
    return this.totalLPTokens.scale(vaultShares.n, this.totalVaultShares);
  }

  getInitialVaultShareValuation(_maturity: number) {
    return {
      rate: this.pool.getLPTokenSpotValue(this.singleSidedTokenIndex).n,
      timestamp: getNowSeconds(),
      blockNumber: 0,
    };
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

      const primaryToken = tokensIn[this.singleSidedTokenIndex].token;

      return {
        netUnderlyingForVaultShares: tokensIn[this.singleSidedTokenIndex],
        feesPaid: feesPaid.reduce(
          (s, f) => s.add(f.toToken(primaryToken)),
          TokenBalance.zero(primaryToken)
        ),
      };
    } else {
      const { tokensOut, feesPaid } = this.pool.getTokensOutGivenLPTokens(
        this.getVaultSharesToLPTokens(netVaultShares.neg()),
        this.singleSidedTokenIndex
      );

      const primaryToken = tokensOut[this.singleSidedTokenIndex].token;
      return {
        netUnderlyingForVaultShares: tokensOut[this.singleSidedTokenIndex],
        feesPaid: feesPaid.reduce(
          (s, f) => s.add(f.toToken(primaryToken)),
          TokenBalance.zero(primaryToken)
        ),
      };
    }
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
      ['tuple(uint256 minLPTokens, bytes tradeData) d'],
      [
        {
          minLPTokens: minLPTokens.n,
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

    return defaultAbiCoder.encode(
      [
        'tuple(uint32 minSecondaryLendRate, uint256 minPrimary, uint256 minSecondary, bytes secondaryTradeParams) r',
      ],
      [
        {
          minSecondaryLendRate: 0,
          minPrimary: minPrimary.n,
          minSecondary: minSecondary.n,
          secondaryTradeParams: this.secondaryTradeParams,
        },
      ]
    );
  }
}
