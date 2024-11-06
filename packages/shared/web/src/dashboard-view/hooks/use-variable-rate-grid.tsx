import {
  checkStarterBoostToken,
  formatNumberAsAbbr,
  getBoostedData,
} from '@notional-finance/helpers';
import {
  useAppState,
  useAllMarkets,
  useNotionalContext,
} from '@notional-finance/notionable-hooks';
import {
  formatNumberAsPercent,
  Network,
  PRODUCTS,
} from '@notional-finance/util';
import { useNavigate } from 'react-router-dom';

export const useVariableRateGrid = (
  network: Network | undefined,
  product: PRODUCTS
) => {
  const {
    yields: { variableLend, variableBorrow },
  } = useAllMarkets(network);
  const navigate = useNavigate();
  const { baseCurrency } = useAppState();
  const isBorrow = product === PRODUCTS.BORROW_VARIABLE;
  const yieldData = isBorrow ? variableBorrow : variableLend;
  const {
    globalState: { isStarterBoostUser },
  } = useNotionalContext();

  const allData = yieldData
    .map((y) => {
      const isStarterBoost = checkStarterBoostToken(
        y.underlying.symbol,
        isStarterBoostUser
      );
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
        bottomLeftValue:
          isStarterBoost && !isBorrow
            ? `starter boost: ${formatNumberAsPercent(y.totalAPY + 5)} APY`
            : '',
        network: y.token.network,
        hasPosition: false,
        apy: y.totalAPY,
        tvlNum: y.liquidity ? y.liquidity.toFiat(baseCurrency).toFloat() : 0,
        routeCallback: () =>
          navigate(`/${product}/${network}/${y.underlying.symbol}`),
      };
    })
    .sort((a, b) => b.tvlNum - a.tvlNum);

  const { newUserBoostedData, nonBoostedData } = getBoostedData(allData);

  const gridData =
    isStarterBoostUser && !isBorrow
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
