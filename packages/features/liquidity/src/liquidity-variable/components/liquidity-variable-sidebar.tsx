import { useCallback, useContext } from 'react';
import { DepositInput, TransactionSidebar } from '@notional-finance/trade';
import { useHistory } from 'react-router-dom';
import { useCurrencyInputRef } from '@notional-finance/mui';
import { defineMessage } from 'react-intl';
import { LiquidityContext } from '../liquidity-variable';

export const LiquidityVariableSidebar = () => {
  const history = useHistory();
  const {
    state: { selectedDepositToken },
  } = useContext(LiquidityContext);
  const { currencyInputRef } = useCurrencyInputRef();

  const handleLeverUpToggle = useCallback(() => {
    history.push(`/liquidity-leveraged/${selectedDepositToken}`);
  }, [history, selectedDepositToken]);

  return (
    <TransactionSidebar
      context={LiquidityContext}
      handleLeverUpToggle={handleLeverUpToggle}
    >
      <DepositInput
        ref={currencyInputRef}
        inputRef={currencyInputRef}
        context={LiquidityContext}
        newRoute={(newToken) => `/provide/${newToken}`}
        inputLabel={defineMessage({
          defaultMessage: '1. How much liquidity do you want to provide?',
          description: 'input label',
        })}
      />
    </TransactionSidebar>
  );
};

export default LiquidityVariableSidebar;
