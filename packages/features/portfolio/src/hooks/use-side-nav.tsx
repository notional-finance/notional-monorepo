import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useTheme } from '@mui/material';
import { PORTFOLIO_CATEGORIES } from '@notional-finance/util';
import {
  BarChartIcon,
  FourSquareIcon,
  StakeIcon,
  VaultIcon,
  HistoryIcon,
} from '@notional-finance/icons';
import { PortfolioParams } from '../portfolio-feature-shell';
import {
  usePortfolioHoldings,
  useSelectedNetwork,
  useVaultHoldings,
} from '@notional-finance/notionable-hooks';

export const useSideNav = () => {
  const { category } = useParams<PortfolioParams>();
  const theme = useTheme();
  const network = useSelectedNetwork();
  const numHoldings = usePortfolioHoldings(network).length;
  const numVaults = useVaultHoldings(network).length;

  const sideNavOptions = useMemo(() => {
    return [
      {
        Icon: <FourSquareIcon sx={{ width: theme.spacing(3) }} />,
        id: PORTFOLIO_CATEGORIES.OVERVIEW,
        to: `/portfolio/${network}/${PORTFOLIO_CATEGORIES.OVERVIEW}`,
        notifications: 0,
      },
      {
        Icon: <BarChartIcon sx={{ width: theme.spacing(3) }} />,
        id: PORTFOLIO_CATEGORIES.HOLDINGS,
        to: `/portfolio/${network}/${PORTFOLIO_CATEGORIES.HOLDINGS}`,
        notifications: numHoldings,
      },
      {
        Icon: (
          <VaultIcon
            sx={{
              width: theme.spacing(3),
              fill:
                category === PORTFOLIO_CATEGORIES.LEVERAGED_VAULTS
                  ? theme.palette.common.white
                  : theme.palette.typography.light,
            }}
          />
        ),
        id: PORTFOLIO_CATEGORIES.LEVERAGED_VAULTS,
        to: `/portfolio/${network}/${PORTFOLIO_CATEGORIES.LEVERAGED_VAULTS}`,
        notifications: numVaults,
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
          <span role="img" aria-label="wave" style={{ fontSize: '24px' }}>
            👋
          </span>
        ),
        id: PORTFOLIO_CATEGORIES.WELCOME,
        to: `/portfolio/${network}/${PORTFOLIO_CATEGORIES.WELCOME}`,
        notifications: 0,
      },
    ];
  }, [numHoldings, numVaults, category, theme, network]);

  return { sideNavOptions };
};
