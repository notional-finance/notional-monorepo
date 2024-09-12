import { useState } from 'react';
import { defineMessage, FormattedMessage } from 'react-intl';
import { Network, PRODUCTS } from '@notional-finance/util';
import { formatNumberAsAbbr } from '@notional-finance/helpers';
import { getIncentiveSymbols, sumAndFormatIncentives } from './utils';
import { DashboardGridProps, DashboardDataProps } from '@notional-finance/mui';
import { useNavigate } from 'react-router-dom';
import { useLeveragedNTokenPositions } from '@notional-finance/trade';
import { Box, useTheme } from '@mui/material';
import { LeafIcon } from '@notional-finance/icons';
import { useAppStore } from '@notional-finance/notionable-hooks';
import { useLeveragedNTokens } from './use-network-tokens';

export const useLiquidityLeveragedGrid = (
  network: Network | undefined
): DashboardGridProps => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { baseCurrency } = useAppStore();
  const { nTokenPositions } = useLeveragedNTokenPositions(network);
  const [showNegativeYields, setShowNegativeYields] = useState(false);
  const [hasNegativeApy, setHasNegativeApy] = useState(false);
  const yieldData = useLeveragedNTokens();

  const allData = yieldData
    .map(({ token, apy, tvl, underlying, debtToken }) => {
      const currentPosition = nTokenPositions?.find(
        (n) => n.asset.balance.underlying.symbol === underlying?.symbol
      );

      return {
        symbol: underlying?.symbol || '',
        title: underlying?.symbol || '',
        subTitle: `Liquidity: ${
          tvl
            ? formatNumberAsAbbr(
                tvl.toFiat(baseCurrency).toFloat(),
                0,
                baseCurrency
              )
            : 0
        }`,
        network: token.network,
        hasPosition: currentPosition ? true : false,
        tvlNum: tvl ? tvl.toFiat(baseCurrency).toFloat() : 0,
        apySubTitle: currentPosition
          ? defineMessage({
              defaultMessage: `Current APY`,
              description: 'subtitle',
            })
          : defineMessage({
              defaultMessage: `AS HIGH AS`,
              description: 'subtitle',
            }),
        bottomLeftValue:
          apy?.incentives?.length === 0 ? (
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
        incentiveValue:
          apy?.incentives && apy?.incentives?.length > 0
            ? sumAndFormatIncentives(apy.incentives)
            : '',
        incentiveSymbols:
          apy?.incentives && apy?.incentives?.length > 0
            ? getIncentiveSymbols(apy.incentives)
            : undefined,
        apy: apy.totalAPY,
        routeCallback: () =>
          navigate(
            currentPosition
              ? `/${PRODUCTS.LIQUIDITY_LEVERAGED}/${network}/IncreaseLeveragedNToken/${underlying?.symbol}`
              : `/${PRODUCTS.LIQUIDITY_LEVERAGED}/${network}/CreateLeveragedNToken/${underlying?.symbol}?borrowOption=${debtToken?.id}`
          ),
      };
    })
    .sort((a, b) => b.tvlNum - a.tvlNum);

  const defaultLeveragedLiquidityData = allData.filter(
    ({ hasPosition }) => !hasPosition
  ) as DashboardDataProps[];
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
      data: userPositions as DashboardDataProps[],
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
