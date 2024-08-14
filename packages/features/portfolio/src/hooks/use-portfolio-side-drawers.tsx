import { PORTFOLIO_ACTIONS } from '@notional-finance/util';
import { useSideDrawerState } from '@notional-finance/notionable-hooks';
import {
  AddToCalendar,
  ConvertAsset,
  DepositCollateral,
  RollDebt,
  Withdraw,
  Deleverage,
  RepayDebt,
  CoolDownDrawer,
} from '../side-drawers';

export const usePortfolioSideDrawers = () => {
  const { sideDrawerOpen, currentSideDrawerKey } = useSideDrawerState();

  const drawers = {
    [PORTFOLIO_ACTIONS.DEPOSIT]: DepositCollateral,
    [PORTFOLIO_ACTIONS.WITHDRAW]: Withdraw,
    [PORTFOLIO_ACTIONS.CONVERT_ASSET]: ConvertAsset,
    [PORTFOLIO_ACTIONS.ROLL_DEBT]: RollDebt,
    [PORTFOLIO_ACTIONS.DELEVERAGE]: Deleverage,
    [PORTFOLIO_ACTIONS.REPAY_DEBT]: RepayDebt,
    [PORTFOLIO_ACTIONS.ADD_TO_CALENDAR]: AddToCalendar,
    [PORTFOLIO_ACTIONS.COOL_DOWN]: CoolDownDrawer,
  };

  const SideDrawerComponent =
    currentSideDrawerKey && drawers[currentSideDrawerKey]
      ? drawers[currentSideDrawerKey]
      : null;

  const openDrawer = SideDrawerComponent && sideDrawerOpen ? true : false;

  return { SideDrawerComponent, openDrawer, currentSideDrawerKey };
};

export default usePortfolioSideDrawers;
