import { formatNumberAsAbbr } from '@notional-finance/helpers';
import { useAppStore } from '@notional-finance/notionable';
import { getIncentiveSymbols, sumAndFormatIncentives } from './utils';
import { Network, PRODUCTS } from '@notional-finance/util';
import { useNavigate } from 'react-router-dom';
import { Box, useTheme } from '@mui/material';
import { LeafIcon } from '@notional-finance/icons';
import { FormattedMessage } from 'react-intl';
import { useNetworkTokens } from './use-network-tokens';

export const useLiquidityVariableGrid = (network: Network | undefined) => {
  const theme = useTheme();
  const { baseCurrency } = useAppStore();
  const navigate = useNavigate();
  const yieldData = useNetworkTokens(network, 'nToken');
  const allData = yieldData
    .map(({ token, apy, tvl, underlying }) => {
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
        hasPosition: false,
        tvlNum: tvl ? tvl.toFiat(baseCurrency).toFloat() : 0,
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
          apy.incentives && apy?.incentives?.length > 0
            ? sumAndFormatIncentives(apy.incentives)
            : '',
        incentiveSymbols:
          apy.incentives && apy?.incentives?.length > 0
            ? getIncentiveSymbols(apy?.incentives)
            : undefined,
        apy: apy.totalAPY || 0,
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
