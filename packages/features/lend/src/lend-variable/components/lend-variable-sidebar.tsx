import { useContext } from 'react';
import { defineMessage } from 'react-intl';
import { useCurrencyInputRef } from '@notional-finance/mui';
import { DepositInput, TransactionSidebar } from '@notional-finance/trade';
import { PRODUCTS } from '@notional-finance/util';
import { LendVariableContext } from '../../lend-variable/lend-variable';

export const LendVariableSidebar = () => {
  const context = useContext(LendVariableContext);
  const { currencyInputRef } = useCurrencyInputRef();

  return (
    <TransactionSidebar context={context} showDrawer>
      <DepositInput
        ref={currencyInputRef}
        inputRef={currencyInputRef}
        context={context}
        newRoute={(newToken) => `/${PRODUCTS.LEND_VARIABLE}/${newToken}`}
        inputLabel={defineMessage({
          defaultMessage: '1. How much do you want to lend?',
          description: 'input label',
        })}
      />
    </TransactionSidebar>
  );
};

export default LendVariableSidebar;
