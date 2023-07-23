import { useContext } from 'react';
import { ActionSidebar, useCurrencyInputRef } from '@notional-finance/mui';
import {
  TradeActionButton,
  Confirmation2,
  DepositInput,
  MaturitySelect,
} from '@notional-finance/trade';
import { PRODUCTS } from '@notional-finance/shared-config';
import { defineMessage, FormattedMessage } from 'react-intl';
import { BorrowFixedContext } from '../borrow-fixed';

export const BorrowFixedSidebar = () => {
  const {
    state: { canSubmit, populatedTransaction, confirm },
    updateState,
  } = useContext(BorrowFixedContext);
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
      context={BorrowFixedContext}
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
      handleSubmit={handleSubmit}
      CustomActionButton={TradeActionButton}
      canSubmit={canSubmit}
    >
      <DepositInput
        ref={currencyInputRef}
        inputRef={currencyInputRef}
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
    </ActionSidebar>
  );
};

export default BorrowFixedSidebar;
