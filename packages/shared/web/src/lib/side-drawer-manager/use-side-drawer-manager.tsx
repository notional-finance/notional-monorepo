import { SIDEBAR_CATEGORIES, PORTFOLIO_ACTIONS, SIDE_DRAWERS } from '@notional-finance/utils';
import { useSideDrawerState } from './store/use-side-drawer-state';
import {
  AddToCalendar,
  DepositCollateral,
  Withdraw,
  RepayBorrow,
  RollMaturity,
  WithdrawLend,
  RepayCash,
  RedeemNToken,
  WithdrawVault,
  DeleverageVault,
} from '@notional-finance/portfolio-feature-shell';
import {
  SettingsSideDrawer,
  NotificationsSideDrawer,
  ConnectWalletSideDrawer,
} from '@notional-finance/wallet';

const GetNotified = () => {
  return <div>Get Notified</div>;
};
const RemindMe = () => {
  return <div>Remind Me</div>;
};
const ConvertCashToNToken = () => {
  return <div>Convert Cash To nTokens</div>;
};

export const useSideDrawerManager = (key?: SIDE_DRAWERS) => {
  const { sideDrawerOpen } = useSideDrawerState();

  const sideDrawers: Record<SIDE_DRAWERS, React.ElementType> = {
    [SIDEBAR_CATEGORIES.SETTINGS]: SettingsSideDrawer,
    [SIDEBAR_CATEGORIES.NOTIFICATIONS]: NotificationsSideDrawer,
    [SIDEBAR_CATEGORIES.CONNECT_WALLET]: ConnectWalletSideDrawer,
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
  };

  const SideDrawerComponent = key && sideDrawers[key] ? sideDrawers[key] : undefined;
  const drawerOpen = sideDrawerOpen && SideDrawerComponent ? true : false;

  return {
    currentSideDrawerId: key,
    SideDrawerComponent,
    drawerOpen,
  };
};
