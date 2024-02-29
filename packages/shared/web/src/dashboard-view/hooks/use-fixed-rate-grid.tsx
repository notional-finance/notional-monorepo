import { formatNumberAsAbbr } from '@notional-finance/helpers';
import { useAllMarkets, useFiat } from '@notional-finance/notionable-hooks';
import { Network, PRODUCTS } from '@notional-finance/util';
import { defineMessage } from 'react-intl';
import { useHistory } from 'react-router';

export const useFixedRateGrid = (network: Network, product: PRODUCTS) => {
  const {
    yields: { fCashLend, fCashBorrow, liquidity },
  } = useAllMarkets(network);
  const history = useHistory();
  const baseCurrency = useFiat();
  const tokenObj = {};
  const yieldData = product === PRODUCTS.LEND_FIXED ? fCashLend : fCashBorrow;

  const apySubTitle =
    product === PRODUCTS.LEND_FIXED
      ? defineMessage({
          defaultMessage: `AS HIGH AS`,
          description: 'subtitle',
        })
      : defineMessage({
          defaultMessage: `AS LOW AS`,
          description: 'subtitle',
        });

  const allData = yieldData
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
        apySubTitle: apySubTitle,
        tvlNum: nTokenLiquidity?.tvl
          ? nTokenLiquidity.tvl.toFiat(baseCurrency).toNumber()
          : 0,
        apy: y.totalAPY,
        routeCallback: () =>
          history.push(`/${product}/${network}/${y.underlying.symbol}`),
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
