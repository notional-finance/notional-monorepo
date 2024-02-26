import { formatNumberAsAbbr } from '@notional-finance/helpers';
import { useAllMarkets, useFiat } from '@notional-finance/notionable-hooks';
import { Network, PRODUCTS } from '@notional-finance/util';
import { defineMessage } from 'react-intl';
import { useHistory } from 'react-router';

export const useLendFixedDashboard = (network: Network) => {
  const {
    yields: { fCashLend, liquidity },
  } = useAllMarkets(network);
  const history = useHistory();
  const baseCurrency = useFiat();
  const tokenObj = {};

  const allData = fCashLend
    .map((y) => {
      const nTokenLiquidity = liquidity.find(
        (x) => x.underlying.symbol === y.underlying.symbol
      );
      return {
        ...y,
        symbol: y.underlying.symbol,
        title: y.underlying.symbol,
        subTitle: `Liquidity: ${
          nTokenLiquidity && nTokenLiquidity.tvl
            ? formatNumberAsAbbr(
                nTokenLiquidity?.tvl.toFiat(baseCurrency).toFloat(),
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
        apy: y.totalAPY,
        tvlNum: nTokenLiquidity?.tvl
          ? nTokenLiquidity.tvl.toFiat(baseCurrency).toNumber()
          : 0,
        routeCallback: () =>
          history.push(
            `/${PRODUCTS.LEND_FIXED}/${network}/${y.underlying.symbol}`
          ),
      };
    })
    .sort((a, b) => b.tvlNum - a.tvlNum)
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