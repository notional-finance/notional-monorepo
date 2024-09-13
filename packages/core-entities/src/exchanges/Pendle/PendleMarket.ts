import {
  PendleMarketABI,
  PendleMarket as PendleMarketContract,
  PendleSY,
  PendleSYABI,
} from '@notional-finance/contracts';
import { TokenBalance } from '../../token-balance';
import BaseLiquidityPool from '../base-liquidity-pool';
import {
  doSecantSearch,
  getNowSeconds,
  getProviderFromNetwork,
  Network,
  RATE_PRECISION,
  SCALAR_PRECISION,
  SECONDS_IN_YEAR_ACTUAL,
} from '@notional-finance/util';
import { AggregateCall } from '@notional-finance/multicall';
import { BigNumber, Contract } from 'ethers';

interface PendleMarketParams {
  totalSy: BigNumber;
  totalPt: TokenBalance;
  scalarRoot: BigNumber;
  lnImpliedRate: BigNumber;
  lnFeeRateRoot: BigNumber;
  expiry: number;
  PT: string;
  SY: string;
  syToAssetExchangeRate: BigNumber;
  assetTokenId: string;
}

const PENDLE_ROUTER = {
  [Network.mainnet]: '0x888888888889758F76e7103c6CbF23ABbF58F946',
  [Network.arbitrum]: '0x888888888889758F76e7103c6CbF23ABbF58F946',
  [Network.all]: '0x0000000000000000000000000000000000000000',
  [Network.optimism]: '0x0000000000000000000000000000000000000000',
};

export class PendleMarket extends BaseLiquidityPool<PendleMarketParams> {
  public static override getInitData(
    network: Network,
    marketAddress: string
  ): AggregateCall[] {
    const market = new Contract(
      marketAddress,
      PendleMarketABI,
      getProviderFromNetwork(network)
    ) as PendleMarketContract;

    return [
      {
        stage: 0,
        target: market,
        method: 'totalSupply',
        key: 'totalSupply',
        args: [],
        transform: (r: BigNumber) =>
          TokenBalance.toJSON(r, marketAddress, network),
      },
      {
        stage: 0,
        target: market,
        method: 'readTokens',
        key: 'tokens',
        args: [],
        transform: (
          r: Awaited<ReturnType<PendleMarketContract['readTokens']>>
        ) => ({
          SY: r._SY,
          PT: r._PT,
        }),
      },
      {
        stage: 1,
        target: market,
        method: 'readState',
        key: 'marketState',
        args: [PENDLE_ROUTER[network]],
        transform: (
          r: Awaited<ReturnType<PendleMarketContract['readState']>>,
          prevResults
        ) => ({
          totalSy: r.totalSy,
          totalPt: TokenBalance.toJSON(
            r.totalPt,
            (
              prevResults[`${marketAddress}.tokens`] as {
                SY: string;
                PT: string;
              }
            )['PT'],
            network
          ),
          scalarRoot: r.scalarRoot,
          lnImpliedRate: r.lastLnImpliedRate,
          lnFeeRateRoot: r.lnFeeRateRoot,
          expiry: r.expiry,
        }),
      },
      {
        stage: 1,
        target: (prevResults) =>
          new Contract(
            (
              prevResults[`${marketAddress}.tokens`] as {
                SY: string;
                PT: string;
              }
            )['SY'],
            PendleSYABI,
            getProviderFromNetwork(network)
          ),
        method: 'assetInfo',
        key: 'assetTokenId',
        args: [],
        transform: (r: Awaited<ReturnType<PendleSY['assetInfo']>>) =>
          r.assetAddress,
      },
      {
        stage: 1,
        target: (prevResults) =>
          new Contract(
            (
              prevResults[`${marketAddress}.tokens`] as {
                SY: string;
                PT: string;
              }
            )['SY'],
            PendleSYABI,
            getProviderFromNetwork(network)
          ),
        method: 'exchangeRate',
        key: 'syToAssetExchangeRate',
        args: [],
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

  public TOKEN_IN_INDEX = 0;
  public PT_TOKEN_INDEX = 1;

  get ptToken() {
    return this.poolParams.totalPt.token;
  }

  get timeToExpiry() {
    return this.poolParams.expiry - getNowSeconds();
  }

  get ptExchangeRate() {
    return this.getPreFeeExchangeRate(TokenBalance.zero(this.ptToken));
  }

  get assetTokenId() {
    return this.poolParams.assetTokenId;
  }

  get ptYieldToMaturity() {
    return this._getExchangeRateFromImpliedRate(
      this.poolParams.lnImpliedRate.toNumber(),
      this.timeToExpiry
    );
  }

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
      const initialTokensIn = TokenBalance.from(tokensIn.n, this.ptToken);
      const approxPTExchangeRate = Math.floor(
        this.ptExchangeRate * RATE_PRECISION
      );

      const { postFeeAssetToAccount, fee } = doSecantSearch(
        approxPTExchangeRate,
        RATE_PRECISION,
        (exRate: number) => {
          const { postFeeAssetToAccount, fee } =
            this.calculateTokenOutGivenPTIn(
              initialTokensIn.mulInRatePrecision(exRate)
            );

          return {
            fx: postFeeAssetToAccount.toFloat() - tokensIn.toFloat(),
            value: {
              postFeeAssetToAccount,
              fee,
            },
          };
        }
      );

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

  protected calculateTokenOutGivenPTIn(ptIn: TokenBalance) {
    const feeRate = this._getExchangeRateFromImpliedRate(
      this.poolParams.lnFeeRateRoot.toNumber(),
      this.timeToExpiry
    );
    const preFeeExchangeRate = this.getPreFeeExchangeRate(ptIn);
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

  protected getPreFeeExchangeRate(ptIn: TokenBalance) {
    const rateScalar =
      (this.poolParams.scalarRoot.toNumber() * SECONDS_IN_YEAR_ACTUAL) /
      this.timeToExpiry;

    const totalAsset = TokenBalance.fromID(
      this.poolParams.totalSy
        .mul(this.poolParams.syToAssetExchangeRate)
        .div(SCALAR_PRECISION),
      this.poolParams.assetTokenId,
      this._network
    );

    const rateAnchor = this.getRateAnchor(
      totalAsset,
      rateScalar,
      this.poolParams.lnImpliedRate.toNumber(),
      this.timeToExpiry
    );

    const preFeeExchangeRate = this._getExchangeRate(
      totalAsset,
      ptIn,
      rateScalar,
      rateAnchor
    );

    if (preFeeExchangeRate < 1) throw Error('Exchange rate below one');

    return preFeeExchangeRate;
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
