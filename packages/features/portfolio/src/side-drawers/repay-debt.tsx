import { PortfolioSideDrawer } from './components/portfolio-side-drawer';
import { PORTFOLIO_ACTIONS } from '@notional-finance/shared-config';
import { PortfolioHoldingSelect, DepositInput } from '@notional-finance/trade';
import { messages } from './messages';
import { useCurrencyInputRef } from '@notional-finance/mui';
import {
  createTradeContext,
  useTradeContext,
} from '@notional-finance/notionable-hooks';
import { useParams } from 'react-router';
import { PortfolioParams } from '@notional-finance/side-drawer';

const RepayDebtContext = createTradeContext('RepayDebt');

export const RepayDebt = () => {
  const context = useTradeContext('RepayDebt');
  const { currencyInputRef } = useCurrencyInputRef();
  const { category, sideDrawerKey } = useParams<PortfolioParams>();

  return (
    <RepayDebtContext.Provider value={context}>
      <PortfolioSideDrawer
        context={RepayDebtContext}
        action={PORTFOLIO_ACTIONS.REPAY_BORROW}
      >
        <PortfolioHoldingSelect
          tightMarginTop
          isWithdraw
          context={RepayDebtContext}
          inputLabel={messages[PORTFOLIO_ACTIONS.REPAY_BORROW]['inputLabel']}
          filterBalances={(b) =>
            b.isNegative() &&
            (b.tokenType === 'PrimeDebt' || b.tokenType === 'fCash')
          }
        />
        <DepositInput
          context={RepayDebtContext}
          inputRef={currencyInputRef}
          newRoute={(newToken) =>
            `/portfolio/${category}/${sideDrawerKey}/${newToken}`
          }
          inputLabel={messages[PORTFOLIO_ACTIONS.REPAY_BORROW]['inputLabel']}
        />
      </PortfolioSideDrawer>
    </RepayDebtContext.Provider>
  );
};
