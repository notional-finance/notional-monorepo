import { useParams } from 'react-router-dom';
import { useTheme } from '@mui/material';
import { PORTFOLIO_CATEGORIES } from '@notional-finance/shared-config';
import {
  BarChartIcon,
  FourSquareIcon,
  // StakeIcon,
  VaultIcon,
  HistoryIcon,
} from '@notional-finance/icons';
import { PortfolioParams } from '../portfolio-feature-shell';
import {
  useVaultRiskProfiles,
  useNotionalContext,
} from '@notional-finance/notionable-hooks';
import { usePortfolioHoldings } from '../containers/portfolio-holdings/use-portfolio-holdings';

export const useSideNav = () => {
  const { category } = useParams<PortfolioParams>();
  const theme = useTheme();
  const {
    globalState: { isAccountReady },
  } = useNotionalContext();

  const useOptionsActive = () => {
    const { portfolioHoldingsData } = usePortfolioHoldings();
    const vaults = useVaultRiskProfiles();

    return [
      {
        Icon: <FourSquareIcon sx={{ width: '17px' }} />,
        id: PORTFOLIO_CATEGORIES.OVERVIEW,
        to: `/portfolio/${PORTFOLIO_CATEGORIES.OVERVIEW}`,
        notifications: 0,
      },
      {
        Icon: <BarChartIcon sx={{ width: '17px' }} />,
        id: PORTFOLIO_CATEGORIES.HOLDINGS,
        to: `/portfolio/${PORTFOLIO_CATEGORIES.HOLDINGS}`,
        notifications: portfolioHoldingsData.length,
      },
      {
        Icon: (
          <VaultIcon
            sx={{
              width: '17px',
              fill:
                category === PORTFOLIO_CATEGORIES.LEVERAGED_VAULTS
                  ? theme.palette.common.white
                  : theme.palette.typography.light,
            }}
          />
        ),
        id: PORTFOLIO_CATEGORIES.LEVERAGED_VAULTS,
        to: `/portfolio/${PORTFOLIO_CATEGORIES.LEVERAGED_VAULTS}`,
        notifications: vaults.length,
      },
      // {
      //   Icon: (
      //     <StakeIcon
      //       sx={{
      //         width: '17px',
      //         stroke: theme.palette.typography.light,
      //         fill: 'transparent',
      //       }}
      //     />
      //   ),
      //   id: PORTFOLIO_CATEGORIES.STAKED_NOTE,
      //   to: `/stake`,
      //   notifications: 0,
      // },
      {
        Icon: <HistoryIcon sx={{ width: '17px' }} />,
        id: PORTFOLIO_CATEGORIES.TRANSACTION_HISTORY,
        to: `/portfolio/${PORTFOLIO_CATEGORIES.TRANSACTION_HISTORY}`,
        notifications: 0,
      },
    ];
  };
  const useOptionsInActive = () => {
    return [
      {
        Icon: <FourSquareIcon sx={{ width: '17px' }} />,
        id: PORTFOLIO_CATEGORIES.OVERVIEW,
        to: `/portfolio/${PORTFOLIO_CATEGORIES.OVERVIEW}`,
        notifications: 0,
      },
      {
        Icon: <BarChartIcon sx={{ width: '17px' }} />,
        id: PORTFOLIO_CATEGORIES.HOLDINGS,
        to: `/portfolio/${PORTFOLIO_CATEGORIES.HOLDINGS}`,
        notifications: 0,
      },
      {
        Icon: (
          <VaultIcon
            sx={{
              width: '17px',
              fill:
                category === PORTFOLIO_CATEGORIES.LEVERAGED_VAULTS
                  ? theme.palette.common.white
                  : theme.palette.typography.light,
            }}
          />
        ),
        id: PORTFOLIO_CATEGORIES.LEVERAGED_VAULTS,
        to: `/portfolio/${PORTFOLIO_CATEGORIES.LEVERAGED_VAULTS}`,
        notifications: 0,
      },
      // {
      //   Icon: (
      //     <StakeIcon
      //       sx={{
      //         width: '17px',
      //         stroke: theme.palette.typography.light,
      //         fill: 'transparent',
      //       }}
      //     />
      //   ),
      //   id: PORTFOLIO_CATEGORIES.STAKED_NOTE,
      //   to: `/stake`,
      //   notifications: 0,
      // },
      {
        Icon: <HistoryIcon sx={{ width: '17px' }} />,
        id: PORTFOLIO_CATEGORIES.TRANSACTION_HISTORY,
        to: `/portfolio/${PORTFOLIO_CATEGORIES.TRANSACTION_HISTORY}`,
        notifications: 0,
      },
    ];
  };

  const useOptions = isAccountReady ? useOptionsActive : useOptionsInActive;

  return { useOptions };
};
