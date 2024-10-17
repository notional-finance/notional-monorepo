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
import { BigNumber, Contract, utils } from 'ethers';
import { Registry } from '../../Registry';

interface PendleMarketParams {
  marketState: {
    totalSy: BigNumber;
    totalPt: TokenBalance;
    scalarRoot: BigNumber;
    lnImpliedRate: BigNumber;
    lnFeeRateRoot: BigNumber;
    expiry: BigNumber;
  };
  tokens: {
    PT: string;
    SY: string;
  };
  syToAssetExchangeRate: BigNumber;
  assetTokenId: string;
}

const PENDLE_ROUTER = {
  [Network.mainnet]: '0x888888888889758F76e7103c6CbF23ABbF58F946',
  [Network.arbitrum]: '0x888888888889758F76e7103c6CbF23ABbF58F946',
  [Network.all]: '0x0000000000000000000000000000000000000000',
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
    return this.poolParams.marketState.totalPt.token;
  }

  get timeToExpiry() {
    const now = getNowSeconds();
    return this.poolParams.marketState.expiry.toNumber() > now
      ? this.poolParams.marketState.expiry.toNumber() - now
      : 0;
  }

  get ptExchangeRate() {
    return this.timeToExpiry === 0
      ? 1
      : this.getPreFeeExchangeRate(TokenBalance.zero(this.ptToken));
  }

  get assetTokenId() {
    return this.poolParams.assetTokenId;
  }

  get ptSpotYieldToMaturity() {
    return this.timeToExpiry === 0
      ? 0
      : (100 * Math.log(this.ptExchangeRate) * SECONDS_IN_YEAR_ACTUAL) /
          this.timeToExpiry;
  }

  public convertAssetToSy(assetAmount: TokenBalance) {
    return TokenBalance.fromID(
      assetAmount.n
        .mul(SCALAR_PRECISION)
        .div(this.poolParams.syToAssetExchangeRate),
      this.poolParams.tokens.SY.toLowerCase(),
      this._network
    );
  }

  public convertSyToAsset(syAmount: TokenBalance) {
    return TokenBalance.fromID(
      syAmount.n
        .mul(this.poolParams.syToAssetExchangeRate)
        .div(SCALAR_PRECISION),
      this.poolParams.assetTokenId,
      this._network
    );
  }

  protected calculateTokenTradeOnExpiry(
    tokensIn: TokenBalance,
    tokenIndexOut: number
  ) {
    const assetToken = Registry.getTokenRegistry().getTokenByID(
      this._network,
      this.poolParams.assetTokenId
    );

    if (tokenIndexOut === this.TOKEN_IN_INDEX) {
      // PT token in, Asset out, at expiration this is 1-1
      const assetTokensOut = TokenBalance.fromFloat(
        tokensIn.toFloat(),
        assetToken
      );
      const syTokensOut = this.convertAssetToSy(assetTokensOut);

      return {
        tokensOut: this.convertAssetToSy(assetTokensOut),
        feesPaid: [
          TokenBalance.zero(syTokensOut.token),
          TokenBalance.zero(this.ptToken),
        ],
      };
    } else if (tokenIndexOut === this.PT_TOKEN_INDEX) {
      // Sy Token In, PT out. At expiration this is 1-1 with the asset token
      const assetTokensIn = this.convertSyToAsset(tokensIn);
      const ptTokensOut = TokenBalance.fromFloat(
        assetTokensIn.toFloat(),
        this.ptToken
      );

      return {
        tokensOut: ptTokensOut,
        feesPaid: [
          TokenBalance.zero(tokensIn.token),
          TokenBalance.zero(this.ptToken),
        ],
      };
    } else {
      throw new Error('Invalid token index');
    }
  }

  public override calculateTokenTrade(
    tokensIn: TokenBalance,
    tokenIndexOut: number,
    _balanceOverrides?: TokenBalance[]
  ): { tokensOut: TokenBalance; feesPaid: TokenBalance[] } {
    if (this.timeToExpiry === 0) {
      return this.calculateTokenTradeOnExpiry(tokensIn, tokenIndexOut);
    }

    if (tokenIndexOut === this.TOKEN_IN_INDEX) {
      // PT in, Asset out, convert to SY on the return
      const { postFeeAssetToAccount, fee } = this.calculateTokenOutGivenPTIn(
        tokensIn.neg()
      );

      return {
        tokensOut: this.convertAssetToSy(postFeeAssetToAccount),
        feesPaid: [this.convertAssetToSy(fee), TokenBalance.zero(this.ptToken)],
      };
    } else if (tokenIndexOut === this.PT_TOKEN_INDEX) {
      const assetTokensIn = this.convertSyToAsset(tokensIn);
      // Assume PT in at the current exchange rate, then do secant search until
      // we find the postFeeAssetToAccount that is close to tokensIn
      const initialTokensIn = TokenBalance.fromFloat(
        assetTokensIn.toFloat(),
        this.ptToken
      );
      const approxPTExchangeRate = Math.floor(
        this.ptExchangeRate * RATE_PRECISION
      );

      const { netPtToAccount, fee } = doSecantSearch(
        Math.floor(approxPTExchangeRate / 2),
        approxPTExchangeRate,
        (exRate: number) => {
          const netPtToAccount = initialTokensIn.mulInRatePrecision(exRate);
          const { postFeeAssetToAccount, fee } =
            this.calculateTokenOutGivenPTIn(netPtToAccount);

          return {
            fx: Math.floor(
              (postFeeAssetToAccount.abs().toFloat() -
                assetTokensIn.toFloat()) *
                RATE_PRECISION
            ),
            value: {
              netPtToAccount,
              fee,
            },
          };
        }
      );

      return {
        tokensOut: netPtToAccount,
        feesPaid: [this.convertAssetToSy(fee), TokenBalance.zero(this.ptToken)],
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

  protected calculateTokenOutGivenPTIn(netPtToAccount: TokenBalance) {
    const feeRate = this._getExchangeRateFromImpliedRate(
      this.poolParams.marketState.lnFeeRateRoot,
      this.timeToExpiry
    );
    const preFeeExchangeRate = this.getPreFeeExchangeRate(netPtToAccount);
    const preFeeAssetToAccount = TokenBalance.fromID(
      netPtToAccount
        .neg()
        .divInRatePrecision(Math.floor(preFeeExchangeRate * RATE_PRECISION)).n,
      this.poolParams.assetTokenId,
      this._network
    );

    let fee: TokenBalance;
    if (netPtToAccount.isPositive()) {
      fee = preFeeAssetToAccount.mulInRatePrecision(
        Math.floor((1 - feeRate) * RATE_PRECISION)
      );
    } else {
      fee = preFeeAssetToAccount
        .neg() // ensures that the fee is positive
        .scale(
          Math.floor((1 - feeRate) * RATE_PRECISION),
          Math.floor(feeRate * RATE_PRECISION)
        );
    }

    const postFeeAssetToAccount = preFeeAssetToAccount.sub(fee);

    // This is in asset terms, not SY terms.
    return {
      postFeeAssetToAccount,
      fee,
    };
  }

  protected getPreFeeExchangeRate(netPtToAccount: TokenBalance) {
    const rateScalar = parseFloat(
      utils.formatUnits(
        this.poolParams.marketState.scalarRoot
          .mul(SECONDS_IN_YEAR_ACTUAL)
          .div(this.timeToExpiry),
        18
      )
    );

    const totalAsset = this.convertSyToAsset(
      TokenBalance.fromID(
        this.poolParams.marketState.totalSy,
        this.poolParams.tokens.SY,
        this._network
      )
    );

    const rateAnchor = this.getRateAnchor(
      totalAsset,
      rateScalar,
      this.poolParams.marketState.lnImpliedRate,
      this.timeToExpiry
    );

    const preFeeExchangeRate = this._getExchangeRate(
      totalAsset,
      netPtToAccount,
      rateScalar,
      rateAnchor
    );

    if (preFeeExchangeRate < 1) throw Error('Exchange rate below one');

    return preFeeExchangeRate;
  }

  protected getRateAnchor(
    totalAsset: TokenBalance,
    rateScalar: number,
    lnImpliedRate: BigNumber,
    timeToExpiry: number
  ) {
    const newExchangeRate = this._getExchangeRateFromImpliedRate(
      lnImpliedRate,
      timeToExpiry
    );
    const proportion =
      this.poolParams.marketState.totalPt.toFloat() /
      (this.poolParams.marketState.totalPt.toFloat() + totalAsset.toFloat());
    const lnProportion = Math.log(proportion / (1 - proportion));

    return newExchangeRate - lnProportion / rateScalar;
  }

  protected _getExchangeRate(
    totalAsset: TokenBalance,
    netPtToAccount: TokenBalance,
    rateScalar: number,
    rateAnchor: number
  ) {
    const numerator = this.poolParams.marketState.totalPt
      .sub(netPtToAccount)
      .toFloat();
    const proportion =
      numerator /
      (this.poolParams.marketState.totalPt.toFloat() + totalAsset.toFloat());

    if (numerator <= 0 || proportion > 0.96)
      throw Error('Insufficient liquidity');

    const lnProportion = Math.log(proportion / (1 - proportion));

    const exchangeRate = lnProportion / rateScalar + rateAnchor;

    if (exchangeRate < 1) throw Error('Exchange rate below one');

    return exchangeRate;
  }

  protected _getExchangeRateFromImpliedRate(
    lnImpliedRate: BigNumber,
    timeToExpiry: number
  ) {
    // E = e^rt
    const r = parseFloat(utils.formatUnits(lnImpliedRate, 18));
    const rt = (r * timeToExpiry) / SECONDS_IN_YEAR_ACTUAL;
    return Math.exp(rt);
  }
}
