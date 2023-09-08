import { useEffect } from 'react';
import { Box, styled } from '@mui/material';
import { useNotionalContext } from '@notional-finance/notionable-hooks';
import { useParams } from 'react-router-dom';
import { SideDrawer } from '@notional-finance/mui';
import { usePortfolioSideDrawers } from './hooks';
import {
  SideNav,
  PortfolioMobileNav,
  EmptyPortfolio,
  EmptyPortfolioOverview,
  ClaimNoteButton,
} from './components';
import {
  PortfolioOverview,
  PortfolioVaults,
  PortfolioTransactionHistory,
  PortfolioHoldings,
} from './containers';
import { useSideDrawerManager } from '@notional-finance/side-drawer';
import {
  PORTFOLIO_ACTIONS,
  PORTFOLIO_CATEGORIES,
} from '@notional-finance/util';
import { FeatureLoader } from '@notional-finance/shared-web';

export interface PortfolioParams {
  category?: PORTFOLIO_CATEGORIES;
  sideDrawerKey?: PORTFOLIO_ACTIONS;
  selectedToken?: string;
}

export const PortfolioFeatureShell = () => {
  const params = useParams<PortfolioParams>();
  const { clearSideDrawer } = useSideDrawerManager();
  const { SideDrawerComponent, openDrawer } = usePortfolioSideDrawers();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [params.category]);

  useEffect(() => {
    clearSideDrawer(
      `/portfolio/${params?.category || PORTFOLIO_CATEGORIES.OVERVIEW}`
    );
  }, []);

  const handleDrawer = () => {
    clearSideDrawer(
      `/portfolio/${params?.category || PORTFOLIO_CATEGORIES.OVERVIEW}`
    );
  };

  const {
    globalState: { isAccountReady, isNetworkReady, isAccountPending },
  } = useNotionalContext();

  return (
    <FeatureLoader featureLoaded={isNetworkReady && !isAccountPending}>
      {isAccountReady ? (
        <PortfolioContainer>
          <SideDrawer
            callback={handleDrawer}
            openDrawer={openDrawer}
            zIndex={1202}
            marginTop="80px"
          >
            {SideDrawerComponent && <SideDrawerComponent />}
          </SideDrawer>
          <PortfolioSidebar>
            <SideNav />
          </PortfolioSidebar>
          <PortfolioMainContent>
            <ClaimNoteButton />
            {(params.category === PORTFOLIO_CATEGORIES.OVERVIEW ||
              params.category === undefined) && <PortfolioOverview />}
            {params.category === PORTFOLIO_CATEGORIES.HOLDINGS && (
              <PortfolioHoldings />
            )}
            {params.category === PORTFOLIO_CATEGORIES.LEVERAGED_VAULTS && (
              <PortfolioVaults />
            )}
            {params.category === PORTFOLIO_CATEGORIES.TRANSACTION_HISTORY && (
              <PortfolioTransactionHistory />
            )}
          </PortfolioMainContent>
          <PortfolioMobileNav />
        </PortfolioContainer>
      ) : (
        <PortfolioContainer>
          <PortfolioSidebar>
            <SideNav />
          </PortfolioSidebar>
          <PortfolioMainContent>
            {params.category === PORTFOLIO_CATEGORIES.OVERVIEW ||
            params.category === undefined ? (
              <EmptyPortfolioOverview walletConnected={false} />
            ) : (
              <EmptyPortfolio />
            )}
          </PortfolioMainContent>
        </PortfolioContainer>
      )}
    </FeatureLoader>
  );
};

const PortfolioContainer = styled(Box)(
  ({ theme }) => `
  display: flex;
  gap: ${theme.spacing(3)};
  margin: ${theme.spacing(3)};
  margin-top: ${theme.spacing(10)};
  min-height: 100vh;
  @media (max-width: 768px) {
    flex-flow: column;
  };
  @media (max-width: 1330px) {
    margin: ${theme.spacing(10, 3)};
    gap: ${theme.spacing(3)};
  };

  ${theme.breakpoints.up('lg')} {
    margin: ${theme.spacing(10)} auto;
    max-width: 95vw;
  };

  ${theme.breakpoints.up('xl')} {
    margin: ${theme.spacing(10)} auto;
    gap: ${theme.spacing(8)};
    max-width: ${theme.spacing(196)};
  };
`
);

const PortfolioSidebar = styled(Box)(
  ({ theme }) => `
  width: ${theme.spacing(39)};
  ${theme.breakpoints.down('xl')} {
    width: ${theme.spacing(8)};
    height: 100vh;
  }
  ${theme.breakpoints.down('sm')} {
    display: none;
    flex-flow: column;
    width: 100%;
    height: auto;
  }
`
);

const PortfolioMainContent = styled(Box)(
  ({ theme }) => `
  flex: 1;
  display: flex;
  flex-flow: column;
  gap: ${theme.spacing(3)};
  width: 65vw;
  overflow: hidden;
  ${theme.breakpoints.down('lg')} {
    width: 100%;
  }
  ${theme.breakpoints.down('sm')} {
    min-width: 100%;
    max-width: 70vw;
  };
`
);

export default PortfolioFeatureShell;
