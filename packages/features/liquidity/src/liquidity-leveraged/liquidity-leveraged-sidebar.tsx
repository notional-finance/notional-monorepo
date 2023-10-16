import { useCallback, useContext } from 'react';
import {
  DepositInput,
  TransactionSidebar,
} from '@notional-finance/trade';
import { useHistory } from 'react-router-dom';
import { useCurrencyInputRef } from '@notional-finance/mui';
import { defineMessage } from 'react-intl';
import { LiquidityContext } from '../liquidity';
import { PRODUCTS } from '@notional-finance/util';
import { LiquidityTerms } from './components/liquidity-terms';

export const LiquidityLeveragedSidebar = () => {
  const history = useHistory();
  const context = useContext(LiquidityContext);
  const {
    state: { selectedDepositToken, debt },
  } = context;
  const { currencyInputRef } = useCurrencyInputRef();

  const handleLeverUpToggle = useCallback(() => {
    history.push(`/${PRODUCTS.LIQUIDITY_VARIABLE}/${selectedDepositToken}`);
  }, [history, selectedDepositToken]);

  return (
    <TransactionSidebar
      context={context}
      handleLeverUpToggle={handleLeverUpToggle}
      leveredUp
      enablePrimeBorrow={debt?.tokenType === 'PrimeDebt'}
    >
      <DepositInput
        ref={currencyInputRef}
        inputRef={currencyInputRef}
        context={context}
        newRoute={(newToken) => `/${PRODUCTS.LIQUIDITY_LEVERAGED}/${newToken}`}
        inputLabel={defineMessage({
          defaultMessage: '1. Enter deposit amount',
          description: 'input label',
        })}
      />
      <LiquidityTerms />
    </TransactionSidebar>
  );
};

export default LiquidityLeveragedSidebar;
