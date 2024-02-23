import { formatNumberAsAbbr } from '@notional-finance/helpers';
import { useAllMarkets } from '@notional-finance/notionable-hooks';
import { Network, PRODUCTS } from '@notional-finance/util';
import { defineMessage } from 'react-intl';
import { useHistory } from 'react-router';

export const useLendFixedDashboard = (network: Network) => {
  const {
    yields: { fCashLend },
  } = useAllMarkets(network);
  const history = useHistory();
  const tokenObj = {};

  const allData = fCashLend
    .map((y) => {
      return {
        ...y,
        symbol: y.underlying.symbol,
        title: y.underlying.symbol,
        subTitle: `TVL: ${y.tvl ? formatNumberAsAbbr(y.tvl.toFloat(), 0) : 0}`,
        hasPosition: false,
        apySubTitle: defineMessage({
          defaultMessage: `AS HIGH AS`,
          description: 'subtitle',
        }),
        apy: y.totalAPY,
        routeCallback: () =>
          history.push(
            `/${PRODUCTS.LEND_FIXED}/${network}/${y.underlying.symbol}`
          ),
      };
    })
    .sort((a, b) => b.apy - a.apy)
    .filter((data) => {
      if (!tokenObj[data.symbol]) {
        tokenObj[data.symbol] = true;
        return data;
      } else {
        return null;
      }
    });

  const productData = [
    {
      sectionTitle: '',
      data: allData,
      hasLeveragedPosition: false,
    },
  ];

  return {
    productData: allData.length > 0 ? productData : [],
    setShowNegativeYields: undefined,
    showNegativeYields: undefined,
  };
};
