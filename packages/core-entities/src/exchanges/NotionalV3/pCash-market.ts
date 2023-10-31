import { TokenDefinition } from '../../Definitions';
import { TokenBalance } from '../../token-balance';
import {
  BaseNotionalMarket,
  InterestRateParameters,
} from './BaseNotionalMarket';

interface pCashMarketParams {
  currencyId: number;
  primeCashCurve: InterestRateParameters;
}

export class pCashMarket extends BaseNotionalMarket<pCashMarketParams> {
  protected override getIRParams(_marketIndex: number): InterestRateParameters {
    return this.poolParams.primeCashCurve;
  }

  protected getfCashSpotRate(_: TokenDefinition): number {
    throw new Error('Method not implemented.');
  }

  public override calculateTokenTrade(
    _tokensIn: TokenBalance,
    _tokenIndexOut: number,
    _balanceOverrides?: TokenBalance[] | undefined
  ): { tokensOut: TokenBalance; feesPaid: TokenBalance[] } {
    throw new Error('Method not implemented.');
  }

  public override getLPTokensGivenTokens(_tokensIn: TokenBalance[]): {
    lpTokens: TokenBalance;
    feesPaid: TokenBalance[];
    lpClaims: TokenBalance[];
  } {
    throw new Error('Method not implemented.');
  }

  public override getTokensOutGivenLPTokens(
    _lpTokens: TokenBalance,
    _singleSidedExitTokenIndex?: number | undefined
  ): { tokensOut: TokenBalance[]; feesPaid: TokenBalance[] } {
    throw new Error('Method not implemented.');
  }
}
