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
  SET_ONE = 'set_one',
  SET_TWO = 'set_two',
  SET_THREE = 'set_three',
}

const OPTION_SET_ONE = ['lend-fixed', 'lend-variable', 'provide'];
const OPTION_SET_TWO = ['vaults', 'liquidity-leveraged'];
const OPTION_SET_THREE = ['borrow-fixed', 'borrow-variable'];

export const useCardMobileNav = () => {
  const theme = useTheme();
  const { pathname } = useLocation();
  const category = pathname.slice(1);

  let defaultOptionSet = NAV_OPTIONS.SET_ONE;

  if (OPTION_SET_ONE.includes(category)) {
    defaultOptionSet = NAV_OPTIONS.SET_ONE;
  } else if (OPTION_SET_TWO.includes(category)) {
    defaultOptionSet = NAV_OPTIONS.SET_TWO;
  } else if (OPTION_SET_THREE.includes(category)) {
    defaultOptionSet = NAV_OPTIONS.SET_THREE;
  } else {
    defaultOptionSet = NAV_OPTIONS.SET_ONE;
  }

  const optionSetOne = [
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

  const optionSetTwo = [
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

  const optionSetThree = [
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

  return { optionSetOne, optionSetTwo, optionSetThree, defaultOptionSet };
};

export default useCardMobileNav;
