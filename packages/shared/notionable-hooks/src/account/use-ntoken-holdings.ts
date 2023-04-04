import { NTokenValue } from '@notional-finance/sdk/src/system';
import { convertRateToFloat } from '@notional-finance/helpers';
import { useAccount } from './use-account';

export function useNTokenHoldings() {
  const { balanceSummary } = useAccount();
  return Array.from(balanceSummary.values())
    .filter((v) => v.nTokenBalance !== undefined && !v.nTokenBalance.isZero())
    .map((b) => {
      return {
        currencyId: b.currencyId,
        nTokenSymbol: b.nTokenSymbol,
        assetSymbol: b.symbol,
        underlyingSymbol: b.underlyingSymbol,
        balance: b.nTokenBalance,
        presentValue: b.nTokenValueUnderlying,
        organicYield: convertRateToFloat(
          NTokenValue.getNTokenBlendedYield(b.currencyId)
        ),
        noteIncentiveYield: convertRateToFloat(
          NTokenValue.getNTokenIncentiveYield(b.currencyId)
        ),
        hashKey: b.hashKey,
      };
    });
}
