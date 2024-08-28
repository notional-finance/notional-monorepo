import { useState } from 'react';
import { defineMessage, FormattedMessage } from 'react-intl';
import { Network, PRODUCTS } from '@notional-finance/util';
// import { useAllMarkets, useFiat } from '@notional-finance/notionable-hooks';
import { formatNumberAsAbbr } from '@notional-finance/helpers';
import { getTotalIncentiveApy, getTotalIncentiveSymbol } from './utils';
import { DashboardGridProps, DashboardDataProps } from '@notional-finance/mui';
import { useNavigate } from 'react-router-dom';
import {
  useLeveragedNTokenPositions,
  useMaxYield,
} from '@notional-finance/trade';
import { Box, useTheme } from '@mui/material';
import { LeafIcon } from '@notional-finance/icons';
import { useAppStore } from '@notional-finance/notionable-hooks';

export const useLiquidityLeveragedGrid = (
  network: Network | undefined
): DashboardGridProps => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { baseCurrency } = useAppStore();
  const { nTokenPositions } = useLeveragedNTokenPositions(network);
  const [showNegativeYields, setShowNegativeYields] = useState(false);
  const [hasNegativeApy, setHasNegativeApy] = useState(false);
  const allMaxAPYs = useMaxYield(network);

  const allData = allMaxAPYs
    .map((y) => {
      const currentPosition = nTokenPositions?.find(
        (n) => n.asset.balance.underlying.symbol === y.underlying.symbol
      );

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
        network: y.token.network,
        hasPosition: currentPosition ? true : false,
        tvlNum: y.tvl ? y.tvl.toFiat(baseCurrency).toFloat() : 0,
        apySubTitle: currentPosition
          ? undefined
          : defineMessage({
              defaultMessage: `MAX APY`,
              description: 'subtitle',
            }),
        bottomLeftValue:
          getTotalIncentiveApy(
            y.noteIncentives?.incentiveAPY,
            y.secondaryIncentives?.incentiveAPY
          ) === undefined ? (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <LeafIcon
                fill={theme.palette.typography.main}
                sx={{
                  marginRight: theme.spacing(1),
                  height: theme.spacing(1.75),
                  width: theme.spacing(1.75),
                }}
              />
              <FormattedMessage defaultMessage={'Organic APY'} />
            </Box>
          ) : (
            ''
          ),
        incentiveValue: currentPosition
          ? getTotalIncentiveApy(
              y.noteIncentives?.incentiveAPY,
              y.secondaryIncentives?.incentiveAPY
            )
          : getTotalIncentiveApy(
              y?.noteIncentives?.incentiveAPY,
              y?.secondaryIncentives?.incentiveAPY
            ),
        incentiveSymbols: currentPosition
          ? getTotalIncentiveSymbol(
              y.secondaryIncentives?.incentiveAPY &&
                y.secondaryIncentives?.incentiveAPY > 0
                ? y.secondaryIncentives?.symbol
                : undefined,
              y.noteIncentives?.incentiveAPY &&
                y.noteIncentives?.incentiveAPY > 0
                ? y.noteIncentives?.symbol
                : undefined
            )
          : getTotalIncentiveSymbol(
              y.secondaryIncentives?.incentiveAPY &&
                y.secondaryIncentives?.incentiveAPY > 0
                ? y.secondaryIncentives?.symbol
                : undefined,
              y.noteIncentives?.incentiveAPY &&
                y.noteIncentives?.incentiveAPY > 0
                ? y.noteIncentives?.symbol
                : undefined
            ),
        apy:
          currentPosition && currentPosition.totalLeveragedApy
            ? currentPosition.totalLeveragedApy
            : allMaxAPYs.find((m) => m.token.currencyId === y.token.currencyId)
                ?.totalAPY || 0,
        routeCallback: () =>
          navigate(
            currentPosition
              ? `/${PRODUCTS.LIQUIDITY_LEVERAGED}/${network}/IncreaseLeveragedNToken/${y.underlying.symbol}`
              : `/${PRODUCTS.LIQUIDITY_LEVERAGED}/${network}/CreateLeveragedNToken/${y.underlying.symbol}?borrowOption=${y?.leveraged?.debtToken?.id}`
          ),
      };
    })
    .sort((a, b) => b.tvlNum - a.tvlNum);

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

  const gridData = [
    {
      sectionTitle: userPositions.length > 0 ? 'opportunities' : '',
      data: negativeApyCheck(defaultLeveragedLiquidityData),
      hasLeveragedPosition: false,
    },
  ];

  if (userPositions.length > 0) {
    gridData.unshift({
      sectionTitle:
        userPositions.length === 1 ? 'Your position' : 'Your positions',
      data: userPositions,
      hasLeveragedPosition: true,
    });
  }

  const showNegativeYieldsToggle = defaultLeveragedLiquidityData.find(
    ({ apy }) => apy < 0
  );

  const levLiquidityData = allData && allData.length > 0 ? gridData : [];

  return {
    gridData: levLiquidityData,
    setShowNegativeYields: showNegativeYieldsToggle
      ? setShowNegativeYields
      : undefined,
    showNegativeYields: hasNegativeApy ? showNegativeYields : undefined,
  };
};

export default useLiquidityLeveragedGrid;
