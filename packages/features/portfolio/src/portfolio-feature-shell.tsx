import { Box, styled, useTheme } from '@mui/material';
import { useAccount } from '@notional-finance/notionable-hooks';
import { useParams, useHistory } from 'react-router-dom';
import { ButtonBar, SideDrawer } from '@notional-finance/mui';
import { usePortfolioButtonBar, usePortfolioSideDrawers } from './hooks';
import { EnabledCurrencies, SideNav } from './components';
import {
  PortfolioOverview,
  PortfolioLends,
  PortfolioBorrows,
  PortfolioLiquidity,
  PortfolioVaults,
  PortfolioMoneyMarket,
  PortfolioTransactionHistory,
} from './containers';
import { useSideDrawerManager } from '@notional-finance/shared-web';
import {
  PORTFOLIO_ACTIONS,
  PORTFOLIO_CATEGORIES,
} from '@notional-finance/shared-config';

export interface PortfolioParams {
  category?: PORTFOLIO_CATEGORIES;
  sideDrawerKey?: PORTFOLIO_ACTIONS;
}

export const PortfolioFeatureShell = () => {
  const theme = useTheme();
  const history = useHistory();
  const params = useParams<PortfolioParams>();
  useSideDrawerManager();
  const { SideDrawerComponent, openDrawer } = usePortfolioSideDrawers();
  const { buttonData } = usePortfolioButtonBar();
  const { accountConnected } = useAccount();

  const handleDrawer = () => {
    history.push(
      `/portfolio/${params?.category || PORTFOLIO_CATEGORIES.OVERVIEW}`
    );
  };

  return (
    <PortfolioContainer>
      <SideDrawer callback={handleDrawer} openDrawer={openDrawer}>
        {SideDrawerComponent && <SideDrawerComponent />}
      </SideDrawer>
      <PortfolioSidebar>
        <SideNav />
        <EnabledCurrencies />
      </PortfolioSidebar>
      <PortfolioMainContent>
        {accountConnected &&
          params.category !== PORTFOLIO_CATEGORIES.LEVERAGED_VAULTS && (
            <Box sx={{ justifyContent: 'flex-end', display: 'flex' }}>
              <ButtonBar
                buttonOptions={buttonData}
                sx={{ marginBottom: theme.spacing(1) }}
              />
            </Box>
          )}
        {(params.category === PORTFOLIO_CATEGORIES.OVERVIEW ||
          params.category === undefined) && <PortfolioOverview />}
        {params.category === PORTFOLIO_CATEGORIES.LENDS && <PortfolioLends />}
        {params.category === PORTFOLIO_CATEGORIES.BORROWS && (
          <PortfolioBorrows />
        )}
        {params.category === PORTFOLIO_CATEGORIES.LIQUIDITY && (
          <PortfolioLiquidity />
        )}
        {params.category === PORTFOLIO_CATEGORIES.LEVERAGED_VAULTS && (
          <PortfolioVaults />
        )}
        {params.category === PORTFOLIO_CATEGORIES.MONEY_MARKET && (
          <PortfolioMoneyMarket />
        )}
        {params.category === PORTFOLIO_CATEGORIES.TRANSACTION_HISTORY && (
          <PortfolioTransactionHistory />
        )}
      </PortfolioMainContent>
    </PortfolioContainer>
  );
};

// NOTE*
// max-width: 1312px is necessary for portfolio page to render correctly on laptops
// We should consider adding a 1280px breakpoint in the future

const PortfolioContainer = styled(Box)(
  ({ theme }) => `
  display: flex;
  gap: 24px;
  margin: 24px;
  margin-top: 80px;
  @media (max-width: 768px) {
    flex-flow: column;
  };
  @media (max-width: 1330px) {
    margin: 80px 16px;
    gap: 24px;
  };

  ${theme.breakpoints.up('lg')} {
    margin: 80px auto;
    max-width: 95vw;
  };

  ${theme.breakpoints.up('xl')} {
    margin: 80px auto;
    gap: 64px;
    max-width: 1400px;
  };
`
);

const PortfolioSidebar = styled(Box)(
  () => `
  width: 314px;
  @media (max-width: 768px) {
    flex-flow: column;
    width: 100%;
  }
`
);

const PortfolioMainContent = styled(Box)(
  () => `
  flex: 1;
  display: flex;
  flex-flow: column;
  gap: 24px;
  width: 65vw;
  overflow: hidden;
  @media (max-width: 1330px) {
    max-width: 70vw;
  };
`
);

export default PortfolioFeatureShell;
