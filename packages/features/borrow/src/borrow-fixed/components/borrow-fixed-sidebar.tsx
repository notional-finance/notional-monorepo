import { useCurrencyInputRef } from '@notional-finance/mui';
import {
  DepositInput,
  MaturitySelect,
  TransactionSidebar,
} from '@notional-finance/trade';
import { PRODUCTS } from '@notional-finance/shared-config';
import { defineMessage } from 'react-intl';
import { BorrowFixedContext } from '../borrow-fixed';

export const BorrowFixedSidebar = () => {
  const { currencyInputRef } = useCurrencyInputRef();

  return (
    <TransactionSidebar context={BorrowFixedContext}>
      <DepositInput
        ref={currencyInputRef}
        inputRef={currencyInputRef}
        isWithdraw
        context={BorrowFixedContext}
        newRoute={(newToken) => `/${PRODUCTS.BORROW_FIXED}/${newToken}`}
        inputLabel={defineMessage({
          defaultMessage: '1. How much do you want to borrow?',
          description: 'input label',
        })}
      />
      <MaturitySelect
        context={BorrowFixedContext}
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
