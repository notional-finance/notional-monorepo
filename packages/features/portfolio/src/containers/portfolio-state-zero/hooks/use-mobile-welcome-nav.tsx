import { PORTFOLIO_CATEGORIES } from '@notional-finance/util';
import {
  BarChartIcon,
  CoinsIcon,
  FourSquareIcon,
  LightningOutlineIcon,
} from '@notional-finance/icons';
import { useParams } from 'react-router-dom';
import { useTheme } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import {
  useAccountAndBalanceReady,
  useSelectedNetwork,
} from '@notional-finance/notionable-hooks';

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
  const isAcctAndBalanceReady = useAccountAndBalanceReady(selectedNetwork);

  const options = [
    ...(isAcctAndBalanceReady
      ? [
          {
            title: <FormattedMessage defaultMessage={'Portfolio'} />,
            id: 'portfolio',
            to: `/portfolio/${selectedNetwork}/${PORTFOLIO_CATEGORIES.OVERVIEW}`,
            Icon: (
              <FourSquareIcon
                sx={{
                  width: theme.spacing(3),
                  fill: theme.palette.typography.light,
                }}
              />
            ),
            divider: true,
          },
        ]
      : []),
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
                : theme.palette.typography.light,
          }}
        />
      ),
      to: `/portfolio/${selectedNetwork}/welcome/earn`,
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
                : theme.palette.typography.light,
          }}
        />
      ),
      to: `/portfolio/${selectedNetwork}/welcome/leverage`,
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
                : theme.palette.typography.light,
          }}
        />
      ),
      to: `/portfolio/${selectedNetwork}/welcome/borrow`,
    },
  ];

  return options;
};
