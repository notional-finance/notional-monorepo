import { PortfolioSideDrawer } from '../components/portfolio-side-drawer';
import { PORTFOLIO_ACTIONS } from '@notional-finance/shared-config';

export const DepositCollateral = () => {
  return (
    <PortfolioSideDrawer action={PORTFOLIO_ACTIONS.DEPOSIT} canSubmit={false}>
      <div>Deposit</div>
    </PortfolioSideDrawer>
  );
};
