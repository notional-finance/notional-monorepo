import { useState } from 'react';
import { Network } from '@notional-finance/util';
import { useAllMarkets } from '@notional-finance/notionable-hooks';
import { formatNumberAsAbbr } from '@notional-finance/helpers';
import {
  LeveragedDashboardProps,
  DashboardDataProps,
} from '@notional-finance/mui';
import { useHistory } from 'react-router';
import {
  useLeveragedNTokenPositions,
  useMaxYield,
} from '@notional-finance/trade';

export const useLiquidityLeveragedDashboard = (
  network: Network
): LeveragedDashboardProps => {
  const {
    yields: { leveragedLiquidity },
  } = useAllMarkets(network);
  const history = useHistory();
  const { depositTokensWithPositions } = useLeveragedNTokenPositions(network);
  const [showNegativeYields, setShowNegativeYields] = useState(false);
  const [hasNegativeApy, setHasNegativeApy] = useState(false);
  const allMaxAPYs = useMaxYield(network);

  console.log(depositTokensWithPositions);

  const allData = leveragedLiquidity
    .filter((y) => y.leveraged?.debtToken.tokenType === 'PrimeDebt')
    .map((y) => {
      return {
        ...y,
        symbol: y.underlying.symbol,
        title: y.underlying.symbol,
        hasPosition: depositTokensWithPositions.includes(y.underlying.symbol),
        tvl: `TVL: ${y.tvl ? formatNumberAsAbbr(y.tvl.toFloat(), 0) : 0}`,
        apy:
          allMaxAPYs.find((m) => m.token.currencyId === y.token.currencyId)
            ?.totalAPY || 0,
        routeCallback: () =>
          history.push(
            depositTokensWithPositions.includes(y.underlying.symbol)
              ? `/liquidity-leveraged/${network}/IncreaseLeveragedNToken/${y.underlying.symbol}`
              : `/liquidity-leveraged/${network}/CreateLeveragedNToken/${y.underlying.symbol}`
          ),
      };
    })
    .sort((a, b) => b.apy - a.apy);

  const defaultLeveragedLiquidityData = allData.filter(
    ({ hasPosition }) => !hasPosition
  );
  const userPositions = allData.filter(({ hasPosition }) => hasPosition);

  const negativeApyCheck = (data: DashboardDataProps[]) => {
    if (!showNegativeYields) {
      return data.filter(({ apy }) => {
        if (apy < 0 && !hasNegativeApy) {
          setHasNegativeApy(true);
        }
        return apy > 0;
      });
    } else {
      return data;
    }
  };

  const productData = [
    {
      sectionTitle: '',
      data: negativeApyCheck(defaultLeveragedLiquidityData),
      hasLeveragedPosition: false,
    },
  ];

  if (userPositions.length > 0) {
    productData.unshift({
      sectionTitle:
        userPositions.length === 1 ? 'Your position' : 'Your positions',
      data: userPositions,
      hasLeveragedPosition: true,
    });
  }

  const levLiquidityData = allData && allData.length > 0 ? productData : [];

  return {
    productData: levLiquidityData,
    setShowNegativeYields: hasNegativeApy ? setShowNegativeYields : undefined,
    showNegativeYields: hasNegativeApy ? showNegativeYields : undefined,
  };
};

export default useLiquidityLeveragedDashboard;
