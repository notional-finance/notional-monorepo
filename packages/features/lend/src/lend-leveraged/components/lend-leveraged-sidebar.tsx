import { useCallback, useContext } from 'react';
import { defineMessage } from 'react-intl';
import { useCurrencyInputRef } from '@notional-finance/mui';
import {
  DepositInput,
  LeverageSlider,
  TransactionSidebar,
} from '@notional-finance/trade';
import { useHistory } from 'react-router-dom';
import { PRODUCTS } from '@notional-finance/util';
import { LendLeveragedContext } from '../../lend-leveraged/lend-leveraged';
import { LeveragedLendMaturitySelector } from './leveraged-lend-maturity-selector';

export const LendLeveragedSidebar = () => {
  const history = useHistory();
  const context = useContext(LendLeveragedContext);
  const {
    state: { selectedDepositToken, debt, deposit },
  } = context;
  const { currencyInputRef } = useCurrencyInputRef();

  const handleLeverUpToggle = useCallback(() => {
    // The two lending pages will pass a state object into this page to
    // remember where the toggle will go back to
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const state: any = history.location.state || {};

    // Use this if condition check because this toggle gets executed twice
    // on a second page load
    if (history.location.pathname.includes(PRODUCTS.LEND_LEVERAGED)) {
      history.push(
        `/${state['from'] || PRODUCTS.LEND_FIXED}/${selectedDepositToken}`
      );
    }
  }, [history, selectedDepositToken]);

  return (
    <TransactionSidebar
      showDrawer
      handleLeverUpToggle={handleLeverUpToggle}
      context={context}
      leveredUp
      enablePrimeBorrow={debt?.tokenType === 'PrimeDebt'}
    >
      <DepositInput
        ref={currencyInputRef}
        inputRef={currencyInputRef}
        context={context}
        newRoute={(newToken) => `/${PRODUCTS.LEND_LEVERAGED}/${newToken}`}
        inputLabel={defineMessage({
          defaultMessage: '1. Enter deposit amount',
          description: 'input label',
        })}
      />
      <LeveragedLendMaturitySelector context={context} />
      <LeverageSlider
        context={context}
        leverageCurrencyId={deposit?.currencyId}
        inputLabel={defineMessage({
          defaultMessage: '3. Specify your leverage',
          description: 'input label',
        })}
      />
    </TransactionSidebar>
  );
};

export default LendLeveragedSidebar;
