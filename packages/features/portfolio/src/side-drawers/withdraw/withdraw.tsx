import { PORTFOLIO_ACTIONS } from '@notional-finance/shared-config';
import { PortfolioSideDrawer } from '../components/portfolio-side-drawer';

export const Withdraw = () => {
  return (
    <PortfolioSideDrawer action={PORTFOLIO_ACTIONS.WITHDRAW} canSubmit={false}>
      <div>Withdraw</div>
    </PortfolioSideDrawer>
  );
};
