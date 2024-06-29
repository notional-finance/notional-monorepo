import { formatNumberAsAbbr } from '@notional-finance/helpers';
import { useAllMarkets, useFiat } from '@notional-finance/notionable-hooks';
import { getArbBoosts } from '@notional-finance/core-entities';
import { Network, PRODUCTS } from '@notional-finance/util';
import { FormattedMessage, defineMessage } from 'react-intl';
import { useHistory } from 'react-router';
import { Box, useTheme } from '@mui/material';
import { LeafIcon, PointsIcon } from '@notional-finance/icons';

export const useFixedRateGrid = (network: Network, product: PRODUCTS) => {
  const {
    yields: { fCashLend, fCashBorrow },
  } = useAllMarkets(network);
  const theme = useTheme();
  const history = useHistory();
  const baseCurrency = useFiat();
  const tokenObj = {};
  const isBorrow = product === PRODUCTS.BORROW_FIXED;
  const yieldData = isBorrow ? fCashBorrow : fCashLend;

  const apySubTitle =
    product === PRODUCTS.LEND_FIXED
      ? defineMessage({
          defaultMessage: `AS HIGH AS`,
          description: 'subtitle',
        })
      : defineMessage({
          defaultMessage: `AS LOW AS`,
          description: 'subtitle',
        });

  const allData = yieldData.map((y) => {
    const pointsBoost = getArbBoosts(y.token, isBorrow);

    return {
      ...y,
      symbol: y.underlying.symbol,
      title: y.underlying.symbol,
      subTitle: `Liquidity: ${formatNumberAsAbbr(
        y?.liquidity?.toFiat(baseCurrency).toFloat() || 0,
        0,
        baseCurrency
      )}`,
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
      apySubTitle: apySubTitle,
      tvlNum: y?.liquidity ? y.liquidity.toFiat(baseCurrency).toNumber() : 0,
      apy: y.totalAPY,
      routeCallback: () =>
        history.push(`/${product}/${network}/${y.underlying.symbol}`),
    };
  });

  const sortGridData = (isBorrow, allData) => {
    if (isBorrow) {
      return allData
        .sort((a, b) => a.apy - b.apy)
        .filter((data) => {
          if (!tokenObj[data.symbol]) {
            tokenObj[data.symbol] = true;
            return data;
          } else {
            return null;
          }
        })
        .sort((a, b) => b.tvlNum - a.tvlNum);
    } else {
      return allData
        .sort((a, b) => b.apy - a.apy)
        .filter((data) => {
          if (!tokenObj[data.symbol]) {
            tokenObj[data.symbol] = true;
            return data;
          } else {
            return null;
          }
        })
        .sort((a, b) => b.tvlNum - a.tvlNum);
    }
  };

  const sortedData = sortGridData(isBorrow, allData);

  const gridData = [
    {
      sectionTitle: '',
      data: sortedData,
      hasLeveragedPosition: false,
    },
  ];

  return {
    gridData: sortedData.length > 0 ? gridData : [],
    setShowNegativeYields: undefined,
    showNegativeYields: undefined,
  };
};
