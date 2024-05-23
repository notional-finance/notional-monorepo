import { useEffect } from 'react';
import { Box, styled } from '@mui/material';
import {
  useAccountLoading,
  useAccountReady,
  useSelectedNetwork,
} from '@notional-finance/notionable-hooks';
import { useHistory, useLocation, useParams } from 'react-router-dom';
import {
  ButtonBar,
  SideBarSubHeader,
  SideDrawer,
  TypeForm,
} from '@notional-finance/mui';
import { usePortfolioButtonBar, usePortfolioSideDrawers } from './hooks';
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
  PortfolioNoteStaking,
} from './containers';
import { useSideDrawerManager } from '@notional-finance/side-drawer';
import {
  PORTFOLIO_ACTIONS,
  PORTFOLIO_CATEGORIES,
} from '@notional-finance/util';
import { FeatureLoader } from '@notional-finance/shared-web';
import { PortfolioNetworkSelector } from '@notional-finance/wallet';
import { defineMessage } from 'react-intl';

export interface PortfolioParams {
  category?: PORTFOLIO_CATEGORIES;
  sideDrawerKey?: PORTFOLIO_ACTIONS;
  selectedToken?: string;
  action?: string;
  selectedCollateralToken?: string;
}

export const PortfolioFeatureShell = () => {
  const network = useSelectedNetwork();
  const isAccountLoading = useAccountLoading();

  return (
    <FeatureLoader featureLoaded={network && !isAccountLoading}>
      <Portfolio />
    </FeatureLoader>
  );
};

const Portfolio = () => {
  const params = useParams<PortfolioParams>();
  const { clearSideDrawer } = useSideDrawerManager();
  const { SideDrawerComponent, openDrawer } = usePortfolioSideDrawers();
  const network = useSelectedNetwork();
  const history = useHistory();
  const { pathname } = useLocation();
  const isAccountReady = useAccountReady(network);
  const buttonData = usePortfolioButtonBar();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [params.category]);

  useEffect(() => {
    clearSideDrawer(
      `/portfolio/${network}/${
        params?.category || PORTFOLIO_CATEGORIES.OVERVIEW
      }`
    );
    // NOTE: this must only run once on component mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDrawer = () => {
    if (pathname.includes('convertTo')) {
      history.push(
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

  return isAccountReady ? (
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
      <PortfolioMainContent>
        {params.category !== PORTFOLIO_CATEGORIES.NOTE_STAKING && (
          <ActionButtonRow>
            {params.category === PORTFOLIO_CATEGORIES.HOLDINGS && (
              <ButtonBar buttonOptions={buttonData} />
            )}
            {params.category === PORTFOLIO_CATEGORIES.HOLDINGS ||
              (params.category === PORTFOLIO_CATEGORIES.OVERVIEW && (
                <ClaimNoteButton />
              ))}
            <PortfolioNetworkSelector />
          </ActionButtonRow>
        )}
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
          <>
            <EmptyPortfolioOverview walletConnected={false} />
            <TypeForm />
          </>
        ) : (
          <EmptyPortfolio />
        )}
      </PortfolioMainContent>
    </PortfolioContainer>
  );
};

const ActionButtonRow = styled(Box)(
  ({ theme }) => `
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: ${theme.spacing(3)};
  ${theme.breakpoints.down('sm')} {
    flex-direction: column-reverse;
    align-items: baseline;
    justify-content: flex-start;
  }
`
);

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

export default PortfolioFeatureShell;
