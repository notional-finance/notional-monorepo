import { useCallback, useContext } from 'react';
import { defineMessage } from 'react-intl';
import { useCurrencyInputRef } from '@notional-finance/mui';
import { DepositInput, TransactionSidebar } from '@notional-finance/trade';
import { PRODUCTS } from '@notional-finance/shared-config';
import { LendVariableContext } from '../../lend-variable/lend-variable';
import { useHistory } from 'react-router';

export const LendVariableSidebar = () => {
  const history = useHistory();
  const {
    state: { selectedDepositToken },
  } = useContext(LendVariableContext);
  const { currencyInputRef } = useCurrencyInputRef();

  const handleLeverUpToggle = useCallback(() => {
    history.push(`/${PRODUCTS.LEND_LEVERAGED}/${selectedDepositToken}`, {
      from: PRODUCTS.LEND_VARIABLE,
    });
  }, [history, selectedDepositToken]);

  return (
    <TransactionSidebar
      handleLeverUpToggle={handleLeverUpToggle}
      context={LendVariableContext}
    >
      <DepositInput
        ref={currencyInputRef}
        inputRef={currencyInputRef}
        context={LendVariableContext}
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
