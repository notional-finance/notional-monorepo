import { formatNumberAsAbbr } from '@notional-finance/helpers';
import { useAllMarkets, useFiat } from '@notional-finance/notionable-hooks';
import { getTotalIncentiveApy, getTotalIncentiveSymbol } from './utils';
import { Network, PRODUCTS } from '@notional-finance/util';
import { useHistory } from 'react-router';

export const useLiquidityVariableGrid = (network: Network) => {
  const {
    yields: { liquidity },
  } = useAllMarkets(network);
  const baseCurrency = useFiat();
  const history = useHistory();

  const allData = liquidity
    .map((y) => {
      return {
        ...y,
        symbol: y.underlying.symbol,
        title: y.underlying.symbol,
        subTitle: `Liquidity: ${
          y.tvl
            ? formatNumberAsAbbr(
                y.tvl.toFiat(baseCurrency).toFloat(),
                0,
                baseCurrency
              )
            : 0
        }`,
        hasPosition: false,
        tvlNum: y.tvl ? y.tvl.toFiat(baseCurrency).toFloat() : 0,
        bottomValue: ``,
        incentiveValue: getTotalIncentiveApy(
          y?.noteIncentives?.incentiveAPY,
          y?.secondaryIncentives?.incentiveAPY
        ),
        incentiveSymbols: getTotalIncentiveSymbol(
          y?.secondaryIncentives?.symbol,
          y?.noteIncentives?.symbol
        ),
        apy: y.totalAPY,
        routeCallback: () =>
          history.push(
            `/${PRODUCTS.LIQUIDITY_VARIABLE}/${network}/${y.underlying.symbol}`
          ),
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
