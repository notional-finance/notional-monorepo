import { useCurrencyInputRef } from '@notional-finance/mui';
import { TransactionSidebar, DepositInput } from '@notional-finance/trade';
import { PRODUCTS } from '@notional-finance/util';
import { useContext, useCallback } from 'react';
import { defineMessage } from 'react-intl';
import { useHistory } from 'react-router';
import { LiquidityTerms } from '../components/liquidity-terms';
import { LiquidityContext } from '../../liquidity';
import { useLeveragedNTokenPositions } from '../hooks/use-leveraged-ntoken-positions';

export const CreateOrIncreasePosition = () => {
  const history = useHistory();
  const context = useContext(LiquidityContext);
  const {
    state: { selectedDepositToken, debt },
  } = context;
  const { currencyInputRef } = useCurrencyInputRef();
  const { depositTokensWithPositions } = useLeveragedNTokenPositions();

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
        newRoute={(newToken) => {
          return `/${PRODUCTS.LIQUIDITY_LEVERAGED}/${newToken}/${
            depositTokensWithPositions.includes(newToken || '')
              ? 'IncreaseLeveragedNToken'
              : 'CreateLeveragedNToken'
          }`;
        }}
        inputLabel={defineMessage({
          defaultMessage: '1. Enter deposit amount',
          description: 'input label',
        })}
      />
      <LiquidityTerms />
    </TransactionSidebar>
  );
};
