import { useEffect } from 'react';
import { Box, styled, useTheme } from '@mui/material';
import { useAccount } from '@notional-finance/notionable-hooks';
import { useParams } from 'react-router-dom';
import { ButtonBar, SideDrawer, FeatureLoader } from '@notional-finance/mui';
import { usePortfolioButtonBar, usePortfolioSideDrawers } from './hooks';
import {
  SideNav,
  PortfolioMobileNav,
  ClaimNoteButton,
  DeprecationMessage,
  BorrowMigration,
} from './components';
import {
  PortfolioLends,
  PortfolioBorrows,
  PortfolioLiquidity,
  PortfolioVaults,
  PortfolioMoneyMarket,
  PortfolioTransactionHistory,
} from './containers';
import { useSideDrawerManager } from '@notional-finance/side-drawer';
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
  const params = useParams<PortfolioParams>();
  const { clearSideDrawer } = useSideDrawerManager();
  const { SideDrawerComponent, openDrawer } = usePortfolioSideDrawers();
  const buttonData = usePortfolioButtonBar();
  const { accountConnected, account } = useAccount();

  const remainingBorrowers = {
    '0x22426773981251028a08fdb17e799fa2f55c203a':
      '0xcc57354e7e6a13d519dec111a781823f9aa058c6',
    '0x37a5183592de2f96639c2954a29e60d6062b44a1':
      '0x9ca55348524a85148b17e053e16e6e2f2d8b7d29',
    '0x4dc99e6867c60c002c04c1c9ad2d75fff928bfd5':
      '0x5699cae66db88b06cd73b26f00b918e0691b64c2',
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [params.category]);

  const handleDrawer = () => {
    clearSideDrawer(
      `/portfolio/${params?.category || PORTFOLIO_CATEGORIES.OVERVIEW}`
    );
  };

  return (
    <FeatureLoader>
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
          {accountConnected &&
            params.category !== PORTFOLIO_CATEGORIES.LEVERAGED_VAULTS && (
              <Box sx={{ justifyContent: 'flex-end', display: 'flex' }}>
                {buttonData && buttonData.length > 0 && (
                  <ButtonBar
                    buttonOptions={buttonData}
                    sx={{
                      marginBottom: theme.spacing(1),
                      height: theme.spacing(5),
                    }}
                  />
                )}
                <ClaimNoteButton />
              </Box>
            )}
          {(params.category === PORTFOLIO_CATEGORIES.OVERVIEW ||
            params.category === undefined) && <DeprecationMessage />}
          {(params.category === PORTFOLIO_CATEGORIES.OVERVIEW ||
            params.category === undefined) &&
            account?.address &&
            remainingBorrowers[account?.address] && (
              <BorrowMigration
                safeAddress={remainingBorrowers[account?.address]}
              />
            )}
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
        <PortfolioMobileNav />
      </PortfolioContainer>
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
    max-width: 1440px;
  };
`
);

const PortfolioSidebar = styled(Box)(
  ({ theme }) => `
  width: ${theme.spacing(39)};
  ${theme.breakpoints.down('lg')} {
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
