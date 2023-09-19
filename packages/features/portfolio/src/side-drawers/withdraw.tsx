import { PORTFOLIO_ACTIONS } from '@notional-finance/util';
import { PortfolioSideDrawer } from './components/portfolio-side-drawer';
import { useTradeContext } from '@notional-finance/notionable-hooks';
import { PortfolioParams } from '../portfolio-feature-shell';
import { useParams } from 'react-router';
import { DepositInput, PortfolioHoldingSelect } from '@notional-finance/trade';
import { messages } from './messages';
import { useMaxWithdraw } from './hooks/use-max-withdraw';
import { useEffect } from 'react';

export const Withdraw = () => {
  const context = useTradeContext('Withdraw');
  const { category, sideDrawerKey } = useParams<PortfolioParams>();
  const { currencyInputRef, setCurrencyInput, onMaxValue } =
    useMaxWithdraw(context);

  const {
    state: { debt },
  } = context;

  useEffect(() => {
    setCurrencyInput('');
  }, [debt?.id, setCurrencyInput]);

  return (
    <PortfolioSideDrawer context={context}>
      <PortfolioHoldingSelect
        tightMarginTop
        isWithdraw
        context={context}
        inputLabel={messages[PORTFOLIO_ACTIONS.WITHDRAW]['inputLabel']}
        filterBalances={(b) =>
          b.isPositive() &&
          (b.tokenType === 'PrimeCash' ||
            b.tokenType === 'fCash' ||
            b.tokenType === 'nToken')
        }
      />
      <DepositInput
        ref={currencyInputRef}
        isWithdraw
        context={context}
        inputRef={currencyInputRef}
        onMaxValue={onMaxValue}
        newRoute={(newToken) =>
          `/portfolio/${category}/${sideDrawerKey}/${newToken}`
        }
        inputLabel={messages[PORTFOLIO_ACTIONS.WITHDRAW]['inputLabel']}
      />
    </PortfolioSideDrawer>
  );
};
