import { PRODUCTS } from '@notional-finance/util';
import {
  PieChartIcon,
  CoinsIcon,
  CoinsCircleIcon,
  BarChartIcon,
  BarChartLateralIcon,
  VaultIcon,
  PointsIcon,
  PendleIcon,
} from '@notional-finance/icons';
import { useLocation } from 'react-router-dom';
import { useTheme } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { useSelectedNetwork } from '@notional-finance/notionable-hooks';

export enum NAV_OPTIONS {
  EARN_YIELD = 'earn_yield',
  LEVERAGED_YIELD = 'leveraged_yield',
  BORROW = 'borrow',
}

export const useCardMobileNav = () => {
  const theme = useTheme();
  const { pathname } = useLocation();
  const selectedNetwork = useSelectedNetwork();
  const category = pathname.split('/')[1];

  const visibleOptions = [
    {
      title: <FormattedMessage defaultMessage={'Fixed Lending'} />,
      id: PRODUCTS.LEND_FIXED,
      to: `/${PRODUCTS.LEND_FIXED}/${selectedNetwork}`,
      Icon: (
        <BarChartLateralIcon
          sx={{
            width: theme.spacing(3),
            fill: PRODUCTS.LEND_FIXED.includes(category)
              ? theme.palette.typography.contrastText
              : theme.palette.typography.main,
          }}
        />
      ),
    },
    {
      title: <FormattedMessage defaultMessage={'Lend Variable'} />,
      id: PRODUCTS.LEND_VARIABLE,
      to: `/${PRODUCTS.LEND_VARIABLE}/${selectedNetwork}`,
      Icon: (
        <BarChartIcon
          sx={{
            width: theme.spacing(3),
            fill: PRODUCTS.LEND_VARIABLE.includes(category)
              ? theme.palette.typography.contrastText
              : theme.palette.typography.main,
          }}
        />
      ),
    },
    {
      title: <FormattedMessage defaultMessage={'Provide Liquidity'} />,
      id: PRODUCTS.LIQUIDITY_VARIABLE,
      to: `/${PRODUCTS.LIQUIDITY_VARIABLE}/${selectedNetwork}`,
      Icon: (
        <PieChartIcon
          sx={{
            width: theme.spacing(3),
            fill: PRODUCTS.LIQUIDITY_VARIABLE.includes(category)
              ? theme.palette.typography.contrastText
              : theme.palette.typography.main,
            stroke: 'transparent',
          }}
        />
      ),
    },
  ];

  const earnOptions = [
    {
      title: <FormattedMessage defaultMessage={'Fixed Lending'} />,
      id: PRODUCTS.LEND_FIXED,
      to: `/${PRODUCTS.LEND_FIXED}/${selectedNetwork}`,
      Icon: (
        <BarChartLateralIcon
          sx={{
            width: theme.spacing(2),
            fill: theme.palette.typography.main,
          }}
        />
      ),
    },
    {
      title: <FormattedMessage defaultMessage={'Lend Variable'} />,
      id: PRODUCTS.LEND_VARIABLE,
      to: `/${PRODUCTS.LEND_VARIABLE}/${selectedNetwork}`,
      Icon: (
        <BarChartIcon
          sx={{
            width: theme.spacing(2),
            fill: theme.palette.typography.main,
          }}
        />
      ),
    },
    {
      title: <FormattedMessage defaultMessage={'Provide Liquidity'} />,
      id: PRODUCTS.LIQUIDITY_VARIABLE,
      to: `/${PRODUCTS.LIQUIDITY_VARIABLE}/${selectedNetwork}`,
      Icon: (
        <PieChartIcon
          sx={{
            width: theme.spacing(2),
            fill: theme.palette.typography.main,
            stroke: 'transparent',
          }}
        />
      ),
    },
  ];

  const leveragedOptions = [
    {
      title: <FormattedMessage defaultMessage={'Leveraged Liquidity'} />,
      id: PRODUCTS.LIQUIDITY_LEVERAGED,
      to: `/${PRODUCTS.LIQUIDITY_LEVERAGED}/${selectedNetwork}`,
      Icon: (
        <PieChartIcon
          sx={{
            width: theme.spacing(2),
            fill: theme.palette.typography.main,
            stroke: 'transparent',
          }}
        />
      ),
    },
    {
      title: <FormattedMessage defaultMessage={'Leveraged Yield Farming'} />,
      id: PRODUCTS.LEVERAGED_YIELD_FARMING,
      to: `/${PRODUCTS.LEVERAGED_YIELD_FARMING}/${selectedNetwork}`,
      Icon: (
        <VaultIcon
          sx={{
            width: theme.spacing(2),
            fill: theme.palette.typography.main,
          }}
        />
      ),
    },
    {
      title: <FormattedMessage defaultMessage={'Leveraged Points Farming'} />,
      id: PRODUCTS.LEVERAGED_POINTS_FARMING,
      to: `/${PRODUCTS.LEVERAGED_POINTS_FARMING}/${selectedNetwork}`,
      Icon: (
        <PointsIcon
          fill={theme.palette.typography.main}
          sx={{ width: theme.spacing(2) }}
        />
      ),
    },
    {
      title: <FormattedMessage defaultMessage={'Leveraged Pendle'} />,
      id: PRODUCTS.LEVERAGED_PENDLE,
      to: `/${PRODUCTS.LEVERAGED_PENDLE}/${selectedNetwork}`,
      Icon: (
        <PendleIcon
          stroke={theme.palette.typography.main}
          sx={{
            width: theme.spacing(2),
            fill: 'transparent',
          }}
        />
      ),
    },
  ];

  const borrowOptions = [
    {
      title: <FormattedMessage defaultMessage={'Borrow Fixed'} />,
      id: PRODUCTS.BORROW_FIXED,
      to: `/borrow-fixed/${selectedNetwork}`,
      Icon: (
        <CoinsIcon
          sx={{
            width: theme.spacing(2),
            stroke: theme.palette.typography.main,
            fill: 'transparent',
          }}
        />
      ),
    },
    {
      title: <FormattedMessage defaultMessage={'Borrow Variable'} />,
      id: PRODUCTS.BORROW_VARIABLE,
      to: `/borrow-variable/${selectedNetwork}`,
      Icon: (
        <CoinsCircleIcon
          sx={{
            width: theme.spacing(2),
            fill: theme.palette.typography.main,
            stroke: 'transparent',
          }}
        />
      ),
    },
  ];

  return {
    visibleOptions,
    earnOptions,
    leveragedOptions,
    borrowOptions,
  };
};

export default useCardMobileNav;
