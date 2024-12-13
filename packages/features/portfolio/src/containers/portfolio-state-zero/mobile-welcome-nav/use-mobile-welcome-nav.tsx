import {
  PORTFOLIO_CATEGORIES,
  PORTFOLIO_ACTIONS,
} from '@notional-finance/util';
import {
  BarChartIcon,
  CoinsIcon,
  LightningOutlineIcon,
} from '@notional-finance/icons';
import { useParams } from 'react-router-dom';
import { useTheme } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { useSelectedNetwork } from '@notional-finance/notionable-hooks';

export interface PortfolioParams extends Record<string, string | undefined> {
  category?: PORTFOLIO_CATEGORIES;
  sideDrawerKey?: string;
}

export enum NAV_OPTIONS {
  SET_ONE = 'set_one',
  SET_TWO = 'set_two',
}

export const useMobileWelcomeNav = () => {
  const theme = useTheme();
  const selectedNetwork = useSelectedNetwork();
  const { sideDrawerKey } = useParams<PortfolioParams>();

  const options = [
    {
      id: 'earn',
      title: <FormattedMessage defaultMessage={'Earn'} />,
      Icon: (
        <BarChartIcon
          sx={{
            width: theme.spacing(3),
            fill:
              sideDrawerKey === 'earn'
                ? theme.palette.typography.contrastText
                : theme.palette.typography.main,
          }}
        />
      ),
      link: `/portfolio/${selectedNetwork}/welcome/earn`,
    },
    {
      id: 'leverage',
      title: <FormattedMessage defaultMessage={'Leverage'} />,
      Icon: (
        <LightningOutlineIcon
          sx={{
            width: theme.spacing(3),
            fill:
              sideDrawerKey === 'leverage'
                ? theme.palette.typography.contrastText
                : theme.palette.typography.main,
          }}
        />
      ),
      link: `/portfolio/${selectedNetwork}/welcome/leverage`,
    },
    {
      id: 'borrow',
      title: <FormattedMessage defaultMessage={'Borrow'} />,
      Icon: (
        <CoinsIcon
          sx={{
            width: theme.spacing(3),
            fill: 'transparent',
            stroke:
              sideDrawerKey === 'borrow'
                ? theme.palette.typography.contrastText
                : theme.palette.typography.main,
          }}
        />
      ),
      link: `/portfolio/${selectedNetwork}/welcome/borrow`,
    },
  ];

  return options;
};
