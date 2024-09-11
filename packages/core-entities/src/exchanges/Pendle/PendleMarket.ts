import { ERC20ABI } from '@notional-finance/contracts';
import { TokenBalance } from '../../token-balance';
import BaseLiquidityPool from '../base-liquidity-pool';
import { getProviderFromNetwork, Network } from '@notional-finance/util';
import { AggregateCall } from '@notional-finance/multicall';
import { BigNumber, Contract } from 'ethers';

interface PendleMarketParams {
  marketAddress: string;
  ptToken: string;
  tokenInSy: string;
  tokenOutSy: string;
  // Given Token In Amount, Returns PT Amount Out
  marketDepthTokenIn: {
    amountIn: TokenBalance;
    amountOut: TokenBalance;
    feesPaid: TokenBalance;
    slippage: number;
  }[];
  // Given PT Amount In, Returns Token Out Amount
  marketDepthTokenOut: {
    amountIn: TokenBalance;
    amountOut: TokenBalance;
    feesPaid: TokenBalance;
    slippage: number;
  }[];
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
    if (tokenIndexOut === this.PT_TOKEN_INDEX) {
      // Underlying token in, PT out. Search over marketDepthTokenIn to approximate the amount of PT out
      // and do a linear interpolation between the two nearest points.
      return this.interpolateMarketDepth(
        tokensIn,
        this.poolParams.marketDepthTokenIn
      );
    } else if (tokenIndexOut === this.TOKEN_IN_INDEX) {
      return this.interpolateMarketDepth(
        tokensIn,
        this.poolParams.marketDepthTokenOut
      );
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

  protected interpolateMarketDepth(
    tokensIn: TokenBalance,
    marketDepth: {
      amountIn: TokenBalance;
      amountOut: TokenBalance;
      feesPaid: TokenBalance;
      slippage: number;
    }[]
  ): { tokensOut: TokenBalance; feesPaid: TokenBalance[] } {
    const inputAmount = tokensIn.toFloat();

    if (inputAmount <= 0) {
      throw new Error('Input amount must be greater than zero');
    }

    // Sort the marketDepth array by amountIn in ascending order
    const sortedDepth = [...marketDepth].sort(
      (a, b) => a.amountIn.toFloat() - b.amountIn.toFloat()
    );

    // Check if input amount exceeds maximum depth
    if (inputAmount > sortedDepth[sortedDepth.length - 1].amountIn.toFloat()) {
      throw new Error(
        'Insufficient liquidity: Input amount exceeds maximum market depth'
      );
    }

    // Find the two nearest points for interpolation
    let lowerIndex = -1;
    for (let i = 0; i < sortedDepth.length; i++) {
      if (sortedDepth[i].amountIn.toFloat() > inputAmount) {
        break;
      }
      lowerIndex = i;
    }

    // Handle edge case
    if (lowerIndex === -1) {
      // Input amount is smaller than the smallest market depth point
      const ratio = inputAmount / sortedDepth[0].amountIn.toFloat();
      const interpolatedOutput = ratio * sortedDepth[0].amountOut.toFloat();
      const interpolatedFees = ratio * sortedDepth[0].feesPaid.toFloat();
      const outputWithSlippage =
        interpolatedOutput * (1 - sortedDepth[0].slippage);

      return {
        tokensOut: TokenBalance.fromFloat(
          outputWithSlippage,
          sortedDepth[0].amountOut.token
        ),
        feesPaid: [
          TokenBalance.fromFloat(
            interpolatedFees,
            sortedDepth[0].feesPaid.token
          ),
        ],
      };
    }

    // Perform linear interpolation between the two nearest points
    const lowerPoint = sortedDepth[lowerIndex];
    const upperPoint = sortedDepth[lowerIndex + 1];

    const lowerAmount = lowerPoint.amountIn.toFloat();
    const upperAmount = upperPoint.amountIn.toFloat();
    const ratio = (inputAmount - lowerAmount) / (upperAmount - lowerAmount);

    const interpolatedOutput =
      lowerPoint.amountOut.toFloat() +
      ratio * (upperPoint.amountOut.toFloat() - lowerPoint.amountOut.toFloat());

    const interpolatedFees =
      lowerPoint.feesPaid.toFloat() +
      ratio * (upperPoint.feesPaid.toFloat() - lowerPoint.feesPaid.toFloat());

    // Apply slippage (using the average slippage of the two points)
    const averageSlippage = (lowerPoint.slippage + upperPoint.slippage) / 2;
    const outputWithSlippage = interpolatedOutput * (1 - averageSlippage);

    return {
      tokensOut: TokenBalance.fromFloat(
        outputWithSlippage,
        lowerPoint.amountOut.token
      ),
      feesPaid: [
        TokenBalance.fromFloat(interpolatedFees, lowerPoint.feesPaid.token),
      ],
    };
  }
}
