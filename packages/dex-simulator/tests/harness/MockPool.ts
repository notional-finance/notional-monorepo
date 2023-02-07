import { BigNumber, constants } from 'ethers';
import { BaseLiquidityPool } from '../../src/exchanges/BaseLiquidityPool';

export class MockPool extends BaseLiquidityPool<Record<string, never>> {
  LP_TOKEN_PRECISION: BigNumber;

  constructor(
    public lpTokenPrecision: BigNumber,
    public override tokenDecimals: BigNumber[],
    public override balances: BigNumber[],
    public oracleRate: BigNumber,
    public override totalLPTokensHeld: BigNumber,
    public override totalStrategyTokensGlobal: BigNumber,
    public override totalSupply: BigNumber
  ) {
    super(
      totalLPTokensHeld.mul(lpTokenPrecision),
      totalStrategyTokensGlobal.mul(lpTokenPrecision),
      tokenDecimals,
      balances,
      totalSupply.mul(lpTokenPrecision),
      {}
    );

    this.LP_TOKEN_PRECISION = lpTokenPrecision;
  }

  public calculateTokenTrade(
    tokensIn: BigNumber,
    _tokenIndexIn: number,
    tokenIndexOut: number,
    _balanceOverrides?: BigNumber[]
  ): { tokensOut: BigNumber; feesPaid: BigNumber[] } {
    return {
      tokensOut: tokensIn
        .mul(this.tokenDecimals[tokenIndexOut])
        .mul(this.oracleRate)
        .div(constants.WeiPerEther),
      feesPaid: Array(2).fill(BigNumber.from(0)),
    };
  }

  public override getLPTokensGivenTokens(_tokensIn: BigNumber[]): {
    lpTokens: BigNumber;
    feesPaid: BigNumber[];
  } {
    return {
      lpTokens: BigNumber.from(0),
      feesPaid: Array(2).fill(BigNumber.from(0)),
    };
  }

  public getTokensOutGivenLPTokens(
    _lpTokens: BigNumber,
    _singleSidedExitTokenIndex?: number
  ): {
    tokensOut: BigNumber[];
    feesPaid: BigNumber[];
  } {
    return {
      tokensOut: Array(2).fill(BigNumber.from(0)),
      feesPaid: Array(2).fill(BigNumber.from(0)),
    };
  }
}
