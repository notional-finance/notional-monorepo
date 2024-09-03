import { getNetworkModel } from '@notional-finance/core-entities';
import { formatNumberAsAbbr } from '@notional-finance/helpers';
import { useAppStore } from '@notional-finance/notionable-hooks';
import { Network, PRODUCTS } from '@notional-finance/util';
import { useNavigate } from 'react-router-dom';

export const useVariableRateGrid = (
  network: Network | undefined,
  product: PRODUCTS
) => {
  // TODO: this can be put into a hook?
  const model = getNetworkModel(network);
  const yieldData = model.getTokensByType('PrimeCash').map((t) => ({
    token: t,
    apy: model.getSpotAPY(t.id),
    tvl: model.getTVL(t),
    liquidity: model.getLiquidity(t),
    underlying: t.underlying ? model.getTokenByID(t.underlying) : undefined,
  }));
  // TODO: this is inside a hook above....

  const navigate = useNavigate();
  const { baseCurrency } = useAppStore();

  const allData = yieldData
    .map(({ apy, liquidity, tvl, underlying }) => {
      return {
        symbol: underlying?.symbol || '',
        title: underlying?.symbol || '',
        subTitle: `Liquidity: ${
          liquidity
            ? formatNumberAsAbbr(
                liquidity.toFiat(baseCurrency).toFloat(),
                0,
                baseCurrency
              )
            : 0
        }`,
        bottomLeftValue: undefined,
        network,
        hasPosition: false,
        apy: apy.totalAPY,
        tvlNum: tvl ? tvl.toFiat(baseCurrency).toFloat() : 0,
        routeCallback: () =>
          navigate(`/${product}/${network}/${underlying?.symbol}`),
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
