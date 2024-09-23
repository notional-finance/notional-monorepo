import { formatNumberAsAbbr } from '@notional-finance/helpers';
import { Network, PRODUCTS } from '@notional-finance/util';
import { defineMessage } from 'react-intl';
import { useNavigate } from 'react-router-dom';

import {
  useAppStore,
  useCurrentNetworkStore,
} from '@notional-finance/notionable';

export const useFixedRateGrid = (
  network: Network | undefined,
  product: PRODUCTS
) => {
  const navigate = useNavigate();
  const { baseCurrency } = useAppStore();
  const tokenObj = {};
  const isBorrow = product === PRODUCTS.BORROW_FIXED;
  const currentNetworkStore = useCurrentNetworkStore();

  let yieldData: any[] = [];
  if (product === PRODUCTS.LEND_FIXED) {
    yieldData = currentNetworkStore.getAllFCashYields();
  } else if (product === PRODUCTS.BORROW_FIXED) {
    yieldData = currentNetworkStore.getAllFCashDebt();
  }

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

  const allData = yieldData.map(({ token, apy, tvl, underlying }) => {
    return {
      symbol: underlying?.symbol,
      title: underlying?.symbol,
      subTitle: `Liquidity: ${formatNumberAsAbbr(
        tvl?.toFiat(baseCurrency).toFloat() || 0,
        0,
        baseCurrency
      )}`,
      bottomLeftValue: undefined,
      // pointsBoost > 0 && network === Network.arbitrum ? (
      //   <Box sx={{ display: 'flex', alignItems: 'center' }}>
      //     <PointsIcon
      //       sx={{
      //         marginRight: theme.spacing(1),
      //         height: theme.spacing(1.75),
      //         width: theme.spacing(1.75),
      //       }}
      //     />
      //     {`${pointsBoost}x ARB POINTS `}
      //     <Box sx={{ marginLeft: theme.spacing(0.5) }}>
      //       {pointsAPY !== Infinity &&
      //         `(+${formatNumberAsPercent(pointsAPY, 2)} APY)`}
      //     </Box>
      //   </Box>
      // ) : !isBorrow && network === Network.arbitrum ? (
      //   <Box sx={{ display: 'flex', alignItems: 'center' }}>
      //     <LeafIcon
      //       fill={theme.palette.typography.main}
      //       sx={{
      //         marginRight: theme.spacing(1),
      //         height: theme.spacing(1.75),
      //         width: theme.spacing(1.75),
      //       }}
      //     />
      //     <FormattedMessage defaultMessage={'Organic APY'} />
      //   </Box>
      // ) : network === Network.arbitrum ? (
      //   <Box
      //     sx={{
      //       display: 'flex',
      //       alignItems: 'center',
      //     }}
      //   />
      // ) : undefined,
      network: token.network,
      hasPosition: false,
      apySubTitle: apySubTitle,
      tvlNum: tvl ? tvl.toFiat(baseCurrency).toNumber() : 0,
      apy: apy.totalAPY || 0,
      routeCallback: () =>
        navigate(`/${product}/${network}/${underlying?.symbol}`),
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
