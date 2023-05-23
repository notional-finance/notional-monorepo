import { useAssetSummary } from '@notional-finance/notionable-hooks';
import { LEND_BORROW } from '@notional-finance/shared-config';
import { MaturityData } from '@notional-finance/notionable';
import { formatMaturity } from '@notional-finance/helpers';

export function useManageMaturities(borrowOrLend: LEND_BORROW) {
  const assetSummary = useAssetSummary(borrowOrLend);
  let rollMaturities = [];
  const formatMaturities = (maturities) => {
    return maturities.map((data) => ({
      marketKey: data.marketKey,
      maturity: formatMaturity(data.maturity),
      tradeRateString: data.tradeRateString,
      rollMaturityRoute: data.rollMaturityRoute,
    }));
  };

  assetSummary.forEach((data) => {
    if (data?.rollMaturities?.length) {
      rollMaturities = formatMaturities(data.rollMaturities);
    }
  });

  return rollMaturities as MaturityData[];
}
