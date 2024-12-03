import { formatNumberAsAbbr, getBoostedData } from '@notional-finance/helpers';
import { PRODUCTS } from '@notional-finance/util';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  useAppStore,
  useCurrentNetworkStore,
  useWalletStore,
} from '@notional-finance/notionable-hooks';
import { ProductAPY } from '@notional-finance/core-entities';
import { checkBoostEndDate } from '@notional-finance/notionable/global/account/communities';

export const useVariableRateGrid = (product: PRODUCTS) => {
  const { pathname } = useLocation();
  const isBorrow = pathname.includes('borrow');
  const currentNetworkStore = useCurrentNetworkStore();
  const network = currentNetworkStore.network;
  const { isStarterBoostUser } = useWalletStore();
  let yieldData: ProductAPY[] = [];
  if (product === PRODUCTS.LEND_VARIABLE) {
    yieldData = currentNetworkStore.getAllPrimeCashYields();
  } else if (product === PRODUCTS.BORROW_VARIABLE) {
    yieldData = currentNetworkStore.getAllPrimeCashDebt();
  }
  const validBoostDate = checkBoostEndDate();

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
        apy: apy.totalAPY || 0,
        tvlNum: tvl ? tvl.toFiat(baseCurrency).toFloat() : 0,
        routeCallback: () =>
          navigate(`/${product}/${network}/${underlying?.symbol}`),
      };
    })
    .sort((a, b) => b.tvlNum - a.tvlNum);

  const { newUserBoostedData, nonBoostedData } = getBoostedData(allData);

  const gridData =
    isStarterBoostUser && !isBorrow && validBoostDate
      ? [
          {
            sectionTitle: 'STARTER BOOST',
            data: newUserBoostedData,
            hasBoost: true,
          },
          {
            sectionTitle: 'NO BOOST',
            data: nonBoostedData,
            hasLeveragedPosition: false,
          },
        ]
      : [
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
