import { FormattedMessage } from 'react-intl';
import {
  PieChartIcon,
  BarChartIcon,
  BarChartLateralIcon,
  // BarCharLightningIcon,
  VaultIcon,
  CoinsIcon,
  CoinsCircleIcon,
} from '@notional-finance/icons';
import { useTheme } from '@mui/material';
import {
  useHeadlineRates,
  useSelectedNetwork,
} from '@notional-finance/notionable-hooks';
import { formatNumberAsPercent } from '@notional-finance/helpers';

export const useEmptyPortfolioOverview = () => {
  const theme = useTheme();
  const network = useSelectedNetwork();
  const {
    fCashLend,
    variableLend,
    leveragedVaults,
    liquidity,
    fCashBorrow,
    variableBorrow,
    // leveragedLend,
    leveragedLiquidity,
  } = useHeadlineRates(network);

  const earnYieldData = [
    {
      title: <FormattedMessage defaultMessage={'Fixed Rate Lending'} />,
      link: `/lend-fixed/${network}`,
      apy: `${formatNumberAsPercent(fCashLend?.totalAPY || 0)}`,
      symbol: fCashLend?.underlying.symbol,
      icon: (
        <BarChartLateralIcon
          sx={{
            fontSize: theme.spacing(3),
            fill: theme.palette.common.black,
          }}
        />
      ),
    },
    // {
    //   title: <FormattedMessage defaultMessage={'Leveraged Lend'} />,
    //   link: '/lend-leveraged',
    //   apy: `${formatNumberAsPercent(leveragedLend?.totalAPY || 0)}`,
    //   symbol: leveragedVaults?.underlying.symbol,
    //   icon: (
    //     <BarCharLightningIcon
    //       sx={{
    //         fontSize: theme.spacing(3),
    //         fill: theme.palette.common.black,
    //       }}
    //     />
    //   ),
    // },
    {
      title: <FormattedMessage defaultMessage={'Provide Liquidity'} />,
      link: `/liquidity-variable/${network}`,
      apy: `${formatNumberAsPercent(liquidity?.totalAPY || 0)}`,
      symbol: liquidity?.underlying.symbol,
      icon: (
        <PieChartIcon
          sx={{
            fontSize: theme.spacing(3),
            stroke: 'transparent',
            fill: theme.palette.common.black,
          }}
        />
      ),
    },
    {
      title: <FormattedMessage defaultMessage={'Leveraged Vaults'} />,
      link: `/leveraged-yield-farming/${network}`,
      apy: `${formatNumberAsPercent(leveragedVaults?.totalAPY || 0)}`,
      symbol: leveragedVaults?.underlying.symbol,
      icon: (
        <VaultIcon
          sx={{
            fontSize: theme.spacing(3),
            fill: theme.palette.common.black,
          }}
        />
      ),
    },
    {
      title: <FormattedMessage defaultMessage={'Variable Rate Lending'} />,
      link: `/lend-variable/${network}`,
      apy: `${formatNumberAsPercent(variableLend?.totalAPY || 0)}`,
      symbol: variableLend?.underlying.symbol,
      icon: (
        <BarChartIcon
          sx={{
            fontSize: theme.spacing(3),
            fill: theme.palette.common.black,
          }}
        />
      ),
    },
    {
      title: <FormattedMessage defaultMessage={'Leveraged Liquidity'} />,
      link: `/liquidity-leveraged/${network}`,
      apy: `${formatNumberAsPercent(leveragedLiquidity?.totalAPY || 0)}`,
      symbol: liquidity?.underlying.symbol,
      icon: (
        <PieChartIcon
          sx={{
            fontSize: theme.spacing(3),
            stroke: 'transparent',
            fill: theme.palette.common.black,
          }}
        />
      ),
    },
  ];

  const borrowData = [
    {
      title: <FormattedMessage defaultMessage={'Fixed Borrow'} />,
      link: `/borrow-fixed/${network}`,
      apy: `${formatNumberAsPercent(fCashBorrow?.totalAPY || 0)}`,
      symbol: fCashBorrow?.underlying.symbol,
      icon: (
        <CoinsIcon
          sx={{
            fontSize: theme.spacing(3),
            fill: 'transparent',
            stroke: theme.palette.common.black,
          }}
        />
      ),
    },
    {
      title: <FormattedMessage defaultMessage={'Variable Borrow'} />,
      link: `/borrow-variable/${network}`,
      apy: `${formatNumberAsPercent(variableBorrow?.totalAPY || 0)}`,
      symbol: variableBorrow?.underlying.symbol,
      icon: (
        <CoinsCircleIcon
          sx={{
            fontSize: theme.spacing(3),
            fill: theme.palette.common.black,
            stroke: 'transparent',
          }}
        />
      ),
    },
  ];
  return { earnYieldData, borrowData };
};

export default useEmptyPortfolioOverview;
