import { useCurrencyInputRef } from '@notional-finance/mui';
import {
  DepositInput,
  MaturitySelect,
  LiquidationRisk,
  TransactionSidebar,
} from '@notional-finance/trade';
import { PRODUCTS } from '@notional-finance/util';
import { defineMessage } from 'react-intl';
import { BorrowFixedContext } from '../borrow-fixed';
import { useContext } from 'react';

export const BorrowFixedSidebar = () => {
  const { currencyInputRef } = useCurrencyInputRef();
  const context = useContext(BorrowFixedContext);
  const { state } = context;

  return (
    <TransactionSidebar
      context={context}
      showDrawer
      isWithdraw
      riskComponent={<LiquidationRisk state={state} />}
    >
      <DepositInput
        ref={currencyInputRef}
        inputRef={currencyInputRef}
        context={context}
        newRoute={(newToken) => `/${PRODUCTS.BORROW_FIXED}/${newToken}`}
        inputLabel={defineMessage({
          defaultMessage: '1. How much do you want to borrow?',
          description: 'input label',
        })}
      />
      <MaturitySelect
        context={context}
        category={'Debt'}
        inputLabel={defineMessage({
          defaultMessage: '2. Select a maturity & fix your rate',
          description: 'input label',
        })}
      />
    </TransactionSidebar>
  );
};

export default BorrowFixedSidebar;
