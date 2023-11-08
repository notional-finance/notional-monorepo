import { useCallback, useContext } from 'react';
import { defineMessage } from 'react-intl';
import { useCurrencyInputRef } from '@notional-finance/mui';
import {
  DepositInput,
  MaturitySelect,
  LiquidationRisk,
  TransactionSidebar,
} from '@notional-finance/trade';
import { useHistory } from 'react-router-dom';
import { PRODUCTS } from '@notional-finance/util';
import { LendFixedContext } from '../../lend-fixed/lend-fixed';

export const LendFixedSidebar = () => {
  const history = useHistory();
  const context = useContext(LendFixedContext);
  const {
    state: { selectedDepositToken },
  } = context;
  const { currencyInputRef } = useCurrencyInputRef();

  const handleLeverUpToggle = useCallback(() => {
    history.push(`/${PRODUCTS.LEND_LEVERAGED}/${selectedDepositToken}`, {
      from: PRODUCTS.LEND_FIXED,
    });
  }, [history, selectedDepositToken]);

  return (
    <TransactionSidebar
      handleLeverUpToggle={handleLeverUpToggle}
      context={context}
      showDrawer
      riskComponent={<LiquidationRisk state={context.state} />}
    >
      <DepositInput
        ref={currencyInputRef}
        inputRef={currencyInputRef}
        context={context}
        newRoute={(newToken) => `/${PRODUCTS.LEND_FIXED}/${newToken}`}
        inputLabel={defineMessage({
          defaultMessage: '1. How much do you want to lend?',
          description: 'input label',
        })}
      />
      <MaturitySelect
        context={context}
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
