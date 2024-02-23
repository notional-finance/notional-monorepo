import { formatNumberAsAbbr } from '@notional-finance/helpers';
import { useAllMarkets, useFiat } from '@notional-finance/notionable-hooks';
import { getTotalIncentiveApy, getTotalIncentiveSymbol } from './utils';
import { defineMessage } from 'react-intl';
import { Network, PRODUCTS } from '@notional-finance/util';
import { useHistory } from 'react-router';

export const useLiquidityVariableDashboard = (network: Network) => {
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
        subTitle: `TVL: ${
          y.tvl
            ? formatNumberAsAbbr(
                y.tvl.toFiat(baseCurrency).toFloat(),
                0,
                baseCurrency
              )
            : 0
        }`,
        hasPosition: false,
        apySubTitle: defineMessage({
          defaultMessage: `AS HIGH AS`,
          description: 'subtitle',
        }),
        tvlNum: y.tvl ? y.tvl.toFloat() : 0,
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
