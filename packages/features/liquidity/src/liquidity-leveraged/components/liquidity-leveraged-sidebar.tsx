import { useCallback, useContext } from 'react';
import {
  DepositInput,
  VariableFixedMaturityToggle,
  LeverageSlider,
  TransactionSidebar,
} from '@notional-finance/trade';
import { useHistory } from 'react-router-dom';
import { useCurrencyInputRef } from '@notional-finance/mui';
import { defineMessage } from 'react-intl';
import { LeveragedLiquidityContext } from '../liquidity-leveraged';
import { PRODUCTS } from '@notional-finance/shared-config';

export const LiquidityLeveragedSidebar = () => {
  const history = useHistory();
  const {
    state: { selectedDepositToken },
  } = useContext(LeveragedLiquidityContext);
  const { currencyInputRef } = useCurrencyInputRef();

  const handleLeverUpToggle = useCallback(() => {
    history.push(`/${PRODUCTS.LIQUIDITY_VARIABLE}/${selectedDepositToken}`);
  }, [history, selectedDepositToken]);

  return (
    <TransactionSidebar
      context={LeveragedLiquidityContext}
      handleLeverUpToggle={handleLeverUpToggle}
      leveredUp
    >
      <DepositInput
        ref={currencyInputRef}
        inputRef={currencyInputRef}
        context={LeveragedLiquidityContext}
        newRoute={(newToken) => `/${PRODUCTS.LIQUIDITY_LEVERAGED}/${newToken}`}
        inputLabel={defineMessage({
          defaultMessage: '1. Enter deposit amount',
          description: 'input label',
        })}
      />
      <VariableFixedMaturityToggle context={LeveragedLiquidityContext} />
      <LeverageSlider
        context={LeveragedLiquidityContext}
        inputLabel={defineMessage({
          defaultMessage: '3. Specify your leverage',
          description: 'input label',
        })}
      />
    </TransactionSidebar>
  );
};

export default LiquidityLeveragedSidebar;
