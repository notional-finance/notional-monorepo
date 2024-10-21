import { useEffect } from 'react';
import { Box, styled, useTheme } from '@mui/material';
import {
  useAccountLoading,
  useAccountReady,
  useAccountAndBalanceReady,
  useSelectedNetwork,
} from '@notional-finance/notionable-hooks';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import {
  PageLoading,
  SideBarSubHeader,
  SideDrawer,
  TypeForm,
} from '@notional-finance/mui';
import { usePortfolioNOTETable, usePortfolioSideDrawers } from './hooks';
import { SideNav, PortfolioMobileNav, EmptyPortfolio } from './components';
import {
  PortfolioOverview,
  PortfolioVaults,
  PortfolioTransactionHistory,
  PortfolioStateZero,
  PortfolioHoldings,
  PortfolioNoteStaking,
} from './containers';
import { useSideDrawerManager } from '@notional-finance/notionable-hooks';
import {
  PORTFOLIO_ACTIONS,
  PORTFOLIO_CATEGORIES,
} from '@notional-finance/util';
import { defineMessage } from 'react-intl';
import { observer } from 'mobx-react-lite';

export interface PortfolioParams extends Record<string, string | undefined> {
  category?: PORTFOLIO_CATEGORIES;
  sideDrawerKey?: PORTFOLIO_ACTIONS;
  selectedToken?: string;
  action?: string;
  selectedCollateralToken?: string;
}

