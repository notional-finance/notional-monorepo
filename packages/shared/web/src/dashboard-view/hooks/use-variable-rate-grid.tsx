import { Box, useTheme } from '@mui/material';
import {
  getArbBoosts,
  getNetworkModel,
  getPointsAPY,
} from '@notional-finance/core-entities';
import { formatNumberAsAbbr } from '@notional-finance/helpers';
import { LeafIcon, PointsIcon } from '@notional-finance/icons';
import {
  useAppStore,
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

  const theme = useTheme();
  const navigate = useNavigate();
  const { baseCurrency } = useAppStore();
  const totalArbPoints = useTotalArbPoints();
  const currentSeason = useCurrentSeason();
  const isBorrow = product === PRODUCTS.BORROW_VARIABLE;

  const allData = yieldData
    .map(({ token, apy, liquidity, tvl, underlying }) => {
      const pointsBoost = getArbBoosts(token, isBorrow);
      const pointsAPY =
        pointsBoost > 0
          ? getPointsAPY(
              pointsBoost,
              totalArbPoints[currentSeason.db_name],
              currentSeason.totalArb,
              currentSeason.startDate,
              currentSeason.endDate
            )
          : 0;

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
        network: token.network,
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
