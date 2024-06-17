import {
  PORTFOLIO_CATEGORIES,
  PORTFOLIO_ACTIONS,
} from '@notional-finance/util';
import {
  BarChartIcon,
  FourSquareIcon,
  StakeIcon,
  VaultIcon,
  HistoryIcon,
} from '@notional-finance/icons';
import { useParams } from 'react-router-dom';
import { useTheme } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { useSelectedNetwork } from '@notional-finance/notionable-hooks';

export interface PortfolioParams {
  category?: PORTFOLIO_CATEGORIES;
  sideDrawerKey?: PORTFOLIO_ACTIONS;
}

export enum NAV_OPTIONS {
  SET_ONE = 'set_one',
  SET_TWO = 'set_two',
}

export const usePortfolioMobileNav = () => {
  const theme = useTheme();
  const network = useSelectedNetwork();
  const { category } = useParams<PortfolioParams>();

  const options = [
    {
      title: <FormattedMessage defaultMessage={'Overview'} />,
      id: PORTFOLIO_CATEGORIES.OVERVIEW,
      to: `/portfolio/${network}/${PORTFOLIO_CATEGORIES.OVERVIEW}`,
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
      title: <FormattedMessage defaultMessage={'Holdings'} />,
      id: PORTFOLIO_CATEGORIES.HOLDINGS,
      to: `/portfolio/${network}/${PORTFOLIO_CATEGORIES.HOLDINGS}`,
      Icon: (
        <BarChartIcon
          sx={{
            width: theme.spacing(2),
            fill:
              category === PORTFOLIO_CATEGORIES.HOLDINGS
                ? theme.palette.typography.main
                : theme.palette.typography.light,
          }}
        />
      ),
    },
    {
      title: <FormattedMessage defaultMessage={'Vaults'} />,
      id: PORTFOLIO_CATEGORIES.LEVERAGED_VAULTS,
      to: `/portfolio/${network}/${PORTFOLIO_CATEGORIES.LEVERAGED_VAULTS}`,
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
      id: PORTFOLIO_CATEGORIES.NOTE_STAKING,
      to: `/portfolio/${network}/${PORTFOLIO_CATEGORIES.NOTE_STAKING}`,
      Icon: (
        <StakeIcon
          fill={
            category === PORTFOLIO_CATEGORIES.NOTE_STAKING
              ? theme.palette.typography.main
              : theme.palette.typography.light
          }
          sx={{
            width: theme.spacing(2),
          }}
        />
      ),
    },
    {
      title: <FormattedMessage defaultMessage={'History'} />,
      id: PORTFOLIO_CATEGORIES.TRANSACTION_HISTORY,
      to: `/portfolio/${network}/${PORTFOLIO_CATEGORIES.TRANSACTION_HISTORY}`,
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
  ];

  return options;
};

export default usePortfolioMobileNav;
