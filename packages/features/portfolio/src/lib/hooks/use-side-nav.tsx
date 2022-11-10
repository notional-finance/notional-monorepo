import { useParams } from 'react-router-dom';
import {
  useAssetSummary,
  useMoneyMarket,
  useNTokenHoldings,
  useYieldStrategies,
} from '@notional-finance/notionable-hooks';
import { useTheme } from '@mui/material';
import { LEND_BORROW, PORTFOLIO_CATEGORIES } from '@notional-finance/utils';
import {
  BarChartIcon,
  CoinsIcon,
  PieChartIcon,
  FourSquareIcon,
  MoneyMarketIcon,
  StakeIcon,
  VaultIcon,
  HistoryIcon,
} from '@notional-finance/icons';
import { PortfolioParams } from '../portfolio-feature-shell';

interface SideNavDataProps {
  Icon: JSX.Element;
  notifications: number;
}

export const useSideNav = () => {
  const { category } = useParams<PortfolioParams>();
  const theme = useTheme();
  const borrowSummary = useAssetSummary(LEND_BORROW.BORROW);
  const lendSummary = useAssetSummary(LEND_BORROW.LEND);
  const leveragedVaultPositions = useYieldStrategies(true);
  const moneyMarket = useMoneyMarket();
  const nTokenHoldings = useNTokenHoldings();

  const navData: Record<PORTFOLIO_CATEGORIES, SideNavDataProps> = {
    [PORTFOLIO_CATEGORIES.OVERVIEW]: {
      Icon: <FourSquareIcon sx={{ width: '17px' }} />,
      notifications: 0,
    },
    [PORTFOLIO_CATEGORIES.LENDS]: {
      Icon: <BarChartIcon sx={{ width: '17px' }} />,
      notifications: lendSummary?.length,
    },
    [PORTFOLIO_CATEGORIES.BORROWS]: {
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
      notifications: borrowSummary.length,
    },
    [PORTFOLIO_CATEGORIES.TRANSACTION_HISTORY]: {
      Icon: <HistoryIcon sx={{ width: '17px' }} />,
      notifications: 0,
    },
    [PORTFOLIO_CATEGORIES.LEVERAGED_VAULTS]: {
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
      notifications: leveragedVaultPositions.length,
    },
    [PORTFOLIO_CATEGORIES.LIQUIDITY]: {
      Icon: <PieChartIcon sx={{ width: '17px' }} />,
      notifications: nTokenHoldings.length,
    },
    [PORTFOLIO_CATEGORIES.STAKED_NOTE]: {
      Icon: (
        <StakeIcon
          sx={{ width: '17px', stroke: theme.palette.typography.light, fill: 'transparent' }}
        />
      ),
      notifications: 0,
    },
    [PORTFOLIO_CATEGORIES.MONEY_MARKET]: {
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
      notifications: moneyMarket.length,
    },
  };

  return navData;
};
