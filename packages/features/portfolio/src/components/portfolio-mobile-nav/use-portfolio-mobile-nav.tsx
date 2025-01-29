import {
  PORTFOLIO_CATEGORIES,
  PORTFOLIO_ACTIONS,
  PORTFOLIO_CONNECTED_WALLET,
} from '@notional-finance/util';
import {
  FourSquareIcon,
  HistoryIcon,
  BarChartLateralIcon,
} from '@notional-finance/icons';
import { useParams } from 'react-router-dom';
import { useTheme } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { useSelectedNetwork } from '@notional-finance/notionable-hooks';

export interface PortfolioParams extends Record<string, string | undefined> {
  category?: PORTFOLIO_CATEGORIES;
  sideDrawerKey?: PORTFOLIO_ACTIONS;
}

export const usePortfolioMobileNav = () => {
  const theme = useTheme();
  const network = useSelectedNetwork();
  const { category } = useParams<PortfolioParams>();

  const options = [
    {
      title: <FormattedMessage defaultMessage={'Portfolio'} />,
      id: PORTFOLIO_CONNECTED_WALLET.PORTFOLIO,
      to: `/portfolio/${network}/${PORTFOLIO_CATEGORIES.OVERVIEW}`,
      Icon: (
        <FourSquareIcon
          sx={{
            width: theme.spacing(3),
            fill:
              category === PORTFOLIO_CATEGORIES.OVERVIEW
                ? theme.palette.typography.contrastText
                : theme.palette.typography.light,
          }}
        />
      ),
    },

    {
      title: <FormattedMessage defaultMessage={'Risk'} />,
      id: PORTFOLIO_CONNECTED_WALLET.RISK,
      to: `/portfolio/${network}/${PORTFOLIO_CATEGORIES.OVERVIEW}`,
      Icon: (
        <FourSquareIcon
          sx={{
            width: theme.spacing(3),
            fill:
              category === PORTFOLIO_CATEGORIES.HOLDINGS
                ? theme.palette.typography.contrastText
                : theme.palette.typography.light,
          }}
        />
      ),
    },
    {
      title: <FormattedMessage defaultMessage={'History'} />,
      id: PORTFOLIO_CONNECTED_WALLET.HISTORY,
      to: `/portfolio/${network}/${PORTFOLIO_CATEGORIES.OVERVIEW}`,
      Icon: (
        <HistoryIcon
          sx={{
            width: theme.spacing(3),
            fill:
              category === PORTFOLIO_CATEGORIES.OVERVIEW
                ? theme.palette.typography.main
                : theme.palette.typography.light,
          }}
        />
      ),
    },

    {
      title: <FormattedMessage defaultMessage={'Rates'} />,
      id: PORTFOLIO_CONNECTED_WALLET.RATES,
      to: `/portfolio/${network}/${PORTFOLIO_CATEGORIES.OVERVIEW}`,
      Icon: (
        <BarChartLateralIcon
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
  ];

  return options;
};

export default usePortfolioMobileNav;
