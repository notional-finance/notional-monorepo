import { Box, useTheme } from '@mui/material';
import { getArbBoosts, getPointsAPY } from '@notional-finance/core-entities';
import { formatNumberAsAbbr } from '@notional-finance/helpers';
import { LeafIcon, PointsIcon } from '@notional-finance/icons';
import { useAppState } from '@notional-finance/notionable';
import {
  useAllMarkets,
  useCurrentSeason,
  useTotalArbPoints,
} from '@notional-finance/notionable-hooks';
import {
  formatNumberAsPercent,
  Network,
  PRODUCTS,
} from '@notional-finance/util';
import { FormattedMessage } from 'react-intl';
import { useNavigate } from 'react-router-dom';

export const useVariableRateGrid = (
  network: Network | undefined,
  product: PRODUCTS
) => {
  const {
    yields: { variableLend, variableBorrow },
  } = useAllMarkets(network);
  const theme = useTheme();
  const navigate = useNavigate();
  const { baseCurrency } = useAppState();
  const totalArbPoints = useTotalArbPoints();
  const currentSeason = useCurrentSeason();
  const isBorrow = product === PRODUCTS.BORROW_VARIABLE;
  const yieldData = isBorrow ? variableBorrow : variableLend;

  const allData = yieldData
    .map((y) => {
      const pointsBoost = getArbBoosts(y.token, isBorrow);
      const pointsAPY = getPointsAPY(
        pointsBoost,
        totalArbPoints[currentSeason.db_name],
        currentSeason.totalArb,
        currentSeason.startDate,
        currentSeason.endDate
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
          pointsBoost > 0 && network === Network.arbitrum ? (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <PointsIcon
                sx={{
                  marginRight: theme.spacing(1),
                  height: theme.spacing(1.75),
                  width: theme.spacing(1.75),
                }}
              />
              {`${pointsBoost}x ARB POINTS`}
              <Box sx={{ marginLeft: theme.spacing(0.5) }}>
                {pointsAPY !== Infinity &&
                  `(+${formatNumberAsPercent(pointsAPY, 2)} APY)`}
              </Box>
            </Box>
          ) : !isBorrow && network === Network.arbitrum ? (
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
          ) : network === Network.arbitrum ? (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
              }}
            />
          ) : undefined,
        network: y.token.network,
        hasPosition: false,
        apy: y.totalAPY,
        tvlNum: y.liquidity ? y.liquidity.toFiat(baseCurrency).toFloat() : 0,
        routeCallback: () =>
          navigate(`/${product}/${network}/${y.underlying.symbol}`),
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
