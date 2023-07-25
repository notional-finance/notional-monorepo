import { PORTFOLIO_ACTIONS } from '@notional-finance/shared-config';
import { PortfolioSideDrawer } from '../components/portfolio-side-drawer';
import { BaseContext } from '@notional-finance/notionable-hooks';

export const Withdraw = () => {
  return (
    <PortfolioSideDrawer
      context={undefined as unknown as BaseContext}
      action={PORTFOLIO_ACTIONS.WITHDRAW}
      canSubmit={false}
    >
      <div>Withdraw</div>
    </PortfolioSideDrawer>
  );
};
