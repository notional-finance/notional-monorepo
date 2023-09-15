import { useAssetSummary } from '@notional-finance/notionable-hooks';
import { LEND_BORROW } from '@notional-finance/shared-config';
import { formatMaturity } from '@notional-finance/helpers';

export function useManageMaturities(
  borrowOrLend: LEND_BORROW,
  assetKey: string
) {
  const assetSummary = useAssetSummary(borrowOrLend);
  const formatMaturities = (maturities) => {
    return maturities.map((data) => ({
      marketKey: data.marketKey,
      maturity: formatMaturity(data.maturity),
      tradeRateString: data.tradeRateString,
      rollMaturityRoute: data.rollMaturityRoute,
    }));
  };

  return formatMaturities(
    assetSummary.find((data) => data.assetKey === assetKey)?.rollMaturities ||
      []
  );
}
