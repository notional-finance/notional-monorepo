import { useCallback, useContext } from 'react';
import { defineMessage } from 'react-intl';
import { useCurrencyInputRef } from '@notional-finance/mui';
import {
  DepositInput,
  MaturitySelect,
  TransactionSidebar,
} from '@notional-finance/trade';
import { useHistory } from 'react-router-dom';
import { PRODUCTS } from '@notional-finance/shared-config';
import { LendFixedContext } from '../../lend-fixed/lend-fixed';

export const LendFixedSidebar = () => {
  const history = useHistory();
  const {
    state: { selectedDepositToken },
  } = useContext(LendFixedContext);
  const { currencyInputRef } = useCurrencyInputRef();

  const handleLeverUpToggle = useCallback(() => {
    history.push(`/${PRODUCTS.LEND_LEVERAGED}/${selectedDepositToken}`, {
      from: PRODUCTS.LEND_FIXED,
    });
  }, [history, selectedDepositToken]);

  return (
    <TransactionSidebar
      handleLeverUpToggle={handleLeverUpToggle}
      context={LendFixedContext}
    >
      <DepositInput
        ref={currencyInputRef}
        inputRef={currencyInputRef}
        context={LendFixedContext}
        newRoute={(newToken) => `/${PRODUCTS.LEND_FIXED}/${newToken}`}
        inputLabel={defineMessage({
          defaultMessage: '1. How much do you want to lend?',
          description: 'input label',
        })}
      />
      <MaturitySelect
        context={LendFixedContext}
        category={'Collateral'}
        inputLabel={defineMessage({
          defaultMessage: '2. Select a maturity & fix your rate',
          description: 'input label',
        })}
      />
    </TransactionSidebar>
  );
};

export default LendFixedSidebar;
