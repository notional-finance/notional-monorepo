import { PortfolioSideDrawer } from './components/portfolio-side-drawer';
import { PORTFOLIO_ACTIONS } from '@notional-finance/shared-config';
import { PortfolioHoldingSelect, DepositInput } from '@notional-finance/trade';
import { messages } from './messages';
import { useTradeContext } from '@notional-finance/notionable-hooks';
import { useParams } from 'react-router';
import { PortfolioParams } from '@notional-finance/side-drawer';
import { useMaxRepay } from './hooks/use-max-repay';

export const RepayDebt = () => {
  const context = useTradeContext('RepayDebt');
  const { category, sideDrawerKey } = useParams<PortfolioParams>();
  const { currencyInputRef, onMaxValue } = useMaxRepay(context);

  return (
    <PortfolioSideDrawer context={context}>
      <PortfolioHoldingSelect
        tightMarginTop
        context={context}
        inputLabel={messages[PORTFOLIO_ACTIONS.REPAY_DEBT]['inputLabel']}
        filterBalances={(b) =>
          b.isNegative() &&
          (b.tokenType === 'PrimeDebt' || b.tokenType === 'fCash')
        }
      />
      <DepositInput
        ref={currencyInputRef}
        context={context}
        inputRef={currencyInputRef}
        onMaxValue={onMaxValue}
        newRoute={(newToken) =>
          `/portfolio/${category}/${sideDrawerKey}/${newToken}`
        }
        inputLabel={messages[PORTFOLIO_ACTIONS.REPAY_DEBT]['inputLabel']}
      />
    </PortfolioSideDrawer>
  );
};
