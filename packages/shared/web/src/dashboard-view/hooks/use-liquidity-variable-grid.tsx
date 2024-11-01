import {
  checkStarterBoostToken,
  formatNumberAsAbbr,
  getBoostedData,
} from '@notional-finance/helpers';
import {
  useAllMarkets,
  useAppState,
  useNotionalContext,
} from '@notional-finance/notionable-hooks';
import { getTotalIncentiveApy, getTotalIncentiveSymbol } from './utils';
import {
  formatNumberAsPercent,
  Network,
  PRODUCTS,
} from '@notional-finance/util';
import { useNavigate } from 'react-router-dom';
import { Box, useTheme } from '@mui/material';
import { LeafIcon } from '@notional-finance/icons';
import { defineMessage, FormattedMessage } from 'react-intl';

export const useLiquidityVariableGrid = (network: Network | undefined) => {
  const {
    yields: { liquidity },
  } = useAllMarkets(network);
  const {
    globalState: { isStarterBoostUser },
  } = useNotionalContext();
  const theme = useTheme();
  const { baseCurrency } = useAppState();
  const navigate = useNavigate();

  const allData = liquidity
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
          y.tvl
            ? formatNumberAsAbbr(
                y.tvl.toFiat(baseCurrency).toFloat(),
                0,
                baseCurrency
              )
            : 0
        }`,
        network: y.token.network,
        hasPosition: false,
        tvlNum: y.tvl ? y.tvl.toFiat(baseCurrency).toFloat() : 0,
        bottomLeftValue:
          getTotalIncentiveApy(
            y?.noteIncentives?.incentiveAPY,
            y?.secondaryIncentives?.incentiveAPY
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
        apySubTitle: isStarterBoost
          ? defineMessage({
              defaultMessage: `starter boost: {boostApy}% APY`,
              description: 'subtitle',
              values: {
                boostApy: formatNumberAsPercent(y.totalAPY + 5),
              },
            })
          : undefined,
        incentiveValue: getTotalIncentiveApy(
          y?.noteIncentives?.incentiveAPY,
          y?.secondaryIncentives?.incentiveAPY
        ),
        incentiveSymbols: getTotalIncentiveSymbol(
          y?.secondaryIncentives?.incentiveAPY &&
            y?.secondaryIncentives?.incentiveAPY > 0
            ? y?.secondaryIncentives?.symbol
            : undefined,
          y?.noteIncentives?.incentiveAPY && y?.noteIncentives?.incentiveAPY > 0
            ? y?.noteIncentives?.symbol
            : undefined
        ),
        apy: y.totalAPY,
        routeCallback: () =>
          navigate(
            `/${PRODUCTS.LIQUIDITY_VARIABLE}/${network}/${y.underlying.symbol}`
          ),
      };
    })
    .sort((a, b) => b.tvlNum - a.tvlNum);

  const { newUserBoostedData, nonBoostedData } = getBoostedData(allData);

  const gridData = isStarterBoostUser
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
