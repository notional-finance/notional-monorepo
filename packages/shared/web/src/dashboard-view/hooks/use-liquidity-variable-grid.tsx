import { formatNumberAsAbbr } from '@notional-finance/helpers';
import { useAppStore } from '@notional-finance/notionable-hooks';
// import { getTotalIncentiveApy, getTotalIncentiveSymbol } from './utils';
import { Network, PRODUCTS } from '@notional-finance/util';
import { useNavigate } from 'react-router-dom';
// import { Box, useTheme } from '@mui/material';
// import { LeafIcon } from '@notional-finance/icons';
// import { FormattedMessage } from 'react-intl';
import { useNetworkTokens } from './use-network-tokens';

export const useLiquidityVariableGrid = (network: Network | undefined) => {
  // const theme = useTheme();
  const { baseCurrency } = useAppStore();
  const navigate = useNavigate();
  const testData = useNetworkTokens(network, 'nToken');

  console.log('testData', testData);

  const allData = testData
    .map(({ token, apy, tvl, underlying }) => {
      return {
        symbol: underlying?.symbol,
        title: underlying?.symbol,
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
        hasPosition: false,
        tvlNum: tvl ? tvl.toFiat(baseCurrency).toFloat() : 0,
        bottomLeftValue: '',
        // bottomLeftValue:
        //   getTotalIncentiveApy(
        //     y?.noteIncentives?.incentiveAPY,
        //     y?.secondaryIncentives?.incentiveAPY
        //   ) === undefined ? (
        //     <Box sx={{ display: 'flex', alignItems: 'center' }}>
        //       <LeafIcon
        //         fill={theme.palette.typography.main}
        //         sx={{
        //           marginRight: theme.spacing(1),
        //           height: theme.spacing(1.75),
        //           width: theme.spacing(1.75),
        //         }}
        //       />
        //       <FormattedMessage defaultMessage={'Organic APY'} />
        //     </Box>
        //   ) : (
        //     ''
        //   ),
        incentiveValue: '',
        incentiveSymbols: '',
        // incentiveValue: getTotalIncentiveApy(
        //   y?.noteIncentives?.incentiveAPY,
        //   y?.secondaryIncentives?.incentiveAPY
        // ),
        // incentiveSymbols: getTotalIncentiveSymbol(
        //   y?.secondaryIncentives?.incentiveAPY &&
        //     y?.secondaryIncentives?.incentiveAPY > 0
        //     ? y?.secondaryIncentives?.symbol
        //     : undefined,
        //   y?.noteIncentives?.incentiveAPY && y?.noteIncentives?.incentiveAPY > 0
        //     ? y?.noteIncentives?.symbol
        //     : undefined
        // ),
        apy: apy.totalAPY,
        routeCallback: () =>
          navigate(
            `/${PRODUCTS.LIQUIDITY_VARIABLE}/${network}/${underlying?.symbol}`
          ),
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
