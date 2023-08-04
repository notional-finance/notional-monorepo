import { PortfolioSideDrawer } from './components/portfolio-side-drawer';
import { PORTFOLIO_ACTIONS } from '@notional-finance/shared-config';
import { PortfolioHoldingSelect, DepositInput } from '@notional-finance/trade';
import { messages } from './messages';
import { useCurrencyInputRef } from '@notional-finance/mui';
import { useTradeContext } from '@notional-finance/notionable-hooks';
import { useParams } from 'react-router';
import { PortfolioParams } from '@notional-finance/side-drawer';

export const RepayDebt = () => {
  const context = useTradeContext('RepayDebt');
  const { currencyInputRef } = useCurrencyInputRef();
  const { category, sideDrawerKey } = useParams<PortfolioParams>();

  return (
    <PortfolioSideDrawer context={context}>
      <PortfolioHoldingSelect
        tightMarginTop
        isWithdraw
        context={context}
        inputLabel={messages[PORTFOLIO_ACTIONS.REPAY_DEBT]['inputLabel']}
        filterBalances={(b) =>
          b.isNegative() &&
          (b.tokenType === 'PrimeDebt' || b.tokenType === 'fCash')
        }
      />
      <DepositInput
        context={context}
        inputRef={currencyInputRef}
        newRoute={(newToken) =>
          `/portfolio/${category}/${sideDrawerKey}/${newToken}`
        }
        inputLabel={messages[PORTFOLIO_ACTIONS.REPAY_DEBT]['inputLabel']}
      />
    </PortfolioSideDrawer>
  );
};
