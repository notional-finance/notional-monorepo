import { formatNumberAsAbbr } from '@notional-finance/helpers';
import { useAllMarkets } from '@notional-finance/notionable-hooks';
import { Network, PRODUCTS } from '@notional-finance/util';
import { useHistory } from 'react-router';

export const useLendVariableDashboard = (network: Network) => {
  const {
    yields: { variableLend },
  } = useAllMarkets(network);
  const history = useHistory();

  const allData = variableLend
    .map((y) => {
      return {
        ...y,
        symbol: y.underlying.symbol,
        title: y.underlying.symbol,
        subTitle: `TVL: ${y.tvl ? formatNumberAsAbbr(y.tvl.toFloat(), 0) : 0}`,
        hasPosition: false,
        apy: y.totalAPY,
        routeCallback: () =>
          history.push(
            `/${PRODUCTS.LEND_VARIABLE}/${network}/${y.underlying.symbol}`
          ),
      };
    })
    .sort((a, b) => b.apy - a.apy);

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
