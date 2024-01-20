import { useCurrencyInputRef } from '@notional-finance/mui';
import {
  DepositInput,
  MaturitySelect,
  TransactionSidebar,
} from '@notional-finance/trade';
import { PRODUCTS } from '@notional-finance/util';
import { defineMessage } from 'react-intl';
import { BorrowFixedContext } from '../borrow-fixed';
import { useContext } from 'react';
import { usePrimeCashBalance } from '@notional-finance/notionable-hooks';

export const BorrowFixedSidebar = () => {
  const { currencyInputRef } = useCurrencyInputRef();
  const context = useContext(BorrowFixedContext);
  const {
    state: { selectedDepositToken, selectedNetwork },
  } = context;
  const cashBalance = usePrimeCashBalance(
    selectedDepositToken,
    selectedNetwork
  );

  return (
    <TransactionSidebar
      context={context}
      showDrawer
      isWithdraw
      // If the cash balance is negative, then the account will require
      // prime borrow to be enabled, even though a further negative balance
      // will not be incurred
      variableBorrowRequired={cashBalance?.isNegative()}
    >
      <DepositInput
        isWithdraw
        showScrollPopper
        ref={currencyInputRef}
        inputRef={currencyInputRef}
        context={context}
        newRoute={(newToken) =>
          `/${PRODUCTS.BORROW_FIXED}/${selectedNetwork}/${newToken}`
        }
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
