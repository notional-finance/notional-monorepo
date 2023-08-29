import { useContext } from 'react';
import { ErrorMessage, useCurrencyInputRef } from '@notional-finance/mui';
import {
  DepositInput,
  EnablePrimeBorrow,
  TransactionSidebar,
  tradeErrors,
} from '@notional-finance/trade';
import { PRODUCTS } from '@notional-finance/shared-config';
import { FormattedMessage, defineMessage } from 'react-intl';
import { BorrowVariableContext } from '../borrow-variable';
import { usePrimeCashBalance } from '@notional-finance/notionable-hooks';

export const BorrowVariableSidebar = () => {
  const context = useContext(BorrowVariableContext);
  const {
    state: { selectedDepositToken, debtOptions },
  } = context;
  const { currencyInputRef } = useCurrencyInputRef();
  const cashBalance = usePrimeCashBalance(selectedDepositToken);
  const insufficientLiquidity = debtOptions?.find((_) => !!_)?.error
    ? tradeErrors.insufficientLiquidity
    : undefined;

  return (
    <TransactionSidebar context={context}>
      <DepositInput
        ref={currencyInputRef}
        inputRef={currencyInputRef}
        isWithdraw
        context={context}
        newRoute={(newToken) => `/${PRODUCTS.BORROW_VARIABLE}/${newToken}`}
        inputLabel={defineMessage({
          defaultMessage: '1. How much do you want to borrow?',
          description: 'input label',
        })}
        errorMsgOverride={insufficientLiquidity}
      />
      {cashBalance?.isPositive() && (
        <ErrorMessage
          variant="warning"
          title={<FormattedMessage defaultMessage="Existing Cash Balance" />}
          message={
            <FormattedMessage
              defaultMessage="Existing positive balance of {balance} will be withdrawn during the borrow."
              values={{
                balance: cashBalance
                  .toUnderlying()
                  .toDisplayStringWithSymbol(2, true),
              }}
            />
          }
        />
      )}
      <EnablePrimeBorrow />
    </TransactionSidebar>
  );
};

export default BorrowVariableSidebar;
