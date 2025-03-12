import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useTheme } from '@mui/material';
import { PORTFOLIO_CATEGORIES } from '@notional-finance/util';
import {
  FourSquareIcon,
  StakeIcon,
  HistoryIcon,
  GaugeIcon,
  PercentIcon,
} from '@notional-finance/icons';
import { PortfolioParams } from '../portfolio-feature-shell';
import { useSelectedNetwork } from '@notional-finance/notionable-hooks';

export const useSideNav = () => {
  const { category } = useParams<PortfolioParams>();
  const theme = useTheme();
  const network = useSelectedNetwork();

  const sideNavOptions = useMemo(() => {
    return [
      {
        Icon: (
          <FourSquareIcon
            sx={{
              width: theme.spacing(3),
              fill:
                category === PORTFOLIO_CATEGORIES.OVERVIEW
                  ? theme.palette.common.white
                  : theme.palette.typography.light,
            }}
          />
        ),
        id: PORTFOLIO_CATEGORIES.OVERVIEW,
        to: `/portfolio/${network}/${PORTFOLIO_CATEGORIES.OVERVIEW}`,
        notifications: 0,
      },
      {
        Icon: (
          <GaugeIcon
            sx={{
              width: theme.spacing(3),
              fill:
                category === PORTFOLIO_CATEGORIES.RISK
                  ? theme.palette.common.white
                  : theme.palette.typography.light,
            }}
          />
        ),
        id: PORTFOLIO_CATEGORIES.RISK,
        to: `/portfolio/${network}/${PORTFOLIO_CATEGORIES.RISK}`,
        notifications: 0,
      },
      {
        Icon: (
          <StakeIcon
            fill={
              category === PORTFOLIO_CATEGORIES.NOTE_STAKING
                ? theme.palette.common.white
                : theme.palette.typography.light
            }
            sx={{
              width: theme.spacing(3),
            }}
          />
        ),
        id: PORTFOLIO_CATEGORIES.NOTE_STAKING,
        to: `/portfolio/${network}/${PORTFOLIO_CATEGORIES.NOTE_STAKING}`,
        notifications: 0,
      },
      {
        Icon: <HistoryIcon sx={{ width: theme.spacing(3) }} />,
        id: PORTFOLIO_CATEGORIES.TRANSACTION_HISTORY,
        to: `/portfolio/${network}/${PORTFOLIO_CATEGORIES.TRANSACTION_HISTORY}`,
        notifications: 0,
      },
      {
        Icon: (
          <PercentIcon
            stroke={
              category === PORTFOLIO_CATEGORIES.WELCOME
                ? theme.palette.common.white
                : theme.palette.typography.light
            }
            sx={{ width: theme.spacing(3) }}
          />
        ),
        id: PORTFOLIO_CATEGORIES.WELCOME,
        to: `/portfolio/${network}/${PORTFOLIO_CATEGORIES.WELCOME}`,
        notifications: 0,
      },
    ];
  }, [category, theme, network]);

  return { sideNavOptions };
};
