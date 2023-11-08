import { useCallback, useContext } from 'react';
import { defineMessage } from 'react-intl';
import { useCurrencyInputRef } from '@notional-finance/mui';
import {
  DepositInput,
  TransactionSidebar,
  LiquidationRisk,
} from '@notional-finance/trade';
import { PRODUCTS } from '@notional-finance/util';
import { LendVariableContext } from '../../lend-variable/lend-variable';
import { useHistory } from 'react-router';

export const LendVariableSidebar = () => {
  const history = useHistory();
  const context = useContext(LendVariableContext);
  const {
    state: { selectedDepositToken },
  } = context;
  const { currencyInputRef } = useCurrencyInputRef();

  const handleLeverUpToggle = useCallback(() => {
    history.push(`/${PRODUCTS.LEND_LEVERAGED}/${selectedDepositToken}`, {
      from: PRODUCTS.LEND_VARIABLE,
    });
  }, [history, selectedDepositToken]);

  return (
    <TransactionSidebar
      handleLeverUpToggle={handleLeverUpToggle}
      riskComponent={<LiquidationRisk state={context.state} />}
      context={context}
      showDrawer
    >
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
