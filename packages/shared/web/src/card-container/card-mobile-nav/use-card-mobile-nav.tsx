import { CARD_CATEGORIES } from '@notional-finance/util';
import {
  PieChartIcon,
  CoinsIcon,
  CoinsCircleIcon,
  BarChartIcon,
  BarChartLateralIcon,
  VaultIcon,
} from '@notional-finance/icons';
import { useLocation } from 'react-router-dom';
import { useTheme } from '@mui/material';
import { FormattedMessage } from 'react-intl';

export enum NAV_OPTIONS {
  EARN_YIELD = 'earn_yield',
  LEVERAGED_YIELD = 'leveraged_yield',
  BORROW = 'borrow',
}

const earnYield = ['lend-fixed', 'lend-variable', 'provide'];
const leveragedYield = ['vaults', 'liquidity-leveraged'];
const borrow = ['borrow-fixed', 'borrow-variable'];

export const useCardMobileNav = () => {
  const theme = useTheme();
  const { pathname } = useLocation();
  const category = pathname.split('/')[1];

  let defaultOptionSet = NAV_OPTIONS.EARN_YIELD;

  if (earnYield.includes(category)) {
    defaultOptionSet = NAV_OPTIONS.EARN_YIELD;
  } else if (leveragedYield.includes(category)) {
    defaultOptionSet = NAV_OPTIONS.LEVERAGED_YIELD;
  } else if (borrow.includes(category)) {
    defaultOptionSet = NAV_OPTIONS.BORROW;
  } else {
    defaultOptionSet = NAV_OPTIONS.EARN_YIELD;
  }

  const earnYieldOptions = [
    {
      title: <FormattedMessage defaultMessage={'Fixed Lending'} />,
      id: CARD_CATEGORIES.LEND_FIXED,
      to: `/lend-fixed`,
      Icon: (
        <BarChartLateralIcon
          sx={{
            width: theme.spacing(2),
            fill: CARD_CATEGORIES.LEND_FIXED.includes(category)
              ? theme.palette.typography.main
              : theme.palette.typography.light,
          }}
        />
      ),
    },
    {
      title: <FormattedMessage defaultMessage={'Lend Variable'} />,
      id: CARD_CATEGORIES.LEND_VARIABLE,
      to: `/lend-variable`,
      Icon: (
        <BarChartIcon
          sx={{
            width: theme.spacing(2),
            fill: CARD_CATEGORIES.LEND_VARIABLE.includes(category)
              ? theme.palette.typography.main
              : theme.palette.typography.light,
          }}
        />
      ),
    },
    {
      title: <FormattedMessage defaultMessage={'Provide Liquidity'} />,
      id: CARD_CATEGORIES.PROVIDE_LIQUIDITY,
      to: `/liquidity-variable`,
      Icon: (
        <PieChartIcon
          sx={{
            width: theme.spacing(2),
            fill: CARD_CATEGORIES.PROVIDE_LIQUIDITY.includes(category)
              ? theme.palette.typography.main
              : theme.palette.typography.light,
            stroke: 'transparent',
          }}
        />
      ),
    },
  ];

  const leveragedYieldOptions = [
    {
      title: <FormattedMessage defaultMessage={'Leveraged Vaults'} />,
      id: CARD_CATEGORIES.LEVERAGED_VAULTS,
      to: `/vaults`,
      Icon: (
        <VaultIcon
          sx={{
            width: theme.spacing(2),
            fill: CARD_CATEGORIES.LEVERAGED_VAULTS.includes(category)
              ? theme.palette.typography.main
              : theme.palette.typography.light,
          }}
        />
      ),
    },
    {
      title: <FormattedMessage defaultMessage={'Leveraged Liquidity'} />,
      id: CARD_CATEGORIES.LIQUIDITY_LEVERAGED,
      to: `/liquidity-leveraged`,
      Icon: (
        <PieChartIcon
          sx={{
            width: theme.spacing(2),
            fill: CARD_CATEGORIES.LIQUIDITY_LEVERAGED.includes(category)
              ? theme.palette.typography.main
              : theme.palette.typography.light,
            stroke: 'transparent',
          }}
        />
      ),
    },
  ];

  const borrowOptions = [
    {
      title: <FormattedMessage defaultMessage={'Borrow Fixed'} />,
      id: CARD_CATEGORIES.BORROW_FIXED,
      to: `/borrow-fixed`,
      Icon: (
        <CoinsIcon
          sx={{
            width: theme.spacing(2),
            stroke: CARD_CATEGORIES.BORROW_FIXED.includes(category)
              ? theme.palette.typography.main
              : theme.palette.typography.light,
            fill: 'transparent',
          }}
        />
      ),
    },
    {
      title: <FormattedMessage defaultMessage={'Borrow Variable'} />,
      id: CARD_CATEGORIES.BORROW_VARIABLE,
      to: `/borrow-variable`,
      Icon: (
        <CoinsCircleIcon
          sx={{
            width: theme.spacing(2),
            fill: CARD_CATEGORIES.BORROW_VARIABLE.includes(category)
              ? theme.palette.typography.main
              : theme.palette.typography.light,
            stroke: 'transparent',
          }}
        />
      ),
    },
  ];

  return {
    earnYieldOptions,
    leveragedYieldOptions,
    borrowOptions,
    defaultOptionSet,
  };
};

export default useCardMobileNav;
