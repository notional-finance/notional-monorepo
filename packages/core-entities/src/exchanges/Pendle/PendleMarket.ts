import { ERC20ABI } from '@notional-finance/contracts';
import { TokenBalance } from '../../token-balance';
import BaseLiquidityPool from '../base-liquidity-pool';
import {
  getNowSeconds,
  getProviderFromNetwork,
  Network,
  RATE_PRECISION,
  SECONDS_IN_YEAR_ACTUAL,
} from '@notional-finance/util';
import { AggregateCall } from '@notional-finance/multicall';
import { BigNumber, Contract } from 'ethers';

interface PendleMarketParams {
  totalSy: TokenBalance;
  totalPt: TokenBalance;
  scalarRoot: number;
  lnImpliedRate: number;
  lnFeeRateRoot: number;
  expiry: number;
}

export class PendleMarket extends BaseLiquidityPool<PendleMarketParams> {
  public static override getInitData(
    network: Network,
    ptAddress: string
  ): AggregateCall[] {
    const ptToken = new Contract(
      ptAddress,
      ERC20ABI,
      getProviderFromNetwork(network)
    );
    return [
      {
        stage: 0,
        target: ptToken,
        method: 'totalSupply',
        key: 'totalSupply',
        args: [],
        transform: (r: BigNumber) => TokenBalance.toJSON(r, ptAddress, network),
      },
      // No balances to return for the PT token
      {
        stage: 0,
        target: 'NO_OP',
        method: 'NO_OP',
        key: 'balances',
        args: [],
        transform: () => [],
      },
    ];
  }

  public static override getPoolParamsOffChain(
    _network: Network,
    _poolAddress: string
  ) {
    // TODO: return market depth information....
    return Promise.resolve({});
  }

  public TOKEN_IN_INDEX = 0;
  public PT_TOKEN_INDEX = 1;

  public override calculateTokenTrade(
    tokensIn: TokenBalance,
    tokenIndexOut: number,
    _balanceOverrides?: TokenBalance[]
  ): { tokensOut: TokenBalance; feesPaid: TokenBalance[] } {
    if (tokenIndexOut === this.TOKEN_IN_INDEX) {
      // Underlying token in, PT out. Search over marketDepthTokenIn to approximate the amount of PT out
      // and do a linear interpolation between the two nearest points.
      const { postFeeAssetToAccount, fee } =
        this.calculateTokenOutGivenPTIn(tokensIn);

      return {
        tokensOut: postFeeAssetToAccount,
        feesPaid: [fee, TokenBalance.zero(this.poolParams.totalPt.token)],
      };
    } else if (tokenIndexOut === this.PT_TOKEN_INDEX) {
      // Assume PT in at the current exchange rate, then do secant search until
      // we find the postFeeAssetToAccount that is close to tokensIn

      // TODO: add a secant search here...
      const { postFeeAssetToAccount, fee } =
        this.calculateTokenOutGivenPTIn(tokensIn);

      return {
        tokensOut: postFeeAssetToAccount,
        feesPaid: [fee, TokenBalance.zero(this.poolParams.totalPt.token)],
      };
    } else {
      throw new Error('Invalid token index');
    }
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
    _singleSidedExitTokenIndex?: number
  ): { tokensOut: TokenBalance[]; feesPaid: TokenBalance[] } {
    throw new Error('Method not implemented.');
  }

  protected calculateTokenOutGivenPTIn(
    ptIn: TokenBalance,
    blockTime = getNowSeconds()
  ) {
    const timeToExpiry = this.poolParams.expiry - blockTime;
    const rateScalar =
      (this.poolParams.scalarRoot * SECONDS_IN_YEAR_ACTUAL) / timeToExpiry;
    const totalAsset = this.syToAsset(this.poolParams.totalSy);
    const rateAnchor = this.getRateAnchor(
      totalAsset,
      rateScalar,
      this.poolParams.lnImpliedRate,
      timeToExpiry
    );
    const feeRate = this._getExchangeRateFromImpliedRate(
      this.poolParams.lnFeeRateRoot,
      timeToExpiry
    );
    const preFeeExchangeRate = this._getExchangeRate(
      totalAsset,
      ptIn,
      rateScalar,
      rateAnchor
    );
    const preFeeAssetToAccount = ptIn.mulInRatePrecision(
      Math.floor(preFeeExchangeRate * RATE_PRECISION)
    );

    let fee: TokenBalance;
    if (ptIn.isPositive()) {
      fee = preFeeAssetToAccount.mulInRatePrecision(
        Math.floor((1 - feeRate) * RATE_PRECISION)
      );
    } else {
      fee = preFeeAssetToAccount
        .scale(
          Math.floor((1 - feeRate) * RATE_PRECISION),
          Math.floor(feeRate * RATE_PRECISION)
        )
        .neg();
    }

    const postFeeAssetToAccount = preFeeAssetToAccount.sub(fee);

    // This is in asset terms, not SY terms.
    return {
      postFeeAssetToAccount,
      fee,
    };
  }

  protected getRateAnchor(
    totalAsset: TokenBalance,
    rateScalar: number,
    lnImpliedRate: number,
    timeToExpiry: number
  ) {
    const newExchangeRate = this._getExchangeRateFromImpliedRate(
      lnImpliedRate,
      timeToExpiry
    );
    const proportion =
      this.poolParams.totalPt.toFloat() /
      (this.poolParams.totalPt.toFloat() + totalAsset.toFloat());
    const lnProportion = Math.log(proportion / (1 - proportion));

    return newExchangeRate - lnProportion / rateScalar;
  }

  protected _getExchangeRate(
    totalAsset: TokenBalance,
    netPtToAccount: TokenBalance,
    rateScalar: number,
    rateAnchor: number
  ) {
    const numerator = this.poolParams.totalPt.sub(netPtToAccount).toFloat();
    const proportion =
      numerator / (this.poolParams.totalPt.toFloat() + totalAsset.toFloat());

    if (numerator <= 0 || proportion > 0.96)
      throw Error('Insufficient liquidity');

    const lnProportion = Math.log(proportion / (1 - proportion));

    const exchangeRate = lnProportion / rateScalar + rateAnchor;

    if (exchangeRate < 1) throw Error('Exchange rate below one');

    return exchangeRate;
  }

  protected _getExchangeRateFromImpliedRate(
    lnImpliedRate: number,
    timeToExpiry: number
  ) {
    // E = e^rt
    const rt = (lnImpliedRate * timeToExpiry) / SECONDS_IN_YEAR_ACTUAL;
    return Math.exp(rt);
  }
}
