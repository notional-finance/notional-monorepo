import { useParams } from 'react-router-dom';
import {
  useAssetSummary,
  useMoneyMarket,
  useNTokenHoldings,
  useYieldStrategies,
} from '@notional-finance/notionable-hooks';
import { useTheme } from '@mui/material';
import {
  LEND_BORROW,
  PORTFOLIO_CATEGORIES,
} from '@notional-finance/shared-config';
import {
  BarChartIcon,
  FourSquareIcon,
  MoneyMarketIcon,
  // StakeIcon,
  VaultIcon,
  HistoryIcon,
  CoinsIcon,
  PieChartIcon,
} from '@notional-finance/icons';
import { PortfolioParams } from '../portfolio-feature-shell';

export const useSideNav = () => {
  const { category } = useParams<PortfolioParams>();
  const theme = useTheme();
  const lendSummary = useAssetSummary(LEND_BORROW.LEND);
  const borrowSummary = useAssetSummary(LEND_BORROW.BORROW);
  const nTokenHoldings = useNTokenHoldings();
  const leveragedVaultPositions = useYieldStrategies(true);
  const moneyMarket = useMoneyMarket();

  const sideNavOne = [
    {
      Icon: <FourSquareIcon sx={{ width: '17px' }} />,
      id: PORTFOLIO_CATEGORIES.OVERVIEW,
      to: `/portfolio/${PORTFOLIO_CATEGORIES.OVERVIEW}`,
      notifications: 0,
    },
    {
      Icon: <BarChartIcon sx={{ width: '17px' }} />,
      id: PORTFOLIO_CATEGORIES.LENDS,
      to: `/portfolio/${PORTFOLIO_CATEGORIES.LENDS}`,
      notifications: lendSummary?.length,
    },
    {
      Icon: (
        <CoinsIcon
          sx={{
            stroke:
              category === PORTFOLIO_CATEGORIES.BORROWS
                ? theme.palette.common.white
                : theme.palette.typography.light,
            fill: 'transparent',
            width: '17px',
          }}
        />
      ),
      id: PORTFOLIO_CATEGORIES.BORROWS,
      to: `/portfolio/${PORTFOLIO_CATEGORIES.BORROWS}`,
      notifications: borrowSummary.length,
    },
    {
      Icon: <HistoryIcon sx={{ width: '17px' }} />,
      id: PORTFOLIO_CATEGORIES.TRANSACTION_HISTORY,
      to: `/portfolio/${PORTFOLIO_CATEGORIES.TRANSACTION_HISTORY}`,
      notifications: 0,
    },
  ];

  const sideNavTwo = [
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
      notifications: leveragedVaultPositions.length,
    },
    {
      Icon: <PieChartIcon sx={{ width: '17px' }} />,
      id: PORTFOLIO_CATEGORIES.LIQUIDITY,
      to: `/portfolio/${PORTFOLIO_CATEGORIES.LIQUIDITY}`,
      notifications: nTokenHoldings.length,
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
      Icon: (
        <MoneyMarketIcon
          sx={{
            width: '17px',
            color:
              category === PORTFOLIO_CATEGORIES.MONEY_MARKET
                ? theme.palette.common.white
                : theme.palette.typography.light,
          }}
        />
      ),
      id: PORTFOLIO_CATEGORIES.MONEY_MARKET,
      to: `/portfolio/${PORTFOLIO_CATEGORIES.MONEY_MARKET}`,
      notifications: moneyMarket.length,
    },
  ];

  return { sideNavOne, sideNavTwo };
};
