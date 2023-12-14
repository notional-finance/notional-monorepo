import { PortfolioSideDrawer } from './components/portfolio-side-drawer';
import { PORTFOLIO_ACTIONS } from '@notional-finance/util';
import {
  PortfolioHoldingSelect,
  DepositInput,
  useMaxRepay,
} from '@notional-finance/trade';
import { messages } from './messages';
import { useTradeContext } from '@notional-finance/notionable-hooks';
import { useParams } from 'react-router';
import { PortfolioParams } from '@notional-finance/side-drawer';
import { useEffect } from 'react';

export const RepayDebt = () => {
  const context = useTradeContext('RepayDebt');
  const { category, sideDrawerKey } = useParams<PortfolioParams>();
  const {
    currencyInputRef,
    setCurrencyInput,
    onMaxValue,
    errorMsg,
    requiredApprovalAmount,
  } = useMaxRepay(context);
  const {
    state: { collateral },
  } = context;

  useEffect(() => {
    setCurrencyInput('');
  }, [collateral?.id, setCurrencyInput]);

  return (
    <PortfolioSideDrawer
      context={context}
      requiredApprovalAmount={requiredApprovalAmount}
    >
      <PortfolioHoldingSelect
        context={context}
        inputLabel={messages[PORTFOLIO_ACTIONS.REPAY_DEBT]['inputLabel']}
        filterBalances={(b) =>
          b.isNegative() &&
          (b.tokenType === 'PrimeCash' || b.tokenType === 'fCash')
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
        inputLabel={messages[PORTFOLIO_ACTIONS.REPAY_DEBT]['inputLabelTwo']}
        errorMsgOverride={errorMsg}
      />
    </PortfolioSideDrawer>
  );
};
