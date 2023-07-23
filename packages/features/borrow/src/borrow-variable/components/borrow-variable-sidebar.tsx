import { useContext } from 'react';
import { ActionSidebar, useCurrencyInputRef } from '@notional-finance/mui';
import {
  TradeActionButton,
  Confirmation2,
  DepositInput,
} from '@notional-finance/trade';
import { PRODUCTS } from '@notional-finance/shared-config';
import { defineMessage, FormattedMessage } from 'react-intl';
import { BorrowVariableContext } from '../borrow-variable';

export const BorrowVariableSidebar = () => {
  const {
    state: { canSubmit, populatedTransaction, confirm },
    updateState,
  } = useContext(BorrowVariableContext);
  const { currencyInputRef } = useCurrencyInputRef();
  const handleSubmit = () => {
    updateState({ confirm: true });
  };

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
        context={BorrowVariableContext}
        newRoute={(newToken) => `/${PRODUCTS.BORROW_VARIABLE}/${newToken}`}
        inputLabel={defineMessage({
          defaultMessage: '1. How much do you want to borrow?',
          description: 'input label',
        })}
      />
      {/** TODO: add a warning for withdrawing cash */}
      {/** TODO: add enable prime borrow */}
    </ActionSidebar>
  );
};

export default BorrowVariableSidebar;
