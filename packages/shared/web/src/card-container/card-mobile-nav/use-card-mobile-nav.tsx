import { CARD_CATEGORIES } from '@notional-finance/shared-config';
import { BarChartLateralIcon, VaultIcon } from '@notional-finance/icons';
import { useLocation } from 'react-router-dom';
import { useTheme } from '@mui/material';
import { FormattedMessage } from 'react-intl';

export enum NAV_OPTIONS {
  SET_ONE = 'set_one',
  SET_TWO = 'set_two',
}

enum OPTION_SET_ONE {
  LEND_FIXED = 'lend',
  LEVERAGED_VAULTS = 'vaults',
  PROVIDE_LIQUIDITY = 'provide',
}

enum OPTION_SET_TWO {
  BORROW_FIXED = 'borrow',
}

export const useCardMobileNav = () => {
  const theme = useTheme();
  const { pathname } = useLocation();
  const category = pathname.slice(1);

  const defaultOptionSet = Object.values(OPTION_SET_ONE).includes(
    category as unknown as OPTION_SET_ONE
  )
    ? NAV_OPTIONS.SET_ONE
    : Object.values(OPTION_SET_TWO).includes(
        category as unknown as OPTION_SET_TWO
      )
    ? NAV_OPTIONS.SET_TWO
    : null;

  const optionSetOne = [
    {
      title: <FormattedMessage defaultMessage={'Fixed Lending'} />,
      id: CARD_CATEGORIES.LEND_FIXED,
      to: `/lend`,
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
  ];

  return { optionSetOne, defaultOptionSet };
};

export default useCardMobileNav;