export const PortfolioFeatureShell = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const params = useParams<PortfolioParams>();
  const network = useSelectedNetwork();
  const isAccountLoading = useAccountLoading();
  const isAcctAndBalanceReady = useAccountAndBalanceReady(network);
  const { hasNoteOrSNote } = usePortfolioNOTETable();

  useEffect(() => {
    if (
      !isAccountLoading &&
      !hasNoteOrSNote &&
      !isAcctAndBalanceReady &&
      params.sideDrawerKey !== 'cool-down'
    ) {
      const toggleKey = params.sideDrawerKey ? params.sideDrawerKey : '';
      navigate(
        `/portfolio/${network}/${PORTFOLIO_CATEGORIES.WELCOME}/${toggleKey}`
      );
    }
  }, [
    isAccountLoading,
    hasNoteOrSNote,
    isAcctAndBalanceReady,
    navigate,
    network,
    params.sideDrawerKey,
  ]);

  return !network || isAccountLoading ? (
    <PortfolioContainer>
      <PageLoading
        sx={{
          background: theme.palette.background.paper,
          width: '100%',
          height: '100vh',
          zIndex: 5,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        type="notional"
      />
    </PortfolioContainer>
  ) : (
    <Portfolio />
  );
};

const Portfolio = () => {
  const params = useParams<PortfolioParams>();
  const { clearSideDrawer } = useSideDrawerManager();
  const { SideDrawerComponent, openDrawer } = usePortfolioSideDrawers();
  const network = useSelectedNetwork();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isAccountReady = useAccountReady(network);
  const isAcctAndBalanceReady = useAccountAndBalanceReady(network);
  const { hasNoteOrSNote } = usePortfolioNOTETable();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [params.category]);

  useEffect(() => {
    if (params.category && params.category !== PORTFOLIO_CATEGORIES.WELCOME) {
      clearSideDrawer(
        `/portfolio/${network}/${
          params?.category || PORTFOLIO_CATEGORIES.OVERVIEW
        }`
      );
    }
    // NOTE: this must only run once on component mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDrawer = () => {
    if (pathname.includes('convertTo')) {
      navigate(
        `/portfolio/${network}/${params?.category}/${params?.sideDrawerKey}/${params?.selectedToken}/manage`
      );
    } else {
      clearSideDrawer(
        `/portfolio/${network}/${
          params?.category || PORTFOLIO_CATEGORIES.OVERVIEW
        }`
      );
    }
  };

  const CustomHeader = ({ onClose }: any) => {
    return (
      <CustomHeaderContainer>
        <SideBarSubHeader
          callback={() => onClose()}
          titleText={defineMessage({ defaultMessage: 'Back' })}
        />
      </CustomHeaderContainer>
    );
  };

  return isAcctAndBalanceReady ? (
    <PortfolioContainer>
      <SideDrawer
        callback={handleDrawer}
        openDrawer={openDrawer}
        CustomHeader={CustomHeader}
        zIndex={1202}
      >
        {SideDrawerComponent && <SideDrawerComponent />}
      </SideDrawer>
      <PortfolioSidebar>
        <SideNav />
      </PortfolioSidebar>
      {params.category !== PORTFOLIO_CATEGORIES.WELCOME && (
        <PortfolioMainContent>
          {(params.category === PORTFOLIO_CATEGORIES.OVERVIEW ||
            params.category === undefined) && (
            <>
              <PortfolioOverview />
              <TypeForm />
            </>
          )}
          {params.category === PORTFOLIO_CATEGORIES.HOLDINGS && (
            <PortfolioHoldings />
          )}
          {params.category === PORTFOLIO_CATEGORIES.LEVERAGED_VAULTS && (
            <PortfolioVaults />
          )}
          {params.category === PORTFOLIO_CATEGORIES.NOTE_STAKING && (
            <PortfolioNoteStaking />
          )}
          {params.category === PORTFOLIO_CATEGORIES.TRANSACTION_HISTORY && (
            <PortfolioTransactionHistory />
          )}
        </PortfolioMainContent>
      )}
      {params.category === PORTFOLIO_CATEGORIES.WELCOME && (
        <PortfolioStateZero />
      )}
      <PortfolioMobileNav />
    </PortfolioContainer>
  ) : (
    <PortfolioContainer>
      {hasNoteOrSNote && isAccountReady && (
        <PortfolioSidebar>
          <SideNav />
        </PortfolioSidebar>
      )}
      {hasNoteOrSNote && isAccountReady && (
        <SideDrawer
          callback={handleDrawer}
          openDrawer={openDrawer}
          CustomHeader={CustomHeader}
          zIndex={1202}
        >
          {SideDrawerComponent && <SideDrawerComponent />}
        </SideDrawer>
      )}

      {params.category === PORTFOLIO_CATEGORIES.WELCOME && (
        <>
          <PortfolioStateZero />
          <TypeForm />
        </>
      )}
      {params.category === PORTFOLIO_CATEGORIES.NOTE_STAKING &&
        hasNoteOrSNote && (
          <PortfolioMainContent>
            <PortfolioNoteStaking />
          </PortfolioMainContent>
        )}
      {params.category !== PORTFOLIO_CATEGORIES.NOTE_STAKING &&
        params.category !== PORTFOLIO_CATEGORIES.WELCOME &&
        hasNoteOrSNote && (
          <PortfolioMainContent>
            <EmptyPortfolio />
          </PortfolioMainContent>
        )}
    </PortfolioContainer>
  );
};

const PortfolioContainer = styled(Box)(
  ({ theme }) => `
  display: flex;
  min-height: 100vh;
  ${theme.breakpoints.down('sm')} {
    flex-flow: column;
    max-width: 90%;
    margin: auto;
  };`
);

const PortfolioSidebar = styled(Box)(
  ({ theme }) => `
  width: ${theme.spacing(39)};
  background: ${theme.palette.background.paper};
  border-right: ${theme.shape.borderStandard};
  ${theme.breakpoints.down('xxl')} {
    width: ${theme.spacing(10)};
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
  margin: ${theme.spacing(14, 8)};
  overflow: hidden;
  ${theme.breakpoints.up('xxl')} {
    max-width: ${theme.spacing(161)};
    margin: ${theme.spacing(14)} auto;
  }
  ${theme.breakpoints.down('sm')} {
    min-width: 100%;
    max-width: 70vw;
    margin: ${theme.spacing(10)} auto;
  };
`
);

const CustomHeaderContainer = styled(Box)(
  ({ theme }) => `
  padding: ${theme.spacing(0, 6)};
  padding-top: ${theme.spacing(11)};
  ${theme.breakpoints.down('sm')} {
    padding: 0px;
    padding-top: ${theme.spacing(11)};
    width: 90%;
    margin: auto;
  }
`
);

export default observer(PortfolioFeatureShell);
