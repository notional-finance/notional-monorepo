import { PORTFOLIO_ACTIONS } from '@notional-finance/shared-config';
import {
  useSideDrawerState,
  RemindMe,
  GetNotified,
} from '@notional-finance/side-drawer';
import {
  AddToCalendar,
  ConvertCashToNTokens,
  DepositCollateral,
  RedeemNToken,
  RepayBorrow,
  RepayCash,
  Withdraw,
  WithdrawLend,
  ManageMaturities,
} from '../side-drawers';
import { ManageVault } from '@notional-finance/trade';

export const usePortfolioSideDrawers = () => {
  const { sideDrawerOpen, currentSideDrawerKey } = useSideDrawerState();

  const drawers = {
    [PORTFOLIO_ACTIONS.REPAY_BORROW]: RepayBorrow,
    [PORTFOLIO_ACTIONS.WITHDRAW_LEND]: WithdrawLend,
    [PORTFOLIO_ACTIONS.REPAY_CASH_DEBT]: RepayCash,
    [PORTFOLIO_ACTIONS.REPAY_IFCASH_BORROW]: RepayCash,
    [PORTFOLIO_ACTIONS.REDEEM_NTOKEN]: RedeemNToken,
    [PORTFOLIO_ACTIONS.CONVERT_CASH]: ConvertCashToNTokens,
    [PORTFOLIO_ACTIONS.REMIND_ME]: RemindMe,
    [PORTFOLIO_ACTIONS.DEPOSIT]: DepositCollateral,
    [PORTFOLIO_ACTIONS.WITHDRAW]: Withdraw,
    [PORTFOLIO_ACTIONS.GET_NOTIFIED]: GetNotified,
    // TODO: deleverage might need to change
    [PORTFOLIO_ACTIONS.DELEVERAGE]: RedeemNToken,
    [PORTFOLIO_ACTIONS.ADD_TO_CALENDAR]: AddToCalendar,
    [PORTFOLIO_ACTIONS.MANAGE_VAULT]: ManageVault,
    [PORTFOLIO_ACTIONS.MANAGE_LEND]: ManageMaturities,
    [PORTFOLIO_ACTIONS.MANAGE_BORROW]: ManageMaturities,
  };

  const SideDrawerComponent =
    currentSideDrawerKey && drawers[currentSideDrawerKey]
      ? drawers[currentSideDrawerKey]
      : null;

  const openDrawer = SideDrawerComponent && sideDrawerOpen ? true : false;

  return { SideDrawerComponent, openDrawer };
};

export default usePortfolioSideDrawers;
