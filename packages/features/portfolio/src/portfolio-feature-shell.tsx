import { useEffect } from 'react';
import { Box, styled, useTheme } from '@mui/material';
import { useAccount } from '@notional-finance/notionable-hooks';
import { useParams, useHistory } from 'react-router-dom';
import { ButtonBar, SideDrawer } from '@notional-finance/mui';
import { usePortfolioButtonBar } from './hooks';
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
import {
  updateSideDrawerState,
  useSideDrawerManager,
} from '@notional-finance/notional-web';
import {
  PORTFOLIO_ACTIONS,
  PORTFOLIO_CATEGORIES,
} from '@notional-finance/shared-config';

export interface PortfolioParams {
  category?: PORTFOLIO_CATEGORIES;
  sideDrawerKey?: PORTFOLIO_ACTIONS;
}

export const PortfolioFeatureShell = () => {
  const history = useHistory();
  const theme = useTheme();
  const params = useParams<PortfolioParams>();
  const { SideDrawerComponent, drawerOpen } = useSideDrawerManager(
    params.sideDrawerKey
  );
  const { buttonData } = usePortfolioButtonBar();
  const { accountConnected } = useAccount();

  useEffect(() => {
    if (SideDrawerComponent) {
      updateSideDrawerState({ sideDrawerOpen: true });
    }
  }, [SideDrawerComponent]);

  const handleDrawer = (drawerState: boolean) => {
    if (drawerState === false) {
      history.push(
        `/portfolio/${params?.category || PORTFOLIO_CATEGORIES.OVERVIEW}`
      );
    }
    updateSideDrawerState({ sideDrawerOpen: drawerState });
  };

  return (
    <PortfolioContainer>
      <SideDrawer callback={handleDrawer} drawerOpen={drawerOpen}>
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
// max-width: 1330px is necessary for portfolio page to render correctly on laptops
// We should consider adding a 1280px breakpoint in the future

const PortfolioContainer = styled(Box)(
  ({ theme }) => `
  display: flex;
  gap: 64px;
  margin: 64px;
  margin-top: 80px;
  @media (max-width: 1330px) {
    margin: 80px 16px;
    gap: 24px;
  };
  @media (min-width: ${theme.breakpoints.values.xl}) {
    margin: 80px auto;
    max-width: 1440px;
  };
  @media (max-width: 768px) {
    flex-flow: column;
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
