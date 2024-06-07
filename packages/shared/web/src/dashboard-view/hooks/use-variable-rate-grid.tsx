import { Box, useTheme } from '@mui/material';
import { getArbBoosts } from '@notional-finance/core-entities';
import { formatNumberAsAbbr } from '@notional-finance/helpers';
import { LeafIcon, PointsIcon } from '@notional-finance/icons';
import { useAllMarkets, useFiat } from '@notional-finance/notionable-hooks';
import { Network, PRODUCTS } from '@notional-finance/util';
import { FormattedMessage } from 'react-intl';
import { useHistory } from 'react-router';

export const useVariableRateGrid = (network: Network, product: PRODUCTS) => {
  const {
    yields: { variableLend, variableBorrow },
  } = useAllMarkets(network);
  const theme = useTheme();
  const history = useHistory();
  const baseCurrency = useFiat();
  const isBorrow = product === PRODUCTS.BORROW_VARIABLE;
  const yieldData = isBorrow ? variableBorrow : variableLend;

  const allData = yieldData
    .map((y) => {
      const pointsBoost = getArbBoosts(y.token, isBorrow);

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
          pointsBoost > 0 ? (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <PointsIcon
                sx={{
                  marginRight: theme.spacing(1),
                  height: theme.spacing(1.75),
                  width: theme.spacing(1.75),
                }}
              />
              {`${pointsBoost}x ARB POINTS`}
            </Box>
          ) : (
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
          ),
        network: y.token.network,
        hasPosition: false,
        apy: y.totalAPY,
        tvlNum: y.liquidity ? y.liquidity.toFiat(baseCurrency).toFloat() : 0,
        routeCallback: () =>
          history.push(`/${product}/${network}/${y.underlying.symbol}`),
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
