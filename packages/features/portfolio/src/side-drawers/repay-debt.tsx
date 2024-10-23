import { PortfolioSideDrawer } from './components/portfolio-side-drawer';
import { PORTFOLIO_ACTIONS } from '@notional-finance/util';
import {
  PortfolioHoldingSelect,
  DepositInput,
  useMaxRepay,
} from '@notional-finance/trade';
import { messages } from './messages';
import { useTradeContext } from '@notional-finance/notionable-hooks';
import { useLocation, useParams } from 'react-router';
import { PortfolioParams } from '@notional-finance/notionable-hooks';
import { useEffect } from 'react';

export const RepayDebt = () => {
  const context = useTradeContext('RepayDebt');
  const { category, sideDrawerKey } = useParams<PortfolioParams>();
  const { pathname } = useLocation();
  const {
    currencyInputRef,
    setCurrencyInput,
    onMaxValue,
    errorMsg,
    requiredApprovalAmount,
  } = useMaxRepay(context);
  const {
    state: { selectedNetwork },
  } = context;

  useEffect(() => {
    setCurrencyInput('');
    // Ignore the setCurrencyInput dependency here, causes race conditions
    // as the callback is recreated.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <PortfolioSideDrawer
      context={context}
      requiredApprovalAmount={requiredApprovalAmount}
    >
      <PortfolioHoldingSelect
        context={context}
        inputLabel={messages[PORTFOLIO_ACTIONS.REPAY_DEBT]['inputLabel']}
      />
      <DepositInput
        ref={currencyInputRef}
        context={context}
        inputRef={currencyInputRef}
        onMaxValue={onMaxValue}
        newRoute={(newToken) =>
          `/portfolio/${selectedNetwork}/${category}/${sideDrawerKey}/${newToken}`
        }
        inputLabel={messages[PORTFOLIO_ACTIONS.REPAY_DEBT]['inputLabelTwo']}
        errorMsgOverride={errorMsg}
      />
    </PortfolioSideDrawer>
  );
};
