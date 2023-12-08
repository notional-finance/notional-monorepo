import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useTheme } from '@mui/material';
import { PORTFOLIO_CATEGORIES } from '@notional-finance/util';
import {
  BarChartIcon,
  FourSquareIcon,
  // StakeIcon,
  VaultIcon,
  HistoryIcon,
} from '@notional-finance/icons';
import { PortfolioParams } from '../portfolio-feature-shell';
import { useAccountDefinition } from '@notional-finance/notionable-hooks';
import { unique } from '@notional-finance/util';

export const useSideNav = () => {
  const { category } = useParams<PortfolioParams>();
  const theme = useTheme();
  const { account } = useAccountDefinition();
  const numHoldings =
    account?.balances.filter(
      (t) =>
        t.tokenType === 'nToken' ||
        t.tokenType === 'fCash' ||
        t.tokenType === 'PrimeCash' ||
        t.tokenType === 'PrimeDebt'
    ).length || 0;
  const numVaults =
    unique(
      account?.balances
        .filter((t) => t.isVaultToken)
        .map((t) => t.vaultAddress) || []
    ).length || 0;

  const sideNavOptions = useMemo(() => {
    return [
      {
        Icon: <FourSquareIcon sx={{ width: theme.spacing(3) }} />,
        id: PORTFOLIO_CATEGORIES.OVERVIEW,
        to: `/portfolio/${PORTFOLIO_CATEGORIES.OVERVIEW}`,
        notifications: 0,
      },
      {
        Icon: <BarChartIcon sx={{ width: theme.spacing(3) }} />,
        id: PORTFOLIO_CATEGORIES.HOLDINGS,
        to: `/portfolio/${PORTFOLIO_CATEGORIES.HOLDINGS}`,
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
        to: `/portfolio/${PORTFOLIO_CATEGORIES.LEVERAGED_VAULTS}`,
        notifications: numVaults,
      },
      {
        Icon: <HistoryIcon sx={{ width: theme.spacing(3) }} />,
        id: PORTFOLIO_CATEGORIES.TRANSACTION_HISTORY,
        to: `/portfolio/${PORTFOLIO_CATEGORIES.TRANSACTION_HISTORY}`,
        notifications: 0,
      },
    ];
  }, [numHoldings, numVaults, category, theme]);

  return { sideNavOptions };
};
