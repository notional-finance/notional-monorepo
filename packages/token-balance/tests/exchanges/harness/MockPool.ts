import { ExchangeRate, TokenBalance } from '../../../src';
import { BaseLiquidityPool } from '../../../src/exchanges/BaseLiquidityPool';

export class MockPool extends BaseLiquidityPool<Record<string, never>> {
  constructor(
    public override balances: TokenBalance[],
    public oracleRate: ExchangeRate,
    public override totalSupply: TokenBalance
  ) {
    super(balances, totalSupply, {});
  }

  public setOracleRate(newOracleRate: ExchangeRate) {
    this.oracleRate = newOracleRate;
  }

  public calculateTokenTrade(
    tokensIn: TokenBalance,
    _tokenIndexIn: number,
    tokenIndexOut: number,
    _balanceOverrides?: TokenBalance[]
  ): { tokensOut: TokenBalance; feesPaid: TokenBalance[] } {
    const balances = _balanceOverrides || this.balances;
    const tokenOutDefinition = balances[tokenIndexOut].token;
    const tokensOut = tokensIn.toToken(tokenOutDefinition, this.oracleRate);

    return {
      tokensOut,
      feesPaid: balances.map((b) => b.copy(0)),
    };
  }

  public override getLPTokensGivenTokens(tokensIn: TokenBalance[]): {
    lpTokens: TokenBalance;
    feesPaid: TokenBalance[];
  } {
    const lpTokenDefinition = this.totalSupply.token;
    const lpTokens = tokensIn[0]
      .toToken(lpTokenDefinition, this.oracleRate)
      .add(tokensIn[1].toToken(lpTokenDefinition, this.oracleRate));

    return {
      lpTokens,
      feesPaid: this.balances.map((b) => b.copy(0)),
    };
  }

  public getTokensOutGivenLPTokens(
    lpTokens: TokenBalance,
    singleSidedExitTokenIndex?: number
  ): {
    tokensOut: TokenBalance[];
    feesPaid: TokenBalance[];
  } {
    const tokensOut = this.balances.map((b) =>
      b.scale(lpTokens, this.totalSupply)
    );

    if (singleSidedExitTokenIndex) {
      const tokensInIndex = 1 - singleSidedExitTokenIndex;
      const { tokensOut: addTokensOut } = this.calculateTokenTrade(
        tokensOut[tokensInIndex],
        tokensInIndex,
        singleSidedExitTokenIndex
      );
      tokensOut[tokensInIndex] = tokensOut[tokensInIndex].copy(0);
      tokensOut[singleSidedExitTokenIndex] =
        tokensOut[singleSidedExitTokenIndex].add(addTokensOut);
    }

    return {
      tokensOut,
      feesPaid: this.balances.map((b) => b.copy(0)),
    };
  }
}
