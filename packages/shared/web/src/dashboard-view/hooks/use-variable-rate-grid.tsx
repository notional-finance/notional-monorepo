import { formatNumberAsAbbr } from '@notional-finance/helpers';
import { useAppStore } from '@notional-finance/notionable-hooks';
import { Network, PRODUCTS } from '@notional-finance/util';
import { useNavigate } from 'react-router-dom';
import { useNetworkTokens } from './use-network-tokens';

export const useVariableRateGrid = (
  network: Network | undefined,
  product: PRODUCTS
) => {
  const isBorrow = product === PRODUCTS.BORROW_VARIABLE;
  const tokenType = isBorrow ? 'PrimeDebt' : 'PrimeCash';
  const yieldData = useNetworkTokens(network, tokenType, { isBorrow });

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
