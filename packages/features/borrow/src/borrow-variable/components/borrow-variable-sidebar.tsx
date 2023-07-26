import { useContext } from 'react';
import {
  ActionSidebar,
  ErrorMessage,
  useCurrencyInputRef,
} from '@notional-finance/mui';
import {
  TradeActionButton,
  Confirmation2,
  DepositInput,
  EnablePrimeBorrow,
} from '@notional-finance/trade';
import { PRODUCTS } from '@notional-finance/shared-config';
import { defineMessage, FormattedMessage } from 'react-intl';
import { BorrowVariableContext } from '../borrow-variable';
import { usePrimeCashBalance } from '@notional-finance/notionable-hooks';

export const BorrowVariableSidebar = () => {
  const {
    state: { canSubmit, populatedTransaction, confirm, selectedDepositToken },
    updateState,
  } = useContext(BorrowVariableContext);
  const { currencyInputRef } = useCurrencyInputRef();
  const handleSubmit = () => {
    updateState({ confirm: true });
  };
  const cashBalance = usePrimeCashBalance(selectedDepositToken);

  return confirm && populatedTransaction ? (
    <Confirmation2
      heading={
        <FormattedMessage
          defaultMessage="Borrow Order"
          description="section heading"
        />
      }
      context={BorrowVariableContext}
    />
  ) : (
    <ActionSidebar
      heading={defineMessage({
        defaultMessage: 'Borrow Order',
        description: 'section heading',
      })}
      helptext={defineMessage({
        defaultMessage:
          'Borrow with confidence, fixed rates lock in what you pay.',
        description: 'helptext',
      })}
      CustomActionButton={TradeActionButton}
      canSubmit={canSubmit}
      handleSubmit={handleSubmit}
    >
      <DepositInput
        ref={currencyInputRef}
        inputRef={currencyInputRef}
        isWithdraw
        context={BorrowVariableContext}
        newRoute={(newToken) => `/${PRODUCTS.BORROW_VARIABLE}/${newToken}`}
        inputLabel={defineMessage({
          defaultMessage: '1. How much do you want to borrow?',
          description: 'input label',
        })}
      />
      {cashBalance?.isPositive() && (
        <ErrorMessage
          variant="warning"
          title={defineMessage({ defaultMessage: 'Existing Cash Balance' })}
          message={defineMessage({
            defaultMessage:
              'Existing positive balance of {balance} will be withdrawn during the borrow.',
            value: {
              balance: cashBalance
                .toUnderlying()
                .toDisplayStringWithSymbol(2, true),
            },
          })}
        />
      )}
      <EnablePrimeBorrow />
    </ActionSidebar>
  );
};

export default BorrowVariableSidebar;
