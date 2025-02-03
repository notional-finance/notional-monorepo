import {
  PORTFOLIO_CATEGORIES,
  PORTFOLIO_ACTIONS,
  PORTFOLIO_CONNECTED_WALLET,
} from '@notional-finance/util';
import {
  FourSquareIcon,
  HistoryTabIcon,
  BarChartIcon,
  PercentIcon,
} from '@notional-finance/icons';
import { useParams } from 'react-router-dom';
import { useTheme } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { useSelectedNetwork } from '@notional-finance/notionable-hooks';

export interface PortfolioParams extends Record<string, string | undefined> {
  category?: PORTFOLIO_CATEGORIES | PORTFOLIO_CONNECTED_WALLET;
  sideDrawerKey?: PORTFOLIO_ACTIONS;
}

export const usePortfolioMobileNav = () => {
  const theme = useTheme();
  const network = useSelectedNetwork();
  const { category } = useParams<PortfolioParams>();

  const options = [
    {
      title: <FormattedMessage defaultMessage={'Portfolio'} />,
      id: PORTFOLIO_CATEGORIES.OVERVIEW,
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
      to: `/portfolio/${network}/${PORTFOLIO_CONNECTED_WALLET.RISK}`,
      Icon: (
        <BarChartIcon
          sx={{
            width: theme.spacing(3),
            fill:
              category === PORTFOLIO_CONNECTED_WALLET.RISK
                ? theme.palette.typography.contrastText
                : theme.palette.typography.light,
          }}
        />
      ),
    },
    {
      title: <FormattedMessage defaultMessage={'History'} />,
      id: PORTFOLIO_CONNECTED_WALLET.HISTORY,
      to: `/portfolio/${network}/${PORTFOLIO_CATEGORIES.TRANSACTION_HISTORY}`,
      Icon: (
        <HistoryTabIcon
          sx={{
            width: theme.spacing(3),
            fill:
              category === PORTFOLIO_CONNECTED_WALLET.HISTORY
                ? theme.palette.typography.white
                : theme.palette.typography.light,
          }}
        />
      ),
    },

    {
      title: <FormattedMessage defaultMessage={'Rates'} />,
      id: PORTFOLIO_CONNECTED_WALLET.RATES,
      to: `/portfolio/${network}/welcome/`,
      Icon: (
        <PercentIcon
          sx={{
            width: theme.spacing(3),
            stroke:
              category === PORTFOLIO_CONNECTED_WALLET.RATES
                ? theme.palette.typography.contrastText
                : theme.palette.typography.light,
            fill:
              category === PORTFOLIO_CONNECTED_WALLET.RATES
                ? theme.palette.primary.dark
                : theme.palette.typography.white,
          }}
        />
      ),
    },
  ];

  return options;
};

export default usePortfolioMobileNav;
