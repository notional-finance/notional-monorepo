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
  ConvertCashToNToken,
  updateSideDrawerState,
  useSideDrawerManager,
  RemindMe,
  GetNotified,
} from '@notional-finance/shared-web';
import {
  PORTFOLIO_ACTIONS,
  PORTFOLIO_CATEGORIES,
  SIDE_DRAWERS,
} from '@notional-finance/shared-config';
import {
  AddToCalendar,
  DeleverageVault,
  DepositCollateral,
  RedeemNToken,
  RepayBorrow,
  RepayCash,
  RollMaturity,
  Withdraw,
  WithdrawLend,
  WithdrawVault,
} from './side-drawers';

export interface PortfolioParams {
  category?: PORTFOLIO_CATEGORIES;
  sideDrawerKey?: PORTFOLIO_ACTIONS;
}

export const PortfolioFeatureShell = () => {
  const history = useHistory();
  const theme = useTheme();
  const params = useParams<PortfolioParams>();
  const { SideDrawerComponent, drawerOpen, addSideDrawers } =
    useSideDrawerManager(params.sideDrawerKey);

  const { buttonData } = usePortfolioButtonBar();

  const { accountConnected } = useAccount();

  useEffect(() => {
    addSideDrawers({
      [PORTFOLIO_ACTIONS.REPAY_BORROW]: RepayBorrow,
      [PORTFOLIO_ACTIONS.WITHDRAW_LEND]: WithdrawLend,
      [PORTFOLIO_ACTIONS.ROLL_MATURITY]: RollMaturity,
      [PORTFOLIO_ACTIONS.REPAY_CASH_DEBT]: RepayCash,
      [PORTFOLIO_ACTIONS.REPAY_IFCASH_BORROW]: RepayCash,
      [PORTFOLIO_ACTIONS.REDEEM_NTOKEN]: RedeemNToken,
      [PORTFOLIO_ACTIONS.CONVERT_CASH]: ConvertCashToNToken,
      [PORTFOLIO_ACTIONS.REMIND_ME]: RemindMe,
      [PORTFOLIO_ACTIONS.DEPOSIT]: DepositCollateral,
      [PORTFOLIO_ACTIONS.WITHDRAW]: Withdraw,
      [PORTFOLIO_ACTIONS.GET_NOTIFIED]: GetNotified,
      // TODO: deleverage might need to change
      [PORTFOLIO_ACTIONS.DELEVERAGE]: RedeemNToken,
      [PORTFOLIO_ACTIONS.DELEVERAGE_VAULT]: DeleverageVault,
      [PORTFOLIO_ACTIONS.DELEVERAGE_VAULT_SELL_ASSETS]: DeleverageVault,
      [PORTFOLIO_ACTIONS.DELEVERAGE_VAULT_DEPOSIT]: DeleverageVault,
      [PORTFOLIO_ACTIONS.WITHDRAW_VAULT]: WithdrawVault,
      [PORTFOLIO_ACTIONS.WITHDRAW_VAULT_POST_MATURITY]: WithdrawVault,
      [PORTFOLIO_ACTIONS.ADD_TO_CALENDAR]: AddToCalendar,
    } as Record<PORTFOLIO_ACTIONS, React.ElementType>);
  }, [addSideDrawers]);

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
// max-width: 1312px is necessary for portfolio page to render correctly on laptops
// We should consider adding a 1280px breakpoint in the future

const PortfolioContainer = styled(Box)(
  ({ theme }) => `
  display: flex;
  gap: 64px;
  margin: 64px;
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
    max-width: 1312px;
  };

  ${theme.breakpoints.up('xl')} {
    margin: 80px 64px;
    max-width: unset;
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
