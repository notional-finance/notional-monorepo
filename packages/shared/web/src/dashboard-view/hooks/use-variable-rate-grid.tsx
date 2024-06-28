import { formatNumberAsAbbr } from '@notional-finance/helpers';
import {
  useAllMarkets,
  useUserSettings,
} from '@notional-finance/notionable-hooks';
import { Network, PRODUCTS } from '@notional-finance/util';
import { useHistory } from 'react-router';

export const useVariableRateGrid = (network: Network, product: PRODUCTS) => {
  const {
    yields: { variableLend, variableBorrow },
  } = useAllMarkets(network);
  const history = useHistory();
  const { baseCurrency } = useUserSettings();
  const yieldData =
    product === PRODUCTS.LEND_VARIABLE ? variableLend : variableBorrow;

  const allData = yieldData
    .map((y) => {
      return {
        ...y,
        symbol: y.underlying.symbol,
        title: y.underlying.symbol,
        subTitle: `Liquidity: ${
          y.liquidity
            ? formatNumberAsAbbr(
                y.liquidity.toFiat(baseCurrency).toFloat(),
                0,
                baseCurrency
              )
            : 0
        }`,
        network: y.token.network,
        hasPosition: false,
        apy: y.totalAPY,
        tvlNum: y.liquidity ? y.liquidity.toFiat(baseCurrency).toFloat() : 0,
        routeCallback: () =>
          history.push(`/${product}/${network}/${y.underlying.symbol}`),
      };
    })
    .sort((a, b) => b.tvlNum - a.tvlNum);

  const gridData = [
    {
      sectionTitle: '',
      data: allData,
      hasLeveragedPosition: false,
    },
  ];

  return {
    gridData: allData.length > 0 ? gridData : [],
    setShowNegativeYields: undefined,
    showNegativeYields: undefined,
  };
};
