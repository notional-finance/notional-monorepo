import { useCurrencyInputRef } from '@notional-finance/mui';
import { TransactionSidebar, DepositInput } from '@notional-finance/trade';
import { PRODUCTS } from '@notional-finance/util';
import { useContext, useCallback } from 'react';
import { defineMessage } from 'react-intl';
import { useHistory } from 'react-router';
import {
  CustomLiquidityTerms,
  DefaultLiquidityTerms,
  ManageLiquidityTerms,
} from '../components/liquidity-terms';
import { LiquidityContext } from '../../liquidity';
import { useLeveragedNTokenPositions } from '../hooks/use-leveraged-ntoken-positions';
import { LiquidityDetailsTable } from '../components/liquidity-details-table';

export const CreateOrIncreasePosition = () => {
  const history = useHistory();
  const context = useContext(LiquidityContext);
  const {
    state: { selectedDepositToken, customizeLeverage },
  } = context;
  const { currencyInputRef } = useCurrencyInputRef();
  const { currentPosition, depositTokensWithPositions } =
    useLeveragedNTokenPositions(selectedDepositToken);

  const handleLeverUpToggle = useCallback(() => {
    history.push(`/${PRODUCTS.LIQUIDITY_VARIABLE}/${selectedDepositToken}`);
  }, [history, selectedDepositToken]);

  return (
    <TransactionSidebar
      context={context}
      handleLeverUpToggle={handleLeverUpToggle}
      leveredUp
      riskComponent={currentPosition ? <LiquidityDetailsTable /> : undefined}
    >
      <DepositInput
        ref={currencyInputRef}
        inputRef={currencyInputRef}
        context={context}
        newRoute={(newToken) => {
          return `/${PRODUCTS.LIQUIDITY_LEVERAGED}/${
            depositTokensWithPositions.includes(newToken || '')
              ? 'IncreaseLeveragedNToken'
              : 'CreateLeveragedNToken'
          }/${newToken}`;
        }}
        inputLabel={defineMessage({
          defaultMessage: '1. Enter deposit amount',
          description: 'input label',
        })}
      />
      {currentPosition ? (
        <ManageLiquidityTerms />
      ) : customizeLeverage ? (
        <CustomLiquidityTerms />
      ) : (
        <DefaultLiquidityTerms />
      )}
    </TransactionSidebar>
  );
};
