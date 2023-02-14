import { FormattedMessage } from 'react-intl';
import { Market } from '@notional-finance/sdk/src/system';

export const useTradeSummaryChart = (
  currency: string | null,
  markets: Market[]
) => {
  let marketData;

  if (markets && markets.length && currency) {
    marketData = markets
      .map((market) => {
        return {
          timestamp: market.maturity,
          area: parseFloat(
            market.midRate.substring(0, market.midRate.length - 1)
          ),
          marketKey: market.marketKey,
        };
      })
      .filter((v) => !Number.isNaN(v[currency]));
  }

  const areaHeaderData = {
    leftHeader: <FormattedMessage defaultMessage={'Performance To Date'} />,
    legendOne: undefined,
    legendTwo: undefined,
  };

  return { marketData, areaHeaderData };
};
