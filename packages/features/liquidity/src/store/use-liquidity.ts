import { convertRateToFloat } from '@notional-finance/utils';
import { useCurrencyData, useNotional } from '@notional-finance/notionable-hooks';
import { useObservableState } from 'observable-hooks';
import { initialLiquidityState, liquidityState$ } from './liquidity-store';
import { NTokenValue } from '@notional-finance/sdk/src/system';
import { TypedBigNumber } from '@notional-finance/sdk';
import { TradePropertyKeys } from '@notional-finance/trade';
import { RATE_PRECISION } from '@notional-finance/sdk/src/config/constants';

export function useLiquidity() {
  const { loaded } = useNotional();
  const { selectedToken, inputAmount, hasError } = useObservableState(
    liquidityState$,
    initialLiquidityState
  );
  const { id: currencyId, nTokenSymbol } = useCurrencyData(selectedToken);
  const blendedYield = currencyId ? NTokenValue.getNTokenBlendedYield(currencyId) : 0;
  const incentiveYield = currencyId ? NTokenValue.getNTokenIncentiveYield(currencyId) : 0;
  const totalYield = blendedYield + incentiveYield;
  let nTokensMinted = nTokenSymbol ? TypedBigNumber.fromBalance(0, nTokenSymbol, true) : undefined;
  let nTokenShare = 0;

  if (currencyId && nTokenSymbol && inputAmount) {
    nTokensMinted = NTokenValue.getNTokensToMint(currencyId, inputAmount.toAssetCash(true));
    const { totalSupply } = NTokenValue.getNTokenFactors(currencyId);
    nTokenShare =
      convertRateToFloat(nTokensMinted?.scale(RATE_PRECISION, totalSupply.n).toNumber()) || 0;
  }

  const tradeProperties = {
    [TradePropertyKeys.nTokensMinted]: nTokensMinted,
    [TradePropertyKeys.nTokenShare]: nTokenShare,
  };

  const canSubmit = !!inputAmount && inputAmount.isPositive() && hasError === false;

  return {
    inputAmount,
    blendedYield: convertRateToFloat(blendedYield),
    totalYield: convertRateToFloat(totalYield),
    incentiveYield: convertRateToFloat(incentiveYield),
    selectedToken,
    nTokensMinted,
    loading: !loaded,
    canSubmit,
    nTokenSymbol,
    tradeProperties,
  };
}
