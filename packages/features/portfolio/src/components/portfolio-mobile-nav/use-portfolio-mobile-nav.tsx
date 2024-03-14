import {
  PORTFOLIO_CATEGORIES,
  PORTFOLIO_ACTIONS,
} from '@notional-finance/shared-config';
import {
  BarChartIcon,
  FourSquareIcon,
  MoneyMarketIcon,
  PieChartIcon,
  StakeIcon,
  VaultIcon,
  HistoryIcon,
  CoinsIcon,
} from '@notional-finance/icons';
import { useParams } from 'react-router-dom';
import { useTheme } from '@mui/material';
import { FormattedMessage } from 'react-intl';

export interface PortfolioParams {
  category?: PORTFOLIO_CATEGORIES;
  sideDrawerKey?: PORTFOLIO_ACTIONS;
}

export enum NAV_OPTIONS {
  SET_ONE = 'set_one',
  SET_TWO = 'set_two',
}

enum OPTION_SET_ONE {
  OVERVIEW = 'overview',
  LENDS = 'lends',
  BORROWS = 'borrows',
  LIQUIDITY = 'liquidity',
}

enum OPTION_SET_TWO {
  TRANSACTION_HISTORY = 'transaction-history',
  LEVERAGED_VAULTS = 'vaults',
  STAKED_NOTE = 'staked-note',
  MONEY_MARKET = 'money-market',
}

export const usePortfolioMobileNav = () => {
  const theme = useTheme();
  const { category } = useParams<PortfolioParams>();

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
      title: <FormattedMessage defaultMessage={'Overview'} />,
      id: PORTFOLIO_CATEGORIES.OVERVIEW,
      to: `/portfolio/${PORTFOLIO_CATEGORIES.OVERVIEW}`,
      Icon: (
        <FourSquareIcon
          sx={{
            width: theme.spacing(2),
            fill:
              category === PORTFOLIO_CATEGORIES.OVERVIEW
                ? theme.palette.typography.main
                : theme.palette.typography.light,
          }}
        />
      ),
    },
    {
      title: <FormattedMessage defaultMessage={'Lends'} />,
      id: PORTFOLIO_CATEGORIES.LENDS,
      to: `/portfolio/${PORTFOLIO_CATEGORIES.LENDS}`,
      Icon: (
        <BarChartIcon
          sx={{
            width: theme.spacing(2),
            fill:
              category === PORTFOLIO_CATEGORIES.LENDS
                ? theme.palette.typography.main
                : theme.palette.typography.light,
          }}
        />
      ),
    },
    {
      title: <FormattedMessage defaultMessage={'Vaults'} />,
      id: PORTFOLIO_CATEGORIES.LEVERAGED_VAULTS,
      to: `/portfolio/${PORTFOLIO_CATEGORIES.LEVERAGED_VAULTS}`,
      Icon: (
        <VaultIcon
          sx={{
            width: theme.spacing(2),
            fill:
              category === PORTFOLIO_CATEGORIES.LEVERAGED_VAULTS
                ? theme.palette.typography.main
                : theme.palette.typography.light,
          }}
        />
      ),
    },
    {
      title: <FormattedMessage defaultMessage={'Stake'} />,
      id: PORTFOLIO_CATEGORIES.STAKED_NOTE,
      to: `/stake`,
      Icon: (
        <StakeIcon
          sx={{
            width: theme.spacing(2),
            fill:
              category === PORTFOLIO_CATEGORIES.STAKED_NOTE
                ? theme.palette.typography.main
                : theme.palette.typography.light,
          }}
        />
      ),
    },
    {
      title: <FormattedMessage defaultMessage={'Borrows'} />,
      id: PORTFOLIO_CATEGORIES.BORROWS,
      to: `/portfolio/${PORTFOLIO_CATEGORIES.BORROWS}`,
      Icon: (
        <CoinsIcon
          sx={{
            width: theme.spacing(2),
            stroke:
              category === PORTFOLIO_CATEGORIES.BORROWS
                ? theme.palette.typography.main
                : theme.palette.typography.light,
            fill: 'transparent',
          }}
        />
      ),
    },
    {
      title: <FormattedMessage defaultMessage={'Liquidity'} />,
      id: PORTFOLIO_CATEGORIES.LIQUIDITY,
      to: `/portfolio/${PORTFOLIO_CATEGORIES.LIQUIDITY}`,
      Icon: (
        <PieChartIcon
          sx={{
            width: theme.spacing(2),
            fill:
              category === PORTFOLIO_CATEGORIES.LIQUIDITY
                ? theme.palette.typography.main
                : theme.palette.typography.light,
          }}
        />
      ),
    },
  ];
  const optionSetTwo = [
    {
      title: <FormattedMessage defaultMessage={'History'} />,
      id: PORTFOLIO_CATEGORIES.TRANSACTION_HISTORY,
      to: `/portfolio/${PORTFOLIO_CATEGORIES.TRANSACTION_HISTORY}`,
      Icon: (
        <HistoryIcon
          sx={{
            width: theme.spacing(2),
            fill:
              category === PORTFOLIO_CATEGORIES.TRANSACTION_HISTORY
                ? theme.palette.typography.main
                : theme.palette.typography.light,
          }}
        />
      ),
    },
    {
      title: <FormattedMessage defaultMessage={'Assets'} />,
      id: PORTFOLIO_CATEGORIES.MONEY_MARKET,
      to: `/portfolio/${PORTFOLIO_CATEGORIES.MONEY_MARKET}`,
      Icon: (
        <MoneyMarketIcon
          sx={{
            width: theme.spacing(2),
            fill:
              category === PORTFOLIO_CATEGORIES.MONEY_MARKET
                ? theme.palette.typography.main
                : theme.palette.typography.light,
          }}
        />
      ),
    },
  ];

  return { optionSetOne, optionSetTwo, defaultOptionSet };
};

export default usePortfolioMobileNav;
